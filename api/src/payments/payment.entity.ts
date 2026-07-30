import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Payment {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 1 }) usuario_id: number;
  @ApiProperty({ example: 1 }) tarjeta_id: number;
  @ApiProperty({ example: 125.5 }) monto: number;
  @ApiProperty({ example: 'USD' }) currency: string;
  @ApiProperty({ example: 'approved', enum: ['approved', 'rejected'] })
  status: string;
  @ApiPropertyOptional({ nullable: true }) motivo_rechazo: string | null;
  @ApiPropertyOptional({ example: 'txn_123456', nullable: true })
  transaction_id: string | null;
  @ApiProperty({ example: '2026-07-30T14:30:00.000Z' }) creado_en: Date;
}
