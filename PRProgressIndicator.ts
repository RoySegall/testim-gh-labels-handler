import {createOrUpdateProgressIndicators} from "./api/utils";
import * as github from '@actions/github';

(async () => {
    console.log(github.context);
    await createOrUpdateProgressIndicators();
    process.exit(0)
})();