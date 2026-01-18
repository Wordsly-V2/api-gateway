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
  accessToken: string;
  refreshToken: string;
}
