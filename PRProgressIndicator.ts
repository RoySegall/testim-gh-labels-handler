import {createOrUpdateProgressIndicators, getOctokitClient} from "./api/utils";
import * as github from '@actions/github';

(async () => {

    const foo = await getOctokitClient().request('GET /repos/{owner}/{repo}/actions/runs/{run_id}', {
        owner: 'roysegall',
        repo: 'testim-gh-labels-handler',
        run_id: github.context.runId
    })

    if (foo.data.pull_requests) {
        console.log(foo.data.pull_requests);

    }
    await createOrUpdateProgressIndicators();
    process.exit(0)
})();