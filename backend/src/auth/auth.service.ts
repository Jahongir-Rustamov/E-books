import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { prisma } from 'lib/prisma';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateToken(userId: any) {
    return this.jwtService.sign({ id: userId });
  }

  async signup(createAuthDto: CreateAuthDto) {
    const { first_name, last_name, email, password } = createAuthDto;
    try {
      const findUser = await prisma.user.findUnique({
        where: { email },
      });
      if (findUser) {
        throw new BadRequestException({ message: 'User already exist' });
      }

      const hashedPassword = await argon.hash(password);
      const newUser = await prisma.user.create({
        data: {
          first_name,
          last_name,
          email,
          password: hashedPassword,
          role: email === 'admin7575@gmail.com' ? 'ADMIN' : 'USER',
        },
        include: {
          _count: {
            select: {
              purchases: {
                where: { payment_status: 'succeeded' }
              }
            }
          }
        }
      });

      const token = this.generateToken(newUser.id);
      return { user: newUser, token };
    } catch (error) {
      console.error((error as Error)?.message);
      throw new InternalServerErrorException(
        'Error in creating user ==> ' + (error as Error)?.message,
      );
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        _count: {
          select: {
            purchases: {
              where: { payment_status: 'succeeded' }
            }
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon.verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id);
    return { user, token };
  }

  async checkAuth(userId: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            purchases: {
              where: { payment_status: 'succeeded' }
            }
          }
        }
      }
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
