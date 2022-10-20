import {createOrUpdateProgressIndicators} from "./api/utils";
import * as github from '@actions/github';

(async () => {
    console.log(github.context.issue.number);
    await createOrUpdateProgressIndicators();
})();