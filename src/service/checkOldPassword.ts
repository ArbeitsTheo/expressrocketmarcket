import prisma from "../routes/util/database";
import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";

const checkOldPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword } = req.body;
    const { existingUser } = req;

    try {
        const passwordMatch: boolean = await bcrypt.compare(oldPassword, existingUser.password);

        if (!passwordMatch) {
            return res.status(401).send("Ancien mot de passe incorrect");
        }

        next();
    } catch (error) {
        console.error("Erreur lors de la vérification de l'ancien mot de passe:", error);
        res.status(500).send("Internal Server Error");
    }
};

export default checkOldPassword;