// @flow
import gitParser from 'parse-github-url';
import Promise from 'bluebird';
import npm from '../npm';
import github from '../github';
import env from '../env';

export default function () {
  return async function browserPageHandler(): Promise {
    const span: HTMLSpanElement = document.createElement('span');

    document.querySelectorAll('ul.columnar>li .description').forEach((ele: HTMLElement) => ele.title = ele.innerText || ele.textContent);

    document.querySelectorAll('ul.columnar>li').forEach(async(ele: any) => {
      let aEle = ele.querySelector('a.name');
      let name: string = aEle.innerText || aEle.textContent;
      let npmPackage = await npm.fetchPackageInfo(name);

      env.dev && ele.setAttribute('package', JSON.stringify(npmPackage));

      if (!npmPackage.repository) {
        return console.error(`${npmPackage.name} doesn't has repository field`);
      }

      let repoInfo = gitParser(npmPackage.repository.url);

      env.dev && ele.setAttribute('repository-info', JSON.stringify(repoInfo));

      if (!repoInfo) {
        return console.error(`can't parse ${npmPackage.repository.url}`);
      }

      if (repoInfo.host !== 'github.com') {
        return console.error(`${repoInfo.href} is not a github repository`);
      }

      let gitRepoInfo = await github.fetchRepoInfo(repoInfo.repo);

      env.dev && ele.setAttribute('github-info', JSON.stringify(gitRepoInfo));

      let {container} = github.createWidget('span')({
        watch: gitRepoInfo.subscribers_count,
        star: gitRepoInfo.watchers_count,
        fork: gitRepoInfo.forks_count
      });
      container.classList.add('description');
      ele.querySelector('.package-details h3').appendChild(container);
    });

  }
}