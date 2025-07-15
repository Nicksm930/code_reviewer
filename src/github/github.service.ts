import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GithubService {
    private readonly octokit: Octokit;

    constructor(private readonly configService: ConfigService) {
        this.octokit = new Octokit({
            auth: this.configService.get<string>('GITHUB_TOKEN'),
        });
    }

    getOctokit(): Octokit {
        return this.octokit;
    }

    // 1. Authenticated user
    async getAuthenticatedUser() {
        const { data } = await this.octokit.users.getAuthenticated();
        return data;
    }

    // 2. Get specific repo details
    async getRepository(owner: string, repo: string) {
        const { data } = await this.octokit.repos.get({ owner, repo });
        return data;
    }

    // 3. List repos for a user/org
    async listUserRepos(username: string) {
        const { data } = await this.octokit.repos.listForUser({ username });
        return data;
    }

    // 4. List all branches in a repo
    async listBranches(owner: string, repo: string) {
        const { data } = await this.octokit.repos.listBranches({ owner, repo });
        return data;
    }

    // 5. Get a single branch
    async getBranch(owner: string, repo: string, branch: string) {
        const { data } = await this.octokit.repos.getBranch({
            owner,
            repo,
            branch,
        });
        return data;
    }

    // 6. List commits on a branch
    async listCommits(owner: string, repo: string, branch: string) {
        const { data } = await this.octokit.repos.listCommits({
            owner,
            repo,
            sha: branch,
        });
        return data;
    }

    // 7. Get specific pull request
    async getPullRequest(owner: string, repo: string, pullNumber: number) {
        const { data } = await this.octokit.pulls.get({
            owner,
            repo,
            pull_number: pullNumber,
        });
        return data;
    }

    // 8. List all PRs
    async listPullRequests(owner: string, repo: string) {
        const { data } = await this.octokit.pulls.list({
            owner,
            repo,
            state: 'all', // or 'open'
        });
        return data;
    }

    // 9. Get files changed in PR
    async listPRFiles(owner: string, repo: string, pullNumber: number) {
        const { data } = await this.octokit.pulls.listFiles({
            owner,
            repo,
            pull_number: pullNumber,
        });
        return data;
    }

    // 10. Get issue comments on PR
    async listPRComments(owner: string, repo: string, pullNumber: number) {
        const { data } = await this.octokit.issues.listComments({
            owner,
            repo,
            issue_number: pullNumber,
        });
        return data;
    }

    // 11. Get code review comments on PR (inline diffs)
    async listReviewComments(owner: string, repo: string, pullNumber: number) {
        const { data } = await this.octokit.pulls.listReviewComments({
            owner,
            repo,
            pull_number: pullNumber,
        });
        return data;
    }

    // 12. Get collaborators on a repo
    async getRepoCollaborators(owner: string, repo: string) {
        const { data } = await this.octokit.repos.listCollaborators({
            owner,
            repo,
        });
        return data;
    }

    // 13. List configured webhooks
    async listWebhooks(owner: string, repo: string) {
        const { data } = await this.octokit.repos.listWebhooks({
            owner,
            repo,
        });
        return data;
    }
}
