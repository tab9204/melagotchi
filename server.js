const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const compression = require('compression');
var reload = require('reload');

//redirect to https if not already on https
if(process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https')
      res.redirect(`https://${req.header('host')}${req.url}`)
    else
      next()
  })
}

//Compress all HTTP responses
app.use(compression());
app.use(express.json());
//serve the assets
app.use('/assets', express.static('assets'));
app.use('/src', express.static('src'));
app.use('/', express.static('/'));

/***************Server routes***************/
app.get("/",(req,res) =>{
    res.sendFile(__dirname + '/index.html');
});

/*
app.get("/manifest.json",(req,res) =>{
    res.sendFile(__dirname + '/manifest.json');
});

app.get("/service-worker.js",(req,res) =>{
    res.sendFile(__dirname + '/service-worker.js');
});
*/
server.listen(process.env.PORT || 3000, () => {
  console.log('Server started');
});
