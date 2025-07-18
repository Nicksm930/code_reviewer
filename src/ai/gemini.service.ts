import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReviewPayloadItem } from 'src/app.service';
import { CustomloggerService } from 'src/customlogger/customlogger.service';
import { AiProvider } from './ai.provider';

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
                //     const prompt = `
                // You are an expert ${language} code reviewer tasked with reviewing and auditing the code in a provided file. Your goal is to identify issues, suggest improvements, and provide comments on code quality, readability, potential bugs, and best practices according to TypeScript and relevant frameworks.

                // You will be given the following information:
                // 1. The filename
                // 2. A diff of the changes
                // 3. The previous version of the code
                // 4. The current version of the code

                // Here is the file information:

                // <filename>${file.filename}</filename>

                // Review the following changes:

                // <diff>
                // \`\`\`diff
                // ${file.patch}
                // \`\`\`
                // </diff>

                // Previous code:
                // <previous_code>
                // \`\`\`ts
                // ${file.previousCode}
                // \`\`\`
                // </previous_code>

                // Current code:
                // <current_code>
                // \`\`\`${ext}
                // ${file.code}
                // \`\`\`
                // </current_code>

                // Instructions for reviewing the code:
                // 1. Carefully examine the diff, previous code, and current code.
                // 2. Identify any issues (very critical or needs immediate attention), potential improvements (list improvements as name of concept), or noteworthy aspects of the code.
                // 3. Focus on:
                // - Code quality
                // - Readability
                // - Potential bugs
                // - Adherence to TypeScript best practices
                // - Proper use of relevant frameworks (if applicable)
                // 4. For each comment, try to provide the approximate line number where the issue or improvement is located.
                // 5. Be specific and constructive in your feedback.

                // Provide your review in the following JSON format:
                // Your final output should consist of ONLY the JSON object below — no extra commentary, formatting, or markdown:
                // <output_format>
                // {
                // "filename": "The name of the file",
                // "comments": [
                //     { "line": 123, "comment": "Your comment here." }
                // ]
                // }
                // </output_format>

                // Your final output should be **inside a JSON code block** consist of only the JSON object which contains the filename and comments. Do not include any additional text, explanations, or formatting outside of this JSON structure.
                //     `;
                const prompt = `
                    You are an expert **${language} code reviewer**.

                    Your task is to **review the following file changes** and provide **critical, concise comments** based on:

                    - Code Quality
                    - Readability
                    - Potential Bugs
                    - Adherence to TypeScript Best Practices
                    - Proper Use of Relevant Frameworks

                    You are given:
                    1. The filename
                    2. A diff of the changes
                    3. The previous version of the code
                    4. The current version of the code

                    ---

                    ### 📂 File:
                    <filename>${file.filename}</filename>

                    ---

                    ### 🔄 Diff of Changes:
                    <diff>
                    \`\`\`diff
                    ${file.patch}
                    \`\`\`
                    </diff>

                    ---

                    ### 🕑 Previous Code:
                    <previous_code>
                    \`\`\`ts
                    ${file.previousCode}
                    \`\`\`
                    </previous_code>

                    ---

                    ### 🆕 Current Code:
                    <current_code>
                    \`\`\`${ext}
                    ${file.code}
                    \`\`\`
                    </current_code>

                    ---

                    ### 📝 Instructions:
                    1. Focus ONLY on **critical issues or high-priority improvements**.
                    2. Provide precise, helpful feedback — NO praise or unnecessary comments.
                    3. For each comment:
                    - Use approximate **line number**
                    - Be **direct, constructive, and brief**
                    4. List **only concept names** for general improvements (e.g., "Avoid deep nesting", "Use async/await", etc.)
                    5. **DO NOT** repeat the code in the comments.
                    6. **DO NOT** output any extra explanation.

                    ---

                    ### ✅ Output Format:
                    Respond with ONLY the following JSON structure, wrapped in a \`\`\`json code block:

                    \`\`\`json
                    {
                    "filename": "${file.filename}",
                    "comments": [
                        { "line": 42, "comment": "Avoid deeply nested if statements. Consider simplifying logic." },
                        { "line": 87, "comment": "Possible unhandled promise rejection. Use try/catch around await." }
                    ]
                    }
                    \`\`\`

                    ⚠️ Output ONLY this JSON block — do NOT include anything before or after it. Do NOT explain the output. Do NOT use markdown outside the code block.
                    `;


                try {
                    const result = await this.model.generateContent(prompt);
                    const text = await result.response.text();
                    const match = text.match(/```json\s*([\s\S]+?)```/i);
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

    estimateTokenCount(text: string): number {
        const words = text.trim().split(/\s+/).length;
        return Math.ceil(words / 0.75); // ~0.75 words/token
    }

    chunkCodeByTokens(code: string, maxTokens: number): string[] {
        const lines = code.split('\n');
        const chunks: string[] = [];

        let currentChunk: string[] = [];
        let currentTokens = 0;

        for (const line of lines) {
            const lineTokens = this.estimateTokenCount(line);

            if (currentTokens + lineTokens > maxTokens) {
                chunks.push(currentChunk.join('\n'));
                currentChunk = [];
                currentTokens = 0;
            }

            currentChunk.push(line);
            currentTokens += lineTokens;
        }

        if (currentChunk.length > 0) {
            chunks.push(currentChunk.join('\n'));
        }

        return chunks;
    }

    // async getReview(code: string, filename: string): Promise<string> {
    //     const extensionToLanguageMap: Record<string, string> = {
    //         js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
    //         html: 'html', css: 'css', scss: 'scss', less: 'less',
    //         json: 'json', yml: 'yaml', yaml: 'yaml',
    //         py: 'python', java: 'java', c: 'c', cpp: 'cpp', cs: 'csharp', go: 'go', php: 'php', rb: 'ruby', rs: 'rust',
    //         sh: 'bash', bash: 'bash', zsh: 'bash', env: 'dotenv', toml: 'toml', ini: 'ini', dockerfile: 'docker',
    //         tf: 'hcl', md: 'markdown', sql: 'sql', xml: 'xml', txt: 'text', log: 'text'
    //     };
    //     const ext = filename.split('.').pop()?.toLowerCase() || '';
    //     const language = extensionToLanguageMap[ext] || 'plaintext';

    //     const maxTokensPerChunk = 8000; // Leave room for prompt & output
    //     const totalTokens = this.estimateTokenCount(code);

    //     const chunks = totalTokens > maxTokensPerChunk
    //         ? this.chunkCodeByTokens(code, maxTokensPerChunk)
    //         : [code];

    //     const promptTemplate = (lang: string, chunk: string) => `
    //         You are a **Senior Software Architect and Code Auditor**.

    //         Your task is to **analyze the following ${lang} code**, but ONLY focus on:

    //         🔺 **Critical / High-Priority issues**
    //         🔒 Security flaws (Only High Priority , Much Need Attention , Any Secret keys exposed , display as list)
    //         ❌ Logic errors  (Only High Priority , Much Need Attention , Any Secret keys exposed , display as list)
    //         🐢 Performance bottlenecks  (Only High Priority , Much Need Attention , Any Secret keys exposed , display as list)
    //         🧼 Maintainability concerns (only if severe) (Only High Priority , Much Need Attention , Any Secret keys exposed , display as list)

    //         Respond using **ultra-concise Markdown**, with specific section of code.

    //         ---

    //         ## 🧠 Summary  
    //         (1-2 sentences MAX summarizing the review)

    //         ---

    //         ## ⚠️ Issues  
    //         List only actual *problem spots*, showing:
    //         - **Line reference or concept** (not full code)
    //         - The **specific issue**

    //         Format:
    //         - **[Line or Concept]**: Brief issue description

    //         ---

    //         ## 💡 Suggestions  
    //         Only for above issues.
    //         Explain:
    //         - **Why it's a problem**
    //         - **What to use instead** (short)

    //         Format:
    //         - **[Line or Concept]**: Use X instead of Y because Z

    //         ---

    //         ## ✅ Good Practices  
    //         Just list **terms or concept names** (no explanations)

    //         Example:
    //         - Dependency Injection  
    //         - Early Return  
    //         - Async/Await Best Practice

    //         ---

    //         Here is the code:
    //         \`\`\`${ext}
    //         ${chunk}
    //         \`\`\`
    //         `;

    //     const responses: string[] = [];

    //     for (const chunk of chunks) {
    //         const prompt = promptTemplate(language, chunk);
    //         const result = await this.model.generateContent(prompt);
    //         const response = await result.response;
    //         responses.push(await response.text());
    //     }

    //     return responses.join('\n\n---\n\n'); // optional: add separators between chunk results
    // }
    async getReview(code: string, filename: string): Promise<string> {
        const extensionToLanguageMap: Record<string, string> = {
            js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
            html: 'html', css: 'css', scss: 'scss', less: 'less',
            json: 'json', yml: 'yaml', yaml: 'yaml',
            py: 'python', java: 'java', c: 'c', cpp: 'cpp', cs: 'csharp',
            go: 'go', php: 'php', rb: 'ruby', rs: 'rust',
            sh: 'bash', bash: 'bash', zsh: 'bash', env: 'dotenv',
            toml: 'toml', ini: 'ini', dockerfile: 'docker',
            tf: 'hcl', md: 'markdown', sql: 'sql', xml: 'xml',
            txt: 'text', log: 'text'
        };

        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const language = extensionToLanguageMap[ext] || 'plaintext';

        const maxTokensPerChunk = 8000;
        const totalTokens = this.estimateTokenCount(code);

        const chunks = totalTokens > maxTokensPerChunk
            ? this.chunkCodeByTokens(code, maxTokensPerChunk)
            : [code];
        const promptTemplate = (lang: string, chunk: string) => `
    You are a **Senior Code Auditor and Static Analyzer(Similarly like a CodeRabbit)**.

    You are given a code file to analyze. You **MUST** return a **strictly structured JSON response** conforming to the following TypeScript interface.

    ### ⚠️ Important Instructions:

    1.  **ABSOLUTELY RESPOND ONLY** with a single JSON object matching the interface below.  Do NOT include any surrounding text, explanations, or markdown outside of the JSON.
    2.  For each item in \`code_issues\`, there **MUST** be a corresponding item in \`code_solutions\` and \`refactored_code\` using the same \`title\`.
    3.  Each \`refactored_code\` snippet **MUST** only include the *exact code block* that should be improved or replaced — not the whole file.
    4.  If any section has no data, return: \`[{ "note": "No content for <section_name>" }]\`

    ### ⚙️ Required TypeScript Interface:

    \`\`\`ts
    interface AIReviewResponse {
        summary: Record<string, string>[];

        code_issues: {
            title: string; // Short title or concept name of the issue
            description: string; // Detailed explanation of the issue
            type: 'Security' | 'Performance' | 'Maintainability' | 'Bug' | 'Style';
            status: 'CRITICAL' | 'WARNING' | 'INFO';
        }[];

        code_solutions: {
            title: string; // **MUST MATCH** code_issues.title
            solution: string; // How to fix the issue
        }[];

        code_standards: Record<string, string>[];

        refactored_code: {
            title: string; // **MUST MATCH** code_issues.title
            code: string; // **ONLY** the portion of code that needs improvement
        }[];

        eslint_issues: Record<string, string>[];

        bad_code_practices: Record<string, string>[];

        security_concerns: Record<string, string>[];
    }
    \`\`\`

    ### 📄 Now analyze this file:

    **Filename:** \`${filename}\`
    **Language:** \`${lang}\`
    **Code:**
    \`\`\`${ext}
    ${chunk}
    \`\`\`
    `;
        // const promptTemplate = (lang: string, chunk: string) => `
        //         You are a **Senior Code Auditor and Static Analyzer**.

        //         You are given a code file to analyze. You must return a **strictly structured JSON response** conforming to the following TypeScript interface:

        //         \`\`\`ts
        //         interface AIReviewResponse {
        //         summary: Record<string, string>[];

        //         code_issues: {
        //             title: string;
        //             description: string;
        //             type: 'Security' | 'Performance' | 'Maintainability' | 'Bug' | 'Style';
        //             status: 'CRITICAL' | 'WARNING' | 'INFO';
        //         }[];

        //         code_solutions: {
        //             title: string; // MUST MATCH code_issues.title
        //             solution: string;
        //         }[];

        //         code_standards: Record<string, string>[];

        //         refactored_code: {
        //             title: string; // MUST MATCH code_issues.title
        //             code: string; // Only include the portion of the code that needs improvement
        //         }[];

        //         eslint_issues: Record<string, string>[];

        //         bad_code_practices: Record<string, string>[];

        //         security_concerns: Record<string, string>[];
        //         }
        //         \`\`\`

        //         ### 🔐 Important Instructions:

        //         - Respond ONLY with a single JSON object matching the interface above.
        //         - For each item in \`code_issues\`, there MUST be a corresponding item in \`code_solutions\` and \`refactored_code\` using the same \`title\`.
        //         - Each \`refactored_code\` snippet must only include the exact code block that should be improved or replaced — not the whole file.
        //         - If any section has no data, return:
        //         \`[{ "note": "No content for <section_name>" }]\`

        //         ### 📄 Now analyze this file:

        //         **Filename:** \`${filename}\`  
        //         **Language:** \`${lang}\`  
        //         **Code:**
        //         \`\`\`${ext}
        //         ${chunk}
        //         \`\`\`
        //     `;
        // const promptTemplate = (lang: string, chunk: string) => `
        //     You are a **Senior Software Architect and Code Auditor**.

        //     Your task is to **analyze the following ${lang} code**, and report ONLY the most **critical** concerns.

        //     Evaluate:

        //     1. 🔒 **Security**
        //     2. ❌ **Logic/Correctness**
        //     3. 🐢 **Performance**
        //     4. 🧼 **Code Quality/Maintainability**

        //     For each category, rate issues as:
        //     - **CRITICAL**
        //     - **MODERATE**
        //     - or omit if not relevant.

        //     Respond in **Markdown**, using this structure:

        //     ---

        //     ## 🧠 Summary
        //     _(Very short explanation of key issues)_

        //     ---

        //     ## ⚠️ Issues

        //     - **[Line or Concept]** – _Problem description_  
        //     **Status**: CRITICAL / MODERATE  
        //     **Type**: Security / Logic / Performance / Quality

        //     ---

        //     ## 💡 Suggestions

        //     - **[Line or Concept]** – _Use X instead of Y because Z_

        //     ---

        //     ## ✅ Good Practices

        //     - Concept A  
        //     - Concept B  
        //     - Concept C

        //     ---

        //     Here is the code:

        //     \`\`\`${ext}
        //     ${chunk}
        //     \`\`\`
        //     `;

        const responses: string[] = [];

        for (const chunk of chunks) {
            const prompt = promptTemplate(language, chunk);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            responses.push(await response.text());
        }

        return responses.join('\n\n---\n\n');
    }
    async getAIQueryReview(code: string, filename: string, query: string): Promise<string> {
        const extensionToLanguageMap: Record<string, string> = {
            js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
            html: 'html', css: 'css', scss: 'scss', less: 'less',
            json: 'json', yml: 'yaml', yaml: 'yaml',
            py: 'python', java: 'java', c: 'c', cpp: 'cpp', cs: 'csharp',
            go: 'go', php: 'php', rb: 'ruby', rs: 'rust',
            sh: 'bash', bash: 'bash', zsh: 'bash', env: 'dotenv',
            toml: 'toml', ini: 'ini', dockerfile: 'docker',
            tf: 'hcl', md: 'markdown', sql: 'sql', xml: 'xml',
            txt: 'text', log: 'text'
        };

        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const language = extensionToLanguageMap[ext] || 'plaintext';

        const maxTokensPerChunk = 8000;
        const totalTokens = this.estimateTokenCount(code);

        const chunks = totalTokens > maxTokensPerChunk
            ? this.chunkCodeByTokens(code, maxTokensPerChunk)
            : [code];

        const promptTemplate = (lang: string, chunk: string, query: string) => `
            You are a **Senior Software Architect and Code Auditor**.

            Analyze the following **${lang} code**, and respond only if the query below is directly relevant to the code content.

            If the query is unrelated or out of scope of the code snippet, respond with:  
            **"⚠️ This query does not relate to the code provided."**

            --- 

            ## 👤 User Query

            "${query}"

            ---

            ## 📄 Code Snippet

            \`\`\`${ext}
            ${chunk}
            \`\`\`

            ---

            ## 🧠 Answer
            `;

        const responses: string[] = [];

        for (const chunk of chunks) {
            const prompt = promptTemplate(language, chunk, query);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = await response.text();

            // Normalize and check if it answered with the off-topic response
            if (text.trim().includes("⚠️ This query does not relate to the code provided.")) {
                return "⚠️ This query does not relate to the code provided.";
            }

            responses.push(text.trim());
        }

        return responses.join('\n\n---\n\n');
    }



    private extractFirstJsonObject(raw: string): string | null {
        try {
            // Step 1: Try extracting from ```json block
            const jsonBlockMatch = raw.match(/```json\s*([\s\S]*?)\s*```/i);
            if (jsonBlockMatch) {
                const cleaned = jsonBlockMatch[1].trim();
                return this.extractBalancedJson(cleaned);
            }

            // Step 2: Fallback — extract first {...} JSON object
            const firstBrace = raw.indexOf('{');
            const lastBrace = raw.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                const candidate = raw.slice(firstBrace, lastBrace + 1);
                return this.extractBalancedJson(candidate.trim());
            }

            return null;
        } catch (err) {
            this.customLogger.error('Error extracting JSON from AI output', err.message);
            return null;
        }
    }

    private extractBalancedJson(text: string): string | null {
        let depth = 0;
        let start = -1;
        for (let i = 0; i < text.length; i++) {
            if (text[i] === '{') {
                if (depth === 0) start = i;
                depth++;
            } else if (text[i] === '}') {
                depth--;
                if (depth === 0 && start !== -1) {
                    return text.substring(start, i + 1);
                }
            }
        }
        return null;
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
