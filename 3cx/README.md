# 3CX Phone System Integration

This sideloading application runs on the SIP/local server to provide automatic call logging from the 3CX phone system into the DataTech Call Logger application.

## Features

- **CDR Polling**: Monitors 3CX Call Detail Records database for new calls
- **Automatic Call Logging**: Submits call data to main API with extension-to-email mapping
- **Call Group Monitoring**: Alerts when call groups have no assigned users during business hours
- **Retry Logic**: Exponential backoff for failed API calls
- **Structured Logging**: Winston-based logging with multiple levels
- **Health Monitoring**: HTTP endpoints for health checks and status

## Architecture

```
3CX Phone System
    ↓ (CDR Database)
CDR Poller (polls every 30s)
    ↓
Extension Mapper (extension → email)
    ↓
API Client (retry logic)
    ↓
DataTech Call Logger API
```

## Prerequisites

- Node.js 20+
- Access to 3CX CDR database (SQL Server/MySQL)
- Network access to DataTech Call Logger API

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env` and update values:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your 3CX database credentials and API URL

3. Update `config/3cx-config.yml` with:
   - Business hours for your timezone
   - Call groups to monitor
   - Extension-to-email mappings

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test

# Type checking
npm run type-check
```

## Production Deployment

### Docker

```bash
# Build image
docker build -t 3cx-integration .

# Run container
docker run -d \
  --name 3cx-integration \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/logs:/app/logs \
  3cx-integration
```

### Docker Compose

Add to your main `docker-compose.yml`:

```yaml
services:
  3cx-integration:
    build: ./3cx
    container_name: 3cx-integration
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - CDR_DB_HOST=${CDR_DB_HOST}
      - CDR_DB_PORT=${CDR_DB_PORT}
      - CDR_DB_NAME=${CDR_DB_NAME}
      - CDR_DB_USER=${CDR_DB_USER}
      - CDR_DB_PASSWORD=${CDR_DB_PASSWORD}
      - API_BASE_URL=http://api:8080/api
    volumes:
      - ./3cx/config:/app/config
      - ./3cx/logs:/app/logs
    depends_on:
      - api
      - db
```

## HTTP Endpoints

### Health Check
```
GET /health
```
Returns application health status

### Status
```
GET /status
```
Returns detailed status including:
- Last processed CDR ID
- Business hours status
- Monitored call groups
- Uptime

### Manual Triggers (for testing)
```
POST /trigger/poll
```
Manually trigger CDR polling

```
POST /trigger/alerts
```
Manually trigger call group alert check

## Monitoring

### Logs

Logs are written to:
- Console (development)
- `logs/combined.log` (production)
- `logs/error.log` (errors only)

Log levels: DEBUG, INFO, WARN, ERROR

### Metrics to Monitor

- CDR processing rate (calls/hour)
- API call success rate
- Database connection health
- Alert generation frequency

## Troubleshooting

### Cannot connect to CDR database

1. Verify database credentials in `.env`
2. Check network connectivity to 3CX server
3. Ensure database user has read access to CallLog table

### API calls failing

1. Check `API_BASE_URL` in configuration
2. Verify API is running and accessible
3. Check logs for retry attempts and error messages

### No calls being processed

1. Verify CDR polling is running (check logs)
2. Check if calls exist in 3CX CallLog table
3. Verify extension mappings are correct

### Extensions not mapping to emails

1. Update `extension_mapping` in `config/3cx-config.yml`
2. Restart application to reload configuration

## 3CX CDR Schema

This application expects the following CDR schema (adjust as needed for your 3CX version):

```sql
CallLog table:
- Id (primary key)
- CallId
- StartTime
- EndTime
- Duration
- CallerNumber
- DestNumber
- Extension
- CallType (0=Inbound, 1=Outbound, 2=Internal)
- Answered
- HangupCause
```

If your 3CX CDR schema differs, update the query in `src/services/cdr-poller.ts`.

## License

ISC
