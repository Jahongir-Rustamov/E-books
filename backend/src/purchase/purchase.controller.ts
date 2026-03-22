import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto, ConfirmPurchaseDto } from './dto/create-purchase.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post('create-intent')
  createPaymentIntent(@Req() req, @Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchaseService.createPaymentIntent(req.user.id, createPurchaseDto);
  }

  @Post('confirm')
  confirmPayment(@Req() req, @Body() confirmPurchaseDto: ConfirmPurchaseDto) {
    return this.purchaseService.confirmPayment(req.user.id, confirmPurchaseDto);
  }

  @Get('my-books')
  getMyPurchasedBooks(@Req() req) {
    return this.purchaseService.getMyPurchasedBooks(req.user.id);
  }
}
