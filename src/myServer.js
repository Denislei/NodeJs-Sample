const express = require('express');
const fs = require("fs");

const app = express()

//Setup the access log
var morgan = require('morgan')
var rfs = require('rotating-file-stream')

const generator = (time, index) => {
//  if (!time) time = new Date();
  if (!index) index = 0;

  const date = new Date();
	const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return 'access_' + year + "-" + ('0' + month).slice(-2) + "-" + ('0' + day).slice(-2) + "_" + index + '.log';
};

var accessLogStream = rfs.createStream(generator, {
  interval: '1d', // rotate daily
  path: '../src/assets/logs/',
  compress: "gzip" // compress rotated files
});

//const format = 'short';
const format = ':remote-addr [:date[clf]] :method :url HTTP/:http-version :status (:res[content-length]) - :response-time ms';
app.use(morgan(format, { stream: accessLogStream }))

//Config variables
require('../config/config.js');
const appRoot = __dirname;
const appName = global.gConfig.app_name;
const port = global.gConfig.node_port;

//Load database
var dbFile = require(global.gConfig.dbFile);
{
  if ( dbFile?.rooms == null ) {
    dbFile.rooms = {};
  }
}
console.log('Booking Database: ' + JSON.stringify(dbFile));

const endOfLine = require('os').EOL;

// default options
app.use(express.json());

function createResponse(status, message, content) {

  return JSON.stringify({"status": status, "message": message, "content": content});

}


//This serves the GET for room booking
app.use('/get/:id', function(req, res) {

  console.log('>>>>>Get room Entering......' + req.originalUrl);
  console.log('request parameters: ' + JSON.stringify(req.params));

  const tokens = req.params.id.split("_");
  console.log('request parameters id: ' + tokens);

  let content = "";
  if ( dbFile.rooms[tokens[0]] ) {
    for (let room of dbFile.rooms[tokens[0]]) {
      if ( tokens[1] == room.start ) {
        content = createResponse("200", "", room);
        break;
      }
    }
  }

  if ( !content.length ) {
    content = createResponse("400", "Room ID not found: " + req.params.id, {});
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(content);

  console.log('<<<<<Successfully Get Sent ......');
});


//This serves the GET for room cancelling
app.use('/cancel/:id', function(req, res) {

  console.log('>>>>>Remove room Entering......' + req.originalUrl);
  console.log('request parameters: ' + JSON.stringify(req.params));

  const tokens = req.params.id.split("_");
  console.log('request parameters id: ' + tokens);

  let content = "";
  if ( dbFile.rooms[tokens[0]] ) {
    for ( var i = 0; i < dbFile.rooms[tokens[0]].length; i++ ) {
      if ( tokens[1] == dbFile.rooms[tokens[0]][i].start ) {
        dbFile.rooms[tokens[0]].splice(i, 1);
        saveConfigJson();
        content = createResponse("200", "", {});
        break;
      }
    }
  }

  if ( !content.length ) {
    content = createResponse("400", "Room ID not found: " + req.params.id, {});
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(content);

  console.log('<<<<<Successfully Remove Sent ......');
});

//This handles the POST for booking operations
//
app.post('/add', function(req, res) {
	console.log('>>>>>Post booking Entering....');
  res.setHeader('Content-Type', 'application/json');

	if (!req.body || req.body.length === 0) {
	  console.error('Payload is Empty....');
	  return res.status(200).send(createResponse("400", "No Json content were uploaded.", {}));
	}
	
	console.log('request parameters: ' + JSON.stringify(req.params));
	
	const booking = req.body
	
	console.debug('booking: ' + JSON.stringify(booking));
	
  let missing = checkMissing(booking.email, "Email", "");
  missing = checkMissing(booking.firstName, "First Name", missing);
  missing = checkMissing(booking.lastName, "Last Name", missing);
  missing = checkMissing(booking.number, "Number of People", missing);
  missing = checkMissing(booking.start, "Start Date", missing);
  missing = checkMissing(booking.end, "End Date", missing);

  let error = "";
  if (missing.length > 0) {
    error += "Missing fields: " + missing + endOfLine;
	}

  if ( booking.number < 1 || booking.number > 3 ) {
    error += "Booking people must between 1 to 3: " + booking.number + endOfLine;
  }

  var stDate = new Date(booking.start);
  var endDate = new Date(booking.end);
  var diffDays = parseInt((endDate - stDate) / (1000 * 60 * 60 * 24));
  console.log('Days: ' + diffDays);
  if ( diffDays < 1 || diffDays > 3 ) {
    error += "Booking days must between 1 to 3: " + diffDays + endOfLine;
  }

  if (error.length > 0) {
	  console.error('Invalid input: ' + error);
	  return res.status(200).send(createResponse("400", "Invalid input: " + error, {}));
	}

  //Find an empty room
  let pos = 0;
  let id = "";
  while ( pos < dbFile.capacity ) {
    id = "" + pos;
    if ( !dbFile.rooms[id] || !dbFile.rooms[id].length )
      break;
    else {
      let conflict = false;
      for (let room of dbFile.rooms[id]) {
        var stDate1 = new Date(room.start);
        var endDate1 = new Date(room.end);
        conflict = (stDate1 <= stDate && stDate <= endDate1) || (stDate1 <= endDate && endDate <= endDate1);
        if (conflict) break;
      }

      if ( !conflict ) break;
    }
    pos++;
  }

  let content = "";
  if ( pos < dbFile.capacity ) {
    if ( !dbFile.rooms[id] ) 
      dbFile.rooms[id] = [];

    dbFile.rooms[id].push(booking);
    saveConfigJson();
    const url = req.protocol + '://' + req.get('host') + req.url.substr(0, req.url.length - 3);
    const idUrl = id + "_" + booking.start;
    content = createResponse("200", "", {"id": idUrl, "urls": {"get": url + "get/" + idUrl, "cancel": url + "cancel/" + idUrl}});
  } else {
    content = createResponse("400", "Rooms are full", {});
  }
	
	res.status(200).send(content);
	console.log('<<<<<Successfully Add Sent ......');
});

//Check if a field missing
function checkMissing(variable, name, message) {
  if ( !(typeof variable == 'undefined') && ((typeof variable != 'string') ||variable.length > 0 )) {
    return message;
  } else {
    return message.length > 0 ? message + ", " + name : name;
  }
}


//Save internal memory for persistence
function saveConfigJson(){
  console.log('Booking Database: ' + JSON.stringify(dbFile));

  fs.writeFileSync(global.gConfig.dbFile, JSON.stringify(dbFile, null, global.gConfig.json_indentation));
}

//Start the server listening
app.listen(port, () => {
  console.log(`========== NodeJs app listening at http://localhost:${port}`)
})
