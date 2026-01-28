export type OAuthUser = {
  id: string;
  displayName: string;
  email: string;
  picture: string;
  provider: 'google' | 'facebook';
};

export type OAuthProfile = {
  id: string;
  displayName: string;
  emails: { value: string }[];
  photos: { value: string }[];
  provider: string;
};

export type OAuthLoginServiceResponse = {
  userLoginId: string;
};

export type JwtAuthPayload = {
  exp?: number;
  iat?: number;
  iss?: string;
  sub?: string;
  aud?: string;
  nbf?: number;
  jti?: string;
} & Pick<OAuthLoginServiceResponse, 'userLoginId'>;

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};
