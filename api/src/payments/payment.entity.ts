export type Payment = {
  id: number;
  usuario?: any;
  tarjeta?: any;
  monto: number;
  currency: string;
  status: string;
  motivo_rechazo?: string;
  transaction_id?: string;
  creado_en?: Date;
};
