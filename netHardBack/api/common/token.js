const jwt = require('jsonwebtoken');

module.exports = function tokenVerify(req, res, next) {
    try {
        const token = req.headers['x-auth-token'];
        if (!token || token === 'undefined') {
            return res.status(401).json({ error: "token not found" });
        }
        if (jwt.verify(token, req.app.locals.key)) {
            res.locals.identity = jwt.decode(token);
            return next();
        }
        return res.status(401).json({ error: 'incorrect token' });
    } catch (error) {
        console.error(error);
    }
};