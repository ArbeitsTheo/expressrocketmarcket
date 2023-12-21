"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helmet_1 = require("helmet");
app.use((0, helmet_1.contentSecurityPolicy)({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", 'maxcdn.bootstrapcdn.com'],
        fontSrc: ["'self'", 'maxcdn.bootstrapcdn.com'],
        // Ajoutez d'autres directives selon vos besoins
    },
}));
exports.default = validateEmailMiddleware;
