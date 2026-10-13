# EnglishMaster - Hệ Thống Học Tiếng Anh Fullstack (Node.js + MongoDB + Google Sign-In)

Hệ thống học tiếng Anh hoàn chỉnh Fullstack với giao diện người dùng hiện đại, trang quản trị Admin Panel toàn diện, cơ sở dữ liệu MongoDB, xác thực tài khoản Google OAuth, quản lý người dùng và tính năng đăng tải ảnh.

---

## 🚀 Các Tính Năng Fullstack Đã Hoàn Thành

### 1. Xác Thực Tài Khoản & Đăng Nhập Google (Google OAuth & JWT)
- **Đăng nhập Google**: Tích hợp Google Identity Services (GIS), hỗ trợ đăng nhập 1-click với tài khoản Google.
- **Xác thực linh hoạt**:
  - Đăng nhập/Đăng ký bằng Google OAuth (`POST /api/auth/google`).
  - Đăng nhập/Đăng ký bằng Email & Mật khẩu mã hóa Bcrypt (`POST /api/auth/login`, `POST /api/auth/register`).
  - Hỗ trợ chế độ thử nghiệm nhanh (Quick Demo Google Account) để trải nghiệm ngay lập tức.
- **Quản lý phiên với JWT**: Tạo token 30 ngày an toàn, tự động duy trì đăng nhập trên cả trang người dùng và admin.
- **Đồng bộ tiến độ học tập thời gian thực**: Khi học viên tích lũy XP, duy trì chuỗi học (streak), lưu từ vựng hay đạt huy hiệu, dữ liệu tự động đồng bộ 2 chiều vào MongoDB (`PUT /api/auth/progress`).

### 2. Quản Lý Người Dùng Thực Tế (Admin Panel)
- **Trang Người dùng kết nối MongoDB**: Bảng danh sách người dùng hiển thị ảnh đại diện Google, tên, email, phương thức đăng nhập (Google vs Email), vai trò (Admin / Học viên), XP, streak, số từ đã lưu và ngày đăng ký.
- **Quản lý quyền & tài khoản**: Admin có thể chuyển đổi vai trò (Admin ⮂ Học viên) và xóa người dùng trực tiếp trên cơ sở dữ liệu.
- **Đăng nhập Admin bằng Google**: Trang quản trị hỗ trợ đăng nhập nhanh bằng Google hoặc tài khoản admin truyền thống.

### 3. Backend & Cơ Sở Dữ Liệu (Node.js + Express + MongoDB)
- **Mongoose Models**:
  - `User`: Lưu trữ hồ sơ người dùng, Google ID, email, avatar, vai trò, XP, chuỗi ngày học, từ đã lưu, huy hiệu.
  - `Vocabulary`: Lưu từ vựng, phiên âm, từ loại, nghĩa, ví dụ, cấp độ, chủ đề và **URL ảnh minh họa**.
  - `Grammar`: Lưu các bài học ngữ pháp, công thức, ví dụ.
  - `Quiz`: Lưu ngân hàng câu hỏi trắc nghiệm theo 4 danh mục.
  - `Media`: Lưu siêu dữ liệu ảnh tải lên.
- **Auto-seeding**: Tự động nạp dữ liệu mẫu ban đầu vào MongoDB khi khởi động server.

### 4. Chức Năng Đăng Ảnh & Quản Lý Media trong Admin
- **Đăng ảnh khi Thêm / Sửa từ vựng**: Hỗ trợ kéo thả ảnh (Drag & Drop), chọn file từ máy tính hoặc dán link URL với live preview tức thì.
- **Hiển thị ảnh trong bảng Từ vựng**: Cột thumbnail và lightbox xem ảnh lớn.
- **Thư viện Ảnh (Media Manager)**: Tải nhiều ảnh cùng lúc, xem dung lượng, sao chép link và xóa ảnh.
- **Đèn báo trạng thái MongoDB**: Hiển thị trên thanh Topbar (`🟢 MongoDB Online`).

### 5. Đào Tạo Ngành Công Nghệ Thông Tin & Tiếng Anh Chuyên Ngành (IT Academy)
- **Lộ trình bài học CNTT thực chiến**: 6 module chuyên sâu bao gồm Lập trình Web Frontend, Backend RESTful API, Cấu trúc Dữ liệu & Giải thuật (DSA), Git/DevOps, Trí tuệ Nhân tạo (AI & Prompt Engineering) và An toàn Thông tin (Cybersecurity).
- **Lý thuyết song ngữ & Code Snippets thực tế**: Mỗi bài học kết hợp giữa phân tích kỹ thuật bằng tiếng Việt và thuật ngữ/ngữ cảnh chuyên môn tiếng Anh chuẩn quốc tế.
- **Trình thực hành Code tương tác (Live Interactive Code Playground)**: Trình sandbox cho phép người học viết, chỉnh sửa và chạy trực tiếp code JavaScript/thuật toán trong trình duyệt với console hiển thị thời gian thực.
- **Kho tra cứu Thuật ngữ CNTT (IT Terminology Explorer)**: Hàng chục thuật ngữ cốt lõi (API, Asynchronous, Polymorphism, Recursion, Latency, Container,...) có phát âm audio Web Speech API, ví dụ và bản dịch ngữ cảnh.
- **Quiz CNTT & IT English**: 10 câu hỏi trắc nghiệm kiểm tra kiến thức lập trình, thuật toán và từ vựng CNTT.

### 6. Cổng Tin Tức Công Nghệ Thông Tin (Tech News Portal)
- **Tin tức công nghệ cập nhật**: Các bài báo thời sự về AI Agents, Web Development, Bảo mật Cloud, Xu hướng phần cứng và định hướng sự nghiệp kỹ sư phần mềm.
- **Bộ lọc & Tìm kiếm tức thì**: Lọc theo danh mục (AI, Lập trình, An ninh mạng, Cloud, Sự nghiệp) và tìm kiếm từ khóa thời gian thực.
- **Modal đọc bài viết chi tiết**: Giao diện đọc tạp chí công nghệ cao cấp kèm box **"Key IT Vocabulary in this Article"** giúp học viên vừa cập nhật công nghệ vừa mở rộng vốn từ tiếng Anh.

### 7. Giao Diện Sáng / Tối (Light & Dark Mode)
- **Chuyển đổi 1-click**: Nút Toggle trên Navbar với icon mặt trời ☀️ / mặt trăng 🌙.
- **Tự động lưu trạng thái**: Ghi nhớ cài đặt giao diện của người dùng vào `localStorage` và tự động nhận diện chế độ hệ điều hành.
- **Tối ưu trải nghiệm mắt**: Bảng màu Dark theme sang trọng (`#0b0f19`, `#131b2e`), tương phản cao, dịu mắt khi đọc bài viết và viết code ban đêm.

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Hệ Thống

### Yêu cầu:
- Đã cài đặt **Node.js** (v18+)
- Đã cài đặt **MongoDB** (Dịch vụ MongoDB Server đang chạy tại cổng mặc định `27017`)

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Khởi tạo cơ sở dữ liệu mẫu:
```bash
npm run seed
```

### 3. Khởi động Server:
```bash
npm start
```
*(Chế độ dev tự động reload: `npm run dev`)*

### 4. Truy cập hệ thống:
- Website chính (Học Tiếng Anh & CNTT): [http://localhost:5000](http://localhost:5000)
- Cổng tin tức CNTT: [http://localhost:5000/#tech-news](http://localhost:5000/#tech-news)
- Học CNTT & Lập trình: [http://localhost:5000/#it-academy](http://localhost:5000/#it-academy)
- Trình thực hành Code: [http://localhost:5000/#code-playground](http://localhost:5000/#code-playground)
- Trang Admin: [http://localhost:5000/admin](http://localhost:5000/admin) (Tài khoản: `admin` / `admin123`)

---

## 📂 Kiến Trúc Mô Hình MVC (Model - View - Controller)

Dự án được tái cấu trúc và chuẩn hóa toàn diện theo kiến trúc **MVC**:

```
CD ENGLISH/
├── config/                 # Cấu hình hệ thống & Cơ sở dữ liệu
│   └── db.js               # Kết nối MongoDB, auto-seeding & event listeners
├── models/                 # [M] - Model: Mongoose Schemas & Thực thể dữ liệu
│   ├── index.js            # Xuất tập trung toàn bộ models
│   ├── User.js             # Model người dùng & phân quyền
│   ├── Vocabulary.js       # Model từ vựng & hình ảnh minh họa
│   ├── Course.js           # Model khóa học video & bài học con
│   ├── Grammar.js          # Model bài học ngữ pháp
│   ├── Quiz.js             # Model câu hỏi trắc nghiệm
│   ├── News.js             # Model tin tức công nghệ CNTT
│   ├── ITCourse.js         # Model lộ trình học CNTT & thuật ngữ
│   └── Media.js            # Model tệp tin hình ảnh tải lên
├── views/                  # [V] - View: Tầng hiển thị & Tài liệu giao diện
│   └── README.md           # Đặc tả kiến trúc tầng View & kết nối Client-Server
│   (Giao diện người dùng: index.html & Giao diện Admin: admin/index.html)
├── controllers/            # [C] - Controller: Tiếp nhận yêu cầu & xử lý nghiệp vụ
│   ├── index.js            # Xuất tập trung toàn bộ controllers
│   ├── authController.js   # Đăng nhập Google, auth nội bộ, JWT, đổi mật khẩu
│   ├── vocabController.js  # CRUD từ vựng, bộ lọc, tìm kiếm
│   ├── courseController.js # CRUD khóa học video, quản lý bài học con
│   ├── grammarController.js# CRUD bài học ngữ pháp
│   ├── quizController.js   # Quản lý ngân hàng câu hỏi trắc nghiệm
│   ├── itController.js     # Danh mục khóa học & thuật ngữ CNTT
│   ├── newsController.js   # CRUD tin tức công nghệ
│   ├── statsController.js  # Thống kê hệ thống
│   ├── userController.js   # Quản lý người dùng & phân quyền Admin
│   ├── sheetController.js  # Đồng bộ Google Sheets, import/export CSV
│   ├── uploadController.js # Tải lên ảnh đơn/đa tệp, thư viện Media
│   ├── systemController.js # Kiểm tra trạng thái máy chủ (health check)
│   └── viewController.js   # Điều hướng và xử lý view người dùng & admin
├── routes/                 # Routing: Định tuyến URL và gắn Controller
│   ├── index.js            # Router trung tâm gộp toàn bộ endpoints
│   ├── authRoutes.js       # Endpoints xác thực (/api/auth)
│   ├── vocabRoutes.js      # Endpoints từ vựng (/api/vocab)
│   ├── courseRoutes.js     # Endpoints khóa học (/api/courses)
│   ├── grammarRoutes.js    # Endpoints ngữ pháp (/api/grammar)
│   ├── quizRoutes.js       # Endpoints trắc nghiệm (/api/quiz)
│   ├── itRoutes.js         # Endpoints CNTT (/api/it)
│   ├── newsRoutes.js       # Endpoints tin tức (/api/news)
│   ├── statsRoutes.js      # Endpoints thống kê (/api/stats)
│   ├── userRoutes.js       # Endpoints người dùng (/api/users)
│   ├── sheetRoutes.js      # Endpoints Google Sheets (/api/sheets)
│   ├── uploadRoutes.js     # Endpoints upload media (/api/upload, /api/media)
│   ├── systemRoutes.js     # Endpoints trạng thái (/api/health)
│   └── viewRoutes.js       # Endpoints điều hướng giao diện (/admin)
├── middleware/             # Middlewares hệ thống
│   ├── auth.js             # Xác thực JWT & phân quyền Admin
│   ├── security.js         # Helmet, NoSQL Injection, XSS sanitization
│   ├── rateLimiter.js      # Giới hạn tần suất request (chống DoS)
│   └── errorHandler.js     # Bắt và chuẩn hóa lỗi tập trung
├── utils/                  # Hàm tiện ích dùng chung
│   ├── youtube.js          # Trích xuất YouTube Video ID
│   └── sheetParser.js      # Parser CSV & Google Sheets an toàn
├── uploads/                # Thư mục lưu trữ hình ảnh tải lên
├── admin/                  # Giao diện quản trị Admin Panel
│   ├── css/admin.css
│   ├── js/admin.js
│   └── index.html
├── js/                     # Logic client frontend
│   ├── app.js              # Tương tác giao diện client & gọi API Controllers
│   └── data.js             # Dữ liệu tĩnh dự phòng & studios
├── css/                    # Định dạng giao diện chính (Dark/Light mode)
│   └── main.css
├── tests/                  # Bộ kiểm thử tự động (Unit & Integration Tests)
│   ├── controllers.test.js # Kiểm thử các Controller MVC
│   ├── api.routes.test.js  # Kiểm thử các API Endpoints
│   ├── routes.*.test.js    # Kiểm thử chi tiết các luồng API
│   ├── models.test.js      # Kiểm thử schema models
│   ├── security.test.js    # Kiểm thử bảo mật & injection
│   └── utils.test.js       # Kiểm thử các hàm tiện ích
├── server.js               # Khởi động ứng dụng Express & nạp cấu hình MVC
├── seed.js                 # Script nạp dữ liệu mẫu vào MongoDB
├── package.json
└── .env
```
