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

var games = [
    {date: new Date( 2017, 6, 15, 16, 20 ), opponent: 'Shrewsbury', location: 'Lyon\'s field'},
    {date: new Date( 2017, 3, 15, 16, 20 ), opponent: 'Worcester', location: 'Away field'},
];

restService.get('/game', function(req, res) {
    //req.body.result && req.body.result.parameters && req.body.result.parameters.echoText

    if(req.body.result.parameters.action === 'when'){
        var speech = 'You don\'t have any games left';
        var nextGame = getNextGame();
        if(nextGame.date !== undefined){
            var options = {
                weekday: "long", year: "numeric", month: "short",
                day: "numeric", hour: "2-digit", minute: "2-digit"
            };

            var outDate = nextGame.date.toLocaleTimeString("en-us", options);
            speech = "Your next game is " + outDate;
        }
    }
    return res.json({
            speech: speech,
            displayText: speech,
            source: 'grafton-soccer-webhook'
        });
});

function getNextGame(){
    var startDate = new Date();
    var startTime = +startDate;
    var nearestDate, nearestDiff = Infinity;
    var nextGame;
    for( var i = 0, n = games.length;  i < n;  ++i ) {
        var date = games[i].date;
        var diff = +date - startTime;
        if( diff > 0  &&  diff < nearestDiff ) {
            nearestDiff = diff;
            nearestDate = date;
            nextGame = games[i];
        }
    }
    return nextGame;
};

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});