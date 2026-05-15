export const OSM_TILE_URL = import.meta.env.VITE_OSM_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const DURBAN_CENTER = [-29.8587, 31.0218];

export function clinicToMapPosition(clinic) {
  const baseLat = -29.8587;
  const baseLng = 31.0218;
  const latOffset = ((50 - Number(clinic.lat || 50)) / 100) * 0.42;
  const lngOffset = ((Number(clinic.lng || 50) - 50) / 100) * 0.42;
  return [baseLat + latOffset, baseLng + lngOffset];
}
