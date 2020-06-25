import { hash, compare } from 'bcrypt';
import { PrismaClient, User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default class AuthService {
  constructor() {}

  public async LogIn(email: string, password: string): Promise<any> {
    const user = await prisma.user.findOne({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    } else {
      const isPasswordValid = await compare(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Incorrect password');
      }
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  public async SignUp(
    email: string,
    password: string,
    name: string,
  ): Promise<any> {
    const existingUser = await prisma.user.findOne({ where: { email } });

    if (existingUser) {
      throw new Error(`User with email "${email}" already exists`);
    }

    if (!process.env.CLIENT_SECRET) {
      throw new Error('No password salt provided.');
    }

    const hashedPwd = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        password: hashedPwd,
        email,
        name,
        role: 'user',
      },
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  public async getCurrentUser(token: string | undefined) {
    return new Promise((resolve, reject) => {
      try {
        if (!token) {
          throw new Error('Token not provided');
        }

        if (!process.env.CLIENT_SECRET) {
          throw new Error('No password salt provided.');
        }

        const decodedToken = jwt.verify(token, process.env.CLIENT_SECRET);

        const user = decodedToken as User;

        return resolve(user);
      } catch (e) {
        return reject(e);
      }
    });
  }

  private generateToken(user: User) {
    if (!process.env.CLIENT_SECRET) {
      throw new Error('No client secret provided in ENV.');
    }

    const data = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(data, process.env.CLIENT_SECRET, {
      expiresIn: 43200, // expires in 12 hours
    });
  }
}
