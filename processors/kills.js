const cheerio = require('cheerio');
const request = require('request');
const lib_db = require('../libs/db_lib');

let listOpt = [];

setTimeout(updateKillsNumber, 5000)

setInterval(updateKillsNumber, 1800000)

async function updateKillsNumber() {
    console.log(JSON.parse(JSON.stringify(await lib_db.getLinks()))[0].kill_link)
    let options = {
        url: JSON.parse(JSON.stringify(await lib_db.getLinks()))[0].kill_link,
        method: 'GET',
        'Content-Type': 'text/plain; charset=utf-8'
    };
    request(options, async function (error, response, body) {
        if (error) {
            console.log('Error during load page kills:', error);
        }
        try {
            listOpt = [];
            let $ = cheerio.load(body);
            // $('div[class="mfz-container"]').find('div > div > div > div > article > ul > caption').each(function (index, element) {
                $('div[class="mfz-container"]').find('div > div > div > div > article > ul > li > div > div > ul').each(function (index, element) {
                    if (index===0) listOpt.push($(element).text());
                });
            // });
        } catch (err) {
            console.log(err)
        }
    })
}

function getKillsNumber() {
    return listOpt
}

module.exports.getKillsNumber = getKillsNumber

