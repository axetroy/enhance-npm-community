// @flow
import Promise from 'bluebird';
import github from '../github';
import Timeago from 'timeago.js';
import {diffDays} from '../utils';


function generateOutdatedWarning(date, diffDays) {
  const span = document.createElement('span');
  const tags = {
    deprecated: {name: "Deprecated", color: "red"},
    outdated: {name: "Outdated", color: "blue"}
  };
  let tag = null;
  if (diffDays > 365) {
    tag = tags.deprecated;
  } else if (diffDays > 180) {
    tag = tags.outdated;
  }
  span.innerHTML = (tag ? `<strong style="color: ${tag.color}">@${tag.name}</strong> ` : '') + `The package last commit at <strong style="color: #283546;">${new Timeago().format(date)}</strong>`;
  span.style.color = 'rgba(0, 0, 0, 0.6)';
  span.style.fontSize = '16px';
  span.style.verticalAlign = 'middle';
  return span;
}

export default function () {
  return async function detailPageHandler(): Promise {
    const githubLink: HTMLAnchorElement = window.document.querySelector('.box a[href*=github]');
    if (!githubLink) return;
    githubLink.title = githubLink.href;
    const gitRepoInfo: Object = await github.fetchRepoInfo(githubLink.pathname);

    let {container} = github.createWidget('li')({
      watch: gitRepoInfo.subscribers_count,
      star: gitRepoInfo.watchers_count,
      fork: gitRepoInfo.forks_count
    });

    const gitBranchInfo = await github.fetchRepoBranchInfo(githubLink.pathname, 'master');
    const lastCommit = gitBranchInfo.commit.commit;
    const lastCommitter = lastCommit.committer;

    const commitFromNowDiffDays = diffDays(new Date(), lastCommitter.date);

    // warning
    if (commitFromNowDiffDays > 60) {
      const span = generateOutdatedWarning(lastCommitter.date, commitFromNowDiffDays);
      document.querySelector('.package-name').appendChild(span);
    }

    window.document.querySelector('.box').insertBefore(container, githubLink.parentNode);
  }

}