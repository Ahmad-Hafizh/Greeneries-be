"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const responseHandler_1 = __importDefault(require("../utils/responseHandler"));
const prisma_1 = __importDefault(require("../prisma"));
const jsonwebtoken_1 = require("jsonwebtoken");
const nodemailer_1 = require("../utils/nodemailer");
const hashPassword_1 = require("../utils/hashPassword");
const bcrypt_1 = require("bcrypt");
class AuthController {
    signIn(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const isExist = yield prisma_1.default.user.findUnique({
                    where: { email },
                    include: { accounts: true },
                });
                if (!isExist) {
                    return responseHandler_1.default.error(res, 404, 'user not found');
                }
                if (isExist.accounts) {
                    return responseHandler_1.default.error(res, 404, 'oauth sign in');
                }
                if (!isExist.password) {
                    return responseHandler_1.default.error(res, 404, 'Password is not set');
                }
                const compare = (0, bcrypt_1.compareSync)(password, isExist.password);
                if (!compare) {
                    return responseHandler_1.default.error(res, 404, 'Password is incorrect');
                }
                // if (password !== isExist.password) {
                //   return ResponseHandler.error(res, 404, 'Password is not correct');
                // }
                return responseHandler_1.default.success(res, 200, 'success', {
                    name: isExist.name,
                    email: isExist.email,
                    emailVerified: isExist.emailVerified,
                    image: isExist.image,
                    role: isExist.role,
                });
            }
            catch (error) {
                return responseHandler_1.default.error(res, 500, 'error');
            }
        });
    }
    signUp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, name } = req.body;
                const isExist = yield prisma_1.default.user.findUnique({
                    where: { email },
                });
                if (isExist) {
                    return responseHandler_1.default.error(res, 404, 'user is already exist');
                }
                const { user, authToken } = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const user = yield tx.user.create({
                        data: {
                            email: email.toLowerCase(),
                            name,
                        },
                    });
                    yield tx.profile.create({
                        data: {
                            userId: user.id,
                        },
                    });
                    const authToken = (0, jsonwebtoken_1.sign)({ email: user.email }, process.env.TOKEN_KEY, { expiresIn: '1h' });
                    return { user, authToken };
                }));
                yield nodemailer_1.transporter.sendMail({
                    from: 'Greeneries',
                    to: user.email,
                    subject: 'email verification and set password',
                    html: `<div>
                <h1>Thank you ${user.name}, for registrater your account</h1>
                <p>klik link below to verify your account</p>
                <a href='${process.env.FE_URL}/auth/verify?a_t=${authToken}'>Verify Account</a>
                </div>`,
                });
                return responseHandler_1.default.success(res, 200, 'sign up success');
            }
            catch (error) {
                return responseHandler_1.default.error(res, 500, 'Internal Server Error', error);
            }
        });
    }
    verifyEmailsetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = res.locals.user;
                const newAccount = yield prisma_1.default.user.update({
                    where: { email: user.email },
                    data: {
                        emailVerified: new Date().toISOString(),
                        password: yield (0, hashPassword_1.hashPassword)(req.body.password),
                    },
                });
                return responseHandler_1.default.success(res, 200, 'verify success', newAccount);
            }
            catch (error) {
                return responseHandler_1.default.error(res, 500, 'Internal Server Error', error);
            }
        });
    }
    reqVerify(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { email } = req.body;
                const user = yield prisma_1.default.user.findUnique({
                    where: {
                        email,
                        emailVerified: null,
                    },
                    include: { accounts: true },
                });
                if (!user) {
                    return responseHandler_1.default.success(res, 404, 'account not found ');
                }
                if (user.accounts) {
                    return responseHandler_1.default.success(res, 404, 'account is an oauth');
                }
                const authToken = (0, jsonwebtoken_1.sign)({ email: user.email }, process.env.TOKEN_KEY || 'secretkey', { expiresIn: '1h' });
                yield nodemailer_1.transporter.sendMail({
                    from: 'grocery',
                    to: (_a = user.email) !== null && _a !== void 0 ? _a : '',
                    subject: 'email verification and set password',
                    html: `<div>
                <h1>Thank you ${user.name}, for registrater your account</h1>
                <p>klik link below to verify your account</p>
                <a href='${process.env.FE_URL}/auth/verify?a_t=${authToken}'>Verify Account</a>
                </div>`,
                });
                return responseHandler_1.default.success(res, 200, 'ask verify success');
            }
            catch (error) {
                return responseHandler_1.default.error(res, 500, 'Internal Server Error', error);
            }
        });
    }
    createProfileOauth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.body;
                const isExist = yield prisma_1.default.user.findUnique({
                    where: { id: userId },
                });
                if (!isExist) {
                    return responseHandler_1.default.error(res, 404, 'user not found');
                }
                yield prisma_1.default.profile.upsert({
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
                return responseHandler_1.default.success(res, 200, 'create profile success');
            }
            catch (error) {
                return responseHandler_1.default.error(res, 500, 'Internal Server Error', error);
            }
        });
    }
    getUserSessionDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const isExist = res.locals.user;
                const isExist = yield prisma_1.default.user.findUnique({
                    where: {
                        email: req.body.email,
                    },
                });
                if (!isExist) {
                    return responseHandler_1.default.error(res, 404, 'no account exist');
                }
                return responseHandler_1.default.success(res, 200, 'create profile success', {
                    email: isExist.email,
                    name: isExist.name,
                    image: isExist.image,
                    emailVerified: isExist.emailVerified,
                    role: isExist.role,
                });
            }
            catch (error) {
                return responseHandler_1.default.error(res, 500, 'Internal Server Error', error);
            }
        });
    }
    getUserRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = res.locals.user;
                return responseHandler_1.default.success(res, 200, 'create profile success', {
                    role: user.role,
                });
            }
            catch (error) {
                return responseHandler_1.default.error(res, 500, 'Internal Server Error', error);
            }
        });
    }
}
exports.AuthController = AuthController;
