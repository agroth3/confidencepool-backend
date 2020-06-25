import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import shortId from 'shortid';

const prisma = new PrismaClient();

export const createLeague = async (req: Request, res: Response) => {
  try {
    const { title, password } = req.body;

    const existingLeague = await prisma.league.findMany({
      where: { title },
    });

    if (existingLeague.length) {
      throw new Error(`League already exists with title: ${title}`);
    }

    if (!process.env.CLIENT_SECRET) {
      throw new Error('No password salt provided.');
    }

    const hashedPwd = await hash(password, 10);

    const league = await prisma.league.create({
      data: {
        shortId: shortId.generate(),
        title,
        password: hashedPwd,
        createdBy: {
          connect: { id: req.user.id },
        },
        users: {
          connect: {
            id: req.user.id,
          },
        },
      },
      select: {
        shortId: true,
        title: true,
      },
    });

    return res.status(200).json(league);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const joinLeague = async (req: Request, res: Response) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      throw new Error('Please provide id and password');
    }

    const league = await prisma.league.findOne({
      where: {
        shortId: id,
      },
    });

    if (!league) {
      throw new Error('League not found');
    } else {
      const isPasswordValid = await compare(password, league.password);

      if (!isPasswordValid) {
        throw new Error('Incorrect password');
      }
    }

    await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        leagues: {
          connect: {
            id: league.id,
          },
        },
      },
    });

    return res.status(200).json();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const getLeagues = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;

    const user = await prisma.user.findOne({
      where: { id },
      include: {
        leagues: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return res.status(200).json(user.leagues);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const getLeague = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    const league = await prisma.league.findOne({
      where: { id },
    });

    if (!league) {
      throw new Error('League not found');
    }

    return res.status(200).json(league);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
