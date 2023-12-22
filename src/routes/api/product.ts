import express, { Router, Request, Response } from "express";
import prisma from "../util/database";
import { checkRoles } from "../../guards/auth.guard";

const router: Router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/", checkRoles(['Admin', 'Gest']), async (req: Request, res: Response) => {
    const { name, price } = req.body;

    try {
        const newProduct = await prisma.product.create({
            data: {
                name,
                price,
            },
        });

        res.json(newProduct);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.patch("/:id", checkRoles(['Admin', 'Gest']), async (req: Request, res: Response) => {
    const productId: number = parseInt(req.params.id);
    const { name, price } = req.body;

    try {
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!existingProduct) {
            return res.status(404).send("Product not found");
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                name,
                price,
            },
        });

        res.json(updatedProduct);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Internal Server Error");
    }
});


router.delete("/:id", checkRoles(['Admin', 'Gest']), async (req: Request, res: Response) => {
    const productId: number = parseInt(req.params.id);

    // Vérifie si productId est un nombre valide
    if (isNaN(productId)) {
        return res.status(400).send("Invalid product ID");
    }

    try {
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!existingProduct) {
            return res.status(404).send("Product not found");
        }

        await prisma.$transaction([
            prisma.productOrder.deleteMany({
                where: { productId },
            }),
            prisma.product.delete({
                where: { id: productId },
            }),
        ]);

        res.status(201).send("Delete Product Complete");
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send("Internal Server Error");
    }
});



router.get("/:id", async (req: Request, res: Response) => {
    const productId: number = parseInt(req.params.id);

    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return res.status(404).send("Product not found");
        }

        res.json(product);
    } catch (error) {
        console.error("Error fetching product details:", error);
        res.status(500).send("Internal Server Error");
    }
});


export default router;