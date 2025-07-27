-- Add stock_updated boolean column to orders table
ALTER TABLE public.orders ADD COLUMN stock_updated BOOLEAN NOT NULL DEFAULT FALSE; 