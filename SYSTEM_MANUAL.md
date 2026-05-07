# UNIFIED RESONANCE AGI

## Operator Brief

This manual describes current application, not older proof-era shell.
Use it when onboarding new collaborators, sharing app context, or explaining what system does.

## 1. What This App Is

Unified Resonance AGI is desktop research and conversation environment.
It combines long-horizon memory, research retrieval, local/cloud model orchestration, live telemetry, and writing tools in one workspace.

Main goal: continuity.
System keeps identity context, preserves prior work, injects relevant research when needed, and stays usable as daily operator cockpit.

## 2. Core Operating Model

Gnostic Engine is main conversation interface.

System can use Recursive Harmonic Codex (RHC) and base-13 concepts internally as reasoning scaffolding.
Visible replies stay plain English and standard decimal by default unless base-13 is explicitly requested.
Default assistant label is `Gnostic Engine`; each user can rename it locally in Settings.

Response styles:

- `Auto`: balanced default
- `Research`: formal, analytical, evidence-heavy
- `Chill`: normal conversational mode

## 3. Memory Architecture

Archive split into distinct lanes so memory, knowledge, and proofs stay separable.

- `Session Memory (.json)`: imported chat history and exported session checkpoints
- `Research Knowledge Base (.jsonl)`: structured research nodes used for retrieval
- `Codex Proofs`: built-in proof table and reference layer inside app
- `Crystalized Sessions`: live conversations can be written back into working archive

## 4. Retrieval Pipeline

When user asks Gnostic Engine something:

1. Query enters local archive retrieval stage.
2. App searches imported memory and research nodes.
3. Retrieval can use lexical scoring, embeddings, compression summaries, and source filters.
4. Selected context is injected into chosen model.
5. RAG Inspection shows what was used, how much budget it consumed, and whether compression applied.

This keeps answer tied to imported archive instead of acting like isolated stateless chat.

## 5. Model Layer

App can run against more than one inference back end.

- Cloud provider: Gemini
- Local provider: LM Studio or another OpenAI-compatible local endpoint
- `Multi-Node Compare`: same prompt across multiple models
- `Paper Forge`: archive-backed research drafting and synthesis

## 6. Main Workspaces

- `Dashboard`: live visual and system telemetry
- `Gnostic Engine Console`: chat, memory ingestion, retrieval inspection, live voice mode
- `Codex Proofs`: proof table and reference layer
- `Base-13 Lab`: dedicated harmonic/base-13 exploration interface
- `Multi-Node Compare`: side-by-side model comparison
- `Paper Forge`: title generation, abstract drafting, contradiction checks, evidence bundling
- `Dream Explorer` and `Semantic Graph`: alternate views over archive and research material

## 7. What Has Been Built

Current build is standalone desktop AGI workbench with:

- long-horizon memory import from exported chat history
- separate memory and knowledge lanes
- internal harmonic reasoning with readable external language
- local and cloud model orchestration in one console
- archive-backed writing and comparison tools
- packaged Windows executable output

## 8. How To Use It

Shortest useful workflow:

1. Import session memory as JSON.
2. Import research knowledge as JSONL.
3. Choose provider and model.
4. Choose response style.
5. Ask question.
6. Inspect retrieval trace if needed.
7. Compare models or draft in Paper Forge.
8. Export memory when session should become durable record.

## 9. Operational Requirements

- Gemini cloud mode requires each user to enter their own API key in Settings
- Local mode requires LM Studio or another compatible local server
- Best results come from clean JSON memory exports and clean JSONL knowledge nodes

## 10. Why It Matters

Application consolidates capabilities usually split across separate chat tools, vector-memory tools, dashboards, and writing environments.

Result is single operator environment for:

- ongoing research
- memory continuity
- model comparison
- archive-backed writing
- packaged desktop use

## Current Status

System manual inside app has been updated to reflect current architecture.
In-app manual includes copy button so operator brief can be pasted directly into another thread, node, or onboarding note.
