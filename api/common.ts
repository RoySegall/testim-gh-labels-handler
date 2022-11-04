import {PullRequestFiles, PullRequestInfo, Release, Releases} from "./interfaces";
import {Octokit} from "@octokit/core";

export const owner = 'roysegall';
export const repo = 'testim-gh-labels-handler';
export const octokitClient = new Octokit({ auth: process.env.ghToken });
export const PR_ID = process.env.PR_ID ? parseInt(process.env.PR_ID) : 0;

export async function getPRInfo(pull_number: number): Promise<PullRequestInfo> {
    const { data: PRInfo } = await octokitClient.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner, repo, pull_number,
    });

    return PRInfo;
}

export async function getReleases(): Promise<Releases> {
    const {data} = await octokitClient.request('GET /repos/{owner}/{repo}/releases', {
        repo, owner
    });
    return data;
}

export async function createDraftedRelease(release: string): Promise<Release> {
    const {data} = await octokitClient.request('POST /repos/{owner}/{repo}/releases', {
        repo, owner,
        draft: true,
        tag_name: `${release}-draft`,
        target_commitish: 'master',
        name: `${release}-draft`,

    });

    return data;
}

export async function updateDraft(draft: Release) {
    await octokitClient.request('PATCH /repos/{owner}/{repo}/releases/{release_id}', {
        owner,
        repo,
        release_id: draft.id!,
        tag_name: draft.tag_name!,
        target_commitish: draft.target_commitish!,
        name: draft.name!,
        body: draft.body!,
        draft: true,
        prerelease: draft.prerelease!
    })
}
export async function getPRFiles(issue_number: number): Promise<PullRequestFiles> {
    const {changed_files} = await getPRInfo(PR_ID);
    const perPage = 100;

    return (await Promise.all([...Array(Math.ceil(changed_files / perPage))].map(async (_, page) => {
        const {data} = await octokitClient.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/files', {
            owner, repo, pull_number: issue_number,
            per_page: 100, page: page + 1
        });

        return data;
    }))).flat();
}