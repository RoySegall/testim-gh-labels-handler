import {getPRID, getRepository, calculateRequiredLabels, setPRLabels} from "./api/utils";

async function run() {

    // Check which labels we need to add based on path of the changed files.
    const {repo, owner} = getRepository();
    const PRID = getPRID();

    const requiredLabels = await calculateRequiredLabels(repo, owner, PRID);
    await setPRLabels(repo, owner, PRID, requiredLabels);
}

(async () => {
    await run()
})()
