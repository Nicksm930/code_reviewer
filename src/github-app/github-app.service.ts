import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import * as fs from 'fs';
import * as path from 'path';
import { CustomloggerService } from 'src/customlogger/customlogger.service';

@Injectable()
export class GithubAppService {
  constructor(
    private readonly configService: ConfigService,
    private readonly customLogger: CustomloggerService
  ) { }

  private getPrivateKey(): string {
    const pemPath = this.configService.get<string>('APP_SECRET_PATH');
    if (!pemPath) {
      this.customLogger.error(`APP_SECRET_PATH Not Defined`, "Error")
      throw new Error('APP_SECRET_PATH is not defined.');
    }
    this.customLogger.log(`Octokit initialized Successfully`)
    return fs.readFileSync(path.resolve(pemPath), 'utf8');
  }

  getAppOctokit(): Octokit {
    return new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: this.configService.get<string>('APP_ID'),
        privateKey: this.getPrivateKey(),
      },
    });
  }

  async getInstallationId(owner: string): Promise<number | null> {
    const appOctokit = this.getAppOctokit();
    const res = await appOctokit.rest.apps.listInstallations();
    const installation = res.data.find(
      (i) => i.account?.login?.toLowerCase() === owner.toLowerCase(),
    );
    return installation?.id ?? null;
  }

  async getInstallationOctokit(owner: string): Promise<Octokit> {
    const installationId = await this.getInstallationId(owner);
    if (!installationId) {
      throw new Error(`GitHub App is not installed on ${owner}`);
    }

    return new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: this.configService.get<string>('APP_ID'),
        privateKey: this.getPrivateKey(),
        installationId,
      },
    });
  }
}
