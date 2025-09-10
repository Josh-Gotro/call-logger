# Development Checklist - DataTech Call Form App

This checklist provides a step-by-step guide for building the DataTech Call Form application from scratch. Check off items as completed and add notes as needed.

## Phase 1: Project Foundation & Setup

### 1.0 Docker Environment Setup
- [ ] Install Docker and Docker Compose locally
- [ ] Create `docker-compose.yml` with services:
  - PostgreSQL (postgres:15-alpine)
  - API (Spring Boot with hot reload)
  - Frontend (Vite dev server)
- [ ] Create `.env.example` file with:
  ```
  DB_USER=callform
  DB_PASSWORD=localpassword
  AZURE_TENANT_ID=
  AZURE_CLIENT_ID=
  ```
- [ ] Test Docker setup: `docker-compose up`
- [ ] **Checkpoint**: All containers start and connect

### 1.1 Project Structure
- [ ] Create directory structure: `frontend/`, `api/`, `ops/`
- [ ] Initialize Git repository with `.gitignore` files
- [ ] Create README.md with project overview
- [ ] Create `docker-compose.yml` for development
- [ ] Create `docker-compose.prod.yml` for production
- [ ] Create `.env.example` with all required environment variables

### 1.2 Backend Setup (Spring Boot)
- [ ] Initialize Spring Boot project with Spring Initializr
  - Dependencies: Web, Security, Data JPA, PostgreSQL, Flyway, Validation, OAuth2 Resource Server
  - Java 17, Maven, JAR packaging
- [ ] Configure package structure:
  ```
  com.wai.callform/
  ├── controller/     # REST endpoints
  ├── service/        # Business logic
  ├── repository/     # Data access
  ├── entity/         # JPA entities
  ├── dto/            # Data transfer objects
  ├── config/         # Configuration classes
  ├── security/       # Security configuration
  └── exception/      # Custom exceptions
  ```
- [ ] Set up application profiles (dev, test, prod)
- [ ] Create `Dockerfile` for Spring Boot application
- [ ] Configure PostgreSQL connection for Docker environment
- [ ] **Checkpoint**: Spring Boot app starts successfully in Docker

### 1.3 Frontend Setup (React + Vite)
- [ ] Initialize Vite project with React and TypeScript template
- [ ] Install core dependencies:
  - `@azure/msal-browser` and `@azure/msal-react` for authentication
  - `react-router-dom` for routing
  - `axios` for API calls
  - `react-hook-form` for form management
  - `@tanstack/react-query` for server state
- [ ] Configure TypeScript with strict mode
- [ ] Set up ESLint and Prettier
- [ ] Create folder structure:
  ```
  src/
  ├── components/     # Reusable UI components
  ├── pages/          # Route pages
  ├── services/       # API services
  ├── hooks/          # Custom React hooks
  ├── types/          # TypeScript types
  ├── utils/          # Helper functions
  └── config/         # Configuration files
  ```
- [ ] Create `Dockerfile` for React application
- [ ] Configure proxy for API calls in development
- [ ] **Checkpoint**: Dev server runs in Docker, displays default page

## Phase 2: Database & Backend Core

### 2.1 Database Schema Design
- [ ] Create Flyway migration for core tables:
  ```sql
  -- V1__Create_call_entries_table.sql
  CREATE TABLE call_entries (
    id UUID PRIMARY KEY,
    datatech_name VARCHAR(255) NOT NULL,
    datatech_email VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    is_inbound VARCHAR(20),
    program_management VARCHAR(100),
    category VARCHAR(100),
    subject VARCHAR(100),
    is_agent VARCHAR(20),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  -- V2__Create_report_runs_table.sql
  CREATE TABLE report_runs (
    id UUID PRIMARY KEY,
    requested_by VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    parameters JSONB,
    result_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
  );
  ```
- [ ] Configure Flyway in Spring Boot
- [ ] Set up Flyway to run on container startup
- [ ] **Test**: Run migrations in Docker PostgreSQL container

### 2.2 Entity Models
- [ ] Create `CallEntry` entity with JPA annotations
- [ ] Create `ReportRun` entity
- [ ] Add validation annotations (@NotNull, @Size, etc.)
- [ ] Configure auditing (@CreatedDate, @LastModifiedDate)
- [ ] **Test**: Entities create tables correctly

### 2.3 Repository Layer
- [ ] Create `CallEntryRepository` extending JpaRepository
- [ ] Create `ReportRunRepository`
- [ ] Add custom query methods:
  - `findByDatatechEmail`
  - `findByDateRange`
  - `findByProgramManagement`
- [ ] **Test**: Write repository integration tests

### 2.4 Service Layer
- [ ] Create `CallEntryService` with business logic:
  - `startCall()`
  - `endCall()`
  - `updateCallDetails()`
  - `getCallsForUser()`
- [ ] Create `ReportService`:
  - `generateLiveReport()`
  - `queueAsyncReport()`
  - `getReportStatus()`
- [ ] Implement DTOs for request/response
- [ ] Add input validation
- [ ] **Test**: Write service unit tests with mocking

### 2.5 REST Controllers
- [ ] Create `CallEntryController`:
  - `POST /api/calls/start`
  - `PUT /api/calls/{id}/end`
  - `PUT /api/calls/{id}`
  - `GET /api/calls`
- [ ] Create `ReportController`:
  - `POST /api/reports/live`
  - `POST /api/reports/async`
  - `GET /api/reports/{id}/status`
- [ ] Add proper HTTP status codes
- [ ] Implement exception handling with @ControllerAdvice
- [ ] **Test**: Write controller tests with MockMvc

### 2.6 Authentication Setup
- [ ] Configure Spring Security for JWT validation
- [ ] Set up Azure AD integration:
  - Configure issuer URI
  - Set up JWT decoder
  - Configure audience validation
- [ ] Create `SecurityConfig` class
- [ ] Extract user info from JWT token
- [ ] **Test**: Validate tokens from Azure AD

## Phase 3: Frontend Foundation

### 3.1 Authentication Setup
- [ ] Configure MSAL for Azure AD:
  ```typescript
  const msalConfig = {
    auth: {
      clientId: process.env.VITE_AZURE_CLIENT_ID,
      authority: process.env.VITE_AZURE_AUTHORITY,
      redirectUri: window.location.origin
    }
  };
  ```
- [ ] Create `AuthProvider` component
- [ ] Implement login/logout flows
- [ ] Create `ProtectedRoute` component
- [ ] **Test**: Can login with Azure AD account

### 3.2 Routing Configuration
- [ ] Set up React Router with routes:
  - `/` - Home/Call form
  - `/reports` - Reports page
  - `/login` - Login page
- [ ] Implement route guards for authentication
- [ ] Add navigation component
- [ ] **Test**: Routes work and are protected

### 3.3 API Service Layer
- [ ] Create `apiClient` with axios and interceptors:
  - Add auth token to requests
  - Handle token refresh
  - Global error handling
- [ ] Create service modules:
  - `callService.ts`
  - `reportService.ts`
- [ ] Add TypeScript types for API responses
- [ ] **Test**: API calls include auth headers

### 3.4 State Management
- [ ] Set up React Query for server state
- [ ] Configure query client with defaults
- [ ] Create custom hooks:
  - `useCallEntry()`
  - `useReports()`
- [ ] Implement optimistic updates
- [ ] **Test**: Data fetching and caching works

## Phase 4: Feature Implementation

### 4.1 Call Entry Form UI
- [ ] Create form layout with two-panel design:
  - Left: Static image/branding
  - Right: Form fields
- [ ] Implement form components:
  - [ ] Start Call button (captures timestamp)
  - [ ] Three-way toggle component (yes/no state/no)
  - [ ] Dropdown components for:
    - Program Management
    - Category
    - Subject
  - [ ] Comments textarea
  - [ ] End Call button
- [ ] Display user name from Azure AD at top
- [ ] **Test**: Form renders correctly

### 4.2 Form Logic & Validation
- [ ] Implement react-hook-form for form management
- [ ] Add field validation rules
- [ ] Handle form submission:
  - Start call → POST to API
  - Update fields → PUT to API
  - End call → PUT to API
- [ ] Add loading states and error handling
- [ ] Implement auto-save functionality
- [ ] **Test**: Form submits and saves correctly

### 4.3 Reports Page
- [ ] Create reports dashboard layout
- [ ] Implement date range picker
- [ ] Add filter components:
  - User filter
  - Program filter
  - Category filter
- [ ] Create report table component
- [ ] Implement export functionality (CSV/Excel)
- [ ] **Test**: Reports display and filter correctly

### 4.4 Real-time Features
- [ ] Add live call duration display
- [ ] Implement form field animations
- [ ] Add success/error notifications
- [ ] Create loading skeletons
- [ ] **Test**: UI updates feel responsive

## Phase 5: Integration & Testing

### 5.1 Integration Testing
- [ ] Write API integration tests:
  - Full call entry flow
  - Report generation flow
  - Authentication flow
- [ ] Test database transactions
- [ ] Test error scenarios
- [ ] **Checkpoint**: All integration tests pass

### 5.2 End-to-End Testing
- [ ] Set up Cypress or Playwright
- [ ] Write E2E tests for critical paths:
  - [ ] Login flow
  - [ ] Complete call entry
  - [ ] Generate report
  - [ ] Logout flow
- [ ] Test on different browsers
- [ ] **Checkpoint**: E2E tests pass

### 5.3 Performance Testing
- [ ] Optimize database queries (add indexes)
- [ ] Implement pagination for reports
- [ ] Add caching where appropriate
- [ ] Minimize bundle size
- [ ] **Test**: Page load < 3 seconds

### 5.4 Security Review
- [ ] Validate all user inputs
- [ ] Check for SQL injection vulnerabilities
- [ ] Ensure proper CORS configuration
- [ ] Review authentication flow
- [ ] Test authorization (user can only see own data)
- [ ] **Checkpoint**: Security scan passes

## Phase 6: Deployment Preparation

### 6.1 Production Configuration
- [ ] Create production Spring profiles
- [ ] Optimize Dockerfiles for production:
  - Multi-stage builds for smaller images
  - Security scanning
  - Non-root user
- [ ] Create production `.env` template:
  ```
  DB_USER=callform_svc
  DB_PASSWORD=[secure]
  AZURE_TENANT_ID=[prod-tenant]
  AZURE_CLIENT_ID=[prod-client]
  ```
- [ ] Configure logging for containers
- [ ] Set up health checks in Docker Compose
- [ ] **Test**: Production containers run correctly

### 6.2 Build & Deployment Scripts
- [ ] Create Docker build scripts:
  ```bash
  # ops/scripts/build.sh
  #!/bin/bash
  docker-compose -f docker-compose.prod.yml build
  ```
- [ ] Create deployment scripts:
  ```bash
  # ops/scripts/deploy.sh
  #!/bin/bash
  git pull
  docker-compose -f docker-compose.prod.yml build
  docker-compose -f docker-compose.prod.yml up -d
  ```
- [ ] Configure nginx (containerized or host)
- [ ] Set up Docker container auto-restart policies
- [ ] Create backup scripts for PostgreSQL container
- [ ] **Test**: Scripts execute successfully

### 6.3 Documentation
- [ ] Write API documentation (OpenAPI/Swagger)
- [ ] Create user guide
- [ ] Document deployment process
- [ ] Write troubleshooting guide
- [ ] Update README with final details
- [ ] **Checkpoint**: Documentation complete

### 6.4 Pre-Production Testing
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Perform user acceptance testing
- [ ] Load testing with expected traffic
- [ ] **Checkpoint**: Staging deployment successful

### 6.5 Production Deployment
- [ ] Coordinate with IT for:
  - [ ] Linux server provisioning
  - [ ] Docker installation on server
  - [ ] DNS configuration
  - [ ] SSL certificates
  - [ ] Azure AD app registration
- [ ] Deploy with Docker:
  - [ ] Clone repository to server
  - [ ] Configure production `.env`
  - [ ] Run `docker-compose -f docker-compose.prod.yml up -d`
  - [ ] Verify all containers are healthy
- [ ] Run health checks
- [ ] Monitor container logs
- [ ] **Checkpoint**: Production deployment successful

## Phase 7: Post-Deployment

### 7.1 Monitoring & Maintenance
- [ ] Set up application monitoring
- [ ] Configure alerts for errors
- [ ] Implement log aggregation
- [ ] Create backup procedures
- [ ] Document support procedures

### 7.2 Future Enhancements (Backlog)
- [ ] 3CX integration planning
- [ ] Additional report types
- [ ] Bulk operations
- [ ] Mobile responsiveness improvements
- [ ] Advanced analytics dashboard

## Notes Section

Use this section to track important decisions, blockers, and learnings:

### Design Decisions
- 

### Technical Debt
- 

### Lessons Learned
- 

### Dependencies & Blockers
- 

---

## Quick Commands Reference

```bash
# Start development environment
docker-compose up
docker-compose up -d  # Run in background

# View logs
docker-compose logs -f api
docker-compose logs -f frontend

# Rebuild after code changes
docker-compose build api
docker-compose restart api

# Run tests
docker-compose exec api ./mvnw test
docker-compose exec frontend npm test

# Build for production
docker-compose -f docker-compose.prod.yml build

# Deploy to server
ssh server "cd /opt/callform && git pull && docker-compose -f docker-compose.prod.yml up -d --build"

# Database operations
docker-compose exec postgres psql -U callform -d callform
docker-compose exec api ./mvnw flyway:migrate

# Clean restart
docker-compose down -v  # Remove volumes too
docker-compose up --build
```

## Estimated Timeline

- **Phase 1**: 3-5 days
- **Phase 2**: 5-7 days  
- **Phase 3**: 3-5 days
- **Phase 4**: 5-7 days
- **Phase 5**: 3-4 days
- **Phase 6**: 2-3 days
- **Total**: 4-5 weeks for MVP

Remember to update this checklist as you progress and learn more about the requirements!