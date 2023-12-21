import express, { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../util/database";

interface User {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

const router: Router = express.Router();

import { Prisma } from '@prisma/client';

router.post('/signup', async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, role }: User = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).send("Email already in use");
    }

    // Si l'e-mail n'est pas déjà utilisé, créer le nouvel utilisateur
    const uncriptedPassword: string = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: uncriptedPassword,
        firstName,
        lastName,
        role,
      },
    });

    return res.status(200).send(newUser);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});


router.post("/signIn", async (req: Request, res: Response) => {
  const { email, password }: User = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    console.log(user);
    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    const isSamePassword: boolean = await bcrypt.compare(password, user.password);

    if (!isSamePassword) {
      return res.status(401).send("Not good password");
    }

    const token: string = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET || "", {
      expiresIn: "1h"
    });
    console.log(token);
    return res.status(200).send(token);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

export default router;

