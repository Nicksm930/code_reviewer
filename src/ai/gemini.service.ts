import { Injectable, NotFoundException } from '@nestjs/common';
import { AiProvider } from './ai.provider';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReviewPayloadItem } from 'src/app.service';
import { CustomloggerService } from 'src/customlogger/customlogger.service';

@Injectable()
export class GeminiService extends AiProvider {
    private model;
    constructor(
        private readonly configService: ConfigService,
        private readonly customLogger: CustomloggerService
    ) {
        super();
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');

        if (!apiKey) {
            throw new NotFoundException("Api key is undefined")
        }
        const genAI = new GoogleGenerativeAI(apiKey)
        this.model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' })

    }

    async reviewWithGemini(payload: ReviewPayloadItem[]) {
        this.customLogger.log(`Started Reviewing with Gemini-Flash-2.0`);

        const reviews: Record<string, any> = {};
        const extensionToLanguageMap: Record<string, string> = {
            // JavaScript/TypeScript
            js: 'javascript',
            jsx: 'jsx',
            ts: 'typescript',
            tsx: 'tsx',

            // Web / HTML / CSS
            html: 'html',
            css: 'css',
            scss: 'scss',
            less: 'less',

            // JSON/YAML
            json: 'json',
            yml: 'yaml',
            yaml: 'yaml',

            // Backend / Server
            py: 'python',
            java: 'java',
            c: 'c',
            cpp: 'cpp',
            cs: 'csharp',
            go: 'go',
            php: 'php',
            rb: 'ruby',
            rs: 'rust',

            // Shell / Config
            sh: 'bash',
            bash: 'bash',
            zsh: 'bash',
            env: 'dotenv',
            toml: 'toml',
            ini: 'ini',
            dockerfile: 'docker',

            // Infra / DevOps
            tf: 'hcl',         // Terraform
            md: 'markdown',

            // Misc
            sql: 'sql',
            xml: 'xml',
            txt: 'text',
            log: 'text',
        };


        await Promise.all(
            payload.map(async (file) => {
                const ext = file.filename.split('.').pop()?.toLowerCase() || '';
                const language = extensionToLanguageMap[ext] || 'plaintext';
                const prompt = `
            You are an expert ${language} code reviewer tasked with reviewing and auditing the code in a provided file. Your goal is to identify issues, suggest improvements, and provide comments on code quality, readability, potential bugs, and best practices according to TypeScript and relevant frameworks.

            You will be given the following information:
            1. The filename
            2. A diff of the changes
            3. The previous version of the code
            4. The current version of the code

            Here is the file information:

            <filename>${file.filename}</filename>

            Review the following changes:

            <diff>
            \`\`\`diff
            ${file.patch}
            \`\`\`
            </diff>

            Previous code:
            <previous_code>
            \`\`\`ts
            ${file.previousCode}
            \`\`\`
            </previous_code>

            Current code:
            <current_code>
            \`\`\`${ext}
            ${file.code}
            \`\`\`
            </current_code>

            Instructions for reviewing the code:
            1. Carefully examine the diff, previous code, and current code.
            2. Identify any issues, potential improvements, or noteworthy aspects of the code.
            3. Focus on:
            - Code quality
            - Readability
            - Potential bugs
            - Adherence to TypeScript best practices
            - Proper use of relevant frameworks (if applicable)
            4. For each comment, try to provide the approximate line number where the issue or improvement is located.
            5. Be specific and constructive in your feedback.

            Provide your review in the following JSON format:
            Your final output should consist of ONLY the JSON object below — no extra commentary, formatting, or markdown:
            <output_format>
            {
            "filename": "The name of the file",
            "comments": [
                { "line": 123, "comment": "Your comment here." }
            ]
            }
            </output_format>

            Your final output should consist of only the JSON object containing the filename and comments. Do not include any additional text, explanations, or formatting outside of this JSON structure.
                `;

                try {
                    const result = await this.model.generateContent(prompt);
                    const text = await result.response.text();
                    const match = text.match(/```json\s*([\s\S]+?)```/i);
                    // const newText = match ? match[1] : text;
                    // const jsonText = this.extractFirstJsonObject(text);
                    // const parsed = this.safeJSONParse(jsonText);
                    const jsonText = this.extractFirstJsonObject(text);

                    if (!jsonText) {
                        this.customLogger.warn(`❌ No valid JSON object found in AI output for ${file.filename}`);
                        reviews[file.filename] = [];
                        return;
                    }

                    const parsed = this.safeJSONParse(jsonText);

                    if (parsed?.comments && Array.isArray(parsed.comments)) {
                        reviews[file.filename] = parsed.comments;
                        this.customLogger.debug(`Generated AI Review for file: ${file.filename}`);
                    } else {
                        this.customLogger.warn(`No comments found in AI output for ${file.filename}`);
                        reviews[file.filename] = [];
                    }
                } catch (err) {
                    console.error(`Error reviewing ${file.filename}:`, err);
                    reviews[file.filename] = [
                        { line: 0, comment: "AI review failed or quota exceeded." },
                    ];
                }
            })
        );

        this.customLogger.log(`✅ Successfully completed Reviews`);
        return reviews;
    }


    safeJSONParse(str: string): any {
        try {
            return JSON.parse(str);
        } catch (e) {
            this.customLogger.error("JSON parse error:", e.message);
            return null;
        }
    }

    async getReview(code: string, filename: string): Promise<string> {
        const extensionToLanguageMap: Record<string, string> = {
            // JavaScript/TypeScript
            js: 'javascript',
            jsx: 'jsx',
            ts: 'typescript',
            tsx: 'tsx',

            // Web / HTML / CSS
            html: 'html',
            css: 'css',
            scss: 'scss',
            less: 'less',

            // JSON/YAML
            json: 'json',
            yml: 'yaml',
            yaml: 'yaml',

            // Backend / Server
            py: 'python',
            java: 'java',
            c: 'c',
            cpp: 'cpp',
            cs: 'csharp',
            go: 'go',
            php: 'php',
            rb: 'ruby',
            rs: 'rust',

            // Shell / Config
            sh: 'bash',
            bash: 'bash',
            zsh: 'bash',
            env: 'dotenv',
            toml: 'toml',
            ini: 'ini',
            dockerfile: 'docker',

            // Infra / DevOps
            tf: 'hcl',         // Terraform
            md: 'markdown',

            // Misc
            sql: 'sql',
            xml: 'xml',
            txt: 'text',
            log: 'text',
        };
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const language = extensionToLanguageMap[ext] || 'plaintext';

        const prompt = `
            You are a **Secure Code Auditor and Compiler for ${language}**, tasked with reviewing the provided code for **correctness**, **performance**, **maintainability**, and **security(memory leaks) compliance**.

            Review the following code thoroughly and provide a **concise, professional summary**, covering:

            1.**Bug & Logic Flaws** – Identify functional errors or unintended behavior.
            2.**Performance Bottlenecks** – Highlight inefficient patterns or suboptimal data handling.
            3.**Security Risks** – Detect hardcoded secrets, unsafe operations, injection points, or missing validations.
            4.**Code Quality & Standards** – Check for violations of clean code, consistency, readability, and standard conventions (naming, spacing, modularity).
            5.**Code Reframing** – Suggest better code structures or patterns that improve clarity, reusability, or testability.
            6.**Documentation & Commenting** – Recommend missing docstrings, module descriptions, or helpful inline comments for maintainability.
            7.**Version Control Awareness** – If applicable, mention if the diff suggests technical debt, poor refactors, or merge risks.
            8.**Security Compliance (Optional)** – If applicable, reference common standards (OWASP, CWE, etc.) or suggest tooling.
            9.**Generate Documentation for the code which will indentify the usage , purpose and its intended output**

            ---

            ### 🔍 **Summary Review** (use bullet points, be direct, skip trivial issues):

            - [ ] Bugs or logic errors
            - [ ] Performance or memory optimizations
            - [ ] Security vulnerabilities
            - [ ] Readability / code structure
            - [ ] Best practices and linting issues
            - [ ] Documentation

            ---

            ### 📌 **Manager-Ready Summary** (final note for team leads/project managers):
            - Use a professional tone
            - Summarize major improvements (e.g., performance, security, clarity)
            - Keep it high-level and ready to paste in GitHub/JIRA/etc.

            ---

            ### 🛠️ **Corrected & Refactored Code Output**
            - Rewrite the code with all recommended fixes
            - Add clear, helpful inline comments (brief, not noisy)
            - Ensure it's clean, readable, idiomatic, and production-ready

            \`\`\`${ext}
            ${code}
            \`\`\`
            `;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text()
    }

    private extractFirstJsonObject(raw: string): string | null {
        try {
            // Remove triple backtick blocks if present
            raw = raw.replace(/```[\s\S]*?```/g, (match) => {
                const inside = match.replace(/```[\w]*\n?/, '').replace(/```$/, '');
                return inside.trim();
            });

            // Match first JSON object
            const match = raw.match(/{[\s\S]*}/);
            return match ? match[0] : null;
        } catch (err) {
            this.customLogger.error('Error extracting JSON from AI output', err.message);
            return null;
        }
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
