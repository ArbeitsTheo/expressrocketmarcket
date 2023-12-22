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
const database_1 = __importDefault(require("../routes/util/database"));
const checkUserExistence = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userEmail = req.params.email;
    try {
        const existingUser = yield database_1.default.user.findUnique({
            where: { email: userEmail },
        });
        if (!existingUser) {
            return res.status(404).send("Utilisateur non trouvé");
        }
        req.existingUser = existingUser;
        next();
    }
    catch (error) {
        console.error("Erreur lors de la vérification de l'existence de l'utilisateur:", error);
        res.status(500).send("Internal Server Error");
    }
});
exports.default = checkUserExistence;
