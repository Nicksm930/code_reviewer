import { Body, Controller, Post } from '@nestjs/common';

import { AiProvider } from './ai.provider';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiProvider: AiProvider
  ) { }

  @Post('review')
  generateAIReview(@Body() body: any): Promise<string> {
      const code = body.code;  // Explicitly extract the `code` property
    return this.aiProvider.getReview(code);
  }
}
