const version = '${version}';
const packageName = process.env.npm_package_name;
const scope = packageName.split('/')[1];

module.exports = {
  plugins: {
    '@release-it/conventional-changelog': {
      path: '.',
      infile: 'CHANGELOG.md',
      preset: 'conventionalcommits',
      gitRawCommitsOpts: {
        path: '.',
      },
    },
  },
  git: {
    push: true,
    tagName: `${scope}-${version}`,
    pushRepo: 'git@github.com:waynevanson/data-entry-obsidian-plugin.git',
    commitsPath: '.',
    commitMessage: `chore(${scope}): released version ${version} [no ci]`,
    requireCommits: true,
    requireCommitsFail: false,
  },
  npm: {
    publish: false,
    skipChecks: true,
  },
  github: {
    release: true,
    releaseName: `${scope}-${version}`,
  },
  hooks: {
    'before:git:release': ['git add --all'],
  },
};
