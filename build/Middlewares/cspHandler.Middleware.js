"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helmet_1 = require("helmet");
const csp = (0, helmet_1.contentSecurityPolicy)({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", 'maxcdn.bootstrapcdn.com'],
        fontSrc: ["'self'", 'maxcdn.bootstrapcdn.com'],
    },
});
const cspHandler = (req, res, next) => {
    csp(req, res, (err) => {
        if (err) {
            return res.status(500).send("Internal Server Error");
        }
        next();
    });
};
exports.default = cspHandler;
