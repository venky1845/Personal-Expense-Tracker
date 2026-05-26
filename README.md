# Ledger — Personal Expense Tracker

A full stack web application where users can register, log in, and manage their personal expenses. Each user's data is private and secured with session-based authentication.

**Tech Stack:** Python · Flask · MySQL · HTML · CSS · JavaScript

---

## Project Structure

```
expense-tracker/
├── app.py
└── static/
    ├── login.html
    ├── register.html
    ├── dashboard.html
    ├── expenses.html
    ├── style.css
    └── index.js
```

---

## Database Setup

Run the following SQL in MySQL to create the database and tables:

```sql
CREATE DATABASE expense_tracker;
USE expense_tracker;

CREATE TABLE users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    email      VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT           NOT NULL,
    title      VARCHAR(100)  NOT NULL,
    amount     DECIMAL(10,2) NOT NULL,
    category   VARCHAR(50)   NOT NULL,
    date       DATE          NOT NULL,
    note       VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Installation

**1. Clone or download the project**

```bash
cd expense-tracker
```

**2. Install Python dependencies**

```bash
pip install flask flask-bcrypt flask-cors mysql-connector-python
```

**3. Update database credentials in `app.py`**

```python
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password",   # change this
    database="expense_tracker"
)
```

**4. Run the app**

```bash
python app.py
```

**5. Open in browser**

```
http://127.0.0.1:5000
```

> Always open the app through `http://127.0.0.1:5000` — never by double-clicking the HTML files directly, as session cookies won't work over `file://`.

---

## Pages

| Page | URL | Description |
|---|---|---|
| Login | `/` | Default landing page. Redirects to dashboard if already logged in. |
| Register | `/register` (static) | Create a new account with username, email, and password. |
| Dashboard | `/dashboard` | Summary cards, category breakdown with progress bars, recent 5 expenses. |
| Expenses | `/expenses-page` | Full expense list with add, edit, delete, and filter. |

---

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Login and start session |
| GET | `/logout` | Clear session and logout |
| GET | `/expenses` | Get all expenses for logged-in user |
| POST | `/expenses` | Add a new expense |
| PUT | `/expenses/<id>` | Update an expense |
| DELETE | `/expenses/<id>` | Delete an expense |
| GET | `/expenses/summary` | Dashboard summary data |
| GET | `/expenses/filter` | Filter by category and/or date range |

---

## Features

- User registration and login with bcrypt password hashing
- Session-based authentication — all expense routes are protected
- Each user sees only their own expenses (enforced at SQL level)
- Add, edit, and delete expenses without page reload
- Filter expenses by category and date range
- Dashboard with 4 summary cards and CSS progress bars per category
- Recent 5 expenses shown on dashboard
- Auto-redirect to dashboard if session is already active

---

## Security Notes

- Passwords are hashed using `flask-bcrypt` — never stored as plain text
- Every SQL query uses parameterized queries — no string formatting
- Every expense query includes `WHERE user_id = session['user_id']` — users cannot access each other's data
- Session cookies are configured with `SameSite=Lax` and `HttpOnly=True`

---

## Expense Categories

Food · Transport · Shopping · Health · Education · Entertainment · Other
