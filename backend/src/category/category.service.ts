import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import {prisma} from 'lib/prisma'

@Injectable()
export class CategoryService {
  async create(createCategoryDto: CreateCategoryDto) {
   try {
    const findCategory = await prisma.category.findFirst({
      where: { name: createCategoryDto.name.toLowerCase() },
    });
    if (findCategory) {
      throw new BadRequestException({ message: 'Category already exist' });
    }
     return await prisma.category.create({
      data:{
        name: createCategoryDto.name.toLowerCase(),
      },
    });
   } catch (error) {
    throw new InternalServerErrorException(
            'Error in creating category ==> ' + (error as Error)?.message,
          );
   }
  }

  async findAll() {
    try {
      return await prisma.category.findMany();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error in Get all categories ==> ' + (error as Error)?.message,
      );
    }
  }
}
