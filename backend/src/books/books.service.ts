import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ImageKitService } from '../imagekit/imagekit.service';
import { prisma } from 'lib/prisma';

@Injectable()
export class BooksService {
  constructor(private readonly imageKitService: ImageKitService) {}

  async create(createBookDto: CreateBookDto, coverImage: Express.Multer.File, pdfFile: Express.Multer.File) {
    try {
      const { categoryIds } = createBookDto;

      // Check all provided categories exist
      const foundCategories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
      });

      if (foundCategories.length !== categoryIds.length) {
        throw new BadRequestException('One or more categories not found');
      }

      // Upload files to ImageKit
      const coverUpload = await this.imageKitService.uploadFile(
        coverImage.buffer,
        coverImage.originalname,
        '/books/covers'
      );

      const pdfUpload = await this.imageKitService.uploadFile(
        pdfFile.buffer,
        pdfFile.originalname,
        '/books/pdfs'
      );

      // Create Book
      const newBook = await prisma.book.create({
        data: {
          title: createBookDto.title,
          description: createBookDto.description,
          price: createBookDto.price,
          age_limit: createBookDto.age_limit,
          author_name: createBookDto.author_name,
          cover_image: coverUpload.url,
          file_url: pdfUpload.url,
        }
      });

      // Create BookCategory records for each selected category
      await prisma.bookCategory.createMany({
        data: categoryIds.map(category_id => ({
          book_id: newBook.id,
          category_id,
        })),
      });

      // Return Book with BookCategory relation included
      const savedBook = await prisma.book.findUnique({
        where: { id: newBook.id },
        include: {
          bookCategories: {
            include: {
              category: true
            }
          }
        }
      });

      return savedBook;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating book: ' + (error as Error)?.message);
    }
  }

  async findAll() {
    return prisma.book.findMany({
      include: {
        bookCategories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        bookCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!book) {
      throw new BadRequestException('Book not found');
    }

    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    try {
      const book = await prisma.book.findUnique({ where: { id } });
      if (!book) {
        throw new BadRequestException('Book not found');
      }

      // Omit categoryId if passed, as requested to restrict updating.
      const dataToUpdate: any = { ...updateBookDto };
      delete dataToUpdate.categoryId;

      return await prisma.book.update({
        where: { id },
        data: dataToUpdate,
        include: {
          bookCategories: {
            include: {
              category: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error updating book: ' + (error as Error)?.message);
    }
  }

  async remove(id: number) {
    try {
      const book = await prisma.book.findUnique({ where: { id } });
      if (!book) {
        throw new BadRequestException('Book not found');
      }

      // Delete BookCategory relations for this book
      await prisma.bookCategory.deleteMany({
        where: { book_id: id }
      });

      // Delete the book itself
      const deletedBook = await prisma.book.delete({
        where: { id }
      });

      return {
        message: 'Book and its related files deleted successfully',
        book: deletedBook
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error deleting book: ' + (error as Error)?.message);
    }
  }
}
