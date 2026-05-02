import { HttpException, HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ClientGrpc } from '@nestjs/microservices';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

interface StockRequest {
  productId: number;
  quantity: number;
}

interface StockResponse {
  available: boolean;
  message: string;
}

interface StockGrpcService {
  checkAndReserve(data: StockRequest): Observable<StockResponse>;
}

@Injectable()
export class OrdersService implements OnModuleInit {
  private stockService: StockGrpcService;

  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
    @Inject('STOCK_SERVICE')
    private readonly stockClient: ClientGrpc,
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  onModuleInit() {
    this.stockService = this.stockClient.getService<StockGrpcService>('StockService');
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  async create(dto: CreateOrderDto) {
    // 1. Call gRPC stock-service
    const stockResponse = await firstValueFrom<StockResponse>(
      this.stockService.checkAndReserve({
        productId: dto.productId,
        quantity: dto.quantity,
      }),
    );

    // 2. If stock unavailable, throw error
    if (!stockResponse.available) {
      throw new HttpException(stockResponse.message, HttpStatus.CONFLICT);
    }

    // 3. Save the order
    const order = this.repo.create({ ...dto, status: 'confirmed' });
    const saved = await this.repo.save(order);

    // 4. Publish Kafka event
    this.kafkaClient.emit('order.created', {
      id: saved.id,
      productId: saved.productId,
      quantity: saved.quantity,
      customerEmail: saved.customerEmail,
      status: saved.status,
    });

    console.log(`Order #${saved.id} created and event published to Kafka`);
    return saved;
  }
}