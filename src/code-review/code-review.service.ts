// src/code-review/code-review.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CodeReviewService {
  private readonly GITHUB_API = 'https://api.github.com';
  private readonly OWNER = 'Nicksm930';
  private readonly REPO = 'code_reviewer';
  private readonly TOKEN = process.env.GITHUB_TOKEN;

  constructor(private readonly httpService: HttpService) { }

  async generateReview(before: string, after: string) {
    console.log("-------------------Generating Data for Review Based on Diffs------------------");

    const compareUrl = `${this.GITHUB_API}/repos/${this.OWNER}/${this.REPO}/compare/${before}...${after}`;

    const headers = {
      Authorization: `Bearer ${this.TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    };

    const compareResponse = await firstValueFrom(
      this.httpService.get(compareUrl, { headers })
    );

    const files = compareResponse.data.files;

    const reviewData = await Promise.all(
      files.map(async (file: any) => {
        const { filename, status, patch, raw_url } = file;
        const code = await this.fetchFile(raw_url);
        let previousCode;
        if (status === 'modified') {
          previousCode = await this.fetchPreviousVersion(filename, before);
        }

        return {
          filename,
          status,
          patch,
          code,
          previousCode,
        };
      })
    );
    console.log("-------------------Generated Review Data Based on Diffs------------------");
    return reviewData;
  }

  private async fetchFile(rawUrl: string): Promise<string> {
    const response = await firstValueFrom(
      this.httpService.get(rawUrl, {
        headers: { Authorization: `Bearer ${this.TOKEN}` },
      })
    );
    return response.data;
  }

  private async fetchPreviousVersion(path: string, sha: string): Promise<string | null> {
    try {
      const url = `${this.GITHUB_API}/repos/${this.OWNER}/${this.REPO}/contents/${path}?ref=${sha}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${this.TOKEN}`,
            Accept: 'application/vnd.github.v3.raw', // fetch raw file
          },
        })
      );
      return response.data;
    } catch (err) {
      console.warn(`Could not fetch previous version of ${path}`, err.message);
      return null;
    }
  }
}
