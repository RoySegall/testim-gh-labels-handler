import {Octokit} from "@octokit/core";
import {Comment, IndicatorStatus, PullRequestFiles} from "./interfaces";
import {isEmpty} from "lodash";

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

function createProgressTable(status: IndicatorStatus): string {
    return "<table>" +
        "<thead>" +
            "<tr>" +
                "<td>task</td>" +
                "<td>status</td>" +
                "<td>results</td>" +
            "</tr>" +
        "</thead>" +
        "<tbody>" +
            "<tr>" +
                "<td>PR title</td>" +
                "<td>❌</td>" +
                "<td>The title need to be in the format of <code>TES-[0-9*]: [a-zA-Z\d]</code></td>" +
            "</tr>" +

            "<tr>" +
                "<td>PR labels</td>" +
                "<td>❌</td>" +
                "<td>You need to have at least on of the follwing labels: </td>" +
            "</tr>" +

            "<tr>" +
                "<td>Staging environment</td>" +
                "<td>✅</td>" +
                "<td>Go to <a href='https://staging.testim.io/TES-10341-modal-project-creation-tooltip' target='_blank'>Staging env</a></td>" +
            "</tr>" +
        "</tbody>" +
    "</table>";
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

    const table = createProgressTable('done');
    await getOctokitClient().request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
        owner,
        repo,
        issue_number,
        body: `${openingLine}: \n${table}`
    })
    return 42;
}

export async function createOrUpdateProgressIndicators(): Promise<string> {
    const [{owner, repo}, pull_number] = [getRepository(), getPRID()];

    let prCommentToUpdate = await getCommentIndicators(owner, repo, pull_number);

    // Need to create the first comment in the PR.
    if (!Boolean(prCommentToUpdate)) {
        prCommentToUpdate = await createCommentIndicator(owner, repo, pull_number);
    }

    const response: any = await getOctokitClient().request(`GET /repos/{owner}/{repo}/pulls/{pull_number}/files`, {
        owner, repo, pull_number
    });

    return 'asdasd';
}
