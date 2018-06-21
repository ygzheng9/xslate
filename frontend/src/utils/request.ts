import * as fetch from "dva/fetch";

function parseJSON(response: any) {
  return response.json();
}

interface IError extends Error {
  response: any;
}

function checkStatus(response: any) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  console.log(`checkStatus: ${response}`);
  const error: IError = {
    name: "",
    message: response.statusText,
    response
  };

  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
function request(url: string, options?: any) {
  // fetch 返回的结构中，第一层只有一个key，就是 data
  return fetch(url, options)
    .then(checkStatus)
    .then(parseJSON)
    .then(data => ({ data }))
    .catch(err => ({ err }));
}

export { request };
