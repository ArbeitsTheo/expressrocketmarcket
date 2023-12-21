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

router.patch("/:id", checkUserExistence, checkOldPassword, async (req: Request, res: Response) => {
    const userId: number = parseInt(req.params.id);
    const { password, firstName, lastName }: UpdatedUser = req.body;

    try {
        let updatedUserData: UpdatedUser = { firstName, lastName };
        if (password) {
            const uncriptedPassword: string = await bcrypt.hash(password, 10);
            updatedUserData.password = uncriptedPassword;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updatedUserData,
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.delete("/:id", checkUserExistence, async (req: Request, res: Response) => {
    const userId: number = parseInt(req.params.id);

    try {
        await prisma.user.delete({
            where: { id: userId },
        });

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/:id", checkUserExistence, async (req: Request, res: Response) => {
    const userId: number = parseInt(req.params.id);

    try {
        const userWithOrders = await prisma.user.findUnique({
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
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/", checkRoles(['Admin', 'Gest']), async (req: Request, res: Response) => {
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

export default router;
