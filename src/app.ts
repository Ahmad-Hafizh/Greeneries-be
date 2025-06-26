import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AuthRouter } from './routers/auth.router';
dotenv.config();

const PORT = 5050;

class App {
  readonly app: Application;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
  }

  private configure() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private routes() {
    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).send('connected');
    });

    const authRoutes = new AuthRouter();
    this.app.use('/auth', authRoutes.getRoutes());
  }

  public startServer() {
    this.app.listen(PORT, () => console.log(`Server is running on port http://localhost:${PORT}/`));
  }
}

export default new App();
