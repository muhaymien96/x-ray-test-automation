require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const axios = require("axios");
const https = require("https");
const fs = require("fs");
const path = require("path");

const GRAPHQL_URL = "https://xray.cloud.getxray.app/api/v2/graphql";
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Authenticate with Xray Cloud and return a JWT token.
 */
async function getXrayToken() {
  console.log("🔐 Authenticating with Xray Cloud...");
  const response = await axios.post(
    "https://xray.cloud.getxray.app/api/v2/authenticate",
    {
      client_id: process.env.XRAY_ID,
      client_secret: process.env.XRAY_SECRET,
    },
    { httpsAgent }
  );
  console.log("✅ Authenticated with Xray Cloud");
  return response.data;
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
    testExecution: {
      issueId: response.data.key,
      jira: { key: response.data.key, summary: summary }
    }
  };
}

/**
 * Create a Test Plan via Jira REST API.
 */
async function createTestPlan(summary, description) {
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
      issuetype: { name: "Test Plan" }
    }
  };

  const response = await axios.post(
    `${process.env.JIRA_URL}/rest/api/3/issue`,
    payload,
    { httpsAgent, headers }
  );

  return {
    testPlan: {
      issueId: response.data.key,
      jira: { key: response.data.key, summary: summary }
    }
  };
}

/**
 * Add tests to a Test Execution using Jira issue linking.
 */
async function addTestsToTestExecution(testExecutionKey, testKeys) {
  const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');
  const headers = {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json"
  };

  let successCount = 0;
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
      successCount++;
    } catch (err) {
      console.log(`   ⚠️ Failed to link ${testKey}: ${err.response?.data?.errorMessages?.[0] || err.message}`);
    }
  }

  return { addedTests: testKeys.slice(0, successCount) };
}

/**
 * Add tests to a Test Plan using Jira issue linking.
 */
async function addTestsToTestPlan(testPlanKey, testKeys) {
  const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');
  const headers = {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json"
  };

  let successCount = 0;
  for (const testKey of testKeys) {
    try {
      const payload = {
        type: { name: "Test" },
        inwardIssue: { key: testKey },
        outwardIssue: { key: testPlanKey }
      };

      await axios.post(
        `${process.env.JIRA_URL}/rest/api/3/issueLink`,
        payload,
        { httpsAgent, headers }
      );
      successCount++;
    } catch (err) {
      console.log(`   ⚠️ Failed to link ${testKey}: ${err.response?.data?.errorMessages?.[0] || err.message}`);
    }
  }

  return { addedTests: testKeys.slice(0, successCount) };
}

async function main() {
  // Validate environment variables
  const required = ["XRAY_ID", "XRAY_SECRET", "JIRA_PROJECT_KEY", "JIRA_EMAIL", "JIRA_API_TOKEN", "JIRA_URL"];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0) {
    console.error(`❌ Missing in .env: ${missing.join(", ")}`);
    process.exit(1);
  }

  // Load config
  const configPath = path.join(__dirname, "link-tests.json");
  if (!fs.existsSync(configPath)) {
    console.error("❌ scripts/link-tests.json file not found.");
    console.log("\nCreate a link-tests.json file with this structure:");
    console.log(`{
  "testExecutionKey": "APIEE-1234",
  "testKeys": ["APIEE-6875", "APIEE-6876", "APIEE-6877"]
}`);
    console.log("\nOr use testPlanKey instead of testExecutionKey:");
    console.log(`{
  "testPlanKey": "APIEE-1234",
  "testKeys": ["APIEE-6875", "APIEE-6876", "APIEE-6877"]
}`);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const testKeys = config.testKeys || [];

  if (testKeys.length === 0) {
    console.error("❌ No test keys provided in link-tests.json");
    process.exit(1);
  }

  console.log(`📋 Found ${testKeys.length} test(s) to link\n`);

  // Authenticate with Xray
  const xrayToken = await getXrayToken();
  console.log("");

  // Use existing Test Execution or Test Plan
  let containerKey;
  let containerType;

  if (config.testExecutionKey) {
    containerKey = config.testExecutionKey;
    containerType = "Test Execution";
    console.log(`📌 Using existing Test Execution: ${containerKey}\n`);
  } else if (config.testPlanKey) {
    containerKey = config.testPlanKey;
    containerType = "Test Plan";
    console.log(`📌 Using existing Test Plan: ${containerKey}\n`);
  } else {
    console.error("❌ Must specify either 'testExecutionKey' or 'testPlanKey' in link-tests.json");
    process.exit(1);
  }

  // Link tests
  console.log(`\n🔗 Linking ${testKeys.length} test(s) to ${containerType} ${containerKey}...`);
  try {
    let result;
    if (containerType === "Test Execution") {
      result = await addTestsToTestExecution(containerKey, testKeys);
    } else {
      result = await addTestsToTestPlan(containerKey, testKeys);
    }
    
    const addedCount = result?.addedTests?.length || testKeys.length;
    console.log(`   ✅ Successfully linked ${addedCount} test(s)`);
    console.log(`   🔗 View: ${process.env.JIRA_URL}/browse/${containerKey}\n`);
  } catch (err) {
    console.error(`   ❌ Linking failed:`, err.message);
    process.exit(1);
  }

  console.log("✅ Done!\n");
}

main().catch(err => {
  console.error("💥 Error:", err.message);
  process.exit(1);
});
