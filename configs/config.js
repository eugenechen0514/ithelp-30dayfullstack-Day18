const config = {
    mongodb: {
        url: process.env.MONGODB_URL || 'mongodb://localhost:27017',
        dbName: process.env.MONGODB_DB_NAME || 'myproject',
    }
}
module.exports = config;
