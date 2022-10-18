import {Octokit} from "@octokit/core";
import {isEmpty} from "lodash";
import {PRHandlerResults, PRHandlers} from "./PRHandlers";

const openingLine = 'Minor information regarding the PR';

export function getOctokitClient(): Octokit {
    return new Octokit({ auth: process.env.ghToken });
}

export function getPRID(): number {
    let PRIDFromEnv: string = process.env.PR_ID || '';
    return parseInt(PRIDFromEnv);
}

export function getRepository(): {owner: string, repo: string} {
    return {owner: 'RoySegall', repo: 'testim-gh-labels-handler'};
}

async function createProgressTable(owner: string, repo: string, issue_number: number): Promise<string> {
    const headers = ['Task', 'Status', 'Results'].map(header => `<td>${header}</td>`).join('\n');
    const results = await Promise.all(PRHandlers.map(handler => handler(owner, repo, issue_number, getOctokitClient())));

    const tableRowResults = results.map(PrHandlers => {
        return PrHandlers.map(PRHandler => `<tr><td>${PRHandler.title}</td><td>${PRHandler.status}</td><td>${PRHandler.message}</td></tr>`).join('\n')
    }).join('\n');

    return `<table><thead><tr>${headers}</tr></thead><tbody>${tableRowResults}</tbody></table>`
}

async function getCommentIndicators(owner: string, repo: string, pull_number: number): Promise<number> {
    const {data: comments} = await getOctokitClient().request('GET /repos/{owner}/{repo}/issues/comments', {
        owner,
        repo
    });

    if (isEmpty(comments)) {
        return 0;
    }

    // Github's API does not allow us to get the comment by the PR ID rather we get all the latest comments.
    const currentPrComments = comments.filter(comment => comment.issue_url.includes(`issues/${pull_number}`));

    if (isEmpty(currentPrComments)) {
        return 0;
    }

    const [commentWithIndicators] = currentPrComments?.filter(comment => {
        if (!comment.body) {
            return false;
        }

        return comment.body.toLowerCase().includes(openingLine.toLowerCase())
    });


    if (isEmpty(commentWithIndicators)) {
        return 0;
    }

    return commentWithIndicators.id;
}

async function createCommentIndicator(owner: string, repo: string, issue_number: number): Promise<number> {
    const table = await createProgressTable(owner, repo, issue_number);
    const response = await getOctokitClient().request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
        owner,
        repo,
        issue_number,
        body: `${openingLine}: \n${table} \n\nCreated at: ${new Date()}`
    })
    return response.data.id;
}

async function runPRValidation(owner: string, repo: string, issue_number: number, comment_id: number) {
    const table = await createProgressTable(owner, repo, issue_number);

    await getOctokitClient().request('PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}', {
        owner,
        repo,
        comment_id,
        body: `${openingLine}: ${table} \n\nUpdated at: ${new Date()}`
    })
}

export async function createOrUpdateProgressIndicators() {
    const [{owner, repo}, pull_number] = [getRepository(), getPRID()];

    let prCommentToUpdate = await getCommentIndicators(owner, repo, pull_number);

    // Need to create the first comment in the PR.
    if (!Boolean(prCommentToUpdate)) {
        prCommentToUpdate = await createCommentIndicator(owner, repo, pull_number);
    }

    await runPRValidation(owner, repo, pull_number, prCommentToUpdate);
}
