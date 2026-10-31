# Uplink

Uplink is an internal broadband management system for the staff of an internet service provider. Staff register customers, manage broadband plans, take new connection orders and track faults until they are fixed. It uses Sri Lankan data: NIC numbers, mobile numbers, districts and fees in LKR.

Built with MongoDB, Express, React and Node.js.

![Uplink dashboard](docs/screenshots/03-dashboard.png)

## Features

- **Sign in:** every page needs a staff login. There are two roles, admin and agent.
- **Customer Accounts:** add, view, edit and delete customers. Old and new NIC formats are checked, and date of birth and gender are read from the NIC.
- **Product Catalogue:** add, edit and delete broadband plans, or take them off sale.
- **Subscriptions:** order a connection and move it through Pending, Active, Suspended and Terminated.
- **Trouble Tickets:** log faults and move them through Open, In Progress, Resolved and Closed.
- **Access Control:** admins add, edit, disable and delete staff accounts.
- **Dashboard:** key figures and simple bar charts.
- **Lists:** search, filter and sort on each list page.
- **Safe delete:** records that are still in use cannot be deleted, and every delete asks for confirmation.

## Getting started

You need Node.js 20 or newer and MongoDB running locally on port 27017.

```bash
git clone https://github.com/Isuri-Aroma/Uplink.git
cd Uplink
```

Set up the server:

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and set `JWT_SECRET` to any long random string. Then load the demo data and start the API:

```bash
npm run seed
npm run dev
```

In a second terminal, start the client:

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@uplink.lk` | `Admin@1234` |
| Agent | `supun@uplink.lk` | `Agent@1234` |

## Database design

```mermaid
erDiagram
    CUSTOMER ||--o{ SUBSCRIPTION : "has"
    PLAN ||--o{ SUBSCRIPTION : "is used by"
    SUBSCRIPTION ||--o{ TICKET : "has faults"
    USER |o--o{ TICKET : "is assigned"

    USER {
        ObjectId _id PK
        String name
        String email UK
        String password "bcrypt hash"
        String role "admin or agent"
        Boolean isActive
        Date lastLoginAt
    }
    CUSTOMER {
        ObjectId _id PK
        String nameWithInitials
        String fullName
        String nic
        String nicNormalized UK "12-digit NIC"
        String mobile "07XXXXXXXX"
        String email
        Object address "line1, city, district"
        String customerType "Residential or Business"
    }
    PLAN {
        ObjectId _id PK
        String name UK
        String technology "Fibre, VDSL, 4G LTE, 5G"
        Number downMbps
        Number upMbps
        Number dataCapGB "0 = unlimited"
        Number monthlyFeeLKR
        Boolean isActive
    }
    SUBSCRIPTION {
        ObjectId _id PK
        String accountNo UK "SUB-000001"
        ObjectId customer FK
        ObjectId plan FK
        Object installAddress
        String status "Pending, Active, Suspended, Terminated"
        Array statusHistory "status, note, at, by"
        Date installDate
        String routerSerial UK
        Number usedGB
        String notes
    }
    TICKET {
        ObjectId _id PK
        String ticketNo UK "TT-000001"
        ObjectId subscription FK
        ObjectId assignedTo FK
        String category
        String priority "Low, Medium, High, Critical"
        Number priorityLevel "1 to 4, for sorting"
        String subject
        String description
        String contactMobile
        String status "Open, In Progress, Resolved, Closed"
        Array activity "status, note, at, by"
        String resolution
        Date resolvedAt
        Date closedAt
    }
```

A `counters` collection holds the last account and ticket number. Each collection also stores `createdAt` and `updatedAt`.

## Screenshots

| | |
|---|---|
| ![Sign in](docs/screenshots/01-sign-in.png) Sign in | ![Customer accounts](docs/screenshots/04-customer-accounts.png) Customer accounts |
| ![Product catalogue](docs/screenshots/06-product-catalogue.png) Product catalogue | ![Edit plan](docs/screenshots/07-plan-form.png) Edit plan |
| ![Subscriptions](docs/screenshots/08-subscriptions.png) Subscriptions | ![Subscription details](docs/screenshots/09-subscription-details.png) Subscription details |
| ![Trouble tickets](docs/screenshots/10-trouble-tickets.png) Trouble tickets | ![Access control](docs/screenshots/12-access-control.png) Access control |

<img src="docs/screenshots/15-mobile-tickets.png" alt="Trouble tickets on a phone" width="260">

## Credits

Sign-in photo by [Kirill Sh](https://unsplash.com/photos/fiber-optic-cables-in-network-switch-eVWWr6nmDf8) on Unsplash.

## Author

Isuri Aroma
