'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {

    // validate X-Gitlab-Token header
    if (!activity.Context.connector.custom1 || (activity.Context.connector.custom1 != activity.Request.Headers["X-Gitlab-Token"])) {
      activity.Response.ErrorCode = 403;
      activity.Response.Data = {
        ErrorText: "invalid X-Gitlab-Token"
      }
      return;
    }

    var request = activity.Request.Data;
    var entity = {};
    var collections = [];

    switch (request.object_kind) {

      case "issue":

        let date = new Date(request.object_attributes.updated_at).toJSON();
        entity = {
          _type: "issue",
          id: "" + request.object_attributes.id,
          title: request.object_attributes.title,
          description: request.object_attributes.description,
          date: date,
          link: request.object_attributes.url
        };

        const action = request.object_attributes.action;
        if (action == "open" || action == "update" || action == "close") {
          api.initialize(activity);

          let promises = [];
          for (let i = 0; i < request.object_attributes.assignee_ids.length; i++) {
            promises.push(api(`/users/${request.object_attributes.assignee_ids[i]}`));
          }
          // also get owner's info
          promises.push(api(`/users/${request.object_attributes.author_id}`));


          const responses = await Promise.all(promises);
          for (let i = 0; i < responses.length; i++) {
            if ($.isErrorResponse(activity, responses[i])) return;
          }

          let userMails = [];
          for (let i = 0; i < responses.length - 1; i++) {
            if (responses[i].body.public_email != "") {
              userMails.push(responses[i].body.public_email);
            }
          }

          // roles assigned to user
          let roles = [];

          // case 1: A collection "all" is returned with users and roles
          collections.push({ name: "all", users: userMails, roles: roles, date: date });

          if (action != "close") {

            // case 2: When open == true we return collection “open”, with users and roles
            collections.push({ name: "open", users: userMails, roles: roles, date: date });

            // case 3: When AssignedTo is not empty and open we return a collection “my”, with only users: AssignedTo
            // if assignedTo is empty we use roles instead
            if (userMails.length > 0) {
              collections.push({ name: "my", users: userMails, roles: [], date: date });
            } else {
              collections.push({ name: "my", users: [], roles: roles, date: date });
            }

            // case 4: When DueDate is provided and open we return a collection “due”, with users and roles; date = DueDate
            collections.push({ name: "due", users: userMails, roles: roles, date: date });

            let dueDate = null;
            if (request.object_attributes.due_date) {
              dueDate = new Date(request.object_attributes.due_date).toISOString();
            }
            // case 5: When DueDate is provided and open we return a collection “my-due”, with only users: AssignedTo, date = DueDate
            // if assignedTo is empty we use roles
            if (userMails.length > 0) {
              collections.push({ name: "my-due", users: userMails, roles: [], date: dueDate || date });
            } else {
              collections.push({ name: "my-due", users: [], roles: roles, date: dueDate || date });
            }
          }
        }
        break;

      default:
        // ignore unknown object_kinds
        break;

    }
    activity.Response.Data = { entity: entity, collections: collections };
  } catch (error) {
    $.handleError(activity, error);
  }
};
