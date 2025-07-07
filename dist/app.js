"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_router_1 = require("./routers/auth.router");
dotenv_1.default.config();
const PORT = 5050;
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.configure();
        this.routes();
    }
    configure() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
    }
    routes() {
        this.app.get('/', (req, res) => {
            res.status(200).send('connected');
        });
        const authRoutes = new auth_router_1.AuthRouter();
        this.app.use('/auth', authRoutes.getRoutes());
    }
    startServer() {
        this.app.listen(PORT, () => console.log(`Server is running on port http://localhost:${PORT}/`));
    }
}
exports.default = new App();
