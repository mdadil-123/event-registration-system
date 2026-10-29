# 🎟️ Event Registration & Pass Management System

A full-stack MERN application designed for seamless event registrations, featuring atomic seat reservations to eliminate race conditions, automated email pass generation via Nodemailer, and role-based access control for organizers and participants.

---

## 🚀 Features

- **Atomic Seat Booking:** Race-condition-safe reservations utilizing MongoDB `$inc` operators to strictly prevent overselling.
- **Automated Email Dispatch:** Instant digital pass generation and confirmation delivery to attendees via Nodemailer (Gmail SMTP).
- **Organizer Verification Desk:** Built-in validation endpoint and check-in mechanism for event organizers.
- **Role-Based Access Control (RBAC):** Distinct workflows for Organizers (create/manage events, monitor attendance) and Participants (browse events, reserve seats, manage tickets).
- **Dynamic Capacity Tracking:** Real-time seat updates reflecting current availability.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, JavaScript (ES6+), CSS3
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM
- **Email Service:** Nodemailer
- **Authentication:** JSON Web Tokens (JWT), bcryptjs

---

## 📁 Repository Structure

```text
event-registration-system/
├── client/          # Frontend application (React + Vite)
├── server/          # Backend REST API (Node.js + Express)
└── README.md        # Project documentation
