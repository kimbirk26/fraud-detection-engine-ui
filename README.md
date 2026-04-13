# Fraud Detection Engine — UI

A React + TypeScript dashboard for the [Fraud Detection Engine](../fraud-detection-engine) backend. Displays real-time fraud alerts, supports status filtering, and includes a transaction submission form for testing the synchronous evaluation endpoint.

---

## Prerequisites

- **Node.js 20+**
- The **fraud-detection-engine** backend running on `http://localhost:8080`

---

## Running the Backend

From the `fraud-detection-engine` directory:

```bash
# Copy environment defaults (only needed once)
cp .env.example .env

# Start the app, Postgres, and Kafka
docker compose up --build
```

> **Without Kafka:** Start only Postgres, then run the app with the local profile:
> ```bash
> docker compose up postgres -d
> SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run
> ```

The backend starts on `http://localhost:8080`. The local profile bootstraps three users automatically:

| Username           | Password        | Access                          |
|--------------------|-----------------|---------------------------------|
| `analyst`          | `analyst_pass`  | Submit transactions, all alerts |
| `admin`            | `admin_pass`    | Full access                     |
| `customer_cust001` | `customer_pass` | Own alerts only (`CUST001`)     |

Sign in to the UI with any of these credentials.

---

## Running the UI

```bash
npm install
npm run dev
```

The app starts at `http://localhost:5173`, which is already in the backend's CORS allowed origins.

---

## Building for Production

```bash
npm run build
```

Output is written to `dist/`.

---

## Docker

### Run everything with one command

The UI is included as a service in the backend's `docker-compose.yml`. From the `fraud-detection-engine` directory:

```bash
cp .env.example .env
docker compose up --build
```

| Service  | URL                       |
|----------|---------------------------|
| UI       | `http://localhost:3000`   |
| Backend  | `http://localhost:8080`   |

The UI waits for the backend's `/actuator/health` endpoint to report `UP` before starting, so everything comes up in the right order.

### Build and run the UI container standalone

```bash
docker build -t fraud-detection-engine-ui .
docker run -p 3000:80 fraud-detection-engine-ui
```

> The UI calls the backend at `http://localhost:8080` from the user's browser, so the backend must be accessible on that port regardless of how the UI is run.

---

## Pages

| Route          | Description                                                             |
|----------------|-------------------------------------------------------------------------|
| `/login`       | Sign in with backend credentials                                        |
| `/dashboard`   | Alert list grouped by status, stat cards, auto-polls while alerts open  |
| `/alerts/:id`  | Full alert detail — triggered rules, severities, reasons                |
| `/submit`      | Submit a transaction synchronously and see the fraud result inline      |

---

## Tech Stack

| | |
|---|---|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Container | nginx (Alpine) |
