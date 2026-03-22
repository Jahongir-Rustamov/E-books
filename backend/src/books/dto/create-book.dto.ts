import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsArray,
  ArrayNotEmpty,
  ArrayMaxSize,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price!: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  age_limit?: number;

  @IsString()
  @IsNotEmpty()
  author_name!: string;

  // multipart/form-data da array string[]  bo'lib keladi → number[] ga aylantirish
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number);
    if (typeof value === 'string') return [Number(value)];
    return value;
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(5)
  @IsInt({ each: true })
  categoryIds!: number[];
}