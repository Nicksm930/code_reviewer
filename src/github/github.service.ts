import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit }  from '@octokit/rest'

@Injectable()
export class GithubService {
    private readonly octokit: Octokit;
    constructor(
        private readonly configService:ConfigService
    ){
         this.octokit = new Octokit({
             auth: configService.get<string>('GITHUB_TOKEN'),
            });
    }

    getOctokit(): Octokit {
         return this.octokit;
    }

}
