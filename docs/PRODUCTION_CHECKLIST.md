# Production Checklist

## Security
- Use HTTPS.
- Replace JWT secret.
- Store secrets in a vault.
- Add audit logs for patient data.
- Add 2FA for admin and driver accounts.
- Add password reset and email verification.
- Add backups and monitoring.

## Healthcare compliance
- Get POPIA/HIPAA/GDPR review depending on deployment country.
- Encrypt sensitive medical data.
- Add consent and privacy policy.
- Define data retention/deletion policy.

## Delivery logistics
- Replace simulated GPS with driver phone GPS.
- Add Google Maps/Mapbox/HERE route + ETA.
- Add OTP proof of delivery.
- Add delivery failure reasons.
- Add geofencing for driver arrival.
