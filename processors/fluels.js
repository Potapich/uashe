const cheerio = require('cheerio');
const request = require('request');
const lib_db = require('../libs/db_lib');

let listOpt = [];

setTimeout(updateFuelsNumber, 5000)

setInterval(updateFuelsNumber, 1800000)

async function updateFuelsNumber() {
    console.log(JSON.parse(JSON.stringify(await lib_db.getLinks()))[0].fuel_link)
    let options = {
        url: JSON.parse(JSON.stringify(await lib_db.getLinks()))[0].fuel_link,
        method: 'GET',
        'Content-Type': 'text/plain; charset=utf-8'
    };
    request(options, async function (error, response, body) {
        if (error) {
            console.log('Error during load page:', error);
        }
        try {
            listOpt = [];
            let $ = cheerio.load(body);
            $('div[class="mfz-container"]').find('div > div > div > div > article > table > caption').each(function (index, element) {
                $('div[class="mfz-container"]').find('div > div > div > div > article > table > tbody').each(function (index, element2) {
                    listOpt.push($(element).text());
                    listOpt.push($(element2).text().substring(21));
                });
            });
        } catch (err) {
            console.log(err)
        }
    })
}

function getFuelsNumber() {
    // console.log(listOpt[1].slice(21))
    return listOpt
}

module.exports.getFuelsNumber = getFuelsNumber

