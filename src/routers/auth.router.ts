import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { cookiesToken } from '../middlewares/cookiesToken';
import { verifyToken } from '../middlewares/verifyToken';

export class AuthRouter {
  private route: Router;
  private authController: AuthController;

  constructor() {
    this.route = Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // credentials
    this.route.post('/signin/credentials', this.authController.signIn);
    this.route.post('/signup/credentials', this.authController.signUp);
    this.route.post('/req-verify', this.authController.reqVerify);
    this.route.post('/verify/credentials', verifyToken, this.authController.verifyEmailsetPassword);

    // oauth
    this.route.post('/signin/oauth', this.authController.createProfileOauth);

    // general
    this.route.post('/user/detail', this.authController.getUserSessionDetail);
    this.route.get('/user/role', cookiesToken, this.authController.getUserRole);
    this.route.post('/get-token', this.authController.getToken);
    this.route.post('/convert-token', this.authController.convertToken);
  }

  public getRoutes() {
    return this.route;
  }
}
