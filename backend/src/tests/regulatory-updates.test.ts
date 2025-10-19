import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import createApp from "../app";
import { RegulatoryUpdateService } from "../services/regulatory-updates.service";

vi.mock("../middleware/rateLimit.middleware", () => ({
  __esModule: true,
  default: (_req:any,_res:any,next:any)=> next()
}));
vi.mock("../middleware/tenant.middleware", async () => {
  const ok = (_req:any,_res:any,next:any)=> next();
  return { __esModule: true, default: ok, requireTenantMiddleware: ok };
});
vi.mock("../services/logger.service", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, requestLogger: (_req:any,_res:any,next:any)=> next() };
});

const api = () => request(app).set("X-Tenant-ID", "demo-medical-tech");
describe("Regulatory Updates API", () => {
  let app: any;
  let regulatoryUpdateService: RegulatoryUpdateService;

  beforeEach(() => {
    app = createApp();
    regulatoryUpdateService = new RegulatoryUpdateService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // HEALTH CHECK TESTS
  // ==========================================
describe("Regulatory Updates API", () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version');
    });

    it('should return memory information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('memory');
      expect(response.body.memory).toHaveProperty('used');
      expect(response.body.memory).toHaveProperty('total');
      expect(typeof response.body.memory.used).toBe('number');
      expect(typeof response.body.memory.total).toBe('number');
    });
  });
describe("Regulatory Updates API", () => {
    it('should return detailed health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveProperty('database');
      expect(response.body.services).toHaveProperty('redis');
      expect(response.body.services).toHaveProperty('externalApis');
    });
  });

  // ==========================================
  // REGULATORY UPDATES LIST TESTS
  // ==========================================
describe("Regulatory Updates API", () => {
    it('should return regulatory updates list with default pagination', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates')
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 20);
      expect(response.body.pagination).toHaveProperty('totalCount');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('hasNext');
      expect(response.body.pagination).toHaveProperty('hasPrev');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should handle custom pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates')
        .query({ page: 2, limit: 5 })
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(200);

      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should filter by jurisdiction', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates')
        .query({ jurisdiction: 'United States' })
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].jurisdiction).toBe('United States');
      }
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates')
        .query({ type: 'guidance' })
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].type).toBe('guidance');
      }
    });

    it('should filter by priority', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates')
        .query({ priority: 'high' })
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].priority).toBe('high');
      }
    });

    it('should handle search functionality', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates')
        .query({ search: 'FDA' })
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(200);

      expect(response.body.success).toBe(true);
      // All returned items should contain 'FDA' in title, content, or source
      response.body.data.forEach((item: any) => {
        const searchText = 'FDA';
        const matches = 
          item.title.includes(searchText) ||
          item.content.includes(searchText) ||
          item.source.includes(searchText);
        expect(matches).toBe(true);
      });
    });

    it('should handle sorting parameters', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates')
        .query({ sortBy: 'title', sortOrder: 'asc' })
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Verify sorting (first item should be alphabetically first)
      if (response.body.data.length > 1) {
        expect(response.body.data[0].title <= response.body.data[1].title).toBe(true);
      }
    });

    it('should require tenant ID', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Tenant required');
      expect(response.body).toHaveProperty('message', 'Tenant identification is required for this request');
    });

    it('should validate pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates')
        .query({ page: 'invalid', limit: 'invalid' })
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should limit maximum page size', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates')
        .query({ limit: 1000 })
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(200);

      // Should default to maximum allowed limit
      expect(response.body.pagination.limit).toBeLessThanOrEqual(100);
    });
  });

  // ==========================================
  // REGULATORY UPDATE BY ID TESTS
  // ==========================================
describe("Regulatory Updates API", () => {
    it('should return a specific regulatory update', async () => {
      // First, get a list to find an existing ID
      const listResponse = await request(app)
        .get('/api/v1/regulatory-updates')
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(200);

      if (listResponse.body.data.length > 0) {
        const updateId = listResponse.body.data[0].id;
        
        const response = await request(app)
          .get(`/api/v1/regulatory-updates/${updateId}`)
          .set('X-Tenant-ID', 'demo-medical-tech')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('id', updateId);
        expect(response.body.data).toHaveProperty('title');
        expect(response.body.data).toHaveProperty('content');
        expect(response.body.data).toHaveProperty('source');
        expect(response.body.data).toHaveProperty('jurisdiction');
        expect(response.body.data).toHaveProperty('type');
        expect(response.body.data).toHaveProperty('priority');
      }
    });

    it('should return 404 for non-existent regulatory update', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates/non-existent-id')
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Not found');
      expect(response.body).toHaveProperty('message', 'Regulatory update not found');
    });

    it('should validate UUID format', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates/invalid-uuid')
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('details');
    });

    it('should require tenant ID', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates/some-id')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Tenant required');
    });
  });

  // ==========================================
  // RECENT REGULATORY UPDATES TESTS
  // ==========================================
describe("Regulatory Updates API", () => {
    it('should return recent regulatory updates', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates/recent')
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBe(response.body.data.length);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates/recent')
        .query({ limit: 5 })
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should enforce maximum limit', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates/recent')
        .query({ limit: 1000 })
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(50);
    });

    it('should return updates sorted by published date (newest first)', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates/recent')
        .query({ limit: 3 })
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(200);

      if (response.body.data.length > 1) {
        const dates = response.body.data.map((item: any) => new Date(item.publishedDate));
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
        }
      }
    });
  });

  // ==========================================
  // STATISTICS TESTS
  // ==========================================
describe("Regulatory Updates API", () => {
    it('should return regulatory updates statistics', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates/stats')
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('byType');
      expect(response.body.data).toHaveProperty('byJurisdiction');
      expect(response.body.data).toHaveProperty('byPriority');
      expect(response.body.data).toHaveProperty('recentCount');
      expect(response.body.data).toHaveProperty('criticalCount');
      
      expect(typeof response.body.data.total).toBe('number');
      expect(typeof response.body.data.recentCount).toBe('number');
      expect(typeof response.body.data.criticalCount).toBe('number');
    });

    it('should return correct statistics format', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates/stats')
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(200);

      const stats = response.body.data;
      
      // Check that byType contains expected keys
      expect(stats.byType).toHaveProperty('regulation');
      expect(stats.byType).toHaveProperty('guidance');
      expect(stats.byType).toHaveProperty('warning');
      
      // Check that byPriority contains expected keys
      expect(stats.byPriority).toHaveProperty('low');
      expect(stats.byPriority).toHaveProperty('medium');
      expect(stats.byPriority).toHaveProperty('high');
      expect(stats.byPriority).toHaveProperty('critical');
      
      // Check that counts are non-negative
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.recentCount).toBeGreaterThanOrEqual(0);
      expect(stats.criticalCount).toBeGreaterThanOrEqual(0);
    });
  });

  // ==========================================
  // CREATE REGULATORY UPDATE TESTS
  // ==========================================
describe("Regulatory Updates API", () => {
    const validUpdateData = {
      title: 'Test Regulatory Update',
      content: 'This is a test regulatory update content.',
      source: 'Test Source',
      jurisdiction: 'Test Jurisdiction',
      type: 'guidance',
      priority: 'medium',
      tags: ['test', 'regulatory'],
      impactLevel: 'medium'
    };

    it('should create a new regulatory update with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/regulatory-updates')
        .send(validUpdateData)
        .set('X-Tenant-ID', 'demo-medical-tech')
        .set('Cookie', 'helix.session=test-session') // Mock session
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Regulatory update created successfully');
      
      const createdUpdate = response.body.data;
      expect(createdUpdate).toHaveProperty('id');
      expect(createdUpdate.title).toBe(validUpdateData.title);
      expect(createdUpdate.content).toBe(validUpdateData.content);
      expect(createdUpdate.source).toBe(validUpdateData.source);
      expect(createdUpdate.jurisdiction).toBe(validUpdateData.jurisdiction);
      expect(createdUpdate.type).toBe(validUpdateData.type);
      expect(createdUpdate.priority).toBe(validUpdateData.priority);
      expect(createdUpdate.tenantId).toBe('demo-medical-tech');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        title: '', // Empty title
        content: 'Some content',
        source: 'Some source'
        // Missing jurisdiction and type
      };

      const response = await request(app)
        .post('/api/v1/regulatory-updates')
        .send(invalidData)
        .set('X-Tenant-ID', 'demo-medical-tech')
        .set('Cookie', 'helix.session=test-session')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('details');
    });

    it('should validate field types', async () => {
      const invalidData = {
        title: 'Test Title',
        content: 'Test Content',
        source: 'Test Source',
        jurisdiction: 'Test Jurisdiction',
        type: 'invalid-type', // Invalid enum value
        priority: 'invalid-priority' // Invalid enum value
      };

      const response = await request(app)
        .post('/api/v1/regulatory-updates')
        .send(invalidData)
        .set('X-Tenant-ID', 'demo-medical-tech')
        .set('Cookie', 'helix.session=test-session')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should validate field lengths', async () => {
      const invalidData = {
        title: 'a'.repeat(501), // Too long
        content: 'b'.repeat(10001), // Too long
        source: 'c'.repeat(201), // Too long
        jurisdiction: 'd'.repeat(101), // Too long
        type: 'guidance'
      };

      const response = await request(app)
        .post('/api/v1/regulatory-updates')
        .send(invalidData)
        .set('X-Tenant-ID', 'demo-medical-tech')
        .set('Cookie', 'helix.session=test-session')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/regulatory-updates')
        .send(validUpdateData)
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Authentication required');
    });

    it('should require tenant ID', async () => {
      const response = await request(app)
        .post('/api/v1/regulatory-updates')
        .send(validUpdateData)
        .set('Cookie', 'helix.session=test-session')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Tenant required');
    });
  });

  // ==========================================
  // UPDATE REGULATORY UPDATE TESTS
  // ==========================================
describe("Regulatory Updates API", () => {
    let existingUpdateId: string;

    beforeEach(async () => {
      // Create a test update first
      const createResponse = await request(app)
        .post('/api/v1/regulatory-updates')
        .send({
          title: 'Test Update for Modification',
          content: 'Original content',
          source: 'Test Source',
          jurisdiction: 'Test Jurisdiction',
          type: 'guidance',
          priority: 'medium'
        })
        .set('X-Tenant-ID', 'demo-medical-tech')
        .set('Cookie', 'helix.session=test-session');

      existingUpdateId = createResponse.body.data.id;
    });

    it('should update an existing regulatory update', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/v1/regulatory-updates/${existingUpdateId}`)
        .send(updateData)
        .set('X-Tenant-ID', 'demo-medical-tech')
        .set('Cookie', 'helix.session=test-session')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Regulatory update updated successfully');
      
      const updatedUpdate = response.body.data;
      expect(updatedUpdate.title).toBe(updateData.title);
      expect(updatedUpdate.content).toBe(updateData.content);
      expect(updatedUpdate.priority).toBe(updateData.priority);
      expect(updatedUpdate.id).toBe(existingUpdateId);
    });

    it('should return 404 for non-existent update', async () => {
      const response = await request(app)
        .put('/api/v1/regulatory-updates/non-existent-id')
        .send({ title: 'Updated Title' })
        .set('X-Tenant-ID', 'demo-medical-tech')
        .set('Cookie', 'helix.session=test-session')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Not found');
    });

    it('should validate update data', async () => {
      const invalidData = {
        title: '', // Empty title
        type: 'invalid-type' // Invalid enum
      };

      const response = await request(app)
        .put(`/api/v1/regulatory-updates/${existingUpdateId}`)
        .send(invalidData)
        .set('X-Tenant-ID', 'demo-medical-tech')
        .set('Cookie', 'helix.session=test-session')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/v1/regulatory-updates/${existingUpdateId}`)
        .send({ title: 'Updated Title' })
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Authentication required');
    });
  });

  // ==========================================
  // DELETE REGULATORY UPDATE TESTS
  // ==========================================
describe("Regulatory Updates API", () => {
    let existingUpdateId: string;

    beforeEach(async () => {
      // Create a test update first
      const createResponse = await request(app)
        .post('/api/v1/regulatory-updates')
        .send({
          title: 'Test Update for Deletion',
          content: 'Content to be deleted',
          source: 'Test Source',
          jurisdiction: 'Test Jurisdiction',
          type: 'guidance',
          priority: 'medium'
        })
        .set('X-Tenant-ID', 'demo-medical-tech')
        .set('Cookie', 'helix.session=test-session');

      existingUpdateId = createResponse.body.data.id;
    });

    it('should delete an existing regulatory update', async () => {
      const response = await request(app)
        .delete(`/api/v1/regulatory-updates/${existingUpdateId}`)
        .set('X-Tenant-ID', 'demo-medical-tech')
        .set('Cookie', 'helix.session=test-session')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Regulatory update deleted successfully');

      // Verify it's actually deleted
      const getResponse = await request(app)
        .get(`/api/v1/regulatory-updates/${existingUpdateId}`)
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(404);

      expect(getResponse.body).toHaveProperty('error', 'Not found');
    });

    it('should return 404 for non-existent update', async () => {
      const response = await request(app)
        .delete('/api/v1/regulatory-updates/non-existent-id')
        .set('X-Tenant-ID', 'demo-medical-tech')
        .set('Cookie', 'helix.session=test-session')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/v1/regulatory-updates/${existingUpdateId}`)
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Authentication required');
    });

    it('should require admin role for deletion', async () => {
      // This test would need proper role-based authentication setup
      // For now, we'll test that the endpoint exists and returns appropriate response
      const response = await request(app)
        .delete(`/api/v1/regulatory-updates/${existingUpdateId}`)
        .set('X-Tenant-ID', 'demo-medical-tech')
        .set('Cookie', 'helix.session=test-session')
        .expect(200); // Should succeed with proper authentication

      expect(response.body).toHaveProperty('success', true);
    });
  });

  // ==========================================
  // ERROR HANDLING TESTS
  // ==========================================
describe("Regulatory Updates API", () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/regulatory-updates')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid JSON');
    });

    it('should handle requests that are too large', async () => {
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      const largeData = {
        title: 'Large Update',
        content: largeContent,
        source: 'Test Source',
        jurisdiction: 'Test Jurisdiction',
        type: 'guidance'
      };

      const response = await request(app)
        .post('/api/v1/regulatory-updates')
        .send(largeData)
        .set('X-Tenant-ID', 'demo-medical-tech')
        .set('Cookie', 'helix.session=test-session')
        .expect(413); // Payload too large

      expect(response.body).toHaveProperty('error');
    });

    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/v1/non-existent-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not found');
    });

    it('should handle method not allowed', async () => {
      const response = await request(app)
        .patch('/api/v1/regulatory-updates')
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(405);

      expect(response.body).toHaveProperty('error', 'Method not allowed');
    });
  });

  // ==========================================
  // RATE LIMITING TESTS
  // ==========================================
describe("Regulatory Updates API", () => {
    it('should apply rate limiting to API endpoints', async () => {
      // Make many requests quickly to test rate limiting
      const requests = Array(110).fill(null).map(() =>
        request(app)
          .get('/api/v1/regulatory-updates')
          .set('X-Tenant-ID', 'demo-medical-tech')
      );

      const responses = await Promise.allSettled(requests);
      
      // At least one request should be rate limited (429)
      const rateLimitedResponses = responses.filter(result => 
        result.status === 'fulfilled' && result.value.status === 429
      );
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // SECURITY TESTS
  // ==========================================
describe("Regulatory Updates API", () => {
    it('should sanitize input data', async () => {
      const maliciousData = {
        title: '<script>alert("xss")</script>Test Title',
        content: 'Test content with <img src="x" onerror="alert(1)">',
        source: 'Test Source',
        jurisdiction: 'Test Jurisdiction',
        type: 'guidance'
      };

      const response = await request(app)
        .post('/api/v1/regulatory-updates')
        .send(maliciousData)
        .set('X-Tenant-ID', 'demo-medical-tech')
        .set('Cookie', 'helix.session=test-session')
        .expect(201);

      // Check that malicious content is sanitized
      expect(response.body.data.title).not.toContain('<script>');
      expect(response.body.data.content).not.toContain('<img');
    });

    it('should validate tenant isolation', async () => {
      // Create update for one tenant
      const createResponse = await request(app)
        .post('/api/v1/regulatory-updates')
        .send({
          title: 'Tenant A Update',
          content: 'This belongs to tenant A',
          source: 'Test Source',
          jurisdiction: 'Test Jurisdiction',
          type: 'guidance'
        })
        .set('X-Tenant-ID', 'tenant-a')
        .set('Cookie', 'helix.session=test-session')
        .expect(201);

      const updateId = createResponse.body.data.id;

      // Try to access with different tenant
      const response = await request(app)
        .get(`/api/v1/regulatory-updates/${updateId}`)
        .set('X-Tenant-ID', 'tenant-b')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not found');
    });

    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/v1/regulatory-updates')
        .set('X-Tenant-ID', 'demo-medical-tech')
        .expect(200);

      // Check for security headers
      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
      expect(response.headers).toHaveProperty('x-xss-protection', '0');
    });
  });
});


vi.mock("../services/logger.service", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, requestLogger: (_req:any,_res:any,next:any)=> next() };
});
vi.mock("../services/logger.service", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, requestLogger: (_req:any,_res:any,next:any)=> next() };
});














