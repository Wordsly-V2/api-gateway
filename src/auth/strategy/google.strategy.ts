import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { OAuthProfile, OAuthUser } from '../DTO/auth.DTO';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      clientID: configService.get('googleOAuth.clientId') as string,
      clientSecret: configService.get('googleOAuth.clientSecret') as string,
      callbackURL: configService.get('googleOAuth.redirectUri') as string,
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: OAuthProfile,
    done: VerifyCallback,
  ) {
    const { id, displayName, emails, photos, provider } = profile;

    const user: OAuthUser = {
      id,
      displayName,
      email: emails[0]?.value,
      picture: photos[0]?.value,
      provider: provider as OAuthUser['provider'],
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    done(null, user);
  }
}
