"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validateEmailMiddleware = (req, res, next) => {
    const { email } = req.body;
    if (!isValidEmail(email)) {
        return res.status(400).send("Invalid email address");
    }
    next();
};
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.default = validateEmailMiddleware;
