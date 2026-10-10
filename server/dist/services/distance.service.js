"use strict";
/**
 * Distance Calculation Service for Rokto Britto
 * Implements the Great Circle / Haversine formula to calculate accurate distances
 * over Earth's spherical surface for the 20km proximity radius alert.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistanceKm = calculateDistanceKm;
exports.isWithinProximity = isWithinProximity;
exports.filterWithinRadius = filterWithinRadius;
const EARTH_RADIUS_KM = 6371; // Earth's mean radius in kilometers
/**
 * Calculates Haversine distance between two coordinates in kilometers.
 * @param origin - Starting coordinates (lat, lon)
 * @param destination - Target coordinates (lat, lon)
 * @returns distance in kilometers rounded to 3 decimal places
 */
function calculateDistanceKm(origin, destination) {
    if (origin.latitude === destination.latitude &&
        origin.longitude === destination.longitude) {
        return 0;
    }
    const dLat = toRadians(destination.latitude - origin.latitude);
    const dLon = toRadians(destination.longitude - origin.longitude);
    const lat1 = toRadians(origin.latitude);
    const lat2 = toRadians(destination.latitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const rawDistance = EARTH_RADIUS_KM * c;
    // Round to 3 decimal places to avoid floating point imprecision
    return Math.round(rawDistance * 1000) / 1000;
}
function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
}
/**
 * Determines whether a destination is within the strict proximity threshold.
 * Per Rokto Britto specification:
 * - 19.9 km => Alert sends (true)
 * - 20.0 km => Alert sends (true)
 * - 20.1 km => Alert blocked (false)
 */
function isWithinProximity(origin, destination, thresholdKm = 20.0) {
    const distance = calculateDistanceKm(origin, destination);
    return distance <= thresholdKm;
}
/**
 * Filter an array of items with coordinates to those within the threshold
 */
function filterWithinRadius(origin, items, thresholdKm = 20.0) {
    return items
        .map((item) => {
        const distanceKm = calculateDistanceKm(origin, {
            latitude: item.latitude,
            longitude: item.longitude,
        });
        return { ...item, distanceKm };
    })
        .filter((item) => item.distanceKm <= thresholdKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);
}
