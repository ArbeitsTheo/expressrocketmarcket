import express, { Router, Request, Response } from "express";
import prisma from "../util/database";
import { checkRoles } from "../../guards/auth.guard";
const router: Router = express.Router();


router.get("/", async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                products: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/", async (req: Request, res: Response) => {
    let userId: number | string = req.body.userId;
    const { products } = req.body;

    if (typeof userId === 'string') {
        userId = parseInt(userId, 10);
    }

    if (products.some((product: any) => typeof product.productId === 'string')) {
        products.forEach((product: any) => {
            if (typeof product.productId === 'string') {
                product.productId = parseInt(product.productId, 10);
            }
        });
    }

    try {
        const userExists = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!userExists) {
            return res.status(404).json("Utilisateur non trouvé");
        }

        const productsExist = await prisma.product.findMany({
            where: {
                id: {
                    in: products.map((product: any) => product.productId),
                },
            },
        });

        if (productsExist.length !== products.length) {
            return res.status(404).json("Certains produits n'existent pas");
        }

        const newOrder = await prisma.order.create({
            data: {
                userId,
                products: {
                    create: products.map((product: any) => ({
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
    } catch (error) {
        console.error("Erreur lors de la création de la commande :", error);
        res.status(500).send("Erreur interne du serveur");
    }
});

router.patch("/:id", checkRoles(['Admin', 'Gest']), async (req: Request, res: Response) => {
    let orderId: number | string = req.params.id;
    const { products } = req.body;

    if (typeof orderId === 'string') {
        orderId = parseInt(orderId, 10);
    }

    if (products.some((product: any) => typeof product.productId === 'string')) {
        products.forEach((product: any) => {
            if (typeof product.productId === 'string') {
                product.productId = parseInt(product.productId, 10);
            }
        });
    }

    try {
        const productsExist = await prisma.product.findMany({
            where: {
                id: {
                    in: products.map((product: any) => product.productId),
                },
            },
        });



        if (productsExist.length !== products.length) {
            return res.status(404).json("Certains produits n'existent pas");
        }

        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!existingOrder) {
            return res.status(404).send("Commande introuvable");
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                products: {
                    deleteMany: {},
                    create: products.map((product: any) => ({
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
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la commande :", error);
        res.status(500).send("Erreur interne du serveur");
    }
});



router.delete("/:id", checkRoles(['Admin', 'Gest']), async (req: Request, res: Response) => {
    const orderId: number = parseInt(req.params.id);

    try {
        const orderExists = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!orderExists) {
            return res.status(404).json("Ordre not exist");
        }
        await prisma.productOrder.deleteMany({
            where: { orderId },
        });

        const deletedOrder = await prisma.order.delete({
            where: { id: orderId },
        });

        res.status(204).send("Delete Order Complete");
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).send("Internal Server Error");
    }
});


router.get("/:id", async (req: Request, res: Response) => {
    const orderId: number = parseInt(req.params.id);

    try {
        const order = await prisma.order.findUnique({
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
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).send("Internal Server Error");
    }
});




export default router;