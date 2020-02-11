const express = require('express');
const app = express();

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'chat';
const client = new MongoClient(url);


async function getAllMessages() {
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log("Connected to server");

        const db = client.db(dbName);

        const col = db.collection("messages");
        const messages = await col.find({}).toArray();
        console.log("Messages gathered");
        return messages;

    } catch(e) {
        console.log("error getAllMessages");
        console.log(e.stack);
        return e.stack;
    }
};

/**
 * 
 * @param {Object} message 
 */
async function insertMessage(message) {
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log("Connected");

        const db = client.db(dbName);
        const collection = db.collection("messages");
        await collection.insertOne(message);
        console.log("Message inserted: " + message);
        client.close();
        return true;

    } catch(e){

        console.log(e.stack);
        return e.stack;
    }
    
}


  const insertDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('messages');
    // Insert some documents
    collection.insertMany([
      {a : 1}, {a : 2}, {a : 3}
    ], function(err, result) {
      assert.equal(err, null);
      assert.equal(3, result.result.n);
      assert.equal(3, result.ops.length);
      console.log("Inserted 3 documents into the collection");
      callback(result);
    });
  }



const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', function (socket) {
    console.info("User connected");

    socket.on('join', async function (user) {
        console.log(user.id);

        var messages = await getAllMessages();
        io.to(user.id,).emit("all messages", messages);
        io.emit('chat message', user);
        
        
    });
 
    socket.on('chat message', function (message) {
        // insert into message mongoDB {text:"",username:"",time:""}
        insertMessage(message);
        io.emit('chat message', message);
        console.log("msg: " + message);
    });
});






server.listen(3000);