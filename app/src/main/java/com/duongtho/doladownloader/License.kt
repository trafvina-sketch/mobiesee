package com.duongtho.doladownloader

import android.content.Context
import android.provider.Settings
import android.util.Base64
import java.security.KeyFactory
import java.security.Signature
import java.security.spec.X509EncodedKeySpec

object License {
    // 🔑 Dán chuỗi PUBLIC_KEY_B64 in ra từ script Python/Server vào đây:
    private const val PUBLIC_KEY_B64 =
        "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3AAz7JhE9wDwTjRLYcQVPg8+owb4dGvnMDcnsXFMLZsmE9PCmzh4bruFNyv5e6A7fmhictdGSTRh7po90O6rrqkiUIhoj5mI92x+sHM+cIG4F5eho2cUUXhOf0sBi3uejynl8XHrU9zJj11kw4BH4VHKKPd0kAAB/z9elFSg12lnNjbMXErPwhpaHZq87JM9/gA/ARBsELKQSYBcRQOdRqbeFoWyN9m/rJheyWRv7F78f6rRVzJFefx5cHrRRfLmhO2AS2tUaJMvlO0nalOI2/sRxFvs6sOugfMUqC7dhzClK41k7I1iO4zyfjy53g7krHMN0tDgSAQTJL6YAtLx8wIDAQAB"

    private const val PREFS = "license_prefs"
    private const val KEY_SAVED = "activation_key"
    private const val KEY_CUSTOM_PUBKEY = "custom_public_key"

    /** Lấy Public Key hiện hành (từ bộ nhớ cấu hình hoặc biến mặc định) */
    fun getPublicKey(ctx: Context): String {
        val custom = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getString(KEY_CUSTOM_PUBKEY, null)
        if (!custom.isNullOrBlank()) return custom.trim()
        return PUBLIC_KEY_B64.trim()
    }

    /** Cho phép lưu Public Key động từ giao diện quản trị */
    fun setPublicKey(ctx: Context, pubKey: String) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit().putString(KEY_CUSTOM_PUBKEY, pubKey.trim()).apply()
    }

    /** Kiểm tra xem Public Key đã được cấu hình hay chưa */
    fun isPublicKeyConfigured(ctx: Context): Boolean {
        val pk = getPublicKey(ctx)
        return pk.isNotBlank() && !pk.contains("DÁN_PUBLIC_KEY")
    }

    /** Lấy Device ID duy nhất của thiết bị Android */
    fun getDeviceId(ctx: Context): String =
        Settings.Secure.getString(ctx.contentResolver, Settings.Secure.ANDROID_ID) ?: "unknown"

    /** Xác thực chữ ký RSA SHA256withRSA */
    private fun verify(ctx: Context, deviceId: String, key: String): Boolean = try {
        val pubKeyStr = getPublicKey(ctx)
        if (pubKeyStr.isBlank() || pubKeyStr.contains("DÁN_PUBLIC_KEY")) {
            false
        } else {
            val pubBytes = Base64.decode(pubKeyStr, Base64.DEFAULT)
            val pub = KeyFactory.getInstance("RSA").generatePublic(
                X509EncodedKeySpec(pubBytes)
            )
            val cleanKey = key.trim()
            val sig = Signature.getInstance("SHA256withRSA")

            // Thử giải mã URL_SAFE trước, nếu không được thì giải mã DEFAULT
            val sigBytes = try {
                Base64.decode(cleanKey, Base64.URL_SAFE)
            } catch (_: Exception) {
                Base64.decode(cleanKey, Base64.DEFAULT)
            }

            sig.initVerify(pub)
            sig.update(deviceId.toByteArray(Charsets.UTF_8))
            val verified = sig.verify(sigBytes)
            if (verified) {
                true
            } else {
                // Thử lại lần nữa với Base64.DEFAULT phòng trường hợp padding khác nhau
                val sigDefault = Base64.decode(cleanKey, Base64.DEFAULT)
                sig.initVerify(pub)
                sig.update(deviceId.toByteArray(Charsets.UTF_8))
                sig.verify(sigDefault)
            }
        }
    } catch (e: Exception) {
        e.printStackTrace()
        false
    }

    /** Gọi khi người dùng bấm "Kích hoạt". Đúng thì lưu key lại. */
    fun activate(ctx: Context, key: String): Boolean {
        if (!verify(ctx, getDeviceId(ctx), key)) return false
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit().putString(KEY_SAVED, key.trim()).apply()
        return true
    }

    /** Kiểm tra lại key đã lưu mỗi lần mở app. */
    fun isActivated(ctx: Context): Boolean {
        val saved = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getString(KEY_SAVED, null) ?: return false
        return verify(ctx, getDeviceId(ctx), saved)
    }

    /** Xóa bản quyền đã kích hoạt */
    fun deactivate(ctx: Context) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit().remove(KEY_SAVED).apply()
    }
}
