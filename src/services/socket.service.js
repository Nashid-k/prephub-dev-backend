import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';

let io;
const connectedUsers = new Map(); // userId -> { socketId, userData }
const activeVisitors = new Set(); // track total active connections including guests

// Simple throttle implementation (broadcasts max once per 5 seconds)
let lastBroadcast = 0;
const BROADCAST_THROTTLE_MS = 5000;

const throttledBroadcastStats = () => {
    const now = Date.now();
    if (now - lastBroadcast < BROADCAST_THROTTLE_MS) return;
    lastBroadcast = now;
    broadcastStats();
};

export const initSocket = (server) => {
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.FRONTEND_URL
    ].filter(Boolean);

    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // 100x Upgrade: Redis Adapter for Scaling
    if (process.env.REDIS_URL) {
        try {
            const pubClient = new Redis(process.env.REDIS_URL);
            const subClient = pubClient.duplicate();

            io.adapter(createAdapter(pubClient, subClient));
            console.log('🚀 Socket.io Scale: Redis Adapter Active');
        } catch (e) {
            console.error('⚠️ Redis Adapter Init Failed:', e.message);
        }
    }

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.user = decoded;
            } catch (err) {
                // Token invalid, still allow connection as guest
                console.log('Socket auth failed, proceeding as guest');
            }
        }
        next();
    });

    io.on('connection', (socket) => {
        console.log(`🔌 New Connection: ${socket.id}`);
        activeVisitors.add(socket.id);

        // Handle authenticated users
        if (socket.user) {
            connectedUsers.set(socket.user.id, {
                socketId: socket.id,
                user: socket.user
            });
            console.log(`👤 User Verified: ${socket.user.email}`);

            // Join user-specific room for private notifications
            socket.join(`user:${socket.user.id}`);
        }

        // Throttled broadcast to prevent storm on rapid connects/disconnects
        throttledBroadcastStats();

        socket.on('disconnect', () => {
            console.log(`🔌 Disconnected: ${socket.id}`);
            activeVisitors.delete(socket.id);
            if (socket.user) {
                connectedUsers.delete(socket.user.id);
            }
            throttledBroadcastStats();
        });

        // Ping (Latency check)
        socket.on('ping', (cb) => {
            if (typeof cb === 'function') cb();
        });
    });

    return io;
};

const broadcastStats = () => {
    if (!io) return;

    io.emit('stats:update', {
        activeUsers: connectedUsers.size,
        totalVisitors: activeVisitors.size,
        timestamp: Date.now()
    });
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

// Utility to send notification to specific user
export const notifyUser = (userId, event, data) => {
    if (!io) return;
    io.to(`user:${userId}`).emit(event, data);
};

// Utility to broadcast to everyone
export const broadcast = (event, data) => {
    if (!io) return;
    io.emit(event, data);
};
