import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCardDto {
  @ApiProperty({ example: 1, description: 'Identificador del propietario' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usuarioId: number;

  @ApiPropertyOptional({ example: 'Tarjeta personal', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  alias?: string;

  @ApiPropertyOptional({ example: 'Visa', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  brand?: string;

  @ApiProperty({ example: '4242', minLength: 4, maxLength: 4 })
  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'last4 debe contener exactamente 4 dígitos' })
  last4: string;

  @ApiProperty({ example: 12, minimum: 1, maximum: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  exp_month: number;

  @ApiProperty({ example: 2030, minimum: 2024, maximum: 2100 })
  @Type(() => Number)
  @IsInt()
  @Min(2024)
  @Max(2100)
  exp_year: number;

  @ApiPropertyOptional({
    description: 'Token del proveedor; nunca el número completo ni el CVV',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  token?: string;
}
