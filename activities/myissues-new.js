'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const userNameResponse = await api('/user');

    if ($.isErrorResponse(activity, userNameResponse)) return;

    let username = userNameResponse.body.username;
    let openIssuesUrl = `https://gitlab.com/dashboard/issues?assignee_username=${username}`;

    var dateRange = $.dateRange(activity, "today");
    const response = await api(`/issues?state=opened&scope=assigned_to_me` +
      `&created_after=${dateRange.startDate}&created_before=${dateRange.endDate}`);

    if ($.isErrorResponse(activity, response)) return;

    let ticketStatus = {
      title: T(activity, 'New Open Issues'),
      link: openIssuesUrl,
      linkLabel: T(activity, 'All Issues'),
    };

    let issueCount = response.body.length;

    if (issueCount != 0) {
      ticketStatus = {
        ...ticketStatus,
        description: issueCount > 1 ? T(activity, "You have {0} new issues assigned.", issueCount) : T(activity, "You have 1 new issue assigned."),
        color: 'blue',
        value: issueCount,
        actionable: true
      };
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: T(activity, `You have no new issues assigned.`),
        actionable: false
      };
    }

    activity.Response.Data = ticketStatus;
  } catch (error) {
    $.handleError(activity, error);
  }
};
