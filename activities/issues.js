'use strict';
const api = require('./common/api');
/////////////////////////////////////////////////////////////////////////////////
//THIS ACTIVITY IS NOT FINISHED, IT NEEDS ADITIONAL FITLERING TO GET ALL ISSUES//
/////////////////////////////////////////////////////////////////////////////////
module.exports = async function (activity) {
  try {
    api.initialize(activity);
    const usernameResponse = await api('/user');
    if ($.isErrorResponse(activity, usernameResponse)) return;

    let username = usernameResponse.body.username;
    let openIssuesUrl = `https://gitlab.com/dashboard/issues?assignee_username=${username}`;

    var dateRange = $.dateRange(activity);
    var pagination = $.pagination(activity);
    const response = await api(`/issues?state=all&scope=all&page=${pagination.page}&per_page=${pagination.pageSize}` +
      `&created_after=${dateRange.startDate}&created_before=${dateRange.endDate}&order_by=created_at&sort=desc`);

    if ($.isErrorResponse(activity, response)) return;

    activity.Response.Data.items = api.convertIssues(response.body);
    if (parseInt(pagination.page) == 1) {
      let value = activity.Response.Data.length;
      activity.Response.Data.title = T(activity, 'All Issues');
      activity.Response.Data.link = openIssuesUrl;
      activity.Response.Data.linkLabel = T(activity, 'All Issues');
      activity.Response.Data.actionable = value > 0;

      if (value > 0) {
        activity.Response.Data.value = value;
        activity.Response.Data.date = activity.Response.Data.items[0].date;
        activity.Response.Data.color = 'blue';
        activity.Response.Data.description = value > 1 ? T(activity, "There are {0} issues on Gitlab.", value)
          : T(activity, "There is 1 issue on Gitlab.");
      } else {
        activity.Response.Data.description = T(activity, 'There are no issues on Gitlab');
      }
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};