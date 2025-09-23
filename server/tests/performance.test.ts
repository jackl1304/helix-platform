/**
 * Performance Tests
 * Testet Performance und Skalierbarkeit der API
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../index';
import { TestDatabase, TestUtils, PerformanceTestUtils } from './setup';

describe('Performance Tests', () => {
  beforeEach(async () => {
    await TestDatabase.cleanDatabase();
    await TestDatabase.seedTestData();
  });

  describe('API Response Times', () => {
    test('sollte Health-Check unter 100ms antworten', async () => {
      const { duration } = await PerformanceTestUtils.measureExecutionTime(
        () => request(app).get('/api/health')
      );

      expect(duration).toBeLessThan(100);
    });

    test('sollte Dashboard-Stats unter 500ms antworten', async () => {
      const { duration } = await PerformanceTestUtils.measureExecutionTime(
        () => request(app).get('/api/dashboard/stats')
      );

      expect(duration).toBeLessThan(500);
    });

    test('sollte Regulatory-Updates unter 1s antworten', async () => {
      const { duration } = await PerformanceTestUtils.measureExecutionTime(
        () => request(app).get('/api/regulatory-updates')
      );

      expect(duration).toBeLessThan(1000);
    });

    test('sollte Legal-Cases unter 1s antworten', async () => {
      const { duration } = await PerformanceTestUtils.measureExecutionTime(
        () => request(app).get('/api/legal-cases')
      );

      expect(duration).toBeLessThan(1000);
    });

    test('sollte Data-Sources unter 500ms antworten', async () => {
      const { duration } = await PerformanceTestUtils.measureExecutionTime(
        () => request(app).get('/api/data-sources')
      );

      expect(duration).toBeLessThan(500);
    });
  });

  describe('Load Testing', () => {
    test('sollte 100 gleichzeitige Health-Check-Requests handhaben', async () => {
      const loadTestResult = await PerformanceTestUtils.loadTest(
        () => request(app).get('/api/health'),
        10, // 10 gleichzeitige User
        100 // 100 Requests insgesamt
      );

      expect(loadTestResult.successfulRequests).toBe(100);
      expect(loadTestResult.failedRequests).toBe(0);
      expect(loadTestResult.averageResponseTime).toBeLessThan(200);
      expect(loadTestResult.maxResponseTime).toBeLessThan(1000);
    });

    test('sollte 50 gleichzeitige Dashboard-Requests handhaben', async () => {
      const loadTestResult = await PerformanceTestUtils.loadTest(
        () => request(app).get('/api/dashboard/stats'),
        5, // 5 gleichzeitige User
        50 // 50 Requests insgesamt
      );

      expect(loadTestResult.successfulRequests).toBe(50);
      expect(loadTestResult.failedRequests).toBe(0);
      expect(loadTestResult.averageResponseTime).toBeLessThan(500);
      expect(loadTestResult.maxResponseTime).toBeLessThan(2000);
    });

    test('sollte 25 gleichzeitige Regulatory-Updates-Requests handhaben', async () => {
      const loadTestResult = await PerformanceTestUtils.loadTest(
        () => request(app).get('/api/regulatory-updates'),
        5, // 5 gleichzeitige User
        25 // 25 Requests insgesamt
      );

      expect(loadTestResult.successfulRequests).toBe(25);
      expect(loadTestResult.failedRequests).toBe(0);
      expect(loadTestResult.averageResponseTime).toBeLessThan(1000);
      expect(loadTestResult.maxResponseTime).toBeLessThan(3000);
    });
  });

  describe('Memory Usage', () => {
    test('sollte Speicherverbrauch unter Kontrolle halten', async () => {
      const initialMemory = process.memoryUsage();
      
      // Führe viele Requests aus
      for (let i = 0; i < 100; i++) {
        await request(app).get('/api/health');
        await request(app).get('/api/dashboard/stats');
      }

      // Warte auf Garbage Collection
      if (global.gc) {
        global.gc();
      }
      await TestUtils.waitFor(100);

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      // Speicherverbrauch sollte nicht um mehr als 50MB steigen
      expect(memoryIncreaseMB).toBeLessThan(50);
    });

    test('sollte keine Memory Leaks bei wiederholten Requests haben', async () => {
      const memoryMeasurements: number[] = [];

      for (let round = 0; round < 10; round++) {
        // Führe 50 Requests aus
        for (let i = 0; i < 50; i++) {
          await request(app).get('/api/health');
          await request(app).get('/api/dashboard/stats');
        }

        // Warte auf Garbage Collection
        if (global.gc) {
          global.gc();
        }
        await TestUtils.waitFor(100);

        const memoryUsage = process.memoryUsage().heapUsed;
        memoryMeasurements.push(memoryUsage);
      }

      // Prüfe, ob Speicherverbrauch stabil bleibt
      const firstMeasurement = memoryMeasurements[0];
      const lastMeasurement = memoryMeasurements[memoryMeasurements.length - 1];
      const memoryIncrease = (lastMeasurement - firstMeasurement) / 1024 / 1024; // MB

      // Speicherverbrauch sollte nicht um mehr als 20MB steigen
      expect(memoryIncrease).toBeLessThan(20);
    });
  });

  describe('Database Performance', () => {
    test('sollte Datenbankabfragen optimiert sein', async () => {
      const { duration } = await PerformanceTestUtils.measureExecutionTime(
        async () => {
          // Simuliere komplexe Datenbankabfrage
          const response = await request(app).get('/api/regulatory-updates');
          expect(response.status).toBe(200);
        }
      );

      expect(duration).toBeLessThan(1000);
    });

    test('sollte große Datenmengen effizient verarbeiten', async () => {
      // Erstelle viele Test-Datensätze
      const testUpdates = [];
      for (let i = 0; i < 100; i++) {
        testUpdates.push(TestUtils.generateTestRegulatoryUpdate({
          title: `Test Update ${i}`,
          priority: i % 3 + 1
        }));
      }

      const { duration } = await PerformanceTestUtils.measureExecutionTime(
        async () => {
          // Simuliere Abfrage mit vielen Ergebnissen
          const response = await request(app).get('/api/regulatory-updates');
          expect(response.status).toBe(200);
        }
      );

      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Concurrent Operations', () => {
    test('sollte gleichzeitige Login-Requests handhaben', async () => {
      const concurrentLogins = 10;
      const promises = [];

      for (let i = 0; i < concurrentLogins; i++) {
        promises.push(
          request(app)
            .post('/api/tenant/auth/login')
            .send({
              email: 'test@test-medical.local',
              password: 'validPassword123!'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Alle Requests sollten erfolgreich sein
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    test('sollte gleichzeitige API-Aufrufe ohne Race Conditions handhaben', async () => {
      const concurrentRequests = 20;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app).get('/api/dashboard/stats')
        );
      }

      const responses = await Promise.all(promises);
      
      // Alle Requests sollten erfolgreich sein
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
      });

      // Alle Responses sollten konsistent sein
      const firstResponse = responses[0].body;
      responses.forEach(response => {
        expect(response.body).toEqual(firstResponse);
      });
    });
  });

  describe('Error Handling Performance', () => {
    test('sollte Fehler schnell behandeln', async () => {
      const { duration } = await PerformanceTestUtils.measureExecutionTime(
        () => request(app).get('/api/nonexistent-endpoint')
      );

      // 404-Fehler sollten schnell behandelt werden
      expect(duration).toBeLessThan(100);
    });

    test('sollte viele Fehler-Requests effizient handhaben', async () => {
      const loadTestResult = await PerformanceTestUtils.loadTest(
        () => request(app).get('/api/nonexistent-endpoint'),
        5, // 5 gleichzeitige User
        50 // 50 Requests insgesamt
      );

      // Alle sollten 404-Fehler zurückgeben, aber schnell
      expect(loadTestResult.successfulRequests).toBe(0);
      expect(loadTestResult.failedRequests).toBe(50);
      expect(loadTestResult.averageResponseTime).toBeLessThan(100);
    });
  });

  describe('Rate Limiting Performance', () => {
    test('sollte Rate Limiting schnell durchführen', async () => {
      const promises = [];
      
      // Erstelle viele schnelle Requests um Rate Limiting zu triggern
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(app)
            .post('/api/tenant/auth/login')
            .send({
              email: 'test@test-medical.local',
              password: 'wrongPassword'
            })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const duration = Date.now() - startTime;

      // Rate Limiting sollte schnell funktionieren
      expect(duration).toBeLessThan(5000);
      
      // Einige Requests sollten rate-limited sein
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Caching Performance', () => {
    test('sollte Cache-Hits schnell bedienen', async () => {
      // Erste Anfrage (Cache Miss)
      const firstRequest = await PerformanceTestUtils.measureExecutionTime(
        () => request(app).get('/api/dashboard/stats')
      );

      // Zweite Anfrage (Cache Hit)
      const secondRequest = await PerformanceTestUtils.measureExecutionTime(
        () => request(app).get('/api/dashboard/stats')
      );

      // Cache Hit sollte schneller sein
      expect(secondRequest.duration).toBeLessThan(firstRequest.duration);
    });
  });

  describe('Large Payload Performance', () => {
    test('sollte große JSON-Responses effizient verarbeiten', async () => {
      const { duration } = await PerformanceTestUtils.measureExecutionTime(
        () => request(app).get('/api/regulatory-updates')
      );

      expect(duration).toBeLessThan(1000);
    });

    test('sollte große Request-Bodies effizient verarbeiten', async () => {
      const largePayload = {
        title: 'A'.repeat(10000),
        content: 'B'.repeat(50000),
        metadata: Array(1000).fill({ key: 'value', data: 'test' })
      };

      const { duration } = await PerformanceTestUtils.measureExecutionTime(
        () => request(app)
          .post('/api/feedback')
          .send(largePayload)
      );

      // Sollte große Payloads in angemessener Zeit verarbeiten
      expect(duration).toBeLessThan(2000);
    });
  });
});
