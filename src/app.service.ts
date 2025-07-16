import { Injectable } from '@nestjs/common';
import { CodeReviewService } from './code-review/code-review.service';
import { GeminiService } from './ai/gemini.service';
import { ReviewCacheService } from './review-cache/review-cache.service';
import { Octokit } from '@octokit/rest';
import { GithubService } from './github/github.service';
import { GithubAppService } from './github-app/github-app.service';
import { CustomloggerService } from './customlogger/customlogger.service';
export interface GitHubPushEvent {
  ref: string;
  before: string;
  after: string;
  repository: GitHubRepository;
  pusher: GitHubUser;
  sender: GitHubUser;
  created: boolean;
  deleted: boolean;
  forced: boolean;
  base_ref: string | null;
  compare: string;
  commits: GitHubCommit[];
  head_commit: GitHubCommit;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: GitHubUser;
  html_url: string;
  url: string;
  default_branch: string;
}

export interface GitHubUser {
  name?: string;
  email?: string;
  login: string;
  id: number;
  avatar_url: string;
  type: string;
}

export interface GitHubCommit {
  id: string;
  message: string;
  timestamp: string;
  url: string;
  author: GitHubAuthor;
  committer: GitHubAuthor;
  added: string[];
  removed: string[];
  modified: string[];
}

export interface GitHubAuthor {
  name: string;
  email: string;
  username: string;
}
export interface ReviewPayloadItem {
  filename: string;
  status: 'modified' | 'added' | 'removed';
  patch: string;
  code: string;
  previousCode: string;
}
export interface ReviewComment {
  line: number;
  comment: string;
}

@Injectable()
export class AppService {
  private readonly octokit: Octokit;
  constructor(
    private readonly codeReviewService: CodeReviewService,
    private readonly geminiService: GeminiService,
    private readonly reviewCacheService: ReviewCacheService,
    private readonly githubService: GithubService,
    private readonly githubAppService: GithubAppService,
    private readonly customLogger: CustomloggerService
  ) {
    this.octokit = this.githubService.getOctokit();
  }

  getHello(): string {
    return 'Nikhil More'
  }

  async getDataFromHook(data: GitHubPushEvent): Promise<any> {
    const { before, after } = data;
    const reviews = await this.codeReviewService.generateReview(before, after)
    const output = await this.geminiService.reviewWithGemini(reviews)
    this.reviewCacheService.set(after, output)
    return output;
  }

  getGitAiReview(): any {
    return this.reviewCacheService.getAll()
  }

  async handlePullRequestOpened(payload: any): Promise<any> {
    const pr = payload.pull_request;
    const repo = payload.repository;
    const baseSha = pr.base.sha;
    const headSha = pr.head.sha;
    const prNumber = pr.number;
    const repoOwner = repo.owner.login;
    const repoName = repo.name;

    this.customLogger.debug(`function(handlePullRequestOpened) => PR #${prNumber} Opened: ${baseSha} → ${headSha}`)
    const reviews = await this.codeReviewService.generateReview(baseSha, headSha);
    const aiOutput = await this.geminiService.reviewWithGemini(reviews);
    const output = { [headSha]: aiOutput };

    this.customLogger.log(`Storing AI Reviews in Cache Started`)
    this.reviewCacheService.set(headSha, output);
    this.customLogger.log(`Storing AI Reviews in Cache Successfull`)
    this.customLogger.log(`Storing AI Reviews in Cache Successfull`)

    this.customLogger.log(`Applying Comments for (GITHUB) Pull Request #${prNumber}`);
    await this.applyCommentsForPr(output, headSha, {
      repoOwner,
      repoName,
      prNumber
    });
    this.customLogger.log(`Successfully Applied Comments for (GITHUB) Pull Request  #${prNumber}`)

    return output;
  }

  async applyCommentsForPr(
    output: any,
    commitId: string,
    options: { repoOwner: string; repoName: string; prNumber: number }
  ) {
    const { repoOwner, repoName, prNumber } = options;

    const octokit = await this.githubAppService.getInstallationOctokit(repoOwner);

    const prFiles = await octokit.pulls.listFiles({
      owner: repoOwner,
      repo: repoName,
      pull_number: prNumber
    });

    const files = prFiles.data;
    const commitComments = output?.[commitId];

    if (!commitComments || typeof commitComments !== 'object') {
      this.customLogger.warn(`⚠️ No review comments found for commit: ${commitId}`);
      return;
    }

    for (const [filePath, comments] of Object.entries(commitComments as Record<string, ReviewComment[]>)) {
      const prFile = files.find(f => f.filename === filePath);
      if (!prFile || !prFile.patch) continue;

      const diffLines = prFile.patch.split('\n');
      if (!Array.isArray(comments)) {
        this.customLogger.error(`Invalid comments format for ${filePath}:`, comments);
        continue;
      }

      for (const { line, comment } of comments) {
        const position = this.mapLineToDiffPosition(diffLines, line);
        if (position === -1) continue;

        await octokit.pulls.createReviewComment({
          owner: repoOwner,
          repo: repoName,
          pull_number: prNumber,
          commit_id: commitId,
          path: filePath,
          position,
          body: comment
        });
      }
    }
  }




  mapLineToDiffPosition(diffLines: string[], targetLine: number): number {
    let position = 0;
    let currentLine = 0;

    for (const line of diffLines) {
      position++;

      if (line.startsWith('@@')) {
        const match = line.match(/\+(\d+)/);
        if (match) currentLine = parseInt(match[1], 10) - 1;
        continue;
      }

      if (line.startsWith('+') && !line.startsWith('+++')) {
        currentLine++;
        if (currentLine === targetLine) return position;
      } else if (!line.startsWith('-')) {
        currentLine++;
      }
    }

    return -1;
  }


}
