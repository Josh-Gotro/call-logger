# DataTech Call Form Application

An internal web application for WAI DataTech staff to log call details quickly and consistently, with comprehensive reporting capabilities.

## Features

- **Quick Call Logging**: Simple form interface for logging calls with minimal friction
- **Azure AD Integration**: Secure authentication using existing WAI credentials
- **Real-time Reports**: Live and async reporting options for individual and team metrics
- **Future-Ready**: Prepared for 3CX integration when SIP/local cutover happens

## Tech Stack

- **Frontend**: React (Vite) with TypeScript, MSAL.js for Azure AD auth
- **Backend**: Spring Boot with Spring Security, REST API
- **Database**: PostgreSQL with Flyway migrations
- **Deployment**: Docker containers on Linux servers
- **Authentication**: Azure AD / Entra ID (OIDC/JWT)

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git
- Azure AD app registration (for authentication)

### Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd call-logger
   ```

2. Copy environment template and configure:
   ```bash
   cp .env.example .env
   # Edit .env with your Azure AD credentials
   ```

3. Start the development environment:
   ```bash
   docker-compose up
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - API: http://localhost:8080
   - API Health: http://localhost:8080/api/health

## Development

See [DEVELOPMENT_CHECKLIST.md](DEVELOPMENT_CHECKLIST.md) for the complete development roadmap and current progress.

See [CLAUDE.md](CLAUDE.md) for AI assistant guidance and technical details.

## Project Structure

```
call-logger/
├── frontend/          # React frontend application
├── api/              # Spring Boot backend API
├── ops/              # Deployment configurations
│   ├── nginx/        # Reverse proxy configs
│   └── scripts/      # Deployment scripts
├── docker-compose.yml     # Development environment
└── docker-compose.prod.yml # Production environment
```

## API Endpoints

- `POST /api/calls/start` - Start a new call
- `PUT /api/calls/{id}/end` - End an active call
- `PUT /api/calls/{id}` - Update call details
- `GET /api/calls` - List calls for current user
- `POST /api/reports/live` - Generate live report
- `POST /api/reports/async` - Queue async report
- `GET /api/health` - Health check endpoint

## Deployment

For production deployment instructions, see the Deployment section in [CLAUDE.md](CLAUDE.md).

## Contributing

This is an internal WAI project.

## License

Proprietary - WAI Internal Use Only