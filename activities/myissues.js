'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    api.initialize(activity);
    let allIssues = [];
    const usernameResponse = await api('/user');
    if ($.isErrorResponse(activity, usernameResponse)) return;

    let username = usernameResponse.body.username;
    let openIssuesUrl = `https://gitlab.com/dashboard/issues?assignee_username=${username}`;

    var dateRange = $.dateRange(activity, "today");
    let page = 1;
    let maxResults = 100;
    let response = await api(`/issues?state=opened&scope=assigned_to_me&page=${page}&per_page=${maxResults}` +
      `&created_after=${dateRange.startDate}&created_before=${dateRange.endDate}&order_by=created_at&sort=desc`);
    if ($.isErrorResponse(activity, response)) return;
    allIssues.push(...response.body);

    let hasMore = false;
    if (response.body.length == maxResults) {
      hasMore = true;
    }

    while (hasMore) {
      page++;
      response = await api(`/issues?state=opened&scope=assigned_to_me&page=${page}&per_page=${maxResults}` +
        `&created_after=${dateRange.startDate}&created_before=${dateRange.endDate}&order_by=created_at&sort=desc`);
      if ($.isErrorResponse(activity, response)) return;
      allIssues.push(...response.body);
      if (response.body.length != maxResults) {
        hasMore = false;
      }
    }
    let value = allIssues.length;
    let pagination = $.pagination(activity);
    let pagiantedItems = paginateItems(allIssues, pagination);

    activity.Response.Data.items = api.convertIssues(pagiantedItems);
    activity.Response.Data.title = T(activity, 'Open Issues');
    activity.Response.Data.link = openIssuesUrl;
    activity.Response.Data.linkLabel = T(activity, 'All Issues');
    activity.Response.Data.actionable = value > 0;

    if (value > 0) {
      activity.Response.Data.value = value;
      activity.Response.Data.date = activity.Response.Data.items[0].date;
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} assigned issues.", value)
        : T(activity, "You have 1 assigned issue.");
    } else {
      activity.Response.Data.description = T(activity, `You have no issues assigned.`);
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};

//** paginate items[] based on provided pagination */
function paginateItems(items, pagination) {
  let pagiantedItems = [];
  const pageSize = parseInt(pagination.pageSize);
  const offset = (parseInt(pagination.page) - 1) * pageSize;

  if (offset > items.length) return pagiantedItems;

  for (let i = offset; i < offset + pageSize; i++) {
    if (i >= items.length) {
      break;
    }
    pagiantedItems.push(items[i]);
  }
  return pagiantedItems;
}