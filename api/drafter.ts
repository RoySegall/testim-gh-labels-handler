import {createDraftedRelease, getPRInfo, getReleases, PR_ID} from "./common";
import {Label, Release, Releases} from "./interfaces";

type LocationInNotes = 'feature' | 'fix' | 'maintaince';
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
        feature: () => draftState.locationInNotes = 'feature',
        fix: () => draftState.locationInNotes = 'fix',
        maintaince: () => draftState.locationInNotes = 'maintaince',
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

    Object.keys(draftStates).forEach(draftState => {
        if (draftState === 'locationInNotes') {
            console.log('Skipping on the location')
            return;
        }

        if (Object.keys(draftsTitle).includes(draftState)) {
            console.log(`No need to create a release for ${draftState}. Skipping`);
            const releaseToPush = draftsTitle[draftState];
            draftsToEdit.push(releaseToPush)
            return;
        }

        // this should be async.
        createDraftedRelease(draftState).then(release => draftsToEdit.push(release));

        console.log(`Creating a draft release for ${draftState}`)
    });


    return draftsToEdit;
}

function updateDraft(drafts: Releases, title: string, locationInNotes: LocationInNotes) {
    console.log(drafts.length);

    // Get the body of the draft.
    // Search for the proper category.
    // update the draft with the new text.
}

(async () => {
    const {title, user, labels} = await getPRInfo(PR_ID);

    const draftState = determinesDraftsByLabels(labels);
    const releases = await createOrGetDraftForEdit(draftState);
    const titleToNote = `${title} @${user?.name!} (#${PR_ID})`

    updateDraft(releases, titleToNote, draftState.locationInNotes!);

    // The draft are the first ones. Check if we have ones by the items. todo: what about webdriver io draft?
})();
