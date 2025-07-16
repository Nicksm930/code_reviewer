import { Injectable, OnModuleInit } from '@nestjs/common';
import { FileLoggerInfo } from './interfaces/file-logger.interface';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CustomloggerService } from 'src/customlogger/customlogger.service';

@Injectable()
export class FileloggerService implements OnModuleInit {
    private filePaths = new Map<string, FileLoggerInfo>();
    private ignored = ['node_modules', 'dist', '.git', '.env', '.gitignore'];

    constructor(
        private readonly customLogger: CustomloggerService
    ) { }

    async onModuleInit() {
        const currentDir = path.resolve(process.cwd(), 'src');
        this.customLogger.log(`Current Working Directory : ${currentDir}`);
        await this.scanDirectory(currentDir);
    }

    private async scanDirectory(dir: string): Promise<void> {
        const files = await fs.readdir(dir);
        for (const file of files) {
            if (this.ignored.includes(file.toLowerCase())) {
                continue;
            }
            const fullPath = path.join(dir, file);
            const stat = await fs.stat(fullPath);

            if (stat.isDirectory()) {
                await this.scanDirectory(fullPath);
            } else {
                const content = await fs.readFile(fullPath, 'utf8');
                const relativePath = path.relative(process.cwd(), fullPath);
                this.filePaths.set(relativePath, { filePath: fullPath, content });
            }
        }
    }

    getFileMap(): Map<string, FileLoggerInfo> {
        return this.filePaths;
    }

    async rescan(): Promise<Map<string, FileLoggerInfo>> {
        this.filePaths.clear();
        const currentDir = path.resolve(process.cwd(), 'src');
        await this.scanDirectory(currentDir);
        return this.getFileMap();
    }
}
