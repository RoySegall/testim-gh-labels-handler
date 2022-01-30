import {getPRID, getRepository, calculateRequiredLabels, setPRLabels} from "./api/utils";

async function run() {

    // Check which labels we need to add based on path of the changed files.
    const {repo, owner} = getRepository();
    const PRID = getPRID();

    const requiredLabels = await calculateRequiredLabels(owner, repo, PRID);
    await setPRLabels(owner, repo, PRID, requiredLabels);
}

(async () => {
    await run()
})()
