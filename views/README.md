# Tầng Hiển Thị (View Layer) & Mô Hình MVC Tam Giác

Hệ thống **TechEnglish (CD ENGLISH)** áp dụng chuẩn mô hình kiến trúc **MVC Tam Giác (Classic Active MVC)**:

```
             Controller
             /        \
(1. Điều phối /       (2. Tác động /
    chọn View)            truy vấn)
           v            v
         View  <------ Model
       (3. Model đổ dữ liệu trực tiếp vào View)
```

## 1. Cơ Chế Hoạt Động Của 3 Mũi Tên

1. **`Controller ➔ Model`**:
   - `Controller` tiếp nhận yêu cầu người dùng từ Route (`/mvc/...`).
   - `Controller` gọi các phương thức của Model tương ứng (`Vocabulary`, `Course`, `Grammar`, `Quiz`, `News`, `ITCourse`, `User`) để truy vấn hoặc cập nhật dữ liệu.

2. **`Controller ➔ View`**:
   - `Controller` điều phối giao diện, quyết định View template nào cần được kích hoạt và hiển thị cho người dùng (`res.render('home')`, `res.render('vocab')`, `res.render('courses')`,...).

3. **`Model ➔ View`**:
   - Dữ liệu thực thể từ `Model` được truyền trực tiếp vào `View` template (`.ejs`) để render giao diện HTML có sẵn dữ liệu từ database, giúp người dùng nhìn thấy dữ liệu thời gian thực.

---

## 2. Danh Sách Các View Templates trong `views/`

| View File | URL Endpoint | Nguồn Model tương ứng (`Model ➔ View`) |
| :--- | :--- | :--- |
| [`views/home.ejs`](file:///e:/CD%20ENGLISH/views/home.ejs) | `GET /mvc` | `Vocabulary`, `Course`, `News` |
| [`views/vocab.ejs`](file:///e:/CD%20ENGLISH/views/vocab.ejs) | `GET /mvc/vocab` | `Vocabulary Model` |
| [`views/courses.ejs`](file:///e:/CD%20ENGLISH/views/courses.ejs) | `GET /mvc/courses` | `Course Model` |
| [`views/grammar.ejs`](file:///e:/CD%20ENGLISH/views/grammar.ejs) | `GET /mvc/grammar` | `Grammar Model` |
| [`views/quiz.ejs`](file:///e:/CD%20ENGLISH/views/quiz.ejs) | `GET /mvc/quiz` | `Quiz Model` |
| [`views/news.ejs`](file:///e:/CD%20ENGLISH/views/news.ejs) | `GET /mvc/news` | `News Model` |
| [`views/it.ejs`](file:///e:/CD%20ENGLISH/views/it.ejs) | `GET /mvc/it` | `ITCourse Model` |
| [`views/admin.ejs`](file:///e:/CD%20ENGLISH/views/admin.ejs) | `GET /mvc/admin` | `User`, `Stats` Models |
| [`views/login.ejs`](file:///e:/CD%20ENGLISH/views/login.ejs) | `GET /mvc/login` | `User Model` |
| [`views/layouts/header.ejs`](file:///e:/CD%20ENGLISH/views/layouts/header.ejs) | Dùng chung | Thanh điều hướng toàn trang MVC |
| [`views/layouts/footer.ejs`](file:///e:/CD%20ENGLISH/views/layouts/footer.ejs) | Dùng chung | Chân trang thông tin bản quyền |

---

## 3. Giao Diện Client Tĩnh Song Hành
Ngoài các View Server EJS theo mô hình MVC tam giác, hệ thống duy trì đầy đủ:
- Giao diện Single Page Application (SPA): [`index.html`](file:///e:/CD%20ENGLISH/index.html)
- Giao diện Admin Dashboard Client: [`admin/index.html`](file:///e:/CD%20ENGLISH/admin/index.html)
