/**
 * UNIT TEST: Distance & Proximity Calculation (Haversine Formula)
 * 
 * LEARNING NOTE:
 * Unit tests test isolated, pure functions without touching the database or network.
 * They run extremely fast (milliseconds) and verify mathematical edge cases.
 * 
 * Requirements tested from Rokto Britto Specification (Page 6 - Boundary Value Testing):
 * - At 19.9 km: Alert sends perfectly (within 20km).
 * - At 20.0 km: Alert sends perfectly (boundary edge).
 * - At 20.1 km: Alert blocked (just outside 20km threshold).
 */

import {
  calculateDistanceKm,
  isWithinProximity,
  filterWithinRadius,
  Coordinates,
} from '../../src/modules/request/request.service';

describe('Unit Tests: Distance & Proximity Service', () => {
  // Center: Dhaka Zero Point (approx 23.7289, 90.4109)
  const centerPoint: Coordinates = { latitude: 23.7289, longitude: 90.4109 };

  describe('calculateDistanceKm()', () => {
    it('should return 0 km when origin and destination are identical', () => {
      const distance = calculateDistanceKm(centerPoint, centerPoint);
      expect(distance).toBe(0);
    });

    it('should accurately calculate distance between Dhaka and Gazipur (~28 km)', () => {
      const gazipurPoint: Coordinates = { latitude: 23.9999, longitude: 90.4203 };
      const distance = calculateDistanceKm(centerPoint, gazipurPoint);
      // Dhaka to Gazipur is roughly 30 km
      expect(distance).toBeGreaterThan(25);
      expect(distance).toBeLessThan(35);
    });
  });

  describe('isWithinProximity() - Rokto Britto 20km Boundary Value Tests', () => {
    it('Boundary Case 1: At 19.9 km, proximity alert MUST be allowed (true)', () => {
      const point19_9km: Coordinates = {
        latitude: centerPoint.latitude + (19.9 / 111.195),
        longitude: centerPoint.longitude,
      };

      const distance = calculateDistanceKm(centerPoint, point19_9km);
      expect(distance).toBeCloseTo(19.9, 1);
      expect(isWithinProximity(centerPoint, point19_9km, 20.0)).toBe(true);
    });

    it('Boundary Case 2: At 20.0 km, proximity alert MUST be allowed (true)', () => {
      const point20_0km: Coordinates = {
        latitude: centerPoint.latitude + (20.0 / 111.195),
        longitude: centerPoint.longitude,
      };

      const distance = calculateDistanceKm(centerPoint, point20_0km);
      expect(distance).toBeCloseTo(20.0, 1);
      expect(isWithinProximity(centerPoint, point20_0km, 20.0)).toBe(true);
    });

    it('Boundary Case 3: At 20.1 km, proximity alert MUST be blocked (false)', () => {
      const point20_1km: Coordinates = {
        latitude: centerPoint.latitude + (20.1 / 111.195),
        longitude: centerPoint.longitude,
      };

      const distance = calculateDistanceKm(centerPoint, point20_1km);
      expect(distance).toBeGreaterThan(20.0);
      expect(isWithinProximity(centerPoint, point20_1km, 20.0)).toBe(false);
    });
  });

  describe('filterWithinRadius()', () => {
    it('should filter out donors further than 20km and sort by closest distance', () => {
      const donors = [
        { id: '1', name: 'Far Donor (30km)', latitude: 24.0, longitude: 90.4109 },
        { id: '2', name: 'Very Close Donor (2km)', latitude: 23.74, longitude: 90.4109 },
        { id: '3', name: 'Medium Donor (10km)', latitude: 23.82, longitude: 90.4109 },
      ];

      const results = filterWithinRadius(centerPoint, donors, 20.0);

      expect(results.length).toBe(2);
      expect(results[0].id).toBe('2');
      expect(results[1].id).toBe('3');
      expect(results.some((d) => d.id === '1')).toBe(false);
    });
  });
});
