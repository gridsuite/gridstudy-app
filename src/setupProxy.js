const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    createProxyMiddleware('http://localhost:5001/api/study-server', {
        pathRewrite: { '^/api/study-server/': '/' }
    })
  );

  app.use(
    createProxyMiddleware('http://localhost:5000/api/case-server', {
        pathRewrite: { '^/api/case-server/': '/' }
    })
  );

  app.use(
    createProxyMiddleware('http://localhost:9000/api/gateway', {
        pathRewrite: { '^/api/gateway/': '/' }
    })
  );
};
