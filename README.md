# 🛒 Grocery List App (Offline-First)

A mobile-first grocery list application built with **Ionic Vue + TypeScript + SQLite**, designed to help users manage multiple grocery lists with budgets, track spending in real-time, and stay within budget — all **offline-first**.

---

## 🚀 Features

### 🧾 Grocery Lists

* Create multiple grocery lists
* Set a **budget per list**
* Edit list name and budget
* Delete lists (with cascading item deletion)

### 🛍️ Items Management

* Add items with:

  * Name
  * Price
  * Quantity
* Edit and delete items
* Mark items as purchased (checkbox)

### 💰 Budget Tracking

* Real-time calculation of:

  * Total spent
  * Remaining budget
* Automatic computation (no manual deductions)

### 📊 Visual Feedback

* Progress bar:

  * 🟢 Safe (<70%)
  * 🟡 Warning (70–90%)
  * 🔴 Danger (>90%)
* Toast alert when budget is exceeded

### 📱 UX Enhancements

* Swipe to delete/edit (Ionic sliding items)
* Modal-based forms (clean UI)
* Line-through effect for purchased items

---

## 🧠 Tech Stack

* **Frontend:** Ionic Vue + TypeScript
* **State Management:** Pinia
* **Database:** SQLite (via Capacitor)
* **Architecture:** Clean Architecture (Service + Repository Pattern)
* **Platform:** Mobile-first (Android ready)

---

## 🏗️ Architecture Overview

This app follows a **layered architecture** similar to backend systems:

```
UI (Vue + Ionic)
   ↓
Store (Pinia)
   ↓
Service Layer (Business Logic)
   ↓
Repository Layer (Data Access)
   ↓
SQLite Database (Offline Storage)
```

### Key Principles:

* Separation of concerns
* Testable business logic
* Scalable for future backend integration

---

## 📁 Project Structure

```
src/
├── views/           # Pages (List, Detail)
├── components/      # Reusable UI components
├── store/           # Pinia state management
├── services/        # Business logic
├── repositories/    # SQLite queries
├── models/          # TypeScript interfaces
├── database/        # DB initialization (singleton)
└── utils/           # Helpers
```

---

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

---

### 2. Install Capacitor SQLite

```bash
npm install @capacitor-community/sqlite
npx cap sync
```

---

### 3. Web (WASM Fix Required ⚠️)

Copy SQLite WASM files:

```bash
mkdir -p public/assets
cp -r node_modules/sql.js/dist/* public/assets/
```

---

### 4. Run App

```bash
ionic serve
```

---

### 5. Run on Android (Recommended)

```bash
npx cap add android
npx cap open android
```

---

## 🧪 Development Notes

### ⚠️ Web vs Mobile

* **Web:** Uses WASM fallback (requires assets setup)
* **Mobile (Android):** Uses native SQLite (recommended)

---

### 💡 Budget Calculation Strategy

The app uses **derived state**, not stored totals:

```ts
total = sum(price * quantity)
remaining = budget - total
```

This prevents:

* double deductions
* incorrect totals
* sync issues

---

## 🔥 Current Capabilities

* ✅ Full CRUD (Lists & Items)
* ✅ Offline-first storage
* ✅ Real-time calculations
* ✅ Clean architecture
* ✅ Mobile-ready

---

## 🚀 Roadmap (Next Steps)

### 🔄 Backend Sync

* Cloud sync (multi-device support)
* User accounts & authentication
* Real-time shared lists

### 🧠 Architecture Optimization

* Repository abstraction (API vs SQLite)
* Dependency injection
* Better error handling strategy

### 📊 Advanced Features

* Spending analytics dashboard
* Monthly tracking
* Smart recommendations

---

## 🧠 Learnings & Highlights

This project demonstrates:

* Building an **offline-first app**
* Applying **backend architecture patterns on frontend**
* Managing **relational data in mobile apps**
* Designing for **scalability from day one**

---

## 📌 Future Vision

Transform this into a **SaaS grocery planner** with:

* shared family lists
* budgeting insights
* AI-powered suggestions
* Add different features such as Investment Tracker, Utilities, Debt Tracker, and more.

---

## 👨‍💻 Author

Built with 💻 using Ionic Vue + SQLite
Designed with scalability and real-world usage in mind.

---
