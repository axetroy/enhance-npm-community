// @flow
import Promise from 'bluebird';
import github from '../github';
import Timeago from 'timeago.js';
import {diffDays} from '../utils';
import env from '../env';


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

    parseCodeBlock();   // parse require('xxx') | import xxx from

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

function getElementText(ele) {
  return ele.innerText || ele.textContent;
}

function parseCodeBlock() {
  let lines = document.querySelectorAll('.highlight.js pre .line .source');

  lines.forEach(function (line) {
    if (line.innerHTML.match(/require|from|import/g)) {
      // console.log(line.innerText);
      let stringQuotedEle = line.querySelector('.string.quoted') || line.querySelector('.import .string.quoted');

      if (!stringQuotedEle) return;

      const requireName = getElementText(stringQuotedEle).trim().replace(/^['"]|['"]$/g, '');

      if (/^\./.test(requireName)) return;    // 不支持相对路径

      const packageNameMatch = requireName.match(/(^\@[^\/]+\/[^\/]+)|([^\/]+)/) || [];
      const packageName = packageNameMatch[0];

      if (env.dev) {
        console.log(requireName + ' >>> ' + packageName);
      }

      // 正确解析才渲染页面
      if (packageName) {
        const childNodes = stringQuotedEle.children;
        const stringQuotedStartEle = childNodes[0];
        const stringQuotedEndEle = childNodes[childNodes.length - 1];
        const packageUrl = `https://www.npmjs.com/package/${packageName}`;
        stringQuotedEle.innerHTML = stringQuotedStartEle.innerHTML + `<a title="${packageUrl}" style="text-decoration: underline" href="${packageUrl}">${requireName}</a>` + stringQuotedEndEle.innerHTML;
      }

    }
  });

}