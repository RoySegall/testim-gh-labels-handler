import {PullRequestInfo} from "./interfaces";
import {Octokit} from "@octokit/core";

export const owner = 'roysegall';
export const repo = 'testim-gh-labels-handler';
export const octokitClient = new Octokit({ auth: process.env.ghToken });
export const PR_ID = process.env.PR_ID ? parseInt(process.env.PR_ID) : 0;

export async function getPRInfo(owner: string, repo: string, pull_number: number): Promise<PullRequestInfo> {
    const { data: PRInfo } = await octokitClient.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner, repo, pull_number,
    });

    return PRInfo;
}