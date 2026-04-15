# 🧠🔥 AI MCP SAAS SYSTEM — MASTER SOURCE OF TRUTH (SOT)

---

# 🎯 0. PURPOSE OF THIS DOCUMENT

This document is the **Single Source of Truth (SOT)** for building:

 
### Files:

```text
mcp-system/contracts/
 ├── mcp-interface.ts
 ├── execution-context.ts
 ├── mcp-request.ts
 ├── mcp-response.ts
 └── validation-result.ts
```

---

### MCP Interface

```ts
interface MCPServer {
  name: string;
  domain: string;
  layer: string;
  version: string;

  validate(input: MCPRequest): Promise<ValidationResult>;
  execute(input: MCPRequest, context: ExecutionContext): Promise<MCPResponse>;
  healthCheck(): Promise<{ success: boolean; details?: any }>;
  capabilities(): string[];
}

interface MCPRequest {
  task: string;
  goal?: string;
  constraints?: string[];
  context?: any;
  metadata?: {
    featureId?: string;
    projectId?: string;
    priority?: 'low' | 'medium' | 'high';
    requestedBy?: 'user' | 'system' | 'agent';
  };
}

interface MCPResponse {
  success: boolean;
  output?: any;
  artifacts?: string[];
  logs?: string[];
  nextActions?: string[];
  error?: string;
  retryable?: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}
```

---

### MCP Contract Rules

* Every MCP must validate input before execution
* Every MCP must return structured output, not raw text only
* Every MCP must expose health status
* Every MCP must produce logs/artifacts for orchestration
* Every MCP must declare capabilities for routing

---

### Execution Context

```ts
interface ExecutionContext {
  taskId: string;
  runId: string;
  projectId: string;
  featureId: string;
  domain: string;
  layer: string;
  status:
    | 'queued'
    | 'planning'
    | 'executing'
    | 'validating'
    | 'retrying'
    | 'blocked'
    | 'completed'
    | 'failed';
  retryCount: number;
  maxRetries: number;
  history: {
    step: string;
    status: 'success' | 'failed' | 'skipped';
    result?: any;
    error?: string;
    timestamp: string;
  }[];
  artifacts: string[];
  knowledge?: any;
  constraints?: string[];
}
```

---

### Lifecycle State Machine

```text
queued → planning → executing → validating
                      ↓           ↓
                   blocked     success
                      ↓           ↓
                    failed ← retrying
```

---

### Failure Policy

* Retry only on retryable errors
* Max retry count must be explicit in context
* If validation fails 3 times, escalate to debug-mcp
* If debug-mcp fails, mark task blocked with root-cause artifact

---

## 4.2 MCP REGISTRY (EXECUTABLE)

```json
{
  "name": "website-builder-mcp",
  "domain": "webdev",
  "layer": "execution",
  "version": "1.0.0",
  "entry": "src/mcps/website-builder/index.ts",
  "enabled": true,
  "capabilities": ["build-ui", "build-api", "wire-db"],
  "inputSchema": "schemas/website-builder-input.json",
  "outputSchema": "schemas/website-builder-output.json"
}
```

---

## MCP Registry Rules

* Registry must be machine-readable JSON
* Each entry must map to a real implementation file
* Each MCP must declare input/output schemas
* Disabled MCPs must never be selected by orchestrator
* Orchestrator must route by capability first, name second

---

## 4.3 KNOWLEDGE INTEGRATION

```text
Task → Knowledge Retrieval → Context → Prompt → Execution
```

---

## Knowledge Retrieval Rules

* Raw knowledge cannot go directly into prompts
* Knowledge must be filtered into task-relevant context
* Context package must include source references
* Context size must be token-budget aware
* Approved knowledge only may influence code generation by default

---

## Required Prompt Package

Every execution prompt must contain:

* Task objective
* Constraints
* Accepted architecture rules
* Relevant knowledge excerpts
* Expected output schema
* Validation checklist
* Retry instruction on failure

---

## 4.4 VALIDATION SYSTEM

* Build Checker (tsc)
* Test Runner (vitest)
* Lint Checker (required)
* Code Validator (required)
* Type Safety Check (required)
* Contract Schema Check (required)
* Smoke Run (required)

---

## Validation Gate Policy

```text
No AI-generated change is accepted until:
lint = pass
types = pass
tests = pass
smoke = pass
contracts = pass
```

---

## Required Validation Outputs

* exit code
* failure summary
* changed files
* retry recommendation

---

## ✅ OUTPUT

```text
✔ Stable AI execution platform
✔ MCPs can be executed
✔ Context-aware AI
```

---

# 🥈 PHASE 2 — EXECUTION MCPs

---

## 4.5 execution-mcp

### Role:

```text
Wrap execution-runtime into MCP
```

### Must Do

* Receive structured tasks from orchestrator
* Execute deterministic task steps
* Store logs, outputs, artifacts
* Trigger validators automatically
* Return retryable vs non-retryable failures

---

## 4.6 debug-mcp

### Role:

```text
Error → Analyze → Fix Strategy → Retry
```

### Must Do

* Parse runtime, build, lint, type, and test errors
* Classify root cause
* Generate minimal fix plan
* Hand fix plan back to builder/execution layer
* Stop infinite retry loops

---

## 4.7 AUTOMATION MCP (Optional)

---

## ✅ OUTPUT

```text
✔ Self-healing system
✔ Retry + Debug loop working
```

---

# 🥉 PHASE 3 — SAAS DEV MVP (CORE FOCUS)

---

## 🎯 Build FIRST WORKING PRODUCT SYSTEM

---

## 4.8 website-planner-mcp

### Input:

```text
"Build SaaS app"
```

### Output:

* Pages
* Features
* DB schema
* Tasks

### Required Artifacts

```text
feature.md
execution.json
schema.json
acceptance.md
```

### Planner Output Rule

Planner must output executable tasks only.
No vague items like "build frontend" or "make backend better".

---

## 4.9 website-builder-mcp

### Role:

```text
Execute build tasks
```

### Must Produce

* Working code
* Updated dependency graph
* Validation results
* Run instructions
* Deployment-ready artifact

---

## 4.10 analysis-mcp

### Role:

```text
Analyze code, UX, performance
```

### Rule

Analysis MCP cannot block MVP build unless it finds a release-critical issue.

---

## ❌ DO NOT BUILD YET:

* Personalization
* Marketing MCPs

---

## ✅ OUTPUT

```text
✔ Full SaaS build pipeline working
```

---

# 🧪 PHASE 4 — FULL SYSTEM TEST

---

## Flow:

```text
Idea
 → DOC-MCP
 → Knowledge MCP
 → Orchestrator
 → Planner MCP
 → Builder MCP
 → Execution Engine
 → Debug MCP
 → Final App
```

---

## End-to-End Success Definition

System is considered working only if one command or orchestrated run can:

* read feature source
* generate executable task list
* build the app
* run validations
* auto-fix at least one induced failure
* produce a deployable output
* store logs and artifacts for the whole run

---

## 🎯 Goal

Build ONE REAL SaaS APP

---

# 🧱 PHASE 5 — HARDENING

---

## Add:

* Agents (optional)
* E2E Testing
* Task Decomposition
* Performance optimization
* Rollback strategy
* Cost tracking
* Rate limit handling
* Security review

---

# 🌍 PHASE 6 — EXPANSION

---

## 4.11 SHARED MCPs

* brand-builder
* analytics-core
* content-core

---

## 4.12 MARKETING MCPs (360 AI AGENCY)

Build later:

* ICP MCP
* Funnel MCP
* SEO MCP
* Ads MCP
* Content MCP

---

## 🎯 Goal

```text
AI-driven SaaS + AI Marketing Agency System
```

---

# 🧠 5. DOCUMENTATION SYSTEM (CRITICAL FIX)

---

## ❌ REMOVE:

* PRD.md
* MVP.md
* Spec.md
* Plan.md

---

## ✅ USE:

```text
feature/
 ├── feature.md        ← SINGLE SOURCE
 ├── execution.json    ← TASKS
```

---

## FEATURE STRUCTURE

```md
---
title:
domain:
status:
---

# Problem
# Goal
# Scope
# Architecture
# Execution Plan
# Success Criteria
```

---

## REQUIRED FRONTMATTER

```md
---
title: user-auth
domain: saas-core
status: planned
priority: high
owner: orchestrator
depends_on: []
acceptance_tests:
   - signup works
   - login works
   - logout works
---
```

---

## execution.json STRUCTURE

```json
{
   "featureId": "user-auth",
   "status": "ready",
   "tasks": [
      {
         "id": "auth-ui-001",
         "title": "Create signup page",
         "type": "build",
         "owner": "website-builder-mcp",
         "dependsOn": [],
         "validation": ["lint", "types", "tests", "smoke"],
         "done": false
      }
   ]
}
```

---

## Documentation Rule

feature.md explains intent.
execution.json drives execution.
No third planning file is allowed.

---

# 🧠 6. FOLDER STRUCTURE

---

## ROOT

```text
ai-engine-system/
```

---

## MAIN

```text
docs/
knowledge/
knowledge-source/
mcp-system/
execution-runtime/
apps/
deploy/
observability/
memory/
```

---

## PROJECTS

```text
docs/projects/
 ├── project-1/
 │    ├── features/
 │    │    ├── auth/
 │    │    ├── dashboard/
```

---

## KNOWLEDGE

```text
knowledge/
 ├── raw/
 ├── processed/
 └── approved/
```

---

## REQUIRED EXECUTION DIRECTORIES

```text
mcp-system/
 ├── contracts/
 ├── registry/
 ├── orchestrator/
 └── servers/

execution-runtime/
 ├── runner/
 ├── validators/
 ├── debugger/
 └── state/

observability/
 ├── logs/
 ├── metrics/
 └── traces/

deploy/
 ├── docker/
 ├── scripts/
 └── manifests/
```

---

# ⚙️ 7. EXECUTION ENGINE

---

## LOOP

```text
Task → Aider → Run → Error → Debug → Retry → Success
```

---

## ADD:

* State Manager
* Error Parser
* Escalation Strategy
* Artifact Writer
* Validation Runner
* Retry Controller

---

## Execution Engine Rule

Execution engine is not just a code generator.
It is a controlled runtime that must track state, validate outputs, and decide retry vs escalate.

---

# 🧠 8. ORCHESTRATOR

---

## RESPONSIBILITY

* Analyze task
* Select MCP
* Build prompt
* Execute flow
* Merge validation feedback
* Persist run state
* Escalate blocked tasks

---

## Orchestrator Routing Order

```text
1. validate task
2. load feature context
3. retrieve approved knowledge
4. select MCP by capability
5. execute
6. validate
7. retry or escalate
8. persist final state
```

---

# 🔁 9. COMPLETE SYSTEM FLOW

```text
User Input
   ↓
Feature.md
   ↓
execution.json
   ↓
Orchestrator
   ↓
Knowledge MCP
   ↓
MCP Execution
   ↓
Execution Runtime
   ↓
Debug MCP
   ↓
Output
```

---

# 🧪 9.1 AI BUILDING-FRIENDLY RULES

## Every AI Step Must Be Machine-Consumable

AI components must never rely on vague prose only.
Every major step must emit structured artifacts.

---

## Mandatory AI Output Formats

* planner → JSON task list
* builder → changed files + validation result
* debugger → root cause + fix strategy + retry decision
* orchestrator → run summary + status + artifact paths

---

## Prompting Rule

Prompt must request exact output shape.
If output shape is not defined, the task is not ready for execution.

---

## Token Discipline

* Pass only relevant feature context
* Prefer summaries plus source refs over dumping raw docs
* Store long-term knowledge outside prompt
* Use artifacts for persistence, not prompt repetition

---

# 🧠 10. GOLDEN RULES

---

## RULE 1

```text
One feature = one source
```

---

## RULE 2

```text
No duplicate documentation
```

---

## RULE 3

```text
Everything must be executable
```

---

## RULE 4

```text
Build vertical slice first
```

---

## RULE 5

```text
AI needs structure, not volume
```

---

## RULE 6

```text
No optional module before first green E2E demo
```

---

## RULE 7

```text
Every phase must end with a runnable proof
```

---

# 🧠 11. FINAL MENTAL MODEL

```text
Meta MCP        = Rules
DOC-MCP         = Planner
Knowledge MCP   = Brain
Orchestrator    = Decision Engine
Execution Engine = Builder 🔥
MCPs            = Workers
```

---

# 🎯 12. FIRST ACTION PLAN (START NOW)

---

## STEP 1

Build:

* MCP Interface
* Execution Context

---

## STEP 2

Upgrade:

* MCP Registry

---

## STEP 3

Wire:

* Knowledge → Prompt

---

## STEP 4

Build:

* execution-mcp
* debug-mcp

---

## STEP 5

Build:

* website-planner-mcp
* website-builder-mcp

---

## STEP 6

Test with ONE SaaS App

---

## STEP 7

Deploy that SaaS app through the same orchestration system

---

## STEP 8

Induce one failure intentionally and confirm debug-mcp recovers it

---

# ✅ 13. MINIMUM E2E ACCEPTANCE TARGET

The first end-to-end implementation is complete only when the system can build one small SaaS app such as:

* Landing page
* Authentication
* Dashboard
* One CRUD module
* Database connection
* Tests
* Deployment output

---

## Mandatory E2E Proof

```text
Input feature
→ planner creates execution.json
→ builder generates app
→ runtime runs validators
→ debug-mcp fixes at least one failure
→ app runs locally
→ deploy artifact is created
→ logs and metrics are stored
```

---

# 🚀 14. IMPLEMENTATION PRIORITY ORDER

```text
1. contracts
2. registry
3. orchestrator
4. execution runtime
5. validators
6. debug loop
7. planner MCP
8. builder MCP
9. one SaaS template/app
10. deployment pipeline
```

---

# 🔒 15. NON-NEGOTIABLES

* No hidden manual step in the core E2E flow
* No phase may be marked complete without proof artifact
* No MCP may return unstructured output only
* No deployment claim without runnable deploy script or manifest
* No "AI-ready" claim unless prompts, schemas, retries, and validations are defined

---

# 🚀 END RESULT

You will have:

```text
✔ AI SaaS Builder System
✔ Self-healing code engine
✔ MCP-based architecture
✔ Scalable AI agency foundation
```

---

# 🔥 FINAL STATEMENT

> ❝ You are not building a project.
> You are building an AI Operating System for SaaS. ❞

---
