import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { ImageKitModule } from '../imagekit/imagekit.module';

@Module({
  imports: [ImageKitModule],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
