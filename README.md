# PPL Coach

A two-app workspace for people coaching application built with ASP.NET Core 8 Web API backend and React 19 + Vite + TypeScript frontend.

## Architecture

```
.
├─ README.md
├─ .gitignore
├─ .env.example
├─ docker-compose.yml           # ONLY Postgres here
├─ backend/                     # ASP.NET Core 8 Web API
└─ frontend/                    # React 19 + Vite + TS
```

## Quick Start

1. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Start the database:**
   ```bash
   docker compose up -d db
   ```

3. **Start the backend (new terminal):**
   ```bash
   cd backend && dotnet run
   ```
   Backend runs on http://localhost:5179

4. **Start the frontend (new terminal):**
   ```bash
   cd frontend && npm i && npm run dev
   ```
   Frontend runs on http://localhost:5173

5. **Access services:**
   - Frontend: http://localhost:5173
   - API Swagger: http://localhost:5179/swagger
   - Backend API: http://localhost:5179

## Database Options

### Local Development (Default)
Uses Docker Postgres as configured above.

### Hosted Database (Production/Remote)
For hosted database, consider these free tier options:
- **Neon**: https://neon.tech
- **Supabase**: https://supabase.com

To use hosted database, update the `DATABASE_URL` in your `.env` file with the connection string provided by your chosen service.

## Development

### Backend
- ASP.NET Core 8 Web API
- See `backend/` directory for specific setup and development instructions

### Frontend
- React 19 + Vite + TypeScript
- See `frontend/` directory for specific setup and development instructions

## Environment Variables

See `.env.example` for all required environment variables and their descriptions.