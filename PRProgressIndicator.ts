import {createOrUpdateProgressIndicators, getOctokitClient} from "./api/utils";
import * as github from '@actions/github';

(async () => {

    const context = {
        payload: {
            after: 'fe1b2cff0aa35fdc8eff4a3481add04e6498d8c1',
            base_ref: null,
            before: 'cd2053950d3daa4224f247aa539d030b8434e4f3',
            commits: [ [Object] ],
            compare: 'https://github.com/RoySegall/testim-gh-labels-handler/compare/cd2053950d3d...fe1b2cff0aa3',
            created: false,
            deleted: false,
            forced: false,
            head_commit: {
                author: [Object],
                committer: [Object],
                distinct: true,
                id: 'fe1b2cff0aa35fdc8eff4a3481add04e6498d8c1',
                message: 'a',
                timestamp: '2022-10-22T11:03:20+03:00',
                tree_id: '6a40aa2d4c0aac4984e9d128cc041202c7697c44',
                url: 'https://github.com/RoySegall/testim-gh-labels-handler/commit/fe1b2cff0aa35fdc8eff4a3481add04e6498d8c1'
            },
            pusher: { email: 'roy@segall.io', name: 'RoySegall' },
            ref: 'refs/heads/foo',
            repository: {
                allow_forking: true,
                name: 'testim-gh-labels-handler',
                node_id: 'R_kgDOGwstzg',
                notifications_url: 'https://api.github.com/repos/RoySegall/testim-gh-labels-handler/notifications{?since,all,participating}',
                open_issues: 4,
                open_issues_count: 4,
                owner: [Object],
                private: false,
                pulls_url: 'https://api.github.com/repos/RoySegall/testim-gh-labels-handler/pulls{/number}',
                pushed_at: 1666425802,
                releases_url: 'https://api.github.com/repos/RoySegall/testim-gh-labels-handler/releases{/id}',
                size: 73,
                ssh_url: 'git@github.com:RoySegall/testim-gh-labels-handler.git',
                stargazers: 0,
                stargazers_count: 0,
                stargazers_url: 'https://api.github.com/repos/RoySegall/testim-gh-labels-handler/stargazers',
                statuses_url: 'https://api.github.com/repos/RoySegall/testim-gh-labels-handler/statuses/{sha}',
                subscribers_url: 'https://api.github.com/repos/RoySegall/testim-gh-labels-handler/subscribers',
                subscription_url: 'https://api.github.com/repos/RoySegall/testim-gh-labels-handler/subscription',
                svn_url: 'https://github.com/RoySegall/testim-gh-labels-handler',
                tags_url: 'https://api.github.com/repos/RoySegall/testim-gh-labels-handler/tags',
                teams_url: 'https://api.github.com/repos/RoySegall/testim-gh-labels-handler/teams',
                topics: [],
                trees_url: 'https://api.github.com/repos/RoySegall/testim-gh-labels-handler/git/trees{/sha}',
                updated_at: '2022-01-30T20:16:10Z',
                url: 'https://github.com/RoySegall/testim-gh-labels-handler',
                visibility: 'public',
                watchers: 0,
                watchers_count: 0,
                web_commit_signoff_required: false
            },
            sender: {
                avatar_url: 'https://avatars.githubusercontent.com/u/1222368?v=4',
                events_url: 'https://api.github.com/users/RoySegall/events{/privacy}',
                followers_url: 'https://api.github.com/users/RoySegall/followers',
                following_url: 'https://api.github.com/users/RoySegall/following{/other_user}',
                gists_url: 'https://api.github.com/users/RoySegall/gists{/gist_id}',
                gravatar_id: '',
                html_url: 'https://github.com/RoySegall',
                id: 1222368,
                login: 'RoySegall',
                node_id: 'MDQ6VXNlcjEyMjIzNjg=',
                organizations_url: 'https://api.github.com/users/RoySegall/orgs',
                received_events_url: 'https://api.github.com/users/RoySegall/received_events',
                repos_url: 'https://api.github.com/users/RoySegall/repos',
                site_admin: false,
                starred_url: 'https://api.github.com/users/RoySegall/starred{/owner}{/repo}',
                subscriptions_url: 'https://api.github.com/users/RoySegall/subscriptions',
                type: 'User',
                url: 'https://api.github.com/users/RoySegall'
            }
        },
        eventName: 'push',
        sha: 'fe1b2cff0aa35fdc8eff4a3481add04e6498d8c1',
        ref: 'refs/heads/foo',
        workflow: '.github/workflows/labels-checker.yaml',
        action: '__run',
        actor: 'RoySegall',
        job: 'label_issue',
        runNumber: 25,
        runId: 3302526168,
        apiUrl: 'https://api.github.com',
        serverUrl: 'https://github.com',
        graphqlUrl: 'https://api.github.com/graphql'
    };

    const foo = await getOctokitClient().request('GET /repos/{owner}/{repo}/actions/runs/{run_id}', {
        owner: 'roysegall',
        repo: 'testim-gh-labels-handler',
        run_id: context.runId
    })

    if (foo.data.pull_requests) {
        console.log(foo.data.pull_requests[0]);

    }
    await createOrUpdateProgressIndicators();
    process.exit(0)
})();