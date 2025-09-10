# DataTech Call Logger API

A Spring Boot REST API for tracking and managing DataTech support calls with hierarchical program management, categorization, and reporting capabilities.

## Overview

This API provides endpoints for:
- Starting, updating, and ending support calls
- Managing hierarchical program management data
- Categorizing calls with subjects and categories
- Generating reports and analytics
- Reference data management for dropdown populations

## Architecture

- **Spring Boot 3.1.5** with Java 17
- **PostgreSQL** database with Flyway migrations
- **Docker Compose** for development environment
- **JPA/Hibernate** for data persistence
- **"Dumb Frontend" approach** - All business logic in backend, frontend gets structured data

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Java 17+ (for local development)
- Maven (for local development)

### Setup

1. **Start the services:**
   ```bash
   cd api
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f api
   ```

3. **Access the API:**
   - Base URL: `http://localhost:9000`
   - Health check: `http://localhost:9000/actuator/health`
   
   **Note**: The API runs on port 8080 inside the Docker container, but is mapped to port 9000 on your host machine.

## Database Schema

The application uses a normalized schema with the following key entities:

- **call_entries** - Main call tracking table
- **program_management_items** - Hierarchical program management structure
- **category_items** - Call categories (Incident, Service Request, etc.)
- **subject_items** - Call subjects (Password Reset, Hardware Issue, etc.)
- **report_runs** - Async report execution tracking

## API Endpoints

### Call Management

#### Start a Call
```http
POST /api/calls/start
Content-Type: application/json

{
  "datatechName": "John Doe",
  "datatechEmail": "john.doe@company.com"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "datatechName": "John Doe",
  "datatechEmail": "john.doe@company.com",
  "startTime": "2025-09-10T17:52:02.168Z",
  "endTime": null,
  "inProgress": true,
  "completed": false,
  "durationMinutes": 0,
  "createdAt": "2025-09-10T17:52:02.245Z",
  "updatedAt": "2025-09-10T17:52:02.245Z"
}
```

#### End a Call
```http
PUT /api/calls/{callId}/end
```

#### Update Call Details
```http
PUT /api/calls/{callId}
Content-Type: application/json

{
  "comments": "Resolved password reset issue",
  "isInbound": true,
  "isAgent": false
}
```

#### Get Call by ID
```http
GET /api/calls/{callId}
```

#### Get User's Active Call
```http
GET /api/calls/user/{userEmail}/active
```

#### Get User's Call History
```http
GET /api/calls/user/{userEmail}?page=0&size=20&sort=startTime,desc
```

#### Get Calls with Filters
```http
GET /api/calls/filtered?userEmail=john@company.com&startDate=2025-09-01T00:00:00Z&endDate=2025-09-30T23:59:59Z
```

### Reference Data (for Frontend Dropdowns)

#### Program Management Hierarchy
```http
GET /api/reference/program-management/hierarchy
```

**Response:** Hierarchical structure with parent-child relationships
```json
[
  {
    "id": "11111111-1111-1111-1111-111111111111",
    "name": "IT Services",
    "parentId": null,
    "children": [
      {
        "id": "11111111-1111-1111-1111-111111111112",
        "name": "Help Desk",
        "parentId": "11111111-1111-1111-1111-111111111111",
        "hasChildren": false,
        "active": true
      }
    ],
    "hasChildren": true,
    "active": true
  }
]
```

#### All Program Management Items (Flat)
```http
GET /api/reference/program-management
```

#### Search Program Management
```http
GET /api/reference/program-management/search?query=IT
```

#### Categories
```http
GET /api/reference/categories
```

**Response:**
```json
[
  {
    "id": "c0000001-0000-0000-0000-000000000001",
    "name": "Incident Report",
    "active": true,
    "sortOrder": 10
  },
  {
    "id": "c0000001-0000-0000-0000-000000000002",
    "name": "Service Request",
    "active": true,
    "sortOrder": 20
  }
]
```

#### Subjects
```http
GET /api/reference/subjects
```

**Response:**
```json
[
  {
    "id": "b0000001-0000-0000-0000-000000000001",
    "name": "Password Reset",
    "active": true,
    "sortOrder": 10
  },
  {
    "id": "b0000001-0000-0000-0000-000000000002",
    "name": "Software Installation",
    "active": true,
    "sortOrder": 20
  }
]
```

### Reporting

#### Generate Live Report
```http
POST /api/reports/generate
Content-Type: application/json

{
  "reportType": "LIVE",
  "requestedBy": "admin@company.com",
  "userEmail": "john@company.com",
  "startDate": "2025-09-01T00:00:00Z",
  "endDate": "2025-09-30T23:59:59Z"
}
```

#### Queue Async Report
```http
POST /api/reports/queue
Content-Type: application/json

{
  "reportType": "DETAILED_EXPORT",
  "requestedBy": "admin@company.com",
  "startDate": "2025-09-01T00:00:00Z",
  "endDate": "2025-09-30T23:59:59Z"
}
```

#### Get Report Status
```http
GET /api/reports/{reportId}/status
```

#### Get User's Reports
```http
GET /api/reports/user/{userEmail}?page=0&size=10
```

## Data Model

### Call Entry Fields

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| datatechName | String | Name of the datatech handling the call |
| datatechEmail | String | Email of the datatech |
| startTime | OffsetDateTime | When the call started |
| endTime | OffsetDateTime | When the call ended (null if in progress) |
| isInbound | Boolean | Whether the call was inbound (default: false) |
| isAgent | Boolean | Whether caller was an agent (default: false) |
| programManagementParent | UUID | Parent program management item |
| programManagementChild | UUID | Child program management item |
| category | UUID | Call category reference |
| subject | UUID | Call subject reference |
| comments | Text | Free-form comments |
| createdAt | OffsetDateTime | Record creation timestamp |
| updatedAt | OffsetDateTime | Last update timestamp |

### Computed Fields

| Field | Description |
|-------|-------------|
| inProgress | `startTime != null && endTime == null` |
| completed | `startTime != null && endTime != null` |
| durationMinutes | Minutes between start and end time |

## Business Rules

1. **One Active Call Per User**: Users cannot start a new call while having an active call
2. **Hierarchical Program Management**: If a child program is selected, the parent must also be selected
3. **Required Fields**: datatechName and datatechEmail are required for starting calls
4. **Audit Trail**: All records automatically track created/updated timestamps

## Development

### Local Development (without Docker)

1. **Start PostgreSQL:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Run the application:**
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```

### Database Migrations

Flyway migrations are located in `src/main/resources/db/migration/`:
- `V1__` - Initial schema
- `V2__` - Reference data tables
- `V3__` - Sample data
- `V5__` - Call entries with relationships

### Testing Endpoints

**Using curl:**
```bash
# Start a call
curl -X POST "http://localhost:9000/api/calls/start" \
  -H "Content-Type: application/json" \
  -d '{"datatechName": "Test User", "datatechEmail": "test@example.com"}'

# Get reference data
curl "http://localhost:9000/api/reference/categories"

# Get program management hierarchy
curl "http://localhost:9000/api/reference/program-management/hierarchy"
```

**Using browser (GET endpoints only):**
- http://localhost:9000/api/reference/categories
- http://localhost:9000/api/reference/subjects
- http://localhost:9000/api/reference/program-management/hierarchy

## Configuration

### Application Properties

Key configuration in `application-dev.yml`:
- Database connection
- JPA/Hibernate settings
- Logging levels
- Security (disabled for development)

### Docker Configuration

- **API**: Internal port 8080, mapped to host port 9000, auto-restart on code changes
- **PostgreSQL**: Port 5432, persistent volume
- **Development**: Hot reload enabled

### Port Mapping

| Service | Internal Port | External Port | Access URL |
|---------|---------------|---------------|------------|
| API | 8080 | 9000 | http://localhost:9000 |
| PostgreSQL | 5432 | 5432 | localhost:5432 |
| Debug | 5005 | 5005 | Port 5005 (for IDE debugging) |

## Security

**Development Mode**: Security is disabled for ease of development
**Production**: Will require proper authentication/authorization

## Monitoring

### Health Endpoints
- **Primary Health Check**: `/actuator/health` - Comprehensive Spring Boot Actuator endpoint
  - Shows database connectivity status
  - Includes disk space and other system metrics
  - Configured with `show-details: always` for full diagnostic info
- **Available Actuator Endpoints**: `/actuator/health`, `/actuator/info`

### Logs
- **Application logs**: `docker-compose logs api`
- **Database logs**: `docker-compose logs postgres`

## Error Handling

The API returns appropriate HTTP status codes:
- `200 OK` - Successful operations
- `201 Created` - Resource created
- `400 Bad Request` - Validation errors
- `404 Not Found` - Resource not found
- `409 Conflict` - Business rule violations (e.g., active call exists)

## Future Enhancements

- [ ] Re-enable program management hierarchy validation
- [ ] Add comprehensive exception handling
- [ ] Implement authentication/authorization
- [ ] Add API documentation with Swagger/OpenAPI
- [ ] Implement actual file-based report generation
- [ ] Add metrics and monitoring
- [ ] Implement caching for reference data