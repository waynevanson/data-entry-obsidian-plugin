const version = '${version}';
const scope = 'plugin';

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
    tagName: `${version}`,
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
    releaseName: `${version}`,
    assets: ['manifest.json', 'dist/main.js'],
  },
  hooks: {
    'before:git:release': ['pnpm run version', 'git add --all'],
  },
};
