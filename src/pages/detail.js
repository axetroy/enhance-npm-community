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
  span.innerHTML = (tag ? `<strong style="color: ${tag.color}">@${tag.name}</strong> ` : '') + `last commit at <strong style="color: #283546;">${new Timeago().format(date)}</strong>`;
  span.style.color = 'rgba(0, 0, 0, 0.6)';
  span.style.fontSize = '16px';
  span.style.verticalAlign = 'middle';
  return span;
}

export default function () {


  return async function detailPageHandler(): Promise {

    parseJSCodeBlock();   // parse require('xxx') | import xxx from
    parseShellCodeBlock();   // parse require('xxx') | import xxx from

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
    const span = generateOutdatedWarning(lastCommitter.date, commitFromNowDiffDays);
    document.querySelector('.package-name').appendChild(span);

    window.document.querySelector('.box').insertBefore(container, githubLink.parentNode);
  }

}

function getElementText(ele) {
  return ele.innerText || ele.textContent;
}

function parseJSCodeBlock() {
  const js = document.querySelectorAll('.highlight.js pre .line .source');
  const javascript = document.querySelectorAll('.highlight.javascript pre .line .source');
  const lines = [].slice.call(js).concat(...javascript);

  try {
    lines.forEach(function (line) {
      if (line.innerHTML.match(/require|from|import/g)) {

        (line.querySelectorAll('.string.quoted') || line.querySelectorAll('.import .string.quoted')).forEach(function (stringQuotedEle) {
          if (!stringQuotedEle) return;

          const requireName = getElementText(stringQuotedEle).trim().replace(/^['"]|['"]$/g, '');

          if (/^\./.test(requireName)) return;    // 不支持相对路径

          const packageNameMatch = requireName.match(/(^\@[^\/]+\/[^\/]+)|([^\/]+)/) || [];
          const packageName = packageNameMatch[0];

          if (env.dev) {
            console.info('[Parse Javascript]: ' + requireName + ' >>> ' + packageName);
          }

          // 正确解析才渲染页面
          if (packageName) {
            const childNodes = stringQuotedEle.children;
            const stringQuotedStartEle = childNodes[0];
            const stringQuotedEndEle = childNodes[childNodes.length - 1];
            const packageUrl = `https://www.npmjs.com/package/${packageName}`;
            stringQuotedEle.innerHTML = stringQuotedStartEle.innerHTML + `<a title="${packageUrl}" style="text-decoration: underline" href="${packageUrl}">${requireName}</a>` + stringQuotedEndEle.innerHTML;
          }
        });

      }
    });
  } catch (err) {
    console.error(err);
  }

}

function parseShellCodeBlock() {
  const sh = document.querySelectorAll('.highlight.sh pre .line .source');
  const bash = document.querySelectorAll('.highlight.bash pre .line');
  const noTag = document.querySelectorAll('pre:not(.highlight) code');
  const lines = [].slice.call(sh).concat(...bash).concat(...noTag);

  try {
    lines.forEach(function (line) {
      const match = getElementText(line).trim().replace(/^\$\s*/, '').match(/(npm)\s+(install)\s+((--?[\w]+\s)?|\s+)+([\w\-\@\.\_\/]+)/g);
      if (match && match.length) {

        const matchStr = match[0].trim();

        const commands = matchStr.split(/\s+/g).map(v => v.trim());
        let command = '', action = '', target = '';
        const argv = [];

        commands.forEach(function (str, index) {
          if (index === 0) return command = str;
          if (index === 1) return action = str;

          // argv
          if (/^\-/.test(str)) {
            argv.push(str);
          } else {
            target = str;
          }
        });

        let packageName = (target || '').trim();

        // 处理一些带有版本的命令
        // example: npm install @reactivex/rxjs@5.0.0
        // example: npm install -g express-generator@4
        packageName = packageName.replace(/([^\s])\@[\.\w\-]+$/, '$1');

        if (env.dev) {
          console.log('[Parse Shell]: ' + matchStr + ' >>> ' + packageName);
        }

        if (packageName) {
          const packageUrl = `https://www.npmjs.com/package/${packageName}`;
          line.innerHTML = line.innerHTML
            .replace(/\&nbsp\;/g, ' ')    // remove empty string
            .replace(target, `<a style="text-decoration: underline" title="${packageUrl}" href="${packageUrl}">${target}</a>`);
        }
      }
    });
  } catch (err) {
    console.error(err);
  }

}