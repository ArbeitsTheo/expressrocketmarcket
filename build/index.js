"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
require("./routes/util/passport");
const auth_1 = __importDefault(require("./routes/api/auth"));
const database_1 = __importDefault(require("./routes/util/database"));
const user_1 = __importDefault(require("./routes/api/user"));
const product_1 = __importDefault(require("./routes/api/product"));
const order_1 = __importDefault(require("./routes/api/order"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cspHandler_Middleware_1 = __importDefault(require("./Middlewares/cspHandler.Middleware"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        const port = process.env.PORT;
        app.enable('trust proxy');
        app.set("view engine", "ejs");
        app.use(express_1.default.json());
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
            standardHeaders: true, // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
            legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
            // store: ... , // Use an external store for consistency across multiple server instances.
        });
        app.use(limiter);
        app.use((0, cors_1.default)());
        app.use((0, helmet_1.default)());
        app.use(cspHandler_Middleware_1.default);
        app.use("/auth", auth_1.default);
        app.use("/user", user_1.default);
        app.use("/product", product_1.default);
        app.use("/order", order_1.default);
        app.listen(port, () => {
            console.log(port);
            console.log('Serveur running');
        });
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.default.$disconnect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield database_1.default.$disconnect();
    process.exit(1);
}));
