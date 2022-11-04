import {createDraftedRelease, getPRInfo, getReleases, octokitClient, PR_ID, owner, repo, updateDraft} from "./common";
import {Label, Release, Releases} from "./interfaces";
import {capitalize, isEmpty, update} from "lodash";

type LocationInNotes = 'features' | 'fixes' | 'maintenance';
const emojis: {[key: string]: string} = {
    'features': '🚀',
    'fixes': '🐛',
    'maintenance': '🧹'
};

type DraftState = {
    clickim?: boolean,
    runner?: boolean,
    services?: boolean,
    webdriverio?: boolean,
    locationInNotes?: LocationInNotes;
};

function determinesDraftsByLabels(labels: Label[]) {
    const draftState: DraftState = {};

    const handlers: { [key: string]: () => void } = {
        clickim: () => draftState.clickim = true,
        runner: () => draftState.runner = true,
        services: () => draftState.services = true,
        webdriverio: () => draftState.webdriverio = true,
        feature: () => draftState.locationInNotes = 'features',
        fix: () => draftState.locationInNotes = 'fixes',
        maintaince: () => draftState.locationInNotes = 'maintenance',
    };

    // We'll start by assuming the PR does not belong to any of our packages.
    labels.forEach(({name}) => {
        name = name.toLowerCase();

        if (Object.keys(handlers).includes(name)) {
            handlers[name]();
        }
    });

    return draftState;
}

async function createOrGetDraftForEdit(draftStates: DraftState): Promise<Releases> {
    const draftsToEdit: Release[] = [];

    const releases = await getReleases();
    const draftsTitle = Object.fromEntries(releases
        .filter(release => release.draft)
        .map(release => [release.name!.replace('-draft', ''), release]));

    for await (const draftState of Object.keys(draftStates)) {
        if (draftState === 'locationInNotes') {
            console.log('Skipping on the location')
            continue;
        }

        if (Object.keys(draftsTitle).includes(draftState)) {
            console.log(`No need to create a release for ${draftState}. Skipping`);
            const releaseToPush = draftsTitle[draftState];
            draftsToEdit.push(releaseToPush)
            continue;
        }

        console.log(`Creating a draft release for ${draftState}`)
        const createdDraft = await createDraftedRelease(draftState);
        draftsToEdit.push(createdDraft);
    }

    return draftsToEdit;
}

async function updateDraftReleaseNotes(drafts: Releases, title: string, locationInNotes: LocationInNotes) {
    for await (const draft of drafts) {
        console.log(`Updating ${draft.name}`);

        if (isEmpty(draft.body)) {
            console.log(`The body of ${draft.name} is empty. Set it as it is`)

            draft.body = `## ${emojis[locationInNotes]} ${capitalize(locationInNotes)}\n- ${title}`
        } else {
            const sections = breakDraftBodyToSections(draft.body!);
            sections[capitalize(locationInNotes)].push(`- ${title}\r`);
            sections[capitalize(locationInNotes)].sort()

            let newDraftBody = '';
            Object.entries(sections).forEach(([title, entries]) => {
                newDraftBody += `## ${emojis[title.toLowerCase()]} ${capitalize(title)}\n`
            });

            console.log(newDraftBody);
            // draft.body = `## ${emojis[locationInNotes]} ${capitalize(locationInNotes)}\n- ${title}`


        }

        await updateDraft(draft);
    }

    // Get the body of the draft.
    // Search for the proper category.
    // update the draft with the new text.
}

function breakDraftBodyToSections(draftBody: string) {
    const lines = draftBody.split('\n');
    const sections: {[key: string]: string[]} = {
        'Maintenance': [],
        'Fixes': [],
        'Features': [],
    };

    let currentSection: string;
    lines.filter(line => line.trim()).forEach(line => {
        if (line.startsWith('##')) {
            // This is the beginning of a section.
            currentSection = line.split(' ').at(-1)!.trim();
            return;
        }

        sections[currentSection].push(line!)
    });

    return sections;
}

(async () => {
    const results = await octokitClient.request('GET /repos/{owner}/{repo}/releases/{id}', {
        owner,
        repo,
        id: 81912272,
    });

    const release = results.data as Release;
    // const {title, user, labels} = await getPRInfo(PR_ID);
    //
    // const draftState = determinesDraftsByLabels(labels);
    // const releases = await createOrGetDraftForEdit(draftState);
    const titleToNote = `TES-0000: foo @RoySegall (#3)`

    await updateDraftReleaseNotes([release], titleToNote, 'fixes');
})();
