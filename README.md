<h1 align="center">💰 AccountingApp</h1>

<p align="center">
  Aplikasi akuntansi berbasis web untuk manajemen jurnal, buku besar, neraca saldo, dan laporan keuangan.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-v12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel">
  <img src="https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Inertia.js-v2-9553E9?style=for-the-badge&logo=inertia&logoColor=white" alt="Inertia.js">
  <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/PHP-8.2-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP">
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
</p>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Arsitektur Aplikasi](#-arsitektur-aplikasi)
- [Database Schema](#-database-schema)
- [Struktur Folder](#-struktur-folder)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Pengujian](#-pengujian)
- [Role & Hak Akses](#-role--hak-akses)
- [Modul Aplikasi](#-modul-aplikasi)

---

## 🎯 Tentang Proyek

**AccountingApp** adalah sistem informasi akuntansi berbasis web yang dikembangkan sebagai proyek skripsi. Aplikasi ini dirancang untuk membantu perusahaan atau organisasi dalam mengelola pencatatan transaksi keuangan secara sistematis mengikuti standar akuntansi Indonesia.

Aplikasi ini mencakup siklus akuntansi lengkap: dari pencatatan jurnal transaksi, pemindahan ke buku besar, penyusunan neraca saldo, hingga pembuatan laporan keuangan (Posisi Keuangan, Laba Rugi, Arus Kas, dan Perubahan Ekuitas).

---

## ✨ Fitur Utama

### 📒 Manajemen Jurnal
- **Jurnal Umum** — Pencatatan transaksi umum dengan entri debit/kredit
- **Jurnal Kas Masuk & Keluar** — Pencatatan transaksi kas secara terstruktur
- **Jurnal Bank Masuk & Keluar** — Pencatatan transaksi perbankan
- Sistem **posting jurnal** dengan validasi saldo debit = kredit
- **Ekspor Excel** dan **cetak PDF** per jurnal
- Status jurnal: *Draft* → *Posted*

### 📊 Bagan Perkiraan (Chart of Accounts)
- Manajemen **Akun** dengan struktur hierarki (parent-child)
- Manajemen **Kategori Akun** (Aktiva, Kewajiban, Ekuitas, Pendapatan, Beban)
- Manajemen **Tipe Akun** dengan normal balance (Debit/Kredit)
- Pengaturan akun kas dan aktivitas arus kas

### 📚 Buku Besar
- Tampilan saldo berjalan per akun
- Filter berdasarkan akun dan periode
- **Ekspor ke Excel**

### ⚖️ Neraca Saldo
- Neraca saldo otomatis berdasarkan posting jurnal
- Filter per periode fiskal
- **Ekspor ke Excel**

### 📈 Laporan Keuangan
- **Laporan Posisi Keuangan** (Neraca)
- **Laporan Laba Rugi**
- **Laporan Arus Kas** (metode langsung berdasarkan aktivitas)
- **Laporan Perubahan Ekuitas**
- Cetak **PDF** untuk setiap laporan

### 📅 Manajemen Periode Fiskal
- Buka/tutup periode akuntansi
- Dukungan periode bulanan dan tahunan
- Notifikasi email otomatis saat periode ditutup

### 👥 Manajemen Pengguna
- CRUD pengguna dengan role-based access control (RBAC)
- Dua role: **Admin** dan **Akuntan**

### 🔐 Autentikasi
- Login dengan email dan password
- **Reset password via OTP** yang dikirim ke email
- Manajemen profil dan ganti password
- Pengaturan tema (Light/Dark mode)

### 📧 Notifikasi Email
- Email notifikasi saat **jurnal diposting**
- Email notifikasi saat **periode fiskal ditutup**

---

## 🛠 Tech Stack

### Backend
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **PHP** | 8.2 | Bahasa pemrograman server-side |
| **Laravel** | 12 | Framework PHP utama |
| **Inertia.js (Laravel)** | 2 | Server-side adapter untuk SPA |
| **Ziggy** | 2 | Named routes ke JavaScript |
| **Laravel Tinker** | 2.10 | REPL untuk debugging |
| **SQLite** | — | Database default (dapat diganti MySQL/PostgreSQL) |

### Frontend
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **React** | 19 | UI library |
| **Inertia.js (React)** | 2 | Client-side adapter |
| **Tailwind CSS** | 4 | Utility-first CSS framework |
| **Radix UI** | 1+ | Headless UI components |
| **shadcn/ui** | — | Komponen UI berbasis Radix UI |
| **React Hook Form** | 7 | Manajemen form |
| **Zod** | 4 | Validasi schema |
| **TanStack Table** | 8 | Data table yang powerful |
| **Chart.js + react-chartjs-2** | 4/5 | Visualisasi data/grafik |
| **Lucide React** | 0.554 | Icon library |
| **date-fns** | 4 | Manipulasi tanggal |
| **Sonner** | 2 | Toast notifications |
| **next-themes** | 0.4 | Dark/Light mode |

### Dev Tools
| Teknologi | Kegunaan |
|-----------|----------|
| **Vite** | Bundler & dev server |
| **Laravel Pint** | PHP code formatter |
| **PHPUnit** | Framework pengujian PHP |
| **Laravel Sail** | Docker environment |
| **Laravel Boost** | Alat pengembangan berbasis MCP |

---

## 🏗 Arsitektur Aplikasi

Aplikasi ini menggunakan pola **Monolith SPA** dengan Inertia.js sebagai jembatan antara Laravel (backend) dan React (frontend). Tidak ada REST API terpisah — data dikirim langsung dari controller ke komponen React via Inertia props.

```
Browser (React + Inertia)
        ↕  HTTP Request / Inertia Response
Laravel Router (routes/web.php)
        ↓
Middleware (auth, can:manage-accounting, can:manage-users)
        ↓
Controllers (HTTP layer)
        ↓
Models (Eloquent ORM) + Services
        ↓
Database (SQLite / MySQL)
```

### Pola Desain
- **MVC** + **Service Layer** — Business logic berat (laporan keuangan) dipisahkan ke `App\Services`
- **Observer Pattern** — `App\Observers` untuk side effects pada model
- **Event & Listener** — `App\Events` & `App\Listeners` untuk notifikasi email asinkron
- **Queue** — Job antrean untuk pengiriman email agar tidak memblokir request

---

## 🗄 Database Schema

```
roles
  └─ id, name

users
  └─ id, name, email, password, role_id → roles

account_types
  └─ id, name, normal_balance (Debit/Kredit)

cash_flow_activities
  └─ id, name (Operasi, Investasi, Pendanaan)

account_categories
  └─ id, name, account_type_id → account_types

accounts
  └─ id, account_code, account_name, account_category_id → account_categories
  └─ parent_id → accounts (self-reference), initial_balance
  └─ is_active, is_cash_account, cash_flow_activity_id → cash_flow_activities

fiscal_periods
  └─ id, period_name, start_date, end_date, fiscal_year
  └─ status (Open/Closed), period_type (Monthly/Annual)
  └─ closed_at, closed_by → users

journal_entries
  └─ id, entry_date, entry_number, penerima, journal_type
  └─ status (Draft/Posted), fiscal_period_id → fiscal_periods
  └─ user_id → users, posted_at, posted_by → users

journal_details
  └─ id, journal_entry_id → journal_entries
  └─ account_id → accounts, debit, credit, description

account_balances
  └─ id, account_id → accounts, fiscal_period_id → fiscal_periods
  └─ debit_balance, credit_balance

[Views]
  └─ Reporting views untuk laporan keuangan (dibuat via migration)
```

---

## 📁 Struktur Folder

```
AccountingApp/
├── app/
│   ├── Console/            # Artisan commands
│   ├── Events/             # Event classes
│   ├── Helpers/            # Helper functions
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/                       # AuthController (login, OTP, reset password)
│   │   │   ├── BaganPerkiraanController    # Manajemen akun & kategori
│   │   │   ├── BukuBesarController         # Buku besar
│   │   │   ├── DashboardController         # Dashboard & statistik
│   │   │   ├── JurnalController            # Manajemen jurnal (CRUD + posting)
│   │   │   ├── JurnalPDFController         # Cetak PDF jurnal
│   │   │   ├── LaporanKeuanganController   # Laporan keuangan
│   │   │   ├── LaporanKeuanganPDFController# Cetak PDF laporan keuangan
│   │   │   ├── NeracaSaldoController       # Neraca saldo
│   │   │   ├── PengaturanController        # Pengaturan profil & password
│   │   │   ├── PenggunaController          # Manajemen pengguna
│   │   │   └── PeriodeController           # Manajemen periode fiskal
│   │   └── Middleware/
│   ├── Listeners/          # Event listeners (notifikasi email)
│   ├── Mail/               # Mailable classes
│   │   ├── Auth/           # OTP email
│   │   ├── FiscalPeriodClosedMail.php
│   │   └── JournalPostedMail.php
│   ├── Models/
│   │   ├── Account.php
│   │   ├── AccountBalance.php
│   │   ├── AccountCategory.php
│   │   ├── AccountType.php
│   │   ├── CashFlowActivity.php
│   │   ├── FiscalPeriod.php
│   │   ├── JournalDetail.php
│   │   ├── JournalEntry.php
│   │   ├── Role.php
│   │   └── User.php
│   ├── Observers/          # Model observers
│   ├── Providers/          # Service providers
│   └── Services/
│       ├── LaporanKeuanganService.php     # Business logic laporan keuangan
│       └── LaporanKeuanganPDFService.php  # PDF generation service
├── database/
│   ├── migrations/         # Skema database
│   ├── factories/          # Factory untuk seeding/testing
│   └── seeders/            # Database seeders
├── resources/
│   ├── css/                # Global CSS
│   └── js/
│       ├── app.jsx         # Entry point React
│       ├── components/     # Komponen UI reusable (shadcn/ui)
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utility functions
│       ├── pages/          # Halaman Inertia (per fitur)
│       │   ├── akun/
│       │   ├── auth/
│       │   ├── bukubesar/
│       │   ├── dashboard/
│       │   ├── jurnal/
│       │   ├── laporankeuangan/
│       │   ├── layouts/
│       │   ├── login/
│       │   ├── neracasaldo/
│       │   ├── otp/
│       │   ├── pengguna/
│       │   ├── periode/
│       │   └── settings/
│       └── schemas/        # Zod validation schemas
├── routes/
│   ├── web.php             # Semua route web
│   └── console.php         # Artisan schedule
├── tests/
│   ├── Feature/            # Feature tests
│   └── Unit/               # Unit tests
├── .env.example
├── composer.json
├── package.json
└── vite.config.js
```

---

## ⚙️ Persyaratan Sistem

- **PHP** >= 8.2 dengan ekstensi: `pdo`, `pdo_sqlite`, `openssl`, `mbstring`, `tokenizer`, `xml`, `ctype`, `json`
- **Composer** >= 2.x
- **Node.js** >= 18.x
- **npm** >= 9.x
- **SQLite** (default) atau **MySQL** >= 8.0 / **PostgreSQL** >= 14

---

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone <repository-url> AccountingApp
cd AccountingApp
```

### 2. Instalasi Otomatis (Rekomendasi)

```bash
composer run setup
```

Perintah ini akan otomatis menjalankan:
- `composer install`
- Menyalin `.env.example` → `.env`
- Generate application key
- Menjalankan migrasi database
- `npm install`
- `npm run build`

### 3. Instalasi Manual (Opsional)

```bash
# Install dependensi PHP
composer install

# Salin file environment
cp .env.example .env

# Generate application key
php artisan key:generate

# Buat file database SQLite
touch database/database.sqlite

# Jalankan migrasi dan seeder
php artisan migrate --seed

# Install dependensi Node.js
npm install

# Build aset frontend
npm run build
```

---

## 🔧 Konfigurasi

Salin `.env.example` menjadi `.env` dan sesuaikan:

```env
# Nama Aplikasi
APP_NAME="AccountingApp"
APP_ENV=local
APP_URL=http://localhost

# Database (default SQLite)
DB_CONNECTION=sqlite
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=accounting_db
# DB_USERNAME=root
# DB_PASSWORD=

# Queue (untuk notifikasi email async)
QUEUE_CONNECTION=database

# Konfigurasi Email (untuk OTP & notifikasi)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

> **Catatan:** Untuk development, `MAIL_MAILER=log` bisa digunakan agar email disimpan di `storage/logs/laravel.log` tanpa perlu SMTP sungguhan.

---

## ▶️ Menjalankan Aplikasi

### Development (Rekomendasi)

```bash
composer run dev
```

Perintah ini menjalankan secara paralel:
- `php artisan serve` — Server PHP di http://localhost:8000
- `php artisan queue:listen` — Worker antrian (untuk email)
- `npm run dev` — Vite dev server dengan hot reload

### Manual

```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite dev server
npm run dev

# Terminal 3: Queue worker (opsional, untuk email)
php artisan queue:listen --tries=1
```

Buka browser di: **http://localhost:8000**

---

## 🧪 Pengujian

```bash
# Jalankan semua test
composer run test

# Atau langsung via artisan
php artisan test

# Jalankan test spesifik
php artisan test tests/Feature/NamaTest.php

# Filter nama test tertentu
php artisan test --filter=namaMethod
```

---

## 🔑 Role & Hak Akses

| Fitur | Admin | Akuntan |
|-------|:-----:|:-------:|
| Dashboard | ✅ | ✅ |
| Jurnal (CRUD & Posting) | ✅ | ✅ |
| Bagan Perkiraan | ✅ | ✅ |
| Buku Besar | ✅ | ✅ |
| Neraca Saldo | ✅ | ✅ |
| Laporan Keuangan | ✅ | ✅ |
| Manajemen Periode | ✅ | ✅ |
| Manajemen Pengguna | ✅ | ❌ |
| Pengaturan Profil | ✅ | ✅ |

---

## 📦 Modul Aplikasi

### 1. Dashboard
Menampilkan ringkasan keuangan: total pendapatan, total beban, laba/rugi bersih, grafik tren, dan ringkasan jurnal terkini.

### 2. Jurnal (`/jurnal`)
Pencatatan transaksi keuangan dalam tiga jenis jurnal:
- **Jurnal Umum** — Untuk transaksi yang tidak termasuk kas/bank
- **Jurnal Kas** — Masuk (pendapatan tunai) & Keluar (pengeluaran tunai)
- **Jurnal Bank** — Masuk (setoran bank) & Keluar (penarikan bank)

Setiap jurnal wajib seimbang (total debit = total kredit) sebelum bisa diposting.

### 3. Bagan Perkiraan (`/bagan-perkiraan`)
Manajemen struktur akun keuangan:
- **Tipe Akun**: Harta, Kewajiban, Ekuitas, Pendapatan, Beban
- **Kategori Akun**: Sub-kategori dari tipe akun
- **Akun**: Akun individual dengan kode akun dan saldo awal

### 4. Buku Besar (`/buku-besar`)
Menampilkan semua transaksi per akun beserta saldo berjalan, dapat difilter per akun dan periode.

### 5. Neraca Saldo (`/neraca-saldo`)
Rekapitulasi saldo semua akun aktif dalam satu tampilan untuk memverifikasi keseimbangan pembukuan.

### 6. Laporan Keuangan (`/laporan-keuangan`)
- **Posisi Keuangan** — Laporan Neraca (Aktiva vs Kewajiban + Ekuitas)
- **Laba Rugi** — Pendapatan dikurangi Beban = Laba/Rugi Bersih
- **Arus Kas** — Aliran kas dari aktivitas Operasi, Investasi, dan Pendanaan
- **Perubahan Ekuitas** — Perubahan modal dari awal hingga akhir periode

### 7. Periode Fiskal (`/periode`)
Pengelolaan periode akuntansi. Jurnal hanya dapat dibuat dalam periode yang *terbuka*. Penutupan periode mengirimkan notifikasi email otomatis.

### 8. Pengguna (`/pengguna`) — Admin only
CRUD pengguna sistem dengan penugasan role.

### 9. Pengaturan (`/settings`)
- Ubah profil (nama, email)
- Ganti password
- Pilihan tema tampilan (Light/Dark)

---

## 📄 Lisensi

Proyek ini dikembangkan untuk keperluan akademis (skripsi). Seluruh hak cipta dimiliki oleh pengembang.

---

<p align="center">Dikembangkan dengan ❤️ menggunakan Laravel & React</p>
