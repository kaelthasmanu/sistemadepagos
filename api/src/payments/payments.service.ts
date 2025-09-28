import { Injectable, HttpException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreatePaymentDto) {
    const pythonUrl = 
      process.env.PAYMENT_SERVICE_URL ||
      'http://localhost:8001/process-payment';

    const payload = {
      amount: dto.monto,
      currency: dto.currency || 'USD',
      card_number: 'xxxx',
      cardholder_name: 'N/A',
      expiry_month: 1,
      expiry_year: 2030,
      cvv: '000',
    };

    type PaymentServiceResponse = {
      status: 'approved' | 'rejected' | string;
      transaction_id?: string | null;
      message?: string | null;
    };

    try {
      const resp: AxiosResponse<PaymentServiceResponse> = await axios.post(
        pythonUrl,
        payload,
        { headers: { 'Content-Type': 'application/json' } },
      );
      const data = resp.data;

      const payment = await this.prisma.pagos.create({
        data: {
          usuario_id: dto.usuarioId,
          tarjeta_id: dto.tarjetaId,
          monto: dto.monto,
          currency: dto.currency || 'USD',
          status: data.status,
          transaction_id: data.transaction_id,
          motivo_rechazo: data.status === 'rejected' ? data.message : null,
        },
      });

      return payment;
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Error calling payment service';
      throw new HttpException(errMsg, 502);
    }
  }

  findByUser(usuarioId: number) {
    return this.prisma.pagos.findMany({
      where: { usuario_id: usuarioId },
      orderBy: { creado_en: 'desc' },
    });
  }
}
