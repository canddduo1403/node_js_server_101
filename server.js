
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const redis = require('redis')
{/*const { MongoClient } = require('mongodb')*/ }
const Promise = require('bluebird')

const redisConfig = {
    port: 6379,
    host: '192.168.99.100'
}

const client = Promise.promisifyAll(redis.createClient(redisConfig.port, redisConfig.host))


client.on('connect', () => {
    console.log('redis connected')
})

const mongodbName = 'register';
const mongodburl = 'mongodb://192.168.99.100:27017/' + mongodbName;

const collectionUser = 'users'

let db

const app = express();

const port = 3000;

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

const keyGetUser = 'userlist'

//get user list
app.get('/user', async (req, res) => {
    try {
        const result = await client.getAsync(keyGetUser);
        if (!result) {
            const dbResult = await db.collection(collectionUser).find().toArray()
            client.set(keyGetUser, JSON.stringify(dbResult))
            res.send(dbResult)
            return
        }
        res.send(JSON.parse(result))
    } catch (err) {
        console.log(err)
    }

})

// Add new user
app.post('/user', async (req, res) => {
    try {
        const result = await db.collection(collectionUser).save(req.body);
        console.log('user has been added.')
        await client.delAsync(keyGetUser)
        console.log('redis key removed')
        res.send('user has been add')
    } catch (err) {
        console.log(err)
    }
})

MongoClient.connect(mongodburl, (err, database) => {
    if (err) console.log(err);
    db = database;
    console.log('connect to database is successfuly')
    app.listen(port, () => {
        console.log('app is listening on port ' + port);
    })
})

