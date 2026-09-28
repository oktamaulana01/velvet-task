# Velvet Task — Rebel To-Do Tracker 🎭

> *"Rebel against the mundane — one task at a time."*

**Velvet Task** adalah aplikasi pelacak tugas harian (*to-do tracker*) bertema visual dan atmosfer game **Persona 5** (*The Velvet Room & Phantom Thieves*). Aplikasi ini menggabungkan manajemen tugas praktis dengan sistem gamifikasi bertingkat (*Confidant Ranks*), efek audio dinamis, pelacak batas waktu (*deadlines*), dan fitur arsip data.

---

## ✨ Fitur Utama

- 📜 **The Velvet Room Contract**: Modal onboarding awal untuk menandatangani kontrak dan memasukkan nama *Guest*.
- 🎯 **Target & Mission Management**:
  - Tambah target misi dengan kategori Arcana dan batas waktu (*due date*).
  - Animasi pop-up eliminasi target bertema komik/manga (*"TARGET ELIMINATED!"*).
  - Filter tugas cepat: `ALL`, `ACTIVE`, `⚠️ URGENT / DEADLINE`, dan `ELIMINATED`.
- ⏳ **Target Deadlines & Urgency Tracking**:
  - Penanda visual waktu dinamis: `🔥 DUE TODAY!`, `⏳ DUE TOMORROW`, `⚠️ OVERDUE`, atau sisa hari.
  - Lencana berkedip (*pulse animation*) untuk target berstatus genting/terlewat.
- 🎴 **Arcana & Confidant Ranks (Gamifikasi)**:
  - 8 Arcana pengembangan diri (*The Fool, The Magician, The Priestess, The Empress, The Emperor, The Chariot, The Star, The Sun*).
  - Setiap target yang diselesaikan menyumbang +1 XP untuk menaikkan peringkat ikatan (*Bond Rank 1 s.d. Rank 10 MAX BOND*).
- 🔊 **Audio FX Bawaan (Web Audio API)**:
  - Disintesis secara langsung menggunakan Web Audio API tanpa membutuhkan berkas audio eksternal (*zero external assets*).
  - Efek tebasan pedang (*All-Out slash & impact*), dentang lonceng mistis Velvet Room, fanfare *Rank Up*, dan suara segel kontrak.
  - Dilengkapi tombol toggle **SFX ON / OFF** yang tersimpan di memori lokal.
- 🔥 **Daily Streak Tracker**: Mencatat rantai hari aktif berturut-turut untuk menjaga konsistensi produktivitas harian.
- 💾 **System Archive (Backup & Recovery)**:
  - **Export JSON**: Unduh seluruh riwayat target, streak, dan progres Arcana ke berkas `.json`.
  - **Import JSON**: Pulihkan data misi dari berkas cadangan kapan saja dengan validasi integritas data.

---

## 🛠️ Teknologi yang Digunakan

- **HTML5**: Struktur semantik dengan layout responsif.
- **CSS3 (Vanilla)**: Desain khas Phantom Thieves (palet warna Crimson Red `#e60012`, Ink Black, latar pola halftone, sudut miring *skew*, hard shadow, dan animasi pop).
- **JavaScript (ES6+ Vanilla)**: Pengelolaan state, kalkulasi XP & level rank, integrasi Web Audio API, serta persistensi ke `localStorage`.

---

## 🚀 Cara Menjalankan Secara Lokal

Karena dibangun menggunakan web stack murni tanpa perlu build step atau database server:

### Opsi 1: Buka Langsung di Browser
Cukup klik dua kali berkas `index.html` di komputer Anda, atau buka melalui browser (Chrome / Edge / Firefox).

### Opsi 2: Menggunakan Laragon / Web Server Lokal
Letakkan folder ini di dalam direktori root server lokal Anda (misal `C:\laragon\www\velvet-task`), lalu akses:
```
http://localhost/velvet-task
```

### Opsi 3: Menggunakan Node.js
```bash
npx serve .
```
Lalu buka alamat yang tertera (biasanya `http://localhost:3000`).

---

## 📄 Lisensi
Projek ini dibuat sebagai projek penggemar terinspirasi oleh Persona 5. Persona 5 adalah merek dagang ATLUS / SEGA.
