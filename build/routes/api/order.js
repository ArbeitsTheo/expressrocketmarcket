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
        res.json(orders);
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, products } = req.body;
    console.log(userId, products);
    try {
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
        res.json(newOrder);
    }
    catch (error) {
        console.error("Error creating order:", error);
        res.status(500).send("Internal Server Error");
    }
}));
router.patch("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = parseInt(req.params.id);
    const { products } = req.body;
    try {
        const existingOrder = yield database_1.default.order.findUnique({
            where: { id: orderId },
        });
        if (!existingOrder) {
            return res.status(404).send("Order not found");
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
        res.json(updatedOrder);
    }
    catch (error) {
        console.error("Error updating order:", error);
        res.status(500).send("Internal Server Error");
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = parseInt(req.params.id);
    try {
        yield database_1.default.productOrder.deleteMany({
            where: { orderId },
        });
        const deletedOrder = yield database_1.default.order.delete({
            where: { id: orderId },
        });
        res.status(201).send("Delete Order Complete");
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
        res.json(order);
    }
    catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).send("Internal Server Error");
    }
}));
exports.default = router;
