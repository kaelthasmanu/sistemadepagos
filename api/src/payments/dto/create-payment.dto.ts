export class CreatePaymentDto {
  usuarioId: number;
  tarjetaId: number;
  monto: number;
  currency?: string;
}
