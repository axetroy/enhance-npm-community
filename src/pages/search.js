// @flow
import gitParser from 'parse-github-url';
import Promise from 'bluebird';
import npm from '../npm';
import github from '../github';
import {debounce} from '../utils';
import env from '../env';

const __pushState__ = history.pushState;

window.history["pushState"] = debounce(function () {
  searchPageHandler();
  return __pushState__.apply(this, arguments);
}, 100);

async function searchPageHandler(): Promise {
  document.querySelectorAll('.github-info').forEach((ele) => ele.remove());
  const searchResults = document.querySelectorAll('.package-details');
  searchResults.forEach(async(detailEle: any) => {
    const nameEle: HTMLAnchorElement = detailEle.querySelector('.name');
    const name: string = nameEle.innerText || nameEle.textContent;
    const npmPackage = await npm.fetchPackageInfo(name);
    let repoInfo = gitParser(npmPackage.repository.url);

    env.dev && detailEle.setAttribute('repository-info', JSON.stringify(repoInfo));

    if (!repoInfo) {
      return console.error(`can't parse ${npmPackage.repository.url}`);
    }

    if (repoInfo.host !== 'github.com') {
      return console.error(`${repoInfo.href} is not a github repository`);
    }

    let gitRepoInfo = await github.fetchRepoInfo(repoInfo.repo);

    env.dev && detailEle.setAttribute('github-info', JSON.stringify(gitRepoInfo));

    let {container} = github.createWidget('span')({
      watch: gitRepoInfo.subscribers_count,
      star: gitRepoInfo.watchers_count,
      fork: gitRepoInfo.forks_count
    });
    container.style.display = 'inline-block';
    container.style.marginLeft = '5px';
    detailEle.querySelector('h3').appendChild(container);
  });
}

export default function () {
  return searchPageHandler;
}