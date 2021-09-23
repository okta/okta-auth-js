const express = require('express');

const withCatch = fn => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

const routerWithCatch = () => {
  const router = express.Router();
  for (const method of ['get', 'post', 'put', 'delete']) {
    const original = router[method];
    router[method] = function(path, handler) {
      original.call(this, path, withCatch(handler));
    };
  }
  return router;
};

module.exports = {
  withCatch,
  routerWithCatch,
};