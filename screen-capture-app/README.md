# Screen Capture Test App

User and admin flows are **separate**:

| Role | Login URL | Dashboard | What they do |
|------|-----------|-----------|--------------|
| **User** | http://localhost:5173/login | `/user` | Capture & upload screenshots |
| **Admin** | http://localhost:5173/admin/login | `/admin` | Review all user screenshots |

## Test credentials

| Role | Username | Password |
|------|----------|----------|
| User | `user` | `user123` |
| User | `demo` | `demo123` |
| Admin | `admin` | `admin123` |

## Quick start

```bash
# Terminal 1
cd screen-capture-app && npm run server

# Terminal 2
cd screen-capture-app && npm run client
```

## Flow

1. User logs in at `/login` → captures screen at `/user`
2. Each screenshot is saved as `{username}-{timestamp}.png` with metadata in `server/screenshots/manifest.json`
3. Admin logs in at `/admin/login` → views all captures at `/admin`
4. Admin can filter by user and preview images

## API

| Endpoint | Who | Description |
|----------|-----|-------------|
| `POST /api/login/user` | Public | User login |
| `POST /api/login/admin` | Public | Admin login |
| `POST /api/upload` | User token | Upload screenshot |
| `GET /api/screenshots` | Admin token | List all screenshots |
| `GET /api/screenshots/users` | Admin token | List usernames with uploads |
