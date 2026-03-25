import { describe, test, expect, beforeAll, afterAll, mock } from "bun:test";

// Importing cli.ts triggers main() at module scope, which calls process.exit(1)
// when it can't get a token in a non-interactive environment.
// We mock process.exit to prevent the test runner from dying.
const originalExit = process.exit;
const originalStdoutWrite = process.stdout.write;
process.exit = mock(() => {}) as any;
process.stdout.write = mock(() => true) as any;

const {
  parseArgs,
  generateJwtSecret,
  generateToken,
  generateSupabaseTokens,
  buildDeploymentPayload,
} = await import("./cli");

// Wait a tick for the main() promise rejection to settle
await new Promise((resolve) => setTimeout(resolve, 100));

// Restore real process.exit and stdout for test output
process.exit = originalExit;
process.stdout.write = originalStdoutWrite;

// ============================================
// parseArgs
// ============================================

describe("parseArgs", () => {
  const originalArgv = process.argv;

  afterAll(() => {
    process.argv = originalArgv;
  });

  test("returns dryRun: false with no args", () => {
    process.argv = ["node", "cli.js"];
    expect(parseArgs()).toEqual({ dryRun: false });
  });

  test("returns dryRun: true with --dry-run flag", () => {
    process.argv = ["node", "cli.js", "--dry-run"];
    expect(parseArgs()).toEqual({ dryRun: true });
  });

  test("returns dryRun: false with unrelated args", () => {
    process.argv = ["node", "cli.js", "--verbose", "--foo"];
    expect(parseArgs()).toEqual({ dryRun: false });
  });
});

// ============================================
// generateJwtSecret
// ============================================

describe("generateJwtSecret", () => {
  test("returns a 40-character string", () => {
    const secret = generateJwtSecret();
    expect(secret).toHaveLength(40);
  });

  test("contains only hex characters", () => {
    const secret = generateJwtSecret();
    expect(secret).toMatch(/^[0-9a-f]{40}$/);
  });

  test("returns different values on successive calls", () => {
    const a = generateJwtSecret();
    const b = generateJwtSecret();
    expect(a).not.toBe(b);
  });
});

// ============================================
// generateToken
// ============================================

describe("generateToken", () => {
  function decodeJwtPart(part: string): Record<string, unknown> {
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
  }

  test("produces a valid 3-part JWT", async () => {
    const token = await generateToken(
      "a".repeat(40),
      { role: "anon", iss: "supabase" },
      1000000,
      2000000
    );
    const parts = token.split(".");
    expect(parts).toHaveLength(3);
  });

  test("header has alg HS256 and typ JWT", async () => {
    const token = await generateToken(
      "a".repeat(40),
      { role: "anon", iss: "supabase" },
      1000000,
      2000000
    );
    const header = decodeJwtPart(token.split(".")[0]);
    expect(header.alg).toBe("HS256");
    expect(header.typ).toBe("JWT");
  });

  test("payload contains correct role and iss claims", async () => {
    const token = await generateToken(
      "a".repeat(40),
      { role: "service_role", iss: "supabase" },
      1000000,
      2000000
    );
    const payload = decodeJwtPart(token.split(".")[1]);
    expect(payload.role).toBe("service_role");
    expect(payload.iss).toBe("supabase");
  });

  test("payload contains correct iat and exp", async () => {
    const iat = 1000000;
    const exp = 2000000;
    const token = await generateToken(
      "a".repeat(40),
      { role: "anon", iss: "supabase" },
      iat,
      exp
    );
    const payload = decodeJwtPart(token.split(".")[1]);
    expect(payload.iat).toBe(iat);
    expect(payload.exp).toBe(exp);
  });
});

// ============================================
// generateSupabaseTokens
// ============================================

describe("generateSupabaseTokens", () => {
  function decodeJwtPart(part: string): Record<string, unknown> {
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
  }

  test("returns jwtSecret, anonKey, and serviceKey", async () => {
    const tokens = await generateSupabaseTokens();
    expect(tokens).toHaveProperty("jwtSecret");
    expect(tokens).toHaveProperty("anonKey");
    expect(tokens).toHaveProperty("serviceKey");
  });

  test("jwtSecret is a 40-char hex string", async () => {
    const tokens = await generateSupabaseTokens();
    expect(tokens.jwtSecret).toMatch(/^[0-9a-f]{40}$/);
  });

  test("anonKey decodes to role anon with iss supabase", async () => {
    const tokens = await generateSupabaseTokens();
    const payload = decodeJwtPart(tokens.anonKey.split(".")[1]);
    expect(payload.role).toBe("anon");
    expect(payload.iss).toBe("supabase");
  });

  test("serviceKey decodes to role service_role with iss supabase", async () => {
    const tokens = await generateSupabaseTokens();
    const payload = decodeJwtPart(tokens.serviceKey.split(".")[1]);
    expect(payload.role).toBe("service_role");
    expect(payload.iss).toBe("supabase");
  });

  test("tokens have a 5-year expiry", async () => {
    const tokens = await generateSupabaseTokens();
    const payload = decodeJwtPart(tokens.anonKey.split(".")[1]);
    const iat = payload.iat as number;
    const exp = payload.exp as number;
    const fiveYearsInSeconds = 5 * 365 * 24 * 3600;
    expect(exp - iat).toBe(fiveYearsInSeconds);
  });
});

// ============================================
// buildDeploymentPayload
// ============================================

describe("buildDeploymentPayload", () => {
  const mockTokens = {
    jwtSecret: "abc123",
    anonKey: "anon-jwt-token",
    serviceKey: "service-jwt-token",
  };

  test("injects JWT tokens into the Postgres service", () => {
    const templateConfig = {
      services: {
        "svc-1": {
          name: "Postgres",
          variables: {
            POSTGRES_PASSWORD: { defaultValue: "secret" },
          },
        },
      },
    };

    const result = buildDeploymentPayload(templateConfig, mockTokens);
    const services = (result.variables.input as any).serializedConfig.services;
    const pgVars = services["svc-1"].variables;

    expect(pgVars.JWT_SECRET).toEqual({ value: "abc123" });
    expect(pgVars.SUPABASE_ANON_KEY).toEqual({ value: "anon-jwt-token" });
    expect(pgVars.SUPABASE_SERVICE_KEY).toEqual({ value: "service-jwt-token" });
    // Original variable preserved
    expect(pgVars.POSTGRES_PASSWORD).toEqual({ value: "secret" });
  });

  test("does not inject JWT tokens into non-Postgres services", () => {
    const templateConfig = {
      services: {
        "svc-1": {
          name: "Site",
          variables: {
            PORT: { defaultValue: "3000" },
          },
        },
      },
    };

    const result = buildDeploymentPayload(templateConfig, mockTokens);
    const services = (result.variables.input as any).serializedConfig.services;
    const siteVars = services["svc-1"].variables;

    expect(siteVars.PORT).toEqual({ value: "3000" });
    expect(siteVars.JWT_SECRET).toBeUndefined();
    expect(siteVars.SUPABASE_ANON_KEY).toBeUndefined();
    expect(siteVars.SUPABASE_SERVICE_KEY).toBeUndefined();
  });

  test("handles services with no variables", () => {
    const templateConfig = {
      services: {
        "svc-1": {
          name: "Redis",
        },
      },
    };

    const result = buildDeploymentPayload(templateConfig, mockTokens);
    const services = (result.variables.input as any).serializedConfig.services;
    expect(services["svc-1"].variables).toEqual({});
  });

  test("preserves service metadata (icon, deploy, source, etc.)", () => {
    const templateConfig = {
      services: {
        "svc-1": {
          name: "Postgres",
          icon: "database",
          deploy: { startCommand: "start" },
          source: { repo: "test/repo" },
          networking: { port: 5432 },
          volumeMounts: { "/data": {} },
          variables: {},
        },
      },
    };

    const result = buildDeploymentPayload(templateConfig, mockTokens);
    const services = (result.variables.input as any).serializedConfig.services;
    const svc = services["svc-1"];

    expect(svc.icon).toBe("database");
    expect(svc.deploy).toEqual({ startCommand: "start" });
    expect(svc.source).toEqual({ repo: "test/repo" });
    expect(svc.networking).toEqual({ port: 5432 });
    expect(svc.volumeMounts).toEqual({ "/data": {} });
  });

  test("returns a templateDeployV2 mutation query", () => {
    const templateConfig = {
      services: {
        "svc-1": { name: "Site", variables: {} },
      },
    };

    const result = buildDeploymentPayload(templateConfig, mockTokens);
    expect(result.query).toContain("mutation templateDeployV2");
    expect(result.query).toContain("templateDeployV2(input: $input)");
  });

  test("includes the correct templateId in the input", () => {
    const templateConfig = {
      services: {
        "svc-1": { name: "Site", variables: {} },
      },
    };

    const result = buildDeploymentPayload(templateConfig, mockTokens);
    const input = result.variables.input as any;
    expect(input.templateId).toBe("5e14ce66-9fb7-472e-ac44-15067d57cedc");
  });

  test("handles multiple services correctly", () => {
    const templateConfig = {
      services: {
        "svc-1": {
          name: "Postgres",
          variables: { DB_HOST: { defaultValue: "localhost" } },
        },
        "svc-2": {
          name: "Site",
          variables: { PORT: { defaultValue: "3000" } },
        },
        "svc-3": {
          name: "Redis",
          variables: {},
        },
      },
    };

    const result = buildDeploymentPayload(templateConfig, mockTokens);
    const services = (result.variables.input as any).serializedConfig.services;

    // Postgres gets JWT tokens injected
    expect(services["svc-1"].variables.JWT_SECRET).toEqual({ value: "abc123" });
    // Site does not
    expect(services["svc-2"].variables.JWT_SECRET).toBeUndefined();
    expect(services["svc-2"].variables.PORT).toEqual({ value: "3000" });
    // Redis has empty variables
    expect(services["svc-3"].variables).toEqual({});
  });
});
