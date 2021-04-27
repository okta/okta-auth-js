module.exports = function redirect({ req, res, path }) {
  const { transactionId } = req.query;
  res.redirect(`${path}?transactionId=${transactionId}`);
};
