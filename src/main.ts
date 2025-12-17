import app from "./app";
import { keepAliveService } from "./services/keepAlive";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server is running on ${PORT}`);
    
    // Start keep-alive service to prevent server from spinning down
    keepAliveService.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    keepAliveService.stop();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    keepAliveService.stop();
    process.exit(0);
});