'use strict';
const api = require('./common/api');
/////////////////////////////////////////////////////////////////////////////////
//THIS ACTIVITY IS NOT FINISHED, IT NEEDS ADITIONAL FITLERING TO GET ALL ISSUES//
/////////////////////////////////////////////////////////////////////////////////
module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const usernameResponse = await api('/user');
    if ($.isErrorResponse(activity, usernameResponse)) return;

    let username = usernameResponse.body.username;
    let openIssuesUrl = `https://gitlab.com/dashboard/issues?assignee_username=${username}`;

    var dateRange = $.dateRange(activity, "today");
    var pagination = $.pagination(activity);
    const response = await api(`/issues?state=opened&scope=all` +
      `&created_after=${dateRange.startDate}&created_before=${dateRange.endDate}` +
      `&page=${pagination.page}&per_page=${pagination.pageSize}`);

    if ($.isErrorResponse(activity, response)) return;

    activity.Response.Data.items = api.convertIssues(response);
    let value = activity.Response.Data.items.items.length;
    activity.Response.Data.title = T(activity, 'New Open Issues');
    activity.Response.Data.link = openIssuesUrl;
    activity.Response.Data.linkLabel = T(activity, 'All Issues');
    activity.Response.Data.actionable = value > 0;

    if (value > 0) {
      activity.Response.Data.value = value;
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} new issues assigned.", value)
        : T(activity, "You have 1 new issue assigned.");
    } else {
      activity.Response.Data.description = T(activity, `You have no new issues assigned.`);
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};
