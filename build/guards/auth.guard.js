"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRoles = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function checkRoles(allowedRoles) {
    return (req, res, next) => {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return res.status(401).send('Token not valid');
        }
        const [bearer, token] = authorizationHeader.split(' ');
        if (!bearer || !token || bearer.toLowerCase() !== 'bearer') {
            return res.status(401).send('Invalid Authorization header format');
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '');
            const userRole = decoded.role;
            console.log(userRole);
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).send('Unauthorized');
            }
            req.user = decoded.user;
            next();
        }
        catch (error) {
            console.log(error);
            return res.status(401).send('Unauthorized');
        }
    };
}
exports.checkRoles = checkRoles;
