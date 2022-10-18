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

    const baseLabels = ['fix', 'maintaince', 'feature'];
    const currentLabels = !isEmpty(PRInfo.labels) && PRInfo.labels.map(label => label.name) || [];

    let labelsAreValid = false;
    if (!isEmpty(currentLabels)) {
        let baseLabelsAmount = baseLabels.filter(baseLabel => currentLabels.includes(baseLabel));
        labelsAreValid = baseLabelsAmount.length === 1;
    }

    // todo: add validation for the pr title.
    return [
        {
            title: 'PR labels',
            status: labelsAreValid ? ProcessStatus.PASSED : ProcessStatus.FAILED,
            message: labelsAreValid ? '🌮' : 'You need to have one of the following labels: <code>Fix</code>, <code>Maintaince</code> or <code>Feature</code>',
        }
    ];
}

async function PRStagingEnv(owner: string, repo: string, issue_number: number, octokit: Octokit): Promise<PRHandlerResults[]> {
    const {data: files} = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/files', {
        owner, repo, pull_number: issue_number,
    });

    const shouldAddLinkToStaging = files.filter(file => file.filename.includes('apps/clickim/'))

    if (isEmpty(shouldAddLinkToStaging)) {
        return [];
    }

    const {data: PRInfo} = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner, repo, pull_number: issue_number
    });

    return [{
        title: 'Staging env',
        status: ProcessStatus.PASSED,
        message: `<a href=https://staging.testim.io/${PRInfo.head.ref}>Go to staging env</a>`,
    }];
}

export const PRHandlers = [PRTileValidator, PRStagingEnv];