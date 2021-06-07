module.exports = function redirect({ req, res, path }) {
  const { transactionId } = req;

  const url = new URL(path, 'relative:///');
  url.searchParams.set('state', transactionId);
  
  const redirectPath = `${url.pathname}${url.search}${url.hash}`;
  res.redirect(redirectPath);
};
