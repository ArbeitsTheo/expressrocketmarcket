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
const auth_guard_1 = require("../../guards/auth.guard");
const router = express_1.default.Router();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield database_1.default.order.findMany({
            include: {
                products: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        res.status(200).json(orders);
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userId = req.body.userId;
    const { products } = req.body;
    if (typeof userId === 'string') {
        userId = parseInt(userId, 10);
    }
    if (products.some((product) => typeof product.productId === 'string')) {
        products.forEach((product) => {
            if (typeof product.productId === 'string') {
                product.productId = parseInt(product.productId, 10);
            }
        });
    }
    try {
        const userExists = yield database_1.default.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!userExists) {
            return res.status(404).json("Utilisateur non trouvé");
        }
        const productsExist = yield database_1.default.product.findMany({
            where: {
                id: {
                    in: products.map((product) => product.productId),
                },
            },
        });
        if (productsExist.length !== products.length) {
            return res.status(404).json("Certains produits n'existent pas");
        }
        const newOrder = yield database_1.default.order.create({
            data: {
                userId,
                products: {
                    create: products.map((product) => ({
                        productId: product.productId,
                        quantity: product.quantity,
                    })),
                },
            },
            include: {
                products: true,
            },
        });
        res.status(201).json(newOrder);
    }
    catch (error) {
        console.error("Erreur lors de la création de la commande :", error);
        res.status(500).send("Erreur interne du serveur");
    }
}));
router.patch("/:id", (0, auth_guard_1.checkRoles)(['Admin', 'Gest']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let orderId = req.params.id;
    const { products } = req.body;
    if (typeof orderId === 'string') {
        orderId = parseInt(orderId, 10);
    }
    if (products.some((product) => typeof product.productId === 'string')) {
        products.forEach((product) => {
            if (typeof product.productId === 'string') {
                product.productId = parseInt(product.productId, 10);
            }
        });
    }
    try {
        const productsExist = yield database_1.default.product.findMany({
            where: {
                id: {
                    in: products.map((product) => product.productId),
                },
            },
        });
        if (productsExist.length !== products.length) {
            return res.status(404).json("Certains produits n'existent pas");
        }
        const existingOrder = yield database_1.default.order.findUnique({
            where: { id: orderId },
        });
        if (!existingOrder) {
            return res.status(404).send("Commande introuvable");
        }
        const updatedOrder = yield database_1.default.order.update({
            where: { id: orderId },
            data: {
                products: {
                    deleteMany: {},
                    create: products.map((product) => ({
                        productId: product.productId,
                        quantity: product.quantity,
                    })),
                },
            },
            include: {
                products: true,
            },
        });
        res.status(200).json(updatedOrder);
    }
    catch (error) {
        console.error("Erreur lors de la mise à jour de la commande :", error);
        res.status(500).send("Erreur interne du serveur");
    }
}));
router.delete("/:id", (0, auth_guard_1.checkRoles)(['Admin', 'Gest']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = parseInt(req.params.id);
    try {
        const orderExists = yield database_1.default.order.findUnique({
            where: { id: orderId },
        });
        if (!orderExists) {
            return res.status(404).json("Ordre not exist");
        }
        yield database_1.default.productOrder.deleteMany({
            where: { orderId },
        });
        const deletedOrder = yield database_1.default.order.delete({
            where: { id: orderId },
        });
        res.status(204).send("Delete Order Complete");
    }
    catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).send("Internal Server Error");
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = parseInt(req.params.id);
    try {
        const order = yield database_1.default.order.findUnique({
            where: { id: orderId },
            include: {
                products: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        if (!order) {
            return res.status(404).send("Order not found");
        }
        res.status(200).json(order);
    }
    catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).send("Internal Server Error");
    }
}));
exports.default = router;
