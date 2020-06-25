import { Request, Response } from 'express';
import AuthService from '../services/auth';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body.user;
    const auth = new AuthService();
    const { user, token } = await auth.LogIn(email, password);

    return res.json({ user, token }).status(200).end();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const signUp = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body.user;
    const auth = new AuthService();
    const { user, token } = await auth.SignUp(email, password, name);

    return res.json({ user, token }).status(200).end();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const auth = new AuthService();
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await auth.getCurrentUser(token);

    return res.status(200).json(user);
  } catch (e) {
    return res.status(500).json(e);
  }
};
