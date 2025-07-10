import { Body, Controller, Get, Post } from '@nestjs/common';
import { FileloggerService } from './filelogger/filelogger.service';
import { FileLoggerInfo } from './filelogger/interfaces/file-logger.interface';

@Controller('file')
export class AppController {
  constructor(private readonly fileLoggerService: FileloggerService) { }

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
    console.log("Code", code);
    
    // Mock analysis logic for now
    const summary = `✅ Received file: ${filename}\n🔍 Code length: ${code.length} characters\n💡 Suggestion: Check for typos like 'concole.log'`;
    return { summary };
  }
}
