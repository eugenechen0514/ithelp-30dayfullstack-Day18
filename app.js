var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const MongoService = require('./services/MongoService');
const EchoDao = require('./daos/EchoDao');

//////////　MongoDB 連線 (start)　/////////
const MongoClient = require('mongodb').MongoClient;

/**
 * 
 * @param {object} config
 * @returns {MongoClient}
 */
function createMongoClient({config}) {
  const url = config.mongodb.url;
  const client = new MongoClient(url, { useNewUrlParser: true });

  // 立即連線
  client.connect()
    .then((connectedClient) => {
      console.log('mongodb is connected');
    })
    .catch(error => {
      console.error(error);
    });
    return client;
}

//////////　MongoDB 連線 (end)　/////////

////////// Dependency Injection (start)　/////////
const { createContainer, asClass, asValue, asFunction, Lifetime } = require('awilix');
const { createRouter: createRootRouter } = require('./routes/index');
const config = require('./configs/config');

// 建立 awilix container
const container = createContainer();

container.register({
  config: asValue(config, { lifetime: Lifetime.SINGLETON }),
  mongoClient: asFunction(createMongoClient, { lifetime: Lifetime.SINGLETON }), // 註冊為 mongoClient，且生命期為 SINGLETON (執行中只有一個物件)
  indexRouter: asFunction(createRootRouter, { lifetime: Lifetime.SINGLETON }), // 註冊為 indexRouter，利用工廠函數 createRootRouter 建立物件
});

// 掃描資料夾，用 `asClass` 註冊且名稱命名規則為 camelCase ，生命期為 SINGLETON，
container.loadModules([
  'daos/*.js',
  'services/*.js',
], {
    formatName: 'camelCase',
    resolverOptions: {
      lifetime: Lifetime.SINGLETON,
      register: asClass
    }
  });

// 預先引起建立 mongoClient
const mongoClient = container.resolve('mongoClient');

// 取出名為 indexRouter 物件
//
// 建立物件路徑:
// createRootRouter({mongoService}) -> mongoService -> mongoClient and echoDao
//                                                                        |
//                                                                        ∟ ->  mongoClient
const indexRouter = container.resolve('indexRouter');
////////// Dependency Injection (end)　/////////

var usersRouter = require('./routes/users');

var app = express();

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 印出所有 request 的網址
app.use(function(req, res, next) {
  console.log(req.originalUrl);
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// 若 1. 前面的 middleware 都沒人處理 或 2. 沒有比對到路徑片斷，就會到這裡。
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404)); // 引起 Error, 實際上是 HttpError，它繼承 Error。 給下一個 error-handling middleware　處理。
});

// 最後的 error-handling middleware
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
