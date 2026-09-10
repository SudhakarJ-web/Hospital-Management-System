# 🏥 Gavane Hospital & Research Centre — HMIS & Clinical EHR Platform

A modern, full-stack Hospital Management Information System (HMIS) and paperless Outpatient Electronic Health Record (EHR) platform built for **Gavane Hospital & Research Centre (Hadapsar, Pune)**. Engineered with **Next.js 15 (App Router)**, **Supabase (PostgreSQL)**, and **Tailwind CSS**, compliant with standard NABH digital workflows and the DPDP Act 2023.

---

## 🌟 Key Features

### 1. Patient Experience & Public Portal
- **Instant Outpatient Booking:** Fast online booking modal with doctor selection, date picker, automated time-slot allocation, and zero double-booking conflicts.
- **Centres of Excellence & Specialities:** Detailed procedures and conditions for Cardiology, General & Laparoscopic Surgery, Pediatrics, Orthopedics, Intensive Care, and Radiology.
- **Preventive Health Packages:** Curated diagnostic screening packages (Essential, Executive Wellness, Senior Citizen) with direct slot reservation.
- **24/7 Trauma & Emergency Hub:** Direct speed-dial emergency dispatch details and "Golden Hour" resuscitation protocols.
- **Cashless Mediclaim & TPA Directory:** Integrated coverage info for major insurance partners.

### 2. Multi-Role Authentication Gateway (`/`)
- **Role-Based Access Control (RBAC):** Dedicated, secure login gateways for:
  - `Admin` — Executive governance desk
  - `Doctor` — Physician-specific clinical workspace
  - `Medical` — Resident Medical Officers (RMOs) and nursing supervisors
  - `Support` — Front desk, billing, triage, and admissions
  - `Patient` — Mobile number OTP / reference lookup
- **Strict Route Guards:** Direct URL access to sensitive dashboards without valid credentials immediately redirects unauthenticated users to the homepage.

### 3. Physician Clinical Workspace (`/dashboard/[doctorSlug]`)
- **Dynamic Routing:** Individualized workspace URLs per clinician (e.g., `/dashboard/doctor-sudhir-gavane`).
- **OPD Clinical Desk:** Quick digital prescription builder with dosage, duration, instructions, and symptom documentation.
- **Live Caseload & Queue:** Doctor-filtered view of real-time online bookings and active assigned patients.
- **Prescription Dispensary:** Seamless transmission of orders to the internal pharmacy.
- **Departmental Ledgers:** Log and query entries for IPD, OT, Radiology, Pathology, Stock, Billing, and Medical Certificates.

### 4. Hospital Administrator Executive Desk (`/dashboard/admin`)
- **Master Executive Telemetry:** Real-time KPI counter cards tracking active specialists, medical officers, support staff, and live appointments.
- **Doctors Directory:** Add, update, view, and retire medical board consultants with fee structures and specialty mappings.
- **Medical & Support Staff Directories:** Granular staff onboarding with auto-generated credentials, Council Registration/Employee IDs, department tags, and shift schedules.
- **Staff Credential Management:** Full edit (`Edit2`) and delete controls for all personnel.
- **Master Clinical Ledgers:** Centralized audit logs for IPD, OT, Pharmacy stock, Billing, Pathology, and Radiology.

### 5. Support Operations Gateway (`/dashboard/support`)
- **Universal Patient Registration:** Digital intake ledger with triage notes and consultant routing.
- **OPD Queue Tracking:** Live consultation status updates and appointment controls.
- **Front-Desk Billing & UPI:** Invoice generation and cashless settlement recording.
- **Inpatient (IPD) Admissions:** Bed availability and ward management.
- **Discharge Clearance & Gate Passes:** Patient discharge summaries and visitor badge management.
- **Ambulance & Utility Fleet:** Hospital transport and equipment registry.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, Server & Client Components)
- **Language:** TypeScript
- **Database & Auth:** Supabase (Managed PostgreSQL, Row-Level Security, Realtime Sync)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Hosting & CI/CD:** Vercel

---

## 🗄️ Database Architecture (Supabase PostgreSQL)

The system relies on five primary relational tables in the `public` schema:

1. **`public.doctors`**
   - Stores credentialed specialists (`id`, `name`, `department`, `degree`, `fee`, `email`, `password`, `slug`, `image`, `status`).
2. **`public.appointments`**
   - Real-time outpatient bookings (`id`, `reference_id`, `patient_name`, `phone`, `department`, `assigned_doctor`, `doctor_id`, `appointment_date`, `time_slot`, `reason`, `status`).
3. **`public.patients`**
   - Active clinical caseload (`id`, `reference_id`, `full_name`, `phone`, `department`, `assigned_doctor`, `doctor_id`, `notes`, `status`).
4. **`public.clinical_ledgers`**
   - Unified audit ledger covering operational records (`id`, `module`, `reference_id`, `col1`, `col2`, `col3`, `col4`, `col5`, `status`, `doctor_id`).
   - Powers `MEDICAL_STAFF`, `SUPPORT_STAFF`, `IPD`, `OT`, `STOCK`, `BILLING`, `RADIOLOGY`, `PATHOLOGY`, and `UTILITY`.
5. **`public.prescriptions`**
   - Digital EHR prescriptions transmitted directly to the in-house pharmacy dispensary.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.17.0` or higher
- **Package Manager**: `npm`, `pnpm`, or `yarn`
- **Supabase Account**: A Supabase project with PostgreSQL enabled

### 1. Clone the Repository
```bash
git clone [https://github.com/](https://github.com/)<your-username>/hospital-management.git
cd hospital-management