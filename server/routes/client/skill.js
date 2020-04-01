'use strict';

const resolver = require('../../content').contentResolver;
const componentResolver = require('../../comonent-registry').componentResolver;


module.exports = (app) => {
    app.get('/skill/:topic', (req, res) => {
        resolver.getArticlesForTopic(req.params.topic).then((topicWithArticles) => {
            res.render('skill', {
                title: 'Momager | ' + topicWithArticles['title'],
                scripts: componentResolver('spec/mom-skill-set.js'),
                skill: topicWithArticles,
                articles: JSON.stringify(topicWithArticles.articles)
            });
        });
    });

    app.get('/skill/:topic/:article', (req, res) => {
        resolver.getArticleInTopic(req.params.topic, req.params.article).then((article) => {
            res.render('article', {
                title: 'Momager | ' + (article && article.title),
                scripts: componentResolver('spec/mom-article.js'),
                article: article
            });
        });
    });
};
