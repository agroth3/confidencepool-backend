import express from 'express';

import isAuth from '../middlewares/isAuth';
import {
  getLeagues,
  getLeague,
  createLeague,
  joinLeague,
} from '../controllers/league';

const router = express.Router();

router.route('/').get(isAuth, getLeagues);
router.route('/').post(isAuth, createLeague);
router.route('/join').post(isAuth, joinLeague);
router.route('/:id').get(isAuth, getLeague);

export default router;
