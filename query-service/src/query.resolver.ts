import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { Product } from './models/product.model';
import { Order } from './models/order.model';
import { QueryService } from './query.service';

@Resolver()
export class QueryResolver {
  constructor(private readonly queryService: QueryService) {}

  @Query(() => [Product])
  async products(): Promise<Product[]> {
    return this.queryService.getProducts();
  }

  @Query(() => [Order])
  async orders(): Promise<Order[]> {
    return this.queryService.getOrders();
  }

  @Query(() => Order, { nullable: true })
  async orderById(
    @Args('id', { type: () => ID }) id: number,
  ): Promise<Order> {
    return this.queryService.getOrderById(id);
  }
}