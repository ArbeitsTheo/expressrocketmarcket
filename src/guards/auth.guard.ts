import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function checkRoles(allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            return res.status(401).send('Token not valid');
        }

        const [bearer, token] = authorizationHeader.split(' ');

        if (!bearer || !token || bearer.toLowerCase() !== 'bearer') {
            return res.status(401).send('Invalid Authorization header format');
        }

        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || '');
            const userRole = decoded.role;
            console.log(userRole);
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).send('Unauthorized');
            }

            req.user = decoded.user;
            next();
        } catch (error) {
            console.log(error);
            return res.status(401).send('Unauthorized');
        }
    };
}