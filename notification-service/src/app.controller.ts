import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices'; // ← EventPattern not MessagePattern

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @EventPattern('order.created')
  handleOrderCreated(@Payload() message: any) {
    // Kafka wraps data inside message.value
    const data = message?.value ?? message;
    const timestamp = new Date().toISOString();

    this.logger.log(`[${timestamp}] ✅ Confirmation envoyée à ${data.customerEmail} pour la commande #${data.id}`);
    this.logger.log(`   → Produit: ${data.productId} | Quantité: ${data.quantity} | Statut: ${data.status}`);
  }
}