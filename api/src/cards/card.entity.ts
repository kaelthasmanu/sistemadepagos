import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Card {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 1 }) usuario_id: number;
  @ApiPropertyOptional({ example: 'Tarjeta personal', nullable: true }) alias:
    | string
    | null;
  @ApiPropertyOptional({ example: 'Visa', nullable: true }) brand:
    | string
    | null;
  @ApiProperty({ example: '4242' }) last4: string;
  @ApiProperty({ example: 12 }) exp_month: number;
  @ApiProperty({ example: 2030 }) exp_year: number;
  @ApiPropertyOptional({ nullable: true }) token: string | null;
  @ApiProperty({ example: '2026-07-30T14:30:00.000Z' }) creado_en: Date;
}
