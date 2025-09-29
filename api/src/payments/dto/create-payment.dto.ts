import { Type } from 'class-transformer';
import { 
  IsIn, 
  IsNumber, 
  IsOptional, 
  IsPositive, 
  IsString, 
  Min, 
  MinLength, 
  MaxLength, 
  Matches,
  Max,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments
} from 'class-validator';

@ValidatorConstraint({ name: 'hasAmount', async: false })
export class HasAmountConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as CreatePaymentDto;
    return !!(object.amount || object.monto);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Either "amount" or "monto" must be provided';
  }
}

@ValidatorConstraint({ name: 'hasCardInfo', async: false })
export class HasCardInfoConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as CreatePaymentDto;
    
    if (object.cardId) {
      return true;
    }
    
    return !!(object.card_number && 
              object.cardholder_name && 
              object.expiry_month && 
              object.expiry_year && 
              object.cvv);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Either provide cardId or all card details (card_number, cardholder_name, expiry_month, expiry_year, cvv)';
  }
}

export class CreatePaymentDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  userId: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  cardId?: number;

  @IsNumber()
  @IsPositive()
  @Min(0.01)
  @Type(() => Number)
  @IsOptional()
  amount?: number;

  @IsNumber()
  @IsPositive()
  @Min(0.01)
  @Type(() => Number)
  @IsOptional()
  monto?: number;

  @IsString()
  @IsIn(['USD', 'EUR', 'MXN', 'COP'])
  @IsOptional()
  currency?: string = 'USD';

  // Campos de la tarjeta (solo necesarios si no se usa cardId)
  @IsString()
  @IsOptional()
  @Matches(/^\d{13,19}$/, { 
    message: 'Card number must be between 13 and 19 digits' 
  })
  card_number?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  cardholder_name?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(12)
  expiry_month?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(2024)
  @Max(2030)
  expiry_year?: number;

  @IsString()
  @IsOptional()
  @Matches(/^\d{3,4}$/, { 
    message: 'CVV must be 3 or 4 digits' 
  })
  cvv?: string;

  @Validate(HasAmountConstraint)
  hasAmount: boolean;

  @Validate(HasCardInfoConstraint)
  hasCardInfo: boolean;

}