import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Jwt } from '../dto/args/jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'user') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: Jwt) {
    return {
      id: payload.id,
      firstName: payload.firstName,
    };
  }
}
