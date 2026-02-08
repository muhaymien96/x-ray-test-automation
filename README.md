# @xray-tools/test-automation

> **Automated Xray test case creation and execution management for Jira projects.**

[![Version](https://img.shields.io/npm/v/@xray-tools/test-automation.svg)](https://www.npmjs.com/package/@xray-tools/test-automation)
[![Downloads](https://img.shields.io/npm/dm/@xray-tools/test-automation.svg)](https://www.npmjs.com/package/@xray-tools/test-automation)
[![License](https://img.shields.io/npm/l/@xray-tools/test-automation.svg)](LICENSE)
[![Node](https://img.shields.io/node/v/@xray-tools/test-automation.svg)](package.json)

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
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This package provides automated creation and management of Xray test cases within Jira. It is designed for **QA teams, developers, and DevOps engineers** who need to manage test cases efficiently, supporting both automated testing workflows and manual test documentation.

**What it does:**
- ✅ Creates Xray **Automated** Test cases in Jira
- ✅ Adds detailed test steps with actions, data, and expected results
- ✅ Creates Test Executions for organizing test runs
- ✅ Links tests to executions automatically
- ✅ Generates test-to-Jira key mappings for CI/CD integration
- ✅ Saves mapping incrementally to prevent data loss
- ✅ Supports bulk test creation with error handling

**Use cases:**
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
- Works with corporate proxies
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
| **Jira API Token** | - | Authentication for Jira REST API |
| **Jira Permissions** | Test creation rights | Create Test and Test Execution issues |

### Obtaining Credentials

⚠️ **CRITICAL REQUIREMENT:** All credentials must be created by the **same Jira user**. The Xray API Key owner must match the Jira API Token owner.

#### Xray API Key (Client ID & Secret)
1. **Log in to Jira** with the account you'll use for automation
2. Navigate to Jira → ⚙️ Settings → Apps → Xray Settings
3. Go to **API Keys** (Global Settings)
4. Click **Create API Key**
5. Save the **Client ID** and **Client Secret**
6. **Remember:** Note which user created this key

#### Jira API Token
1. **Stay logged in as the same user** from above
2. Go to [Atlassian Account Security](https://id.atlassian.com/manage-profile/security/api-tokens)
3. Click **Create API token**
4. Give it a label (e.g., "Xray Automation")
5. Copy and securely save the token
6. **Note the email** of the logged-in user

#### Verify User Match
Both credentials should be from the same user:
```
✅ Xray API Key created by: john.doe@company.com
✅ Jira API Token created by: john.doe@company.com
✅ JIRA_EMAIL in .env: john.doe@company.com
```

---

## Installation

### From npm Registry

```bash
npm install @xray-tools/test-automation
```

### For Development / Local Testing

```bash
git clone https://github.com/muhaymien96/xray-test-automation
cd xray-test-automation
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

# Jira Project Configuration
JIRA_PROJECT_KEY=PROJ

# Jira Authentication
JIRA_URL="https://your-company.atlassian.net"
JIRA_API_TOKEN="your_jira_api_token_here"
JIRA_EMAIL="your.email@company.com"
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

The `.gitignore` file is preconfigured to exclude credentials.

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
            "data": "URL: https://portal.example.com/login",
            "expected_result": "Login page is displayed with username and password fields"
          },
          {
            "action": "Enter valid username and password",
            "data": "Username: testuser@example.com, Password: ValidPass123",
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
            "data": "Search term: 'product name'",
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
🚀 Xray Test Automation

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

🔗 View Test Execution: https://your-company.atlassian.net/browse/PROJ-1240
```

---

### Programmatic Usage

#### Import and Use in Your Code

```javascript
require('dotenv').config();
const { createTestsAndExecution } = require('@xray-tools/test-automation');
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
} = require('@xray-tools/test-automation');

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
        run: npm install @xray-tools/test-automation
        
      - name: Create .env file
        run: |
          echo "XRAY_ID=${{ secrets.XRAY_ID }}" >> .env
          echo "XRAY_SECRET=${{ secrets.XRAY_SECRET }}" >> .env
          echo "JIRA_PROJECT_KEY=PROJ" >> .env
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

#### GitLab CI Example

```yaml
stages:
  - sync

sync-xray:
  stage: sync
  image: node:18
  only:
    changes:
      - tests.json
  script:
    - npm install @xray-tools/test-automation
    - |
      cat > .env << EOF
      XRAY_ID=${XRAY_ID}
      XRAY_SECRET=${XRAY_SECRET}
      JIRA_PROJECT_KEY=PROJ
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
      priority?: "Highest" | "High" | "Medium" | "Low" | "Lowest"; // Jira priority
      labels?: string[];      // Jira labels for categorization
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
| `xray.summary` | string | Yes | Test case title in Jira | `"Verify user login"` |
| `xray.description` | string | No | Detailed description | `"Test POST /api/auth/login..."` |
| `xray.priority` | string | No | Jira priority level | `"High"` |
| `xray.labels` | string[] | No | Jira labels for organization | `["API", "Auth"]` |
| `xray.steps` | array | No | Test steps (if omitted, test has no steps) | See below |
| `step.action` | string | Yes* | Action to perform | `"Send GET request"` |
| `step.data` | string | No | Test data/parameters | `"clientNo=123456789"` |
| `step.expected_result` | string | Yes* | Expected outcome | `"Returns 200 OK"` |

*Required if `steps` array is provided

---

## Output Files

### xray-mapping.json

Generated after each test creation. Maps your test IDs to Jira keys and numeric IDs:

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
  }
}
```

**Usage in CI/CD:**

```javascript
const mapping = require('./xray-mapping.json');

// Get Jira key and ID for a specific test
const testInfo = mapping['TC-LOGIN-001'];
console.log(`Test key: ${testInfo.key}`); // PROJ-1234
console.log(`Test ID: ${testInfo.id}`);   // 1234560

// Get Test Execution key and ID
const executionInfo = mapping._testexecution;
console.log(`Execution key: ${executionInfo.key}`); // PROJ-1240
```

**Why it's useful:**
- Update test execution results programmatically
- Link test artifacts (screenshots, logs, videos)
- Track test coverage across releases
- Generate test reports with Jira references

---

## API Reference

### Exported Functions

#### `createTestsAndExecution(config)`

Creates all tests and a test execution, then links them together.

**Parameters:**
- `config` (Object): Test configuration object
  - `config.tests` (Array): Array of test definitions
  - `config.testExecution` (Object): Test execution configuration

**Returns:** `Promise<Object>`
```javascript
{
  tests: string[],        // Array of created test keys: ["PROJ-6895", "PROJ-6896"]
  testExecution: string,  // Test execution key: "PROJ-6900"
  mapping: Object        // Complete test ID to Jira key mapping
}
```

**Example:**
```javascript
const { createTestsAndExecution } = require('@xray-tools/test-automation');

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

console.log(result.tests);         // ["PROJ-7001"]
console.log(result.testExecution); // "PROJ-7010"
```

---

#### `createJiraTestIssue(test)`

Creates a single Xray Test issue in Jira.

**Parameters:**
- `test` (Object): Test definition object with `xray` property

**Returns:** `Promise<Object>`
```javascript
{
  key: string,    // Jira issue key: "PROJ-6895"
  id: string      // Jira issue ID: "12345"
}
```

**Example:**
```javascript
const { createJiraTestIssue } = require('@xray-tools/test-automation');

const test = await createJiraTestIssue({
  xray: {
    summary: "Verify POST /api/users creates user",
    description: "Test user creation endpoint",
    priority: "High",
    labels: ["API", "Users", "POST"]
  }
});

console.log(`Created test: ${test.key}`); // PROJ-6895
```

---

#### `createTestExecution(summary, description)`

Creates a Test Execution issue in Jira.

**Parameters:**
- `summary` (string): Test Execution title
- `description` (string): Test Execution description

**Returns:** `Promise<Object>`
```javascript
{
  key: string,    // Test Execution key: "PROJ-6900"
  id: string      // Test Execution ID: "12350"
}
```

**Example:**
```javascript
const { createTestExecution } = require('@xray-tools/test-automation');

const execution = await createTestExecution(
  "Sprint 24 - Authentication Tests",
  "Automated tests for auth endpoints including login, logout, and token refresh"
);

console.log(`Created execution: ${execution.key}`); // PROJ-6900
```

---

#### `linkTestsToExecution(testExecutionKey, testKeys)`

Links existing tests to a test execution.

**Parameters:**
- `testExecutionKey` (string): Jira key of the Test Execution
- `testKeys` (string[]): Array of test Jira keys to link

**Returns:** `Promise<string[]>` - Array of successfully linked test keys

**Example:**
```javascript
const { linkTestsToExecution } = require('@xray-tools/test-automation');

const linked = await linkTestsToExecution(
  "PROJ-6900",
  ["PROJ-6895", "PROJ-6896", "PROJ-6897"]
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
const { getXrayToken } = require('@xray-tools/test-automation');

const token = await getXrayToken();
console.log('Authenticated with Xray'); 
// Use token for custom GraphQL queries
```

---

## Examples

See the [examples](examples/) directory for more usage examples:

- **Basic Usage** - Simple test creation
- **Multi-Project** - Managing tests across multiple projects
- **Playwright Integration** - Integrating with Playwright tests
- **Cucumber Import** - Importing from Cucumber features
- **CI/CD Integration** - GitHub Actions, GitLab CI, Jenkins

---

## Troubleshooting

### Common Issues

#### Issue 1: "Missing environment variables"

**Error:**
```
Missing environment variables: XRAY_ID, JIRA_API_TOKEN
```

**Solution:**
Ensure your `.env` file exists and contains all required variables:
```env
XRAY_ID=your_client_id
XRAY_SECRET=your_client_secret
JIRA_PROJECT_KEY=PROJ
JIRA_URL=https://your-company.atlassian.net
JIRA_API_TOKEN=your_token
JIRA_EMAIL=your.email@company.com
```

---

#### Issue 2: "User authentication mismatch"

**Error:**
```
Xray user authentication mismatch detected
```

**Solution:**
Ensure the Xray API Key and Jira API Token were created by the **same user**. The `JIRA_EMAIL` must match the user who created both credentials.

---

#### Issue 3: "issueId provided is not valid"

**Error:**
```
GraphQL errors: issueId provided is not valid
```

**Solution:**
This is a timing issue. The package automatically retries with exponential backoff. If it persists, increase the delay in `index.js` or contact support.

---

#### Issue 4: Rate Limiting

**Error:**
```
429 Too Many Requests
```

**Solution:**
The package includes built-in rate limiting (300ms between requests). If you're still hitting limits, reduce the number of tests created in a single batch.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code:
- Follows existing code style
- Includes appropriate tests
- Updates documentation as needed

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

- **Issues:** [GitHub Issues](https://github.com/muhaymien96/xray-test-automation/issues)
- **Discussions:** [GitHub Discussions](https://github.com/muhaymien96/xray-test-automation/discussions)
- **Documentation:** [README](README.md)

---

## Acknowledgments

- Built for the Xray Cloud community
- Inspired by the need for faster test case creation
- Thanks to all contributors and users

---

**Made with ❤️ for the QA community**
