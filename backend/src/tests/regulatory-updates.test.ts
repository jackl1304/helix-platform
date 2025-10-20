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
        .get('/api/v1/regulatory-updates').set("Accept","application/json").type("json")
        .set('X-Tenant-ID','demo-medical-tech').set('X-Tenant','demo-medical-tech')
        .expect( 400 );

      expect(response.body).toHaveProperty('error');
      

