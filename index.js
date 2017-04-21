'use strict';

const express = require('express');
const bodyParser = require('body-parser');


const restService = express();
restService.use(bodyParser.json());

restService.get('/test', function (req, res) {
  return res.json({
            speech: "hello speech",
            displayText: "hello text",
            source: 'grafton-soccer-webhook'
        });

});

restService.post('/echo', function(req, res) {
    var speech = req.body.result && req.body.result.parameters && req.body.result.parameters.echoText ? req.body.result.parameters.echoText : "Seems like some problem. Speak again."
    return res.json({
        speech: speech,
        displayText: speech,
        source: 'webhook-echo-sample'
    });
});

restService.post('/hook', function (req, res) {

    console.log('hook request');

    try {
        var speech = 'empty speech';

        if (req.body) {
            var requestBody = req.body;

            if (requestBody.result) {
                speech = '';

                if (requestBody.result.fulfillment) {
                    speech += requestBody.result.fulfillment.speech;
                    speech += ' ';
                }

                if (requestBody.result.action) {
                    speech += 'action: ' + requestBody.result.action;
                }
            }
        }

        console.log('result: ', speech);

        return res.json({
            speech: speech,
            displayText: speech,
            source: 'grafton-soccer-webhook'
        });
    } catch (err) {
        console.error("Can't process request", err);

        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

restService.post('/game', function(req, res) {
    //req.body.result && req.body.result.parameters && req.body.result.parameters.echoText

    var date1 = new Date( 2017, 6, 15, 16, 20 );
    var startDate = new Date();
    var startTime = +startDate;
    var nearestDate, nearestDiff = Infinity;

    var dates = [date1];

    for( var i = 0, n = dates.length;  i < n;  ++i ) {
        var diff = +dates[i] - startTime;
        if( diff > 0  &&  diff < nearestDiff ) {
            nearestDiff = diff;
            nearestDate = dates[i];
        }
    }

    var options = {
        weekday: "long", year: "numeric", month: "short",
        day: "numeric", hour: "2-digit", minute: "2-digit"
    };

    var outDate = date1.toLocaleTimeString("en-us", options);

    var speech = "Your next game is " + outDate;
    return res.json({
        speech: speech,
        displayText: speech,
        source: 'grafton-soccer-webhook'
    });
});


restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});