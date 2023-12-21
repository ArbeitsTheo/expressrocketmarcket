import { Prisma } from "@prisma/client";

declare module 'express-serve-static-core' {
    export interface Request {
        existingUser: Prisma.UserGetPayload,
    }
}