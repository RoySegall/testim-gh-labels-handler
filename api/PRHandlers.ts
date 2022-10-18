import {Octokit} from "@octokit/core";

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
    return [
        {
            title: 'PR title',
            status: ProcessStatus.FAILED,
            message: 'The PR title is not valid',
        },
        {
            title: 'PR labels',
            status: ProcessStatus.PASSED,
            message: 'You need to have at least one of the following labels: <code>Fix</code>, <code>Maintaince</code> or <code>Feature</code>',
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