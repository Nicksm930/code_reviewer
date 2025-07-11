import { Injectable } from '@nestjs/common';
import { CodeReviewService } from './code-review/code-review.service';
import { GeminiService } from './ai/gemini.service';
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

@Injectable()
export class AppService {

  constructor(
    private readonly codeReviewService: CodeReviewService,
    private readonly geminiService: GeminiService
  ) { }

  getHello(): string {
    return 'Nikhil'
  }

  async getDataFromHook(data: GitHubPushEvent) {
    console.log("Data", data);
    const { before, after } = data;
    const reviews = await this.codeReviewService.generateReview(before, after)
    console.log("Payload for Review", reviews);
    const ouput = await this.geminiService.reviewWithGemini(reviews)
    console.log("Ouput", JSON.stringify(ouput, null, 2));
    console.log("New Commit");

  }
}
