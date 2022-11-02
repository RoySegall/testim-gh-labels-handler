import type { Endpoints } from '@octokit/types/dist-types/generated/Endpoints';

export type PullRequestFiles = Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}/files']['response']['data'];
export type PullRequestInfo = Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}']['response']['data'];
export type Releases = Endpoints['GET /repos/{owner}/{repo}/releases']['response']['data'];
export type Release = Endpoints['POST /repos/{owner}/{repo}/releases']['response']['data'];
export type Label = { id: number; node_id: string; url: string; name: string; description: string | null, color: string; default: boolean; };

