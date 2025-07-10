import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileloggerService } from './filelogger/filelogger.service';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [AiModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    })
  ],
  controllers: [AppController],
  providers: [AppService, FileloggerService],
})
export class AppModule { }
