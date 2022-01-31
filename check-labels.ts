import {getPRID, getRepository, calculateRequiredLabels, setPRLabels} from "./api/utils";

async function run() {

    // Check which labels we need to add based on path of the changed files.
    const {repo, owner} = getRepository();
    const PRID = getPRID();

    return;

    console.log('Checking which labels we need to check');
    const requiredLabels = await calculateRequiredLabels(owner, repo, PRID);

    console.log(`The labels are: ${requiredLabels.join(', ')}`);
    await setPRLabels(owner, repo, PRID, requiredLabels);

    console.log('Added');
}

(async () => {
    await run()
})()
