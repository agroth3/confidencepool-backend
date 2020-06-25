import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { User } from '@prisma/client';

require('dotenv').config();

import league from './routes/league';
import user from './routes/user';

const port = process.env.PORT || 8080;
const app = express();

app.use(bodyParser.json());
app.use(cors());

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

app.use('/api/v1/leagues', league);
app.use('/api/v1/user', user);

app.listen(port, () => {
  console.log('listening on port ', port);
});
