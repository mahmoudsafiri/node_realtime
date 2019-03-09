var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
var Message = mongoose.model('Message',{
  name : String,
  message : String
})

const MongoClient = require(‘mongodb’).MongoClient;
const uri = "mongodb+srv://admin:1234@cluster0-tjov6.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("real_time").collection("messages");
  // perform actions on the collection object
  client.close();
});

// var dbUrl = 'mongodb://username:password@ds257981.mlab.com:57981/simple-chat'
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
    res.sendStatus(200);
  })
})
io.on('connection', () =>{
  console.log('a user is connected')
})
// mongoose.connect(dbUrl ,{useMongoClient : true} ,(err) => {
//   console.log('mongodb connected',err);
// })
// mongoose.connect("mongodb://localhost:27017/real_time");
const port = process.env.PORT || 3000;
var server = http.listen(port, () => {
  console.log('server is running on port', server.address().port);
});
