"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../util/database"));
const router = express_1.default.Router();
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, firstName, lastName, role } = req.body;
    try {
        const existingUser = yield database_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).send("Email already in use");
        }
        // Si l'e-mail n'est pas déjà utilisé, créer le nouvel utilisateur
        const uncriptedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = yield database_1.default.user.create({
            data: {
                email,
                password: uncriptedPassword,
                firstName,
                lastName,
                role,
            },
        });
        return res.status(200).send(newUser);
    }
    catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error");
    }
}));
router.post("/signIn", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield database_1.default.user.findUnique({ where: { email } });
        console.log(user);
        if (!user) {
            return res.status(401).send("Unauthorized");
        }
        const isSamePassword = yield bcrypt_1.default.compare(password, user.password);
        if (!isSamePassword) {
            return res.status(401).send("Not good password");
        }
        const token = jsonwebtoken_1.default.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET || "", {
            expiresIn: "1h"
        });
        console.log(token);
        return res.status(200).send(token);
    }
    catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error");
    }
}));
exports.default = router;
