-- Set monthly price of all paid plans (Starter, Pro, etc.) to 1 Rupee (100 paise)
UPDATE plans SET price_monthly = 100 WHERE price_monthly > 0;
