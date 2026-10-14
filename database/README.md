# HostelCare - Database Setup & Local Installation Guide

## 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MySQL**: MySQL Server 8.0+ or MariaDB 10.5+ (or use the built-in active relational store)

---

## 2. Quick Local Start (Zero-Setup Mode)
The application includes an active relational repository with built-in realistic university dataset:
```bash
# 1. Install dependencies
npm install

# 2. Start the development server (runs React + Tailwind + Relational Engine)
npm run dev

# 3. Open browser
http://localhost:3000
```

---

## 3. Connecting to a Real MySQL Server

### Step A: Create Database & Tables
Log in to your MySQL server using the MySQL command line client or MySQL Workbench:

```bash
mysql -u root -p
```

Run the schema script:
```sql
SOURCE database/schema.sql;
SOURCE database/seeds.sql;
```

Or execute via bash:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seeds.sql
```

### Step B: Configure `.env` File
Create a `.env` file in the root directory:
```env
# Server Port
PORT=3000

# MySQL Database Connection (Optional - defaults to built-in in-memory relational store if unset)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_secure_password
MYSQL_DATABASE=hostelcare_db
```

### Step C: Optional Docker Setup
Run MySQL 8.0 in Docker with one command:
```bash
docker run --name hostelcare-mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=hostelcare_db \
  -p 3306:3306 \
  -d mysql:8.0
```

---

## 4. Default Demo Accounts

| Role | Name | Email | Password | Assigned Unit |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Rahul Verma | `rahul.verma@college.edu` | `demo123` | Nilgiri Hostel (B-304) |
| **Student** | Ananya Sharma | `ananya.sharma@college.edu` | `demo123` | Kalpana Chawla Girls Hostel (A-212) |
| **Warden** | Dr. Ramesh Sharma | `warden.nilgiri@college.edu` | `demo123` | Chief Warden - Nilgiri Hostel |
| **Warden** | Prof. Sunita Mehta | `warden.girls@college.edu` | `demo123` | Chief Warden - Kalpana Chawla |
| **HOD** | Prof. Arvind Rao | `hod.mca@college.edu` | `demo123` | Head of Dept - CS & MCA |
| **Dean** | Dr. Vikram Malhotra | `dean.studentaffairs@college.edu` | `demo123` | Dean of Student Welfare |
| **Admin** | System Administrator | `admin.hostelcare@college.edu` | `demo123` | Master Super Admin |

*Note: In the web preview, you can click on any persona in the "Role: Student" dropdown in the top navigation bar to instantaneously inspect the system through that exact role's permissions and dashboard!*
