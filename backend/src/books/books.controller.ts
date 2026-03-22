import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, BadRequestException, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post('create-book')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'cover_image', maxCount: 1 },
    { name: 'pdf_file', maxCount: 1 },
  ]))
  create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFiles() files: { cover_image?: Express.Multer.File[], pdf_file?: Express.Multer.File[] }
  ) {
    if (!files?.cover_image || !files?.pdf_file) {
      throw new BadRequestException('cover_image and pdf_file are required files');
    }
    return this.booksService.create(createBookDto, files.cover_image[0], files.pdf_file[0]);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('get-all-books')
  findAll() {
    return this.booksService.findAll();
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('get-book/:id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('update-book/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(+id, updateBookDto);
  }

  @Delete('delete-book/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
