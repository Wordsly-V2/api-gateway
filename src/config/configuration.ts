export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10) ?? 3000,
  authService: {
    host: process.env.AUTH_SERVICE_HOST ?? 'auth-service',
    port: parseInt(process.env.AUTH_SERVICE_TCP_PORT ?? '3002', 10) ?? 3002,
  },
});
