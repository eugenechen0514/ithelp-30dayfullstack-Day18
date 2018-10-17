class EchoDao {
    /**
     * 
     * @param {object} config
     * @param {MongoClient} mongoClient
     */
    constructor({ config, mongoClient }) {
        this.config = config;
        this.mongoClient = mongoClient;
    }

    async insert(data) {
        const dbName = this.config.mongodb.dbName;
        const db = this.mongoClient.db(dbName);
        const collection = db.collection('echo');
        return await collection.insertOne(data);
    }
}

module.exports = EchoDao;
