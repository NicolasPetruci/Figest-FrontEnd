# 💻 Figest-FrontEnd

> ⚠️ **Educational Project Notice**: This service is part of the **Figest** financial ecosystem, created for study, research, and testing purposes to demonstrate modern Next.js 16 App Router web architecture, Chakra UI design systems, and Zustand state persistence.

---

## 📌 Overview

**Figest-FrontEnd** is the web interface for the Figest financial management platform. It offers a sleek, dark-mode-first dashboard with interactive financial management, expense pie charts, trend graphs, B2B purchasing, category management, report exports, and system settings.

---

## 🛠️ Tech Stack
* **Framework:** Next.js 16 (App Router + React 19)
* **Language:** TypeScript
* **UI Components:** Chakra UI v2 + React Icons + Framer Motion
* **Charts:** Recharts
* **State Management:** Zustand + `persist` middleware
* **HTTP Client:** Axios + Request/Response Interceptors

---

## 🗺️ Application Routes

| Path | Description | Protected |
|---|---|---|
| `/login` | User Authentication | ❌ Public |
| `/register` | Account Sign Up | ❌ Public |
| `/` | Main Financial Dashboard | ✅ Protected |
| `/transactions` | Income/Expense List & `.OFX` Import | ✅ Protected |
| `/accounts` | Bank Accounts & Open Finance | ✅ Protected |
| `/categories` | Expense & Income Category Management | ✅ Protected |
| `/purchases` | B2B Purchase Orders & Suppliers | ✅ Protected |
| `/reports` | Financial Statement Exports (PDF / CSV / PNG) | ✅ Protected |
| `/settings` | Profile, Dark Mode, Language & Currency | ✅ Protected |

---

## 🚀 Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.
