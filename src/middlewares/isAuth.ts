import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

const getUserContext = (req: any, res: any, next: any) => {
  try {
    if (!process.env.CLIENT_SECRET) {
      throw new Error('No salt provided');
    }

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.CLIENT_SECRET);

    const user = decodedToken as User;
    const userId = user.id;

    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    } else {
      req.user = user;
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!'),
    });
  }
};

export default getUserContext;
