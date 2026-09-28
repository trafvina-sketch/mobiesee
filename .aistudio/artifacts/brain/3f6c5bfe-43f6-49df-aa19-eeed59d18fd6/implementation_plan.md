# Kế hoạch Tích Hợp Kích Hoạt Bản Quyền (RSA License Verification)

## 1. Mục tiêu
Tích hợp hệ sinh thái bản quyền thiết bị thông qua chữ ký số **RSA (SHA256withRSA)**:
- Mỗi thiết bị có một `Device ID` (`Settings.Secure.ANDROID_ID`) duy nhất.
- Khóa kích hoạt (Activation Key) được ký bởi **Private Key** (từ công cụ cấp key của bạn) và được kiểm tra bởi **Public Key** lưu trong app.
- Khi chưa kích hoạt, ứng dụng sẽ chuyển hướng ngay đến màn hình **ActivationActivity** riêng biệt.
- Khi kích hoạt thành công, key được lưu vào `SharedPreferences` và tự động vào thẳng ứng dụng ở các lần mở tiếp theo.

---

## 2. Chi tiết triển khai

### Bước 1: Tạo Module `License.kt`
- **Vị trí**: `app/src/main/java/com/duongtho/doladownloader/License.kt`
- **Chức năng**:
  - `getDeviceId(context)`: Lấy mã phần cứng Android ID.
  - `verify(deviceId, key)`: Giải mã và kiểm tra chữ ký RSA SHA256withRSA.
  - `activate(context, key)`: Xác thực và lưu trữ key khi hợp lệ.
  - `isActivated(context)`: Kiểm tra trạng thái bản quyền mỗi khi ứng dụng khởi động.
  - Cung cấp hằng số `PUBLIC_KEY_B64` với cấu trúc chuẩn để dễ dàng thay thế Public Key RSA của bạn.

### Bước 2: Xây dựng màn hình `ActivationActivity.kt`
- **Vị trí**: `app/src/main/java/com/duongtho/doladownloader/ActivationActivity.kt`
- **Giao diện hiện đại (Dark & Neon Theme)**:
  - Header với biểu tượng chú cún công nghệ Dola Puppy.
  - Hộp hiển thị **Device ID** nổi bật, kèm nút **Sao chép ID** (1 chạm có Toast thông báo).
  - Ô nhập/dán **Mã kích hoạt** (hỗ trợ nút Dán nhanh từ Clipboard).
  - Nút bấm **Kích hoạt ngay** với hiệu ứng gradient nổi bật, kiểm tra tức thì.
  - Thông báo lỗi trực quan nếu key không khớp hoặc sai cú pháp.

### Bước 3: Bảo vệ luồng khởi động (`MainActivity.kt` & `AndroidManifest.xml`)
- Khai báo `ActivationActivity` trong `AndroidManifest.xml`.
- Trong `MainActivity.onCreate()`: Kiểm tra `License.isActivated(this)`:
  - Nếu **chưa kích hoạt**: Mở `ActivationActivity`, đóng `MainActivity`.
  - Nếu **đã kích hoạt**: Tiếp tục tải giao diện chính và extension Dola bình thường.
- Tại menu cài đặt hoặc góc thông tin app: Có thể thêm nút xem thông tin bản quyền và Device ID để hỗ trợ khách hàng nhanh chóng.

### Bước 4: Kiểm thử và hoàn thiện
- Biên dịch ứng dụng (`compile_applet` & `gradle :app:assembleDebug`).
- Kiểm tra tính toàn vẹn cú pháp và luồng chuyển màn hình.
