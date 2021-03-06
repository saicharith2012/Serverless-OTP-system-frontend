("use strict");

console.log("Loading function");
const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-2" });

const tableName = ""; //Table name in dynamo DB

//Declaring Response parameters
let responseBody = "";
let statusCode = 0;

//Mail Lambda function
exports.handler = function (event, context, callback) {
  //Taking event (request) parameters
  const { email, OTP } = event;

  //Fetching current time w.r.t epoch
  function getDate() {
    return Date.now();
  }

  //Defining the paramters to be updated in DynamoDB if the OTP is correct
  var updateParamsVerified = {
    TableName: tableName,
    Key: {
      Email: email,
    },
    UpdateExpression: "set isVerified = :r",

    ExpressionAttributeValues: {
      ":r": 1,
    },
    ReturnValues: "UPDATED_NEW",
  };

  //Defining the paramters to be updated in DynamoDB if the OTP is incorrect
  var updateParamsNotVerified = {
    TableName: tableName,
    Key: {
      Email: email,
    },
    UpdateExpression: "set isVerified = :r",

    ExpressionAttributeValues: {
      ":r": 0,
    },
    ReturnValues: "UPDATED_NEW",
  };

  //Fetch attributes of respective inPOST mail
  var getParams = {
    Key: {
      Email: email,
    },
    TableName: tableName,
  };

  const data = docClient.get(getParams, (err, data) => {
    if (err) {
      //Defining response parameters
      responseBody = `Erpor: ${err}`;
      statusCode = 402;
      //Response to the user
      const response = {
        statusCode: statusCode,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(responseBody),
        isBase64Encoded: false,
      };
      callback(null, response);
    } else {
      //If the OTP is correct and not expired
      if (data.Item.OTP == OTP && data.Item.expiryTime > getDate()) {
        docClient.update(updateParamsVerified, (err, data) => {
          if (err) {
            //Defining response parameters
            responseBody = `Errr: ${err}`;
            statusCode = 402;
            //Response to the user
            const response = {
              statusCode: statusCode,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Credentials": true,
              },
              body: JSON.stringify(responseBody),
              isBase64Encoded: false,
            };
            callback(null, response);
          } else {
            console.log("Details Updated succesfully..!");
            //Defining response parameters
            responseBody = `You have been verified succesfully!`;
            statusCode = 200;
            //Response to the user
            const response = {
              statusCode: statusCode,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Credentials": true,
              },
              body: JSON.stringify(responseBody),
              isBase64Encoded: false,
            };
            callback(null, response);
          }
        });
      }

      //If the OTP is wrong
      else if (data.Item.OTP !== OTP) {
        docClient.update(updateParamsNotVerified, (err, data) => {
          if (err) {
            //Defining response parameters
            responseBody = `Error: ${err}`;
            statusCode = 402;
            //Response to the user
            const response = {
              statusCode: statusCode,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Credentials": true,
              },
              body: JSON.stringify(responseBody),
              isBase64Encoded: false,
            };
            callback(null, response);
          } else {
            console.log("Details Updated succesfully..!");
            //Defining response parameters
            responseBody = `Wrong OTP! Please try again.`;
            //Response to the user
            statusCode = 400;
            const response = {
              statusCode: statusCode,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Credentials": true,
              },
              body: JSON.stringify(responseBody),
              isBase64Encoded: false,
            };
            callback(null, response);
          }
        });
      }
      //If the OTP is expired
      else if (getDate() > data.Item.expiryTime) {
        docClient.update(updateParamsNotVerified, (err, data) => {
          if (err) {
            //Defining response parameters
            responseBody = `Error: ${err}`;
            statusCode = 402;
            //Response to the user
            const response = {
              statusCode: statusCode,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Credentials": true,
              },
              body: JSON.stringify(responseBody),
              isBase64Encoded: false,
            };
            callback(response, null);
          } else {
            console.log("Details Updated succesfully..!");
            //Defining response parameters
            responseBody = `OTP Expired! Please try again.`;
            statusCode = 400;
            //Response to the user
            const response = {
              statusCode: statusCode,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Credentials": true,
              },
              body: JSON.stringify(responseBody),
              isBase64Encoded: false,
            };
            callback(null, response);
          }
        });
      }
    }
  });
};
