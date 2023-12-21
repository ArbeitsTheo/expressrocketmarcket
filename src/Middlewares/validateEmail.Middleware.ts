import express, { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../routes/util/database";

interface User {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
}

const validateEmailMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { email }: User = req.body;

    if (!isValidEmail(email)) {
        return res.status(400).send("Invalid email address");
    }

    next();
};

const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export default validateEmailMiddleware;