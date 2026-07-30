import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  Matches,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'hasAmount', async: false })
export class HasAmountConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const dto = args.object as CreatePaymentDto;
    return dto.amount !== undefined || dto.monto !== undefined;
  }

  defaultMessage(): string {
    return 'Debe proporcionar "amount" o "monto"';
  }
}

@ValidatorConstraint({ name: 'hasCardInfo', async: false })
export class HasCardInfoConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const dto = args.object as CreatePaymentDto;
    if (dto.cardId !== undefined) return true;
    return Boolean(
      dto.card_number &&
        dto.cardholder_name &&
        dto.expiry_month &&
        dto.expiry_year &&
        dto.cvv,
    );
  }

  defaultMessage(): string {
    return 'Debe proporcionar cardId o todos los datos de la tarjeta';
  }
}

export class CreatePaymentDto {
  @ApiProperty({ example: 1, description: 'Identificador del usuario' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Use cardId o suministre todos los datos de tarjeta',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  cardId?: number;

  @ApiPropertyOptional({
    example: 125.5,
    minimum: 0.01,
    description: 'Importe del pago (preferido)',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    example: 125.5,
    minimum: 0.01,
    deprecated: true,
    description: 'Alias heredado de amount',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  monto?: number;

  @ApiPropertyOptional({
    example: 'USD',
    enum: ['USD', 'EUR', 'MXN', 'COP'],
    default: 'USD',
  })
  @IsString()
  @IsIn(['USD', 'EUR', 'MXN', 'COP'])
  @IsOptional()
  currency = 'USD';

  @ApiPropertyOptional({
    example: '4242424242424242',
    description: 'Requerido si no se proporciona cardId',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{13,19}$/, {
    message: 'card_number debe contener entre 13 y 19 dígitos',
  })
  card_number?: string;

  @ApiPropertyOptional({ example: 'María García' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  cardholder_name?: string;

  @ApiPropertyOptional({ example: 12, minimum: 1, maximum: 12 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(12)
  expiry_month?: number;

  @ApiPropertyOptional({ example: 2030, minimum: 2024, maximum: 2100 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(2024)
  @Max(2100)
  expiry_year?: number;

  @ApiPropertyOptional({ example: '123', writeOnly: true })
  @IsString()
  @IsOptional()
  @Matches(/^\d{3,4}$/, { message: 'cvv debe contener 3 o 4 dígitos' })
  cvv?: string;

  @Validate(HasAmountConstraint)
  private readonly hasAmount!: boolean;

  @Validate(HasCardInfoConstraint)
  private readonly hasCardInfo!: boolean;
}
