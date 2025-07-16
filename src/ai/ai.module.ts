import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiProvider } from './ai.provider';
import { GeminiService } from './gemini.service';
import { CustomloggerService } from 'src/customlogger/customlogger.service';


@Module({

  controllers: [AiController],
  providers: [AiService, {
    provide: AiProvider,
    useClass: GeminiService
  },
    CustomloggerService
  ],
})
export class AiModule { }
