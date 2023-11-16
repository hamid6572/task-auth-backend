import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    const token = client.handshake.headers.authorization;
    try {
      const decodedToken = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
        ignoreExpiration: true,
      });

      if (decodedToken) {
        const userId = decodedToken.userId;
        client.join(`user-${userId}`);
      }
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('comment')
  async handleComment(
    client: Socket,
    { commentId, postId }: { commentId: number; postId: number },
  ) {
    console.log('hello from handle comment');

    this.server.to(`post-${postId}`).emit('newComment', postId, commentId);
  }

  @SubscribeMessage('joinPostRoom')
  handleJoinPostRoom(client: Socket, postId: number) {
    console.log('hello from handle room');

    client.join(`post-${postId}`);
  }
}
