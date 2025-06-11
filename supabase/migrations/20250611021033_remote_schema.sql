/**
 * BETBALANCE DATABASE SCHEMA
 * Fecha: 11 de junio de 2025
 * 
 * Este archivo configura la base de datos completa para la aplicación BetBalance,
 * incluyendo tablas, índices, restricciones, políticas de seguridad y funciones.
 */

-- Limpieza inicial
DROP FUNCTION IF EXISTS calculate_balance();
DROP FUNCTION IF EXISTS get_unique_months();
DROP TABLE IF EXISTS bets;
DROP TABLE IF EXISTS transactions;

-- Crear tipos enumerados para garantizar consistencia
CREATE TYPE bet_status AS ENUM ('Pending', 'Won', 'Lost', 'Void', 'CashedOut');
CREATE TYPE bet_category AS ENUM ('Fútbol', 'Tenis', 'Baloncesto', 'eSports', 'Deportes de Motor', 'Otro');
CREATE TYPE transaction_type AS ENUM ('Depósito', 'Retiro', 'Compra de Picks');

-- Tabla de apuestas
CREATE TABLE bets (
    -- Campos de identificación
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Información básica de la apuesta
    title TEXT NOT NULL,
    category bet_category NOT NULL,
    stake DECIMAL(10,2) NOT NULL CHECK (stake > 0),
    odds DECIMAL(10,2) NOT NULL CHECK (odds > 1),
    potential_winnings DECIMAL(10,2) NOT NULL,
    
    -- Estado y resolución
    status bet_status NOT NULL DEFAULT 'Pending',
    resolved_at TIMESTAMP WITH TIME ZONE,
    actual_winnings DECIMAL(10,2),
    
    -- Restricciones adicionales
    CONSTRAINT valid_resolution CHECK (
        (status = 'Pending' AND resolved_at IS NULL AND actual_winnings IS NULL) OR
        (status != 'Pending' AND resolved_at IS NOT NULL)
    ),
    CONSTRAINT valid_winnings CHECK (
        (status = 'Won' AND actual_winnings IS NOT NULL) OR
        (status = 'Lost' AND (actual_winnings IS NULL OR actual_winnings = 0)) OR
        (status = 'Void' AND actual_winnings = stake) OR
        (status = 'CashedOut' AND actual_winnings IS NOT NULL) OR
        (status = 'Pending')
    )
);

-- Tabla de transacciones
CREATE TABLE transactions (
    -- Campos de identificación
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Información de la transacción
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    type transaction_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    
    -- Restricción temporal
    CONSTRAINT valid_transaction_date CHECK (date <= timezone('utc'::text, now()))
);

-- Índices para optimizar consultas frecuentes
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_bets_created_at ON bets(created_at);
CREATE INDEX idx_bets_resolved_at ON bets(resolved_at) WHERE resolved_at IS NOT NULL;
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Trigger para actualizar updated_at en bets
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bets_updated_at
    BEFORE UPDATE ON bets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (ajustar según necesidades de seguridad)
CREATE POLICY "Acceso público a bets"
ON bets FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Acceso público a transactions"
ON transactions FOR ALL
USING (true)
WITH CHECK (true);

-- Función para calcular balance total
CREATE OR REPLACE FUNCTION calculate_balance(
    start_date TIMESTAMP WITH TIME ZONE DEFAULT '-infinity',
    end_date TIMESTAMP WITH TIME ZONE DEFAULT 'infinity'
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_deposits DECIMAL(10,2);
    total_withdrawals DECIMAL(10,2);
    total_bet_results DECIMAL(10,2);
BEGIN
    -- Calcular depósitos en el rango de fechas
    SELECT COALESCE(SUM(amount), 0)
    INTO total_deposits
    FROM transactions
    WHERE type = 'Depósito'
    AND date >= start_date AND date <= end_date;

    -- Calcular retiros y compras de picks en el rango de fechas
    SELECT COALESCE(SUM(amount), 0)
    INTO total_withdrawals
    FROM transactions
    WHERE type IN ('Retiro', 'Compra de Picks')
    AND date >= start_date AND date <= end_date;

    -- Calcular resultados de apuestas resueltas en el rango de fechas
    SELECT COALESCE(SUM(
        CASE
            WHEN status = 'Won' THEN actual_winnings - stake
            WHEN status = 'Lost' THEN -stake
            WHEN status = 'CashedOut' THEN actual_winnings - stake
            WHEN status = 'Void' THEN 0
            ELSE 0
        END
    ), 0)
    INTO total_bet_results
    FROM bets
    WHERE status != 'Pending'
    AND resolved_at >= start_date AND resolved_at <= end_date;

    RETURN total_deposits - total_withdrawals + total_bet_results;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener meses únicos con actividad
CREATE OR REPLACE FUNCTION get_unique_months()
RETURNS TABLE(month TEXT) AS $$
BEGIN
    RETURN QUERY
    WITH all_dates AS (
        -- Fechas de apuestas
        SELECT created_at as date FROM bets
        UNION
        SELECT resolved_at FROM bets WHERE resolved_at IS NOT NULL
        UNION
        -- Fechas de transacciones
        SELECT date FROM transactions
    )
    SELECT DISTINCT
        to_char(date, 'YYYY-MM') as month
    FROM all_dates
    WHERE date IS NOT NULL
    ORDER BY month DESC;
END;
$$ LANGUAGE plpgsql;