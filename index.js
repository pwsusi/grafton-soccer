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

var events = [
    {date: new Date( 2017, 4, 20, 11, 00 ), opponent: 'Dudley', location: 'Riverview field', type: 'game'},
    {date: new Date( 2017, 6, 3, 11, 00 ), opponent: 'DASC', location: 'Riverview field', type: 'game'},
    {date: new Date( 2017, 4, 10, 13, 00 ), opponent: 'Oxford', location: 'Ruel Field; 27 Locust Street, Oxford', type: 'game'}
];

restService.post('/event', function(req, res) {
    //req.body.result && req.body.result.parameters && req.body.result.parameters.echoText

    var speech = 'There was an unexpected error. I donn\'t know if you\'re asking about a practice or a game';
    if(req.body.result.parameters.requestType === 'game'){
        speech = handleGameRequest(req);
    }else if(req.body.result.parameters.requestType === 'practice'){
        speech = handlePracticeRequest(req);
    }

    return res.json({
            speech: speech,
            displayText: speech,
            source: 'grafton-soccer-webhook'
        });
});

function handleGameRequest(req){
      var options = {
            weekday: "long", year: "numeric", month: "short",
            day: "numeric", hour: "2-digit", minute: "2-digit"
        };

        var nextGame = getNextEvent(req.body.result.parameters.requestType);
        var speech = 'There was an unexpected error';
        if(nextGame === undefined){
            speech = 'You don\'t have any games left';
        }
        else{
           if(req.body.result.parameters.action === 'when'){
                var outDate = nextGame.date.toLocaleTimeString("en-us", options);
                speech = "Your next game is " + outDate;
            }else if(req.body.result.parameters.action === 'who'){
                if(nextGame.opponent === undefined){
                    speech = 'I\'m sorry, I\'m not sure who you\'re playing against';
                }else{
                    speech = "Your next game is against " + nextGame.opponent;
                }
            }else if(req.body.result.parameters.action === 'where'){
                if(nextGame.location === undefined){
                    speech = 'I\'m sorry, I\'m not sure where you\'re playing';
                }else{
                    speech = "Your next game is scheduled to be played at " + nextGame.location;
                }
            }else{
                var outDate = nextGame.date.toLocaleTimeString("en-us", options);
                var opponent;
                if(nextGame.opponent === undefined){
                    opponent = 'some team I\'m not sure about';
                }else{
                    opponent = nextGame.opponent;
                }

                var location;
                if(nextGame.location === undefined){
                    location = 'somewhere I\'m not sure about';
                }else{
                    location = nextGame.location;
                }

                speech = "Your next game is " + outDate + " against "  + opponent + " and is scheduled to be played at " + location;
            }
        }
        return speech;
};

function handlePracticeRequest(req){
      var options = {
            weekday: "long", year: "numeric", month: "short",
            day: "numeric", hour: "2-digit", minute: "2-digit"
        };

        var nextPractice = getNextEvent(req.body.result.parameters.requestType);
        var speech = 'There was an unexpected error';
        if(nextPractice === undefined){
            speech = 'You don\'t have any practices left';
        }
        else{
           if(req.body.result.parameters.action === 'when'){
                var outDate = nextPractice.date.toLocaleTimeString("en-us", options);
                speech = "Your next practice is " + outDate;
            }else if(req.body.result.parameters.action === 'where'){
                if(nextPractice.location === undefined){
                    speech = 'I\'m sorry, I\'m not sure where you\'re practicing';
                }else{
                    speech = "Your next practice is at " + nextPractice.location;
                }
            }else{
                var outDate = nextPractice.date.toLocaleTimeString("en-us", options);
                var location;
                if(nextPractice.location === undefined){
                    location = 'somewhere I\'m not sure about';
                }else{
                    location = nextPractice.location;
                }

                speech = "Your next practice is " + outDate + "  at " + location;
            }
        }
        return speech;
};

function getNextEvent(type){
    var startDate = new Date();
    var startTime = +startDate;
    var nearestDate, nearestDiff = Infinity;
    var nextEvent;
    for( var i = 0, n = events.length;  i < n;  ++i ) {
        if(type !== events[i].type){
            continue;
        }
        var date = events[i].date;
        var diff = +date - startTime;
        if( diff > 0  &&  diff < nearestDiff ) {
            nearestDiff = diff;
            nearestDate = date;
            nextEvent = events[i];
        }
    }
    return nextEvent;
};

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});