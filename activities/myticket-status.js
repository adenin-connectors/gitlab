'use strict';

const logger = require('@adenin/cf-logger');
const handleError = require('@adenin/cf-activity').handleError;
const api = require('./common/api');

module.exports = async (activity) => {
    try {
        api.initialize(activity);  

        const response = await api('/issues?state=opened');

        let ticketStatus ={};
        if(response.body.length!=0){
            ticketStatus = { 
                title: 'Open Tickets', 
                description: `You have ${response.body.length} tickets assigned`, 
                color: 'blue', 
                value: response.body.length, 
                url: response.body[0].web_url.replace('/'+response.body[0].iid,''), 
                urlLabel: 'All tickets', 
                actionable: true
            }
        }else{
            ticketStatus = { 
                title: 'Open Tickets', 
                description: `You have no tickets assigned`, 
                url: response.body[0].web_url.replace('/'+response.body[0].iid,''), 
                urlLabel: 'All tickets', 
                actionable: false
            }
        }

        activity.Response.Data = {
            message: ticketStatus
        };

    } catch (error) {
        handleError(error, activity);
    }

};
