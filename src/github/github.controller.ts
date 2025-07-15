import { Controller, Get, Param, Query } from '@nestjs/common';
import { GithubService } from './github.service';
import { ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('GitHub-Hooks')
@Controller('github')
export class GithubController {
    constructor(private readonly githubService: GithubService) { }

    @Get('me')
    getAuthenticatedUser() {
        return this.githubService.getAuthenticatedUser();
    }

    @Get('repos/:owner/:repo')
    @ApiParam({ name: 'owner', type: String })
    @ApiParam({ name: 'repo', type: String })
    getRepo(@Param('owner') owner: string, @Param('repo') repo: string) {
        return this.githubService.getRepository(owner, repo);
    }

    @Get('repos/:username')
    @ApiParam({ name: 'username', type: String })
    listUserRepos(@Param('username') username: string) {
        return this.githubService.listUserRepos(username);
    }

    @Get('branches/:owner/:repo')
    @ApiParam({ name: 'owner', type: String })
    @ApiParam({ name: 'repo', type: String })
    listBranches(@Param('owner') owner: string, @Param('repo') repo: string) {
        return this.githubService.listBranches(owner, repo);
    }

    @Get('branches/:owner/:repo/:branch')
    @ApiParam({ name: 'owner', type: String })
    @ApiParam({ name: 'repo', type: String })
    @ApiParam({ name: 'branch', type: String })
    getBranch(
        @Param('owner') owner: string,
        @Param('repo') repo: string,
        @Param('branch') branch: string,
    ) {
        return this.githubService.getBranch(owner, repo, branch);
    }

    @Get('commits/:owner/:repo')
    @ApiParam({ name: 'owner', type: String })
    @ApiParam({ name: 'repo', type: String })
    @ApiQuery({ name: 'branch', type: String, required: true })
    listCommits(
        @Param('owner') owner: string,
        @Param('repo') repo: string,
        @Query('branch') branch: string,
    ) {
        return this.githubService.listCommits(owner, repo, branch);
    }

    @Get('pulls/:owner/:repo')
    @ApiParam({ name: 'owner', type: String })
    @ApiParam({ name: 'repo', type: String })
    listPullRequests(
        @Param('owner') owner: string,
        @Param('repo') repo: string,
    ) {
        return this.githubService.listPullRequests(owner, repo);
    }

    @Get('pulls/:owner/:repo/:number')
    @ApiParam({ name: 'owner', type: String })
    @ApiParam({ name: 'repo', type: String })
    @ApiParam({ name: 'number', type: Number })
    getPullRequest(
        @Param('owner') owner: string,
        @Param('repo') repo: string,
        @Param('number') pullNumber: string,
    ) {
        return this.githubService.getPullRequest(owner, repo, +pullNumber);
    }

    @Get('pulls/:owner/:repo/:number/files')
    @ApiParam({ name: 'owner', type: String })
    @ApiParam({ name: 'repo', type: String })
    @ApiParam({ name: 'number', type: Number })
    getPRFiles(
        @Param('owner') owner: string,
        @Param('repo') repo: string,
        @Param('number') pullNumber: string,
    ) {
        return this.githubService.listPRFiles(owner, repo, +pullNumber);
    }

    @Get('pulls/:owner/:repo/:number/comments')
    @ApiParam({ name: 'owner', type: String })
    @ApiParam({ name: 'repo', type: String })
    @ApiParam({ name: 'number', type: Number })
    getPRComments(
        @Param('owner') owner: string,
        @Param('repo') repo: string,
        @Param('number') pullNumber: string,
    ) {
        return this.githubService.listPRComments(owner, repo, +pullNumber);
    }

    @Get('pulls/:owner/:repo/:number/review-comments')
    @ApiParam({ name: 'owner', type: String })
    @ApiParam({ name: 'repo', type: String })
    @ApiParam({ name: 'number', type: Number })
    getPRReviewComments(
        @Param('owner') owner: string,
        @Param('repo') repo: string,
        @Param('number') pullNumber: string,
    ) {
        return this.githubService.listReviewComments(owner, repo, +pullNumber);
    }

    @Get('collaborators/:owner/:repo')
    @ApiParam({ name: 'owner', type: String })
    @ApiParam({ name: 'repo', type: String })
    getCollaborators(
        @Param('owner') owner: string,
        @Param('repo') repo: string,
    ) {
        return this.githubService.getRepoCollaborators(owner, repo);
    }

    @Get('webhooks/:owner/:repo')
    @ApiParam({ name: 'owner', type: String })
    @ApiParam({ name: 'repo', type: String })
    getWebhooks(
        @Param('owner') owner: string,
        @Param('repo') repo: string,
    ) {
        return this.githubService.listWebhooks(owner, repo);
    }
}
