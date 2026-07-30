import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './payment.entity';

@ApiTags('Pagos')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Procesar un pago' })
  @ApiBody({
    type: CreatePaymentDto,
    examples: {
      storedCard: {
        summary: 'Pago con una tarjeta registrada',
        value: { userId: 1, cardId: 1, amount: 125.5, currency: 'USD' },
      },
      newCard: {
        summary: 'Pago con una tarjeta nueva',
        value: {
          userId: 1,
          amount: 125.5,
          currency: 'USD',
          card_number: '4242424242424242',
          cardholder_name: 'María García',
          expiry_month: 12,
          expiry_year: 2030,
          cvv: '123',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: Payment })
  @ApiBadRequestResponse({ description: 'Datos del pago inválidos' })
  @ApiBadGatewayResponse({
    description: 'El procesador de pagos no está disponible',
  })
  create(@Body() dto: CreatePaymentDto) {
    return this.service.create(dto);
  }

  @Get('user/:usuarioId')
  @ApiOperation({ summary: 'Listar pagos de un usuario' })
  @ApiOkResponse({ type: Payment, isArray: true })
  findByUser(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.service.findByUser(usuarioId);
  }
}
