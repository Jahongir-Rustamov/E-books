import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePurchaseDto {
  @IsInt()
  @IsNotEmpty()
  book_id!: number;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;
}

export class ConfirmPurchaseDto {
  @IsString()
  @IsNotEmpty()
  paymentIntentId!: string;
}
