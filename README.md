
# Job Scheduler Service

Job Scheduler Service adalah layanan background berbasis Node.js untuk menjalankan job terjadwal (cron-based) dari database, serta mendukung trigger manual melalui IPC (Named Pipe) dan Webhook (HTTP API).


## Features

- ⏱️ Scheduler berbasis cron (database-driven)
- 🔌 IPC server (Windows Named Pipe)
- 🌐 Webhook endpoint (trigger dari luar)
- 🔐 Client registration system (appid)
- 🔄 Auto reschedule job
- 📡 Dispatch job ke client
- 🗄️ Database via Knex.js


## Installation

#### 1. Clone git

```bash
  git clone
  cd <your-project-folder>
```
#### 2. Install dependencies

```bash
  npm install
```

#### 3. Setup database

Sesuaikan Konfigurasi database di:

```bash
  knexfile.js
```

#### 4. Migrate Database

CLI:

```bash
  npx knex migrate:latest
```

## Usage/Examples

Isi jadwal di table Jobs.

| Column | Description         |
| ------ | ------------------- |
| noini  | Job ID              |
| cron   | Cron expression     |
| aktif  | Active flag         |


isi trigger di table action:

| Column | Description         |
| ------ | ------------------- |
| nojob  | Job ID              |
| tipe   | socket/webhook      |
| to     | appid/URL http      |
| param  | yang akan dikirim untuk tipe webhook dengan format { method, headers, body }  |
| aktif  | Active flag         |



## Planning

- Membuat cli
- install di npm global

