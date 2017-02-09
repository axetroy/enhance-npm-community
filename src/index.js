// @flow
import {printError} from './utils';

import detailPageHandler from './pages/detail';
import searchPageHandler from './pages/search';
import browsePageHandler from './pages/browse';
import homePageHandler from './pages/home';

init();

async function init() {
  let href: string = window.location.href;
  if (href.indexOf("package") >= 0) {
    detailPageHandler()().catch(printError);
  }
  else if (href.indexOf('search') >= 0) {
    searchPageHandler()().catch(printError);
  }
  else if (href.indexOf('browse') >= 0) {
    browsePageHandler()().catch(printError);
  }
  else {
    homePageHandler()().catch(printError);
  }
}