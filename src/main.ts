import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    cors: {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      optionsSuccessStatus: 204,
      allowedHeaders: '*'
    },
    rawBody: true
  });

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT);
}
bootstrap();
