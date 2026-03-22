import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { UserLibraryService } from './user-library.service';

@Controller('user-library')
export class UserLibraryController {
  constructor(private readonly userLibraryService: UserLibraryService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('add-book/:id')
  create(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.userLibraryService.create(+id,+userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('get-all-books')
  findAll(@Req() req: any) {
    const userId = req.user.id;
    return this.userLibraryService.findAll(+userId);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('remove-book/:id')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.userLibraryService.remove(+id,+userId);
  }
}
