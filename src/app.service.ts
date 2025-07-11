import { Injectable } from '@nestjs/common';
import { CodeReviewService } from './code-review/code-review.service';
import { GeminiService } from './ai/gemini.service';
import { ReviewCacheService } from './review-cache/review-cache.service';
import { Octokit } from '@octokit/rest';
import { GithubService } from './github/github.service';
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
    private readonly githubService: GithubService
  ) {
    this.octokit = this.githubService.getOctokit();
  }

  getHello(): string {
    return 'Nikhil'
  }

  async getDataFromHook(data: GitHubPushEvent): Promise<any> {
    console.log("Data", data);
    const { before, after } = data;
    const reviews = await this.codeReviewService.generateReview(before, after)
    console.log("Payload for Review", reviews);
    const output = await this.geminiService.reviewWithGemini(reviews)
    console.log("Ouput", JSON.stringify(output, null, 2));
    console.log("New Commit removed");
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

    console.log(`🚀 PR #${prNumber} Opened: ${baseSha} → ${headSha}`);

    // 1. Generate AI review based on the base/head diff
    const reviews = await this.codeReviewService.generateReview(baseSha, headSha);

    // 2. Get AI suggestions from Gemini
    const output = await this.geminiService.reviewWithGemini(reviews);

    // 3. Store review
    this.reviewCacheService.set(headSha, output);

    // 4. Apply comments to GitHub PR
    await this.applyCommentsForPr(output, headSha, {
      repoOwner,
      repoName,
      prNumber
    });

    return output;
  }
  async applyCommentsForPr(
    output: any,
    commitId: string,
    options: { repoOwner: string; repoName: string; prNumber: number }
  ) {
    const { repoOwner, repoName, prNumber } = options;

    const prFiles = await this.octokit.pulls.listFiles({
      owner: repoOwner,
      repo: repoName,
      pull_number: prNumber
    });

    const files = prFiles.data;

    for (const [filePath, comments] of Object.entries(output[commitId] as Record<string, ReviewComment[]>)) {
      const prFile = files.find((f) => f.filename === filePath);
      if (!prFile || !prFile.patch) continue;

      const diffLines = prFile.patch.split('\n');
      if (!comments || typeof comments !== 'object') {
        console.error('Invalid comments object:', comments);
        return;
      }
      for (const { line, comment } of comments) {
        const position = this.mapLineToDiffPosition(diffLines, line);
        if (position === -1) continue;

        await this.octokit.pulls.createReviewComment({
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
      if (line.startsWith('+') && !line.startsWith('+++')) {
        currentLine++;
      }

      if (currentLine === targetLine) {
        return position;
      }

      position++;
    }

    return -1; // not found
  }

}
