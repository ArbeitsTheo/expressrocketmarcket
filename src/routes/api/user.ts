import express, { Router, Request, Response } from "express";
import prisma from "../util/database";
import bcrypt from "bcrypt";
import checkUserExistence from "../../service/checkUserExistence";
import checkOldPassword from "../../service/checkOldPassword";
import { checkRoles } from "../../guards/auth.guard";

interface UpdatedUser {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
}

const router: Router = express.Router();

router.patch("/:email", checkUserExistence, checkOldPassword, async (req: Request, res: Response) => {
    const userEmail: string = req.params.email;
    const { password, firstName, lastName }: UpdatedUser = req.body;

    try {
        let updatedUserData: UpdatedUser = { firstName, lastName };
        if (password) {
            const uncriptedPassword: string = await bcrypt.hash(password, 10);
            updatedUserData.password = uncriptedPassword;
        }

        const updatedUser = await prisma.user.update({
            where: { email: userEmail },
            data: updatedUserData,
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Internal Server Error");
    }
});


router.delete("/:email", checkUserExistence, async (req: Request, res: Response) => {
    const userEmail: string = req.params.email;

    try {
        const existingUser = req.existingUser;

        const userOrders = await prisma.order.findMany({
            where: { userId: existingUser.id },
        });

        for (const order of userOrders) {
            await prisma.productOrder.deleteMany({
                where: { orderId: order.id },
            });
        }

        await prisma.order.deleteMany({
            where: { userId: existingUser.id },
        });

        await prisma.user.delete({
            where: { email: userEmail },
        });

        res.status(200).send("User delete");
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Internal Server Error");
    }
});



router.get("/:email", checkUserExistence, async (req: Request, res: Response) => {
    const userEmail: string = req.params.email;

    try {
        const userWithOrders = await prisma.user.findUnique({
            where: { email: userEmail },
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
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).send("Internal Server Error");
    }
});


router.get("/", checkRoles(['Admin']), async (req: Request, res: Response) => {
    try {
        const allUsersWithOrders = await prisma.user.findMany({
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
    } catch (error) {
        console.error("Error fetching all users with orders:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.patch("/role/:email", checkRoles(['Admin']), checkUserExistence, async (req: Request, res: Response) => {
    const userEmail: string = req.params.email;
    const { role }: { role: string } = req.body;

    try {
        const validRoles = ['Admin', 'Gest', 'Client'];
        if (!validRoles.includes(role)) {
            return res.status(400).send("Invalid role");
        }

        const updatedUser = await prisma.user.update({
            where: { email: userEmail },
            data: { role: role },
        });

        res.status(200).json("Update role ok");
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).send("Internal Server Error");
    }
});


export default router;
