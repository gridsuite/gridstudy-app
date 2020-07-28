const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {
    app.use(
        createProxyMiddleware('http://localhost:5001/api/study-server', {
            pathRewrite: { '^/api/study-server/': '/' },
        })
    );

    app.use(
        createProxyMiddleware('http://localhost:5000/api/case-server', {
            pathRewrite: { '^/api/case-server/': '/' },
        })
    );

    app.use(
        createProxyMiddleware('http://localhost:9000/ws/gateway/notification', {
            pathRewrite: { '^/ws/gateway/': '/' },
            ws: true,
        })
    );

    app.use(
        createProxyMiddleware('http://localhost:9000/api/gateway', {
            pathRewrite: { '^/api/gateway/': '/' },
        })
    );

    app.use(
        createProxyMiddleware('http://localhost:5009/ws/notification-server', {
            pathRewrite: { '^/ws/notification-server/': '/' },
            ws: true,
        })
    );
};
