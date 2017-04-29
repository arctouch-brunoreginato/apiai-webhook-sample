'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const actions = require("./actions/actions");


const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function (req, res) {
    try {
        if (req.body) {
            console.log("[/hook] we have a request!");
            var requestBody = req.body;

            if (requestBody.result) {
                var actionName = requestBody.result.action;
                if (actionName) {
                    console.log("[/hook] we have an action name! " + actionName);

                    var action = actions[actionName];
                    if (action == undefined || action == null) {
                        if res.headerSent {
                            return
                        }
                        
                        return res.status(404).json({
                            status: {
                                code: 404,
                                msg: "Action not defined: " + actionName
                            }
                        });
                    } else {
                        var params = requestBody.result.parameters
                        
                        action(params, function(data, error) {
                            if (error) {
                                if res.headerSent {
                                    return
                                }

                                return res.status(500).json({
                                    code: 501,
                                    msg: error
                                });
                            }

                            //success
                            if res.headerSent {
                                return
                            }

                            return res.json ({
                                speech: data,
                                displayText: data,
                                source: 'apiai-webhook-movies-be'
                            });
                        });
                    }
                }
            }
        }
    } catch (err) {
        if res.headerSent {
            return
        }

        console.error("Can't process request", err);
        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});