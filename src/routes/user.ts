import express from 'express';
import { login, signUp, me } from '../controllers/user';
import isAuth from '../middlewares/isAuth';

const router = express.Router();

router.route('/signup').post(signUp);
router.route('/login').post(login);
router.route('/me').get(isAuth, me);

export default router;
