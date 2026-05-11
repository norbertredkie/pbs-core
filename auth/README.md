# PBS Unified Authentication Service

🔐 Single OAuth backend for all 19 PBS products

---

## Features

✅ **OAuth2 with 4 Providers**
- Google
- Apple ID
- Discord
- Fortnite (Epic Games)

✅ **Universal JWT Tokens**
- One token works across all 19 products
- 15-minute access tokens
- 7-day refresh tokens
- HMAC-SHA256 signed

✅ **User Profiles**
- Name, email, avatar
- Tier management (free/pro/enterprise)
- Credits system
- Soft deletion (30-day recovery)

✅ **Session Management**
- Multi-device support
- IP tracking
- User agent logging
- Logout invalidates all sessions

✅ **Rate Limiting**
- In-memory (dev) or Redis (prod)
- Per-endpoint limiting
- Prevents signup/login spam

✅ **Webhooks**
- user.created
- user.updated
- user.deleted
- HMAC signature verification

✅ **Legal Compliance**
- GDPR ✅ (right to access, delete, portability)
- CCPA ✅ (California consumer rights)
- COPPA ✅ (children <13 protection)
- Privacy Policy + ToS + Safety Policy templates

✅ **Security**
- TLS 1.2+ encryption in transit
- AES-256 at rest
- Role-based access control
- Audit logging
- Secure password hashing (via OAuth)

---

## Quick Start

### 1. Install

```bash
pip install -r auth/requirements.txt
```

### 2. Configure

```bash
cp auth/.env.template .env
# Edit .env with OAuth credentials
```

### 3. Initialize Database

```bash
python3 auth/database.py
```

### 4. Run

```bash
python3 -m auth.main
# Listens on http://localhost:8000
```

### 5. Integrate

```tsx
import Signup from '@pbs/auth-sdk/Signup';

<Signup productName="Your Product" productId="your-id" />
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│         19 PBS Products                 │
│  (React, Next.js, Vue, etc.)            │
└────────────┬────────────────────────────┘
             │ OAuth signup/login
             ▼
┌─────────────────────────────────────────┐
│    PBS Auth Service (FastAPI)           │
│  ├─ /auth/signup      (POST)            │
│  ├─ /auth/login       (POST)            │
│  ├─ /auth/refresh     (POST)            │
│  ├─ /auth/logout      (POST)            │
│  ├─ /auth/me          (GET/PUT)         │
│  └─ /auth/delete-account (POST)        │
└────────────┬────────────────────────────┘
             │ JWT token (universal)
             ▼
┌─────────────────────────────────────────┐
│     Supabase PostgreSQL Database        │
│  ├─ users            (name, email)      │
│  ├─ oauth_connections (provider links)  │
│  └─ sessions          (refresh tokens)  │
└─────────────────────────────────────────┘
```

---

## API Endpoints

### Authentication

#### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "provider": "google",
  "provider_user_id": "google_123",
  "accept_privacy_policy": true,
  "accept_terms_of_service": true,
  "accept_safety_policy": true
}

Response:
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "tier": "free",
    "credits": 0
  }
}
```

#### Log In
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "provider": "google",
  "provider_user_id": "google_123"
}

Response: TokenResponse (same as signup)
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGci..."
}

Response: TokenResponse
```

#### Log Out
```http
POST /auth/logout
Authorization: Bearer {access_token}

Response:
{
  "status": "logged_out"
}
```

### Profile

#### Get Current User
```http
GET /auth/me
Authorization: Bearer {access_token}

Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://...",
  "tier": "free",
  "credits": 0,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Update Profile
```http
PUT /auth/me
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Jane Doe",
  "avatar_url": "https://..."
}

Response: UserResponse
```

#### Delete Account
```http
POST /auth/delete-account
Authorization: Bearer {access_token}

Response:
{
  "status": "account_deleted"
}
```

---

## Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pbs_auth

# JWT
JWT_SECRET_KEY=your-secret-key-here

# OAuth Providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://api.pbs.local/auth/callback/google

APPLE_CLIENT_ID=...
APPLE_TEAM_ID=...
APPLE_KEY_ID=...
APPLE_PRIVATE_KEY=...
APPLE_REDIRECT_URI=https://api.pbs.local/auth/callback/apple

DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_REDIRECT_URI=https://api.pbs.local/auth/callback/discord

FORTNITE_CLIENT_ID=...
FORTNITE_CLIENT_SECRET=...
FORTNITE_REDIRECT_URI=https://api.pbs.local/auth/callback/fortnite

# CORS
CORS_ORIGINS=http://localhost:3000,https://pbs.local

# Webhooks
WEBHOOK_SECRET=your-webhook-secret
WEBHOOK_USER_CREATED=https://...
WEBHOOK_USER_UPDATED=https://...
WEBHOOK_USER_DELETED=https://...

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

---

## Frontend Integration

### React Component

```tsx
import Signup from '@pbs/auth-sdk/Signup';
import Login from '@pbs/auth-sdk/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup productName="My Product" />} />
        <Route path="/login" element={<Login productName="My Product" />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
```

### Context Hook

```tsx
import { useAuth } from '@pbs/auth-sdk/useAuth';

function Dashboard() {
  const { user, token, logout } = useAuth();

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Route

```tsx
import { ProtectedRoute } from '@pbs/auth-sdk/ProtectedRoute';

<Route 
  path="/dashboard" 
  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
/>
```

---

## Database Schema

### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(2048),
  tier VARCHAR(50) DEFAULT 'free',
  credits INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP  -- soft delete
);
```

### oauth_connections

```sql
CREATE TABLE oauth_connections (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  provider_email VARCHAR(255),
  created_at TIMESTAMP NOT NULL
);
```

### sessions

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  refresh_token VARCHAR(500) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL
);
```

---

## JWT Token Format

### Access Token

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "tier": "free",
  "type": "access",
  "iat": 1704067200,
  "exp": 1704068100
}
```

**Expires:** 15 minutes

### Refresh Token

```json
{
  "sub": "user-uuid",
  "type": "refresh",
  "iat": 1704067200,
  "exp": 1704672000
}
```

**Expires:** 7 days

---

## Legal Documentation

All products include:

1. **Privacy Policy** (`/docs/PRIVACY_POLICY.md`)
   - GDPR compliant
   - Data collection practices
   - User rights (access, delete, portability)

2. **Terms of Service** (`/docs/TERMS_OF_SERVICE.md`)
   - Acceptable use
   - Limitation of liability
   - Dispute resolution

3. **Safety Policy** (`/docs/SAFETY_POLICY.md`)
   - Prohibited content
   - Reporting mechanism
   - Moderation process

4. **Age Verification** (`/docs/AGE_VERIFICATION.md`)
   - COPPA compliance
   - Parental consent
   - 18+ verification

---

## Security

### Encryption

- **In Transit**: TLS 1.2+ (all endpoints)
- **At Rest**: AES-256 (database)
- **JWT**: HMAC-SHA256

### Access Control

- Role-based access control (RBAC)
- Principle of least privilege
- API key rotation
- Session invalidation

### Monitoring

- 24/7 uptime monitoring
- Failed login attempt logging
- Rate limit violations
- Webhook failure alerts

### Compliance

- SOC 2 Type II audits (if applicable)
- Regular penetration testing
- Dependency scanning
- GDPR/CCPA/COPPA compliance checks

---

## Testing

### Unit Tests

```bash
pytest auth/tests/ -v
```

### Integration Tests

```bash
# Start service
python3 -m auth.main &

# Run tests
pytest auth/tests/integration/ -v
```

### Load Testing

```bash
# Test rate limiting
ab -n 10000 -c 100 http://localhost:8000/health
```

---

## Deployment

### Docker

```dockerfile
FROM python:3.11

WORKDIR /app
COPY auth/requirements.txt .
RUN pip install -r requirements.txt

COPY auth .
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  auth:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/pbs_auth
      JWT_SECRET_KEY: your-secret-key
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: pbs_auth
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pbs-auth
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pbs-auth
  template:
    metadata:
      labels:
        app: pbs-auth
    spec:
      containers:
      - name: pbs-auth
        image: pbs-auth:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: pbs-secrets
              key: database-url
```

---

## Monitoring & Logging

### Prometheus Metrics

```python
from prometheus_client import Counter, Histogram

signup_counter = Counter('auth_signups_total', 'Total signups')
login_histogram = Histogram('auth_login_duration_seconds', 'Login duration')
```

### Structured Logging

```python
import logging
import json

logger = logging.getLogger(__name__)
logger.info(json.dumps({
  "event": "user_signup",
  "user_id": user.id,
  "provider": "google",
  "timestamp": datetime.now().isoformat()
}))
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Check `CORS_ORIGINS` in .env |
| OAuth failures | Verify redirect URI matches provider settings |
| Token expiration | Use refresh endpoint to get new token |
| Database connection | Check `DATABASE_URL`, ensure DB is running |
| Rate limit 429 | Wait before retrying signup/login |

---

## Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open Pull Request

---

## Roadmap

- [ ] Multi-factor authentication (MFA)
- [ ] Social login (GitHub, Twitter)
- [ ] Passwordless authentication
- [ ] Advanced analytics dashboard
- [ ] Enterprise SSO (SAML)
- [ ] API key management

---

## License

MIT License - see LICENSE file

---

## Support

- **Docs**: [AUTH_SETUP.md](./docs/AUTH_SETUP.md)
- **Compliance**: [LEGAL_COMPLIANCE.md](./docs/LEGAL_COMPLIANCE.md)
- **Email**: support@pbs.local

---

**Version:** 1.0.0
**Last Updated:** 2024-01-01
**Status:** Production Ready ✅
