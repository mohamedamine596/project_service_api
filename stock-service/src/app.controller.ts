import { Controller, Post } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

interface StockRequest {
  productId: number;
  quantity: number;
}

interface StockResponse {
  available: boolean;
  message: string;
}

// In-memory stock: productId -> available quantity
const stockMap = new Map<number, number>([
  [1, 100],
  [2, 200],
]);

@Controller()
export class AppController {
  @GrpcMethod('StockService', 'CheckAndReserve')
  checkAndReserve(data: StockRequest): StockResponse {
    const productId = Number(data.productId);
    const quantity = Number(data.quantity);
    const current = stockMap.get(productId) ?? 0;

    if (quantity <= 0) {
      return { available: false, message: 'Quantity must be positive' };
    }

    if (current < quantity) {
      return {
        available: false,
        message: `Insufficient stock for product #${productId}. Available: ${current}, Requested: ${quantity}`,
      };
    }

    // Reserve the stock
    stockMap.set(productId, current - quantity);
    console.log(`Reserved ${quantity} units of product #${productId}. Remaining: ${current - quantity}`);

    return {
      available: true,
      message: `Successfully reserved ${quantity} units of product #${productId}`,
    };
  }

  @Post('/reset')
  resetStock(): { message: string } {
    stockMap.clear();
    stockMap.set(1, 100);
    stockMap.set(2, 200);
    return { message: 'Stock reset to initial values' };
  }
}