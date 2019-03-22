'use strict';
const logger = require('@adenin/cf-logger');
const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const response = await api(`/issues?state=opened&scope=assigned_to_me`);

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    activity.Response.Data = mapResponseToChartData(response);
  } catch (error) {
    cfActivity.handleError(error, activity);
  }
};

//** maps response data to data format usable by chart */
function mapResponseToChartData(response) {
  let labels = [];
  let datasets = [];
  let tickets = response.body;
  let data = [];

  let noLabelsCount = 0;

  //get all the used labels
  for (let i = 0; i < tickets.length; i++) {
    if (tickets[i].labels.length > 0) {
      for (let x = 0; x < tickets[i].labels.length; x++) {
        if (!labels.includes(tickets[i].labels[x])) {
          labels.push(tickets[i].labels[x]);
        }
      }
    } else {
      noLabelsCount++;
    }
  }

  //count each label in every ticket
  for (let i = 0; i < labels.length; i++) {
    let counter = 0;
    for (let x = 0; x < tickets.length; x++) {
      for (let y = 0; y < tickets[x].labels.length; y++) {
        if (labels[i] == tickets[x].labels[y]) {
          counter++;
        }
      }
    }
    data.push(counter);
  }
  labels.push('No Label');
  data.push(noLabelsCount);

  datasets.push({ label: 'Tickets Number', data });

  let chartData = {
    chart: {
      configuration: {
        data: {},
        options: {
          title: {
            display: true,
            text: 'Ticket Metrics By Label'
          }
        }
      },
      template: 'bar',
      palette: 'office.Office6'
    },
    _settings: {}
  };
  chartData.chart.configuration.data.labels = labels;
  chartData.chart.configuration.data.datasets = datasets;

  return chartData;
}