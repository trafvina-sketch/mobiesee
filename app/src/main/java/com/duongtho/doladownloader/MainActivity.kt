package com.duongtho.doladownloader

import android.Manifest
import android.annotation.SuppressLint
import android.app.AlertDialog
import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.graphics.Color
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.util.Base64
import android.view.MotionEvent
import android.view.View
import android.webkit.*
import android.widget.*
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import com.google.android.material.button.MaterialButton
import com.google.android.material.switchmaterial.SwitchMaterial
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.provider.MediaStore
import android.provider.OpenableColumns
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var floatingBubble: FrameLayout
    private lateinit var tvBubbleBadge: TextView

    private lateinit var prefs: SharedPreferences
    private var injectJsCode: String = ""
    private var detectedCount: Int = 0
    private var isAutoScanEnabled: Boolean = true
    private var pendingSkillFile: Uri? = null // Auto-attach SKILL.md file

    // Kéo thả icon nổi (Drag & Drop)
    private var dX = 0f
    private var dY = 0f
    private var startClickTime = 0L

    // Bộ nhận thông báo tải xong để quét vào Thư viện (Gallery)
    private val downloadCompleteReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == DownloadManager.ACTION_DOWNLOAD_COMPLETE) {
                scanDownloadedFilesToGallery()
            }
        }
    }

    // 🖼️ Xử lý tải ảnh từ thư viện/tệp hệ thống cho HTML5 file input và tham chiếu
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val intentData = result.data
            val uris = when {
                intentData?.clipData != null -> {
                    val count = intentData.clipData!!.itemCount
                    Array(count) { i -> intentData.clipData!!.getItemAt(i).uri }
                }
                intentData?.data != null -> arrayOf(intentData.data!!)
                else -> null
            }
            fileUploadCallback?.onReceiveValue(uris)
        } else {
            fileUploadCallback?.onReceiveValue(null)
        }
        fileUploadCallback = null
    }

    private val nativeImagePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val intentData = result.data
            val uris = mutableListOf<Uri>()
            if (intentData?.clipData != null) {
                val count = intentData.clipData!!.itemCount
                for (i in 0 until count) {
                    uris.add(intentData.clipData!!.getItemAt(i).uri)
                }
            } else if (intentData?.data != null) {
                uris.add(intentData.data!!)
            }
            if (uris.isNotEmpty()) {
                processSelectedImagesToJs(uris)
            } else {
                Toast.makeText(this, "Chưa chọn ảnh nào", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun processSelectedImagesToJs(uris: List<Uri>) {
        Thread {
            try {
                val jsonArray = JSONArray()
                for (uri in uris) {
                    var fileName = "ref_${System.currentTimeMillis()}.jpg"
                    try {
                        contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                            if (cursor.moveToFirst()) {
                                val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                                if (nameIndex != -1) {
                                    val name = cursor.getString(nameIndex)
                                    if (!name.isNullOrEmpty()) fileName = name
                                }
                            }
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }

                    // Tối ưu hóa kích thước ảnh an toàn để tránh tràn bộ đệm Binder / evaluateJavascript
                    var bitmap: Bitmap? = null
                    try {
                        contentResolver.openInputStream(uri)?.use { inputStream ->
                            bitmap = BitmapFactory.decodeStream(inputStream)
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }

                    val base64: String
                    val mimeType: String
                    val byteSize: Int

                    if (bitmap != null) {
                        val maxDim = 1920
                        val width = bitmap!!.width
                        val height = bitmap!!.height
                        val scaledBitmap = if (width > maxDim || height > maxDim) {
                            val ratio = minOf(maxDim.toFloat() / width, maxDim.toFloat() / height)
                            val targetW = (width * ratio).toInt()
                            val targetH = (height * ratio).toInt()
                            Bitmap.createScaledBitmap(bitmap!!, targetW, targetH, true)
                        } else {
                            bitmap!!
                        }

                        val outputStream = ByteArrayOutputStream()
                        val isPng = fileName.endsWith(".png", true)
                        val format = if (isPng) Bitmap.CompressFormat.PNG else Bitmap.CompressFormat.JPEG
                        scaledBitmap.compress(format, 90, outputStream)
                        val bytes = outputStream.toByteArray()
                        byteSize = bytes.size
                        base64 = Base64.encodeToString(bytes, Base64.NO_WRAP)
                        mimeType = if (isPng) "image/png" else "image/jpeg"
                    } else {
                        val bytes = contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: continue
                        byteSize = bytes.size
                        base64 = Base64.encodeToString(bytes, Base64.NO_WRAP)
                        mimeType = contentResolver.getType(uri) ?: "image/jpeg"
                    }

                    val dataUrl = "data:$mimeType;base64,$base64"
                    val obj = JSONObject().apply {
                        put("id", "ref_" + System.currentTimeMillis() + "_" + (1000..9999).random())
                        put("name", fileName)
                        put("type", mimeType)
                        put("size", byteSize)
                        put("dataUrl", dataUrl)
                        put("addedAt", System.currentTimeMillis())
                    }
                    jsonArray.put(obj)
                }

                if (jsonArray.length() == 0) return@Thread

                val jsonString = jsonArray.toString()
                runOnUiThread {
                    val script = """
                        (function() {
                            try {
                                const imgs = $jsonString;
                                if (typeof window.__duongThoAddImagesFromNative === 'function') {
                                    window.__duongThoAddImagesFromNative(imgs);
                                } else if (typeof window.duongThoAttachReferenceImage === 'function' && imgs.length > 0) {
                                    window.duongThoAttachReferenceImage(imgs[0].dataUrl, imgs[0].name);
                                }
                            } catch(e) {
                                console.error('Error passing images to JS:', e);
                            }
                        })();
                    """.trimIndent()
                    webView.evaluateJavascript(script, null)
                    Toast.makeText(this@MainActivity, "Đã chọn ${jsonArray.length()} ảnh thành công!", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                e.printStackTrace()
                runOnUiThread {
                    Toast.makeText(this@MainActivity, "Lỗi đọc ảnh từ thiết bị: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }.start()
    }

    fun launchUniversalImagePicker() {
        try {
            val getContentIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "image/*"
                putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                addCategory(Intent.CATEGORY_OPENABLE)
                putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/jpeg", "image/png", "image/webp", "image/gif", "image/*"))
            }
            val pickIntent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI).apply {
                type = "image/*"
                putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            }
            val openDocIntent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                type = "image/*"
                putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                addCategory(Intent.CATEGORY_OPENABLE)
                putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/jpeg", "image/png", "image/webp", "image/gif", "image/*"))
            }

            val chooser = Intent.createChooser(getContentIntent, "Chọn ảnh từ máy (Thư viện / Tệp / Photos)").apply {
                putExtra(Intent.EXTRA_INITIAL_INTENTS, arrayOf(pickIntent, openDocIntent))
            }
            nativeImagePickerLauncher.launch(chooser)
        } catch (e: Exception) {
            e.printStackTrace()
            try {
                val fallback = Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "image/*"
                    putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                    addCategory(Intent.CATEGORY_OPENABLE)
                }
                nativeImagePickerLauncher.launch(fallback)
            } catch (ex: Exception) {
                Toast.makeText(this@MainActivity, "Không thể mở bộ chọn ảnh: ${ex.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Kiểm tra bản quyền kích hoạt thiết bị
        if (!License.isActivated(this)) {
            startActivity(Intent(this, ActivationActivity::class.java))
            finish()
            return
        }

        setContentView(R.layout.activity_main)

        prefs = getSharedPreferences("DuongThoDolaPrefs", Context.MODE_PRIVATE)
        isAutoScanEnabled = prefs.getBoolean("auto_scan_enabled", true)

        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)
        floatingBubble = findViewById(R.id.floatingBubble)
        tvBubbleBadge = findViewById(R.id.tvBubbleBadge)

        loadInjectScript()
        checkPermissions()
        setupWebView()
        setupDraggableBubble()
        val savedTheme = prefs.getString("extension_theme", "native") ?: "native"
        updateBubbleTheme(savedTheme)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })

        // Hiện thông tin tác giả một lần khi mới mở app lần đầu
        val isFirstLaunch = prefs.getBoolean("is_first_launch_v4", true)
        if (isFirstLaunch) {
            prefs.edit().putBoolean("is_first_launch_v4", false).apply()
            showAboutDialog()
        }

        webView.loadUrl("https://dola.com")
    }

    private fun loadInjectScript() {
        try {
            injectJsCode = assets.open("dola_inject.js").bufferedReader().use { it.readText() }
        } catch (e: Exception) {
            e.printStackTrace()
            injectJsCode = ""
        }
    }

    private fun checkPermissions() {
        val permissions = mutableListOf<String>()
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.WRITE_EXTERNAL_STORAGE)
            }
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.POST_NOTIFICATIONS)
            }
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_IMAGES) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.READ_MEDIA_IMAGES)
            }
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.READ_EXTERNAL_STORAGE)
            }
        }
        if (permissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, permissions.toTypedArray(), 1001)
        }
    }

    private val googleMobileUa = "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.200 Mobile Safari/537.36"

    private fun applyUiMode(mode: String) {
        val settings = webView.settings
        if (mode == "pc") {
            settings.userAgentString = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
            settings.useWideViewPort = true
            settings.loadWithOverviewMode = true
            settings.textZoom = 120
        } else {
            // Chuẩn Mobile Chrome sạch trên Pixel 8 Pro không chứa 'Version/4.0' hay '; wv'
            settings.userAgentString = googleMobileUa
            settings.useWideViewPort = false
            settings.loadWithOverviewMode = false
            settings.textZoom = 100
        }
    }

    private fun sanitizeWebViewCache() {
        try {
            // Đảm bảo các thư mục Code Cache của Chromium tồn tại để tránh lỗi simple_file_enumerator
            val wasmDir = File(cacheDir, "WebView/Default/HTTP Cache/Code Cache/wasm")
            if (!wasmDir.exists()) {
                wasmDir.mkdirs()
            }
            val jsDir = File(cacheDir, "WebView/Default/HTTP Cache/Code Cache/js")
            if (!jsDir.exists()) {
                jsDir.mkdirs()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        sanitizeWebViewCache()
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.setSupportZoom(true)
        settings.builtInZoomControls = true
        settings.displayZoomControls = false

        try {
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        } catch (_: Exception) {
            webView.setLayerType(View.LAYER_TYPE_SOFTWARE, null)
        }

        // 🛡️ CHẶN TOÀN BỘ HEADER 'X-Requested-With' ĐỂ GOOGLE OAUTH KHÔNG NHẬN DIỆN EMBEDDED WEBVIEW
        if (WebViewFeature.isFeatureSupported(WebViewFeature.REQUESTED_WITH_HEADER_ALLOW_LIST)) {
            try {
                WebSettingsCompat.setRequestedWithHeaderOriginAllowList(settings, emptySet())
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        // Áp dụng chế độ giao diện: Mặc định Mobile (chữ to, dễ chạm, lịch sử chat đầy đủ, đăng nhập mượt)
        val uiMode = prefs.getString("ui_mode", "mobile") ?: "mobile"
        applyUiMode(uiMode)

        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)

        val bridge = DuongThoBridge()
        webView.addJavascriptInterface(bridge, "AndroidDuongTho")
        webView.addJavascriptInterface(bridge, "DuongThoAndroid")

        // 🛡️ CHỐNG GOOGLE OAUTH CHẶN 403 (Disallowed User-Agent / Unsafe Browser):
        // CHỈ NẠP SCRIPT VÀO DOLA & DOUBAO - BẢO VỆ TUYỆT ĐỐI GOOGLE OAUTH KHÔNG BỊ TRUY VẾT TAMPERING
        if (injectJsCode.isNotEmpty() && WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            try {
                val allowedOrigins = setOf(
                    "https://dola.com",
                    "https://*.dola.com",
                    "https://doubao.com",
                    "https://*.doubao.com"
                )
                WebViewCompat.addDocumentStartJavaScript(webView, injectJsCode, allowedOrigins)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        fun applyGoogleSanitization(isGoogle: Boolean) {
            if (isGoogle) {
                try {
                    webView.removeJavascriptInterface("AndroidDuongTho")
                    webView.removeJavascriptInterface("DuongThoAndroid")
                } catch (e: Exception) {}
                settings.userAgentString = googleMobileUa
            } else {
                try {
                    webView.addJavascriptInterface(bridge, "AndroidDuongTho")
                    webView.addJavascriptInterface(bridge, "DuongThoAndroid")
                } catch (e: Exception) {}
                val currentMode = prefs.getString("ui_mode", "mobile") ?: "mobile"
                applyUiMode(currentMode)
            }
        }

        settings.setSupportMultipleWindows(false)
        settings.javaScriptCanOpenWindowsAutomatically = true

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: ""
                val isGoogle = url.contains("accounts.google") || url.contains("google.com/o/oauth2") || url.contains("google.com/signin") || url.contains("accounts.youtube")
                if (isGoogle) {
                    applyGoogleSanitization(true)
                    if (view != null && view.settings.userAgentString != googleMobileUa) {
                        view.settings.userAgentString = googleMobileUa
                        val headers = HashMap<String, String>()
                        headers["User-Agent"] = googleMobileUa
                        view.loadUrl(url, headers)
                        return true
                    }
                    return false
                } else if (url.contains("dola.com") || url.contains("doubao.com")) {
                    applyGoogleSanitization(false)
                    return false
                }
                return false
            }

            override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? {
                return super.shouldInterceptRequest(view, request)
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                super.onPageStarted(view, url, favicon)
                val targetUrl = url ?: ""
                val isGoogle = targetUrl.contains("accounts.google") || targetUrl.contains("google.com/o/oauth2") || targetUrl.contains("google.com/signin") || targetUrl.contains("accounts.youtube")
                applyGoogleSanitization(isGoogle)

                progressBar.visibility = View.VISIBLE
                if (injectJsCode.isNotEmpty() && !isGoogle && (targetUrl.contains("dola.com") || targetUrl.contains("doubao.com"))) {
                    view?.evaluateJavascript(injectJsCode, null)
                }
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE

                val targetUrl = url ?: ""
                val isGoogle = targetUrl.contains("accounts.google") || targetUrl.contains("google.com/o/oauth2") || targetUrl.contains("google.com/signin") || targetUrl.contains("accounts.youtube")
                if (injectJsCode.isNotEmpty() && !isGoogle && (targetUrl.contains("dola.com") || targetUrl.contains("doubao.com"))) {
                    view?.evaluateJavascript(injectJsCode, null)
                    val savedTheme = prefs.getString("extension_theme", "native") ?: "native"
                    view?.evaluateJavascript("window.setDolaExtensionTheme && window.setDolaExtensionTheme('$savedTheme');", null)
                }
                CookieManager.getInstance().flush()
            }

            override fun onLoadResource(view: WebView?, url: String?) {
                super.onLoadResource(view, url)
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onCreateWindow(view: WebView?, isDialog: Boolean, isUserGesture: Boolean, resultMsg: android.os.Message?): Boolean {
                // Điều hướng trực tiếp mọi popup/cửa sổ con vào WebView chính để không mất session đăng nhập
                val transport = resultMsg?.obj as? WebView.WebViewTransport
                transport?.webView = webView
                resultMsg?.sendToTarget()
                return true
            }

            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                progressBar.progress = newProgress
                if (newProgress >= 100) {
                    progressBar.visibility = View.GONE
                }
            }

            override fun onShowFileChooser(
                view: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback

                // ⚡ Auto-attach SKILL.md file nếu có pending từ nút Auto
                val skillUri = pendingSkillFile
                if (skillUri != null) {
                    pendingSkillFile = null
                    fileUploadCallback?.onReceiveValue(arrayOf(skillUri))
                    fileUploadCallback = null
                    return true
                }

                try {
                    val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                        type = "image/*"
                        putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                        addCategory(Intent.CATEGORY_OPENABLE)
                    }
                    if (intent.type.isNullOrEmpty() || intent.type == "*/*") {
                        intent.type = "image/*"
                    }
                    val pickIntent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI).apply {
                        type = "image/*"
                    }
                    val chooser = Intent.createChooser(intent, "Chọn ảnh từ điện thoại (Thư viện / Tệp / Photos)").apply {
                        putExtra(Intent.EXTRA_INITIAL_INTENTS, arrayOf(pickIntent))
                    }
                    fileChooserLauncher.launch(chooser)
                    return true
                } catch (e: Exception) {
                    try {
                        val fallback = Intent(Intent.ACTION_GET_CONTENT).apply {
                            type = "image/*"
                            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                            addCategory(Intent.CATEGORY_OPENABLE)
                        }
                        fileChooserLauncher.launch(Intent.createChooser(fallback, "Chọn ảnh"))
                        return true
                    } catch (ex: Exception) {
                        ex.printStackTrace()
                        fileUploadCallback?.onReceiveValue(null)
                        fileUploadCallback = null
                        return false
                    }
                }
            }
        }

        // Đăng ký nhận thông báo tải xong
        try {
            val filter = IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                registerReceiver(downloadCompleteReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
            } else {
                registerReceiver(downloadCompleteReceiver, filter)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun setupDraggableBubble() {
        floatingBubble.setOnTouchListener { view, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    dX = view.x - event.rawX
                    dY = view.y - event.rawY
                    startClickTime = System.currentTimeMillis()
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val newX = event.rawX + dX
                    val newY = event.rawY + dY
                    val parent = view.parent as View
                    val maxX = parent.width - view.width
                    val maxY = parent.height - view.height
                    view.x = newX.coerceIn(0f, maxX.toFloat())
                    view.y = newY.coerceIn(0f, maxY.toFloat())
                    true
                }
                MotionEvent.ACTION_UP -> {
                    val clickDuration = System.currentTimeMillis() - startClickTime
                    if (clickDuration < 200) {
                        // Kích hoạt quét làm mới lại video trước khi hiện menu
                        webView.evaluateJavascript("window.duongThoRefreshUI && window.duongThoRefreshUI();", null)
                        showQuickMenuDialog()
                    }
                    true
                }
                else -> false
            }
        }
    }

    private fun updateBubbleTheme(theme: String) {
        if (theme == "custom") {
            floatingBubble.setBackgroundResource(R.drawable.bg_bubble_custom)
        } else {
            floatingBubble.setBackgroundResource(R.drawable.bg_bubble_native)
        }
    }

    private fun showQuickMenuDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_quick_menu, null)
        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .create()

        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        val dialogCloseBtn = dialogView.findViewById<TextView>(R.id.dialogCloseBtn)
        val dialogVideoStatus = dialogView.findViewById<TextView>(R.id.dialogVideoStatus)
        val dialogBtnDownloadAll = dialogView.findViewById<MaterialButton>(R.id.dialogBtnDownloadAll)
        val dialogBtnReload = dialogView.findViewById<MaterialButton>(R.id.dialogBtnReload)
        val btnUiMobile = dialogView.findViewById<TextView>(R.id.btnUiMobile)
        val btnUiDesktop = dialogView.findViewById<TextView>(R.id.btnUiDesktop)
        val btnThemeNativeDola = dialogView.findViewById<TextView>(R.id.btnThemeNativeDola)
        val btnThemeCustomPro = dialogView.findViewById<TextView>(R.id.btnThemeCustomPro)

        var currentUiMode = prefs.getString("ui_mode", "mobile") ?: "mobile"
        fun updateUiModeButtons(mode: String) {
            currentUiMode = mode
            if (mode == "mobile") {
                btnUiMobile?.setBackgroundResource(R.drawable.btn_gradient)
                btnUiMobile?.setTextColor(Color.WHITE)
                btnUiDesktop?.setBackgroundColor(Color.parseColor("#1e293b"))
                btnUiDesktop?.setTextColor(Color.parseColor("#94a3b8"))
            } else {
                btnUiDesktop?.setBackgroundResource(R.drawable.btn_gradient)
                btnUiDesktop?.setTextColor(Color.WHITE)
                btnUiMobile?.setBackgroundColor(Color.parseColor("#1e293b"))
                btnUiMobile?.setTextColor(Color.parseColor("#94a3b8"))
            }
        }
        updateUiModeButtons(currentUiMode)

        var currentExtTheme = prefs.getString("extension_theme", "native") ?: "native"
        fun updateThemeButtons(theme: String) {
            currentExtTheme = theme
            if (theme == "native") {
                btnThemeNativeDola?.setBackgroundResource(R.drawable.btn_gradient)
                btnThemeNativeDola?.setTextColor(Color.WHITE)
                btnThemeCustomPro?.setBackgroundColor(Color.parseColor("#1e293b"))
                btnThemeCustomPro?.setTextColor(Color.parseColor("#94a3b8"))
            } else {
                btnThemeCustomPro?.setBackgroundResource(R.drawable.btn_gradient)
                btnThemeCustomPro?.setTextColor(Color.WHITE)
                btnThemeNativeDola?.setBackgroundColor(Color.parseColor("#1e293b"))
                btnThemeNativeDola?.setTextColor(Color.parseColor("#94a3b8"))
            }
        }
        updateThemeButtons(currentExtTheme)

        btnThemeNativeDola?.setOnClickListener {
            if (currentExtTheme != "native") {
                prefs.edit().putString("extension_theme", "native").apply()
                updateThemeButtons("native")
                updateBubbleTheme("native")
                webView.evaluateJavascript("window.setDolaExtensionTheme && window.setDolaExtensionTheme('native');", null)
                Toast.makeText(this, "🎨 Đã đổi sang giao diện Chuẩn Dola (Tối giản)", Toast.LENGTH_SHORT).show()
            }
        }

        btnThemeCustomPro?.setOnClickListener {
            if (currentExtTheme != "custom") {
                prefs.edit().putString("extension_theme", "custom").apply()
                updateThemeButtons("custom")
                updateBubbleTheme("custom")
                webView.evaluateJavascript("window.setDolaExtensionTheme && window.setDolaExtensionTheme('custom');", null)
                Toast.makeText(this, "💎 Đã đổi sang giao diện Tùy Biến Pro Studio", Toast.LENGTH_SHORT).show()
            }
        }

        btnUiMobile?.setOnClickListener {
            if (currentUiMode != "mobile") {
                prefs.edit().putString("ui_mode", "mobile").apply()
                updateUiModeButtons("mobile")
                applyUiMode("mobile")
                dialog.dismiss()
                webView.reload()
                Toast.makeText(this, "📱 Đã chuyển sang Giao diện Mobile (Đầy đủ Menu/Lịch sử)", Toast.LENGTH_SHORT).show()
            }
        }

        btnUiDesktop?.setOnClickListener {
            if (currentUiMode != "pc") {
                prefs.edit().putString("ui_mode", "pc").apply()
                updateUiModeButtons("pc")
                applyUiMode("pc")
                dialog.dismiss()
                webView.reload()
                Toast.makeText(this, "💻 Đã chuyển sang Giao diện Web PC", Toast.LENGTH_SHORT).show()
            }
        }

        val btnQuickUploadImage = dialogView.findViewById<MaterialButton>(R.id.btnQuickUploadImage)
        btnQuickUploadImage?.setOnClickListener {
            dialog.dismiss()
            launchUniversalImagePicker()
        }

        val btnQuickSkill30s = dialogView.findViewById<MaterialButton>(R.id.btnQuickSkill30s)
        btnQuickSkill30s?.setOnClickListener {
            dialog.dismiss()
            // Gắn file SKILL.md vào chat Dola (giống bypass ảnh)
            webView.evaluateJavascript("window.duongThoAttachSkillFile && window.duongThoAttachSkillFile('30s');", null)
            Toast.makeText(this, "⚡ Đang gắn file SKILL 30s...", Toast.LENGTH_SHORT).show()
        }

        val btnQuickSkill1015s = dialogView.findViewById<MaterialButton>(R.id.btnQuickSkill1015s)
        btnQuickSkill1015s?.setOnClickListener {
            dialog.dismiss()
            webView.evaluateJavascript("window.duongThoAttachSkillFile && window.duongThoAttachSkillFile('10-15s');", null)
            Toast.makeText(this, "⚡ Đang gắn file SKILL 10-15s...", Toast.LENGTH_SHORT).show()
        }

        val switchAutoScan = dialogView.findViewById<SwitchMaterial>(R.id.switchAutoScan)
        val etCreatePrompt = dialogView.findViewById<EditText>(R.id.etCreatePrompt)
        val btnDuration15 = dialogView.findViewById<TextView>(R.id.btnDuration15)
        val btnDuration20 = dialogView.findViewById<TextView>(R.id.btnDuration20)
        val btnDuration30 = dialogView.findViewById<TextView>(R.id.btnDuration30)
        val btnTriggerCreateVideo = dialogView.findViewById<MaterialButton>(R.id.btnTriggerCreateVideo)

        var selectedDuration = 15

        fun updateDurationUI(dur: Int) {
            selectedDuration = dur
            if (dur == 15) {
                btnDuration15.setBackgroundResource(R.drawable.btn_gradient)
                btnDuration15.setTextColor(Color.WHITE)
            } else {
                btnDuration15.setBackgroundColor(Color.parseColor("#1e293b"))
                btnDuration15.setTextColor(Color.parseColor("#94a3b8"))
            }

            if (dur == 20) {
                btnDuration20.setBackgroundResource(R.drawable.btn_gradient)
                btnDuration20.setTextColor(Color.WHITE)
            } else {
                btnDuration20.setBackgroundColor(Color.parseColor("#1e293b"))
                btnDuration20.setTextColor(Color.parseColor("#94a3b8"))
            }

            if (dur == 30) {
                btnDuration30.setBackgroundResource(R.drawable.btn_gradient)
                btnDuration30.setTextColor(Color.WHITE)
            } else {
                btnDuration30.setBackgroundColor(Color.parseColor("#1e293b"))
                btnDuration30.setTextColor(Color.parseColor("#94a3b8"))
            }
        }

        btnDuration15.setOnClickListener {
            updateDurationUI(15)
            webView.evaluateJavascript("window.duongThoSetDuration && window.duongThoSetDuration(15);", null)
        }
        btnDuration20.setOnClickListener {
            updateDurationUI(20)
            webView.evaluateJavascript("window.duongThoSetDuration && window.duongThoSetDuration(20);", null)
        }
        btnDuration30.setOnClickListener {
            updateDurationUI(30)
            webView.evaluateJavascript("window.duongThoSetDuration && window.duongThoSetDuration(30);", null)
        }

        // Bấm nút TẠO VIDEO (CREATE VIDEO)
        btnTriggerCreateVideo.setOnClickListener {
            val promptText = etCreatePrompt.text.toString().trim()
            if (promptText.isEmpty()) {
                Toast.makeText(this, "Vui lòng nhập nội dung prompt để tạo video!", Toast.LENGTH_SHORT).show()
            } else {
                dialog.dismiss()
                Toast.makeText(this, "🚀 Đang tự động tạo video ${selectedDuration}s...", Toast.LENGTH_SHORT).show()
                val escapedPrompt = org.json.JSONObject.quote(promptText)
                webView.evaluateJavascript("window.duongThoTriggerCreateVideo && window.duongThoTriggerCreateVideo($escapedPrompt, $selectedDuration, 'fast');", null)
            }
        }

        // Thiết lập công tắc quét ngầm
        switchAutoScan.isChecked = isAutoScanEnabled
        switchAutoScan.setOnCheckedChangeListener { _, isChecked ->
            isAutoScanEnabled = isChecked
            prefs.edit().putBoolean("auto_scan_enabled", isChecked).apply()
            webView.evaluateJavascript("window.duongThoSetScanEnabled && window.duongThoSetScanEnabled($isChecked);", null)
            Toast.makeText(this, if (isChecked) "Đã BẬT quét ngầm khi cuộn trang" else "Đã TẮT quét ngầm", Toast.LENGTH_SHORT).show()
        }

        dialogVideoStatus.text = "⚡ Sẵn sàng tải: $detectedCount video"
        dialogBtnDownloadAll.text = if (detectedCount > 0) "⚡ TẢI HÀNG LOẠT VÀO THƯ VIỆN ($detectedCount VIDEO)" else "⚡ TẢI HÀNG LOẠT VÀO THƯ VIỆN"
        dialogBtnDownloadAll.isEnabled = true

        val btnResetVideoCount = dialogView.findViewById<TextView>(R.id.btnResetVideoCount)
        btnResetVideoCount?.setOnClickListener {
            detectedCount = 0
            tvBubbleBadge.visibility = View.GONE
            dialogVideoStatus.text = "⚡ Sẵn sàng tải: 0 video"
            dialogBtnDownloadAll.text = "⚡ TẢI HÀNG LOẠT VÀO THƯ VIỆN"
            webView.evaluateJavascript("window.duongThoResetCurrentChatVideos && window.duongThoResetCurrentChatVideos();", null)
            Toast.makeText(this, "Đã đặt lại danh sách video của đoạn chat này!", Toast.LENGTH_SHORT).show()
        }

        dialogCloseBtn.setOnClickListener { dialog.dismiss() }

        // Bấm Tải hàng loạt
        dialogBtnDownloadAll.setOnClickListener {
            dialog.dismiss()
            Toast.makeText(this, "🚀 Đang bắt đầu tải video vào Thư viện...", Toast.LENGTH_SHORT).show()
            webView.evaluateJavascript("window.duongThoDownloadAll && window.duongThoDownloadAll();", null)
        }

        val dialogBtnRescan = dialogView.findViewById<MaterialButton>(R.id.dialogBtnRescan)
        dialogBtnRescan?.setOnClickListener {
            dialog.dismiss()
            Toast.makeText(this, "🔄 Đang quét lại toàn bộ video...", Toast.LENGTH_SHORT).show()
            webView.evaluateJavascript("window.duongThoForceRescan && window.duongThoForceRescan();", null)
        }

        dialogBtnReload.setOnClickListener {
            dialog.dismiss()
            webView.reload()
        }

        val dialogBtnAbout = dialogView.findViewById<MaterialButton>(R.id.dialogBtnAbout)
        dialogBtnAbout.setOnClickListener {
            dialog.dismiss()
            showAboutDialog()
        }

        dialog.show()
    }

    /**
     * Màn hình Giới thiệu, Cảnh báo & Thông tin Tác giả (Genpixo.com & Zalo)
     */
    private fun showAboutDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_about_author, null)
        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .create()

        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        val aboutCloseBtn = dialogView.findViewById<TextView>(R.id.aboutCloseBtn)
        val btnOpenWebsite = dialogView.findViewById<MaterialButton>(R.id.btnOpenWebsite)
        val btnOpenZalo = dialogView.findViewById<MaterialButton>(R.id.btnOpenZalo)

        aboutCloseBtn.setOnClickListener { dialog.dismiss() }

        btnOpenWebsite.setOnClickListener {
            try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://genpixo.com"))
                startActivity(intent)
            } catch (e: Exception) {
                Toast.makeText(this, "Không thể mở trình duyệt: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }

        btnOpenZalo.setOnClickListener {
            try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://zalo.me/0934415387"))
                startActivity(intent)
            } catch (e: Exception) {
                Toast.makeText(this, "Không thể mở Zalo: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }

        dialog.show()
    }

    /**
     * Quét các video đã tải để xuất hiện ngay lập tức trong ứng dụng Thư viện / Bộ sưu tập
     */
    private fun scanDownloadedFilesToGallery() {
        try {
            val dir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES), "Đường_Thọ_Videos")
            if (dir.exists() && dir.isDirectory) {
                val files = dir.listFiles { file -> file.extension.equals("mp4", ignoreCase = true) }
                if (files != null && files.isNotEmpty()) {
                    val paths = files.map { it.absolutePath }.toTypedArray()
                    val mimeTypes = Array(paths.size) { "video/mp4" }
                    MediaScannerConnection.scanFile(this, paths, mimeTypes) { _, _ -> }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // ⚡ Helper: Đọc file SKILL.md → base64 → JS tạo File → gửi vào Dola
    private fun continueAttachSkill(skillFile: File, displayName: String) {
        Thread {
            try {
                val content = skillFile.readText()
                val base64Content = android.util.Base64.encodeToString(content.toByteArray(Charsets.UTF_8), android.util.Base64.NO_WRAP)

                // Set pendingSkillFile phòng khi Chiến lược 3 trigger onShowFileChooser
                try {
                    val skillUri = androidx.core.content.FileProvider.getUriForFile(
                        this, "$packageName.fileprovider", skillFile
                    )
                    pendingSkillFile = skillUri
                } catch (_: Exception) {}

                runOnUiThread {
                    val escapedName = displayName.replace("'", "\\'")
                    val js = """
                        (async function() {
                            try {
                                var b64 = '$base64Content';
                                var raw = atob(b64);
                                var bytes = new Uint8Array(raw.length);
                                for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
                                var blob = new Blob([bytes], { type: 'text/markdown' });
                                var file = new File([blob], '$escapedName', { type: 'text/markdown', lastModified: Date.now() });
                                console.log('[DT-Skill] ⚡ Chuẩn bị đính kèm file:', file.name, file.size, 'bytes');

                                var dt = new DataTransfer();
                                dt.items.add(file);

                                // ===== CHIẾN LƯỢC 1: KÉO THẢ CHUỘT (DRAG & DROP SIMULATION) =====
                                // Tìm các vùng nhận tệp trong chat (ProseMirror, Tiptap, contenteditable, drop-zone)
                                var dropTargets = [
                                    document.querySelector('.tiptap'),
                                    document.querySelector('.ProseMirror'),
                                    document.querySelector('[contenteditable="true"]'),
                                    document.querySelector('[contenteditable]'),
                                    document.querySelector('#input-engine-container'),
                                    document.querySelector('[data-testid="chat_input"]'),
                                    document.querySelector('[data-testid*="input"]'),
                                    document.querySelector('[class*="drop-zone"]'),
                                    document.querySelector('[class*="dropzone"]'),
                                    document.querySelector('[class*="input-content-container"]'),
                                    document.querySelector('[class*="composer"]'),
                                    document.querySelector('main'),
                                    document.body
                                ].filter(Boolean);

                                function fireDragDrop(target) {
                                    ['dragenter', 'dragover', 'drop'].forEach(function(type) {
                                        var evt;
                                        try {
                                            evt = new DragEvent(type, {
                                                bubbles: true,
                                                cancelable: true,
                                                composed: true,
                                                dataTransfer: dt
                                            });
                                        } catch(e) {
                                            evt = document.createEvent('CustomEvent');
                                            evt.initCustomEvent(type, true, true, null);
                                        }
                                        try {
                                            Object.defineProperty(evt, 'dataTransfer', { value: dt, writable: false });
                                        } catch(_) {}
                                        target.dispatchEvent(evt);
                                    });
                                }

                                for (var i = 0; i < dropTargets.length; i++) {
                                    try { fireDragDrop(dropTargets[i]); } catch(e) {}
                                }
                                console.log('[DT-Skill] Đã bắn sự kiện Drag & Drop vào', dropTargets.length, 'vùng nhận');

                                // ===== CHIẾN LƯỢC 2: PASTE EVENT (DÁN FILE VÀO TRÌNH SOẠN THẢO) =====
                                var editors = document.querySelectorAll('.ProseMirror, .tiptap, [contenteditable="true"], [role="textbox"], textarea');
                                for (var eIdx = 0; eIdx < editors.length; eIdx++) {
                                    try {
                                        var ed = editors[eIdx];
                                        ed.focus();
                                        var pEvt;
                                        try {
                                            pEvt = new ClipboardEvent('paste', { bubbles: true, cancelable: true, composed: true, clipboardData: dt });
                                        } catch(e) {
                                            pEvt = document.createEvent('Event');
                                            pEvt.initEvent('paste', true, true);
                                        }
                                        try {
                                            Object.defineProperty(pEvt, 'clipboardData', { value: dt, writable: false });
                                        } catch(_) {}
                                        ed.dispatchEvent(pEvt);
                                    } catch(pe) {}
                                }

                                // ===== CHIẾN LƯỢC 3: NHÚNG TRỰC TIẾP VÀO CÁC INPUT FILE SẴN CÓ =====
                                var fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
                                for (var fIdx = 0; fIdx < fileInputs.length; fIdx++) {
                                    try {
                                        var fi = fileInputs[fIdx];
                                        var desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'files');
                                        if (desc && desc.set) desc.set.call(fi, dt.files);
                                        else fi.files = dt.files;
                                        fi.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                                        fi.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
                                        console.log('[DT-Skill] Đã gán files vào input[type=file]');
                                    } catch(fe) {}
                                }

                                // Đợi 300ms xem giao diện Dola đã nhận tệp chưa
                                await new Promise(function(r) { setTimeout(r, 300); });

                                // Kiểm tra xem pill đính kèm đã xuất hiện trong composer chưa
                                var hasAttachment = Boolean(document.querySelector('[class*="attachment"], [class*="file-item"], [class*="upload-item"], [class*="tag-file"]'));
                                if (hasAttachment) {
                                    console.log('[DT-Skill] ✅ Tệp đã xuất hiện trên giao diện Dola!');
                                    if (window.__showChannaNotice) window.__showChannaNotice('⚡ Đã kéo thả tệp $escapedName vào chat!', 3500);
                                    return 'attached_via_drop';
                                }

                                // ===== CHIẾN LƯỢC 4: KÍCH HOẠT NÚT ĐÍNH KÈM / UPLOAD CỦA DOLA =====
                                // Tìm nút upload của Dola thông qua data-testid hoặc icon kẹp ghim / cộng / upload
                                var uploadBtn = document.querySelector('[data-testid="upload_file_button"]');
                                var clickTarget = null;
                                if (uploadBtn) {
                                    clickTarget = uploadBtn.closest('button, [role="button"]') || uploadBtn.parentElement || uploadBtn;
                                }

                                if (!clickTarget) {
                                    // Tìm nút xung quanh thanh công cụ soạn thảo
                                    var composer = document.querySelector('#input-engine-container') || document.querySelector('form') || document.body;
                                    var allBtns = Array.from(composer.querySelectorAll('button, [role="button"]'));
                                    clickTarget = allBtns.find(function(b) {
                                        var aria = (b.getAttribute('aria-label') || '').toLowerCase();
                                        var title = (b.getAttribute('title') || '').toLowerCase();
                                        var txt = (b.textContent || '').trim();
                                        return aria.includes('upload') || aria.includes('attach') || aria.includes('tải') || aria.includes('đính kèm') ||
                                               title.includes('upload') || title.includes('attach') || txt === '+' || b.querySelector('svg');
                                    });
                                }

                                if (clickTarget) {
                                    console.log('[DT-Skill] Kích hoạt nút upload của Dola:', clickTarget);
                                    clickTarget.click();
                                    await new Promise(function(r) { setTimeout(r, 250); });

                                    // Nếu hiện menu popup, click vào tùy chọn tải tệp
                                    var menuItems = Array.from(document.querySelectorAll('[role="menuitem"], [class*="menu-item"], div, span'));
                                    var uploadOption = menuItems.find(function(item) {
                                        var t = (item.textContent || '').trim().toLowerCase();
                                        return item.children.length <= 2 && (/tải (tập tin|tệp|file|lên)|upload\s*(file|document)?|tài liệu|tệp tin/.test(t));
                                    });

                                    if (uploadOption) {
                                        console.log('[DT-Skill] Bấm chọn menu item:', uploadOption.textContent);
                                        uploadOption.click();
                                    }
                                }

                                if (window.__showChannaNotice) {
                                    window.__showChannaNotice('⚡ Đã tải tệp $escapedName lên chat!', 3500);
                                }
                                return 'pipeline_completed';
                            } catch(e) {
                                console.error('[DT-Skill] Lỗi:', e);
                                return 'error:' + e.message;
                            }
                        })();
                    """.trimIndent()
                    webView.evaluateJavascript(js) { result ->
                        android.util.Log.d("DuongTho", "Skill result: $result for $displayName")
                    }
                    Toast.makeText(this, "⚡ Đang tải $displayName lên chat...", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                e.printStackTrace()
                runOnUiThread {
                    pendingSkillFile = null
                    Toast.makeText(this, "⚠️ Lỗi: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }.start()
    }

    inner class DuongThoBridge {

        @JavascriptInterface
        fun updateVideoCount(count: Int) {
            runOnUiThread {
                detectedCount = count
                if (count > 0) {
                    tvBubbleBadge.visibility = View.VISIBLE
                    tvBubbleBadge.text = if (count > 99) "99+" else count.toString()
                } else {
                    tvBubbleBadge.visibility = View.GONE
                }
            }
        }

        @JavascriptInterface
        fun resolveFallbackInNative(fallbackUrl: String, keySeed: String, prompt: String, poster: String, vid: String) {
            Thread {
                try {
                    val uri = Uri.parse(fallbackUrl)
                    val builder = uri.buildUpon().clearQuery()
                    for (paramName in uri.queryParameterNames) {
                        if (paramName != "channel" && paramName != "codec_type" && paramName != "logo_type") {
                            for (value in uri.getQueryParameters(paramName)) {
                                builder.appendQueryParameter(paramName, value)
                            }
                        }
                    }
                    builder.appendQueryParameter("channel", "no")
                    builder.appendQueryParameter("codec_type", "8")
                    builder.appendQueryParameter("logo_type", "unwatermarked")
                    val u = builder.build().toString()

                    val urlObj = java.net.URL(u)
                    val conn = urlObj.openConnection() as java.net.HttpURLConnection
                    conn.requestMethod = "GET"
                    conn.connectTimeout = 15000
                    conn.readTimeout = 15000
                    conn.setRequestProperty("Accept", "application/json,text/plain,*/*")
                    conn.setRequestProperty("User-Agent", webView.settings.userAgentString)

                    conn.connect()
                    val code = conn.responseCode
                    if (code in 200..299) {
                        val responseText = conn.inputStream.bufferedReader().use { it.readText() }
                        runOnUiThread {
                            val escJson = org.json.JSONObject.quote(responseText)
                            val escSeed = org.json.JSONObject.quote(keySeed)
                            val escPrompt = org.json.JSONObject.quote(prompt)
                            val escPoster = org.json.JSONObject.quote(poster)
                            val escVid = org.json.JSONObject.quote(vid)
                            val jsCall = "window.duongThoOnFallbackNativeSuccess && window.duongThoOnFallbackNativeSuccess($escJson, $escSeed, $escPrompt, $escPoster, $escVid);"
                            webView.evaluateJavascript(jsCall, null)
                        }
                    } else {
                        android.util.Log.e("DuongTho", "Fallback API HTTP error $code for $u")
                    }
                    conn.disconnect()
                } catch (e: Exception) {
                    e.printStackTrace()
                    android.util.Log.e("DuongTho", "Fallback native error: ${e.message}")
                }
            }.start()
        }

        @JavascriptInterface
        fun downloadVideo(url: String, prompt: String) {
            runOnUiThread {
                startDownload(url, prompt)
            }
        }

        @JavascriptInterface
        fun onThemeChanged(theme: String) {
            runOnUiThread {
                prefs.edit().putString("extension_theme", theme).apply()
                updateBubbleTheme(theme)
                val themeName = if (theme == "custom") "Tùy Biến Pro Studio" else "Chuẩn Dola"
                Toast.makeText(this@MainActivity, "🎨 Đã đổi giao diện: $themeName", Toast.LENGTH_SHORT).show()
            }
        }

        @JavascriptInterface
        fun getSavedTheme(): String {
            return prefs.getString("extension_theme", "native") ?: "native"
        }

        @JavascriptInterface
        fun attachSkillFile(type: String) {
            runOnUiThread {
                try {
                    // Xác định tên file SKILL.md
                    val assetName = if (type == "30s") "DuongTho-30s-SKILL.md" else "DuongTho-10s-15s-SKILL.md"
                    val sourceAsset = if (type == "30s") "skill_30s.md" else "skill_10_15s.md"

                    // Lưu SKILL.md content từ JS vào cache file
                    val cacheDir = File(cacheDir, "skills")
                    cacheDir.mkdirs()
                    val skillFile = File(cacheDir, assetName)

                    // Đọc nội dung từ assets
                    try {
                        val inputStream = assets.open(sourceAsset)
                        val content = inputStream.bufferedReader().use { it.readText() }
                        inputStream.close()
                        skillFile.writeText(content)
                    } catch (e: Exception) {
                        // Nếu không có file asset, tạo từ JS constant
                        val jsGetContent = if (type == "30s") {
                            "typeof SKILL_30S_DIRECTIVE !== 'undefined' ? SKILL_30S_DIRECTIVE : ''"
                        } else {
                            "typeof SKILL_10_15S_DIRECTIVE !== 'undefined' ? SKILL_10_15S_DIRECTIVE : ''"
                        }
                        webView.evaluateJavascript(jsGetContent) { result ->
                            val content = result?.trim('"')?.replace("\\n", "\n")?.replace("\\\"", "\"") ?: ""
                            if (content.isNotEmpty()) {
                                skillFile.writeText(content)
                                continueAttachSkill(skillFile, assetName)
                            } else {
                                Toast.makeText(this@MainActivity, "⚠️ Không tìm thấy nội dung SKILL", Toast.LENGTH_SHORT).show()
                            }
                        }
                        return@runOnUiThread
                    }

                    continueAttachSkill(skillFile, assetName)
                } catch (e: Exception) {
                    e.printStackTrace()
                    Toast.makeText(this@MainActivity, "⚠️ Lỗi: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        @JavascriptInterface
        fun openNativeImagePicker() {
            runOnUiThread {
                launchUniversalImagePicker()
            }
        }

        /**
         * Lưu video từ dữ liệu Base64 (Xử lý khi video là blob: URL hoặc stream trong trang)
         */
        @JavascriptInterface
        fun saveBase64Video(base64Data: String, prompt: String) {
            Thread {
                try {
                    val rawBase64 = if (base64Data.contains(",")) {
                        base64Data.substringAfter(",")
                    } else {
                        base64Data
                    }
                    val videoBytes = Base64.decode(rawBase64, Base64.DEFAULT)

                    val now = Date()
                    val dateFormat = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault())
                    val timeFormat = SimpleDateFormat("HH'h'mm", Locale.getDefault())
                    val dateStr = dateFormat.format(now)
                    val timeStr = timeFormat.format(now)

                    var cleanPrompt = prompt.replace(Regex("[^a-zA-Z0-9_\\-\\s]"), "").trim()
                    if (cleanPrompt.length > 35) cleanPrompt = cleanPrompt.substring(0, 35).trim()
                    if (cleanPrompt.isEmpty()) cleanPrompt = "Video"

                    val filename = "Đường Thọ_${dateStr}_${timeStr}_${cleanPrompt}.mp4"
                    val dir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES), "Đường_Thọ_Videos")
                    if (!dir.exists()) dir.mkdirs()

                    val targetFile = File(dir, filename)
                    FileOutputStream(targetFile).use { it.write(videoBytes) }

                    // Quét ngay vào Thư viện (Gallery)
                    MediaScannerConnection.scanFile(this@MainActivity, arrayOf(targetFile.absolutePath), arrayOf("video/mp4")) { _, _ -> }

                    runOnUiThread {
                        Toast.makeText(this@MainActivity, "✅ Đã lưu vào Thư viện: $filename", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                    runOnUiThread {
                        Toast.makeText(this@MainActivity, "Lỗi lưu video: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }.start()
        }
    }

    private fun startDownload(url: String, prompt: String) {
        try {
            val now = Date()
            val dateFormat = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault())
            val timeFormat = SimpleDateFormat("HH'h'mm", Locale.getDefault())
            val dateStr = dateFormat.format(now)
            val timeStr = timeFormat.format(now)

            var cleanPrompt = prompt.replace(Regex("[^a-zA-Z0-9_\\-\\s]"), "").trim()
            if (cleanPrompt.length > 35) {
                cleanPrompt = cleanPrompt.substring(0, 35).trim()
            }
            if (cleanPrompt.isEmpty()) {
                cleanPrompt = "Video"
            }

            val filename = "Đường Thọ_${dateStr}_${timeStr}_${cleanPrompt}.mp4"
            val downloadUri = Uri.parse(url)

            val request = DownloadManager.Request(downloadUri)
            request.setTitle(filename)
            request.setDescription("Đang lưu vào Thư viện video 1080P...")
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)

            val cookies = CookieManager.getInstance().getCookie(url)
            if (cookies != null) {
                request.addRequestHeader("Cookie", cookies)
            }
            request.addRequestHeader("User-Agent", webView.settings.userAgentString)

            // Lưu trực tiếp vào thư mục Movies/Đường_Thọ_Videos (Thư viện media hệ thống)
            request.setDestinationInExternalPublicDir(
                Environment.DIRECTORY_MOVIES,
                "Đường_Thọ_Videos" + File.separator + filename
            )

            val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            dm.enqueue(request)

            Toast.makeText(this, "⬇️ Bắt đầu tải vào Thư viện: $filename", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Lỗi tải video: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    override fun onStop() {
        super.onStop()
        CookieManager.getInstance().flush()
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            unregisterReceiver(downloadCompleteReceiver)
        } catch (e: Exception) {}
        CookieManager.getInstance().flush()
    }
}
