'use strict';

const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const response = await api('/issues?state=opened&scope=assigned_to_me&per_page=100');

    if ($.isErrorResponse(activity, response)) return;

    const pagination = $.pagination(activity);
    const items = api.paginateItems(response.body, pagination);

    activity.Response.Data.items = api.convertIssues(items);

    if (parseInt(pagination.page) === 1) {
      const value = response.body.length;

      activity.Response.Data.title = T(activity, 'Open Issues');
      activity.Response.Data.linkLabel = T(activity, 'All Issues');
      activity.Response.Data.actionable = value > 0;
      activity.Response.Data.thumbnail = 'https://www.adenin.com/assets/images/wp-images/logo/gitlab.svg';

      if (value > 0) {
        activity.Response.Data.value = value;
        activity.Response.Data.link = `https://gitlab.com/dashboard/issues?assignee_username=${response.body[0].assignee.username}`;
        activity.Response.Data.description = value > 1 ? T(activity, 'You have {0} open issues assigned.', value) : T(activity, 'You have 1 open issue assigned.');
        activity.Response.Data.briefing = activity.Response.Data.description + ` The latest is <b>${activity.Response.Data.items[0].title}</b>`;
        activity.Response.Data.date = activity.Response.Data.items[0].date;
      } else {
        activity.Response.Data.description = T(activity, 'You have no open issues assigned.');

        // because we have username in response items, we only need this request if the response array was empty
        const usernameResponse = await api('/user');

        if ($.isErrorResponse(activity, usernameResponse)) return;

        activity.Response.Data.link = `https://gitlab.com/dashboard/issues?assignee_username=${usernameResponse.body.username}`;
      }
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};
