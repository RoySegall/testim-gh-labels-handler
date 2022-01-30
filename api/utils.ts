import { Octokit } from "@octokit/core";
import { LabelFromServer } from "./interfaces";

export function getOctokitClient(): Octokit {
    return new Octokit({ auth: process.env.ghToken });
}

export function getPRID(): number {
    let PRIDFromEnv: string = process.env.PR_ID || '';
    return parseInt(PRIDFromEnv);
}

export function getRepository(): string {
    return "RoySegall/testim-gh-labels-handler";
}

export async function getPRLabels(repo: string, PR_ID: number) {
    const response = await getOctokitClient().request(`GET /repos/${repo}/issues/${PR_ID}/labels`);

    return response.data.map((labelFromServer: LabelFromServer) => {
        return labelFromServer.name
    });
}

export async function calculateRequiredLabels(repo: string, PR_ID: number): Promise<string[]> {
    const response = await getOctokitClient().request(`GET /repos/${repo}/pulls/${PR_ID}/files`);

    console.log(response);
    return ['a', 'b']
}
