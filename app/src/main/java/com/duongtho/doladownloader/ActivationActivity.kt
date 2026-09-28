package com.duongtho.doladownloader

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton

class ActivationActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Đã kích hoạt rồi thì vào thẳng app
        if (License.isActivated(this)) {
            goToMain()
            return
        }

        setContentView(R.layout.activity_activation)

        val deviceId = License.getDeviceId(this)
        val tvDeviceId = findViewById<TextView>(R.id.tvDeviceId)
        val btnCopyDeviceId = findViewById<MaterialButton>(R.id.btnCopyDeviceId)
        val etLicenseKey = findViewById<EditText>(R.id.etLicenseKey)
        val btnActivate = findViewById<MaterialButton>(R.id.btnActivate)

        val tvToggleConfigPubKey = findViewById<TextView>(R.id.tvToggleConfigPubKey)
        val layoutPubKeyConfig = findViewById<LinearLayout>(R.id.layoutPubKeyConfig)
        val etPublicKey = findViewById<EditText>(R.id.etPublicKey)
        val btnSavePublicKey = findViewById<MaterialButton>(R.id.btnSavePublicKey)
        val tvStatusNotice = findViewById<TextView>(R.id.tvStatusNotice)

        tvDeviceId.text = deviceId

        btnCopyDeviceId.setOnClickListener {
            val cm = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            cm.setPrimaryClip(ClipData.newPlainText("device_id", deviceId))
            Toast.makeText(this, "Đã sao chép Device ID vào bộ nhớ tạm", Toast.LENGTH_SHORT).show()
        }

        // Cấu hình Public Key động nếu cần
        tvToggleConfigPubKey.setOnClickListener {
            if (layoutPubKeyConfig.visibility == View.VISIBLE) {
                layoutPubKeyConfig.visibility = View.GONE
            } else {
                layoutPubKeyConfig.visibility = View.VISIBLE
                val currentPk = License.getPublicKey(this)
                if (currentPk.isNotBlank() && !currentPk.contains("DÁN_PUBLIC_KEY")) {
                    etPublicKey.setText(currentPk)
                }
            }
        }

        btnSavePublicKey.setOnClickListener {
            val pkInput = etPublicKey.text.toString().trim()
            if (pkInput.isBlank()) {
                Toast.makeText(this, "Vui lòng nhập Public Key", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            License.setPublicKey(this, pkInput)
            Toast.makeText(this, "Đã lưu Public Key thành công", Toast.LENGTH_SHORT).show()
            updateNotice(tvStatusNotice)
        }

        btnActivate.setOnClickListener {
            val key = etLicenseKey.text.toString().trim()
            if (key.isBlank()) {
                Toast.makeText(this, "Vui lòng dán mã kích hoạt", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (!License.isPublicKeyConfigured(this)) {
                Toast.makeText(this, "Chưa thiết lập Public Key! Vui lòng cấu hình Public Key trước", Toast.LENGTH_LONG).show()
                layoutPubKeyConfig.visibility = View.VISIBLE
                return@setOnClickListener
            }

            if (License.activate(this, key)) {
                Toast.makeText(this, "🎉 Kích hoạt bản quyền thành công!", Toast.LENGTH_SHORT).show()
                goToMain()
            } else {
                Toast.makeText(this, "❌ Mã kích hoạt không hợp lệ cho thiết bị này!", Toast.LENGTH_LONG).show()
            }
        }

        updateNotice(tvStatusNotice)
    }

    private fun updateNotice(tv: TextView) {
        if (!License.isPublicKeyConfigured(this)) {
            tv.text = "⚠️ Chưa thiết lập Public Key RSA! Vui lòng dán Public Key trong cấu hình Admin bên trên hoặc trong code License.kt"
            tv.setTextColor(android.graphics.Color.parseColor("#f59e0b"))
        } else {
            tv.text = "Bản quyền gắn liền với phần cứng thiết bị • An toàn & Bảo mật"
            tv.setTextColor(android.graphics.Color.parseColor("#64748b"))
        }
    }

    private fun goToMain() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }
}
