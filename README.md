# DataTech Call Logger

A web application for WAI DataTech staff to efficiently log and track support call details with comprehensive reporting capabilities.

## Overview

The DataTech Call Logger is an internal tool designed to streamline the process of logging support calls while providing real-time tracking and detailed reporting. The application features a modern React frontend with a robust Spring Boot backend, deployed using Docker containers.

## Features

### Call Management
- **Quick Call Logging**: Start and end calls with timestamp capture
- **Real-time Duration Tracking**: Live timer display during active calls
- **Searchable Dropdowns**: Intelligent task and subject selection with predictive search
- **Call Details**: Capture inbound/outbound status, agent information, and detailed comments
- **Call History**: View and manage historical call records with filtering

### User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Sidebar Navigation**: Quick access to active calls and recent calls
- **Live Updates**: Real-time call status and duration display
- **Searchable Selects**: Type-ahead filtering for task and subject selection
- **Visual Feedback**: Color-coded call states and status indicators

### Reporting
- **Call History View**: Paginated call records with sorting and filtering
- **Date Range Filtering**: Filter calls by specific time periods
- **Export Capabilities**: Generate reports for analysis (planned)
- **User-specific Data**: Each user sees only their own call records

### Authentication
- **User Session Management**: Simple authentication system
- **Persistent Sessions**: Maintains user state across browser sessions
- **Role-based Access**: Planned Azure AD integration with role-based permissions

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and building
- **React Router** for navigation
- **React Hook Form** for form management
- **React Query** for server state management
- **Axios** for API communication

### Backend  
- **Spring Boot 3.1.5** with Java 17
- **Spring Security** with OAuth2 Resource Server
- **Spring Data JPA** with Hibernate
- **PostgreSQL** database
- **Flyway** for database migrations
- **Maven** for dependency management

### Infrastructure
- **Docker Compose** for development environment
- **PostgreSQL 15** containerized database
- **Nginx** for production reverse proxy
- **Linux server** deployment ready

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd call-logger
   ```

2. **Start the development environment:**
   ```bash
   docker-compose up
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Database: localhost:5432

4. **Initial Setup:**
   - The application will prompt for user credentials on first access
   - Database migrations run automatically on startup

## Project Structure

```
call-logger/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── forms/        # Form components (SearchableSelect)
│   │   │   ├── layout/       # Layout components (Sidebar, Header)
│   │   │   └── ui/           # UI primitives (Card, LoadingSpinner)
│   │   ├── pages/            # Route components
│   │   │   ├── ActiveCall.tsx
│   │   │   ├── CallHistory.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── EditCall.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── StartCall.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   ├── contexts/         # React contexts (UserContext)
│   │   ├── api/              # API client functions
│   │   ├── types/            # TypeScript type definitions
│   │   └── lib/              # Utility libraries
│   ├── package.json
│   └── Dockerfile
├── api/                      # Spring Boot backend
│   ├── src/main/java/com/wai/callform/
│   │   ├── controller/       # REST endpoints
│   │   ├── service/          # Business logic
│   │   ├── repository/       # Data access layer
│   │   ├── entity/           # JPA entities
│   │   ├── dto/              # Data transfer objects
│   │   ├── config/           # Configuration classes
│   │   └── security/         # Security configuration
│   ├── src/main/resources/
│   │   ├── db/migration/     # Flyway database migrations
│   │   └── application.yml   # Application configuration
│   ├── pom.xml
│   └── Dockerfile
├── docker-compose.yml        # Development environment
├── docker-compose.prod.yml   # Production environment
└── README.md
```

## Database Schema

### Core Entities

**call_entries**
- Primary call tracking table
- Captures start/end times, duration, user information
- Links to reference tables for categorization

**tasks** and **subjects**
- Reference tables for searchable dropdown data
- Hierarchical structure with parent-child relationships
- Active/inactive status management

**users** (planned)
- User profile management
- Role assignments for access control

### Key Relationships
- Each call entry belongs to a user (datatech)
- Calls can be categorized with tasks and subjects
- Hierarchical task management with parent-child structures

## API Endpoints

### Call Management
- `POST /api/calls/start` - Start a new call
- `PUT /api/calls/{id}/end` - End an active call  
- `PUT /api/calls/{id}` - Update call details
- `GET /api/calls/{id}` - Get call by ID
- `GET /api/calls/user/{email}/active` - Get user's active call
- `GET /api/calls/filtered` - Get calls with pagination and filtering

### Reference Data
- `GET /api/tasks` - Get available tasks for dropdown
- `GET /api/subjects` - Get available subjects for dropdown
- `GET /api/users` - Get user list (admin only)

### Health & Status
- `GET /actuator/health` - Application health check
- `GET /actuator/info` - Application information

## Development

### Frontend Development
```bash
cd frontend
npm install           # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Backend Development  
```bash
cd api
./mvnw clean install    # Build the project
./mvnw spring-boot:run  # Run locally
./mvnw test            # Run tests
./mvnw flyway:migrate  # Run database migrations
```

### Docker Development
```bash
# Start all services
docker-compose up

# View logs
docker-compose logs -f api
docker-compose logs -f frontend

# Rebuild after changes
docker-compose build
docker-compose up --build

# Stop services
docker-compose down

# Fresh start (removes volumes)
docker-compose down -v
docker-compose up --build
```

## Key Features Deep Dive

### Searchable Dropdowns
The application features intelligent searchable dropdowns for task and subject selection:
- Real-time filtering as you type
- Score-based ranking of matches (exact > prefix > contains > fuzzy)
- Keyboard navigation (Tab/Enter to select)
- Visual highlighting of best matches
- Automatic focus management between fields

### Call State Management
- **Active Call Tracking**: Only one active call per user
- **Real-time Duration**: Live timer updates every second
- **Visual Indicators**: Color-coded headers and status badges
- **Sidebar Integration**: Quick access to active and recent calls
- **Auto-save**: Form changes saved automatically

### Data Architecture
The application follows a "smart backend, simple frontend" approach:
- All business logic resides in the Spring Boot backend
- Frontend consumes structured data from REST APIs
- Minimal client-side processing for optimal performance
- Comprehensive validation at the service layer

## Authentication & Security

### Current Implementation
- Simple localStorage-based session management
- User identification through email/name pairs
- Form-based authentication with session persistence

### Planned Azure AD Integration
- Enterprise-grade authentication using Microsoft accounts
- Domain restriction to @wostmann.com email addresses
- Role-based access control for Reports functionality
- JWT token validation and secure session management

## Deployment

### Production Configuration
The application is designed for containerized deployment on Linux servers:

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Update deployment
git pull
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
```bash
# Database
DB_USER=callform_svc
DB_PASSWORD=secure_password

# Azure AD (when implemented)
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id

# Application
SERVER_PORT=8080
VITE_API_URL=http://localhost:8080
```

### Health Monitoring
- **Application Health**: `/actuator/health` endpoint
- **Database Connectivity**: Included in health checks
- **Container Auto-restart**: Configured with `restart: unless-stopped`
- **Log Aggregation**: Structured logging for production monitoring

## Future Enhancements

### Planned Features
- **Azure AD Authentication**: Enterprise authentication with role-based access
- **3CX Integration**: Automatic call logging from phone system
- **Advanced Reporting**: Detailed analytics and export capabilities
- **Mobile App**: Native mobile application for field technicians
- **Real-time Notifications**: Alerts for important call events

### Technical Improvements
- **Performance Optimization**: Database query optimization and caching
- **API Documentation**: OpenAPI/Swagger documentation generation
- **Test Coverage**: Comprehensive unit and integration testing
- **Monitoring**: Application performance monitoring and alerting

## Support

This is an internal WAI project. For technical support or feature requests, contact the development team.

## License

Proprietary - WAI Internal Use Only