// @flow
declare function GM_xmlhttpRequest(agm: any): any;

import * as _ from 'underscore';
import Promise from 'bluebird';

interface Response$ {
  response: string,
  readyState: number,
  responseHeaders: any,
  responseText: string,
  status: number,
  statusText: string,
  context: any,
  finalUrl: string
}

type Options$<T> = {
  binary?: boolean,
  context?: any,
  data?: any,
  headers?: any,
  method: string,
  onabort(response: Response$): void,
  onerror(response: Response$): void,
  onload(): void,
  onprogress(): void,
  onreadystatechange(response: Response$): void,
  ontimeout(response: Response$): void,
  overrideMimeType?: string,
  user?: string,
  password?: string,
  synchronous: boolean,
  timeout?: number,
  upload?: any,
  url: string
}

interface DefaultRequestOptions$ {
  binary?: boolean,
  context?: any,
  data?: any,
  headers?: any,
  overrideMimeType?: string,
  user?: string,
  password?: string,
  synchronous?: boolean,
  timeout?: number,
  upload?: any
}

interface RequestOptions$ {
  binary?: boolean,
  context?: any,
  data?: any,
  headers?: any,
  method: string,
  overrideMimeType?: string,
  user?: string,
  password?: string,
  synchronous?: boolean,
  timeout?: number,
  upload?: any,
  url: string
}

interface GetOptions$ {
  binary?: boolean,
  context?: any,
  data?: any,
  headers?: any,
  overrideMimeType?: string,
  user?: string,
  password?: string,
  synchronous?: boolean,
  timeout?: number,
  upload?: any
}

interface PostOptions$ {
  binary?: boolean,
  context?: any,
  headers?: any,
  overrideMimeType?: string,
  user?: string,
  password?: string,
  synchronous?: boolean,
  timeout?: number,
  upload?: any
}

interface HeadOptions$ {
  binary?: boolean,
  context?: any,
  headers?: any,
  overrideMimeType?: string,
  user?: string,
  password?: string,
  synchronous?: boolean,
  timeout?: number,
  upload?: any
}

class Http {

  options: ?DefaultRequestOptions$;

  constructor(options?: DefaultRequestOptions$) {
    this.options = options;
  }

  request(requestOptions: RequestOptions$): Promise<Response$> {
    let options: Options$ = _.extend({}, this.options, requestOptions);
    let {onreadystatechange, onerror, onabort, ontimeout} = options;

    return new Promise(function (resolve, reject) {
      // options.synchronous = true;   // async
      options.onreadystatechange = function (response: Response$) {
        _.isFunction(onreadystatechange) && onreadystatechange.call(this, response);
        if (response.readyState !== 4) return;
        response.status >= 200 && response.status < 400 ? resolve(response) : reject(response);
      };

      options.onerror = function (response: Response$) {
        _.isFunction(onerror) && onerror.call(this, response);
        reject(response);
      };

      options.onabort = function (response: Response$) {
        _.isFunction(onabort) && onabort.call(this, response);
        reject(response);
      };

      options.ontimeout = function (response: Response$) {
        _.isFunction(ontimeout) && ontimeout.call(this, response);
        reject(response);
      };

      GM_xmlhttpRequest(_.extend({}, options));
    });
  }

  get(url: string, options?: GetOptions$): Promise<Response$> {
    const requestOptions: RequestOptions$ = _.extend(options || {}, {url, method: 'GET'});
    return this.request(requestOptions);
  }

  post(url: string, data: any, options?: PostOptions$): Promise<Response$> {
    return this.request(_.extend(options || {}, {url, method: 'POST', data}));
  }

  head(url: string, options?: HeadOptions$): Promise<Response$> {
    return this.request(_.extend(options || {}, {url, method: 'HEAD'}));
  }
}

const timeout = 5000;
let http = new Http({timeout});

export {http, timeout};