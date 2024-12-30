import dotenv from 'dotenv';
import connectDB from './db/index.js';
import app from './app.js';
import { WebSocketServer } from 'ws'; 
dotenv.config({
    path: './.env'
});

// Connect to MongoDB
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 8000;

        // Start HTTP server
        const server = app.listen(PORT, () => {
            console.log(`Server is running at port ${PORT}`);
        });

        // Attach WebSocket server to the HTTP server
        const wss = new WebSocketServer({ server });

        // Handle WebSocket connections
        wss.on('connection', (ws) => {
            console.log('A new client connected');

            // Listen for messages from the client
            ws.on('message', (message) => {
                console.log(`Received: ${message}`);

                // Echo the message back to the client
                ws.send(`Server: ${message}`);
            });

            // Handle client disconnection
            ws.on('close', () => {
                console.log('Client disconnected');
            });
        });
    })
    .catch((err) => {
        console.log('MongoDB connection failed', err);
    });
