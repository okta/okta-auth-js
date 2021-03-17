const interactMiddleware = require('./interact');
const v1LoginMiddleware = require('./v1/loginMiddleware');

module.exports = function loginMiddleware(req, res, next) {
  console.log('REQUEST BODY', req.body);
  
  const useInteractionCodeFlow = req.body.useInteractionCodeFlow;
  if (useInteractionCodeFlow) {
    return interactMiddleware(req, res, next);
  }
  return v1LoginMiddleware(req, res, next);
};
