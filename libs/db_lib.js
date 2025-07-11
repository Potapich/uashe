const mongoConfig = require('../config/config_mongo');
const {MongoClient} = require('mongodb');

let urlDB = mongoConfig.mongoURL;//'mongodb://' + mongoConfig.user + ':' + mongoConfig.password + '@' + mongoConfig.rootlink_ip + ',' + mongoConfig.secondarylink_ip;
let dbo;
let numbersCollection;

const client = new MongoClient(urlDB);

(async function mongo_starter() {
    await client.connect();
    console.log("Connected successfully to db - ", urlDB);
    dbo = client.db();
    numbersCollection = dbo.collection(mongoConfig.numbersCollection);
})();

//counting
async function insertNum() {
    try {
        numbersCollection.find({type: 'counters'}).toArray(async function (err, result) {
            numbersCollection.updateOne({type: 'counters'}, {
                $set: {
                    "visiters": Number(result[0].visiters + 1),
                }
            })
        })
    } catch (e) {
        console.log('MONGO_ERROR', e);
    }
}

async function getVisitersNum() {
    try {
        await insertNum()
        return await numbersCollection.find({type: "counters"}, {
            projection: {_id: 0, type: 0}
        }).toArray();
    } catch (e) {
        console.log('MONGO_ERROR', e);
    }
}

async function getLinks() {
    try {
        return await numbersCollection.find({type: "links"}, {
            projection: {_id: 0, type: 0}
        }).toArray();
    } catch (e) {
        console.log('MONGO_ERROR', e);
    }
}


module.exports.insertNum = insertNum;
module.exports.getVisitersNum = getVisitersNum;
module.exports.getLinks = getLinks;

