# mobiesee - Đường Thọ Dola Master APK

Ứng dụng Android Native (WebView Kotlin) tích hợp:
- **Seedance 2.5 Video Bypass Engine**: Ép tạo video 15s - 30s trực tiếp từ giao diện chat Dola AI.
- **Watermark-Free 1080P Decryptor**: Trích xuất luồng video gốc không logo từ hệ thống ByteDance (Parveen v7.5) và tải trực tiếp vào Thư viện ảnh Android.
- **Reference Image Popover (V3)**: Kho lưu trữ và chèn ảnh tham chiếu trực tiếp vào Dola.
- **Native Android Photo Picker**: Tích hợp chọn ảnh từ thư viện máy Android (tương thích Android 10, 11, 12, 13, 14+).

## Cấu trúc dự án
- `app/src/main/java/com/duongtho/doladownloader/MainActivity.kt`: Xử lý WebView, Android Download Manager, MediaScanner, FileChooser, và JavascriptInterface.
- `app/src/main/assets/dola_inject.js`: Bộ engine can thiệp tầng mạng (fetch, XHR, JSON.stringify, WebSocket), giải mã AES-CBC qAAB, giao diện nổi và kho ảnh tham chiếu.
- `app/src/main/res/`: Giao diện ứng dụng, layout, dialog thông tin tác giả, biểu tượng icon.
- `build.gradle.kts` & `settings.gradle.kts`: Cấu hình build Android Gradle.
