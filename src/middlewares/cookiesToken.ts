import { Request, Response, NextFunction } from 'express';
import ResponseHandler from '../utils/responseHandler';
import { JwtPayload, verify } from 'jsonwebtoken';
import prisma from '../prisma';

export const cookiesToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const token = req.cookies.secure_auth_token;

    if (!token) {
      return ResponseHandler.error(res, 200, 'token not found');
    }

    console.log(token);

    const converted: any = verify(token, 'wakmasds', { algorithms: ['HS256'] });
    console.log(converted);

    const userExist = await prisma.user.findUnique({
      where: {
        email: converted.email,
      },
    });

    if (!userExist) {
      return ResponseHandler.error(res, 404, 'Account not found');
    }

    res.locals.user = userExist;
    next();
  } catch (error) {
    return ResponseHandler.error(res, 500, 'cookies token is failed', error);
  }
};
