# Xray Test Automation - Implementation Roadmap

## Quick Start: Generalization Checklist

This document provides **actionable steps** to transform your package from Old Mutual-specific to a universal npm package.

---

## Phase 1: Immediate Generalization (Week 1)

### Step 1.1: Package Rename

**File: `package.json`**

```json
{
  "name": "@xray-tools/test-automation",
  "version": "1.0.0",
  "description": "Automated Xray test case creation and execution management for Jira. Supports test creation with steps, test executions, test plans, and CI/CD pipeline integration.",
  "main": "index.js",
  "types": "index.d.ts",
  "scripts": {
    "start": "node createXrayTest.js",
    "create": "node createXrayTest.js",
    "link": "node scripts/linkTests.js",
    "test": "jest",
    "build": "tsc",
    "prepublishOnly": "npm test && npm run build"
  },
  "keywords": [
    "xray",
    "jira",
    "testing",
    "automation",
    "test-management",
    "ci-cd",
    "quality-assurance",
    "xray-cloud",
    "test-automation",
    "jira-integration",
    "playwright",
    "cypress",
    "cucumber",
    "gherkin"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/xray-test-automation"
  },
  "bugs": {
    "url": "https://github.com/yourusername/xray-test-automation/issues"
  },
  "homepage": "https://github.com/yourusername/xray-test-automation#readme",
  "dependencies": {
    "axios": "^1.13.4",
    "dotenv": "^17.2.3"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "jest": "^29.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "files": [
    "index.js",
    "index.d.ts",
    "createXrayTest.js",
    "scripts/",
    "README.md",
    ".env.example"
  ]
}
```

### Step 1.2: Add TypeScript Definitions

**File: `index.d.ts`**

```typescript
export interface XrayConfig {
  jira?: {
    url?: string;
    email?: string;
    token?: string;
  };
  xray?: {
    clientId?: string;
    clientSecret?: string;
    region?: 'us' | 'eu' | 'au';
  };
  projectKey?: string;
}

export interface TestStep {
  action: string;
  data?: string;
  expected_result: string;
}

export interface TestDefinition {
  test_id: string;
  xray: {
    summary: string;
    description?: string;
    priority?: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
    labels?: string[];
    steps?: TestStep[];
  };
}

export interface TestExecutionConfig {
  summary: string;
  description?: string;
}

export interface TestConfig {
  projectKey?: string;
  testExecution?: TestExecutionConfig;
  tests: TestDefinition[];
}

export interface TestResult {
  tests: string[];
  testExecution: string | null;
  mapping: Record<string, { key: string; id: string }>;
}

export interface JiraIssue {
  key: string;
  id: string;
}

/**
 * Create tests and a test execution, then link them together.
 * @param config - Test configuration object
 * @returns Promise resolving to test creation results
 */
export function createTestsAndExecution(config: TestConfig): Promise<TestResult>;

/**
 * Create a single Xray Test issue in JIRA.
 * @param test - Test definition object
 * @param options - Optional configuration overrides
 * @returns Promise resolving to created test issue
 */
export function createJiraTestIssue(
  test: TestDefinition,
  options?: XrayConfig
): Promise<JiraIssue>;

/**
 * Create a Test Execution issue in JIRA.
 * @param summary - Test Execution title
 * @param description - Test Execution description
 * @param options - Optional configuration overrides
 * @returns Promise resolving to created test execution
 */
export function createTestExecution(
  summary: string,
  description?: string,
  options?: XrayConfig
): Promise<JiraIssue>;

/**
 * Link tests to a test execution.
 * @param testExecutionKey - JIRA key of the Test Execution
 * @param testKeys - Array of test JIRA keys to link
 * @param options - Optional configuration overrides
 * @returns Promise resolving to array of successfully linked test keys
 */
export function linkTestsToExecution(
  testExecutionKey: string,
  testKeys: string[],
  options?: XrayConfig
): Promise<string[]>;

/**
 * Authenticate with Xray Cloud and return a JWT token.
 * @param options - Optional configuration overrides
 * @returns Promise resolving to JWT token
 */
export function getXrayToken(options?: XrayConfig): Promise<string>;

/**
 * Create a Test Plan issue in JIRA.
 * @param summary - Test Plan title
 * @param description - Test Plan description
 * @param options - Optional configuration overrides
 * @returns Promise resolving to created test plan
 */
export function createTestPlan(
  summary: string,
  description?: string,
  options?: XrayConfig
): Promise<JiraIssue>;

/**
 * Link tests to a test plan.
 * @param testPlanKey - JIRA key of the Test Plan
 * @param testKeys - Array of test JIRA keys to link
 * @param options - Optional configuration overrides
 * @returns Promise resolving to array of successfully linked test keys
 */
export function linkTestsToTestPlan(
  testPlanKey: string,
  testKeys: string[],
  options?: XrayConfig
): Promise<string[]>;
```

### Step 1.3: Update Environment Variables

**File: `.env.example`**

```env
# Xray Cloud API Credentials
# Get these from: JIRA → Settings → Apps → Xray Settings → API Keys
XRAY_CLIENT_ID=your_xray_client_id_here
XRAY_CLIENT_SECRET=your_xray_client_secret_here

# Xray GraphQL endpoint region (us/eu/au) - defaults to US
# US: https://us.xray.cloud.getxray.app/api/v2/graphql
# EU: https://eu.xray.cloud.getxray.app/api/v2/graphql
# AU: https://au.xray.cloud.getxray.app/api/v2/graphql
XRAY_GRAPHQL_URL=https://us.xray.cloud.getxray.app/api/v2/graphql

# JIRA Project Configuration
# The default project key for test creation (can be overridden per operation)
JIRA_PROJECT_KEY=PROJ

# JIRA Authentication
# Your JIRA instance URL
JIRA_URL=https://your-company.atlassian.net

# JIRA API Token - Create at: https://id.atlassian.com/manage-profile/security/api-tokens
JIRA_API_TOKEN=your_jira_api_token_here

# JIRA Email - Must match the user who created the Xray API Key
JIRA_EMAIL=your.email@company.com
```

### Step 1.4: Update README (First Section)

**File: `README.md` (Lines 1-100)**

```markdown
# @xray-tools/test-automation

> **Automated Xray test case creation and execution management for Jira projects.**

[![Version](https://img.shields.io/npm/v/@xray-tools/test-automation.svg)](https://www.npmjs.com/package/@xray-tools/test-automation)
[![Downloads](https://img.shields.io/npm/dm/@xray-tools/test-automation.svg)](https://www.npmjs.com/package/@xray-tools/test-automation)
[![License](https://img.shields.io/npm/l/@xray-tools/test-automation.svg)](https://github.com/yourusername/xray-test-automation/blob/main/LICENSE)
[![Node](https://img.shields.io/node/v/@xray-tools/test-automation.svg)](https://www.npmjs.com/package/@xray-tools/test-automation)

## Overview

This package provides automated creation and management of Xray test cases within Jira. It is designed for **QA teams, developers, and DevOps engineers** who need to manage test cases efficiently, supporting both automated testing workflows and manual test documentation.

**What it does:**
- ✅ Creates Xray **Automated** Test cases in JIRA
- ✅ Adds detailed test steps with actions, data, and expected results
- ✅ Creates Test Executions and Test Plans for organizing test runs
- ✅ Links tests to executions/plans automatically
- ✅ Generates test-to-JIRA key mappings for CI/CD integration
- ✅ Saves mapping incrementally to prevent data loss
- ✅ Supports bulk test creation with error handling

**Use cases:**
- **API Teams:** Creating test cases from API specifications (OpenAPI/Swagger)
- **QA Teams:** Synchronizing automated UI/functional test suites with Xray
- **DevOps Teams:** Managing test executions across multiple releases and environments
- **Product Teams:** Documenting acceptance criteria as executable tests
- **Integration Teams:** Creating integration and end-to-end test scenarios
- **All Teams:** CI/CD pipeline integration and test coverage tracking

---

## Quick Start

### Installation

```bash
npm install @xray-tools/test-automation
```

### Basic Usage

```javascript
require('dotenv').config();
const { createTestsAndExecution } = require('@xray-tools/test-automation');

const config = {
  testExecution: {
    summary: "Sprint 24 - Automated Tests",
    description: "Automated test suite for user authentication"
  },
  tests: [
    {
      test_id: "TC-LOGIN-001",
      xray: {
        summary: "Verify successful user login",
        priority: "High",
        labels: ["Login", "Authentication", "Smoke"],
        steps: [
          {
            action: "Navigate to login page",
            data: "URL: /login",
            expected_result: "Login page is displayed"
          },
          {
            action: "Enter valid credentials",
            data: "user@example.com / password123",
            expected_result: "User is logged in successfully"
          }
        ]
      }
    }
  ]
};

createTestsAndExecution(config)
  .then(result => {
    console.log('Created tests:', result.tests);
    console.log('Test Execution:', result.testExecution);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
```

---

## Features

### Automated Test Type
Tests are created as **Automated** type in Xray, suitable for:
- **API Testing:** REST/SOAP API automation (Postman, RestAssured, SoapUI)
- **UI Testing:** Web and mobile automation (Selenium, Cypress, Playwright, Appium)
- **Integration Testing:** System integration and end-to-end test suites
- **Performance Testing:** Load and stress testing scenarios
- **Database Testing:** SQL validation and data integrity checks
- **Security Testing:** Vulnerability scans and penetration test cases
- **Any Automated Framework:** Compatible with any test automation tool

### Robust Error Handling
- Detailed error messages with GraphQL error details
- Continues processing remaining tests on individual failures
- Saves mapping after each successful test creation
- Comprehensive logging for debugging
- Exponential backoff for API rate limiting

### Enterprise-Ready
- Works with corporate proxies
- Supports Xray Cloud data residency (US/EU/AU)
- Rate limiting compliant (300 requests per 5 minutes)
- Secure credential management via environment variables
- TypeScript support for type safety
```

---

## Phase 2: Enhanced Configuration (Week 2)

### Step 2.1: Add Configuration Override Support

**File: `index.js` (Enhanced version)**

```javascript
/**
 * Get configuration from environment or options
 */
function getConfig(options = {}) {
  return {
    jira: {
      url: options.jira?.url || process.env.JIRA_URL,
      email: options.jira?.email || process.env.JIRA_EMAIL,
      token: options.jira?.token || process.env.JIRA_API_TOKEN
    },
    xray: {
      clientId: options.xray?.clientId || process.env.XRAY_CLIENT_ID || process.env.XRAY_ID,
      clientSecret: options.xray?.clientSecret || process.env.XRAY_CLIENT_SECRET || process.env.XRAY_SECRET,
      region: options.xray?.region || 'us'
    },
    projectKey: options.projectKey || process.env.JIRA_PROJECT_KEY
  };
}

/**
 * Get GraphQL URL based on region
 */
function getGraphQLUrl(region = 'us') {
  const urls = {
    us: 'https://us.xray.cloud.getxray.app/api/v2/graphql',
    eu: 'https://eu.xray.cloud.getxray.app/api/v2/graphql',
    au: 'https://au.xray.cloud.getxray.app/api/v2/graphql'
  };
  return process.env.XRAY_GRAPHQL_URL || urls[region] || urls.us;
}

/**
 * Enhanced createJiraTestIssue with config override
 */
async function createJiraTestIssue(test, options = {}) {
  const config = getConfig(options);
  const auth = Buffer.from(`${config.jira.email}:${config.jira.token}`).toString('base64');
  const headers = {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json"
  };

  const adfDescription = {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: test.xray.description || "" }]
      }
    ]
  };

  const payload = {
    fields: {
      project: { key: config.projectKey },
      summary: test.xray.summary,
      description: adfDescription,
      issuetype: { name: "Test" },
      priority: test.xray.priority ? { name: test.xray.priority } : undefined,
      labels: test.xray.labels || []
    }
  };

  const response = await axios.post(
    `${config.jira.url}/rest/api/3/issue`,
    payload,
    { httpsAgent, headers }
  );

  return response.data;
}
```

### Step 2.2: Add Multi-Project Support

**File: `examples/multi-project.js`**

```javascript
require('dotenv').config();
const { createTestsAndExecution } = require('@xray-tools/test-automation');

async function createTestsForMultipleProjects() {
  const projects = ['PROJ1', 'PROJ2', 'PROJ3'];
  
  for (const projectKey of projects) {
    console.log(`\n📦 Creating tests for project: ${projectKey}\n`);
    
    const config = {
      projectKey, // Override project key
      testExecution: {
        summary: `${projectKey} - Sprint 24 Tests`,
        description: `Automated tests for ${projectKey}`
      },
      tests: [
        {
          test_id: `${projectKey}-TC-001`,
          xray: {
            summary: "Verify API endpoint",
            priority: "High",
            labels: ["API", "Smoke"]
          }
        }
      ]
    };
    
    try {
      const result = await createTestsAndExecution(config);
      console.log(`✅ ${projectKey}: Created ${result.tests.length} tests`);
    } catch (error) {
      console.error(`❌ ${projectKey}: ${error.message}`);
    }
  }
}

createTestsForMultipleProjects();
```

---

## Phase 3: New Features (Weeks 3-6)

### Step 3.1: Test Sets Support

**File: `lib/testSets.js`**

```javascript
const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Create a Test Set in JIRA
 */
async function createTestSet(summary, description, options = {}) {
  const config = require('./config').getConfig(options);
  const auth = Buffer.from(`${config.jira.email}:${config.jira.token}`).toString('base64');
  const headers = {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json"
  };

  const adfDescription = {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: description || "" }]
      }
    ]
  };

  const payload = {
    fields: {
      project: { key: config.projectKey },
      summary: summary,
      description: adfDescription,
      issuetype: { name: "Test Set" }
    }
  };

  const response = await axios.post(
    `${config.jira.url}/rest/api/3/issue`,
    payload,
    { httpsAgent, headers }
  );

  return {
    key: response.data.key,
    id: response.data.id
  };
}

/**
 * Add tests to a Test Set using GraphQL
 */
async function addTestsToTestSet(xrayToken, testSetId, testIds, options = {}) {
  const config = require('./config').getConfig(options);
  const graphqlUrl = require('./config').getGraphQLUrl(config.xray.region);
  
  const headers = {
    Authorization: `Bearer ${xrayToken}`,
    "Content-Type": "application/json"
  };

  const mutation = `
    mutation($issueId: String!, $testIssueIds: [String]!) {
      addTestsToTestSet(issueId: $issueId, testIssueIds: $testIssueIds) {
        addedTests
        warning
      }
    }
  `;

  const response = await axios.post(
    graphqlUrl,
    {
      query: mutation,
      variables: {
        issueId: testSetId,
        testIssueIds: testIds
      }
    },
    { httpsAgent, headers }
  );

  if (response.data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
  }

  return response.data.data.addTestsToTestSet;
}

module.exports = {
  createTestSet,
  addTestsToTestSet
};
```

### Step 3.2: Preconditions Support

**File: `lib/preconditions.js`**

```javascript
const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Create a Precondition in JIRA
 */
async function createPrecondition(precondition, options = {}) {
  const config = require('./config').getConfig(options);
  const auth = Buffer.from(`${config.jira.email}:${config.jira.token}`).toString('base64');
  const headers = {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json"
  };

  const adfDescription = {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: precondition.description || "" }]
      }
    ]
  };

  const payload = {
    fields: {
      project: { key: config.projectKey },
      summary: precondition.summary,
      description: adfDescription,
      issuetype: { name: "Precondition" }
    }
  };

  const response = await axios.post(
    `${config.jira.url}/rest/api/3/issue`,
    payload,
    { httpsAgent, headers }
  );

  const issueId = response.data.id;
  const key = response.data.key;

  // Add steps if provided
  if (precondition.steps && precondition.steps.length > 0) {
    const xrayToken = await require('./index').getXrayToken(options);
    await setPreConditionSteps(xrayToken, issueId, precondition.steps, options);
  }

  return { key, id: issueId };
}

/**
 * Add steps to a Precondition using GraphQL
 */
async function setPreConditionSteps(xrayToken, issueId, steps, options = {}) {
  const config = require('./config').getConfig(options);
  const graphqlUrl = require('./config').getGraphQLUrl(config.xray.region);
  
  const headers = {
    Authorization: `Bearer ${xrayToken}`,
    "Content-Type": "application/json"
  };

  for (const step of steps) {
    const mutation = `
      mutation($issueId: String!, $step: CreateStepInput!) {
        addPreConditionStep(issueId: $issueId, step: $step) {
          id
          action
        }
      }
    `;

    const response = await axios.post(
      graphqlUrl,
      {
        query: mutation,
        variables: {
          issueId: issueId,
          step: {
            action: step.action,
            data: step.data,
            result: step.expected_result
          }
        }
      },
      { httpsAgent, headers }
    );

    if (response.data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
    }
  }
}

/**
 * Link precondition to tests using GraphQL
 */
async function linkPreconditionToTests(xrayToken, preconditionId, testIds, options = {}) {
  const config = require('./config').getConfig(options);
  const graphqlUrl = require('./config').getGraphQLUrl(config.xray.region);
  
  const headers = {
    Authorization: `Bearer ${xrayToken}`,
    "Content-Type": "application/json"
  };

  const mutation = `
    mutation($issueId: String!, $preConditionIssueIds: [String]!) {
      addPreConditionsToTest(issueId: $issueId, preConditionIssueIds: $preConditionIssueIds) {
        addedPreConditions
        warning
      }
    }
  `;

  for (const testId of testIds) {
    const response = await axios.post(
      graphqlUrl,
      {
        query: mutation,
        variables: {
          issueId: testId,
          preConditionIssueIds: [preconditionId]
        }
      },
      { httpsAgent, headers }
    );

    if (response.data.errors) {
      console.error(`Failed to link precondition to ${testId}:`, response.data.errors);
    }
  }
}

module.exports = {
  createPrecondition,
  linkPreconditionToTests
};
```

### Step 3.3: Usage Examples

**File: `examples/test-sets.js`**

```javascript
require('dotenv').config();
const { getXrayToken } = require('@xray-tools/test-automation');
const { createTestSet, addTestsToTestSet } = require('@xray-tools/test-automation/lib/testSets');

async function createAuthTestSet() {
  // Authenticate
  const xrayToken = await getXrayToken();
  
  // Create test set
  const testSet = await createTestSet(
    "Authentication Test Suite",
    "All tests related to user authentication"
  );
  
  console.log(`✅ Created Test Set: ${testSet.key}`);
  
  // Add tests to set (assuming tests already exist)
  const testIds = ["12345", "12346", "12347"]; // Numeric IDs
  const result = await addTestsToTestSet(xrayToken, testSet.id, testIds);
  
  console.log(`✅ Added ${result.addedTests.length} tests to Test Set`);
}

createAuthTestSet();
```

**File: `examples/preconditions.js`**

```javascript
require('dotenv').config();
const { getXrayToken } = require('@xray-tools/test-automation');
const { createPrecondition, linkPreconditionToTests } = require('@xray-tools/test-automation/lib/preconditions');

async function createLoginPrecondition() {
  // Create precondition with steps
  const precondition = await createPrecondition({
    summary: "User must be logged in",
    description: "User has a valid session",
    steps: [
      {
        action: "Navigate to login page",
        data: "URL: /login",
        expected_result: "Login form is displayed"
      },
      {
        action: "Enter valid credentials",
        data: "user@example.com / password123",
        expected_result: "User is logged in successfully"
      }
    ]
  });
  
  console.log(`✅ Created Precondition: ${precondition.key}`);
  
  // Link to tests
  const xrayToken = await getXrayToken();
  await linkPreconditionToTests(
    xrayToken,
    precondition.id,
    ["12345", "12346"] // Test IDs that require login
  );
  
  console.log(`✅ Linked precondition to tests`);
}

createLoginPrecondition();
```

---

## Phase 4: CI/CD Examples (Week 7)

### GitHub Actions

**File: `.github/workflows/xray-sync.yml`**

```yaml
name: Sync Tests to Xray

on:
  push:
    branches: [main]
    paths:
      - 'tests.json'
      - 'tests/**/*.spec.js'

jobs:
  sync-xray:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install @xray-tools/test-automation
        
      - name: Create .env file
        run: |
          echo "XRAY_CLIENT_ID=${{ secrets.XRAY_CLIENT_ID }}" >> .env
          echo "XRAY_CLIENT_SECRET=${{ secrets.XRAY_CLIENT_SECRET }}" >> .env
          echo "JIRA_PROJECT_KEY=${{ secrets.JIRA_PROJECT_KEY }}" >> .env
          echo "JIRA_URL=${{ secrets.JIRA_URL }}" >> .env
          echo "JIRA_API_TOKEN=${{ secrets.JIRA_API_TOKEN }}" >> .env
          echo "JIRA_EMAIL=${{ secrets.JIRA_EMAIL }}" >> .env
          
      - name: Create Xray Tests
        run: node create-xray-tests.js
        
      - name: Upload test mapping
        uses: actions/upload-artifact@v3
        with:
          name: xray-mapping
          path: xray-mapping.json
```

### GitLab CI

**File: `.gitlab-ci.yml`**

```yaml
stages:
  - test
  - sync

sync-xray:
  stage: sync
  image: node:18
  only:
    changes:
      - tests.json
      - tests/**/*.spec.js
  script:
    - npm install @xray-tools/test-automation
    - |
      cat > .env << EOF
      XRAY_CLIENT_ID=${XRAY_CLIENT_ID}
      XRAY_CLIENT_SECRET=${XRAY_CLIENT_SECRET}
      JIRA_PROJECT_KEY=${JIRA_PROJECT_KEY}
      JIRA_URL=${JIRA_URL}
      JIRA_API_TOKEN=${JIRA_API_TOKEN}
      JIRA_EMAIL=${JIRA_EMAIL}
      EOF
    - node create-xray-tests.js
  artifacts:
    paths:
      - xray-mapping.json
    expire_in: 30 days
```

### Jenkins

**File: `Jenkinsfile`**

```groovy
pipeline {
    agent any
    
    environment {
        XRAY_CLIENT_ID = credentials('xray-client-id')
        XRAY_CLIENT_SECRET = credentials('xray-client-secret')
        JIRA_API_TOKEN = credentials('jira-api-token')
        JIRA_EMAIL = credentials('jira-email')
        JIRA_URL = 'https://your-company.atlassian.net'
        JIRA_PROJECT_KEY = 'PROJ'
    }
    
    stages {
        stage('Install') {
            steps {
                sh 'npm install @xray-tools/test-automation'
            }
        }
        
        stage('Sync to Xray') {
            when {
                changeset "tests.json"
            }
            steps {
                sh '''
                    cat > .env << EOF
XRAY_CLIENT_ID=${XRAY_CLIENT_ID}
XRAY_CLIENT_SECRET=${XRAY_CLIENT_SECRET}
JIRA_PROJECT_KEY=${JIRA_PROJECT_KEY}
JIRA_URL=${JIRA_URL}
JIRA_API_TOKEN=${JIRA_API_TOKEN}
JIRA_EMAIL=${JIRA_EMAIL}
EOF
                    node create-xray-tests.js
                '''
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'xray-mapping.json', allowEmptyArchive: true
        }
    }
}
```

---

## Phase 5: Publishing (Week 8)

### Step 5.1: Prepare for npm

```bash
# 1. Create npm account
npm adduser

# 2. Test package locally
npm pack
npm install ./xray-tools-test-automation-1.0.0.tgz

# 3. Publish to npm
npm publish --access public
```

### Step 5.2: Create GitHub Repository

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: Generalized Xray test automation"

# Create GitHub repo (via GitHub CLI or web)
gh repo create xray-test-automation --public --source=. --remote=origin

# Push to GitHub
git push -u origin main
```

### Step 5.3: Add GitHub Actions for CI

**File: `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linter
        run: npm run lint
```

---

## Summary Checklist

### Week 1: Generalization
- [ ] Rename package to `@xray-tools/test-automation`
- [ ] Add TypeScript definitions (`index.d.ts`)
- [ ] Update `.env.example` with generic examples
- [ ] Rewrite README introduction
- [ ] Remove all Old Mutual references

### Week 2: Enhanced Configuration
- [ ] Add configuration override support
- [ ] Add multi-project example
- [ ] Add region-based GraphQL URL selection
- [ ] Update all functions to accept options parameter

### Weeks 3-6: New Features
- [ ] Implement Test Sets support
- [ ] Implement Preconditions support
- [ ] Add Requirements linking
- [ ] Create usage examples for each feature

### Week 7: CI/CD Integration
- [ ] Add GitHub Actions example
- [ ] Add GitLab CI example
- [ ] Add Jenkins example
- [ ] Add Azure DevOps example

### Week 8: Publishing
- [ ] Create npm account
- [ ] Test package locally
- [ ] Publish to npm
- [ ] Create GitHub repository
- [ ] Set up CI/CD for the package itself

---

## Next Steps

1. **Start with Week 1** - Focus on generalization first
2. **Get feedback** - Share with 2-3 beta users
3. **Iterate** - Based on feedback, prioritize features
4. **Launch** - Publish to npm and announce on social media

**Estimated Timeline:** 8 weeks to v1.0.0 with core features

Good luck! 🚀
