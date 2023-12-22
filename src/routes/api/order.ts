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
        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/", async (req: Request, res: Response) => {
    const { userId, products } = req.body;
    // console.log(userId, products);

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

        res.json(newOrder);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).send("Internal Server Error");
    }
});


router.patch("/:id", checkRoles(['Admin', 'Gest']), async (req: Request, res: Response) => {
    const orderId: number = parseInt(req.params.id);
    const { products } = req.body;

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
            return res.status(404).send("Order not found");
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

        res.json(updatedOrder);
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).send("Internal Server Error");
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

        res.status(201).send("Delete Order Complete");
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

        res.json(order);
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).send("Internal Server Error");
    }
});




export default router;