import { Injectable, NotFoundException } from '@nestjs/common';
import { AiProvider } from './ai.provider';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as path from 'path';

@Injectable()
export class GeminiService extends AiProvider {
    private model;
    constructor(
        private readonly configService: ConfigService
    ) {
        super();
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        console.log("API KEY", apiKey);

        if (!apiKey) {
            throw new NotFoundException("Api key is undefined")
        }
        const genAI = new GoogleGenerativeAI(apiKey)
        this.model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' })
    }


    async getReview(code: string): Promise<string> {
        // console.log("code sent", code);

        // const prompt = `
        // You are a senior software architect and secure coding expert.

        // Review the following code and provide a concise, actionable summary focusing on:
        // 1. Bugs or logic errors
        // 2. Performance or memory optimizations
        // 3. Security issues (e.g., secrets, unsafe patterns)
        // 4. Formatting/linting concerns
        // 5. Idiomatic improvements

        // Use bullet points. Be direct, only note issues worth fixing.

        // \`\`\`
        // ${code}
        // \`\`\`
        // `;
        //     const prompt = `
        //     You are a senior software architect and secure coding expert.

        //     Review the following code and provide a concise, actionable summary focusing on:
        //     1. Bugs or logic errors
        //     2. Performance or memory optimizations
        //     3. Security issues (e.g., secrets, unsafe patterns)
        //     4. Formatting/linting concerns
        //     5. Idiomatic improvements

        //     Use bullet points. Be direct, only note issues worth fixing.

        //     After listing the issues, provide the updated code with all the necessary corrections applied.

        //     \`\`\`
        //     ${code}
        //     \`\`\`
        // `;
        //         const prompt = `
        //     You are a senior software architect and secure coding expert.

        //     Review the following code and provide a concise, actionable summary focusing on:
        //     1. Bugs or logic errors
        //     2. Performance or memory optimizations
        //     3. Security issues (e.g., secrets, unsafe patterns)
        //     4. Formatting/linting concerns
        //     5. Idiomatic improvements

        //     Use bullet points. Be direct, only note issues worth fixing.

        //     Then, rewrite the code:
        //     - Apply all necessary corrections based on your review
        //     - Add clear and helpful comments so a project manager can understand the logic and copy-paste the code into documentation or tasks
        //     - Ensure the final version is clean, readable, and production-ready

        //     \`\`\`
        //     ${code}
        //     \`\`\`
        // `;
        const prompt = `
            You are a senior software architect and secure coding expert.

            Review the following code and provide a concise, actionable summary focusing on:
            1. Bugs or logic errors
            2. Performance or memory optimizations
            3. Security issues (e.g., secrets, unsafe patterns)
            4. Formatting/linting concerns
            5. Idiomatic improvements
            6. A final overall comment formatted for team leads or project managers to copy-paste directly into GitHub, JIRA, or similar tools.
            - Use a professional tone
            - Summarize the key issues fixed
            - Mention improvements in readability, security, or performance
            - Keep it brief and high-level

            Use bullet points for points 1–5. Be direct, only note issues worth fixing.

            Then, rewrite the code:
            - Apply all necessary corrections based on your review
            - Add clear and helpful inline comments so a project manager can understand the logic
            - Ensure the final version is clean, readable, and production-ready

            \`\`\`
            ${code}
            \`\`\`
        `;




        // const prompt = `
        // You are a highly experienced project manager with deep expertise in software development, testing, and secure coding practices.
        // Your role is to review and analyze code with a focus on:
        // - Code correctness and logic
        // - Performance optimizations
        // - Alternative implementations or patterns
        // - Linting and formatting standards (e.g., ESLint)
        // - Security risks (exposed secrets, credentials, etc.)
        // - Best practices in modern development

        // Please provide a detailed review covering:
        // 1. Bugs or logical flaws
        // 2. Suggestions for code optimization
        // 3. Recommendations for linting and formatting
        // 4. Any security issues (e.g., exposed secrets)
        // 5. If applicable, a more efficient or idiomatic version of the code

        // Here is the code to review:

        // \`\`\`js
        // ${code}
        // \`\`\`
        // `;
        // const prompt = `
        //     You are a senior software architect and secure coding expert.

        //     Review the following code and provide a concise, actionable summary focusing on:
        //     1. Bugs or logic errors
        //     2. Performance or memory optimizations
        //     3. Security issues (e.g., secrets, unsafe patterns)
        //     4. Formatting/linting concerns (e.g., ESLint)
        //     5. More efficient or idiomatic alternatives (if any)

        //     Use bullet points. Be direct, avoid explanations unless necessary. Only comment on relevant findings.

        //     Code to review:
        //     \`\`\`js
        //     ${code}
        //     \`\`\`
        //     `;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        // console.log("Response", response);

        return response.text()
    }
    getOptimisedCode(code: string): Promise<string> {
        throw new Error('Method not implemented.');
    }
    getBugs(code: string): Promise<string> {
        throw new Error('Method not implemented.');
    }
    getSecurityChecks(code: string): Promise<string | boolean> {
        throw new Error('Method not implemented.');
    }
    getPreviousCode(code: string): Promise<string> {
        throw new Error('Method not implemented.');
    }
}
