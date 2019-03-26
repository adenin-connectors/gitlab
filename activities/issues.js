'use strict';
const api = require('./common/api');

module.exports = async function (activity) {

  try {
    var pagination = Activity.pagination();
    const response = await api(`/issues?state=opened&scope=assigned_to_me&page=${pagination.page}&per_page=${pagination.pageSize}`);

    if (Activity.isErrorResponse(response)) return;

    activity.Response.Data = api.convertIssues(response);
  } catch (error) {
    if (Activity.isErrorResponse(response)) return;
  }
};