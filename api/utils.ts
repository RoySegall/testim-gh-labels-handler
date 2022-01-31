import {Octokit} from "@octokit/core";
import {PullRequestFiles} from "./interfaces";

export function getOctokitClient(): Octokit {
    return new Octokit({ auth: process.env.GH_TOKEN });
}

export function getPRID(): number {
    let PRIDFromEnv: string = process.env.PR_ID || '';

    console.log(process.env.GITHUB_REF);

    return parseInt(PRIDFromEnv);
}

export function getRepository(): {owner: string, repo: string} {
    return {owner: 'RoySegall', repo: 'testim-gh-labels-handler'};
}

export async function calculateRequiredLabels(owner: string, repo: string, pull_number: number): Promise<string[]> {
    const response: any = await getOctokitClient().request(`GET /repos/{owner}/{repo}/pulls/{pull_number}/files`, {
        owner, repo, pull_number
    });

    let labelsToAdd: string[] = [];

    response.data.forEach(({filename}: PullRequestFiles) => {
        // Marking the which labels we need to add.
        if (filename.includes('apps/services')) {
            labelsToAdd.push('Services');
        }

        if (filename.includes('apps/clickim')) {
            labelsToAdd.push('Clickim');
        }
    });

    return labelsToAdd;
}


export async function setPRLabels(owner: string, repo: string, issue_number: number, labels: string[]) {
    const response = await getOctokitClient().request(`PUT /repos/{owner}/{repo}/issues/{issue_number}/labels`, {
        repo,
        owner,
        issue_number,
        labels
    });
}
