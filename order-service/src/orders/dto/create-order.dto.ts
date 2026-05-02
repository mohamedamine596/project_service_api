import { IsNumber, IsPositive, IsEmail } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  productId: number;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsEmail()
  customerEmail: string;
}