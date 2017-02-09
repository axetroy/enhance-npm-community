// @flow

import Promise from 'bluebird';
import {http} from './http';
import {jsonify, numFormat} from './utils';
import svg from './svg';

const GITHUB_API = 'https://api.github.com';
const CLIENT_ID: string = 'b8257841dd7ca5eef2aa';
const CLIENT_SECRET: string = '4da33dd6fcb0a01d395945ad18613ecf9c12079e';

function fetchRepoInfo(githubRepoPath: string): Promise {
  return http.get(`${GITHUB_API}/repos/${githubRepoPath.trim().replace(/^\/+/g, '')}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`);
}

function fetchUserInfo(username: string) {
  return http.get(`${GITHUB_API}/users/${username}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`)
}

function fetchRepoBranchInfo(githubRepoPath: string, branch: string) {
  return http.get(`${GITHUB_API}/repos/${githubRepoPath.trim().replace(/^\/+/g, '')}/branches/${branch}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`);
}

function createWidget(containerTagName: string) {
  const container = document.createElement(containerTagName);
  const span: HTMLSpanElement = document.createElement('span');
  container.style.verticalAlign = 'text-bottom';
  container.classList.add('github-info');
  span.style.display = 'inline-block';
  return function ({watch, star, fork}) {


    const watchEle: HTMLSpanElement = span.cloneNode(false);
    const starEle: HTMLSpanElement = span.cloneNode(false);
    const forkEle: HTMLSpanElement = span.cloneNode(false);

    watchEle.appendChild(svg.watch);
    starEle.appendChild(svg.star);
    forkEle.appendChild(svg.fork);

    watchEle.innerHTML += '&nbsp;' + numFormat(watch) + '&nbsp;';
    starEle.innerHTML += '&nbsp;' + numFormat(star) + '&nbsp;';
    forkEle.innerHTML += '&nbsp;' + numFormat(fork);

    container.appendChild(watchEle);
    container.appendChild(starEle);
    container.appendChild(forkEle);

    return {container, watch: watchEle, star: starEle, fork: forkEle};
  }
}

export default {
  fetchUserInfo: jsonify(fetchUserInfo),
  fetchRepoInfo: jsonify(fetchRepoInfo),
  fetchRepoBranchInfo: jsonify(fetchRepoBranchInfo),
  createWidget: createWidget
}