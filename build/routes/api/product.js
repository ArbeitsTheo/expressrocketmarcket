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
        const products = yield database_1.default.product.findMany();
        res.json(products);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Internal Server Error");
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price } = req.body;
    try {
        const newProduct = yield database_1.default.product.create({
            data: {
                name,
                price,
            },
        });
        res.json(newProduct);
    }
    catch (error) {
        console.error("Error creating product:", error);
        res.status(500).send("Internal Server Error");
    }
}));
router.patch("/:id", (0, auth_guard_1.checkRoles)(['Admin', 'Gest']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = parseInt(req.params.id);
    const { name, price } = req.body;
    try {
        const existingProduct = yield database_1.default.product.findUnique({
            where: { id: productId },
        });
        if (!existingProduct) {
            return res.status(404).send("Product not found");
        }
        const updatedProduct = yield database_1.default.product.update({
            where: { id: productId },
            data: {
                name,
                price,
            },
        });
        res.json(updatedProduct);
    }
    catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Internal Server Error");
    }
}));
router.delete("/:id", (0, auth_guard_1.checkRoles)(['Admin', 'Gest']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = parseInt(req.params.id);
    try {
        yield database_1.default.$transaction([
            database_1.default.productOrder.deleteMany({
                where: { productId },
            }),
            database_1.default.product.delete({
                where: { id: productId },
            }),
        ]);
        res.status(201).send("Delete Product Complete");
    }
    catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send("Internal Server Error");
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = parseInt(req.params.id);
    try {
        const product = yield database_1.default.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            return res.status(404).send("Product not found");
        }
        res.json(product);
    }
    catch (error) {
        console.error("Error fetching product details:", error);
        res.status(500).send("Internal Server Error");
    }
}));
exports.default = router;
