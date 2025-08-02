import { Request, Response } from 'express';
import ResponseHandler from '../utils/responseHandler';
import prisma from '../prisma';
import axios from 'axios';

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

  async createAddressByCoordinates(req: Request, res: Response): Promise<any> {
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
      const { lat, lng, address_name } = req.body;

      const { data: reverseGeocoding }: any = await axios.get(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}&api_key=${process.env.GEOCODING_MAP_API_KEY}`);

      const newAddress = await prisma.address.create({
        data: {
          address_name,
          profile_id: profile?.profile_id,
          lat,
          lng,
          city: reverseGeocoding.address.city,
          country: reverseGeocoding.address.country,
          province: reverseGeocoding.address.state,
          zipcode: reverseGeocoding.address.postcode,
          unit: '1',
          street: reverseGeocoding.address.suburb,
        },
      });

      return ResponseHandler.success(res, 200, 'Create new address success', newAddress);
    } catch (error) {
      return ResponseHandler.error(res, 500, 'server error', error);
    }
  }
  async getAddressList(req: Request, res: Response): Promise<any> {
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

      const addressList = await prisma.address.findMany({
        where: { profile_id: profile.profile_id },
      });

      return ResponseHandler.success(res, 200, 'Get address list success', addressList);
    } catch (error) {
      return ResponseHandler.error(res, 500, 'server error', error);
    }
  }
  async getAddressDetail(req: Request, res: Response): Promise<any> {
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

      const address = await prisma.address.findUnique({
        where: {
          address_id: req.params.address_id,
          profile_id: profile.profile_id,
        },
      });

      return ResponseHandler.success(res, 200, 'Get address list success', address);
    } catch (error) {
      return ResponseHandler.error(res, 500, 'server error', error);
    }
  }
}
