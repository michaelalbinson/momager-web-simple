'use strict';

const GlobalUtilities = require('../util/GlobalUtilities');
const fs = require('fs');


class ContentResolver {
    constructor() {
        this.isProduction = GlobalUtilities.isProduction();
        this.topicCache = [];
        this.topicLookup = {};
    }

    /**
     * Get all of the topics
     * TODO: may want to strip articles prior to sharing
     * @return {Promise<*[]>}
     */
    getOnlyTopics() {
        return this.getTopics();
    }

    /**
     * Get the articles under a given topic
     * @param topicRoute
     * @return {Promise<*[]>}
     */
    getArticlesForTopic(topicRoute) {
        return this.getTopics().then(() => {
            return this.topicLookup[topicRoute];
        });
    }

    /**
     * Get the article under a given topic
     * @param topicRoute
     * @param articleRoute
     * @return {Promise<*[]>}
     */
    getArticleInTopic(topicRoute, articleRoute) {
        return this.getTopics().then(() => {
            const articles =  this.topicLookup[topicRoute].articles;
            let desiredArticle = null;
            articles.forEach((articleObj) => {
                if (articleObj.route === articleRoute)
                    desiredArticle = articleObj;
            });
            return desiredArticle;
        });
    }

    /**
     * Read the topics in from the file system. If we're in production, only read the topics on the first call to the
     * topic resolver to improve performance.  If in a development context, allow files to dynamically change and read
     * everything in each time
     * @return {Promise<[]>}
     */
    getTopics() {
        if (this.isProduction && this.topicCache.length !== 0)
            return Promise.resolve(this.topicCache);

        console.info('Reloading topics...');
        this.topicCache = [];
        this.topicLookup = {};
        return this._refreshTopicCache().then(() => {
            return this.topicCache;
        });
    }

    /**
     * Read all of the topics + articles into the cache
     * @return {Promise<any>}
     * @private
     */
    _refreshTopicCache() {
        const ROOT_DIR = __dirname + '/topics';
        return new Promise((resolve, reject) => {
            fs.readdir(ROOT_DIR, (err, filenames) => {
                if (err)
                    return;

                // for each name we find in the topic dir, check if it is a directory, and try to
                // read out the topic and article within if it is one
                const promises = filenames.map((directoryName) => {
                    const dirPath = ROOT_DIR + '/' + directoryName;
                    return ContentResolver._isDir(dirPath).then((result) => {
                        if (!result)
                            return Promise.resolve();

                        return this._readTopicDir(dirPath)
                    });
                });

                // once all the topics have been successfully added to the cache, resolve
                Promise.all(promises).then(() => {
                    resolve()
                }).catch(reject);
            });
        });
    }

    /**
     * Read a topic directory
     * @param dirname
     * @return {Promise<any>}
     * @private
     */
    _readTopicDir(dirname) {
        return new Promise((resolve, reject) => {
            const topic = {
                title: null,
                subtitle: null,
                icon: null,
                iconDescription: null,
                special: false,
                render: null,
                route: null,
                articles: []
            };

            // If there's no index.json in the dir, skip this dir as we won't handle it properly
            ContentResolver._isFile(dirname + '/index.json').then((isFile) => {
                if (!isFile)
                    return resolve();

                // The topic's "route" is the dirname containing the articles
                topic.route = dirname.split('/').pop();

                    // read the rest of the directory to pull out any articles
                fs.readdir(dirname, (err, filenames) => {
                    if (err)
                        return reject(err);

                    // map each file to a promise that adds the information inside to the topic
                    const promises = filenames.map((filename) => {
                        return ContentResolver._readJSONFile(dirname + '/' + filename).then((json) => {
                            if (filename.includes('index.json')) {
                                topic.title = json.title;
                                topic.subtitle = json.subtitle;
                                topic.icon = json.icon;
                                topic.iconDescription = json.iconDescription;
                                topic.special = json.special ? json.special : false;
                                topic.render = json.render ? json.render : null;
                            } else {
                                json.route = filename.replace('.json', '');
                                topic.articles.push(json);
                            }
                        });
                    });

                    // once all the articles in the topic have been read, add the topic to the cache and resolve
                    return Promise.all(promises).then(() => {
                        this.topicCache.push(topic);
                        this.topicLookup[topic.route] = topic;
                        resolve();
                    });
                });
            });
        });
    }

    /**
     * Is this path a directory?
     * @param filename
     * @return {Promise<boolean>}
     * @private
     */
    static _isDir(filename) {
        return new Promise((resolve) => {
            fs.lstat(filename, (err, stats) => {
                if (err)
                    return resolve(false);

                resolve(stats.isDirectory());
            });
        });
    }

    /**
     * Is this path a file?
     * @param filePath
     * @return {Promise<boolean>}
     * @private
     */
    static _isFile(filePath) {
        return new Promise((resolve) => {
            fs.lstat(filePath, (err, stats) => {
                if (err)
                    return resolve(false);

                resolve(stats.isFile());
            });
        });
    }

    /**
     * Read in json at the specified filepath
     * @param filepath
     * @return {Promise<object>}
     * @private
     */
    static _readJSONFile(filepath) {
        return new Promise((resolve) => {
            fs.readFile(filepath, 'utf-8', (err, content) => {
                if (err)
                    return resolve({});

                resolve(JSON.parse(content));
            });
        });
    }
}

module.exports = new ContentResolver();
