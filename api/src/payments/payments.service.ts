import { Injectable, BadRequestException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreatePaymentDto) {
  if (!dto.userId) {
    throw new BadRequestException('userId is required');
  }

  if (!dto.cardId && !this.hasCompleteCardData(dto)) {
    throw new BadRequestException(
      'Either cardId or complete card data (card_number, cardholder_name, expiry_month, expiry_year, cvv) is required',
    );
  }

  const pythonUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:8001/process-payment';
  
  console.log('Attempting to connect to:', pythonUrl);

  const amount = dto.amount;

  const payload = this.buildPaymentPayload(dto);

  type PaymentServiceResponse = {
    status: 'approved' | 'rejected' | string;
    transaction_id?: string | null;
    message?: string | null;
  };

  try {
    const resp: AxiosResponse<PaymentServiceResponse> = await axios.post(
      pythonUrl,
      payload,
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      },
    );

    const data = resp.data;
    let tarjetaId = dto.cardId;
    
    if (!tarjetaId && this.hasCompleteCardData(dto)) {
      const last4 = (dto.card_number ?? '').slice(-4);
      
      const nuevaTarjeta = await this.prisma.tarjetas.create({
        data: {
          usuario_id: dto.userId,
          alias: `Tarjeta ${last4}`,
          brand: this.detectCardBrand(dto.card_number ?? ''),
          last4: last4,
          exp_month: dto.expiry_month ?? 1,
          exp_year: dto.expiry_year ?? 2030,
        },
      });
      tarjetaId = nuevaTarjeta.id;
    }

    if (typeof tarjetaId !== 'number') {
      throw new BadRequestException('tarjeta_id is required and must be a number');
    }
    if (typeof amount !== 'number') {
      throw new BadRequestException('amount is required and must be a number');
    }

    const paymentData = {
      usuario_id: dto.userId,
      tarjeta_id: tarjetaId,
      monto: amount,
      currency: dto.currency || 'USD',
      status: data.status,
      transaction_id: data.transaction_id ?? null,
      motivo_rechazo: data.status === 'rejected' ? data.message : null,
    };

    const payment = await this.prisma.pagos.create({
      data: paymentData,
    });

    return payment;

  } catch (err: any) {
    console.error('Payment service error details:', {
      url: pythonUrl,
      error: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });

    if (err.code === 'ECONNREFUSED') {
      throw new BadRequestException('Payment service is not available');
    }
    
    if (err.response?.status === 404) {
      throw new BadRequestException('Payment service endpoint not found');
    }

    const msg = err?.response?.data || err.message || 'Unknown error';
    throw new BadRequestException(`Payment processing failed: ${JSON.stringify(msg)}`);
  }
}

  private hasCompleteCardData(dto: CreatePaymentDto): boolean {
    return !!(
      dto.card_number &&
      dto.cardholder_name &&
      dto.expiry_month &&
      dto.expiry_year &&
      dto.cvv
    );
  }

  private buildPaymentPayload(dto: CreatePaymentDto): any {
    if (dto.cardId) {
      return {
        amount: dto.amount,
        currency: dto.currency || 'USD',
        card_number: 'xxxx',
        cardholder_name: 'N/A',
        expiry_month: 1,
        expiry_year: 2030,
        cvv: '000',
      };
    }
    return {
      amount: dto.amount,
      currency: dto.currency || 'USD',
      card_number: dto.card_number,
      cardholder_name: dto.cardholder_name,
      expiry_month: dto.expiry_month,
      expiry_year: dto.expiry_year,
      cvv: dto.cvv,
    };
  }

  private detectCardBrand(cardNumber: string): string {
    if (cardNumber.startsWith('4')) return 'Visa';
    if (cardNumber.startsWith('5')) return 'Mastercard';
    if (cardNumber.startsWith('34') || cardNumber.startsWith('37')) return 'American Express';
    if (cardNumber.startsWith('6')) return 'Discover';
    return 'Unknown';
  }

  findByUser(userId: number) {
    return this.prisma.pagos.findMany({
      where: { usuario_id: userId },
      orderBy: { creado_en: 'desc' },
    });
  }
}