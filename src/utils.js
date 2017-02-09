// @flow

import Promise from 'bluebird';
import __debounce__ from 'debounce';

export function jsonify(func: Function): Promise<Object> {
  return function () {
    return func.apply(this, arguments)
      .then(data => {
        let text = data.responseText;
        try {
          let json = JSON.parse(text);
          return Promise.resolve(json);
        } catch (err) {
          return Promise.reject(err);
        }
      }).catch(err => Promise.reject(err));
  }
}

export function numFormat(num: number): string {
  return num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').replace(/\.\d+/, '');
}

export function sleep(ms: number) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve();
    }, ms)
  });
}

export function debounce() {
  return __debounce__.apply(this, arguments);
}

export function print(msg) {
  console.log(msg);
}

export function printError(err) {
  console.error(err);
}

export function diffDays(from, to): number {
  let fromDate = new Date(from);
  let toDate = new Date(to);
  return Math.ceil((Math.abs(fromDate - toDate)) / 1000 / 3600 / 24);
}