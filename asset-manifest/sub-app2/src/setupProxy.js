module.exports = function setupProxy(app) {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });
};
