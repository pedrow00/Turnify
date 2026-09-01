ALTER TABLE pacientes
ADD COLUMN IF NOT EXISTS tipo_contacto VARCHAR(30) DEFAULT 'personal';
