import { env } from './config/env';
import { connectDB } from './config/database';
import { createApp } from './app';

const bootstrap = async () => {
  await connectDB();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
  });
};

bootstrap().catch((err) => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});
