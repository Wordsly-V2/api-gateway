export interface IOAuthUserDTO {
  id: string;
  displayName: string;
  email: string;
  picture: string;
  provider: 'google' | 'facebook';
}

export type GGProfileDTO = {
  id: string;
  displayName: string;
  emails: { value: string }[];
  photos: { value: string }[];
  provider: string;
};

export interface IOAuthLoginResponseDTO {
  userLoginId: string;
}

export type JwtAuthPayload = {
  userLoginId: string;
  exp?: number;
  iat?: number;
  iss?: string;
  sub?: string;
  aud?: string;
  nbf?: number;
  jti?: string;
};
