import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import "./routes/util/passport";
import AuthRoutes from "./routes/api/auth";
import prisma from "./routes/util/database";
import UserRoutes from "./routes/api/user";
import ProductRoute from "./routes/api/product"
import OrderRoute from "./routes/api/order"
import cors from "cors";
import helmet from "helmet";
import cspHandler from "./Middlewares/cspHandler.Middleware";

async function main() {
    const app = express();
    const port = process.env.PORT;

    app.set("view engine", "ejs")

    app.use(express.json());

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
        standardHeaders: true, // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
        // store: ... , // Use an external store for consistency across multiple server instances.
    })

    app.use(limiter)
    app.use(cors());
    app.use(helmet());
    app.use(cspHandler);

    app.use("/auth", AuthRoutes);
    app.use("/user", UserRoutes);
    app.use("/product", ProductRoute);
    app.use("/order", OrderRoute);

    app.listen(port, () => {
        console.log(port);
        console.log('Serveur running');
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });