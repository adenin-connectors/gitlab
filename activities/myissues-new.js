'use strict';

const cfActivity = require('@adenin/cf-activity');;
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const userNameResponse = await api('/user');

    if (!cfActivity.isResponseOk(activity, userNameResponse)) {
      return;
    }

    let username = userNameResponse.body.username;
    let openIssuesUrl = `https://gitlab.com/dashboard/issues?assignee_username=${username}`;

    var dateRange = cfActivity.dateRange(activity, "today");
    const response = await api(`/issues?state=opened&scope=assigned_to_me&created_after=${dateRange.startDate}&created_before=${dateRange.endDate}`);

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    let ticketStatus = {
      title: 'Open Tickets',
      url: openIssuesUrl,
      urlLabel: 'All tickets',
    };

    let issueCount = response.body.length;

    if (issueCount != 0) {
      ticketStatus = {
        ...ticketStatus,
        description: `You have ${issueCount > 1 ? issueCount + " issues" : issueCount + " issue"} assigned`,
        color: 'blue',
        value: issueCount,
        actionable: true
      };
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: `You have no tickets assigned`,
        actionable: false
      };
    }

    activity.Response.Data = ticketStatus;
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};
