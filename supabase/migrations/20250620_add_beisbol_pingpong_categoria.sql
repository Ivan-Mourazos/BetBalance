-- MIGRACIÓN: Añadir Béisbol y Ping Pong a bet_category
ALTER TYPE bet_category ADD VALUE IF NOT EXISTS 'Béisbol';
ALTER TYPE bet_category ADD VALUE IF NOT EXISTS 'Ping Pong';
-- NOTA: Las categorías personalizadas solo se guardarán como texto, pero no estarán en el ENUM global.
