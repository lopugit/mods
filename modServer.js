const express = require('express');
const https = require('https');
const app = express();
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const options = {
  key: fs.readFileSync(path.join(__dirname, 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'localhost.pem'))
};

const optionsWA = {
  key: fs.readFileSync(path.join(__dirname, 'crashlogs.whatsapp.net-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'crashlogs.whatsapp.net.pem'))
}

const optionsGoogle = {
  key: fs.readFileSync(path.join(__dirname, 'modserver.google-analytics.com-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'modserver.google-analytics.com.pem'))
}

const optionsMapbox = {
  key: fs.readFileSync(path.join(__dirname, 'modserver.tiles.mapbox.com-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'modserver.tiles.mapbox.com.pem'))
}

app.use(cors()); // add this line to enable CORS

app.get('/file', (req, res) => {
  const fileUrl = req.query.url;
  const file = fs.createReadStream(fileUrl);
  if (file) {
    console.log('Found file', file)
  } else {
    console.log('No file found', file)
  }
  file.pipe(res);
});

const name = require("emoji-name-map");

app.get('/emoji', (req, res) => {
  const emoji = req.query.name;
  const emojiName = name.get(emoji);
  if (emojiName) {
    res.send(emojiName);
  } else {
    res.send("No emoji found");
  }
});

const port = 3993

https.createServer(options, app).listen(port, () => {
  console.log('Server localhost listening on port', port)
})
const portGoogle = 3994
https.createServer(optionsGoogle, app).listen(portGoogle, () => {
  console.log('Server Google listening on port', port)
})
const portMapbox = 3995
https.createServer(optionsGoogle, app).listen(portMapbox, () => {
  console.log('Server Mapbox listening on port', port)
})