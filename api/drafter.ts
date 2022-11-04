import {
    createDraftedRelease,
    getPRInfo,
    getReleases,
    PR_ID,
    updateDraft,
    getPRFiles
} from "./common";
import {Label, Release, Releases} from "./interfaces";
import {capitalize, isEmpty} from "lodash";

const clickimPaths: string[] = ['apps/clickim/background', 'apps/clickim/common'];

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

    labels.forEach(({name}) => {
        name = name.toLowerCase();

        if (Object.keys(handlers).includes(name)) {
            handlers[name]();
        }
    });

    return draftState;
}

async function createOrGetDraftForEdit(draftStates: DraftState, title: string, isClickim: boolean): Promise<Releases> {
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

        /**
         * check if there is a label clickim:
         *  no: do nothing
         *  yes:
         *       check if we have a draft of editor/clickim
         *          no: create a draft of editor/clickim accoridng to is clickim
         *          yes:
         *              - go over all PRs and check:
         *                  if one of them is a clickim release change the title to clickim
         *                  if none of them is a clickim set the release as an editor release.
         */

        if (['editor', 'clickim'].includes(draftState)) {
            console.log('Handling a clickim/editor release.');
        } else {
            console.log('Handling drafts which are not clickim/editor');

            let draft: Release;
            if (Object.keys(draftsTitle).includes(draftState)) {
                console.log(`No need to create a release for ${draftState}. Skipping`);
                draft = draftsTitle[draftState];
            } else {
                console.log(`Creating a draft release for ${draftState}`)
                draft = await createDraftedRelease(draftState);
            }

            await updateDraftReleaseNotes(draft, title, draftStates.locationInNotes!)
        }
    }

    return draftsToEdit;
}

async function updateDraftReleaseNotes(draft: Release, title: string, locationInNotes: LocationInNotes) {
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
            if (isEmpty(entries)) {
                return;
            }

            newDraftBody += `## ${emojis[title.toLowerCase()]} ${capitalize(title)}\n${entries.join('\n')}\n\n`
        });

        draft.body = newDraftBody
    }

    await updateDraft(draft);
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

async function determineEditorOrClickim(issue_number: number) {
    const files = await getPRFiles(issue_number);
    return files.some(({filename}) => clickimPaths.some(path => filename.includes(path)))
}

(async () => {
    const {title, user, labels} = await getPRInfo(PR_ID);
    const isClickim = await determineEditorOrClickim(PR_ID);

    const draftState = determinesDraftsByLabels(labels);
    const titleToNote = `${title} @${user?.login} (#${PR_ID})`
    await createOrGetDraftForEdit(draftState, titleToNote, isClickim);
})();
