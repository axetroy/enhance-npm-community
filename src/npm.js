// @flow

import {http} from './http';
import {jsonify} from './utils';

const registry = 'https://registry.npm.taobao.org';

function fetchPackageInfo(name) {
  return http.get(`${registry}/${name.trim()}/latest`)
}

export default {
  fetchPackageInfo: jsonify(fetchPackageInfo)
}