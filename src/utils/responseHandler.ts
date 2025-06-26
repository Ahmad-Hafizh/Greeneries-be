import { Response } from 'express';

class ResponseHandler {
  success(res: Response, status: number = 200, message: string, result?: any) {
    return res.status(status).send({
      status,
      isSuccess: true,
      message,
      result,
    });
  }
  error(res: Response, status: number = 500, message: string, error?: any) {
    return res.status(status).send({
      status,
      isSuccess: false,
      message,
      error,
    });
  }
}

export default new ResponseHandler();
