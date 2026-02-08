/**
 * @oldmutual/xray-test-automation
 * 
 * Automated Xray test case creation and execution management for Old Mutual JIRA projects
 */

require("dotenv").config();
const axios = require("axios");
const https = require("https");
const fs = require("fs");
const path = require("path");

// Use region-specific endpoint (us/eu/au) - defaults to US
const GRAPHQL_URL = process.env.XRAY_GRAPHQL_URL || "https://us.xray.cloud.getxray.app/api/v2/graphql";
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Authenticate with Xray Cloud and return a JWT token.
 */
async function getXrayToken() {
  const response = await axios.post(
    "https://xray.cloud.getxray.app/api/v2/authenticate",
    {
      client_id: process.env.XRAY_ID,
      client_secret: process.env.XRAY_SECRET,
    },
    { httpsAgent }
  );
  return response.data;
}

/**
 * Create a Test issue via Jira REST API.
 */
async function createJiraTestIssue(test) {
  const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');
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
      project: { key: process.env.JIRA_PROJECT_KEY },
      summary: test.xray.summary,
      description: adfDescription,
      issuetype: { name: "Test" },
      priority: test.xray.priority ? { name: test.xray.priority } : undefined,
      labels: test.xray.labels || []
    }
  };

  const response = await axios.post(
    `${process.env.JIRA_URL}/rest/api/3/issue`,
    payload,
    { httpsAgent, headers }
  );

  return response.data;
}

/**
 * Set test type and add steps via Xray GraphQL.
 */
async function setTestTypeAndSteps(xrayToken, issueId, steps) {
  const headers = {
    Authorization: `Bearer ${xrayToken}`,
    "Content-Type": "application/json"
  };

  try {
    // Set test type to Automated
    const typeResponse = await axios.post(GRAPHQL_URL, {
      query: `mutation ($issueId: String!, $testType: UpdateTestTypeInput!) {
        updateTestType(issueId: $issueId, testType: $testType) {
          issueId
          testType {
            name
            kind
          }
        }
      }`,
      variables: {
        issueId: issueId,
        testType: { name: "Automated" }
      }
    }, { httpsAgent, headers });

    if (typeResponse.data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(typeResponse.data.errors)}`);
    }
  } catch (err) {
    const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    
    // Detect user authentication mismatch
    if (errorMsg.includes('disallowed to impersonate') || errorMsg.includes('no valid active user exists')) {
      throw new Error(
        `Xray user authentication mismatch detected.\n\n` +
        `This error occurs when:\n` +
        `1. Your JIRA_EMAIL (${process.env.JIRA_EMAIL}) doesn't match the Xray API Key owner\n` +
        `2. The user doesn't have an active Xray license\n` +
        `3. The Xray API Key was created by a different user\n\n` +
        `Solutions:\n` +
        `- Ensure JIRA_EMAIL matches the Xray API Key owner's email\n` +
        `- Verify you have an active Xray license assigned\n` +
        `- Regenerate Xray API Key with the same user as JIRA_API_TOKEN\n` +
        `- Contact your Xray administrator\n\n` +
        `Original error: ${errorMsg}`
      );
    }
    
    throw new Error(`Failed to set test type: ${errorMsg}`);
  }

  // Add each step
  for (const step of steps) {
    try {
      const stepResponse = await axios.post(GRAPHQL_URL, {
        query: `mutation ($issueId: String!, $step: CreateStepInput!) {
          addTestStep(issueId: $issueId, step: $step) {
            id
            action
          }
        }`,
        variables: {
          issueId: issueId,
          step: {
            action: step.action,
            data: step.data,
            result: step.expected_result
          }
        }
      }, { httpsAgent, headers });

      if (stepResponse.data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(stepResponse.data.errors)}`);
      }
    } catch (err) {
      const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      
      // Detect user authentication mismatch
      if (errorMsg.includes('disallowed to impersonate') || errorMsg.includes('no valid active user exists')) {
        throw new Error(
          `Xray user authentication mismatch. Ensure JIRA_EMAIL (${process.env.JIRA_EMAIL}) matches the Xray API Key owner. See README troubleshooting section.`
        );
      }
      
      throw new Error(`Failed to add step: ${errorMsg}`);
    }
  }
}

/**
 * Create a Test Execution via Jira REST API.
 */
async function createTestExecution(summary, description) {
  const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');
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
        content: [{ type: "text", text: description }]
      }
    ]
  };

  const payload = {
    fields: {
      project: { key: process.env.JIRA_PROJECT_KEY },
      summary: summary,
      description: adfDescription,
      issuetype: { name: "Test Execution" }
    }
  };

  const response = await axios.post(
    `${process.env.JIRA_URL}/rest/api/3/issue`,
    payload,
    { httpsAgent, headers }
  );

  return {
    key: response.data.key,
    id: response.data.id
  };
}

/**
 * Link tests to Test Execution using Jira issue links.
 */
async function linkTestsToExecution(testExecutionKey, testKeys) {
  const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');
  const headers = {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json"
  };

  const linked = [];
  for (const testKey of testKeys) {
    try {
      const payload = {
        type: { name: "Test" },
        inwardIssue: { key: testKey },
        outwardIssue: { key: testExecutionKey }
      };

      await axios.post(
        `${process.env.JIRA_URL}/rest/api/3/issueLink`,
        payload,
        { httpsAgent, headers }
      );
      linked.push(testKey);
    } catch (err) {
      console.log(`   ⚠️  Failed to link ${testKey}`);
    }
  }

  return linked;
}

/**
 * Main automation function.
 * 
 * @param {Object} config - Test configuration
 * @param {Array} config.tests - Array of test definitions
 * @param {Object} config.testExecution - Test Execution details
 * @param {string} config.testExecution.summary - Test Execution summary
 * @param {string} config.testExecution.description - Test Execution description
 * @returns {Object} Result containing created test keys and execution key
 */
async function createTestsAndExecution(config) {
  console.log("🚀 Old Mutual Xray Test Automation\n");

  // Validate environment
  const required = ["XRAY_ID", "XRAY_SECRET", "JIRA_PROJECT_KEY", "JIRA_EMAIL", "JIRA_API_TOKEN", "JIRA_URL"];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  const tests = config.tests || [];
  const testExecutionConfig = config.testExecution;

  if (tests.length === 0) {
    throw new Error("No tests provided in configuration");
  }

  console.log(`📋 Creating ${tests.length} test(s)...\n`);

  // Authenticate
  const xrayToken = await getXrayToken();

  const createdTests = [];
  const mappingPath = path.join(__dirname, "xray-mapping.json");
  
  // Load existing mapping if it exists
  let mapping = {};
  if (fs.existsSync(mappingPath)) {
    try {
      mapping = JSON.parse(fs.readFileSync(mappingPath, "utf8"));
    } catch (err) {
      console.log("⚠️  Could not load existing mapping file, creating new one");
    }
  }

  // Create tests
  for (const test of tests) {
    try {
      console.log(`📤 ${test.test_id}`);

      // Create test issue
      const created = await createJiraTestIssue(test);
      const key = created.key;
      const issueId = created.id; // Numeric ID for GraphQL API
      console.log(`   ✅ ${key} (ID: ${issueId})`);

      // Add steps if present with retry logic (Xray GraphQL API needs time to index new tests)
      if (test.xray.steps && test.xray.steps.length > 0) {
        let retryCount = 0;
        const maxRetries = 5;
        const baseDelay = 2000; // 2 seconds
        
        while (retryCount < maxRetries) {
          try {
            const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff: 2s, 4s, 8s, 16s, 32s
            if (retryCount > 0) {
              console.log(`   ⏳ Retry ${retryCount}/${maxRetries - 1} after ${delay}ms...`);
            }
            await new Promise(resolve => setTimeout(resolve, delay));
            
            await setTestTypeAndSteps(xrayToken, issueId, test.xray.steps);
            console.log(`   ✅ ${test.xray.steps.length} step(s) added`);
            break; // Success, exit retry loop
          } catch (error) {
            if (error.message && error.message.includes('issueId provided is not valid')) {
              retryCount++;
              if (retryCount >= maxRetries) {
                console.log(`   ❌ Failed after ${maxRetries} attempts: ${error.message}`);
                throw error;
              }
              // Continue to next retry
            } else {
              // Different error, throw immediately
              throw error;
            }
          }
        }
      }

      mapping[test.test_id] = { key: key, id: issueId };
      createdTests.push(key);
      
      // Save mapping after each successful test creation
      fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
      
      console.log("");

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err) {
      const errorDetail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      console.error(`   ❌ Failed: ${errorDetail}\n`);
    }
  }

  console.log(`\n✅ Created ${createdTests.length}/${tests.length} test(s)\n`);

  // Create Test Execution
  let testExecutionKey = null;
  if (createdTests.length > 0 && testExecutionConfig) {
    console.log(`📌 Creating Test Execution: "${testExecutionConfig.summary}"...`);
    
    const execution = await createTestExecution(
      testExecutionConfig.summary,
      testExecutionConfig.description || testExecutionConfig.summary
    );
    
    testExecutionKey = execution.key;
    mapping._testexecution = { key: testExecutionKey, id: execution.id };
    console.log(`   ✅ ${testExecutionKey}`);

    // Wait for Xray to index the new tests before linking
    console.log(`\n⏳ Waiting for Xray to index tests...`);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Link tests
    console.log(`\n🔗 Linking ${createdTests.length} test(s) to Test Execution...`);
    const linked = await linkTestsToExecution(testExecutionKey, createdTests);
    console.log(`   ✅ ${linked.length} test(s) linked`);
  }

  // Save mapping file
  fs.writeFileSync(path.join(__dirname, "xray-mapping.json"), JSON.stringify(mapping, null, 2));
  console.log(`\n💾 Test mapping saved to xray-mapping.json`);

  if (testExecutionKey) {
    console.log(`\n🔗 View Test Execution: ${process.env.JIRA_URL}/browse/${testExecutionKey}\n`);
  }

  return {
    tests: createdTests,
    testExecution: testExecutionKey,
    mapping: mapping
  };
}

module.exports = {
  createTestsAndExecution,
  createJiraTestIssue,
  createTestExecution,
  linkTestsToExecution,
  getXrayToken
};
