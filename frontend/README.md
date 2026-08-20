# AWS PDF printer client

React + TypeScript client for the AWS PDF printer service. It is designed to deploy to Vercel as a Next.js application.

## Local setup

```powershell
Copy-Item .env.example .env.local
# Set API_BASE_URL and API_KEY in .env.local
npm install
npm run dev
```

Open <http://localhost:3000>. The browser calls `/api/status`; the Next.js route calls API Gateway's `GET /status` and adds the private `x-api-key` header.

In Vercel, set `API_BASE_URL` and `API_KEY` as non-public environment variables for the required deployment environments.
