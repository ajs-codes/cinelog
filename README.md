# CineLog

CineLog is a Next.js application using the App Router, Redux Toolkit, Redux Saga, Zod, Drizzle ORM, and Turso.

## Requirements

- Node.js 20 or newer
- Yarn 4
- A Turso account and database

## Install Dependencies

Install the project dependencies from the repository root:

```bash
yarn install
```

## Development

Start the Next.js development server:

```bash
yarn dev
```

The same command can be run with the explicit Yarn `run` syntax:

```bash
yarn run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production

Create an optimized production build:

```bash
yarn build
```

Start the production server after the build completes:

```bash
yarn start
```

The production server runs at [http://localhost:3000](http://localhost:3000) by default.

## Turso Setup

Install and authenticate with the [Turso CLI](https://docs.turso.tech/cli/installation), then create or select a database:

```bash
turso auth login
turso db create cinelog-db
```

Get the database URL and create an authentication token:

```bash
turso db show cinelog-db --url
turso db tokens create cinelog-db
```

Copy the URL and token into a local environment file. Use `.env.local` for local development:

```env
TURSO_CONNECTION_URL=libsql://your-database-your-org.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
```

Do not commit `.env.local` or expose `TURSO_AUTH_TOKEN` in client-side code. The database connection is created on the server in `src/db/index.ts`.

## Database Migrations

The Drizzle schema is defined in `src/db/schema.ts`, and the Drizzle configuration is in `drizzle.config.ts`.

After changing the schema, generate a migration:

```bash
yarn db:generate
```

Apply pending migrations to the configured Turso database:

```bash
yarn db:migrate
```

The migration command uses `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN` from your environment. Make sure those variables are available before running it.

## Useful Commands

```bash
yarn lint
yarn build
yarn start
```

## Application Routes

- `/` - Application home page
- `/dashboard` - Movie dashboard
- `GET /api/movies` - List movies
- `POST /api/movies` - Add a validated movie
- `GET /api/auth` - Authentication status placeholder
- `POST /api/auth` - Authentication endpoint placeholder
