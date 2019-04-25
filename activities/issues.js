'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    api.initialize(activity)
    var pagination = $.pagination(activity);
    const response = await api(`/issues?state=opened&scope=assigned_to_me&page=${pagination.page}&per_page=${pagination.pageSize}`);

    if ($.isErrorResponse(activity, response)) return;

    activity.Response.Data = api.convertIssues(response);
  } catch (error) {
    $.handleError(activity, error);
  }
};