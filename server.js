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
const app = express();

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
mongoose.connect(MONGODB_URI)
.then(() => {
    console.log('Successfully connected to Mongo database');
})
.catch(err => {
    console.error(err);
});

// =====================================================================================
// ROUTES
// =====================================================================================
app.get('/', (req, res) => {
    // models.Article.remove({}, () => {
    //     console.log('collection removed');
    // });

    var resultArr = [];
    axios.get('https://news.ycombinator.com')
    .then(response => {
        var $ = cheerio.load(response.data);

        $(".storylink").each(function(i, elem) {
            models.Article.find({ title: $(this).text() })
            .then(response => {
                if (!response) {
                    var result = {};
                    result.title = $(this).text();
                    result.link = $(this).attr('href');
                    result.site = $(this).siblings('span').children('a').children('span').text();
                    resultArr.push(result);
                }
            })
            .catch(err => {
                console.error(err);
            });
        });

        // console.log(resultArr);
        
        if (resultArr.length > 0) {
            models.Article.insertMany(resultArr, { ordered: false })
                .then(dbArticles => {
                    console.log('insertMany should have succeeded');
                    console.log(dbArticles);
                })
                .catch(err => {
                    // return res.send(err); // both return & res.send (res sends the response back) end the function
                    console.log(err);
                });
        } else {
            console.log('No new articles!');
        }
        
    })
    .catch(err => {
        res.send(err);
    });

    models.Article.find({})
    .then(dbArticles => {
        res.render('index', { articles: dbArticles });
    })
    .catch(err => {
        res.send(err);
    });
});

app.get('/scrape', (req, res) => {
    
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