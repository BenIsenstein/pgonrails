#!/usr/bin/env node

/**
 * create-pgonrails CLI
 * Deploy a complete self-hosted Supabase instance on Railway in minutes.
 */

import { randomBytes } from "crypto";
import { password } from "@inquirer/prompts";
import { SignJWT } from "jose";
import { version } from "../package.json";

// ============================================
// CONSTANTS
// ============================================

const RAILWAY_API_URL = "https://backboard.railway.com/graphql/v2";
const TEMPLATE_ID = "5e14ce66-9fb7-472e-ac44-15067d57cedc";
const USER_AGENT = `create-pgonrails/${version}`;
const UPSTREAM_URL = "https://github.com/BenIsenstein/pgonrails";
const REPO_NAME = "pgonrails";
const REPO_OWNER = "BenIsenstein";

// ============================================
// TYPES
// ============================================

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface TemplateConfig {
  services: Record<string, ServiceConfig>;
}

interface ServiceConfig {
  name: string;
  icon?: string;
  deploy?: unknown;
  source?: unknown;
  networking?: unknown;
  volumeMounts?: unknown;
  variables?: Record<string, { defaultValue?: string }>;
}

interface TemplateQueryResponse {
  template: {
    serializedConfig: TemplateConfig;
  };
}

interface DeployResponse {
  templateDeployV2: {
    projectId: string;
    workflowId: string;
  };
}

interface WorkflowStatusResponse {
  workflowStatus: {
    status: string;
    error: string | null;
  };
}

interface ProjectServicesResponse {
  project: {
    services: {
      edges: Array<{
        node: {
          id: string;
          name: string;
        };
      }>;
    };
  };
}

interface ServiceDeploymentResponse {
  service: {
    serviceInstances: {
      edges: Array<{
        node: {
          latestDeployment: {
            status: string;
          } | null;
        };
      }>;
    };
  };
}

interface EjectResponse {
  templateServiceSourceEject: boolean;
}

interface ServiceInstancesResponse {
  project: {
    environments: {
      edges: Array<{
        node: {
          serviceInstances: {
            edges: Array<{
              node: {
                serviceId: string;
                serviceName: string;
                rootDirectory: string;
              };
            }>;
          };
        };
      }>;
    };
  };
}

interface ServiceSourceResponse {
  service: {
    serviceInstances: {
      edges: Array<{
        node: {
          source: {
            repo: string;
          };
        };
      }>;
    };
  };
}

interface CLIOptions {
  dryRun: boolean;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes("--dry-run"),
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Custom spinner implementation
const spinner = {
  frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  interval: null as ReturnType<typeof setInterval> | null,
  i: 0,
  message: "",

  start(message: string) {
    this.message = message;
    this.i = 0;

    process.stdout.write(`\r\x1b[2K`);
    process.stdout.write(`${this.frames[0]} ${message}`);

    this.interval = setInterval(() => {
      this.i = (this.i + 1) % this.frames.length;
      process.stdout.write(`\r\x1b[2K`);
      process.stdout.write(`\r${this.frames[this.i]} ${this.message}`);
    }, 80);
  },

  update(message: string) {
    this.message = message;

    process.stdout.write(`\r\x1b[2K`);
    process.stdout.write(`\r${this.frames[this.i]} ${this.message}`);
  },

  stop(finalMessage: string) {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  
    process.stdout.write(`\r\x1b[2K`);
    process.stdout.write(`\r\x1b[32m✓\x1b[0m ${finalMessage}\n`);
  },

  fail(finalMessage: string) {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;

    process.stdout.write(`\r\x1b[2K`);
    process.stdout.write(`\r\x1b[31m✗\x1b[0m ${finalMessage}\n`);
  },
};

function log(message: string) {
  console.log(message);
}

function logError(message: string) {
  console.error(`\x1b[31mError:\x1b[0m ${message}`);
}

// ============================================
// API LAYER
// ============================================

async function graphqlRequest<T>(
  query: string,
  variables: Record<string, unknown>,
  token: string
): Promise<T> {
  const response = await fetch(RAILWAY_API_URL, {
    method: "POST",
    headers: {
      Accept: "*/*",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await response.json()) as GraphQLResponse<T>;

  if (json.errors && json.errors.length > 0) {
    throw new Error(`GraphQL Error: ${json.errors[0].message}`);
  }

  if (!json.data) {
    throw new Error("No data returned from GraphQL API");
  }

  return json.data;
}

// ============================================
// CRYPTO / JWT
// ============================================

export function generateJwtSecret(): string {
  return randomBytes(20).toString("hex");
}

export async function generateToken(
  secret: string,
  payload: { role: string; iss: string },
  iat: number,
  exp: number
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(secretKey);

  return token;
}

interface SupabaseTokens {
  jwtSecret: string;
  anonKey: string;
  serviceKey: string;
}

export async function generateSupabaseTokens(): Promise<SupabaseTokens> {
  const jwtSecret = generateJwtSecret();
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 5 * 365 * 24 * 3600; // 5 years

  const anonKey = await generateToken(
    jwtSecret,
    { role: "anon", iss: "supabase" },
    iat,
    exp
  );

  const serviceKey = await generateToken(
    jwtSecret,
    { role: "service_role", iss: "supabase" },
    iat,
    exp
  );

  return { jwtSecret, anonKey, serviceKey };
}

// ============================================
// AUTH
// ============================================

async function getToken(dryRun: boolean): Promise<string> {
  const envToken = process.env.RAILWAY_TOKEN;

  if (envToken) {
    return envToken;
  }

  if (dryRun) {
    return "dry-run-token";
  }

  const token = await password({
    message: "Please input your Railway API token:",
    mask: "*",
  });

  if (!token || token.trim() === "") {
    throw new Error("Operation cancelled - no token provided");
  }

  return token.trim();
}

// ============================================
// DEPLOYMENT FUNCTIONS
// ============================================

async function fetchTemplateConfig(
  token: string
): Promise<TemplateConfig> {
  const query = `{ template(id: "${TEMPLATE_ID}") { serializedConfig } }`;
  const data = await graphqlRequest<TemplateQueryResponse>(query, {}, token);
  return data.template.serializedConfig;
}

export function buildDeploymentPayload(
  templateConfig: TemplateConfig,
  tokens: SupabaseTokens
): { query: string; variables: Record<string, unknown> } {
  const services: Record<string, unknown> = {};

  for (const [serviceId, serviceObj] of Object.entries(templateConfig.services)) {
    const serviceConfig: Record<string, unknown> = {
      icon: serviceObj.icon,
      name: serviceObj.name,
      deploy: serviceObj.deploy,
      source: serviceObj.source,
      networking: serviceObj.networking,
      volumeMounts: serviceObj.volumeMounts,
    };

    // Build variables
    const variables: Record<string, { value: string }> = {};
    if (serviceObj.variables) {
      for (const [varName, varObj] of Object.entries(serviceObj.variables)) {
        if (varObj.defaultValue !== undefined) {
          variables[varName] = { value: varObj.defaultValue };
        }
      }
    }

    // Inject JWT tokens for Postgres service
    if (serviceObj.name === "Postgres") {
      variables["JWT_SECRET"] = { value: tokens.jwtSecret };
      variables["SUPABASE_ANON_KEY"] = { value: tokens.anonKey };
      variables["SUPABASE_SERVICE_KEY"] = { value: tokens.serviceKey };
    }

    serviceConfig.variables = variables;
    services[serviceId] = serviceConfig;
  }

  return {
    query: `mutation templateDeployV2($input: TemplateDeployV2Input!) {
  templateDeployV2(input: $input) {
    projectId
    workflowId
  }
}`,
    variables: {
      input: {
        templateId: TEMPLATE_ID,
        serializedConfig: { services },
      },
    },
  };
}

async function deployTemplate(
  payload: { query: string; variables: Record<string, unknown> },
  token: string
): Promise<{ projectId: string; workflowId: string }> {
  const data = await graphqlRequest<DeployResponse>(
    payload.query,
    payload.variables,
    token
  );
  return data.templateDeployV2;
}

async function pollWorkflowStatus(
  workflowId: string,
  token: string
): Promise<void> {
  const query = `query workflowStatus($workflowId: String!) {
  workflowStatus(workflowId: $workflowId) {
    status
    error
  }
}`;

  const MAX_POLLS = 150; // 5 minutes at 2s intervals
  let count = 1;
  while (true) {
    const data = await graphqlRequest<WorkflowStatusResponse>(
      query,
      { workflowId },
      token
    );

    const { status, error } = data.workflowStatus;
    spinner.update(`Creating project... (poll #${count}, status: ${status})`);

    if (status === "Complete") {
      return;
    }

    if (error) {
      throw new Error(`Workflow error: ${error}`);
    }

    if (count >= MAX_POLLS) {
      throw new Error("Project creation timed out after 5 minutes. Check the Railway dashboard for status.");
    }

    count++;
    await sleep(2000);
  }
}

async function fetchProjectServices(
  projectId: string,
  token: string
): Promise<Array<{ id: string; name: string }>> {
  const query = `query project($id: String!) {
  project(id: $id) {
    services {
      edges {
        node {
          id
          name
        }
      }
    }
  }
}`;

  const data = await graphqlRequest<ProjectServicesResponse>(
    query,
    { id: projectId },
    token
  );

  return data.project.services.edges.map((edge) => edge.node);
}

async function waitForServicesHealthy(
  siteServiceId: string,
  token: string
): Promise<void> {
  const query = `query service($id: String!) {
  service(id: $id) {
    serviceInstances {
      edges {
        node {
          latestDeployment {
            status
          }
        }
      }
    }
  }
}`;

  const MAX_POLLS = 30; // 15 minutes at 30s intervals
  let count = 1;
  while (true) {
    const data = await graphqlRequest<ServiceDeploymentResponse>(
      query,
      { id: siteServiceId },
      token
    );

    const deployment = data.service.serviceInstances.edges[0]?.node?.latestDeployment;
    const status = deployment?.status || "PENDING";

    spinner.update(`Waiting for services... (poll #${count}, status: ${status})`);

    if (status === "SUCCESS") {
      return;
    }

    if (status === "FAILED" || status === "CRASHED") {
      throw new Error(`Deployment ${status.toLowerCase()}. Check Railway dashboard for details.`);
    }

    if (count >= MAX_POLLS) {
      throw new Error("Service deployment timed out after 15 minutes. Check the Railway dashboard for status.");
    }

    count++;
    await sleep(30000);
  }
}

async function ejectTemplate(
  projectId: string,
  serviceIds: string[],
  token: string
): Promise<boolean> {
  const query = `mutation templateServiceSourceEject($input: TemplateServiceSourceEjectInput!) {
  templateServiceSourceEject(input: $input)
}`;

  const data = await graphqlRequest<EjectResponse>(query, {
    input: {
      upstreamUrl: UPSTREAM_URL,
      repoName: REPO_NAME,
      repoOwner: REPO_OWNER,
      serviceIds,
      projectId,
    },
  }, token);

  return data.templateServiceSourceEject;
}

async function fetchServiceInstances(
  projectId: string,
  token: string
): Promise<Array<{ serviceId: string; serviceName: string; rootDirectory: string }>> {
  const query = `query serviceInstances($projectId: String!) {
  project(id: $projectId) {
    environments {
      edges {
        node {
          serviceInstances {
            edges {
              node {
                serviceId
                serviceName
                rootDirectory
              }
            }
          }
        }
      }
    }
  }
}`;

  const data = await graphqlRequest<ServiceInstancesResponse>(
    query,
    { projectId },
    token
  );

  const firstEnv = data.project.environments.edges[0];
  if (!firstEnv) return [];

  return firstEnv.node.serviceInstances.edges.map((edge) => edge.node);
}

async function updateWatchPatterns(
  serviceId: string,
  rootDirectory: string,
  token: string
): Promise<boolean> {
  const query = `mutation serviceInstanceUpdate($serviceId: String!, $input: ServiceInstanceUpdateInput!) {
  serviceInstanceUpdate(serviceId: $serviceId, input: $input)
}`;

  const data = await graphqlRequest<{ serviceInstanceUpdate: boolean }>(
    query,
    {
      serviceId,
      input: {
        watchPatterns: [`${rootDirectory}/**/*`],
      },
    },
    token
  );

  return data.serviceInstanceUpdate;
}

async function configureWatchPatterns(
  projectId: string,
  token: string
): Promise<void> {
  const instances = await fetchServiceInstances(projectId, token);

  for (const instance of instances) {
    spinner.update(`Configuring CI/CD for "${instance.serviceName}"...`);
    const success = await updateWatchPatterns(
      instance.serviceId,
      instance.rootDirectory,
      token
    );

    if (!success) {
      log(`\n  Warning: Failed to update watch patterns for "${instance.serviceName}"`);
    }
  }
}

async function fetchNewRepoUrl(
  siteServiceId: string,
  token: string
): Promise<string> {
  const query = `query service($id: String!) {
  service(id: $id) {
    serviceInstances {
      edges {
        node {
          source {
            repo
          }
        }
      }
    }
  }
}`;

  const data = await graphqlRequest<ServiceSourceResponse>(
    query,
    { id: siteServiceId },
    token
  );

  const repo = data.service.serviceInstances.edges[0]?.node?.source?.repo;
  return repo ? `https://github.com/${repo}` : "";
}

// ============================================
// MAIN
// ============================================

async function main() {
  const options = parseArgs();

  log("");
  log("\x1b[36m╔═══════════════════════════════════════════╗\x1b[0m");
  log("\x1b[36m║\x1b[0m   \x1b[1mPG On Rails\x1b[0m - Self-Hosted Supabase CLI  \x1b[36m║\x1b[0m");
  log("\x1b[36m╚═══════════════════════════════════════════╝\x1b[0m");
  log("");

  if (options.dryRun) {
    log("\x1b[33m[DRY RUN MODE]\x1b[0m - No actual API calls will be made\n");
  }

  // Step 1: Get token
  const token = await getToken(options.dryRun);

  // Step 2: Generate JWT tokens
  spinner.start("Generating JWT secret and tokens...");
  const tokens = await generateSupabaseTokens();
  spinner.stop("Generated JWT secret and tokens");

  if (options.dryRun) {
    log("\n\x1b[33m[DRY RUN]\x1b[0m Would perform the following steps:");
    log("  1. Fetch template configuration from Railway API");
    log("  2. Build deployment payload with generated JWT tokens");
    log("  3. Deploy template via templateDeployV2 mutation");
    log("  4. Poll workflow status until complete");
    log("  5. Wait for all services to become healthy");
    log("  6. Eject template to create your own GitHub repo");
    log("  7. Configure CI/CD watch patterns for each service");
    log("  8. Display your new GitHub repo and Railway project URLs");
    log("\nRun without --dry-run to execute the deployment.");
    return;
  }

  // Step 3: Fetch template config
  spinner.start("Fetching template configuration...");
  const templateConfig = await fetchTemplateConfig(token);
  spinner.stop("Fetched template configuration");

  // Step 4: Build deployment payload
  spinner.start("Building deployment configuration...");
  const payload = buildDeploymentPayload(templateConfig, tokens);
  spinner.stop("Built deployment configuration");

  // Step 5: Deploy template
  spinner.start("Deploying template...");
  const { projectId, workflowId } = await deployTemplate(payload, token);
  spinner.stop("Template deployment initiated");

  // Step 6: Poll workflow status
  spinner.start("Creating project...");
  await pollWorkflowStatus(workflowId, token);
  spinner.stop("Project created");

  // Step 7: Fetch services
  spinner.start("Fetching service information...");
  const services = await fetchProjectServices(projectId, token);
  const siteService = services.find((s) => s.name === "Site");
  spinner.stop("Fetched service information");

  if (!siteService) {
    throw new Error("Could not find Site service in deployed project");
  }

  // Step 8: Wait for services to be healthy
  spinner.start("Waiting for services to deploy...");
  await waitForServicesHealthy(siteService.id, token);
  spinner.stop("All services deployed");

  // Step 9: Eject template
  spinner.start("Ejecting template to your GitHub...");
  const serviceIds = services.map((s) => s.id);
  const ejected = await ejectTemplate(projectId, serviceIds, token);

  if (ejected) {
    spinner.stop("Template ejected to your GitHub");
  } else {
    spinner.fail("Template ejection failed - check Railway dashboard");
  }

  // Step 10: Configure CI/CD
  spinner.start("Configuring CI/CD watch patterns...");
  await configureWatchPatterns(projectId, token);
  spinner.stop("CI/CD configured");

  // Step 11: Fetch and display results
  spinner.start("Fetching your new repository URL...");
  const repoUrl = await fetchNewRepoUrl(siteService.id, token);
  spinner.stop("Ready!");

  log("");
  log("\x1b[32m═══════════════════════════════════════════\x1b[0m");
  log("\x1b[32m  Deployment Complete!\x1b[0m");
  log("\x1b[32m═══════════════════════════════════════════\x1b[0m");
  log("");

  if (repoUrl) {
    log(`  \x1b[1mGitHub Repository:\x1b[0m`);
    log(`  ${repoUrl}`);
    log("");
  }

  log(`  \x1b[1mRailway Project:\x1b[0m`);
  log(`  https://railway.com/project/${projectId}`);
  log("");
  log("  Thank you for using PG On Rails CLI. Happy hacking!");
  log("");
}

// ============================================
// ENTRY POINT
// ============================================

main().catch((error) => {
  spinner.fail("An error occurred");
  logError(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
