// @flow

import Promise from 'bluebird';
import gitParser from 'parse-github-url';
import {http} from './http';

const env = {
  dev: process.env.NODE_ENV === "development",
  prod: process.env.NODE_ENV === "production"
};

const github = {
  clientId: 'b8257841dd7ca5eef2aa',
  clinetSecret: '4da33dd6fcb0a01d395945ad18613ecf9c12079e'
};

const icon = {
  github: createSvg({
    path: 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z',
    width: 14,
    height: 14
  }),
  watch: createSvg({
    path: 'M8.06 2C3 2 0 8 0 8s3 6 8.06 6C13 14 16 8 16 8s-3-6-7.94-6zM8 12c-2.2 0-4-1.78-4-4 0-2.2 1.8-4 4-4 2.22 0 4 1.8 4 4 0 2.22-1.78 4-4 4zm2-4c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z',
    width: 14,
    height: 14
  }),
  star: createSvg({
    path: 'M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74z',
    width: 14,
    height: 14
  }),
  fork: createSvg({
    path: 'M8 1a1.993 1.993 0 0 0-1 3.72V6L5 8 3 6V4.72A1.993 1.993 0 0 0 2 1a1.993 1.993 0 0 0-1 3.72V6.5l3 3v1.78A1.993 1.993 0 0 0 5 15a1.993 1.993 0 0 0 1-3.72V9.5l3-3V4.72A1.993 1.993 0 0 0 8 1zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3 10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3-10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z',
    width: 12,
    height: 14
  })
};

init();

async function init() {
  let href: string = window.location.href;
  if (href.indexOf("package") >= 0) {
    detailPageHandler();
  }
  else if (href.indexOf('search') >= 0) {
    searchPageHandler();
  }
  else if (href.indexOf('browse') >= 0) {
    packageList();
  }
  else {
    homePageHandler();
  }
}

async function detailPageHandler(): Promise {
  const github: HTMLAnchorElement = window.document.querySelector('.box a[href*=github]');
  if (!github) return;
  github.title = github.href;
  const repo: Object = await getGithubRepoInfo(github.pathname);

  const li = document.createElement('li');
  const span: HTMLSpanElement = document.createElement('span');
  span.style.width = '33.33%';
  span.style.display = 'inline-block';
  let arr = [
    {
      "key": "Watch",
      "value": repo["subscribers_count"]
    },
    {
      "key": "Star",
      "value": repo["watchers_count"]
    },
    {
      "key": "Fork",
      "value": repo["forks_count"]
    }
  ];
  arr.forEach((obj) => {
    const chunk: HTMLSpanElement = span.cloneNode(false);
    chunk.innerHTML = `${obj.key} <strong>${obj.value}</strong>`;
    li.appendChild(chunk);
  });

  window.document.querySelector('.box').insertBefore(li, github.parentNode);

}

async function packageList(): Promise {
  const span: HTMLSpanElement = document.createElement('span');

  document.querySelectorAll('ul.columnar>li .description').forEach((ele: HTMLElement) => {
    ele.title = ele.innerText || ele.textContent;
  });

  document.querySelectorAll('ul.columnar>li').forEach(async(ele: any) => {
    let aEle = ele.querySelector('a.name');
    let name: string = aEle.innerText || aEle.textContent;
    let info = await JSONIfyHttpResponse(http.get(`https://registry.npm.taobao.org/${name.trim()}/latest`));

    env.dev && ele.setAttribute('package', JSON.stringify(info));

    if (!info.repository) {
      return console.error(`${info.name} doesn't has repository field`);
    }

    let repoInfo = gitParser(info.repository.url);

    env.dev && ele.setAttribute('repository-info', JSON.stringify(repoInfo));

    if (!repoInfo) {
      return console.error(`can't parse ${info.repository.url}`);
    }

    if (repoInfo.host !== 'github.com') {
      return console.error(`${repoInfo.href} is not a github repository`);
    }

    let gitRepoInfo = await getGithubRepoInfo(repoInfo.repo);

    env.dev && ele.setAttribute('github-info', JSON.stringify(gitRepoInfo));

    let {container, watch, star, fork} = createGitInfoEle('p');
    container.classList.add('description');
    container.style.verticalAlign = 'middle';
    watch.innerHTML += '&nbsp;' + numFormat(gitRepoInfo["subscribers_count"]) + '&nbsp;';
    star.innerHTML += '&nbsp;' + numFormat(gitRepoInfo["watchers_count"]) + '&nbsp;';
    fork.innerHTML += '&nbsp;' + numFormat(gitRepoInfo["forks_count"]);

    ele.querySelector('.package-details').appendChild(container);
  });

}

function searchPageHandler(): void {

}

function homePageHandler(): void {

}

function createGitInfoEle(containerTagName) {
  const container = document.createElement(containerTagName);
  const span: HTMLSpanElement = document.createElement('span');
  span.style.display = 'inline-block';

  const watch: HTMLSpanElement = span.cloneNode(false);
  const star: HTMLSpanElement = span.cloneNode(false);
  const fork: HTMLSpanElement = span.cloneNode(false);

  container.appendChild(watch);
  container.appendChild(star);
  container.appendChild(fork);

  watch.appendChild(icon.watch);
  star.appendChild(icon.star);
  fork.appendChild(icon.fork);

  return {container, watch, star, fork};
}

function JSONIfyHttpResponse(promise) {
  return promise.then(data => {
    let text = data.responseText;
    try {
      let json = JSON.parse(text);
      return Promise.resolve(json);
    } catch (err) {
      return Promise.reject(err);
    }
  }).catch(err => Promise.reject(err));
}

function createSvg({path, width, height}) {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  const p = document.createElementNS(NS, "path");
  svg.setAttribute('version', '1.1');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);

  p.setAttributeNS(null, "fill-rule", "evenodd");
  p.setAttributeNS(null, "d", path);
  svg.appendChild(p);
  return svg;
}

function numFormat(num: number): string {
  return num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').replace(/\.\d+/, '');
}

/**
 * get github repo info
 * @param githubRepoPath  example: /axetroy/git-clone/cli
 * @returns {*}
 */
function getGithubRepoInfo(githubRepoPath: string): Promise {
  return JSONIfyHttpResponse(http.get(`https://api.github.com/repos/${githubRepoPath.trim().replace(/^\/+/g, '')}?client_id=${github.clientId}&client_secret=${github.clinetSecret}`));
}