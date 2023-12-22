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
import ViewsRoutes from "./routes/view"

async function main() {
    const app = express();
    const port = process.env.PORT;

    app.enable('trust proxy')

    app.set("view engine", "ejs")

    app.set('views', 'src/views');

    app.use(express.json());

    const limiter = rateLimit({
        validate: { trustProxy: false },
        windowMs: 15 * 60 * 1000,
        limit: 100,
        standardHeaders: true,
        legacyHeaders: false,
    })

    app.use(limiter)
    app.use(cors());
    app.use(helmet());
    app.use(cspHandler);

    app.use("/", ViewsRoutes);
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