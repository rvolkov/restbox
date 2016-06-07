module.exports = process.env.APP_COV
? require(__dirname + '../app-cov/main')
: require(__dirname + '/main')
