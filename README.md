# MIMS 2.5

Medical Information Management System — a full-stack application for uploading, parsing, and mapping data sources.

## Project Structure

```
MIMS2.5/
├── backend/        # ASP.NET Core API (.NET)
├── frontend/       # Next.js web application
├── docker/         # Docker init scripts
└── docker-compose.yml
```

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js (React), TypeScript         |
| Backend   | ASP.NET Core, Clean Architecture    |
| Database  | TimescaleDB (PostgreSQL 16)         |
| Storage   | AWS S3 / LocalStack (local dev)     |

## Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18+)

## Getting Started

### 1. Start infrastructure services

```bash
docker compose up -d
```

This starts:
- **TimescaleDB** on `localhost:5433`
- **LocalStack (S3)** on `localhost:4566`

### 2. Run the backend

```bash
cd backend
dotnet run --project MIMS.Api
```

The API will be available at `http://localhost:5000`.

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## Environment

### Backend (`backend/MIMS.Api/appsettings.json`)

| Key | Default |
|-----|---------|
| `ConnectionStrings:DefaultConnection` | `Host=localhost;Port=5433;Database=mims;Username=mims_user;Password=mims_password` |
| `S3:BucketName` | `mims-data-sources` |
| `Cors:AllowedOrigins` | `http://localhost:3000` |

### Frontend (`frontend/.env.local`)

Copy `frontend/.env.example` to `frontend/.env.local` and fill in the values.

## Database Migrations

Migrations are applied automatically on startup. To add a new migration:

```bash
cd backend
dotnet ef migrations add <MigrationName> --project MIMS.Infrastructure --startup-project MIMS.Api
```
