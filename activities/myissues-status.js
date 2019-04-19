'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const userNameResponse = await api('/user');

    if ($.isErrorResponse(activity, userNameResponse)) return;

    let username = userNameResponse.body.username;
    let openIssuesUrl = `https://gitlab.com/dashboard/issues?assignee_username=${username}`;

    const response = await api('/issues?state=opened&scope=assigned_to_me');

    if ($.isErrorResponse(activity, response)) return;

    let ticketStatus = {
      title: T(activity, 'Open Issues'),
      link: openIssuesUrl,
      linkLabel: T(activity, 'All Issues'),
    };

    let issueCount = response.body.length;

    if (issueCount != 0) {
      ticketStatus = {
        ...ticketStatus,
        description: issueCount > 1 ? T(activity, "You have {0} assigned issues.", issueCount) : T(activity, "You have 1 assigned issue."),
        color: 'blue',
        value: issueCount,
        actionable: true
      };
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: T(activity, `You have no issues assigned.`),
        actionable: false
      };
    }

    activity.Response.Data = ticketStatus;
  } catch (error) {
    $.handleError(activity, error);
  }
};
