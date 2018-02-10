const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
    title: {
        type: String,
        // unique: true,
        required: true
    },
    link: {
        type: String,
        // unique: true,
        required: true
    },
    site: {
        type: String,
        required: true
    },
    // points: {
    //     type: Number,
    //     required: true
    // },
    comment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }
});

const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;