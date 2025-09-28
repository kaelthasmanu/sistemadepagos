export class CreateCardDto {
  usuarioId: number;
  alias?: string;
  brand?: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  token?: string;
}
