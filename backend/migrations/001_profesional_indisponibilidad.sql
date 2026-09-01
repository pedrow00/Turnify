ALTER TABLE profesionales
  ADD COLUMN IF NOT EXISTS indisponibilidad_desde DATE,
  ADD COLUMN IF NOT EXISTS indisponibilidad_hasta DATE,
  ADD COLUMN IF NOT EXISTS indisponibilidad_motivo TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_profesional_indisponibilidad_rango'
  ) THEN
    ALTER TABLE profesionales
      ADD CONSTRAINT chk_profesional_indisponibilidad_rango
      CHECK (
        (indisponibilidad_desde IS NULL AND indisponibilidad_hasta IS NULL)
        OR (indisponibilidad_desde IS NOT NULL AND indisponibilidad_hasta IS NOT NULL AND indisponibilidad_desde <= indisponibilidad_hasta)
      );
  END IF;
END $$;
