import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Product } from './models/product.model';
import { Order } from './models/order.model';

@Injectable()
export class QueryService {
  constructor(private readonly http: HttpService) {}

  async getProducts(): Promise<Product[]> {
    const { data } = await firstValueFrom(
      this.http.get('http://localhost:3001/products'),
    );
    return data;
  }

  async getOrders(): Promise<Order[]> {
    const { data } = await firstValueFrom(
      this.http.get('http://localhost:3002/orders'),
    );
    return data;
  }

  async getOrderById(id: number): Promise<Order> {
    const { data } = await firstValueFrom(
      this.http.get(`http://localhost:3002/orders/${id}`),
    );
    return data;
  }
}