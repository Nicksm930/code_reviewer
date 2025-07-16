import { Body, Controller, Post } from '@nestjs/common';

import { AiProvider } from './ai.provider';
import { CustomloggerService } from 'src/customlogger/customlogger.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiProvider: AiProvider,
    private readonly customLogger: CustomloggerService
  ) { }

  @Post('review')
  generateAIReview(@Body() body: any): Promise<string> {
    const { code, filename } = body;
    this.customLogger.debug(`Function(generateAIReview) => ${filename}`)
    return this.aiProvider.getReview(code, filename);
  }
}
