# Work Tracker Backend API

A comprehensive REST API backend for the Work Tracker Dashboard application. Built with Node.js, Express, and PostgreSQL, this API provides complete time tracking functionality including user authentication, work sessions, project management, and statistics.

## Features

- 🔐 **JWT Authentication** - Secure user registration and login
- ⏱️ **Time Tracking** - Punch in/out functionality with session management
- 📊 **Statistics** - Daily totals, weekly progress, and work streaks
- 📁 **Project Management** - Organize work sessions by projects
- 🔄 **Real-time Duration** - Calculate active session duration
- 📈 **Dashboard Data** - Aggregated statistics for dashboard display

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd work-tracker-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your settings:
   - Database credentials
   - JWT secrets (use strong random strings in production)
   - Server port
   - CORS origin

4. **Create PostgreSQL database**
   ```bash
   createdb work_tracker
   ```
   
   Or using psql:
   ```sql
   CREATE DATABASE work_tracker;
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| POST | `/refresh` | Refresh JWT token | No |
| GET | `/me` | Get current user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |

### Sessions (`/api/sessions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/punch-in` | Start work session | Yes |
| POST | `/punch-out` | End active session | Yes |
| POST | `/cancel` | Cancel active session | Yes |
| GET | `/current` | Get active session | Yes |
| GET | `/recent` | Get recent sessions | Yes |
| GET | `/history` | Get session history (with filters) | Yes |
| GET | `/:id` | Get session by ID | Yes |
| PUT | `/:id/notes` | Update session notes | Yes |

### Projects (`/api/projects`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all projects | Yes |
| GET | `/:id` | Get project by ID | Yes |
| POST | `/` | Create new project | Yes |
| PUT | `/:id` | Update project | Yes |
| DELETE | `/:id` | Delete/archive project | Yes |

### Statistics (`/api/stats`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/today` | Get today's total hours | Yes |
| GET | `/weekly` | Get weekly progress | Yes |
| GET | `/streak` | Get active work streak | Yes |
| GET | `/dashboard` | Get complete dashboard data | Yes |
| GET | `/range` | Get stats for date range | Yes |
| POST | `/weekly-goal` | Set weekly hour goal | Yes |

## Example Usage

### Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@example.com",
    "password": "securepassword",
    "fullName": "Alex Johnson"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@example.com",
    "password": "securepassword"
  }'
```

### Punch In
```bash
curl -X POST http://localhost:3000/api/sessions/punch-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "projectId": "project-uuid-here",
    "notes": "Working on feature X"
  }'
```

### Get Dashboard Data
```bash
curl -X GET http://localhost:3000/api/stats/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema

### Tables

- **users** - User accounts and authentication
- **projects** - Work projects/categories
- **work_sessions** - Time tracking sessions
- **daily_stats** - Aggregated daily statistics
- **weekly_goals** - User weekly hour targets

See `migrations/001_initial_schema.sql` for complete schema details.

## Project Structure

```
work-tracker-backend/
├── config/
│   └── database.js          # PostgreSQL connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── sessionController.js # Session management
│   ├── projectController.js # Project CRUD
│   └── statisticsController.js # Stats calculations
├── middleware/
│   ├── auth.js             # JWT authentication
│   ├── validation.js       # Request validation
│   └── errorHandler.js     # Error handling
├── migrations/
│   ├── 001_initial_schema.sql # Database schema
│   └── migrate.js          # Migration runner
├── models/
│   ├── User.js             # User model
│   ├── Project.js          # Project model
│   ├── WorkSession.js      # Session model
│   └── Statistics.js       # Statistics model
├── routes/
│   ├── auth.js             # Auth routes
│   ├── sessions.js         # Session routes
│   ├── projects.js         # Project routes
│   └── statistics.js       # Stats routes
├── utils/
│   └── timeCalculations.js # Time utilities
├── .env.example            # Environment template
├── .gitignore
├── package.json
└── server.js               # Main entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | work_tracker |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT expiration | 7d |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_REFRESH_EXPIRE` | Refresh token expiration | 30d |
| `CORS_ORIGIN` | Allowed CORS origin | * |

## Security Considerations

- Always use strong, random JWT secrets in production
- Use HTTPS in production
- Configure CORS_ORIGIN to your frontend domain
- Regularly update dependencies
- Use environment variables for sensitive data
- Implement rate limiting for production use

## Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Run migrations
npm run migrate
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure proper CORS origin
4. Set up PostgreSQL with proper credentials
5. Use a process manager (PM2, systemd)
6. Set up reverse proxy (nginx)
7. Enable HTTPS

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
