-- Restore original plan prices (in paise: 29900 = ₹299, 79900 = ₹799)
UPDATE plans SET price_monthly = 29900, price_yearly = 299000 WHERE slug = 'starter';
UPDATE plans SET price_monthly = 79900, price_yearly = 799000 WHERE slug = 'pro';
