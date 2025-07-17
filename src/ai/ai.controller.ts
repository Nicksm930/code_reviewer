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

  @Post('query')
  generateAIQueryReview(@Body() body: any): Promise<string> {
    console.log("Body",body);
    
    const { filename, code, query } = body;
    this.customLogger.debug(`Function(generateAIQueryreview)=> ${filename} with query ${query}`)
    return this.aiProvider.getAIQueryReview(code, filename, query)
  }
}
