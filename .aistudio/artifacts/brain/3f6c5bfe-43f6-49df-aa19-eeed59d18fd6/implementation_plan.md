# Kế Hoạch Tích Hợp Proxy IP Việt Nam Vào Ứng Dụng

Người dùng đã cung cấp proxy IP Việt Nam: `171.236.146.218:19046`. Kế hoạch triển khai nhằm mục đích định tuyến toàn bộ lưu lượng web của WebView qua proxy này, đồng thời cung cấp giao diện quản lý linh hoạt trong ứng dụng.

---

## 1. Cơ Chế Kỹ Thuật (AndroidX WebKit ProxyController)
- Thư viện `androidx.webkit:webkit:1.10.0` đã có sẵn trong project.
- Sử dụng `androidx.webkit.ProxyController.getInstance().setProxyOverride(...)` để định tuyến mạng của WebView qua máy chủ Proxy mà không cần quyền ROOT hoặc can thiệp VPN hệ thống.
- Hỗ trợ cả giao thức HTTP và SOCKS5 (ví dụ: `171.236.146.218:19046` hoặc `socks5://171.236.146.218:19046`).
- Tự động fallback xóa proxy nếu người dùng tắt công tắc proxy hoặc proxy mất kết nối.

---

## 2. Các Module Triển Khai

### A. Module Quản Lý Proxy (`ProxyManager.kt`)
- Lưu trạng thái Bật/Tắt và địa chỉ proxy vào `SharedPreferences` (Mặc định cấu hình sẵn IP: `171.236.146.218:19046`).
- Hàm `applyProxy(context, proxyUrl, onComplete)`: Khởi tạo `ProxyConfig.Builder().addProxyRule(proxyUrl).build()` và nạp vào `ProxyController`.
- Hàm `clearProxy(onComplete)`: Xóa bỏ cấu hình proxy khi tắt, đưa WebView về mạng trực tiếp.

### B. Cập Nhật Giao Diện Quick Menu (`dialog_quick_menu.xml`)
- Thêm mục **"🌐 CẤU HÌNH PROXY / IP VIỆT NAM"**:
  - **Công tắc bật/tắt (SwitchMaterial)**: Kích hoạt / Tắt proxy nhanh chóng.
  - **Ô nhập địa chỉ Proxy (EditText)**: Điền sẵn `171.236.146.218:19046`, cho phép thay đổi IP:Port khác nếu muốn.
  - **Nút "Áp Dụng & Tải Lại" (MaterialButton)**: Lưu cấu hình, áp dụng proxy và reload trang WebView.
  - **Badge trạng thái kết nối**: Hiển thị trạng thái "Đang dùng Proxy VN" hoặc "Mạng trực tiếp".

### C. Khởi Động Tự Động Trong `MainActivity.kt`
- Trong `onCreate()`, kiểm tra nếu người dùng đang bật Proxy thì tự động kích hoạt `ProxyManager.applyProxy()` trước khi tải URL `https://dola.com`.

---

## 3. Quy Trình Kiểm Thử
1. Build applet bằng `compile_applet` để đảm bảo tương thích mã nguồn.
2. Kiểm tra việc nạp proxy trên WebView và chuyển đổi trạng thái bật/tắt mượt mà.
