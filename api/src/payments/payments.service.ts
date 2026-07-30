import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

type PaymentServiceRequest = {
  amount: number | undefined;
  currency: string;
  card_number: string | undefined;
  cardholder_name: string | undefined;
  expiry_month: number | undefined;
  expiry_year: number | undefined;
  cvv: string | undefined;
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    const user = await this.prisma.usuarios.findUnique({
      where: { id: dto.userId },
    });
    if (!user)
      throw new NotFoundException(`Usuario ${dto.userId} no encontrado`);

    if (dto.cardId) {
      const card = await this.prisma.tarjetas.findFirst({
        where: { id: dto.cardId, usuario_id: dto.userId },
      });
      if (!card)
        throw new BadRequestException(
          'La tarjeta no existe o no pertenece al usuario',
        );
    }

    const pythonUrl =
      process.env.PAYMENT_SERVICE_URL ||
      'http://localhost:8001/process-payment';

    const amount = dto.amount ?? dto.monto;

    const payload = this.buildPaymentPayload(dto);

    type PaymentServiceResponse = {
      status: string;
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
        throw new BadRequestException(
          'tarjeta_id is required and must be a number',
        );
      }
      if (typeof amount !== 'number') {
        throw new BadRequestException(
          'amount is required and must be a number',
        );
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
    } catch (error: unknown) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      )
        throw error;

      if (axios.isAxiosError(error)) {
        const axiosError: AxiosError = error;
        this.logger.error(
          `Error del procesador de pagos (${pythonUrl}): ${axiosError.message}`,
        );
        throw new BadGatewayException(
          'No fue posible procesar el pago en este momento',
        );
      }
      throw error;
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

  private buildPaymentPayload(dto: CreatePaymentDto): PaymentServiceRequest {
    if (dto.cardId) {
      return {
        amount: dto.amount ?? dto.monto,
        currency: dto.currency || 'USD',
        card_number: 'xxxx',
        cardholder_name: 'N/A',
        expiry_month: 1,
        expiry_year: 2030,
        cvv: '000',
      };
    }
    return {
      amount: dto.amount ?? dto.monto,
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
    if (cardNumber.startsWith('34') || cardNumber.startsWith('37'))
      return 'American Express';
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
