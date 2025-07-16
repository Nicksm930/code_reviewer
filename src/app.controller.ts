import { Body, Controller, Get, Post, Headers } from '@nestjs/common';
import { FileloggerService } from './filelogger/filelogger.service';
import { FileLoggerInfo } from './filelogger/interfaces/file-logger.interface';
import { AppService, GitHubPushEvent } from './app.service';
import { CustomloggerService } from './customlogger/customlogger.service';

@Controller('file')
export class AppController {
  constructor(
    private readonly fileLoggerService: FileloggerService,
    private readonly appService: AppService,
    private readonly customLogger: CustomloggerService
  ) { }

  @Get('scan')
  async getAllFiles(): Promise<Record<string, FileLoggerInfo>> {
    const map = this.fileLoggerService.getFileMap();
    const result: Record<string, FileLoggerInfo> = {};
    for (const [key, value] of map.entries()) {
      result[key] = value;
    }
    return result;
  }

  @Get('rescan')
  async rescanFiles(): Promise<Record<string, FileLoggerInfo>> {
    const map = await this.fileLoggerService.rescan();
    const result: Record<string, FileLoggerInfo> = {};
    for (const [key, value] of map.entries()) {
      result[key] = value;
    }
    return result;
  }

  @Post('review')
  getReview(@Body() requestData: any): { summary: string } {
    const { filename, code } = requestData;
    const summary = `✅ Received file: ${filename}\n🔍 Code length: ${code.length} characters\n💡 Suggestion: Check for typos like 'concole.log'`;
    return { summary };
  }

  // @Post('hooks')
  // getDataFromHook(@Body() body: GitHubPushEvent): any {
  //   return this.appService.getDataFromHook(body);
  // }

  @Get('git/commits/ai/reviews')
  getGitAiReview(): any {
    this.customLogger.log(`Generating AI Reviews`)
    return this.appService.getGitAiReview()
  }

  // @Post('pr/hook')
  // getDataFromPR(@Body() body: any): Promise<any> {
  //   console.log("<-------------Pr Created (Test)--------------->", body);
  //   return this.appService.handlePullRequestOpened(body)
  // }

  // @Post('pr/hook')
  // getDataFromPR(@Body() body: any): Promise<any> {
  //   const sender = body?.sender?.login;
  //   const action = body?.action;
  //   if (sender === 'ai-reviewer-gm[bot]') {
  //     return Promise.resolve({ ignored: true });
  //   }
  //   if (!['opened', 'synchronize'].includes(action)) {
  //     return Promise.resolve({ ignored: true });
  //   }
  //   console.log(`<------------- PR ${action.toUpperCase()} Triggered --------------->`);
  //   return this.appService.handlePullRequestOpened(body);
  // }
  @Post('pr/hook')
  getDataFromPR(
    @Headers('x-github-event') event: string,
    @Body() body: any,
  ): Promise<any> {
    const sender = body?.sender?.login;
    const action = body?.action;


    if (event !== 'pull_request') {
      this.customLogger.log(`❌ Ignoring non-PR event: ${event}`);
      return Promise.resolve({ ignored: true, reason: 'not a pull_request event' });
    }

    if (sender === 'ai-reviewer-gm[bot]') {
      this.customLogger.log('🔁 Skipping bot-triggered event');
      return Promise.resolve({ ignored: true, reason: 'bot-triggered event' });
    }

    if (!['opened', 'synchronize', 'review_requested'].includes(action)) {
      this.customLogger.log(`ℹ️ Skipping unsupported PR action: ${action}`);
      return Promise.resolve({ ignored: true, reason: 'unsupported action' });
    }

    this.customLogger.log(`Successfully triggered Pull Request with Action: ${action.toUpperCase()}.`);
    return this.appService.handlePullRequestOpened(body);
  }

}
