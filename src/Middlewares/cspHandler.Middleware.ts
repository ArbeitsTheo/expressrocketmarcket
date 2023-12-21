import { Request, Response, NextFunction } from "express";
import { contentSecurityPolicy } from "helmet";

const csp = contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", 'maxcdn.bootstrapcdn.com'],
    fontSrc: ["'self'", 'maxcdn.bootstrapcdn.com'],
  },
});

const cspHandler = (req: Request, res: Response, next: NextFunction) => {
  csp(req, res, (err?: Error) => {
    if (err) {
      return res.status(500).send("Internal Server Error");
    }
    next();
  });
};

export default cspHandler;
