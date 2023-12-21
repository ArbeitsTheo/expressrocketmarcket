import prisma from "../routes/util/database";
import { Request, Response, NextFunction } from "express";

const checkUserExistence = async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = parseInt(req.params.id);
    try {
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            return res.status(404).send("Utilisateur non trouvé");
        }

        req.existingUser = existingUser;
        next();
    } catch (error) {
        console.error("Erreur lors de la vérification de l'existence de l'utilisateur:", error);
        res.status(500).send("Internal Server Error");
    }
};

export default checkUserExistence;
