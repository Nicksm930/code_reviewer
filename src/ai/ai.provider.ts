import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class AiProvider {
    abstract getReview(code: string, filename: string): Promise<string>;
    abstract getOptimisedCode(code: string): Promise<string>;
    abstract getBugs(code: string): Promise<string>;
    abstract getSecurityChecks(code: string): Promise<string | boolean>;
    abstract getPreviousCode(code: string): Promise<string>;
}
