# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ IMPORTANT: Development Progress Tracking

**Always consult `DEVELOPMENT_CHECKLIST.md` first** to understand the current state of development and identify next tasks. This checklist contains:
- Step-by-step implementation plan organized in phases
- Checkboxes to track completed work
- Testing checkpoints at each stage
- Common patterns and best practices to follow
- Estimated timelines and dependencies

The checklist should be updated as tasks are completed or requirements change.

## Project Overview

DataTech Call Form App - An internal web application for logging and reporting call details at WAI. This is a greenfield project with a React frontend, Spring Boot backend, and PostgreSQL database, deployed using Docker containers on Linux servers.

## Project Structure

```
call-form/
├─ frontend/          # React (Vite) SPA with TypeScript + MSAL.js auth
├─ api/              # Spring Boot backend with REST endpoints
├─ ops/              # Deployment configs and scripts
│   ├─ nginx/        # Nginx configurations
│   └─ scripts/      # Deployment scripts
├─ docker-compose.yml     # Development environment
├─ docker-compose.prod.yml # Production environment
└─ .env.example      # Environment variables template
```

## Development Commands

### Frontend (React + Vite)
```bash
cd frontend
npm install              # Install dependencies
npm run dev             # Start dev server (localhost:5173)
npm run build           # Build for production
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking
npm test                # Run tests
```

### Backend (Spring Boot)
```bash
cd api
./mvnw clean install    # Build the project
./mvnw spring-boot:run  # Run locally (uses H2 for local dev)
./mvnw test            # Run tests
./mvnw flyway:migrate  # Run database migrations
./mvnw package         # Create JAR for deployment
```

### Docker Development
```bash
# Start all services (frontend, backend, postgres)
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f frontend

# Rebuild after changes
docker-compose build api
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

## Architecture

### Authentication Flow
- Frontend uses MSAL.js with PKCE flow for Azure AD/Entra ID authentication
- Backend validates JWT tokens via Spring Security OIDC
- User identity extracted from Entra ID token

### Database Schema
- Managed by Flyway migrations in `api/src/main/resources/db/migration/`
- Core tables: `call_entries`, `report_runs`
- Service accounts: `callform_svc` (runtime), `flyway_svc` (migrations)

### API Endpoints
- `/api/calls` - Call entry CRUD operations
- `/api/reports/live` - Real-time query reports
- `/api/reports/async` - Queued report generation
- `/api/health` - Health check endpoint

## Key Implementation Details

### Frontend Form Fields
- **Inbound/Outbound**: Three-way toggle (yes/no state/no)
- **Program Management**: Dropdown selection
- **Category**: Dropdown selection
- **Subject**: Dropdown selection
- **Is an agent**: Three-way toggle
- **Comments**: Free text area

### UI Layout
- Split view: Left side static image, right side form
- Start Call button at top (captures timestamp)
- End Call button at bottom (captures timestamp)
- User name from Entra ID displayed at top

### Environment Configuration
- Use `.env` files (not committed to repo)
- Required Entra ID config: Tenant ID, Client ID, Discovery URL
- Database connection strings for different environments

## Testing Approach

### Frontend Testing
- Unit tests with Jest/Vitest for components
- Integration tests for MSAL authentication flow
- E2E tests for critical user paths

### Backend Testing
- JUnit for unit tests
- MockMvc for controller tests
- Testcontainers for database integration tests

## Docker Deployment on Linux

### Prerequisites
```bash
# Install Docker and Docker Compose
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Nginx for reverse proxy (optional, can use containerized)
sudo apt install nginx
```

### Docker Compose Production Configuration
Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  api:
    build: ./api
    container_name: callform-api
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=postgres
      - DB_NAME=callform
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - AZURE_TENANT_ID=${AZURE_TENANT_ID}
      - AZURE_CLIENT_ID=${AZURE_CLIENT_ID}
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - callform-net

  frontend:
    build: ./frontend
    container_name: callform-frontend
    environment:
      - VITE_API_URL=https://calls.wai.local/api
      - VITE_AZURE_CLIENT_ID=${AZURE_CLIENT_ID}
    restart: unless-stopped
    networks:
      - callform-net

  nginx:
    image: nginx:alpine
    container_name: callform-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ops/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ops/nginx/certs:/etc/nginx/certs
    depends_on:
      - api
      - frontend
    restart: unless-stopped
    networks:
      - callform-net

  postgres:
    image: postgres:15-alpine
    container_name: callform-db
    environment:
      - POSTGRES_DB=callform
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - callform-net

volumes:
  postgres-data:

networks:
  callform-net:
    driver: bridge
```

### Container Management Commands
```bash
# Deploy production
cd /opt/callform
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart api

# Update deployment
git pull
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Backup database
docker exec callform-db pg_dump -U $DB_USER callform > backup.sql
```

### Nginx Configuration
Create `/etc/nginx/sites-available/callform`:
```nginx
server {
    listen 443 ssl;
    server_name calls.wai.local;
    
    ssl_certificate /etc/ssl/certs/calls.wai.local.crt;
    ssl_certificate_key /etc/ssl/private/calls.wai.local.key;
    
    # Frontend static files
    location / {
        root /var/www/callform;
        try_files $uri /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Environment Configuration
Create `.env` file (from `.env.example`):
```bash
# Database
DB_USER=callform_svc
DB_PASSWORD=secure_password_here

# Azure AD
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id

# API
SPRING_PROFILES_ACTIVE=prod
API_PORT=8080

# Frontend
VITE_API_URL=https://calls.wai.local/api
VITE_AZURE_CLIENT_ID=your-client-id
```

## Deployment Steps

1. **Prepare server**:
   ```bash
   # Clone repository
   cd /opt
   git clone <repository-url> callform
   cd callform
   
   # Create environment file
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Build and start containers**:
   ```bash
   # Build images
   docker-compose -f docker-compose.prod.yml build
   
   # Start services
   docker-compose -f docker-compose.prod.yml up -d
   
   # Check status
   docker-compose -f docker-compose.prod.yml ps
   ```

3. **Run database migrations**:
   ```bash
   # Migrations run automatically on container start
   # Or manually:
   docker exec callform-api ./mvnw flyway:migrate
   ```

4. **Configure DNS and SSL** (if using external Nginx):
   ```bash
   # Add DNS record pointing to server
   # Install SSL certificate
   sudo ln -s /opt/callform/ops/nginx/callform.conf /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

5. **Verify deployment**:
   ```bash
   # Check container health
   docker ps
   
   # View logs
   docker-compose -f docker-compose.prod.yml logs
   
   # Test endpoints
   curl http://localhost:8080/api/health
   curl https://calls.wai.local/api/health
   ```

6. **Set up automatic restarts**:
   ```bash
   # Docker containers configured with restart: unless-stopped
   # They will auto-start on system reboot
   ```

## Future 3CX Integration
- Separate sidecar service on 3CX Anchorage host
- Posts call events to API for form pre-filling
- Currently out of scope for v1