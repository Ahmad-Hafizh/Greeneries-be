"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const cookiesToken_1 = require("../middlewares/cookiesToken");
const verifyToken_1 = require("../middlewares/verifyToken");
class AuthRouter {
    constructor() {
        this.route = (0, express_1.Router)();
        this.authController = new auth_controller_1.AuthController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // credentials
        this.route.post('/signin/credentials', this.authController.signIn);
        this.route.post('/signup/credentials', this.authController.signUp);
        this.route.post('/req-verify', this.authController.reqVerify);
        this.route.post('/verify/credentials', verifyToken_1.verifyToken, this.authController.verifyEmailsetPassword);
        // oauth
        this.route.post('/signin/oauth', this.authController.createProfileOauth);
        // general
        this.route.post('/user/detail', this.authController.getUserSessionDetail);
        this.route.get('/user/role', cookiesToken_1.cookieToken, this.authController.getUserRole);
    }
    getRoutes() {
        return this.route;
    }
}
exports.AuthRouter = AuthRouter;
