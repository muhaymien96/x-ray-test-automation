/**
 * Entry point script for npm start/create commands
 * Uses the main index.js module for all functionality
 */

const { createTestsAndExecution } = require('./index');
const fs = require('fs');

async function main() {
  if (!fs.existsSync("tests.json")) {
    console.error("❌ tests.json file not found.");
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync("tests.json", "utf8"));
  
  try {
    await createTestsAndExecution(config);
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}\n`);
    process.exit(1);
  }
}

main();
