export interface PullRequestFiles {
    sha: string,
    filename: string,
    status: string,
    additions: number,
    deletions: number,
    changes: number,
    blob_url: string,
    raw_url: string,
    contents_url: string,
    patch: string,
}

export interface User {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
}

export interface Reactions {
    url: string;
    total_count: number;
    '+1': number;
    '-1': number;
    laugh: number;
    hooray: number;
    confused: number;
    heart: number;
    rocket: number;
    eyes: number;
}

export interface Comment {
    url: string;
    html_url: string;
    issue_url: string;
    id: number;
    node_id: string;
    user: User;
    created_at: Date;
    updated_at: Date;
    author_association: string;
    body: string;
    reactions: Reactions;
    performed_via_github_app?: any;
}

