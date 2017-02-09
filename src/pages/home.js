// @flow
import gitParser from 'parse-github-url';
import Promise from 'bluebird';
import npm from '../npm';
import github from '../github';
import env from '../env';

export default function () {
  return async function homePageHandler(): Promise {
    document.querySelectorAll('.package-details .description').forEach((ele: HTMLElement) => ele.title = ele.innerText || ele.textContent);
  }
}