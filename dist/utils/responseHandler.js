"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResponseHandler {
    success(res, status = 200, message, result) {
        return res.status(status).send({
            status,
            isSuccess: true,
            message,
            result,
        });
    }
    error(res, status = 500, message, error) {
        return res.status(status).send({
            status,
            isSuccess: false,
            message,
            error,
        });
    }
}
exports.default = new ResponseHandler();
