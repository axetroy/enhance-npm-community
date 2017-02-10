// @flow

const npmPackage = require('./package.json');

const meta = `// ==UserScript==
// @name              ${npmPackage.name}
// @author            ${npmPackage.author}
// @description       ${npmPackage.description}
// @version           ${npmPackage.version}
// @grant             GM_xmlhttpRequest
// @include           *www.npmjs.com*
// @connect           *
// @compatible        chrome  完美运行
// @compatible        firefox  完美运行
// @supportURL        http://www.burningall.com
// @run-at            document-end
// @contributionURL   troy450409405@gmail.com|alipay.com
// @downloadURL       https://github.com/axetroy/enhance-npm-community/raw/master/dist/enhance-npm-community.min.user.js
// @namespace         https://greasyfork.org/zh-CN/users/3400-axetroy
// @license           The MIT License (MIT); http://opensource.org/licenses/MIT
// ==/UserScript==

// Github源码: https://github.com/axetroy/enhance-npm-community
`;

module.exports = meta;