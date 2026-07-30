-- Preserve exact monetary values.
ALTER TABLE "public"."pagos"
    ALTER COLUMN "monto" TYPE DECIMAL(12, 2) USING "monto"::DECIMAL(12, 2);

-- Database invariants also protect writes made outside the API.
ALTER TABLE "public"."usuarios"
    ADD CONSTRAINT "usuarios_nombre_no_vacio" CHECK (btrim("nombre") <> ''),
    ADD CONSTRAINT "usuarios_email_no_vacio" CHECK (btrim("email") <> '');

ALTER TABLE "public"."tarjetas"
    ADD CONSTRAINT "tarjetas_id_usuario_unique" UNIQUE ("id", "usuario_id"),
    ADD CONSTRAINT "tarjetas_last4_formato" CHECK ("last4" ~ '^[0-9]{4}$'),
    ADD CONSTRAINT "tarjetas_exp_month_rango" CHECK ("exp_month" BETWEEN 1 AND 12),
    ADD CONSTRAINT "tarjetas_exp_year_rango" CHECK ("exp_year" BETWEEN 2024 AND 2100);

ALTER TABLE "public"."pagos"
    DROP CONSTRAINT "pagos_tarjeta_id_fkey",
    ADD CONSTRAINT "pagos_tarjeta_usuario_fkey"
        FOREIGN KEY ("tarjeta_id", "usuario_id")
        REFERENCES "public"."tarjetas"("id", "usuario_id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "pagos_monto_positivo" CHECK ("monto" > 0),
    ADD CONSTRAINT "pagos_currency_permitida" CHECK ("currency" IN ('USD', 'EUR', 'MXN', 'COP')),
    ADD CONSTRAINT "pagos_status_permitido" CHECK ("status" IN ('approved', 'rejected')),
    ADD CONSTRAINT "pagos_rechazo_coherente" CHECK (
        ("status" = 'approved' AND "motivo_rechazo" IS NULL)
        OR
        ("status" = 'rejected' AND "motivo_rechazo" IS NOT NULL AND btrim("motivo_rechazo") <> '')
    );

CREATE INDEX "idx_tarjetas_usuario" ON "public"."tarjetas"("usuario_id");
CREATE UNIQUE INDEX "idx_tarjetas_token_unique"
    ON "public"."tarjetas"("token") WHERE "token" IS NOT NULL;
CREATE INDEX "idx_pagos_usuario_fecha"
    ON "public"."pagos"("usuario_id", "creado_en" DESC);
CREATE INDEX "idx_pagos_tarjeta" ON "public"."pagos"("tarjeta_id");
