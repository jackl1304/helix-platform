/**
 * Authentifizierung Tests
 * Testet alle Sicherheitsaspekte der Authentifizierung
 */

import { describe, test, expect, beforeEach, jest } from "vitest";
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../index';
import { TestDatabase, TestUtils, SecurityTestUtils } from './setup';

describe('Authentication Tests', () => {
  beforeEach(async () => {
    await TestDatabase.cleanDatabase();
    await TestDatabase.seedTestData();
  });

  describe('POST /api/tenant/auth/login', () => {
    test('sollte erfolgreich mit gÃ¼ltigen Credentials einloggen', async () => {
      const response = await request(app)
        .post('/api/tenant/auth/login')
        .send({
          email: 'test@test-medical.local',
          password: 'validPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.tenant).toBeDefined();
    });

    test('sollte mit ungÃ¼ltigen Credentials fehlschlagen', async () => {
      const response = await request(app)
        .post('/api/tenant/auth/login')
        .send({
          email: 'test@test-medical.local',
          password: 'wrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('sollte mit nicht existierendem User fehlschlagen', async () => {
      const response = await request(app)
        .post('/api/tenant/auth/login')
        .send({
          email: 'nonexistent@test-medical.local',
          password: 'anyPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('sollte Rate Limiting respektieren', async () => {
      const promises = [];
      
      // Mehrere Login-Versuche schnell hintereinander
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/tenant/auth/login')
            .send({
              email: 'test@test-medical.local',
              password: 'wrongPassword'
            })
        );
      }

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('sollte Input Sanitization durchfÃ¼hren', async () => {
      const maliciousInputs = SecurityTestUtils.generateMaliciousInputs();
      
      for (const maliciousInput of maliciousInputs) {
        const response = await request(app)
          .post('/api/tenant/auth/login')
          .send({
            email: maliciousInput,
            password: maliciousInput
          });

        // Sollte nicht crashen und sollte einen Fehler zurÃ¼ckgeben
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(500);
      }
    });

    test('sollte groÃŸe Inputs ablehnen', async () => {
      const largeInputs = SecurityTestUtils.generateLargeInputs();
      
      for (const largeInput of largeInputs) {
        const response = await request(app)
          .post('/api/tenant/auth/login')
          .send({
            email: largeInput,
            password: largeInput
          });

        // Sollte groÃŸe Inputs ablehnen
        expect(response.status).toBe(400);
      }
    });

    test('sollte Session-Sicherheit gewÃ¤hrleisten', async () => {
      const response = await request(app)
        .post('/api/tenant/auth/login')
        .send({
          email: 'test@test-medical.local',
          password: 'validPassword123!'
        });

      expect(response.status).toBe(200);
      
      // PrÃ¼fe Session-Cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      
      const sessionCookie = cookies?.find(cookie => cookie.includes('helix-session'));
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie).toContain('HttpOnly');
      expect(sessionCookie).toContain('SameSite=Strict');
    });
  });

  describe('POST /api/tenant/auth/logout', () => {
    test('sollte erfolgreich ausloggen', async () => {
      // Erst einloggen
      const loginResponse = await request(app)
        .post('/api/tenant/auth/login')
        .send({
          email: 'test@test-medical.local',
          password: 'validPassword123!'
        });

      expect(loginResponse.status).toBe(200);

      // Dann ausloggen
      const logoutResponse = await request(app)
        .post('/api/tenant/auth/logout')
        .set('Cookie', loginResponse.headers['set-cookie']);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.success).toBe(true);
    });

    test('sollte ohne Session funktionieren', async () => {
      const response = await request(app)
        .post('/api/tenant/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/tenant/auth/change-password', () => {
    test('sollte Passwort erfolgreich Ã¤ndern', async () => {
      // Erst einloggen
      const loginResponse = await request(app)
        .post('/api/tenant/auth/login')
        .send({
          email: 'test@test-medical.local',
          password: 'validPassword123!'
        });

      expect(loginResponse.status).toBe(200);

      // Passwort Ã¤ndern
      const changeResponse = await request(app)
        .post('/api/tenant/auth/change-password')
        .set('Cookie', loginResponse.headers['set-cookie'])
        .send({
          currentPassword: 'validPassword123!',
          newPassword: 'newValidPassword456!'
        });

      expect(changeResponse.status).toBe(200);
      expect(changeResponse.body.success).toBe(true);
    });

    test('sollte schwache PasswÃ¶rter ablehnen', async () => {
      const loginResponse = await request(app)
        .post('/api/tenant/auth/login')
        .send({
          email: 'test@test-medical.local',
          password: 'validPassword123!'
        });

      const weakPasswords = [
        '123', // Zu kurz
        'password', // Keine GroÃŸbuchstaben, Zahlen oder Sonderzeichen
        'PASSWORD', // Keine Kleinbuchstaben
        'Password', // Keine Zahlen oder Sonderzeichen
        'Password123', // Keine Sonderzeichen
      ];

      for (const weakPassword of weakPasswords) {
        const response = await request(app)
          .post('/api/tenant/auth/change-password')
          .set('Cookie', loginResponse.headers['set-cookie'])
          .send({
            currentPassword: 'validPassword123!',
            newPassword: weakPassword
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
        expect(response.body.details).toBeDefined();
      }
    });

    test('sollte falsches aktuelles Passwort ablehnen', async () => {
      const loginResponse = await request(app)
        .post('/api/tenant/auth/login')
        .send({
          email: 'test@test-medical.local',
          password: 'validPassword123!'
        });

      const response = await request(app)
        .post('/api/tenant/auth/change-password')
        .set('Cookie', loginResponse.headers['set-cookie'])
        .send({
          currentPassword: 'wrongPassword',
          newPassword: 'newValidPassword456!'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Aktuelles Passwort');
    });

    test('sollte ohne Authentifizierung fehlschlagen', async () => {
      const response = await request(app)
        .post('/api/tenant/auth/change-password')
        .send({
          currentPassword: 'anyPassword',
          newPassword: 'newPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Nicht authentifiziert');
    });
  });

  describe('Password Hashing', () => {
    test('sollte PasswÃ¶rter sicher hashen', async () => {
      const password = 'testPassword123!';
      const hashedPassword = await bcrypt.hash(password, 12);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
      expect(hashedPassword).toMatch(/^\$2[aby]\$/); // bcrypt format
    });

    test('sollte Passwort-Verifikation korrekt durchfÃ¼hren', async () => {
      const password = 'testPassword123!';
      const hashedPassword = await bcrypt.hash(password, 12);

      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare('wrongPassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });

    test('sollte Salt-Rounds korrekt verwenden', async () => {
      const password = 'testPassword123!';
      const startTime = Date.now();
      
      await bcrypt.hash(password, 12);
      
      const duration = Date.now() - startTime;
      expect(duration).toBeGreaterThan(100); // Sollte mindestens 100ms dauern
    });
  });

  describe('Session Management', () => {
    test('sollte Session-Timeout respektieren', async () => {
      const response = await request(app)
        .post('/api/tenant/auth/login')
        .send({
          email: 'test@test-medical.local',
          password: 'validPassword123!'
        });

      expect(response.status).toBe(200);

      // PrÃ¼fe Session-Cookie-Attribute
      const cookies = response.headers['set-cookie'];
      const sessionCookie = cookies?.find(cookie => cookie.includes('helix-session'));
      
      expect(sessionCookie).toContain('Max-Age=');
      expect(sessionCookie).toContain('HttpOnly');
      expect(sessionCookie).toContain('SameSite=Strict');
    });

    test('sollte Session-Daten korrekt speichern', async () => {
      const response = await request(app)
        .post('/api/tenant/auth/login')
        .send({
          email: 'test@test-medical.local',
          password: 'validPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.email).toBe('test@test-medical.local');
      expect(response.body.user.role).toBe('admin');
      expect(response.body.tenant.id).toBeDefined();
    });
  });

  describe('Security Headers', () => {
    test('sollte Sicherheits-Headers setzen', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('Input Validation', () => {
    test('sollte leere Felder ablehnen', async () => {
      const emptyInputs = [
        { email: '', password: 'password' },
        { email: 'test@test.com', password: '' },
        { email: '', password: '' },
        {},
        null,
        undefined
      ];

      for (const input of emptyInputs) {
        const response = await request(app)
          .post('/api/tenant/auth/login')
          .send(input);

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
      }
    });

    test('sollte ungÃ¼ltige E-Mail-Formate ablehnen', async () => {
      const invalidEmails = [
        'not-an-email',
        'test@',
        '@test.com',
        'test..test@test.com',
        'test@test..com',
        'test@test.com.',
        ' test@test.com',
        'test@test.com '
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/tenant/auth/login')
          .send({
            email,
            password: 'password123!'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
      }
    });
  });
});


