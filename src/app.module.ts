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
import { GithubModule } from './github/github.module';
import { GithubAppService } from './github-app/github-app.service';
import { CustomloggerService } from './customlogger/customlogger.service';


@Module({
  imports: [AiModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    HttpModule,
    GithubModule
  ],
  controllers: [AppController],
  providers: [AppService, FileloggerService, CodeReviewService,GeminiService, ReviewCacheService, GithubService, GithubAppService, CustomloggerService],
})
export class AppModule { }
