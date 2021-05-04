module.exports = function terminalMessages(req, res, next) {

  req.getTerminalMessages = function getTerminalMessages() {
    return req.session.terminalMessages;
  };
  
  req.setTerminalMessages = function setTerminalMessages(messages) {
    req.session.terminalMessages = messages;
  };
  
  req.clearTerminalMessages = function clearTerminalMessages() {
    delete req.session.terminalMessages;
  };

  next();
};
