export type Card = {
  id: number;
  usuario?: any;
  alias?: string;
  brand?: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  token?: string;
  creado_en?: Date;
};
