-- PostgreSQL SQL script
-- Drop existing objects if they exist (useful for re-running during development)
DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS tarjetas;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(50),
    direccion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE tarjetas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    alias VARCHAR(100),
    brand VARCHAR(50),
    last4 CHAR(4) NOT NULL,
    exp_month SMALLINT NOT NULL CHECK (exp_month >= 1 AND exp_month <= 12),
    exp_year SMALLINT NOT NULL,
    token VARCHAR(255),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tarjeta_id INTEGER NOT NULL REFERENCES tarjetas(id) ON DELETE RESTRICT,
    monto FLOAT NOT NULL CHECK (monto >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL,
    motivo_rechazo TEXT,
    transaction_id VARCHAR(150) UNIQUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);


CREATE INDEX idx_pagos_usuario ON pagos(usuario_id);
CREATE INDEX idx_tarjetas_usuario ON tarjetas(usuario_id);


INSERT INTO usuarios (nombre, email, telefono, direccion)
VALUES
('Juan Perez', 'juan.perez@example.com', '+34123456789', 'Calle Falsa 123'),
('María García', 'maria.garcia@example.com', '+34987654321', 'Avenida Siempre Viva 742');

INSERT INTO tarjetas (usuario_id, alias, brand, last4, exp_month, exp_year, token)
VALUES
(1, 'Visa personal', 'VISA', '4242', 12, 2026, 'tok_visa_1'),
(1, 'Mastercard empresa', 'MASTERCARD', '5555', 11, 2025, 'tok_mc_1'),
(2, 'Visa prueba', 'VISA', '4000', 1, 2027, 'tok_visa_2');


INSERT INTO pagos (usuario_id, tarjeta_id, monto, currency, status, motivo_rechazo, transaction_id)
VALUES
(1, 1, 50.00, 'USD', 'approved', NULL, 'TXN_100001'),
(1, 2, 125.00, 'EUR', 'rejected', 'Fondos insuficientes', 'TXN_100002'),
(2, 3, 10.00, 'USD', 'approved', NULL, 'TXN_100003');
