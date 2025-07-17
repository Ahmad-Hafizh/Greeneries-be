import { Router } from 'express';
import { AddressController } from '../controllers/address.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { cookiesToken } from '../middlewares/cookiesToken';

export class AddressRouter {
  private router: Router;
  private addressController: AddressController;

  constructor() {
    this.router = Router();
    this.addressController = new AddressController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/create', cookiesToken, this.addressController.createAddress);
  }

  public getRoutes() {
    return this.router;
  }
}
