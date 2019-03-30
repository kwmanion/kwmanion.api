var jwt = require("jsonwebtoken");
var secret = process.env.JWT_SECRET;

exports.createJwt = function(email) {
    return jwt.sign({ emailAddress: email }, secret, {
        expiresIn: 86400
    });
};

exports.verifyJwt = function(token) {
    var verified = false;

    jwt.verify(token, secret, function(err) {
        verified = !err;
    });

    return verified;
};

exports.verifyToken = function(req, res, next) {
    var authHeader = req.headers["authorization"];
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
        var token = authHeader.substring(7, authHeader.length);
        if (exports.verifyJwt(token)) {
            next();
        } else {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token' });
        }
    } else {
        return res.status(403).send({ auth: false, message: 'No token provided' });
    }
};