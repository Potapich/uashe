let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let session = require('express-session')
let config = require('./config/index');
let Frazister = require('./processors/frazister.js');
let frazeGetter = new Frazister();
let daysNum = require('./processors/counting_days.js');
let fuelsNum = require('./processors/fluels.js');
let killsNum = require('./processors/kills.js');

let db_lib = require('./libs/db_lib.js');

// let indexRouter = require('./routes/index');
// let usersRouter = require('./routes/users');

let app = express();

let server = require('http').createServer(app);

server.listen(config.start_port, function () {
    console.log('App listening on port ' + config.start_port + '!');
});

app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true}
}))
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
app.get('/', async function (req, res) {
    let fraze = frazeGetter.get()
    res.render('index', {
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
