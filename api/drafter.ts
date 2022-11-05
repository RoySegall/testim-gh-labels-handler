import {
    createDraftedRelease,
    getPRInfo,
    getReleases,
    PR_ID,
    updateDraft,
    getPRFiles, octokitClient,
    repo, owner
} from "./common";
import * as github from '@actions/github';
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
type ReleasesObject = {[key: string]: Release}

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
    const draftsTitle: ReleasesObject = Object.fromEntries(releases
        .filter(release => release.draft)
        .map(release => [release.name!.replace('-draft', ''), release]));

    for await (const draftState of Object.keys(draftStates)) {
        if (draftState === 'locationInNotes') {
            console.log('Skipping on the location')
            continue;
        }

        let draft: Release;

        if (['editor', 'clickim'].includes(draftState)) {
            draft = await handleClickimEditorRelease(draftsTitle, isClickim, draftState);
        } else {
            draft = await handleNonClickimRelease(draftsTitle, draftState);
        }
        await updateDraftReleaseNotes(draft, title, draftStates.locationInNotes!)
    }

    return draftsToEdit;
}

async function handleClickimEditorRelease(drafts: ReleasesObject, isClickim: boolean, draftState: string, lastVersion?: number) {
    const editorOrClickimDraft = drafts['clickim'] || drafts['editor'];

    if (editorOrClickimDraft) {
        // Set the draft with the existing clickim/editor release.
        const draft = editorOrClickimDraft;

        // This is a draft release of editor or clickim. In case the current PR is a clickim PR and the draft
        // set to editor we need to change it to a clickim,
        if (isClickim && draft.tag_name === 'editor-draft') {
            draft.tag_name = 'clickim-draft';
            draft.name = 'clickim-draft';
        }

        return draft;
    }

    // Get here the latest release number and push by 1.
    console.log(`Creating a draft release for ${draftState}`)
    return await createDraftedRelease(isClickim ? 'clickim' : 'editor');
}

async function handleNonClickimRelease(draftsTitle: ReleasesObject, draftState: string, lastVersion?: number) {
    console.log('Handling drafts which are not clickim/editor');

    if (Object.keys(draftsTitle).includes(draftState)) {
        console.log(`No need to create a release for ${draftState}. Skipping`);
        return draftsTitle[draftState];
    }
    console.log(`Creating a draft release for ${draftState}`)
    // Get here the latest release number and push by 1.
    return createDraftedRelease(draftState);
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

async function getPRIDGitHubFromContext(context: 'pull-request' | 'closing-pr'): Promise<number> {
    if (context === 'closing-pr') {
        return github.context.payload.pull_request.number!;
    }

    const runInformation = await octokitClient.request('GET /repos/{owner}/{repo}/actions/runs/{run_id}', {
        owner,
        repo,
        run_id: github.context.runId,
    });


    if (!runInformation.data.pull_requests) {
        throw new Error('We could not determine the PR from the current workflow ');
    }

    return runInformation.data.pull_requests[0].number;
}

(async () => {
    const prId = await getPRIDGitHubFromContext("closing-pr");
    const {title, user, labels} = await getPRInfo(prId);
    const isClickim = await determineEditorOrClickim(prId);

    const draftState = determinesDraftsByLabels(labels);
    const titleToNote = `${title} @${user?.login} (#${prId})`
    await createOrGetDraftForEdit(draftState, titleToNote, isClickim);
})();
