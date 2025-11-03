// API route to handle Socket.IO connections on Vercel
import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types/socket';
import { Server as IOServer } from 'socket.io';

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('Starting Socket.IO server...');
    
    const io = new IOServer(res.socket.server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Setup socket handlers
    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle real-time market data
      socket.on('subscribe-market-data', (symbols: string[]) => {
        console.log(`Subscribing to market data for: ${symbols.join(', ')}`);
        // In a real implementation, you would establish real market data feeds here
        socket.join('market-data');
      });

      // Handle trading signals
      socket.on('subscribe-trading-signals', () => {
        socket.join('trading-signals');
      });

      // Handle portfolio updates
      socket.on('subscribe-portfolio', () => {
        socket.join('portfolio-updates');
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    res.socket.server.io = io;
  } else {
    // Socket.io server is already running
    console.log('Socket.IO server already running');
  }
  
  res.end();
}

// Type definition for the enhanced socket
export const config = {
  api: {
    bodyParser: false,
  },
};