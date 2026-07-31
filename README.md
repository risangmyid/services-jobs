# Service Job Scheduler 

Sudah Banyak module Job Scheduler. tapi ada yang saya tawarkan disini sebagai pembeda.

- Sederhana. dibuat agar lebih optimal dan minimalis.
- Data job yang **dinamis**. umumnya job schedule itu berbentuk/bertipe setup. tapi ini bisa mengikat ke data (karyawan, mesin, order, dll..)
- **Bisa Handle banyak Job**. paling tidak ribuan data.
- **Berbentuk services** terpisah dari aplikasi anda. beberapa aplikasi bisa 1 schedule disini. 
- Memiliki REST API.
  
---

# Instalasi

Donwload atau clone git. lalu:

```bash
npm install
```

# Menjalankan Server

```bash
node index.js --port 3000
```

---

# API

## Melihat Semua Job

```
GET /
```

Response

```json
[
  {
    "_id": "ABC123",
    "date": "2026-08-01T10:00:00.000Z",
    "url": "http://localhost:5000/test"
  }
]
```

---

## Menambah Job

```
POST /add
```

Header

```
Content-Type: application/json
```

### Job berdasarkan Date

```json
{
  "date": "2026-08-01T10:00:00",
  "url": "http://localhost:5000/test"
}
```

### Job berdasarkan Cron

```json
{
  "cron": "*/5 * * * *",
  "url": "http://localhost:5000/test"
}
```

### Job dengan Timezone

```json
{
  "cron": "0 8 * * *",
  "timezone": "Asia/Jakarta",
  "url": "http://localhost:5000/test"
}
```

### Menambah Banyak Job dalam 1 request API

```json
[
  {
    "date": "2026-08-01T10:00:00",
    "url": "http://localhost:5000/test"
  },
  {
    "cron": "*/10 * * * *",
    "url": "http://localhost:5000/test"
  }
]
```

Response

```json
[
  {
    "ok": true,
    "id": "3D7FAF1C6E",
    "message": "Success"
  }
]
```

---

## Menghapus Job

```
DELETE /:id
```

Contoh

```
DELETE /3D7FAF1C6E
```

Response

```
3D7FAF1C6E
```
**Job terdalete saat waktu schedule tiba** 

---

# Format Job yang di kirim

| Field    | Tipe   | Wajib    | Keterangan                |
| -------- | ------ | -------- | ------------------------- |
| date     | String | Tidak    | Waktu eksekusi            |
| cron     | String | Tidak    | Cron Expression           |
| timezone | String | Tidak    | Timezone Cron             |
| url      | String | Ya       | URL tujuan POST           |

Minimal harus memiliki salah satu:

- `date`
- `cron`


**Bisa kirim data bebas sesuai kebutuhan**

---

# Cron Expression

Contoh

| Cron          | Keterangan              |
| ------------- | ----------------------- |
| `* * * * *`   | Setiap menit            |
| `*/5 * * * *` | Setiap 5 menit          |
| `0 * * * *`   | Setiap jam              |
| `0 8 * * *`   | Setiap hari pukul 08:00 |
| `0 0 * * 1`   | Setiap hari Senin       |

lihat https://crontab.cronhub.io/

---

# HTTP Request

Saat job dijalankan server akan mengirim request:

```
POST <url>
```

Header

```
Content-Type: application/json
```

Body

```json
{
  "_id": "...",
  "date": "...",
  "cron": "...",
  "url": "..."
}
```
