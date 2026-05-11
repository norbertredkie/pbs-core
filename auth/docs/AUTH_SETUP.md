# Auth Setup Guide

How to add unified authentication to any PBS product

## Quick Start

### 1. Install Dependencies

```bash
pip install -r auth/requirements.txt
npm install @pbs/auth-sdk
```

### 2. Initialize Database

```bash
cd /Users/norbertredkie/_pbs/pbs-core
python3 auth/database.py  # Creates tables
```

### 3. Configure Environment

```bash
cp auth/.env.template .env
# Edit .env with your OAuth credentials
```

### 4. Start Auth Service

```bash
cd /Users/norbertredkie/_pbs/pbs-core
python3 -m auth.main
# Service runs on http://localhost:8000
```

### 5. Add to Your Product

```tsx
import Signup from '@pbs/auth-sdk/components/Signup';

export default function LoginPage() {
  return (
    <Signup
      productName="Your Product"
      productId="your-product-id"
      requiresAgeVerification={false}
      onSuccess={(token) => {
        // Redirect to dashboard
        window.location.href = '/dashboard';
      }}
    />
  );
}
```

## Architecture

```
┌─────────────────┐
│   Products      │  (19 products)
│  (React apps)   │
└────────┬────────┘
         │ OAuth request
         ▼
┌──────────────────────────┐
│  PBS Auth Service        │  FastAPI + Supabase
│  ├─ OAuth Providers      │  ├─ Google
│  ├─ JWT Tokens          │  ├─ Apple
│  ├─ User Profiles       │  ├─ Discord
│  └─ Sessions            │  └─ Fortnite
└────────┬─────────────────┘
         │ JWT token (universal)
         ▼
      All Products Use Same Token
```

## Endpoints

### Authentication

```
POST /auth/signup
  Request: SignupRequest
  Response: TokenResponse

POST /auth/login
  Request: LoginRequest
  Response: TokenResponse

POST /auth/refresh
  Request: RefreshTokenRequest
  Response: TokenResponse

POST /auth/logout
  Headers: Authorization: Bearer <token>
  Response: {status: "logged_out"}
```

### User Profile

```
GET /auth/me
  Headers: Authorization: Bearer <token>
  Response: UserResponse

PUT /auth/me
  Headers: Authorization: Bearer <token>
  Body: {name?, avatar_url?}
  Response: UserResponse

POST /auth/delete-account
  Headers: Authorization: Bearer <token>
  Response: {status: "account_deleted"}
```

### OAuth Flow

```
GET /auth/authorize/{provider}
  Query: redirect_uri=https://your-app.com/dashboard
  Response: {auth_url: "https://..."}
```

## Configuration

### OAuth Providers

Each provider requires credentials:

**Google:**
- Create OAuth 2.0 app at https://console.cloud.google.com
- Set redirect URI: `https://api.pbs.local/auth/callback/google`
- Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to .env

**Apple:**
- Create Service ID at https://developer.apple.com
- Download private key
- Add to .env: `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`

**Discord:**
- Create application at https://discord.com/developers/applications
- Set redirect URI: `https://api.pbs.local/auth/callback/discord`
- Add `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` to .env

**Fortnite (Epic Games):**
- Create game at https://www.epicgames.com/creatorstudio
- Set redirect URI: `https://api.pbs.local/auth/callback/fortnite`
- Add `FORTNITE_CLIENT_ID` and `FORTNITE_CLIENT_SECRET` to .env

### Database

Default: PostgreSQL (Supabase recommended)

```env
DATABASE_URL=postgresql://user:password@host:5432/pbs_auth
```

Optional: Use SQLite for development

```env
DATABASE_URL=sqlite:///./test.db
```

### JWT

```env
JWT_SECRET_KEY=your-super-secret-key
# Change this in production!
```

Generate a secure key:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### CORS

```env
CORS_ORIGINS=http://localhost:3000,https://pbs.local
```

### Webhooks

```env
WEBHOOK_SECRET=your-webhook-secret
WEBHOOK_USER_CREATED=https://your-webhook.com/user-created
WEBHOOK_USER_UPDATED=https://your-webhook.com/user-updated
WEBHOOK_USER_DELETED=https://your-webhook.com/user-deleted
```

## Integration Examples

### Next.js

```tsx
// pages/login.tsx
import Signup from '@pbs/auth-sdk/components/Signup';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();

  return (
    <Signup
      productName="Your Product"
      productId="your-product-id"
      onSuccess={(token) => {
        localStorage.setItem('auth_token', token);
        router.push('/dashboard');
      }}
    />
  );
}
```

### React Context

```tsx
// context/AuthContext.tsx
import { createContext, useState, useContext } from 'react';

interface AuthContextType {
  token: string | null;
  user: UserResponse | null;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [user, setUser] = useState<UserResponse | null>(null);

  const logout = async () => {
    await fetch('http://localhost:8000/auth/logout', {
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

### Protected Routes

```tsx
// components/ProtectedRoute.tsx
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}
```

## Testing

### Run Tests

```bash
pytest auth/tests/
```

### Manual Testing

```bash
# Test signup
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "Test User",
    "provider": "google",
    "provider_user_id": "google_123",
    "accept_privacy_policy": true,
    "accept_terms_of_service": true,
    "accept_safety_policy": true
  }'

# Test auth
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/auth/me
```

## Troubleshooting

### CORS Errors

Check `CORS_ORIGINS` in .env includes your frontend URL

```env
CORS_ORIGINS=http://localhost:3000,https://myapp.com
```

### OAuth Provider Errors

1. Verify redirect URI matches exactly in provider settings
2. Check credentials in .env are correct
3. Ensure OAuth app is in production mode (not sandbox)

### JWT Errors

- "Token has expired" → Refresh token using refresh endpoint
- "Invalid token" → Verify JWT_SECRET_KEY matches between services
- "Invalid token type" → Use refresh token for `/auth/refresh` only

### Database Errors

1. Verify DATABASE_URL is correct
2. Run migrations: `python3 auth/database.py`
3. Check PostgreSQL/Supabase is running and accessible

## Security Best Practices

1. ✅ Use HTTPS in production
2. ✅ Rotate JWT_SECRET_KEY regularly
3. ✅ Enable 2FA on OAuth provider accounts
4. ✅ Rate limit auth endpoints
5. ✅ Monitor failed login attempts
6. ✅ Store tokens in secure HTTP-only cookies
7. ✅ Validate email domains for enterprise products
8. ✅ Implement IP-based rate limiting

## What's Next

- [OAuth Integration Guide](./OAUTH_INTEGRATION.md)
- [Legal Compliance](./LEGAL_COMPLIANCE.md)
- [Signup Component Docs](./SIGNUP_COMPONENT.md)
