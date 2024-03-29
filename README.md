# trellix-trpc

A Trellix clone made with the most bleeding edge Next.js features and some new and fancy tRPC stuff.

> This is based on Remix's [trellix](https://github.com/remix-run/example-trellix) example by [Ryan Florence](https://twitter.com/ryanflorence).

## Setup

You need a Turso database to run this project. You can create one for free at [turso.dev](https://turso.dev). Then, get the URL and Access Token from the Turso dashboard and add them to your `.env.local` file:

```bash
TURSO_URL=libsql://your-database.turso.io
TURSO_ACCESS_TOKEN=your-access-token
```

You'll also need to generate a secret for Auth.js to use. You can generate one with the following command, and then add it to your `.env.local` file as `AUTH_SECRET`:

```bash
openssl rand -hex 32
```

(Optional): If you want to use Github OAuth, also set the `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` environment variables.

Then, install deps, push db schema and start the server:

```bash
bun i
bun db:push
bun dev
# Optional in a separate terminal
bun db:studio
```
