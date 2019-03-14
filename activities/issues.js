'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async function (activity) {

  try {
    api.initialize(activity);
    var pagination = cfActivity.pagination(activity);
    const response = await api(`/issues?state=opened&scope=assigned_to_me&page=${pagination.page}&per_page=${pagination.pageSize}`);

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    activity.Response.Data = api.convertIssues(response);
  } catch (error) {

    cfActivity.handleError(activity, error);
  }
};