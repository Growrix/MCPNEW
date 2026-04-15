# E2E Execution Strategy — AI MCP SaaS System

## Overview
This document outlines the end-to-end flow for building a SaaS application using the AI MCP System.

## Phase 1: Planning
1. **Input**: A high-level requirement (e.g., "Build a SaaS app with user auth").
2. **Action**: `WebsitePlannerMCP` is invoked by the `Orchestrator`.
3. **Output**:
   - `feature.md`: Descriptive intent.
   - `execution.json`: Machine-readable task list.

## Phase 2: Execution
1. **Action**: `Orchestrator` reads `execution.json` and routes tasks to appropriate MCPs.
2. **Target**: `WebsiteBuilderMCP` handles `build-ui` and `build-api` capabilities.
3. **Output**: Source code (e.g., HTML/TS files) in the `apps/` directory.

## Phase 3: Validation
1. **Action**: `SystemValidator` runs:
   - TypeScript checks (`tsc`).
   - Test suite (`vitest`).
   - Linting.
2. **Outcome**: If any check fails, the flow transitions to the Debug phase.

## Phase 4: Self-Healing (Debug Loop)
1. **Condition**: Validation failure.
2. **Action**: `DebugMCP` analyzes error logs.
3. **Output**: A fix strategy and recommendation to retry.
4. **Action**: `Orchestrator` increments retry count and re-executes the failed task.

## Phase 5: Deployment
1. **Action**: Once validation passes, deployment scripts in `deploy/` are triggered to package the application.
