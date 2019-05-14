'use strict';

module.exports = async (activity) => {
  try {

    // validate X-Gitlab-Token header
    if (activity.Context.connector.custom1 != activity.Request.Headers["X-Gitlab-Token"]) {
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
          id: ""+request.object_attributes.id,
          title: request.object_attributes.title,
          description: request.object_attributes.description,
          date: date,
          link: request.object_attributes.url
        }

        // *todo* get email addresses, decide if issue is closed
        collections.push({ name: "my", users: ["support@adenin.com"], date: date });
        collections.push({ name: "open", users: ["ma@adenin.com", "support@adenin.com"], date: date });
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
