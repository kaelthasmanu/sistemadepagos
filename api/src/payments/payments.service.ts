import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
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

    try {
      const resp$ = this.httpService.post(
        pythonUrl,
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const resp = await lastValueFrom(resp$) as { data: any };
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
    } catch (err) {
      throw new HttpException('Error calling payment service', 502);
    }
  }

  async findByUser(usuarioId: number) {
    return this.prisma.pagos.findMany({ where: { usuario_id: usuarioId }, orderBy: { creado_en: 'desc' } });
  }
}
