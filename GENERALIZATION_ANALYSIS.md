# Xray Test Automation - Generalization & Expansion Analysis

## Executive Summary

As a **Principal Engineer and Chief Automation Architect**, I've conducted a comprehensive review of your Xray test automation generator. This document provides:

1. **Current State Assessment** - What you've built and its strengths
2. **Generalization Strategy** - How to transform this from Old Mutual-specific to a universal npm package
3. **Feature Expansion Roadmap** - Based on latest Xray Cloud API capabilities (2025)
4. **Monetization Options** - Open source vs. commercial strategies
5. **Implementation Plan** - Concrete next steps

---

## 1. Current State Assessment

### What You've Built ✅

**Core Capabilities:**
- ✅ Automated Test creation via Jira REST API
- ✅ Test type configuration (Automated) via Xray GraphQL API
- ✅ Test step management with action/data/expected result
- ✅ Test Execution creation and linking
- ✅ Test Plan support (in linkTests.js)
- ✅ Incremental mapping file generation (xray-mapping.json)
- ✅ Robust error handling with retry logic
- ✅ Corporate proxy support
- ✅ Multi-region support (US/EU/AU data residency)
- ✅ User authentication mismatch detection
- ✅ Comprehensive documentation

**Architecture Strengths:**
- Clean separation of concerns (index.js as library, createXrayTest.js as CLI)
- Programmatic API for integration
- Exponential backoff for Xray indexing delays
- Incremental progress saving
- Environment-based configuration

### Current Limitations 🔴

**Old Mutual-Specific Elements:**
1. Hardcoded references to "Old Mutual" in documentation
2. Azure DevOps-specific examples
3. Corporate-specific terminology
4. Limited to single project key in .env

**Missing Xray Features:**
1. ❌ Test Sets (logical grouping)
2. ❌ Preconditions (reusable setup steps)
3. ❌ Requirements linking
4. ❌ Test Repository organization
5. ❌ Custom fields support
6. ❌ Test import/export (Cucumber, Gherkin)
7. ❌ Bulk test updates
8. ❌ Test cloning/templating
9. ❌ Attachments support
10. ❌ Test environments configuration

**API Gaps:**
1. No REST API fallback for heavy operations
2. Limited GraphQL query capabilities
3. No support for dynamic Test Plans (Xray Enterprise)
4. Missing JQL integration for test discovery

---

## 2. Generalization Strategy

### Phase 1: Remove Company-Specific Elements

#### Package Naming
```json
// Current
"@oldmutual/xray-test-automation"

// Generalized Options
"@xray-tools/test-automation"      // Recommended
"xray-test-generator"              // Simple
"jira-xray-automation"             // Descriptive
"xray-cloud-sdk"                   // SDK-style
```

#### Documentation Overhaul
- Replace "Old Mutual" with generic "your organization"
- Remove Azure DevOps-specific examples, add GitHub Actions, GitLab CI, Jenkins
- Add framework-agnostic examples (Jest, Mocha, Playwright, Cypress)
- Create use-case driven documentation (not company-driven)

#### Configuration Flexibility
```javascript
// Current: Single project in .env
JIRA_PROJECT_KEY=APIEE

// Generalized: Project per operation
const config = {
  projectKey: "PROJ",  // Override per call
  tests: [...]
}
```

### Phase 2: API Redesign for Flexibility

#### Current API
```javascript
createTestsAndExecution(config)  // Monolithic
```

#### Proposed Modular API
```javascript
// Builder Pattern
const xray = new XrayClient({
  jira: { url, email, token },
  xray: { clientId, clientSecret, region: 'us' }
});

// Fluent API
await xray
  .project('PROJ')
  .createTests(tests)
  .createExecution('Sprint 24')
  .linkTests()
  .save('mapping.json');

// Functional API (current style, enhanced)
await createTests(tests, { projectKey: 'PROJ' });
await createExecution(summary, { projectKey: 'PROJ' });
await linkTestsToExecution(execKey, testKeys);
```

### Phase 3: Multi-Tenant Support

```javascript
// Support multiple Jira instances
const xray = new XrayClient({
  instances: {
    production: { jira: {...}, xray: {...} },
    staging: { jira: {...}, xray: {...} }
  }
});

await xray.use('production').createTests(tests);
```

---

## 3. Feature Expansion Roadmap

### 🎯 Priority 1: Core Xray Entities (Q1 2026)

#### 1.1 Test Sets
```javascript
// Create Test Set
const testSet = await xray.createTestSet({
  summary: "Login Test Suite",
  description: "All login-related tests",
  tests: ["PROJ-123", "PROJ-124"]
});

// Add tests to existing set
await xray.addTestsToSet("PROJ-500", ["PROJ-125", "PROJ-126"]);
```

**Implementation:**
- GraphQL mutation: `addTestsToTestSet`
- REST API fallback for bulk operations
- Mapping file support for test sets

#### 1.2 Preconditions
```javascript
// Create reusable precondition
const precondition = await xray.createPrecondition({
  summary: "User must be logged in",
  description: "Valid user session exists",
  steps: [
    { action: "Navigate to login", data: "URL: /login", expected: "Login page displayed" },
    { action: "Enter credentials", data: "user@example.com", expected: "Logged in" }
  ]
});

// Link precondition to tests
await xray.linkPrecondition(precondition.key, ["PROJ-123", "PROJ-124"]);
```

**Implementation:**
- Jira REST API for Precondition issue creation
- GraphQL for linking: `addPreConditionsToTest`

#### 1.3 Requirements Linking
```javascript
// Link tests to requirements/stories
await xray.linkTestsToRequirements({
  "PROJ-123": ["PROJ-10", "PROJ-11"],  // Test -> Requirements
  "PROJ-124": ["PROJ-12"]
});

// Coverage report
const coverage = await xray.getRequirementsCoverage("PROJ-10");
// { requirement: "PROJ-10", tests: ["PROJ-123"], coverage: "100%" }
```

**Implementation:**
- Jira issue linking API
- JQL queries for coverage analysis

### 🎯 Priority 2: Advanced Test Management (Q2 2026)

#### 2.1 Test Repository Organization
```javascript
// Organize tests in folders (Xray Enterprise)
await xray.createTestRepository({
  name: "API Tests",
  folders: [
    { name: "Authentication", tests: ["PROJ-123", "PROJ-124"] },
    { name: "User Management", tests: ["PROJ-125", "PROJ-126"] }
  ]
});
```

#### 2.2 Custom Fields Support
```javascript
const test = await xray.createTest({
  summary: "Login test",
  customFields: {
    "customfield_10050": "Regression",      // Test Category
    "customfield_10051": ["Smoke", "P0"],   // Tags
    "customfield_10052": { value: "API" }   // Test Type
  }
});
```

**Implementation:**
- Jira REST API field discovery
- Field schema validation
- Helper for common custom fields

#### 2.3 Bulk Operations
```javascript
// Update multiple tests
await xray.bulkUpdateTests({
  keys: ["PROJ-123", "PROJ-124", "PROJ-125"],
  updates: {
    priority: "High",
    labels: ["Regression", "Automated"]
  }
});

// Clone tests
const cloned = await xray.cloneTests({
  source: ["PROJ-123", "PROJ-124"],
  targetProject: "PROJ2",
  updateSummary: (summary) => `[Cloned] ${summary}`
});
```

### 🎯 Priority 3: Import/Export & Integration (Q3 2026)

#### 3.1 Cucumber/Gherkin Support
```javascript
// Import from Cucumber features
await xray.importCucumber({
  features: "./features/**/*.feature",
  projectKey: "PROJ",
  testExecution: "Sprint 24"
});

// Export to Cucumber
await xray.exportCucumber({
  tests: ["PROJ-123", "PROJ-124"],
  output: "./features/generated"
});
```

**Implementation:**
- Xray REST API: `/import/feature` and `/export/cucumber`
- Feature file parsing (Gherkin)

#### 3.2 Test Framework Integration
```javascript
// Playwright integration
import { test, expect } from '@playwright/test';
import { XrayReporter } from '@xray-tools/test-automation';

const xray = new XrayReporter({
  testExecution: "PROJ-500",
  mapping: "./xray-mapping.json"
});

test('Login test', async ({ page }) => {
  await xray.startTest('TC-LOGIN-001');
  // ... test code
  await xray.endTest('TC-LOGIN-001', 'PASSED');
});
```

#### 3.3 AI Test Generation (2025 Feature)
```javascript
// Leverage Xray's new AI capabilities
const tests = await xray.generateTestsFromRequirements({
  requirements: ["PROJ-10", "PROJ-11"],
  aiModel: "xray-ai",  // Uses Xray's built-in AI
  reviewMode: true     // Human review before creation
});

// Review and create
const reviewed = await xray.reviewAITests(tests);
await xray.createTests(reviewed.approved);
```

### 🎯 Priority 4: Reporting & Analytics (Q4 2026)

#### 4.1 JQL Integration
```javascript
// Find tests using JQL
const tests = await xray.findTests({
  jql: 'project = PROJ AND labels = "Regression" AND "Test Type" = Automated'
});

// Xray-specific JQL functions (v5.0.0+)
const failingTests = await xray.findTests({
  jql: 'testLastStatus("FAIL") AND testExecutionKey = "PROJ-500"'
});
```

#### 4.2 Test Execution Results
```javascript
// Update test results
await xray.updateTestResults({
  testExecution: "PROJ-500",
  results: [
    { test: "PROJ-123", status: "PASS", duration: 1500 },
    { test: "PROJ-124", status: "FAIL", comment: "Timeout", attachments: ["screenshot.png"] }
  ]
});
```

#### 4.3 Coverage Dashboard
```javascript
// Generate coverage report
const report = await xray.generateCoverageReport({
  requirements: ["PROJ-10", "PROJ-11", "PROJ-12"],
  format: "html",
  output: "./coverage-report.html"
});
```

---

## 4. Monetization Strategy

### Option A: Open Source (Recommended)

**Strategy: Freemium Open Core**

#### Free Tier (MIT License)
- Core test creation/management
- Basic Test Execution linking
- CLI tool
- Community support (GitHub Issues)

#### Pro Tier (Commercial License - $99-299/month)
- Advanced features:
  - AI test generation
  - Bulk operations
  - Custom fields automation
  - Test repository management
  - Priority support
  - SLA guarantees
- Enterprise features:
  - Multi-tenant support
  - SSO integration
  - Audit logging
  - Custom integrations
  - Dedicated support

**Revenue Model:**
```
Free: 0-100 tests/month
Starter: $99/month (1,000 tests/month)
Professional: $299/month (10,000 tests/month)
Enterprise: Custom pricing (unlimited + support)
```

#### Why This Works:
1. **Large addressable market**: Every Xray Cloud user (thousands of companies)
2. **Clear value proposition**: Save hours of manual test creation
3. **Network effects**: More users = more feature requests = better product
4. **Upsell path**: Free users convert to paid as they scale

### Option B: Fully Open Source

**Strategy: Services & Support**

#### Open Source (Apache 2.0)
- All features free
- Community-driven development
- Public roadmap

#### Revenue Streams:
1. **Consulting**: $150-300/hour for implementation
2. **Training**: $2,000-5,000 per workshop
3. **Custom Development**: $10,000-50,000 per project
4. **Support Contracts**: $5,000-20,000/year
5. **Sponsorships**: GitHub Sponsors, Open Collective

**Why This Works:**
1. **Faster adoption**: No barriers to entry
2. **Community contributions**: Faster feature development
3. **Reputation building**: Establish yourself as Xray expert
4. **Consulting opportunities**: Companies pay for expertise

### Option C: SaaS Platform

**Strategy: Hosted Service**

#### Platform Features:
- Web UI for test creation
- Visual test designer
- Template library
- Scheduled sync
- Analytics dashboard
- Team collaboration

**Pricing:**
```
Solo: $29/month (1 user, 500 tests)
Team: $99/month (5 users, 5,000 tests)
Business: $299/month (unlimited users, 50,000 tests)
Enterprise: Custom
```

**Why This Works:**
1. **Recurring revenue**: Predictable MRR
2. **Lower barrier**: No installation/configuration
3. **Upsell opportunities**: Add-ons, integrations
4. **Data insights**: Usage patterns inform product development

### 🏆 Recommended Approach

**Hybrid: Open Source Core + Commercial Extensions**

1. **Phase 1 (Months 1-3)**: Release open source core
   - Build community
   - Gather feedback
   - Establish credibility

2. **Phase 2 (Months 4-6)**: Launch Pro tier
   - AI features
   - Advanced automation
   - Priority support

3. **Phase 3 (Months 7-12)**: Enterprise features
   - Multi-tenant
   - SSO
   - Custom integrations

**Expected Revenue (Year 1):**
- Month 1-3: $0 (building community)
- Month 4-6: $1,000-3,000/month (early adopters)
- Month 7-12: $5,000-15,000/month (enterprise deals)

---

## 5. Implementation Plan

### Phase 1: Generalization (2-3 weeks)

**Week 1: Code Refactoring**
- [ ] Rename package to `@xray-tools/test-automation`
- [ ] Remove Old Mutual references
- [ ] Add project-level configuration
- [ ] Create builder pattern API
- [ ] Add TypeScript definitions

**Week 2: Documentation**
- [ ] Rewrite README for general audience
- [ ] Add framework-agnostic examples
- [ ] Create API reference docs
- [ ] Add CI/CD examples (GitHub, GitLab, Jenkins)
- [ ] Create migration guide

**Week 3: Testing & Publishing**
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] Publish to npm
- [ ] Create GitHub repository
- [ ] Set up CI/CD pipeline

### Phase 2: Feature Expansion (8-12 weeks)

**Weeks 4-6: Core Entities**
- [ ] Test Sets support
- [ ] Preconditions support
- [ ] Requirements linking
- [ ] Custom fields support

**Weeks 7-9: Advanced Features**
- [ ] Bulk operations
- [ ] Test cloning
- [ ] JQL integration
- [ ] Test results updates

**Weeks 10-12: Import/Export**
- [ ] Cucumber/Gherkin support
- [ ] Test framework reporters
- [ ] AI test generation wrapper

### Phase 3: Commercialization (4-6 weeks)

**Weeks 13-15: Pro Features**
- [ ] License management
- [ ] Usage tracking
- [ ] Payment integration (Stripe)
- [ ] Pro-only features

**Weeks 16-18: Marketing**
- [ ] Landing page
- [ ] Documentation site
- [ ] Video tutorials
- [ ] Blog posts
- [ ] Community building

---

## 6. Technical Architecture

### Proposed Structure

```
xray-test-automation/
├── packages/
│   ├── core/                 # Core library (open source)
│   │   ├── src/
│   │   │   ├── client/
│   │   │   │   ├── XrayClient.ts
│   │   │   │   ├── JiraClient.ts
│   │   │   │   └── GraphQLClient.ts
│   │   │   ├── entities/
│   │   │   │   ├── Test.ts
│   │   │   │   ├── TestExecution.ts
│   │   │   │   ├── TestPlan.ts
│   │   │   │   ├── TestSet.ts
│   │   │   │   └── Precondition.ts
│   │   │   ├── operations/
│   │   │   │   ├── create.ts
│   │   │   │   ├── update.ts
│   │   │   │   ├── link.ts
│   │   │   │   └── query.ts
│   │   │   └── utils/
│   │   │       ├── retry.ts
│   │   │       ├── mapping.ts
│   │   │       └── validation.ts
│   │   └── package.json
│   ├── cli/                  # CLI tool (open source)
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── create.ts
│   │   │   │   ├── link.ts
│   │   │   │   ├── export.ts
│   │   │   │   └── import.ts
│   │   │   └── index.ts
│   │   └── package.json
│   ├── reporters/            # Test framework integrations (open source)
│   │   ├── playwright/
│   │   ├── jest/
│   │   ├── mocha/
│   │   └── cypress/
│   └── pro/                  # Commercial features
│       ├── ai/
│       ├── bulk/
│       └── analytics/
├── docs/
│   ├── getting-started.md
│   ├── api-reference.md
│   ├── examples/
│   └── guides/
├── examples/
│   ├── basic/
│   ├── playwright/
│   ├── cucumber/
│   └── ci-cd/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

### Technology Stack

**Core:**
- TypeScript (type safety)
- Axios (HTTP client)
- Zod (schema validation)
- Winston (logging)

**CLI:**
- Commander.js (CLI framework)
- Inquirer.js (interactive prompts)
- Chalk (colored output)

**Testing:**
- Jest (unit tests)
- Playwright (integration tests)
- MSW (API mocking)

**Documentation:**
- VitePress (docs site)
- TypeDoc (API docs)

---

## 7. Competitive Analysis

### Existing Solutions

| Tool | Strengths | Weaknesses | Your Advantage |
|------|-----------|------------|----------------|
| **Xray Manual UI** | Official, comprehensive | Slow, no automation | 10x faster automation |
| **Xray REST API** | Official API | Complex, low-level | High-level abstractions |
| **Custom Scripts** | Tailored to needs | Not reusable | Reusable, tested library |
| **Cucumber/Gherkin** | BDD support | Limited to BDD | Supports all test types |

### Unique Value Propositions

1. **Developer-First**: Built by developers, for developers
2. **Framework Agnostic**: Works with any test framework
3. **CI/CD Native**: Designed for automation pipelines
4. **Type-Safe**: Full TypeScript support
5. **Incremental**: Save progress, handle failures gracefully
6. **Multi-Region**: Support for global teams

---

## 8. Go-to-Market Strategy

### Target Audience

**Primary:**
1. QA Engineers (automation)
2. DevOps Engineers (CI/CD)
3. Test Managers (test organization)

**Secondary:**
1. Development Teams (shift-left testing)
2. Product Managers (requirements tracking)
3. Compliance Teams (audit trails)

### Marketing Channels

**Organic:**
1. **GitHub**: Open source repository
2. **npm**: Package registry
3. **Dev.to**: Technical blog posts
4. **Medium**: Thought leadership
5. **YouTube**: Video tutorials
6. **Stack Overflow**: Answer questions

**Paid:**
1. **Google Ads**: Target "Xray Jira automation"
2. **LinkedIn Ads**: Target QA professionals
3. **Atlassian Marketplace**: List as integration
4. **Conference Sponsorships**: Testing conferences

### Content Strategy

**Blog Posts:**
1. "Automating Xray Test Creation: A Complete Guide"
2. "10x Your Test Coverage with Xray Automation"
3. "From Manual to Automated: Xray Test Migration"
4. "CI/CD Best Practices for Xray Test Management"

**Video Tutorials:**
1. "Getting Started with Xray Automation"
2. "Integrating Xray with Playwright"
3. "Bulk Test Creation from Cucumber Features"
4. "Advanced Xray Automation Patterns"

---

## 9. Success Metrics

### Open Source Metrics
- GitHub stars: 100+ (Month 3), 500+ (Month 6), 1,000+ (Month 12)
- npm downloads: 1,000/month (Month 3), 10,000/month (Month 12)
- Contributors: 5+ (Month 6), 20+ (Month 12)
- Issues resolved: 80%+ within 7 days

### Commercial Metrics
- Free users: 100+ (Month 6)
- Paid users: 10+ (Month 9), 50+ (Month 12)
- MRR: $1,000 (Month 9), $10,000 (Month 12)
- Churn rate: <5% monthly
- NPS: 50+

### Community Metrics
- Discord/Slack members: 100+ (Month 6)
- Monthly active users: 500+ (Month 12)
- Documentation views: 5,000/month (Month 12)

---

## 10. Risk Mitigation

### Technical Risks

**Risk 1: Xray API Changes**
- **Mitigation**: Version pinning, API compatibility layer, deprecation warnings

**Risk 2: Rate Limiting**
- **Mitigation**: Built-in rate limiting, queue management, retry logic

**Risk 3: Authentication Issues**
- **Mitigation**: Clear error messages, authentication testing, fallback mechanisms

### Business Risks

**Risk 1: Low Adoption**
- **Mitigation**: Free tier, excellent documentation, community building

**Risk 2: Competition**
- **Mitigation**: Unique features, superior DX, faster iteration

**Risk 3: Atlassian Policy Changes**
- **Mitigation**: Diversify (support other test management tools), maintain good relationship

---

## 11. Next Steps

### Immediate Actions (This Week)

1. **Decision**: Choose monetization strategy
   - Recommendation: Open source core + commercial extensions

2. **Setup**: Create new repository
   - Name: `xray-test-automation`
   - License: MIT (core) + Commercial (pro)
   - CI/CD: GitHub Actions

3. **Refactor**: Remove Old Mutual references
   - Package name
   - Documentation
   - Examples

### Short-Term (Next 2 Weeks)

1. **Publish**: Release v1.0.0 to npm
2. **Document**: Complete generalized README
3. **Promote**: Share on Reddit, Dev.to, Twitter

### Medium-Term (Next 3 Months)

1. **Features**: Implement Priority 1 features
2. **Community**: Build Discord/Slack community
3. **Content**: Publish 4-6 blog posts

### Long-Term (6-12 Months)

1. **Monetize**: Launch Pro tier
2. **Scale**: Hire contributors/support
3. **Expand**: Add integrations, partnerships

---

## Conclusion

You've built a **solid foundation** with excellent architecture and comprehensive documentation. The path to generalization is clear:

1. **Remove company-specific elements** (2-3 weeks)
2. **Add missing Xray features** (8-12 weeks)
3. **Launch commercial tier** (4-6 weeks)

**Recommended Strategy:**
- **Open source the core** to build community and credibility
- **Commercialize advanced features** to generate revenue
- **Focus on developer experience** to differentiate from competitors

**Expected Outcome:**
- **Year 1**: 1,000+ GitHub stars, 10,000+ npm downloads, $5-15K MRR
- **Year 2**: Established as go-to Xray automation tool, $50-100K MRR
- **Year 3**: Potential acquisition or sustainable business

The market is **ready** for this solution. Xray users are **frustrated** with manual test creation. Your tool solves a **real pain point**.

**The opportunity is yours to seize.** 🚀

---

## Appendix: Code Examples

### Example 1: Generalized API

```typescript
// Before (Old Mutual-specific)
const { createTestsAndExecution } = require('@oldmutual/xray-test-automation');

// After (Generalized)
import { XrayClient } from '@xray-tools/test-automation';

const xray = new XrayClient({
  jira: {
    url: process.env.JIRA_URL,
    email: process.env.JIRA_EMAIL,
    token: process.env.JIRA_API_TOKEN
  },
  xray: {
    clientId: process.env.XRAY_CLIENT_ID,
    clientSecret: process.env.XRAY_CLIENT_SECRET,
    region: 'us' // or 'eu', 'au'
  }
});

// Fluent API
const result = await xray
  .project('PROJ')
  .createTests([
    {
      summary: 'Login test',
      priority: 'High',
      labels: ['Auth', 'Smoke'],
      steps: [...]
    }
  ])
  .createExecution('Sprint 24')
  .linkTests()
  .save('./xray-mapping.json');
```

### Example 2: Test Sets

```typescript
// Create test set
const testSet = await xray.createTestSet({
  projectKey: 'PROJ',
  summary: 'Authentication Tests',
  description: 'All auth-related test cases',
  tests: ['PROJ-123', 'PROJ-124', 'PROJ-125']
});

console.log(`Created test set: ${testSet.key}`);
```

### Example 3: Preconditions

```typescript
// Create reusable precondition
const precondition = await xray.createPrecondition({
  projectKey: 'PROJ',
  summary: 'User logged in',
  steps: [
    {
      action: 'Navigate to login page',
      data: 'URL: /login',
      expected: 'Login form displayed'
    },
    {
      action: 'Enter valid credentials',
      data: 'user@example.com / password123',
      expected: 'User logged in successfully'
    }
  ]
});

// Link to tests
await xray.linkPrecondition(precondition.key, ['PROJ-123', 'PROJ-124']);
```

### Example 4: Playwright Integration

```typescript
import { test, expect } from '@playwright/test';
import { XrayReporter } from '@xray-tools/test-automation/reporters/playwright';

const xray = new XrayReporter({
  projectKey: 'PROJ',
  testExecution: 'PROJ-500',
  mapping: './xray-mapping.json'
});

test.use({ reporter: xray });

test('Login with valid credentials', async ({ page }) => {
  // Test automatically linked to PROJ-123 via mapping
  await page.goto('/login');
  await page.fill('#email', 'user@example.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

### Example 5: Cucumber Import

```typescript
// Import Cucumber features as Xray tests
await xray.importCucumber({
  projectKey: 'PROJ',
  features: './features/**/*.feature',
  testExecution: 'PROJ-500',
  options: {
    createPreconditions: true,  // Extract Background as Preconditions
    linkRequirements: true,     // Link to requirements from tags
    updateExisting: false       // Create new tests only
  }
});
```

---

**Document Version:** 1.0  
**Date:** February 8, 2026  
**Author:** Principal Engineer & Chief Automation Architect  
**Status:** Ready for Implementation
