var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var path = require('path');
app.use(express.static(__dirname));
app.use("/files", express.static(path.join(__dirname, 'files')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
var Message = mongoose.model('Message',{
  name : String,
  message : String,
  updated_at: { type: Date, default: Date.now },
})

//


// var dbUrl = 'mongodb+srv://admin:1234@cluster0-tjov6.mongodb.net/test?retryWrites=true'
app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})

app.post('/messages', (req, res) => {
  var message = new Message(req.body);
  message.save((err) =>{
    if(err)
      sendStatus(500);
    io.emit('message', req.body);
    io.emit('scroll', true);
    res.sendStatus(200);
  })
})
var count = 0;
var $ipsConnected = [];
io.on('connection', function (socket) {
  var $ipAddress = socket.handshake.address;
  if (!$ipsConnected.hasOwnProperty($ipAddress)) {

  	$ipsConnected[$ipAddress] = 1;

  	count++;

  	socket.emit('counter', {count:count});

  }
  console.log("client is connected");
  /* Disconnect socket */

  socket.on('disconnect', function() {

  	if ($ipsConnected.hasOwnProperty($ipAddress)) {

  		delete $ipsConnected[$ipAddress];

	    count--;

	    socket.emit('counter', {count:count});
  	}
  });
});

// mongoose.connect("mongodb://localhost:27017/real_time");
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:1234@cluster0-tjov6.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("real_time").collection("messages");
  // perform actions on the collection object
  client.close();
});
mongoose.connect(uri ,{useMongoClient : true} ,(err) => {
  const collection = client.db("real_time").collection("messages");
  // perform actions on the collection object
  console.log('mongodb connected',err);
});

const port = process.env.PORT || 3000;
var server = http.listen(port, () => {
  console.log('server is running on port', server.address().port);
});
