import { Request, Response, NextFunction } from 'express';
import ResponseHandler from '../utils/responseHandler';
import { JwtPayload, verify } from 'jsonwebtoken';
import prisma from '../prisma';

export const cookieToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const tokenp = req.cookies['next-auth']['session-token'];
    console.log(tokenp);

    if (!tokenp) {
      return ResponseHandler.error(res, 404, 'token not found');
    }

    console.log(tokenp);

    const converted = verify(tokenp, process.env.TOKEN_KEY || 'secretkey') as JwtPayload;

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
