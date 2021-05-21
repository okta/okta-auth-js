module.exports = function getIdpSemanticClass(type) {
  switch (type) {
    case 'GOOGLE':
      return 'google plus';
    default: 
    return '';
  }
};
