import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('AppGateway');
  private userSockets = new Map<string, string>();

  handleConnection(client: Socket) {
    this.logger.log(`Client Connected: ${client.id}`);

    const token = client.handshake.auth?.token;
    if (token) {
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const userId = payload.sub || payload.id;
        if (userId) {
          client.join(`user_${userId}`);
          this.userSockets.set(userId, client.id);
          this.logger.log(`User ${userId} joined room user_${userId}`);
        }
      } catch {
        // Ignore invalid token and keep connection alive.
      }
    }

    setTimeout(() => {
      client.emit('notification', {
        id: Date.now().toString(),
        title: 'System Online',
        message: 'Secure WebSocket uplink established to AI Core.',
        type: 'success',
        category: 'system',
        time: new Date().toISOString(),
        read: false,
      });
    }, 2000);

    setTimeout(() => {
      client.emit('notification', {
        id: (Date.now() + 1).toString(),
        title: 'Weekly Report Ready',
        message: 'Your AI performance tracking for the past 7 days has been processed.',
        type: 'info',
        category: 'analytics',
        time: new Date().toISOString(),
        read: false,
      });
    }, 15000);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected: ${client.id}`);
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong', { message: 'Nexus AI API active' });
  }

  sendGlobalEvent(payload: any) {
    this.server.emit('notification', payload);
  }

  sendToUser(userId: string, payload: any) {
    this.server.to(`user_${userId}`).emit('notification', payload);
  }
}
