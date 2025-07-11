import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log("In Nikhil Main Testc2");
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
