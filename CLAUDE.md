# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MIMS 2.5 (Medical Information Management System) is a data source upload, parsing, and field-mapping platform. Users upload `.xlsx`/`.csv` files (two columns: `primary`, `description`), which are parsed, validated, and stored in TimescaleDB. Users then configure mappings between a source and a target dataset.

## Commands

### Infrastructure (required first)
```bash
docker compose up -d   # Start TimescaleDB (port 5433) + LocalStack S3 (port 4566)
```

### Backend (`backend/`)
```bash
dotnet run --project MIMS.Api                                                          # Run API (port 5000)
dotnet build                                                                           # Build solution
dotnet ef migrations add <Name> --project MIMS.Infrastructure --startup-project MIMS.Api  # Add EF migration
dotnet ef database update --project MIMS.Infrastructure --startup-project MIMS.Api        # Apply migrations
```

### Frontend (`frontend/`)
```bash
npm run dev    # Dev server (port 3000)
npm run build  # Production build
npm run lint   # ESLint
```

## Architecture

### Request Flow
```
Browser → Next.js (rewrites /api/* → ASP.NET Core :5000) → MediatR CQRS handlers
       → EF Core (Npgsql) → TimescaleDB
       → AWS S3 SDK → LocalStack (dev) / AWS S3 (prod)
```

### Backend — Clean Architecture (strictly layered)

- **`MIMS.Core/`** — Domain entities only, zero dependencies. `DataSource` (file metadata), `DataSourceDetail` (parsed row with `NormalizeColumnData` for future matching).
- **`MIMS.Application/`** — Use cases via MediatR CQRS. Contains command/query handlers under `DataSources/`. Defines interfaces (`IApplicationDbContext`, `IFileStorageService`, `IFileParserService`) that Infrastructure implements.
- **`MIMS.Infrastructure/`** — EF Core (`AppDbContext`), S3 file storage (`S3FileStorageService`), file parsing (`FileParserService` handles `.xlsx` via ClosedXML and `.csv` via CsvHelper).
- **`MIMS.Api/`** — ASP.NET Core entry point. Controllers delegate entirely to MediatR. `Program.cs` handles DI wiring, CORS, Swagger.

### Frontend — Next.js App Router

- **`src/app/`** — Pages: `/data-sources/upload`, `/data-sources/[id]`, `/mappings`, `/mappings/results`.
- **`src/components/layout/`** — `AppLayout` wraps all pages with `TopNavBar` + `SideNavBar`.
- **`src/lib/api.ts`** — `apiFetch` wrapper + typed API functions. All backend calls go through here.
- **`src/lib/mockData.ts`** — Static mock data for the mappings UI (not yet wired to real API).

Next.js `/api/*` requests are proxied to the backend via rewrites in `next.config.ts`.

## Important Notes

### Next.js Version Warning
This project uses **Next.js 16.2.3 with React 19**, which has breaking changes from versions in AI training data. Before writing any frontend code, check `frontend/node_modules/next/dist/docs/` for current API documentation. See `frontend/AGENTS.md`.

### Current State of Mappings Feature
The `/mappings` page is a shell backed by `mockData.ts`. The active OpenSpec change at `openspec/changes/implement-data-mapping/` contains the full design, spec, and 55-task plan to wire it to a real `DataMapping` entity + API endpoints.

### OpenSpec Workflow
Feature changes are managed under `openspec/changes/`. Each change has `proposal.md`, `design.md`, `tasks.md`, and `specs/`. Use the `/openspec-apply-change` skill to implement tasks from an active change.
