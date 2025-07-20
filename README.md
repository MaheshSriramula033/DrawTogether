# 🖌️ DrawTogether

A real-time collaborative whiteboard built with React, Node.js, Express, Socket.io, and MongoDB. Multiple users can draw simultaneously, view each other’s cursors, and sync drawings with full persistence.

---

## 🚀 Features

- ✏️ **Real-time drawing** with cursor tracking
- 🎨 Pencil tool with adjustable **color and stroke width**
- 🧽 **Clear canvas** option (syncs for all users)
- 👥 User count and cursor tracking
- 💾 Drawing history stored in MongoDB
- ⚙️ Scales canvas properly on resize
- 🧼 Cron job to delete inactive rooms after 24 hours

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite + Socket.io-client
- **Backend:** Node.js + Express + MongoDB + Socket.io
- **Database:** MongoDB (via Mongoose)

---

## 📦 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/MaheshSriramula033/DrawTogether
cd collab-whiteboard
