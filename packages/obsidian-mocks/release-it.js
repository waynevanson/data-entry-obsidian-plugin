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
    tagName: `${packageName}-${version}`,
    pushRepo: 'git@github.com:waynevanson/data-entry-obsidian-plugin.git',
    commitsPath: '.',
    commitMessage: `feat(${scope}): released version ${version} [no ci]`,
    requireCommits: true,
    requireCommitsFail: false,
  },
  npm: {
    publish: false,
    skipChecks: true,
  },
  github: {
    release: true,
    releaseName: `${packageName}-${version}`,
  },
  hooks: {
    'before:git:release': ['pnpm run version', 'git add --all'],
  },
};
