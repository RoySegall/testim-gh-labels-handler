import {getPRInfo, owner, PR_ID, repo} from "./common";
import {Label} from "./interfaces";

type DraftState = {
    clickim?: boolean,
    runner?: boolean,
    services?: boolean,
    webdriverio?: boolean,
    locationInNotes?:  'feature' | 'fix' | 'maintaince';
};

function determinesDraftsByLabels(labels: Label[]) {
    const draftState: DraftState = {};

    const handlers: {[key: string]: () => void} = {
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

function createOrGetDraftForEdit(draftStates: DraftState): object[] {
    const draftsToEdit: {}[] = [];

    Object.keys(draftStates).forEach(draftState => {
        if (draftState === 'locationInNotes') {
            console.log('Skipping on the location')
            return;
        }

        console.log(`Checking on ${draftState}`)
    });


    // if not, create a draft and return the created one.

    return draftsToEdit;
}

function attachPrInfoToDraftBody(draft: object) {
    // Get the body of the draft.
    // Search for the proper category.
    // update the draft with the new text.
}

(async () => {
    const {title, user, labels} = await getPRInfo(owner, repo, PR_ID);

    const draftState = determinesDraftsByLabels(labels);
    const draft = await createOrGetDraftForEdit(draftState);
    attachPrInfoToDraftBody(draft);

    // The draft are the first ones. Check if we have ones by the items. todo: what about webdriver io draft?
})();
