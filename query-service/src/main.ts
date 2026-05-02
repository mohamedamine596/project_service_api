import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3004);
  console.log('✅ query-service running on http://localhost:3004/graphql');
}
bootstrap();