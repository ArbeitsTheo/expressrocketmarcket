import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function checkRoles(allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.body.token;

        if (!token) {
            return res.status(401).send('Token not valid');
        }

        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || '');
            const userRole = decoded.role;

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).send('Forbidden');
            }

            req.user = decoded.user;
            next();
        } catch (error) {
            console.log(error);
            return res.status(401).send('Unauthorized');
        }
    };
}
