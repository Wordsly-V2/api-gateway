export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10) ?? 3000,
  authService: {
    host: process.env.AUTH_SERVICE_HOST ?? 'auth-service',
    port: parseInt(process.env.AUTH_SERVICE_TCP_PORT ?? '3002', 10) ?? 3002,
  },
  googleOAuth: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
    defaultAvatarUrl:
      process.env.GOOGLE_DEFAULT_AVATAR_URL ??
      'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg',
  },
});
