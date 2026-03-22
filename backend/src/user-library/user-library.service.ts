import { Injectable, InternalServerErrorException } from '@nestjs/common';;
import { prisma } from 'lib/prisma';

@Injectable()
export class UserLibraryService {
  async create(id: number,userId:number) {
    try {
      const book = await prisma.book.findUnique({
        where: { id },
      });
      if (!book) {
        throw new Error('Book not found');
      }

      // Check if already in library
      const existing = await prisma.userLibrary.findFirst({
        where: { book_id: id, user_id: userId },
      });
      if (existing) {
        return existing; // Already saved, return existing entry
      }

      const userLibrary = await prisma.userLibrary.create({
        data: {
          book_id: id,
          user_id: userId,
        },
      });
      return userLibrary;
    } catch (error) {
      console.error((error as Error)?.message);
      throw new InternalServerErrorException(
        'Error in adding book to user library ==> ' + (error as Error)?.message,
      );
    }
  }

  async findAll(userId:number) {
   try {
    const userLibrary = await prisma.userLibrary.findMany({
      where: {
        user_id: userId,
      },
      include: {
        book: true
      },
    });
    return userLibrary;
   } catch (error) {
    console.error((error as Error)?.message);
    throw new InternalServerErrorException(
      'Error in getting all user libraries ==> ' + (error as Error)?.message,
    );
   }
  }

  async remove(id: number,userId:number) {
    try {
      const userLibrary = await prisma.userLibrary.delete({
        where: {
          id,
          user_id:userId
        },
      });
      return userLibrary;
    } catch (error) {
      console.error((error as Error)?.message);
      throw new InternalServerErrorException(
        'Error in removing book from user library ==> ' + (error as Error)?.message,
      );
    }
  }
}
