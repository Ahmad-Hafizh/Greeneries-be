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
exports.verifyToken = void 0;
const responseHandler_1 = __importDefault(require("../utils/responseHandler"));
const jsonwebtoken_1 = require("jsonwebtoken");
const prisma_1 = __importDefault(require("../prisma"));
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        console.log(token);
        if (!token) {
            return responseHandler_1.default.error(res, 404, 'token not found');
        }
        console.log(token);
        const converted = (0, jsonwebtoken_1.verify)(token, process.env.TOKEN_KEY || 'secretkey');
        const userExist = yield prisma_1.default.user.findUnique({
            where: {
                email: converted.email,
            },
        });
        if (!userExist) {
            return responseHandler_1.default.error(res, 404, 'Account not found');
        }
        console.log(userExist);
        res.locals.user = userExist;
        next();
    }
    catch (error) {
        return responseHandler_1.default.error(res, 500, 'cookies token is failed', error);
    }
});
exports.verifyToken = verifyToken;
