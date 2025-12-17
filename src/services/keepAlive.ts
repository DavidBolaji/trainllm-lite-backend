/**
 * Keep-alive service to prevent server from spinning down on Render
 * Pings the health endpoint every 14 minutes (1 minute before the 15-minute idle timeout)
 */

interface KeepAliveConfig {
  enabled: boolean;
  intervalMinutes: number;
  healthEndpoint: string;
  serverUrl?: string;
}

class KeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private config: KeepAliveConfig;

  constructor(config: KeepAliveConfig) {
    this.config = config;
  }

  /**
   * Start the keep-alive service
   */
  start(): void {
    if (!this.config.enabled) {
      console.log('Keep-alive service is disabled');
      return;
    }

    if (this.intervalId) {
      console.log('Keep-alive service is already running');
      return;
    }

    const intervalMs = this.config.intervalMinutes * 60 * 1000;
    
    console.log(`Starting keep-alive service: pinging ${this.config.healthEndpoint} every ${this.config.intervalMinutes} minutes`);

    this.intervalId = setInterval(async () => {
      await this.ping();
    }, intervalMs);

    // Initial ping after 1 minute to ensure service is working
    setTimeout(async () => {
      await this.ping();
    }, 60000);
  }

  /**
   * Stop the keep-alive service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Keep-alive service stopped');
    }
  }

  /**
   * Ping the health endpoint
   */
  private async ping(): Promise<void> {
    try {
      const url = this.getHealthUrl();
      console.log(`Keep-alive ping: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'KeepAlive-Service/1.0',
        },
        // Set a reasonable timeout
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Keep-alive ping successful: ${JSON.stringify(data)}`);
      } else {
        console.warn(`Keep-alive ping failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Keep-alive ping error:', error);
      // Don't throw - we want the service to continue trying
    }
  }

  /**
   * Get the full health endpoint URL
   */
  private getHealthUrl(): string {
    if (this.config.serverUrl) {
      return `${this.config.serverUrl}${this.config.healthEndpoint}`;
    }

    // Try to determine the server URL from environment
    const port = process.env.PORT || 5000;
    const host = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
    
    return `${host}${this.config.healthEndpoint}`;
  }

  /**
   * Get service status
   */
  getStatus(): { running: boolean; config: KeepAliveConfig } {
    return {
      running: this.intervalId !== null,
      config: this.config,
    };
  }
}

// Create and export the keep-alive service instance
const keepAliveConfig: KeepAliveConfig = {
  enabled: process.env.NODE_ENV === 'production' || process.env.KEEP_ALIVE_ENABLED === 'true',
  intervalMinutes: parseInt(process.env.KEEP_ALIVE_INTERVAL_MINUTES || '14', 10),
  healthEndpoint: '/health',
  serverUrl: process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL,
};

export const keepAliveService = new KeepAliveService(keepAliveConfig);

// Export the class for testing
export { KeepAliveService };
export type { KeepAliveConfig };