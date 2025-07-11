import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileloggerService } from './filelogger/filelogger.service';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { CodeReviewService } from './code-review/code-review.service';
import { HttpModule } from '@nestjs/axios';
import { GeminiService } from './ai/gemini.service';
import { ReviewCacheService } from './review-cache/review-cache.service';
import { GithubService } from './github/github.service';

@Module({
  imports: [AiModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    HttpModule
  ],
  controllers: [AppController],
  providers: [AppService, FileloggerService, CodeReviewService,GeminiService, ReviewCacheService, GithubService],
})
export class AppModule { }
