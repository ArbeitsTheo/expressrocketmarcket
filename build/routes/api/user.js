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
const database_1 = __importDefault(require("../util/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const checkUserExistence_1 = __importDefault(require("../../service/checkUserExistence"));
const checkOldPassword_1 = __importDefault(require("../../service/checkOldPassword"));
const auth_guard_1 = require("../../guards/auth.guard");
const router = express_1.default.Router();
router.patch("/:id", checkUserExistence_1.default, checkOldPassword_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.id);
    const { password, firstName, lastName } = req.body;
    try {
        let updatedUserData = { firstName, lastName };
        if (password) {
            const uncriptedPassword = yield bcrypt_1.default.hash(password, 10);
            updatedUserData.password = uncriptedPassword;
        }
        const updatedUser = yield database_1.default.user.update({
            where: { id: userId },
            data: updatedUserData,
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Internal Server Error");
    }
}));
router.delete("/:id", checkUserExistence_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.id);
    try {
        const userOrders = yield database_1.default.order.findMany({
            where: { userId: userId },
        });
        for (const order of userOrders) {
            yield database_1.default.productOrder.deleteMany({
                where: { orderId: order.id },
            });
        }
        yield database_1.default.order.deleteMany({
            where: { userId: userId },
        });
        yield database_1.default.user.delete({
            where: { id: userId },
        });
        res.status(204).send("User delete");
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Internal Server Error");
    }
}));
router.get("/:id", checkUserExistence_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.id);
    try {
        const userWithOrders = yield database_1.default.user.findUnique({
            where: { id: userId },
            include: {
                orders: {
                    include: {
                        products: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });
        res.status(200).json(userWithOrders);
    }
    catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).send("Internal Server Error");
    }
}));
router.get("/", (0, auth_guard_1.checkRoles)(['Admin', 'Gest']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allUsersWithOrders = yield database_1.default.user.findMany({
            include: {
                orders: {
                    include: {
                        products: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });
        res.status(200).json(allUsersWithOrders);
    }
    catch (error) {
        console.error("Error fetching all users with orders:", error);
        res.status(500).send("Internal Server Error");
    }
}));
exports.default = router;
