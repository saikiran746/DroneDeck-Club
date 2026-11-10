# DroneDeck Club – Drone Management and Pilot Assignment System

Backend Development Fundamentals (BDF) – Modules 1–5 College Assignment.

A modular RESTful backend built with **Node.js**, **Express.js**, and **better-sqlite3** (SQLite), featuring relational foreign-key integrity, reusable input validation middleware, parameterized class searching, and secure query-parameter sorting.

---

## Table of Contents

- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Schema & Integrity](#database-schema--integrity)
- [Setup & Installation](#setup--installation)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
  - [Root Endpoint](#root-endpoint)
  - [Pilots Endpoints](#pilots-endpoints)
  - [Drones Endpoints](#drones-endpoints)
  - [Assignments Endpoints](#assignments-endpoints)
- [Input Validation & Error Handling](#input-validation--error-handling)
- [Search & Sorting Rules](#search--sorting-rules)
- [Testing with Postman](#testing-with-postman)

---

## Technology Stack

- **Runtime Environment:** Node.js (CommonJS)
- **Web Framework:** Express.js 5.x
- **Database Engine:** SQLite 3 via `better-sqlite3`
- **Development Tool:** `nodemon` (auto-reloading)
- **API Testing:** Postman (Collection v2.1.0)

---

## Project Structure

```text
drone-deck/
├── controllers/
│   ├── assignmentsController.js    # Assignment business logic & SQL JOIN queries
│   ├── dronesController.js         # Drone CRUD, class search & whitelisted sorting
│   └── pilotsController.js         # Pilot CRUD operations
├── database/
│   ├── database.js                 # SQLite connection & table initialization
│   └── drone_deck.db               # SQLite database file (ignored in git)
├── middleware/
│   ├── errorHandler.js             # Centralized JSON error handler
│   ├── notFoundHandler.js          # 404 handler for undefined routes
│   └── validation.js               # Reusable input validation for POST & PUT
├── postman/
│   └── DroneDeck_Club.postman_collection.json # Exportable Postman collection
├── routes/
│   ├── assignments.js              # Assignment route definitions
│   ├── drones.js                   # Drone route definitions
│   └── pilots.js                   # Pilot route definitions
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore rules (node_modules, .env, *.db)
├── app.js                          # Express application setup and router mounting
├── package.json                    # Project configuration and npm scripts
├── README.md                       # Comprehensive project documentation
└── server.js                       # HTTP server entry point & port listener
```

---

## Database Schema & Integrity

SQLite foreign-key enforcement is enabled via `PRAGMA foreign_keys = ON`. Tables are automatically created if they do not exist when the application starts.

### 1. `pilots`
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `name` | TEXT | NOT NULL |
| `email` | TEXT | NOT NULL UNIQUE |
| `phone` | TEXT | NOT NULL |

### 2. `drones`
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `name` | TEXT | NOT NULL |
| `class` | TEXT | NOT NULL |

### 3. `assignments`
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `pilot_id` | INTEGER | NOT NULL, FOREIGN KEY &rarr; `pilots(id)` ON DELETE RESTRICT |
| `drone_id` | INTEGER | NOT NULL, FOREIGN KEY &rarr; `drones(id)` ON DELETE RESTRICT |
| `assigned_date` | TEXT | NOT NULL |

> **Referential Integrity:** Deleting a pilot or drone that has active assignment records is strictly blocked by `ON DELETE RESTRICT` (returning HTTP 409).

---

## Setup & Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd drone-deck
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Default configuration:
   ```env
   PORT=3000
   ```

4. **Start the server:**
   - Production / standard run:
     ```bash
     npm start
     ```
   - Development run (with auto-reload):
     ```bash
     npm run dev
     ```

The server will initialize the database and listen on `http://localhost:3000`.

---

## API Reference

All resource endpoints are available both directly (e.g., `/drones`) and with the `/api` prefix (e.g., `/api/drones`).

### Root Endpoint

#### `GET /`
Returns the API welcome status.
- **Status:** `200 OK`
- **Response:**
  ```json
  {
    "project": "DroneDeck Club",
    "message": "Drone Management and Pilot Assignment API",
    "status": "Running"
  }
  ```

---

### Pilots Endpoints

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/pilots` | Create a new pilot | `201 Created` / `400` / `409` |
| `GET` | `/pilots` | List all pilots | `200 OK` |
| `GET` | `/pilots/:id` | Get pilot details by ID | `200 OK` / `404 Not Found` |
| `PUT` | `/pilots/:id` | Update pilot details | `200 OK` / `400` / `404` / `409` |
| `DELETE` | `/pilots/:id` | Delete pilot | `200 OK` / `404` / `409 Conflict` |

#### `POST /pilots` Sample Body:
```json
{
  "name": "Sarah Connor",
  "email": "sarah@resistance.org",
  "phone": "555-4321"
}
```

---

### Drones Endpoints

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/drones` | Create a new drone | `201 Created` / `400` |
| `GET` | `/drones` | List all drones (supports `?class=`, `?sort=`, `?order=`) | `200 OK` / `400` |
| `GET` | `/drones/:id` | Get drone details by ID | `200 OK` / `404 Not Found` |
| `PUT` | `/drones/:id` | Update drone details | `200 OK` / `400` / `404` |
| `DELETE` | `/drones/:id` | Delete drone | `200 OK` / `404` / `409 Conflict` |

#### `POST /drones` Sample Body:
```json
{
  "name": "DJI Matrice 300",
  "class": "Professional"
}
```

---

### Assignments Endpoints

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/assignments` | Create a new assignment | `201 Created` / `400 Bad Request` |
| `GET` | `/assignments` | List all assignments with SQL JOIN (`pilot_name`, `drone_name`) | `200 OK` |
| `GET` | `/assignments/:id` | Get assignment by ID with SQL JOIN | `200 OK` / `404 Not Found` |
| `PUT` | `/assignments/:id` | Update assignment | `200 OK` / `400` / `404` |
| `DELETE` | `/assignments/:id` | Delete assignment | `200 OK` / `404 Not Found` |

#### `POST /assignments` Sample Body:
```json
{
  "pilot_id": 1,
  "drone_id": 1,
  "assigned_date": "2026-11-10"
}
```

#### `GET /assignments` Sample Response (SQL JOIN):
```json
[
  {
    "id": 1,
    "pilot_id": 1,
    "drone_id": 1,
    "assigned_date": "2026-11-10",
    "pilot_name": "Sarah Connor",
    "drone_name": "DJI Matrice 300"
  }
]
```

---

## Input Validation & Error Handling

Input validation is centralized in [`middleware/validation.js`](middleware/validation.js):

- **Pilots:**
  - `name`: non-empty string.
  - `email`: non-empty, valid email format regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
  - `phone`: non-empty string.
- **Drones:**
  - `name`: non-empty string.
  - `class`: non-empty string.
- **Assignments:**
  - `pilot_id`: positive integer & referenced pilot must exist in database.
  - `drone_id`: positive integer & referenced drone must exist in database.
  - `assigned_date`: non-empty, valid date format string.
- **Invalid Payload Response:** `HTTP 400 Bad Request` with `{ "error": "<explanation>" }`.

---

## Search & Sorting Rules

### Drone Search by Class
- **Query:** `GET /drones?class=Professional`
- Uses parameterized case-insensitive query: `WHERE LOWER(class) = LOWER(?)`.
- Returns `200 OK` with matching drones, or `200 OK` with `[]` if no drones match.

### Drone Sorting
- **Allowed Sort Field:** strictly `"name"` (whitelisted).
- **Allowed Order Values:** strictly `"asc"` (A to Z) and `"desc"` (Z to A), defaulting to `"asc"`.
- **Valid Queries:**
  - `GET /drones?sort=name&order=asc` &rarr; Alphabetical A to Z (`200 OK`).
  - `GET /drones?sort=name&order=desc` &rarr; Reverse alphabetical Z to A (`200 OK`).
  - `GET /drones?class=Professional&sort=name&order=asc` &rarr; Filtered by class and sorted A to Z (`200 OK`).
- **Invalid Sort Field:**
  - `GET /drones?sort=colour` &rarr; `400 Bad Request`
    ```json
    {
      "error": "Cannot sort by that field"
    }
    ```
- **Invalid Order Value:**
  - `GET /drones?sort=name&order=invalid` &rarr; `400 Bad Request`
    ```json
    {
      "error": "Invalid order value. Allowed values: asc, desc."
    }
    ```

---

## Testing with Postman

1. Open Postman.
2. Click **Import** &rarr; Select file:
   [`postman/DroneDeck_Club.postman_collection.json`](postman/DroneDeck_Club.postman_collection.json)
3. The collection is pre-configured with a collection variable `{{baseUrl}} = http://localhost:3000`.
4. Run requests in folder order:
   - **Root & Health**
   - **Pilots** (Create, Read All, Read by ID, Update, Delete)
   - **Drones** (Create, Search by Class, Sort A-Z, Sort Z-A, Sort with Class Search, Invalid Sort Test)
   - **Assignments** (Create with Foreign Keys, Read with SQL JOIN, Update, Delete)

