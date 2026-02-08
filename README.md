# @oldmutual/xray-test-automation

> **Automated Xray test case creation and execution management for Old Mutual JIRA projects.**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](package.json)
[![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)](package.json)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Creating Tests](#creating-tests)
  - [Programmatic Usage](#programmatic-usage)
  - [CI/CD Pipeline Integration](#cicd-pipeline-integration)
- [Test Configuration Schema](#test-configuration-schema)
- [Output Files](#output-files)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Publishing](#publishing)
- [Support](#support)

---

## Overview

This package provides automated creation and management of Xray test cases within Old Mutual's JIRA ecosystem. It is designed for **all teams across Old Mutual** who need to manage test cases efficiently, supporting both automated testing workflows and manual test documentation.

**What it does:**
- ✅ Creates Xray **Automated** Test cases in JIRA
- ✅ Adds detailed test steps with actions, data, and expected results
- ✅ Creates Test Executions for organizing test runs
- ✅ Links tests to executions automatically
- ✅ Generates test-to-JIRA key mappings for CI/CD integration
- ✅ Saves mapping incrementally to prevent data loss
- ✅ Supports bulk test creation with error handling

**Use cases across Old Mutual:**
- **API Teams:** Creating test cases from API specifications (OpenAPI/Swagger)
- **QA Teams:** Synchronizing automated UI/functional test suites with Xray
- **DevOps Teams:** Managing test executions across multiple releases and environments
- **Product Teams:** Documenting acceptance criteria as executable tests
- **Integration Teams:** Creating integration and end-to-end test scenarios
- **Security Teams:** Documenting security test cases and compliance checks
- **Data Teams:** Creating data validation and ETL test cases
- **All Teams:** CI/CD pipeline integration and test coverage tracking

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

### Enterprise-Ready
- Works with Old Mutual's corporate proxy
- Supports Xray Cloud data residency (US/EU/AU)
- Rate limiting compliant (300 requests per 5 minutes)
- Secure credential management via environment variables

---

## Prerequisites

| Requirement | Version | Purpose |
|------------|---------|---------|
| **Node.js** | >= 18.0.0 | Runtime environment |
| **npm** | >= 8.0.0 | Package manager |
| **Xray API Key** | - | Authentication for Xray GraphQL API |
| **JIRA API Token** | - | Authentication for JIRA REST API |
| **JIRA Permissions** | Test creation rights | Create Test and Test Execution issues |

### Obtaining Credentials

⚠️ **CRITICAL REQUIREMENT:** All credentials must be created by the **same JIRA user**. The Xray API Key owner must match the JIRA API Token owner.

#### Xray API Key (Client ID & Secret)
1. **Log in to JIRA** with the account you'll use for automation
2. Navigate to JIRA → ⚙️ Settings → Apps → Xray Settings
3. Go to **API Keys** (Global Settings)
4. Click **Create API Key**
5. Save the **Client ID** and **Client Secret**
6. **Remember:** Note which user created this key

#### JIRA API Token
1. **Stay logged in as the same user** from above
2. Go to [Atlassian Account Security](https://id.atlassian.com/manage-profile/security/api-tokens)
3. Click **Create API token**
4. Give it a label (e.g., "Xray Automation")
5. Copy and securely save the token
6. **Note the email** of the logged-in user

#### Verify User Match
Both credentials should be from the same user:
```
✅ Xray API Key created by: john.doe@oldmutual.com
✅ JIRA API Token created by: john.doe@oldmutual.com
✅ JIRA_EMAIL in .env: john.doe@oldmutual.com
```

---

## Installation

### From Old Mutual Azure Artifacts Registry

```bash
npm install @oldmutual/xray-test-automation
```

### For Development / Local Testing

```bash
git clone https://dev.azure.com/OMEngineering/API%20COE/_git/xray-test-generator
cd xray-test-generator
npm install
```

---

## Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Credentials

Edit `.env` with your credentials:

```env
# Xray Cloud API Credentials
XRAY_ID="your_xray_client_id_here"
XRAY_SECRET="your_xray_client_secret_here"

# Optional: Xray GraphQL endpoint region (us/eu/au) - defaults to US
# XRAY_GRAPHQL_URL="https://us.xray.cloud.getxray.app/api/v2/graphql"

# JIRA Project Configuration
JIRA_PROJECT_KEY=APIEE

# JIRA Authentication
JIRA_URL="https://oldmutual.atlassian.net"
JIRA_API_TOKEN="your_jira_api_token_here"
JIRA_EMAIL="your.email@oldmutual.com"
```

### 3. Configuration for Data Residency

If your Xray instance uses data residency in EU or Australia:

```env
# For EU
XRAY_GRAPHQL_URL="https://eu.xray.cloud.getxray.app/api/v2/graphql"

# For Australia
XRAY_GRAPHQL_URL="https://au.xray.cloud.getxray.app/api/v2/graphql"
```

### 4. Security Best Practices

⚠️ **NEVER commit `.env` to version control**

The `.npmignore` and `.gitignore` files are preconfigured to exclude credentials.

---

## Usage

### Creating Tests

#### 1. Define Tests in JSON

Create `tests.json` in your project root:

```json
{
  "testExecution": {
    "summary": "Customer Portal - Sprint 24 Automated Tests",
    "description": "Automated test suite covering login, profile management, and search functionality"
  },
  "tests": [
    {
      "test_id": "TC-LOGIN-001",
      "xray": {
        "summary": "Verify successful user login with valid credentials",
        "description": "Test that users can log in successfully using valid username and password",
        "priority": "High",
        "labels": ["Login", "Authentication", "UI", "Smoke"],
        "steps": [
          {
            "action": "Navigate to login page",
            "data": "URL: https://portal.oldmutual.com/login",
            "expected_result": "Login page is displayed with username and password fields"
          },
          {
            "action": "Enter valid username and password",
            "data": "Username: testuser@oldmutual.com, Password: ValidPass123",
            "expected_result": "Credentials are accepted"
          },
          {
            "action": "Click Login button",
            "data": "Button: Submit",
            "expected_result": "User is redirected to dashboard with welcome message"
          }
        ]
      }
    },
    {
      "test_id": "TC-SEARCH-001",
      "xray": {
        "summary": "Verify search returns relevant results",
        "description": "Test that search functionality returns accurate results for customer queries",
        "priority": "Medium",
        "labels": ["Search", "Functional", "UI"],
        "steps": [
          {
            "action": "Enter search term in search box",
            "data": "Search term: 'life insurance'",
            "expected_result": "Search suggestions appear as user types"
          },
          {
            "action": "Click search button",
            "data": "Button: Search",
            "expected_result": "Results page displays with relevant matches"
          }
        ]
      }
    }
  ]
}
```

#### 2. Run the Script

```bash
npm start
# or
npm run create
```

#### 3. View Results

```
🚀 Old Mutual Xray Test Automation

📋 Creating 2 test(s)...

📤 TC-LOGIN-001
   ✅ PROJ-1234
   ✅ 3 step(s) added

📤 TC-SEARCH-001
   ✅ PROJ-1235
   ✅ 2 step(s) added

✅ Created 2/2 test(s)

📌 Creating Test Execution: "Customer Portal - Sprint 24 Automated Tests"...
   ✅ PROJ-1240

⏳ Waiting for Xray to index tests...

🔗 Linking 2 test(s) to Test Execution...
   ✅ 2 test(s) linked

💾 Test mapping saved to xray-mapping.json

🔗 View Test Execution: https://oldmutual.atlassian.net/browse/PROJ-1240
```

---

### Programmatic Usage

#### Import and Use in Your Code

```javascript
require('dotenv').config();
const { createTestsAndExecution } = require('@oldmutual/xray-test-automation');
const fs = require('fs');

async function createTests() {
  const config = JSON.parse(fs.readFileSync('tests.json', 'utf8'));
  
  try {
    const result = await createTestsAndExecution(config);
    
    console.log('✅ Created tests:', result.tests);
    console.log('✅ Test Execution:', result.testExecution);
    console.log('✅ Mapping:', result.mapping);
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTests();
```

#### Use Individual Functions

```javascript
require('dotenv').config();
const {
  createJiraTestIssue,
  createTestExecution,
  linkTestsToExecution,
  getXrayToken
} = require('@oldmutual/xray-test-automation');

async function customWorkflow() {
  // Authenticate once
  const xrayToken = await getXrayToken();
  
  // Create individual test
  const test = await createJiraTestIssue({
    xray: {
      summary: "Verify user login endpoint",
      description: "Test POST /api/auth/login with valid credentials",
      priority: "Critical",
      labels: ["Auth", "API", "Security"]
    }
  });
  console.log('Test created:', test.key);

  // Create execution
  const execution = await createTestExecution(
    "Authentication Tests - Sprint 24",
    "Automated tests for auth endpoints"
  );
  console.log('Execution created:', execution.key);

  // Link
  const linked = await linkTestsToExecution(execution.key, [test.key]);
  console.log('Linked tests:', linked);
}

customWorkflow();
```

---

### CI/CD Pipeline Integration

#### Azure DevOps Pipeline Example

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  - group: xray-credentials  # Variable group containing XRAY_ID, XRAY_SECRET, JIRA_API_TOKEN

stages:
  - stage: CreateXrayTests
    displayName: 'Create Xray Test Cases'
    jobs:
      - job: SyncTests
        displayName: 'Sync Tests to Xray'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '18.x'
            displayName: 'Install Node.js'

          - script: |
              npm install @oldmutual/xray-test-automation
            displayName: 'Install Xray Automation Package'

          - script: |
              echo "XRAY_ID=$(XRAY_ID)" >> .env
              echo "XRAY_SECRET=$(XRAY_SECRET)" >> .env
              echo "JIRA_PROJECT_KEY=APIEE" >> .env
              echo "JIRA_URL=https://oldmutual.atlassian.net" >> .env
              echo "JIRA_API_TOKEN=$(JIRA_API_TOKEN)" >> .env
              echo "JIRA_EMAIL=$(JIRA_EMAIL)" >> .env
            displayName: 'Create .env file'

          - script: |
              node create-xray-tests.js
            displayName: 'Create Xray Tests'

          - task: PublishBuildArtifacts@1
            inputs:
              PathtoPublish: 'xray-mapping.json'
              ArtifactName: 'xray-mapping'
            displayName: 'Publish Test Mapping'
```

#### GitHub Actions Example

```yaml
name: Sync Tests to Xray

on:
  push:
    branches: [main]
    paths:
      - 'tests.json'

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
        run: npm install @oldmutual/xray-test-automation
        
      - name: Create .env file
        run: |
          echo "XRAY_ID=${{ secrets.XRAY_ID }}" >> .env
          echo "XRAY_SECRET=${{ secrets.XRAY_SECRET }}" >> .env
          echo "JIRA_PROJECT_KEY=APIEE" >> .env
          echo "JIRA_URL=https://oldmutual.atlassian.net" >> .env
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

---

## Test Configuration Schema

### Complete Test Object Structure

```typescript
interface TestConfig {
  testExecution?: {
    summary: string;          // Test Execution title
    description?: string;     // Test Execution description
  };
  tests: Array<{
    test_id: string;         // Your internal test ID (for mapping)
    xray: {
      summary: string;        // Test case title (required)
      description?: string;   // Test case description
      priority?: "Highest" | "High" | "Medium" | "Low" | "Lowest"; // JIRA priority
      labels?: string[];      // JIRA labels for categorization
      steps?: Array<{
        action: string;         // What to do
        data?: string;          // Test data or parameters
        expected_result: string; // Expected outcome
      }>;
    };
  }>;
}
```

### Field Descriptions

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `test_id` | string | Yes | Unique identifier for mapping | `"TC-API-001"` |
| `xray.summary` | string | Yes | Test case title in JIRA | `"Verify user login"` |
| `xray.description` | string | No | Detailed description | `"Test POST /api/auth/login..."` |
| `xray.priority` | string | No | JIRA priority level | `"High"` |
| `xray.labels` | string[] | No | JIRA labels for organization | `["API", "Auth"]` |
| `xray.steps` | array | No | Test steps (if omitted, test has no steps) | See below |
| `step.action` | string | Yes* | Action to perform | `"Send GET request"` |
| `step.data` | string | No | Test data/parameters | `"clientNo=123456789"` |
| `step.expected_result` | string | Yes* | Expected outcome | `"Returns 200 OK"` |

*Required if `steps` array is provided

---

## Output Files

### xray-mapping.json

Generated after each test creation. Maps your test IDs to JIRA keys and numeric IDs:

```json
{
  "_testexecution": {
    "key": "PROJ-1240",
    "id": "1234567"
  },
  "TC-LOGIN-001": {
    "key": "PROJ-1234",
    "id": "1234560"
  },
  "TC-SEARCH-001": {
    "key": "PROJ-1235",
    "id": "1234561"
  },
  "TC-PROFILE-001": {
    "key": "PROJ-1236",
    "id": "1234562"
  },
  "TC-CHECKOUT-001": {
    "key": "PROJ-1237",
    "id": "1234563"
  }
}
```

**Usage in CI/CD:**

```javascript
const mapping = require('./xray-mapping.json');

// Get JIRA key and ID for a specific test
const testInfo = mapping['TC-LOGIN-001'];
console.log(`Test key: ${testInfo.key}`); // PROJ-1234
console.log(`Test ID: ${testInfo.id}`);   // 1234560

// Get Test Execution key and ID
const executionInfo = mapping._testexecution;
console.log(`Execution key: ${executionInfo.key}`); // PROJ-1240
console.log(`Execution ID: ${executionInfo.id}`);   // 1234567
```

**Why it's useful:**
- Update test execution results programmatically
- Link test artifacts (screenshots, logs, videos)
- Track test coverage across releases
- Generate test reports with JIRA references

---

## API Reference

### Exported Functions

The package exports the following functions for programmatic use:

#### `createTestsAndExecution(config)`

Creates all tests and a test execution, then links them together.

**Parameters:**
- `config` (Object): Test configuration object
  - `config.tests` (Array): Array of test definitions
  - `config.testExecution` (Object): Test execution configuration

**Returns:** `Promise<Object>`
```javascript
{
  tests: string[],        // Array of created test keys: ["APIEE-6895", "APIEE-6896"]
  testExecution: string,  // Test execution key: "APIEE-6900"
  mapping: Object        // Complete test ID to JIRA key mapping
}
```

**Example:**
```javascript
const { createTestsAndExecution } = require('@oldmutual/xray-test-automation');

const result = await createTestsAndExecution({
  testExecution: {
    summary: "Sprint 24 - API Tests",
    description: "Automated API regression suite"
  },
  tests: [
    {
      test_id: "TC-001",
      xray: {
        summary: "Test user login",
        priority: "High",
        labels: ["Auth", "API"]
      }
    }
  ]
});

console.log(result.tests);         // ["APIEE-7001"]
console.log(result.testExecution); // "APIEE-7010"
```

---

#### `createJiraTestIssue(test)`

Creates a single Xray Test issue in JIRA.

**Parameters:**
- `test` (Object): Test definition object with `xray` property

**Returns:** `Promise<Object>`
```javascript
{
  key: string,    // JIRA issue key: "APIEE-6895"
  id: string      // JIRA issue ID: "12345"
}
```

**Example:**
```javascript
const { createJiraTestIssue } = require('@oldmutual/xray-test-automation');

const test = await createJiraTestIssue({
  xray: {
    summary: "Verify POST /api/users creates user",
    description: "Test user creation endpoint",
    priority: "High",
    labels: ["API", "Users", "POST"]
  }
});

console.log(`Created test: ${test.key}`); // APIEE-6895
```

---

#### `createTestExecution(summary, description)`

Creates a Test Execution issue in JIRA.

**Parameters:**
- `summary` (string): Test Execution title
- `description` (string): Test Execution description

**Returns:** `Promise<Object>`
```javascript
{
  key: string,    // Test Execution key: "APIEE-6900"
  id: string      // Test Execution ID: "12350"
}
```

**Example:**
```javascript
const { createTestExecution } = require('@oldmutual/xray-test-automation');

const execution = await createTestExecution(
  "Sprint 24 - Authentication Tests",
  "Automated tests for auth endpoints including login, logout, and token refresh"
);

console.log(`Created execution: ${execution.key}`); // APIEE-6900
```

---

#### `linkTestsToExecution(testExecutionKey, testKeys)`

Links existing tests to a test execution.

**Parameters:**
- `testExecutionKey` (string): JIRA key of the Test Execution
- `testKeys` (string[]): Array of test JIRA keys to link

**Returns:** `Promise<string[]>` - Array of successfully linked test keys

**Example:**
```javascript
const { linkTestsToExecution } = require('@oldmutual/xray-test-automation');

const linked = await linkTestsToExecution(
  "APIEE-6900",
  ["APIEE-6895", "APIEE-6896", "APIEE-6897"]
);

console.log(`Linked ${linked.length} tests`); // Linked 3 tests
```

---

#### `getXrayToken()`

Authenticates with Xray Cloud and returns a JWT token.

**Parameters:** None (uses environment variables)

**Returns:** `Promise<string>` - JWT token for Xray GraphQL API

**Example:**
```javascript
const { getXrayToken } = require('@oldmutual/xray-test-automation');

const token = await getXrayToken();
console.log('Authenticated with Xray'); 
// Use token for custom GraphQL queries
```

---

## Examples

### Example 1: Create Tests from Test Scenarios Document

```javascript
require('dotenv').config();
const { createTestsAndExecution } = require('@oldmutual/xray-test-automation');
const fs = require('fs');

// Example: Generate tests from a CSV or formatted document
async function generateTestsFromDocument() {
  const scenarios = [
    {
      id: 'TC-QUOTE-001',
      summary: 'Calculate life insurance quote for age 30-40',
      priority: 'High',
      category: 'Quotes',
      steps: [
        { action: 'Enter customer age: 35', data: 'Age: 35', expected: 'Age accepted' },
        { action: 'Select product: Life Cover', data: 'Product: Life', expected: 'Product selected' },
        { action: 'Enter coverage amount: R1,000,000', data: 'Amount: 1000000', expected: 'Amount validated' },
        { action: 'Click Calculate Quote', data: 'Button: Calculate', expected: 'Quote displayed with monthly premium' }
      ]
    },
    {
      id: 'TC-CLAIM-001',
      summary: 'Submit death claim with required documents',
      priority: 'Critical',
      category: 'Claims',
      steps: [
        { action: 'Navigate to claims section', data: 'Menu: Claims', expected: 'Claims page displayed' },
        { action: 'Upload death certificate', data: 'File: certificate.pdf', expected: 'Document uploaded successfully' },
        { action: 'Complete beneficiary details', data: 'Name, ID, Bank details', expected: 'Details saved' },
        { action: 'Submit claim', data: 'Button: Submit', expected: 'Claim reference number generated' }
      ]
    }
  ];
  
  const tests = scenarios.map(scenario => ({
    test_id: scenario.id,
    xray: {
      summary: scenario.summary,
      priority: scenario.priority,
      labels: [scenario.category, 'Automated', 'Regression'],
      steps: scenario.steps.map(step => ({
        action: step.action,
        data: step.data,
        expected_result: step.expected
      }))
    }
  }));
  
  const result = await createTestsAndExecution({
    testExecution: {
      summary: 'Business Scenarios - Sprint 24',
      description: 'Automated tests for core business workflows'
    },
    tests
  });
  
  console.log(`Created ${result.tests.length} tests from scenarios`);
}

generateTestsFromDocument();
```

---

### Example 2: Bulk Update Test Statuses (After Test Run)

```javascript
require('dotenv').config();
const axios = require('axios');
const mapping = require('./xray-mapping.json');

async function updateTestResults(testResults) {
  const auth = Buffer.from(
    `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
  ).toString('base64');
  
  for (const [testId, result] of Object.entries(testResults)) {
    const testInfo = mapping[testId];
    if (!testInfo) continue;
    
    // Update test run status via Xray REST API
    await axios.post(
      `${process.env.JIRA_URL}/rest/raven/2.0/import/execution`,
      {
        testExecutionKey: mapping._testexecution.key,
        tests: [{
          testKey: testInfo.key,
          status: result.status,  // PASS, FAIL, EXECUTING, etc.
          comment: result.error || ''
        }]
      },
      {
        headers: { Authorization: `Basic ${auth}` }
      }
    );
    
    console.log(`✅ Updated ${testInfo.key}: ${result.status}`);
  }
}

// Example usage - works with any test framework results
updateTestResults({
  "TC-LOGIN-001": { status: "PASS", error: "" },
  "TC-SEARCH-001": { status: "PASS", error: "" },
  "TC-QUOTE-001": { status: "FAIL", error: "Premium calculation mismatch" }
});
```

---

### Example 3: Create Tests for Existing Playwright Suite

```javascript
require('dotenv').config();
const { createTestsAndExecution } = require('@oldmutual/xray-test-automation');
const fs = require('fs');
const path = require('path');

async function syncPlaywrightTests() {
  const testFiles = fs.readdirSync('./tests')
    .filter(f => f.endsWith('.spec.ts'));
  
  const tests = testFiles.map(file => {
    const content = fs.readFileSync(`./tests/${file}`, 'utf8');
    const testName = path.basename(file, '.spec.ts');
    
    // Extract test.describe blocks (simple regex example)
    const describes = content.match(/test\.describe\(['"`](.+?)['"`]/g) || [];
    
    return {
      test_id: `TC-${testName}`,
      xray: {
        summary: describes[0]?.replace(/test\.describe\(['"`]|['"`]/g, '') || testName,
        description: `Automated Playwright test: ${file}`,
        labels: ["Playw', 'UI", "Automated"],
        priority: "Medium"
      }
    };
  });
  
  const result = await createTestsAndExecution({
    testExecution: {
      summary: "Playwright UI Test Suite",
      description: "Automated UI tests using Playwright framework"
    },
    tests
  });
  
  console.log(`Synced ${result.tests.length} Playwright tests to Xray`);
}

syncPlaywrightTests();
```

---

## Troubleshooting

### Authentication Errors

**Error:** `Incorrect or missing password` or `401 Unauthorized`

**Solutions:**
1. Verify `.env` file exists and has correct values
2. Ensure `XRAY_ID` and `XRAY_SECRET` are from Xray API Keys (not JIRA credentials)
3. Ensure `JIRA_API_TOKEN` is an API token, not your password
4. Check `JIRA_EMAIL` matches your Atlassian account email
5. Regenerate API tokens if they're old or compromised

---

### User Authentication Mismatch (Xray Impersonation Error)

**Error:** `Add-on 'com.xblend.plugins.xray-enterprise' disallowed to impersonate the user because 'no valid active user exists'`

**Cause:** The Xray API Key owner doesn't match the JIRA API Token user.

**Solutions:**

1. **Verify User Match:**
   ```bash
   # Check who owns the Xray API Key
   # In JIRA: Settings → Apps → Xray Settings → API Keys
   # The listed user MUST match your JIRA_EMAIL in .env
   ```

2. **Ensure Same User for All Credentials:**
   - `XRAY_ID` + `XRAY_SECRET`: Created by User A
   - `JIRA_API_TOKEN`: Created by **same User A**
   - `JIRA_EMAIL`: Email of **same User A**

3. **Check Xray License Assignment:**
   - Verify you have an active Xray license assigned
   - Contact your JIRA administrator if not

4. **Regenerate Credentials (Recommended):**
   ```
   Step 1: Log in to JIRA as the user who will run the automation
   Step 2: Create Xray API Key (Settings → Apps → Xray Settings → API Keys)
   Step 3: Create JIRA API Token (https://id.atlassian.com/manage-profile/security/api-tokens)
   Step 4: Update .env with matching credentials
   ```

5. **Alternative: Use Service Account:**
   - Create a dedicated service account in JIRA
   - Assign Xray license to service account
   - Generate both API keys from service account
   - Use service account email in `JIRA_EMAIL`

**Example of Correct Configuration:**
```env
# All credentials from the same user: john.doe@oldmutual.com
XRAY_ID="ABC123..."              # Created by john.doe@oldmutual.com
XRAY_SECRET="XYZ789..."          # Created by john.doe@oldmutual.com
JIRA_API_TOKEN="ATATT..."        # Created by john.doe@oldmutual.com
JIRA_EMAIL="john.doe@oldmutual.com"  # Same user
```

---

### GraphQL Errors

**Error:** `Field "updateTestType" must have a selection of subfields`

**Solution:** This is fixed in v1.0.0+. Update to the latest version:
```bash
npm update @oldmutual/xray-test-automation
```

**Error:** `Variable "$testType" got invalid value`

**Solution:** Ensure you're using the correct test type. Valid values:
- `"Automated"` (default, for CI/CD)
- `"Manual"` (for manual testing)
- `"Generic"` (for unstructured tests)
- `"Cucumber"` (for Gherkin tests)

---

**Error:** `issueId provided is not valid` or `errorMessages: ["issueId provided is not valid"]`

**Cause:** Xray's GraphQL API hasn't indexed the newly created test yet.

**Solution:** Version 1.0.0+ includes automatic retry logic with exponential backoff (2s, 4s, 8s, 16s, 32s) to handle varying indexing times. The package will:

1. **Automatically retry up to 5 times** with increasing delays
2. **Display retry progress:** `⏳ Retry 1/4 after 4000ms...`
3. **Succeed once Xray indexes the test** (usually within 2-8 seconds)

If tests still fail after 5 retries:

1. **Check JIRA instance performance:**
   - Is your JIRA instance under heavy load?
   - Are there ongoing maintenance windows?
   - Try running during off-peak hours

2. **Verify the test exists:**
   - Check JIRA - the test should exist with the shown key
   - Check `xray-mapping.json` for the mapping

3. **Adjust retry settings (advanced):**
   - Edit `index.js` line ~294 to increase `maxRetries` or `baseDelay`
   - Consider creating tests in smaller batches

---

### Tests Created But Not Linked

**Symptoms:** Tests appear in JIRA but aren't linked to Test Execution

**Solutions:**
1. Check `xray-mapping.json` for created test keys
2. Use manual linking script:
   ```bash
   # Edit scripts/link-tests.json with your keys
   npm run link
   ```
3. Increase indexing wait time in your code:
   ```javascript
   await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
   ```

---

### SSL/Proxy Errors

**Error:** `unable to verify the first certificate`

**Solution:**  
The package is configured for Old Mutual's corporate proxy with `rejectUnauthorized: false`. Ensure you're on the corporate network or VPN.

---

### Rate Limiting

**Error:** `429 Too Many Requests`

**Solution:**
- Xray Standard: 300 requests per 5 minutes
- Xray Enterprise: 1000 requests per 5 minutes

Add delays between requests:
```javascript
await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
```

---

### Permission Errors

**Error:** `You do not have permission to create issues in this project`

**Solutions:**
1. Verify you have "Create Issues" permission in the JIRA project
2. Ensure you have Xray license assigned  
3. Check project settings allow Test and Test Execution issue types
4. Contact your JIRA administrator

---

## Development

### Local Development Setup

```bash
# Clone repository
git clone https://dev.azure.com/OMEngineering/API%20COE/_git/xray-test-generator
cd xray-test-generator

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Run locally
npm start
```

### Running Tests Locally

```bash
# Create sample tests
npm start

# Link existing tests
npm run link
```

### Project Structure

```
xray-test-generator/
├── .env                    # Environment variables (DO NOT COMMIT)
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── .npmignore              # NPM publish ignore rules
├── .npmrc.example          # NPM registry auth template
├── package.json            # Package configuration
├── README.md               # This file
├── index.js                # Core module (main export)
├── createXrayTest.js       # CLI entry point
├── tests.json              # Test definitions (INPUT)
├── xray-mapping.json       # Test mappings (OUTPUT)
└── scripts/
    ├── linkTests.js        # Manual linking script
    └── link-tests.json     # Link configuration
```

---

## Publishing

### For Package Maintainers

#### Prerequisites
1. Access to Old Mutual Azure Artifacts feed
2. Personal Access Token (PAT) with Packaging permissions
3. `.npmrc` configured with authentication

#### Steps to Publish

1. **Update version in package.json:**
   ```json
   {
     "version": "1.1.0"
   }
   ```

2. **Commit changes:**
   ```bash
   git add package.json
   git commit -m "chore: bump version to 1.1.0"
   git push
   ```

3. **Publish to Azure Artifacts:**
   ```bash
   npm publish
   ```

4. **Create Git tag:**
   ```bash
   git tag v1.1.0  
   git push --tags
   ```

#### Versioning Guidelines

Follow [Semantic Versioning](https://semver.org/):

- **Major** (x.0.0): Breaking changes
- **Minor** (1.x.0): New features, backwards compatible
- **Patch** (1.0.x): Bug fixes

---

## Support

### Getting Help

1. **Check this README** for common issues and solutions
2. **Review `.env.example`** to verify configuration format
3. **Check JIRA permissions** - ensure you can create Tests manually
4. **Review error messages** - they often include specific solutions
5. **Check Azure DevOps** for pipeline logs (if using CI/CD)

### Contact

| Issue Type | Contact |
|------------|---------|
| **Package bugs** | Create issue in Azure DevOps repository |
| **Feature requests** | Create issue in Azure DevOps repository |
| **JIRA/Xray access** | Contact JIRA administrators |
| **General questions** | Platform Engineering team |

### Useful Links

- [Xray Cloud Documentation](https://docs.getxray.app/display/XRAYCLOUD)
- [Xray GraphQL API Reference](https://us.xray.cloud.getxray.app/doc/graphql/)
- [JIRA REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)
- [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)

---

## License

**UNLICENSED** - Internal use only within Old Mutual organization.

---

## Changelog

### v1.0.0 (2026-02-06)

**Features:**
- ✅ Automated test type support (Automated, Manual, Generic, Cucumber)
- ✅ GraphQL API integration for test steps
- ✅ Incremental mapping file saves
- ✅ Comprehensive error handling and logging
- ✅ Support for Xray data residency (US/EU/AU)
- ✅ CI/CD pipeline integration examples
- ✅ Complete API documentation

**Bug Fixes:**
- Fixed GraphQL mutation syntax for `updateTestType` and `addTestStep`
- Added missing `path` module import
- Improved error messages with detailed GraphQL errors  
- Fixed `.npmrc` template format

**Documentation:**
- Complete README with examples
- CI/CD integration guides
- Comprehensive API reference
- Troubleshooting section

---

**Maintained by:** Old Mutual Platform Engineering  
**Package:** `@oldmutual/xray-test-automation`  
**Version:** 1.0.0  
**For:** All Old Mutual teams (API, QA, DevOps, Product, Security, Data, Integration)
