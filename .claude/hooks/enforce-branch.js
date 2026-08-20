#!/usr/bin/env node
/**
 * Claude Code PreToolUse hook — enforce the feature-branch + pull-request workflow.
 *
 * Blocks (exit 2):
 *   - `git commit` while checked out on a protected branch (main / master)
 *   - any `git push` that targets a protected branch (main / master)
 *
 * Everything else is allowed. The hook fails OPEN (exit 0) on any uncertainty
 * (not a git repo, git missing, unparsable input) so it never blocks normal work.
 *
 * This guards people using Claude Code. It does NOT replace GitHub branch
 * protection — that is the authoritative, tool-independent enforcement layer.
 */
const { execSync } = require('child_process');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  let cmd = '';
  try {
    const payload = JSON.parse(input || '{}');
    cmd = (payload.tool_input && payload.tool_input.command) || '';
  } catch (_) {
    process.exit(0);
  }
  if (!cmd) process.exit(0);

  // match `git <global flags> commit|push` anchored to a real git invocation
  const gitSub = (name) =>
    new RegExp('(^|[\\s;&|(])git\\s+(?:-[^\\s]+\\s+)*' + name + '(\\s|$)').test(cmd);
  const isCommit = gitSub('commit');
  const isPush = gitSub('push');
  if (!isCommit && !isPush) process.exit(0);

  const PROTECTED = ['main', 'master'];
  let branch = '';
  try {
    branch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch (_) {
    process.exit(0); // not a git repo yet → don't interfere
  }

  const block = (msg) => {
    process.stderr.write(msg + '\n');
    process.exit(2);
  };

  if (isCommit && PROTECTED.includes(branch)) {
    block(
      'Blocked: direct commits to "' + branch + '" are not allowed in this repository.\n' +
        'Work on a feature branch and open a pull request instead:\n' +
        '  git switch -c feature/<short-name>\n' +
        '  git add -A && git commit -m "..."\n' +
        '  git push -u origin feature/<short-name>\n' +
        '  gh pr create --fill --base ' + branch + '\n' +
        'The ' + branch + ' branch is updated only by merging an approved pull request.'
    );
  }

  if (isPush) {
    const pushesProtected =
      PROTECTED.includes(branch) ||
      PROTECTED.some(
        (b) =>
          new RegExp('origin[\\s/:]+' + b + '(\\s|$)').test(cmd) ||
          new RegExp(':' + b + '(\\s|$)').test(cmd)
      );
    if (pushesProtected) {
      block(
        'Blocked: pushing directly to main/master is not allowed.\n' +
          'Push your feature branch and open a pull request for review:\n' +
          '  git push -u origin <feature-branch>\n' +
          '  gh pr create --fill\n' +
          'The main branch is updated only by merging an approved pull request.'
      );
    }
  }

  process.exit(0);
});
