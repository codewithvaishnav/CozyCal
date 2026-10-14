# 🏡 Farmhouse Booking & Reservation Management System

An intuitive, responsive, and real-time reservation management platform designed specifically for farmhouses, holiday villas, and event venues. It features interactive calendar scheduling, instant conflict detection, financial balance tracking, guest audit histories, and team member management.

🔗 **Live App URL:** https://cozy-admin.web.app/

---

## ✨ Features

- **Interactive Visual Calendar**
  - Full-month and multi-month calendar view with quick navigation.
  - Color-coded reservations by status (**Inquiry**, **Confirmed**, **Completed**, **Cancelled**).
  - Hover previews and quick date-slot inspection.

- **Double-Booking & Conflict Prevention**
  - Real-time date range validation preventing overlapping reservations.
  - Clear conflict warnings when selecting already booked dates.

- **Booking Management & Detailed Tracking**
  - Search reservations by guest name, phone number, or notes.
  - Filter by reservation status, booking source, and date ranges.
  - Complete guest records: check-in / check-out dates, guest counts, and special notes.
  - Detailed audit history logging actions and status changes.

- **Financial & Payment Overview**
  - Advance payment and remaining balance computation.
  - Tracking which staff member received each payment installment.
  - Quick revenue analytics and outstanding balance highlights.

- **Performance Dashboard**
  - Live KPIs: Total Bookings, Revenue Generated, Pending Balances.
  - Upcoming check-ins and check-outs at a glance.
  - Booking source distribution (Direct, Social Media, Referrals, Aggregators).

- **Team & Role Management**
  - Support for multi-user access with Manager and Staff permissions.
  - Safe real-time data sync with Firebase Firestore.
  - Built-in error boundary and data normalization preventing runtime UI crashes.

---

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling:** [Vite 6](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Motion](https://motion.dev/)
- **Backend / Database:** [Firebase Firestore](https://firebase.google.com/docs/firestore) & Firebase Authentication

---


## 📂 Project Structure

```text
├── src/
│   ├── components/
│   │   ├── CalendarView.tsx      # Interactive calendar grid & date picker
│   │   ├── BookingsView.tsx      # Filterable bookings table & search
│   │   ├── DashboardView.tsx     # KPI metrics & quick statistics
│   │   ├── NewBookingModal.tsx   # Reservation creation modal with validation
│   │   ├── ViewBookingModal.tsx  # Detailed view, history log, & balance edit
│   │   ├── MembersModal.tsx      # Team members & manager role assignment
│   │   └── ErrorBoundary.tsx     # Crash shield & graceful error fallback
│   ├── firebase.ts               # Firebase SDK initialization & Firestore db
│   ├── types.ts                  # TypeScript models (Booking, Member, etc.)
│   ├── App.tsx                   # Main layout, tab navigation, & Firestore subscriptions
│   └── main.tsx                  # React entry point with ErrorBoundary
├── index.html                    # HTML entry point with responsive viewport
├── package.json
└── tsconfig.json
```

---

## 🔒 Security & Data Integrity

- **Date Sanitization:** Defensive parsing prevents invalid date formats from crashing calendar rendering.
- **Defensive Snapshots:** Incoming Firestore documents are sanitized with fallback values for missing or legacy fields.
- **Audit Logs:** Key lifecycle transitions (creation, payment updates, cancellation) append timestamps and user attribution.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
