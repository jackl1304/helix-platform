/**
 * Test Setup für Helix Platform
 * Konfiguriert Test-Umgebung und Utilities
 */

import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { neon } from '@neondatabase/serverless';
import { db } from '../db';
import { Logger } from '../services/logger.service';

// Test-Datenbank-URL (separate Test-DB)
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
if (!TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL muss gesetzt sein');
}

const testDb = neon(TEST_DATABASE_URL);
const logger = new Logger('TestSetup');

/**
 * Test-Datenbank-Utilities
 */
export class TestDatabase {
  static async cleanDatabase() {
    const tables = [
      'ai_summaries',
      'website_analytics',
      'feedback',
      'sync_results',
      'regulatory_updates',
      'legal_cases',
      'chat_messages',
      'chat_conversations',
      'tenant_invitations',
      'tenant_dashboards',
      'tenant_data_access',
      'tenant_users',
      'users',
      'tenants',
      'data_sources',
      'newsletters',
      'subscribers',
      'approvals',
      'knowledge_articles',
      'fda_drug_labels',
      'fda_adverse_events',
      'fda_device_recalls',
      'pubmed_articles',
      'clinical_trials',
      'iso_standards'
    ];

    for (const table of tables) {
      try {
        await testDb`DELETE FROM ${testDb.raw(table)}`;
        logger.info(`Cleaned table: ${table}`);
      } catch (error) {
        logger.warn(`Failed to clean table ${table}:`, (error as Error).message);
      }
    }
  }

  static async seedTestData() {
    // Test-Tenant erstellen
    const testTenant = await testDb`
      INSERT INTO tenants (id, name, subdomain, subscription_tier, is_active)
      VALUES ('test-tenant-001', 'Test Medical Corp', 'test-medical', 'professional', true)
      RETURNING *
    `;

    // Test-User erstellen
    const testUser = await testDb`
      INSERT INTO users (id, tenant_id, email, name, role, password_hash, is_active)
      VALUES ('test-user-001', 'test-tenant-001', 'test@test-medical.local', 'Test Admin', 'admin', 'hashed-password', true)
      RETURNING *
    `;

    // Test-Data-Source erstellen
    const testDataSource = await testDb`
      INSERT INTO data_sources (id, name, description, url, type, category, country, is_active)
      VALUES ('test-source-001', 'Test FDA API', 'Test FDA data source', 'https://api.fda.gov/test', 'official_api', 'regulatory', 'US', true)
      RETURNING *
    `;

    return {
      tenant: testTenant[0],
      user: testUser[0],
      dataSource: testDataSource[0]
    };
  }
}

/**
 * Test-Utilities
 */
export class TestUtils {
  static generateTestRegulatoryUpdate(overrides: Partial<any> = {}) {
    return {
      id: `test-update-${Date.now()}`,
      tenant_id: 'test-tenant-001',
      source_id: 'test-source-001',
      title: 'Test Regulatory Update',
      description: 'Test description',
      content: 'Test content',
      type: 'regulation',
      category: 'medical_device',
      published_date: new Date(),
      priority: 1,
      is_processed: false,
      ...overrides
    };
  }

  static generateTestLegalCase(overrides: Partial<any> = {}) {
    return {
      id: `test-case-${Date.now()}`,
      tenant_id: 'test-tenant-001',
      case_number: 'TEST-001',
      title: 'Test Legal Case',
      court: 'Test Court',
      jurisdiction: 'Test Jurisdiction',
      decision_date: new Date(),
      summary: 'Test case summary',
      impact_level: 'medium',
      ...overrides
    };
  }

  static generateTestUser(overrides: Partial<any> = {}) {
    return {
      id: `test-user-${Date.now()}`,
      tenant_id: 'test-tenant-001',
      email: `test${Date.now()}@test-medical.local`,
      name: 'Test User',
      role: 'tenant_user',
      password_hash: 'hashed-password',
      is_active: true,
      ...overrides
    };
  }

  static async waitFor(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static mockRequest(overrides: Partial<any> = {}) {
    return {
      body: {},
      params: {},
      query: {},
      headers: {},
      session: {},
      user: null,
      ...overrides
    };
  }

  static mockResponse() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.removeHeader = jest.fn().mockReturnValue(res);
    return res;
  }

  static mockNext() {
    return jest.fn();
  }
}

/**
 * Performance-Test-Utilities
 */
export class PerformanceTestUtils {
  static async measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    const result = await fn();
    const duration = Date.now() - startTime;
    return { result, duration };
  }

  static async loadTest(
    fn: () => Promise<any>,
    concurrentUsers: number = 10,
    iterations: number = 100
  ): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    maxResponseTime: number;
    minResponseTime: number;
  }> {
    const results: number[] = [];
    const errors: Error[] = [];
    
    const promises: Promise<void>[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const promise = fn()
        .then(async () => {
          const { duration } = await this.measureExecutionTime(fn);
          results.push(duration);
        })
        .catch((error) => {
          errors.push(error);
        });
      
      promises.push(promise);
      
      // Limit concurrent requests
      if (promises.length >= concurrentUsers) {
        await Promise.all(promises);
        promises.length = 0;
      }
    }
    
    // Wait for remaining promises
    await Promise.all(promises);
    
    const successfulRequests = results.length;
    const failedRequests = errors.length;
    const totalRequests = successfulRequests + failedRequests;
    
    const averageResponseTime = results.reduce((sum, time) => sum + time, 0) / results.length;
    const maxResponseTime = Math.max(...results);
    const minResponseTime = Math.min(...results);
    
    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      maxResponseTime,
      minResponseTime
    };
  }
}

/**
 * Security-Test-Utilities
 */
export class SecurityTestUtils {
  static generateMaliciousInputs() {
    return [
      // SQL Injection
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      
      // XSS
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert('XSS')>",
      "javascript:alert('XSS')",
      
      // Path Traversal
      "../../../etc/passwd",
      "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
      
      // Command Injection
      "; rm -rf /",
      "| cat /etc/passwd",
      "&& del C:\\Windows\\System32",
      
      // LDAP Injection
      "*)(uid=*))(|(uid=*",
      "*))(|(objectClass=*",
      
      // NoSQL Injection
      '{"$ne": null}',
      '{"$regex": ".*"}',
      '{"$where": "this.password == \'admin\'"}'
    ];
  }

  static generateLargeInputs() {
    return [
      'A'.repeat(10000), // 10KB string
      'A'.repeat(100000), // 100KB string
      'A'.repeat(1000000), // 1MB string
      Array(10000).fill('test'), // Large array
      { largeObject: 'A'.repeat(50000) } // Large object
    ];
  }
}

/**
 * Mock-Utilities
 */
export class MockUtils {
  static mockLogger() {
    return {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };
  }

  static mockDatabaseConnection() {
    return {
      query: jest.fn(),
      transaction: jest.fn(),
      close: jest.fn()
    };
  }

  static mockExternalAPI() {
    return {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };
  }
}

// Global Test Setup
beforeAll(async () => {
  logger.info('Setting up test environment...');
  await TestDatabase.cleanDatabase();
  await TestDatabase.seedTestData();
  logger.info('Test environment setup complete');
});

afterAll(async () => {
  logger.info('Cleaning up test environment...');
  await TestDatabase.cleanDatabase();
  logger.info('Test environment cleanup complete');
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(async () => {
  // Clean up test data after each test
  await TestDatabase.cleanDatabase();
});

export { testDb, TestDatabase, TestUtils, PerformanceTestUtils, SecurityTestUtils, MockUtils };
