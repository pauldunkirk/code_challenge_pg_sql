console.log('Starting up the server');
var express = require('express');
var app = express();
app.use(express.static('./server/public'));
var path = require('path');
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.get('/', function(req, res) {
  res.sendFile(path.resolve('./server/public/views/index.html'));
});
app.listen(port, function() {
  console.log('Server running on port: ', port);
});
var pg = require('pg');
var config = {
    database: 'phi', // the name of the database
    host: 'localhost', // where is your database
    port: 5432, // the port number for your database
    max: 10, // how many connections at one time
    idleTimeoutMillis: 30000 // 30 seconds to try to connect
};
var pool = new pg.Pool(config);
/*** Build out a module to manage our treats requests. ***/

app.get('/treats', function(req, res) {
    pool.connect(function(err, client, done) {
        if (err) {
            console.log('Error connecting to database: ', err);
            res.sendStatus(500);
        } else {
            client.query('SELECT * FROM treats;', function(err, result) {
                done();
                if (err) {
                    console.log('Error making the database query: ', err);
                    res.sendStatus(500);
                } else {
                    res.send(result.rows);
                    console.log(result.rows);
                } //end else final send results
            }); //end query function
        } //end else into query
    }); //end pool connect
}); //end app.get


app.post('/treats', function(req, res) {
    var newTreat = req.body; // comes in as treat
    console.log('newTreat', newTreat);
    pool.connect(function(err, client, done) {
        if (err) {
            console.log('Error connecting to database: ', err);
            res.sendStatus(500);
        } else {
            client.query('INSERT INTO treats (name, description, pic) VALUES ($1, $2, $3);',
            [newTreat.name, newTreat.description, newTreat.url],
                function(err, result) {
                    done();
                    if (err) {
                        console.log('Error making the database query: ', err);
                        res.sendStatus(500);
                    } else {
                        res.sendStatus(201);
                        console.log('newTask with newTaskDescription', newTreat);
                    } // end else
                }); //end query
        } // end else
    }); //end pool connect
}); // end router.post
