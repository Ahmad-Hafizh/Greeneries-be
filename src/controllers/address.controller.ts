import { Request, Response } from 'express';
import ResponseHandler from '../utils/responseHandler';
import prisma from '../prisma';

export class AddressController {
  async createAddress(req: Request, res: Response): Promise<any> {
    try {
      const user = res.locals.user;

      const profile = await prisma.profile.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!profile) {
        // await prisma.profile.create({
        //   data: {
        //     userId: user.id,
        //   },
        // });

        return ResponseHandler.error(res, 404, 'profile not found');
      }

      const newAddress = await prisma.address.create({
        data: { ...req.body, profile_id: profile?.profile_id },
      });

      return ResponseHandler.success(res, 200, 'Create new address success', newAddress);
    } catch (error) {
      return ResponseHandler.error(res, 500, 'server error', error);
    }
  }
}
