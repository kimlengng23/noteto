# Noteto

Noteto is a full-stack note and database-style tracking app. This repository contains the Node.js API and the Vue UI.

## Project structure

```text
noteto-api/    Express API and MongoDB integration
noteto-ui/     Vue 2 UI
```

## Requirements

- Docker and Docker Compose
- Node.js 20, if running without Docker

## Run with Docker

From the repository root:

```powershell
docker compose up --build
```

Then open:

```text
http://localhost:8080
```

The Docker setup starts:

- API: `http://localhost:3000`
- UI: `http://localhost:8080`
- MongoDB: `localhost:27017`

To stop the containers:

```powershell
docker compose down
```

To stop the containers and remove the local MongoDB volume:

```powershell
docker compose down -v
```

## Run locally without Docker

Start MongoDB locally first, then create an API environment file:

```powershell
cd noteto-api
Copy-Item .env.example .env.development
```

Install and run the API:

```powershell
npm install
npm run dev
```

In another terminal, install and run the UI:

```powershell
cd noteto-ui
npm install
npm run serve
```

Open:

```text
http://localhost:8080
```

The UI development server proxies `/api` and `/public` requests to `http://localhost:3000`.

## Useful commands

Run the API syntax check:

```powershell
cd noteto-api
npm test
```

Build the UI:

```powershell
cd noteto-ui
npm run build
```
