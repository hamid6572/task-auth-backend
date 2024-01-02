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
import redis from 'ioredis';
const channel = 'commentNotify';

@WebSocketGateway({ cors: true })
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly subscriber: redis;
  private readonly publisher: redis;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.subscriber = new redis(this.configService.get<string>('REDIS_URL'));
    this.publisher = new redis(this.configService.get<string>('REDIS_URL'));
  }
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    const token = client.handshake.headers.authorization;
    try {
      const decodedToken = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
        ignoreExpiration: true,
      });

      if (decodedToken) {
        const userId = decodedToken.id;
        client.join(`user-${userId}`);

        this.subscriber.subscribe(channel, err => {
          if (err) {
            this.subscriber.disconnect();
          } else {
            this.subscriber.on('message', (channel, message) => {
              console.log(
                `Received message from channel ${channel}: ${message}`,
              );
            });
          }
        });
      }
      console.log(`Client connected: ${client.id}`);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('comment')
  async handleComment(
    socket: Socket,
    { commentId, postId }: { commentId: number; postId: number },
  ) {
    const message = 'New comment added!';

    this.publisher.publish(channel, message, err => {
      if (err) {
        console.error('Error publishing message:', err);
      } else {
        console.log(`Message published to channel "${channel}": "${message}"`);
        socket.broadcast
          .to(`post-${postId}`)
          .emit('newCommentNotify', 'New comment added!', response => {
            console.log('comment delivered!', response);
          });
      }
    });

    this.server.to(`post-${postId}`).emit('newComment', postId, commentId);
  }

  @SubscribeMessage('joinPostRoom')
  handleJoinPostRoom(client: Socket, postId: number) {
    console.log('hello from handle room');

    client.join(`post-${postId}`);
  }
}
