const { Octokit } = require('@octokit/core');

function getOctoClient() {
    return new Octokit({ auth: process.env.ghToken });
}

async function run() {
    // Get the PR ID.

    // Get the PR lable.

    // Check which labels we need to add based on path of the changed files.

    // Add/Remove clickim based on the path.

    // Add remove services based on the path.

    // Find any comment made by the bot and delete it,

    // Add a comment by the bot which indicate which labels was added/removed.
}



(async () => {
    await run()
})()
