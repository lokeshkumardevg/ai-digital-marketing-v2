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

  handleConnection(client: Socket) {
    this.logger.log(`Client Connected: ${client.id}`);
    
    // Simulate server-side AI Events triggering randomly pushing Notifications to specific Client
    setTimeout(() => {
      client.emit('notification', {
        title: 'System Online',
        message: 'Secure WebSocket uplink established to AI Core.',
        type: 'success'
      });
    }, 2000);

    setTimeout(() => {
      client.emit('notification', {
        title: 'Weekly Report Ready',
        message: 'Your AI performance tracking for the past 7 days has been processed.',
        type: 'info'
      });
    }, 15000);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong', { message: 'Nexus AI API active' });
  }

  sendGlobalEvent(payload: any) {
    this.server.emit('notification', payload);
  }
}
