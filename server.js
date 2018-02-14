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
    models.Article.find({})
    .then(dbArticles => {
        res.render('index', { articles: dbArticles });
    })
    .catch(err => {
        console.log(err);
    });
});

app.get('/scrape', (req, res) => {

    models.Article.remove({}, () => {
        console.log('collection removed');
    });

    var resultArr = [];

    axios.get('https://news.ycombinator.com')
    .then(response => {
        var $ = cheerio.load(response.data);

        $(".storylink").each(function(i, elem) {
            var result = {};
            result.title = $(this).text();
            result.link = $(this).attr('href');
            result.site = $(this).siblings('span').children('a').children('span').text();
            resultArr.push(result);
        });

        console.log('resultArr length 1:');
        console.log(resultArr.length); // 30

        models.Article.insertMany(resultArr)
        .then(newArticles => {
            console.log('scrape complete!');
            res.redirect('/');
        })
        .catch(err => {
            console.log(err.message);
            console.log(typeof err.message);
            let dupTitle = err.message.split('\"');
            console.log(dupTitle[1]);
            if (err.message.includes('E11000')) {
                // console.log('yo');
                models.Article.find({ title: dupTitle[1] })
                .then(dbArticle => {
                    if (dbArticle) console.log(dbArticle);
                })
                .catch(err => {
                    console.log(err);
                });
            }
        });

    })
    .catch(err => {
        res.send(err);
    });

    // THIS WILL CONSOLE OUT 0 BECAUSE THE AXIOS GET REQUEST IS ASYNCHRONOUS!!!
    console.log('resultArr length 2:');
    console.log(resultArr.length);
});

app.get('/saved', (req, res) => {
    models.Article.find({ saved: true })
    .then(savedArticles => {
        res.render('saved', { articles: savedArticles });
    })
    .catch(err => {
        console.log(err);
    });
});

app.get('/api/articles/:id', (req, res) => {
    id = req.params.id;
    models.Article.findOneAndUpdate({ _id: id }, { saved: true }, { new: true })
    .populate('note')
    .then(dbArticle => {
        res.send(dbArticle);
    })
    .catch(err => {
        console.error(err);
    });
})

app.post('/api/articles/:id', (req, res) => {
    id = req.params.id;
    models.Note.create(req.body)
    .then(newNote => {
        console.log(newNote);
        return models.Article.findOneAndUpdate({ _id: id }, { note: newNote._id }, { new: true });
    })
    .then(updatedArticle => {
        res.send(updatedArticle);
    })
    .catch(err => {
        console.log(err);
    });
});

app.get('/api/unsave/:id', (req, res) => {
    id = req.params.id;
    models.Article.findOneAndUpdate({ _id: id }, { $unset: { note: '', saved: '' }}, { new: true })
    .then(unsavedArticle => {
        console.log(`article ${unsavedArticle._id} saved: ${unsavedArticle.saved}`);
        res.send(unsavedArticle);
    })
    .catch(err => {
        console.error(err);
    });
});

app.get('/api/clear', (req, res) => {
    models.Article.remove({})
    .then(articleResponse => {
       return models.Note.remove({});
    })
    .then(noteResponse => {
        console.log('articles & notes removed!');
        res.send('articles & notes removed!');
    })
    .catch(err => {
        console.log(err);
        res.send(err);
    });
});

// =====================================================================================
// LISTENING
// =====================================================================================
app.listen(port, () => {
    console.log(`App running on port ${port}`);
});