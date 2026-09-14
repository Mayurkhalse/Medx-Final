# Jankoti Auth Backend (Minimal)

This is a small Node/Express server that handles Google OAuth and issues a JWT used by the frontend.

## Setup

1. Install dependencies:
```
npm install
```

2. Create `.env`:
```
cp .env.example .env
```

3. Fill in Google OAuth credentials from Google Cloud Console.

## Run
```
npm start
```

## Routes
- `GET /auth/google` -> starts Google OAuth
- `GET /auth/google/callback` -> handles OAuth callback and redirects to frontend
- `GET /auth/me` -> returns user from JWT
- `POST /auth/logout` -> clears session

The frontend should point `REACT_APP_API_URL` and `REACT_APP_OAUTH_URL` to this server.
