import {Octokit} from "@octokit/core";
import {isEmpty} from "lodash";

enum ProcessStatus {
    PASSED = '✅',
    FAILED = '❌',
}

export interface PRHandlerResults {
    title: string,
    status: ProcessStatus,
    message: string
}

async function PRTileValidator(owner: string, repo: string, issue_number: number, octokit: Octokit): Promise<PRHandlerResults[]> {
    const {data: PRInfo} = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner, repo, pull_number: issue_number
    });

    const labelsArValid = !isEmpty(PRInfo.labels) && PRInfo.labels.every((label: any) => {
        if (!['fix', 'maintaince', 'feature'].includes(label.name.toLowerCase())) {
            return false;
        }

        // todo: check if contains only one of them.
        return true
    });

    return [
        {
            title: 'PR title',
            status: ProcessStatus.FAILED,
            message: 'The PR title is not valid',
        },
        {
            title: 'PR labels',
            status: labelsArValid ? ProcessStatus.PASSED : ProcessStatus.FAILED,
            message: labelsArValid ? '🌮' : 'You need to have at least one of the following labels: <code>Fix</code>, <code>Maintaince</code> or <code>Feature</code>',
        }
    ];
}

async function PRStagingEnv(owner: string, repo: string, issue_number: number, octokit: Octokit): Promise<PRHandlerResults[]> {
    return [{
        title: 'Staging env',
        status: ProcessStatus.PASSED,
        message: '<a href=https://staging.testim.io/master>Go to staging env</a>',
    }];
}

export const PRHandlers = [PRTileValidator, PRStagingEnv];