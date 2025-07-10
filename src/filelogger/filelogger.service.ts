import { Injectable, OnModuleInit } from '@nestjs/common';
import { FileLoggerInfo } from './interfaces/file-logger.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FileloggerService implements OnModuleInit {
    private filePaths = new Map<string, FileLoggerInfo>();
    private ignored = ['node_modules', 'dist', '.git', '.env', '.gitignore'];

    async onModuleInit() {
        const currentDir = path.resolve(process.cwd(), 'src');
        console.log("Current Working Dir", currentDir);
        await this.scanDirectory(currentDir);
    }

    private async scanDirectory(dir: string): Promise<void> {
        const files = await fs.readdir(dir);


        for (const file of files) {
            // console.log("Files",files);
            if (this.ignored.includes(file.toLowerCase())) {
                continue;
            }
            const fullPath = path.join(dir, file);
            // console.log(fullPath);

            const stat = await fs.stat(fullPath);
            // console.log("stats",stat);

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
