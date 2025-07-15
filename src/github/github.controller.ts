import { Controller, Get, Param, Query } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('me')
  getAuthenticatedUser() {
    return this.githubService.getAuthenticatedUser();
  }

  @Get('repos/:owner/:repo')
  getRepo(@Param('owner') owner: string, @Param('repo') repo: string) {
    return this.githubService.getRepository(owner, repo);
  }

  @Get('repos/:username')
  listUserRepos(@Param('username') username: string) {
    return this.githubService.listUserRepos(username);
  }

  @Get('branches/:owner/:repo')
  listBranches(@Param('owner') owner: string, @Param('repo') repo: string) {
    return this.githubService.listBranches(owner, repo);
  }

  @Get('branches/:owner/:repo/:branch')
  getBranch(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('branch') branch: string,
  ) {
    return this.githubService.getBranch(owner, repo, branch);
  }

  @Get('commits/:owner/:repo')
  listCommits(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('branch') branch: string,
  ) {
    return this.githubService.listCommits(owner, repo, branch);
  }

  @Get('pulls/:owner/:repo')
  listPullRequests(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.githubService.listPullRequests(owner, repo);
  }

  @Get('pulls/:owner/:repo/:number')
  getPullRequest(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('number') pullNumber: string,
  ) {
    return this.githubService.getPullRequest(owner, repo, +pullNumber);
  }

  @Get('pulls/:owner/:repo/:number/files')
  getPRFiles(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('number') pullNumber: string,
  ) {
    return this.githubService.listPRFiles(owner, repo, +pullNumber);
  }

  @Get('pulls/:owner/:repo/:number/comments')
  getPRComments(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('number') pullNumber: string,
  ) {
    return this.githubService.listPRComments(owner, repo, +pullNumber);
  }

  @Get('pulls/:owner/:repo/:number/review-comments')
  getPRReviewComments(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('number') pullNumber: string,
  ) {
    return this.githubService.listReviewComments(owner, repo, +pullNumber);
  }

  @Get('collaborators/:owner/:repo')
  getCollaborators(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.githubService.getRepoCollaborators(owner, repo);
  }

  @Get('webhooks/:owner/:repo')
  getWebhooks(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.githubService.listWebhooks(owner, repo);
  }
}
