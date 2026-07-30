import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class User {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 'María García' }) nombre: string;
  @ApiProperty({ example: 'maria.garcia@example.com' }) email: string;
  @ApiPropertyOptional({ example: '+573001234567', nullable: true }) telefono:
    | string
    | null;
  @ApiPropertyOptional({ example: 'Calle 10 #20-30, Bogotá', nullable: true })
  direccion: string | null;
  @ApiProperty({ example: '2026-07-30T14:30:00.000Z' }) creado_en: Date;
}
