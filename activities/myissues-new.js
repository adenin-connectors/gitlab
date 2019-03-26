'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    const userNameResponse = await api('/user');

    if (Activity.isErrorResponse(userNameResponse)) return;

    let username = userNameResponse.body.username;
    let openIssuesUrl = `https://gitlab.com/dashboard/issues?assignee_username=${username}`;

    var dateRange = Activity.dateRange("today");
    const response = await api(`/issues?state=opened&scope=assigned_to_me` +
      `&created_after=${dateRange.startDate}&created_before=${dateRange.endDate}`);

    if (Activity.isErrorResponse(response)) return;

    let ticketStatus = {
      title: T('New Open Issues'),
      url: openIssuesUrl,
      urlLabel: T('All Issues'),
    };

    let issueCount = response.body.length;
    
    if (issueCount != 0) {
      ticketStatus = {
        ...ticketStatus,
        description: issueCount > 1 ? T("You have {0} new issues assigned.", issueCount) : T("You have 1 new issue assigned."),
        color: 'blue',
        value: issueCount,
        actionable: true
      };
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: T(`You have no new issues assigned.`),
        actionable: false
      };
    }

    activity.Response.Data = ticketStatus;
  } catch (error) {
    Activity.handleError(error);
  }
};
