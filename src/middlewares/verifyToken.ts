import { Request, Response, NextFunction } from 'express';
import ResponseHandler from '../utils/responseHandler';
import { JwtPayload, verify } from 'jsonwebtoken';
import prisma from '../prisma';

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log(token);

    if (!token) {
      return ResponseHandler.error(res, 404, 'token not found');
    }

    console.log(token);

    const converted = verify(token, process.env.TOKEN_KEY || 'secretkey') as JwtPayload;

    const userExist = await prisma.user.findUnique({
      where: {
        email: converted.email,
      },
    });

    if (!userExist) {
      return ResponseHandler.error(res, 404, 'Account not found');
    }

    console.log(userExist);

    res.locals.user = userExist;
    next();
  } catch (error) {
    return ResponseHandler.error(res, 500, 'cookies token is failed', error);
  }
};
