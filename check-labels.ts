import {getPRLabels, getPRID, getRepository, calculateRequiredLabels} from "./api/utils";

async function run() {

    // Get the PR ID.
    const labels = await getPRLabels(getRepository(), getPRID());

    // Check which labels we need to add based on path of the changed files.
    const requiredLabels = await calculateRequiredLabels(getRepository(), getPRID());

    // Add/Remove clickim based on the path.

    // Add remove services based on the path.

    // Find any comment made by the bot and delete it,

    // Add a comment by the bot which indicate which labels was added/removed.
}



(async () => {
    await run()
})()
