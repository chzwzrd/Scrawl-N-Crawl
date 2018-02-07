// =====================================================================================
// DEPENDENCIES
// =====================================================================================
const express = require('express')
    , exphbs = require('express-handlebars')
    , bodyParser = require('body-parser')
    , axios = require('axios')
    , logger = require('morgan')
    , cheerio = require('cheerio')
    , request = require('request')
    , mongoose = require('mongoose');

// set port
const port = process.env.PORT || 3000;

// require all models
const models = require('./models');

// =====================================================================================
// MIDDLEWARE
// =====================================================================================
// initialize express
app = express();

// configure handlebars as view engine
app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'main' }));
app.set('view engine', '.hbs');

// configure body parser to parse requests as json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// configure morgan to log requests to console
app.use(logger('dev'));

// serve up 'public' folder
app.use(express.static('public'));

// =====================================================================================
// MONGOOSE CONFIG
// =====================================================================================
// set up mongoose to leverage built-in JavaScript ES6 Promises
mongoose.Promise = Promise;

// if deployed, use the deployed database. else, use the local mongoHeadlines database.
var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/mongoHeadlines';

// connect to the MongoDB
mongoose.connect(MONGODB_URI);

// =====================================================================================
// ROUTES
// =====================================================================================
app.get('/', (req, res) => {
    var resultArr = [];
    axios.get('https://news.ycombinator.com')
    .then(response => {
        var $ = cheerio.load(response.data);
        $(".storylink").each(function(i, elem) {
            var result = {};
            result.title = $(this).text();
            result.link = $(this).attr('href');
            resultArr.push(result);
        });

        // console.log(resultArr);

        models.Article.insertMany(resultArr)
        .then(dbArticles => {
            console.log(dbArticles);
        })
        .catch(err => {
            return res.send(err);
        });
        res.render('index', { articles: resultArr });
    })
    .catch(err => {
        res.send(err);
    });
});

app.get('/saved', (req, res) => {
    res.render('saved');
});

// =====================================================================================
// LISTENING
// =====================================================================================
app.listen(port, () => {
    console.log(`App running on port ${port}`);
});