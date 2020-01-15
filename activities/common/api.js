'use strict';

const got = require('got');

const HttpAgent = require('agentkeepalive');
const HttpsAgent = HttpAgent.HttpsAgent;

const {Remarkable} = require('remarkable');
const converter = new Remarkable();

let _activity = null;

function api(path, opts) {
  if (typeof path !== 'string') {
    return Promise.reject(new TypeError(`Expected \`path\` to be a string, got ${typeof path}`));
  }

  opts = Object.assign({
    json: true,
    token: _activity.Context.connector.token,
    endpoint: 'https://GitLab.com/api/v4',
    agent: {
      http: new HttpAgent(),
      https: new HttpsAgent()
    }
  }, opts);

  opts.headers = Object.assign({
    accept: 'application/json',
    'user-agent': 'adenin Digital Assistant Connector, https://www.adenin.com/digital-assistant'
  }, opts.headers);

  if (opts.token) opts.headers.Authorization = `Bearer ${opts.token}`;

  const url = /^http(s)\:\/\/?/.test(path) && opts.endpoint ? path : opts.endpoint + path;

  if (opts.stream) return got.stream(url, opts);

  return got(url, opts).catch((err) => {
    throw err;
  });
}

api.convertIssues = (issues) => {
  const items = [];

  for (let i = 0; i < issues.length; i++) {
    const raw = issues[i];
    const item = {
      id: raw.id,
      title: raw.title,
      description: converter.render(raw.description),
      date: raw.created_at,
      link: raw.web_url,
      thumbnail: raw.author.avatar_url ? raw.author.avatar_url : $.avatarLink(raw.author.name),
      imageIsAvatar: true
    };

    items.push(item);
  }

  return items;
};

api.paginateItems = (items, pagination) => {
  const paginatedItems = [];
  const pageSize = parseInt(pagination.pageSize);
  const offset = (parseInt(pagination.page) - 1) * pageSize;

  if (offset > items.length) return paginatedItems;

  for (let i = offset; i < offset + pageSize; i++) {
    if (i >= items.length) break;

    paginatedItems.push(items[i]);
  }

  return paginatedItems;
};

const helpers = [
  'get',
  'post',
  'put',
  'patch',
  'head',
  'delete'
];

api.initialize = (activity) => {
  _activity = activity;
};

api.stream = (url, opts) => api(url, Object.assign({}, opts, {
  json: false,
  stream: true
}));

for (const x of helpers) {
  const method = x.toUpperCase();
  api[x] = (url, opts) => api(url, Object.assign({}, opts, {method}));
  api.stream[x] = (url, opts) => api.stream(url, Object.assign({}, opts, {method}));
}

module.exports = api;
