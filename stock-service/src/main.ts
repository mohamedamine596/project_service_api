import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  // Create HTTP app first
  const app = await NestFactory.create(AppModule);

  // Then connect gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'stock',
      protoPath: join(process.cwd(), 'src', 'stock.proto'),
      url: 'localhost:5000',
    },
  });

  // Start both HTTP and gRPC
  await app.startAllMicroservices();
  await app.listen(3003);
  console.log('stock-service running on HTTP port 3003 and gRPC port 5000');
}
bootstrap();