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
const bcrypt_1 = __importDefault(require("bcrypt"));
const checkOldPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword } = req.body;
    const { existingUser } = req;
    try {
        const passwordMatch = yield bcrypt_1.default.compare(oldPassword, existingUser.password);
        if (!passwordMatch) {
            return res.status(401).send("Ancien mot de passe incorrect");
        }
        next();
    }
    catch (error) {
        console.error("Erreur lors de la vérification de l'ancien mot de passe:", error);
        res.status(500).send("Internal Server Error");
    }
});
exports.default = checkOldPassword;
