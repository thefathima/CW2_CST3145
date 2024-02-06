const express = require('express')
const path = require("path");
//const bodyParser = require('body-parser)

//Create an Express.js instance:
const app = express()

//config Express.js
app.use(express.json())
app.set('port', 3000)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    next();
})
// -----------------------------------------------------------------------------------
//logger middleware
app.use(function (req, res, next) {
    console.log("In comes a " + req.method + " to " + req.url);
    next();
});

// Static file middleware for serving images
const imagePath = path.resolve(__dirname, "images");
app.use('/images', express.static(imagePath));

// Custom middleware for handling non-existent images only when the path starts with "/images"
app.get('/images', (req, res, next) => {
    // Check if the file exists
    const filePath = path.join(imagePath, req.url);

    if (!require('fs').existsSync(filePath)) { //checks if file exists in filePath
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("Image not found");
    } else {
        // If the file exists, continue to the next middleware
        next();
    }
});
//-----------------------------------------------------------------------------------------

const MongoClient = require('mongodb').MongoClient

let db;
MongoClient.connect('mongodb+srv://fa1113:Xterra12345@cluster0.70nbtis.mongodb.net', (err, client) => { //this is the connection link
    db = client.db('cw2_db') //this is the name of the database from MongoDB Compass software
})

//after you type this line, go to terminal and type this command node server.js
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g.,/collection/lessons')
}) //until here

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    //console.log('collection name', req.collection)
    return next()
})

//after u write this piece of code, then go to the terminal and type node server.js
//this is the code to add ur collection basically type http://localhost:3000/collection/products into the browser URL, products is the collection name from webstore database in MongoDB Compass software
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e) //e is error
        res.send(results)
    })
})

//after u write this piece of code, then go to the terminal and type node server.js
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if (e) return next(e) //e is error
        res.send(results.ops)
    })
})

//return with object id
//this peice of code is to get a product from the database
//after u write this piece of code, then go to the terminal and type node server.js
const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id'
    , (req, res, next) => {
        req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
            if (e) return next(e)
            res.send(result)
        })
    })

const port = process.env.PORT || 3000
app.listen(port)
