import { NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { Server as IOServer } from 'socket.io';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: IOServer;
    };
  };
};