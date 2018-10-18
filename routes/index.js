var express = require('express');
const UserRouter = require('./users');

/**
 * 
 * @param {object} dependencies
 * @param {MongoService} dependencies.mongoService 
 */
function createRouter(dependencies) {
  // Get dependencies
  const { mongoService } = dependencies;

  // Create a router
  var router = express.Router();

  /* GET home page. */
  router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
  });

  router.get('/api/sayHi', function (req, res, next) {
    res.send('hi');
  });

  router.post('/api/echo', function (req, res, next) {
    const body = req.body;

    mongoService.insertEcho(body)
      .then(() => {
        res.json(body);
      })
      .catch(next); // 發生 error 的話，next() 交給之後的 middleware 處理，express 有預設的處理方法
  });

  router.get('/api/mongo', function (req, res, next) {
    mongoService.isConnected()
      .then(isConnected => {
        res.json({ isConnected });
      })
      .catch(next);
  });

  const mongoose = require('mongoose');
  router.get('/api/mongoose', function (req, res, next) {
    const dbName = 'myproject';

    const worker = (async function () {
      const connection = await mongoose.connect(`mongodb://localhost:27017/${dbName}`);
      return connection.readyState;
    })();


    worker
      .then(readyState => {
        res.json({
          readyState,
        });
      })
      .catch(next);
  });

  function middleware1(req, res, next) {
    // 錯誤發生(一)
    // throw new Error('fake error by throw'); 
    
    // 錯誤發生(二)
    // next(new Error('fake error by next()'));
    // return;

    console.log('middleware1');
    next(); // 引發下一個 middleware
  }
  function middleware2(req, res, next) {
    console.log('middleware2');
    next(); // 引發下一個 middleware
  }
  router.get('/api/middleware', middleware1, middleware2, function (res, res, next) {
    res.send('done');
  });

  router.use('/user', UserRouter);
  return router;
}

module.exports = {
  createRouter
};
