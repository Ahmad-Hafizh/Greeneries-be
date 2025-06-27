import { Request, Response } from 'express';
import ResponseHandler from '../utils/responseHandler';
import prisma from '../prisma';
import { sign } from 'jsonwebtoken';
import { transporter } from '../utils/nodemailer';
import { hashPassword } from '../utils/hashPassword';
import { compareSync } from 'bcrypt';

export class AuthController {
  async signIn(req: Request, res: Response): Promise<any> {
    try {
      const { email, password } = req.body;

      const isExist = await prisma.user.findUnique({
        where: { email },
        include: { accounts: true },
      });

      if (!isExist) {
        return ResponseHandler.error(res, 404, 'user not found');
      }

      if (isExist.accounts) {
        return ResponseHandler.error(res, 404, 'oauth sign in');
      }

      if (!isExist.password) {
        return ResponseHandler.error(res, 404, 'Password is not set');
      }

      const compare = compareSync(password, isExist.password);

      if (!compare) {
        return ResponseHandler.error(res, 404, 'Password is incorrect');
      }

      // if (password !== isExist.password) {
      //   return ResponseHandler.error(res, 404, 'Password is not correct');
      // }

      return ResponseHandler.success(res, 200, 'success', {
        name: isExist.name,
        email: isExist.email,
        emailVerified: isExist.emailVerified,
        image: isExist.image,
        role: isExist.role,
      });
    } catch (error) {
      return ResponseHandler.error(res, 500, 'error');
    }
  }

  async signUp(req: Request, res: Response): Promise<any> {
    try {
      const { email, name } = req.body;

      const isExist = await prisma.user.findUnique({
        where: { email },
      });

      if (isExist) {
        return ResponseHandler.error(res, 404, 'user is already exist');
      }

      const { user, authToken } = await prisma.$transaction(async (tx: any) => {
        const user = await tx.user.create({
          data: {
            email: email.toLowerCase(),
            name,
          },
        });

        await tx.profile.create({
          data: {
            userId: user.id,
          },
        });

        const authToken = sign({ email: user.email }, process.env.TOKEN_KEY!, { expiresIn: '1h' });

        return { user, authToken };
      });

      await transporter.sendMail({
        from: 'Greeneries',
        to: user.email,
        subject: 'email verification and set password',
        html: `<div>
                <h1>Thank you ${user.name}, for registrater your account</h1>
                <p>klik link below to verify your account</p>
                <a href='${process.env.FE_URL}/auth/verify?a_t=${authToken}'>Verify Account</a>
                </div>`,
      });

      return ResponseHandler.success(res, 200, 'sign up success');
    } catch (error) {
      return ResponseHandler.error(res, 500, 'Internal Server Error', error);
    }
  }

  async verifyEmailsetPassword(req: Request, res: Response): Promise<any> {
    try {
      const user = res.locals.user;

      const newAccount = await prisma.user.update({
        where: { email: user.email },
        data: {
          emailVerified: new Date().toISOString(),
          password: await hashPassword(req.body.password),
        },
      });

      return ResponseHandler.success(res, 200, 'verify success', newAccount);
    } catch (error) {
      return ResponseHandler.error(res, 500, 'Internal Server Error', error);
    }
  }

  async reqVerify(req: Request, res: Response): Promise<any> {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: {
          email,
          emailVerified: null,
        },
        include: { accounts: true },
      });

      if (!user) {
        return ResponseHandler.success(res, 404, 'account not found ');
      }

      if (user.accounts) {
        return ResponseHandler.success(res, 404, 'account is an oauth');
      }

      const authToken = sign({ email: user.email }, process.env.TOKEN_KEY || 'secretkey', { expiresIn: '1h' });

      await transporter.sendMail({
        from: 'grocery',
        to: user.email ?? '',
        subject: 'email verification and set password',
        html: `<div>
                <h1>Thank you ${user.name}, for registrater your account</h1>
                <p>klik link below to verify your account</p>
                <a href='${process.env.FE_URL}/auth/verify?a_t=${authToken}'>Verify Account</a>
                </div>`,
      });

      return ResponseHandler.success(res, 200, 'ask verify success');
    } catch (error) {
      return ResponseHandler.error(res, 500, 'Internal Server Error', error);
    }
  }

  async createProfileOauth(req: Request, res: Response): Promise<any> {
    try {
      const { userId } = req.body;
      const isExist = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!isExist) {
        return ResponseHandler.error(res, 404, 'user not found');
      }

      await prisma.profile.upsert({
        where: {
          userId: isExist.id,
        },
        create: {
          userId: isExist.id,
        },
        update: {
          userId: isExist.id,
        },
      });

      return ResponseHandler.success(res, 200, 'create profile success');
    } catch (error) {
      return ResponseHandler.error(res, 500, 'Internal Server Error', error);
    }
  }

  async getUserSessionDetail(req: Request, res: Response): Promise<any> {
    try {
      // const isExist = res.locals.user;

      const isExist = await prisma.user.findUnique({
        where: {
          email: req.body.email,
        },
      });

      if (!isExist) {
        return ResponseHandler.error(res, 404, 'no account exist');
      }

      return ResponseHandler.success(res, 200, 'create profile success', {
        email: isExist.email,
        name: isExist.name,
        image: isExist.image,
        emailVerified: isExist.emailVerified,
        role: isExist.role,
      });
    } catch (error) {
      return ResponseHandler.error(res, 500, 'Internal Server Error', error);
    }
  }

  async getUserRole(req: Request, res: Response): Promise<any> {
    try {
      const user = res.locals.user;
      return ResponseHandler.success(res, 200, 'create profile success', {
        role: user.role,
      });
    } catch (error) {
      return ResponseHandler.error(res, 500, 'Internal Server Error', error);
    }
  }
}
