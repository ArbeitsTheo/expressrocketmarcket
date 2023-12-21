import express, { Router, Request, Response } from "express";
import prisma from "../util/database";

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
    console.log(userId, products);
    try {
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

router.patch("/:id", async (req: Request, res: Response) => {
    const orderId: number = parseInt(req.params.id);
    const { products } = req.body;

    try {
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


router.delete("/:id", async (req: Request, res: Response) => {
    const orderId: number = parseInt(req.params.id);

    try {
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