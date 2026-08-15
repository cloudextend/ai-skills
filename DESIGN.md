# Design Decisions

Record of the architecture decisions behind this repository, including what was
deliberately deferred. Read this before adding a second skill, connector, or the
router layer.

## Decided (August 2026)

**Repo name:** `ai-skills`**, not** `cloudextend-plugins`**.** "Plugins" already means the
signed Microsoft/Google marketplace add-ins in CloudExtend's product vocabulary.
This repo distributes Claude skills only.

**Plugin grain: one plugin per data-source connector** (`extendinsights-netsuite`,
future `extendinsights-hubspot`, ...), matching how connectors are sold as separate
products. Rationale: independent versioning per connector (a HubSpot fix must not
force an update on NetSuite-only customers) and install scoping (customers install
only the connectors they license).

**Skill grain: one skill per functional area, inside the connector's plugin.**
`xavi-report-builder` is NetSuite × Financial Reporting. When NetSuite scope expands
(e.g. data upload/download), add a sibling folder under
`plugins/extendinsights-netsuite/skills/` — Claude auto-discovers all skill folders;
only a version bump is needed. Do NOT create a new plugin for a new functional area
on an existing connector.

**License: custom proprietary (**`LicenseRef-CloudExtend-Proprietary`**).** The repo must
be public for the frictionless marketplace-add flow, but the content is product IP.
See LICENSE. Relaxing to a permissive license later is easy; tightening after a
permissive release is not.

## Standing constraint: no runtime-fetched instructions

Skills in this repo must ship all behavioral content (instructions, references,
templates) statically. Never instruct Claude to fetch, load, or follow content
from any external URL or endpoint at runtime — including CloudExtend's own help
center. Content updates go through a repo commit + version bump only. This is
both an architectural decision (version-controlled, auditable behavior) and a
compliance requirement for Anthropic's plugin directory policies.

## Deferred — revisit when a second skill/connector ships

`extendinsights-core` **router plugin.** The planned intent-classification +
disambiguation layer (request → candidate source(s) → ask user if ambiguous → hand
off to connector skill) is intentionally NOT built. With one connector there is
nothing to disambiguate. When connector #2 ships, decide between:

1. Adding `plugins/extendinsights-core/` with the router skill, and declaring it as
  a `dependencies` entry in each connector plugin's manifest (Claude Code installs
   dependencies transitively — verify the claude.ai/Desktop UI does the same before
   relying on it there); or
2. Merging skills into fewer plugins if the per-connector grain turns out not to
  match how customers actually install.

All options are additive to the current layout — nothing needs renaming. If a plugin
`name` ever must change post-publish, use the `renames` map in `marketplace.json`
or existing installs break.

**Items that move to core if/when it exists:**

- The session welcome + AI-disclaimer + "I accept" gate currently at the top of
`xavi-report-builder/SKILL.md` (one gate, shown once, maintained in one place).
- The source-ambiguity table (Revenue → NetSuite vs Stripe vs Chargebee, etc.).
- XAVI's aggressive trigger description should then be softened so the router is
the single entry point.

**Upload/write-back skills.** Future skills that write data INTO NetSuite/HubSpot
are materially higher-risk than read-only reporting. When designing them (or the
router's handling of them), require an explicit stronger confirmation posture; do
not assume the read-only model of xavi-report-builder.