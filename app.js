let createError = require('http-errors');
let express = require('express');
let config = require('./config/index');
let Frazister = require('./processors/frazister.js');
let frazeGetter = new Frazister();
let daysNum = require('./processors/counting_days.js');
let fuelsNum = require('./processors/fluels.js');
let killsNum = require('./processors/kills.js');
const cors = require('cors');

let db_lib = require('./libs/db_lib.js');
const fs = require("fs");

let app = express();

let server = require('http').createServer(app);

server.listen(config.start_port, function () {
    console.log('App listening on port ' + config.start_port + '!');
});

//security block
//middleware for origin
app.use(function (req, res, next) {
    req.headers.origin = req.headers.origin || req.headers.host;
    next();
});
//end middleware for origin

const whitelist = ['http://benderio.pp.ua', 'benderio.pp.ua', 'www.benderio.pp.ua', 'http://45.94.158.109:8070', '45.94.158.109:8070', '127.0.0.1:8070', 'http://127.0.0.1:8070', 'http://localhost:5173']//todo change on ours domains!!!!!!!!!!!!!!!!!!!

const corsOptions = {
    origin: (origin, cb) => {
        console.log(origin);
        if (whitelist.indexOf(origin) > -1) {
            cb(null, true)
        } else {
            cb('Not allowed by CORS')
        }
    },
}

app.use(cors(corsOptions));
//sb

app.get('/', cors(corsOptions), function (req, res) {
    res.sendFile('index.html', {root: __dirname + '/react/react/dist'});
});

app.get(
    ['/assets*', '/img.png'], cors(corsOptions),
    function (req, res, next) {
        if (req.url.length > 1) {
            let filePath = req.url;
            console.log(__dirname + '/react/react/dist' + filePath)
            let getFileRequest = fs.existsSync(__dirname + '/react/react/dist' + filePath);
            if (getFileRequest) {
                let requestFile = fs.readFileSync(__dirname + '/react/react/dist' + filePath);
                res.write(requestFile);
                res.end();
            } else {
                res.status(400).json({error: 'error'});
            }
        } else {
            next();
        }
    }
);

app.get('/healthcheck', cors(corsOptions), function (req, res) {
    res.end('healthcheck')
});


app.get('/getImpInfo', async function (req, res) {
    let fraze = frazeGetter.get()
    res.status(200).json({
        message: daysNum.getDays(),
        fraze: fraze.citate,
        author: fraze.autor,
        fuel: fuelsNum.getFuelsNumber(),
        kills: killsNum.getKillsNumber(),
        visiters: JSON.parse(JSON.stringify(await db_lib.getVisitersNum()))[0].visiters
    });
})

app.get('/numbs', async function (req, res) {
    let fraze = frazeGetter.get()
    res.status(200).json({
        days_passed: daysNum.getDays(),
        fraze: fraze.citate,
        author: fraze.autor,
        fuel: fuelsNum.getFuelsNumber(),
        kills: killsNum.getKillsNumber(),
        visiters: JSON.parse(JSON.stringify(await db_lib.getVisitersNum()))[0].visiters
    });
})

// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
// catch 404 and forward to error handler
app.use(function (req, res) {
    console.log(req.url);
    let result = {
        status: 'error',
        data: "Page not found" + req.url
    };
    res.status(404).json(result);
});

module.exports = app;
