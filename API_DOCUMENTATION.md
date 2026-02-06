# Work Tracker API Documentation

Complete API reference for the Work Tracker backend system.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "fullName": "John Doe",
  "profileImageUrl": "https://example.com/avatar.jpg" // optional
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "profileImageUrl": "https://example.com/avatar.jpg"
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### Login

Authenticate and receive JWT tokens.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "profileImageUrl": "https://example.com/avatar.jpg",
      "lastLogin": "2026-02-06T12:00:00.000Z"
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### Refresh Token

Get new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

### Get Current User

Get authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "profileImageUrl": "https://example.com/avatar.jpg",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "lastLogin": "2026-02-06T12:00:00.000Z"
    }
  }
}
```

---

## Session Endpoints

### Punch In

Start a new work session.

**Endpoint:** `POST /sessions/punch-in`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "projectId": "project-uuid", // optional
  "notes": "Working on feature X" // optional
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Successfully punched in",
  "data": {
    "session": {
      "id": "session-uuid",
      "user_id": "user-uuid",
      "project_id": "project-uuid",
      "start_time": "2026-02-06T13:00:00.000Z",
      "end_time": null,
      "duration_minutes": null,
      "status": "active",
      "notes": "Working on feature X"
    }
  }
}
```

### Punch Out

End the active work session.

**Endpoint:** `POST /sessions/punch-out`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Successfully punched out",
  "data": {
    "session": {
      "id": "session-uuid",
      "user_id": "user-uuid",
      "project_id": "project-uuid",
      "start_time": "2026-02-06T13:00:00.000Z",
      "end_time": "2026-02-06T15:30:00.000Z",
      "duration_minutes": 150,
      "status": "completed",
      "notes": "Working on feature X"
    }
  }
}
```

### Get Current Session

Get the active work session.

**Endpoint:** `GET /sessions/current`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-uuid",
      "user_id": "user-uuid",
      "project_id": "project-uuid",
      "project_name": "Brand Identity Design",
      "project_color": "blue",
      "project_icon": "palette",
      "start_time": "2026-02-06T13:00:00.000Z",
      "current_duration_minutes": 45,
      "status": "active",
      "notes": "Working on feature X"
    },
    "isActive": true
  }
}
```

### Get Recent Sessions

Get recent completed sessions.

**Endpoint:** `GET /sessions/recent?limit=10`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `limit` (optional): Number of sessions to return (default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-uuid",
        "project_name": "UI Design System",
        "project_color": "blue",
        "project_icon": "palette",
        "start_time": "2026-02-06T09:00:00.000Z",
        "end_time": "2026-02-06T12:30:00.000Z",
        "duration_minutes": 210,
        "status": "completed"
      }
    ],
    "count": 1
  }
}
```

### Get Session History

Get session history with filters.

**Endpoint:** `GET /sessions/history`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `projectId` (optional): Filter by project UUID
- `limit` (optional): Max results (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sessions": [...],
    "count": 25,
    "filters": {
      "startDate": "2026-02-01",
      "endDate": "2026-02-06",
      "projectId": null
    }
  }
}
```

---

## Project Endpoints

### Get All Projects

Get all projects for the authenticated user.

**Endpoint:** `GET /projects`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `includeInactive` (optional): Include archived projects (default: false)
- `withStats` (optional): Include session statistics (default: false)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project-uuid",
        "user_id": "user-uuid",
        "name": "Brand Identity Design",
        "description": "Logo and brand guidelines",
        "color": "blue",
        "icon": "palette",
        "is_active": true,
        "created_at": "2026-01-15T00:00:00.000Z",
        "session_count": 15, // if withStats=true
        "total_minutes": 1200 // if withStats=true
      }
    ],
    "count": 1
  }
}
```

### Create Project

Create a new project.

**Endpoint:** `POST /projects`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description", // optional
  "color": "purple", // optional
  "icon": "code" // optional
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project": {
      "id": "project-uuid",
      "user_id": "user-uuid",
      "name": "New Project",
      "description": "Project description",
      "color": "purple",
      "icon": "code",
      "is_active": true,
      "created_at": "2026-02-06T13:00:00.000Z"
    }
  }
}
```

### Update Project

Update an existing project.

**Endpoint:** `PUT /projects/:id`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "Updated Project Name", // optional
  "description": "New description", // optional
  "color": "green", // optional
  "icon": "folder", // optional
  "is_active": false // optional
}
```

**Response:** `200 OK`

### Delete Project

Archive or permanently delete a project.

**Endpoint:** `DELETE /projects/:id?hard=false`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `hard` (optional): Permanently delete if true, otherwise archive (default: false)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Project archived"
}
```

---

## Statistics Endpoints

### Get Today's Total

Get total work time for today.

**Endpoint:** `GET /stats/today`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_minutes": 405,
    "formatted": "6h 45m",
    "session_count": 3,
    "has_active_session": false
  }
}
```

### Get Weekly Progress

Get progress toward weekly goal.

**Endpoint:** `GET /stats/weekly`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_hours": 32.5,
    "target_hours": 40,
    "percentage": 81,
    "remaining_hours": 7.5,
    "formatted": "32h / 40h"
  }
}
```

### Get Active Streak

Get consecutive days with work.

**Endpoint:** `GET /stats/streak`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "streak_days": 12,
    "formatted": "12 Days"
  }
}
```

### Get Dashboard Data

Get complete dashboard statistics.

**Endpoint:** `GET /stats/dashboard`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "today": {
      "total_minutes": 405,
      "hours": 6,
      "minutes": 45,
      "session_count": 3,
      "formatted": "6h 45m"
    },
    "weekly": {
      "total_hours": 32.5,
      "target_hours": 40,
      "percentage": 81,
      "remaining_hours": 7.5
    },
    "streak": {
      "days": 12,
      "formatted": "12 Days"
    },
    "active_session": {
      "id": "session-uuid",
      "project_name": "Brand Identity Design",
      "start_time": "2026-02-06T13:00:00.000Z",
      "current_duration_minutes": 45,
      "formatted_duration": "0h 45m"
    },
    "recent_sessions": [...]
  }
}
```

### Set Weekly Goal

Set or update weekly hour target.

**Endpoint:** `POST /stats/weekly-goal`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "targetHours": 40,
  "weekStartDate": "2026-02-03" // optional, defaults to current week
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Weekly goal updated successfully",
  "data": {
    "goal": {
      "id": "goal-uuid",
      "user_id": "user-uuid",
      "week_start_date": "2026-02-03",
      "target_hours": 40
    }
  }
}
```

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

## Rate Limiting

Currently no rate limiting is implemented. For production use, implement rate limiting middleware.

## Pagination

For endpoints returning lists, use `limit` and `offset` query parameters:
- `limit`: Maximum number of results (default varies by endpoint)
- `offset`: Number of results to skip (for pagination)
