import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  FromRequestFunction,
  Strategy,
  StrategyOptions,
} from 'passport-jwt';
import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken() as FromRequestFunction,
      ignoreExpiration: false,
      algorithms: ['RS256'],
      secretOrKey: configService.get('jwt.secret') as string,
    } as StrategyOptions);
  }

  validate(payload: JwtAuthPayload) {
    return {
      userLoginId: payload.userLoginId,
      jti: payload.jti,
    };
  }
}
