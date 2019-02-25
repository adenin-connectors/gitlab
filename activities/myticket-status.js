'use strict';

const logger = require('@adenin/cf-logger');
const handleError = require('@adenin/cf-activity').handleError;
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const userNameResponse = await api('/user');

    let username = userNameResponse.body.username;
    let openIssuesUrl = `https://gitlab.com/dashboard/issues?assignee_username=${username}`;

    const response = await api('/issues?state=opened&scope=assigned_to_me');

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
      }
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: `You have no tickets assigned`,
        actionable: false
      }
    }

    activity.Response.Data = ticketStatus;

  } catch (error) {
    handleError(error, activity);
  }
};
