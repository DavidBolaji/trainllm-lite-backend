# Keep-Alive Service

The keep-alive service prevents the Render server from spinning down due to inactivity by automatically pinging the health endpoint at regular intervals.

## Configuration

The service is configured via environment variables:

```env
# Enable/disable the keep-alive service
KEEP_ALIVE_ENABLED=true

# Interval in minutes (default: 14 minutes)
KEEP_ALIVE_INTERVAL_MINUTES=14

# Server URL (automatically detected on Render)
SERVER_URL=https://your-app.onrender.com
```

## How It Works

1. **Automatic Detection**: The service automatically detects if it's running in production (Render) or development
2. **Self-Ping**: Every 14 minutes, it makes an HTTP GET request to `/health`
3. **Render Integration**: Uses `RENDER_EXTERNAL_URL` environment variable when available
4. **Graceful Shutdown**: Properly stops when the server shuts down

## Endpoints

### Health Check
```
GET /health
```
Returns server status with timestamp and uptime.

### Keep-Alive Status
```
GET /keep-alive/status
```
Returns keep-alive service status and configuration.

## Timing

- **Render Free Tier**: Spins down after 15 minutes of inactivity
- **Keep-Alive Interval**: 14 minutes (1 minute safety margin)
- **Initial Ping**: 1 minute after server start

## Logs

The service logs all ping attempts:

```
Starting keep-alive service: pinging /health every 14 minutes
Keep-alive ping: https://your-app.onrender.com/health
Keep-alive ping successful: {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

## Development

In development mode, the service is disabled by default. To enable:

```env
KEEP_ALIVE_ENABLED=true
```

## Production Deployment

On Render, the service automatically:
1. Enables itself in production
2. Uses the `RENDER_EXTERNAL_URL` environment variable
3. Starts pinging after the server is ready

No additional configuration is required for Render deployment.