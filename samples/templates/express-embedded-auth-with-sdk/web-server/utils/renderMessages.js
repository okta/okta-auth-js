const getSemanticClass = (messages) => {
  const mapClass = messageClass => {
    switch (messageClass) {
      case 'INFO':
        return 'info';
      case 'ERROR':
        return 'negative';
      default:
        return '';
    }
  };
  
  return messages.reduce((acc, curr) => {
    if (acc) {
      return acc;
    }
    return mapClass(curr.class);
  }, '');
};

module.exports = function renderMessages(res, {
  template, messages, ...restOptions 
}) {
  const semanticClass = getSemanticClass(messages);
  res.render(template, {
    hasMessages: true,
    messages,
    class: semanticClass,
    ...restOptions,
  });
};
