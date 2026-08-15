# CloudExtend AI Skills

Official Claude skills for CloudExtend products, distributed as a Claude plugin marketplace.

## Available plugins

One plugin per ExtendInsights connector — matching how the connectors are already sold as
separate products (ExtendInsights for NetSuite, for HubSpot, for Salesforce, etc.) at
[cloudextend.io/products](https://www.cloudextend.io/products/).

| Plugin | Connector | Contents |
| --- | --- | --- |
| `extendinsights-netsuite` | ExtendInsights for NetSuite (XAVI) | `xavi-report-builder` skill — see [docs](https://support.cloudextend.io/extendinsights/en/articles/16056782-xavi-report-builder-ai-powered-financial-reports-with-claude) |

Future connectors (HubSpot, Salesforce, Stripe, Chargebee, etc.) get their own plugin the same
way, e.g. `extendinsights-hubspot`, each versioned and installed independently.

## Install

**Individual users — Claude (web, Desktop, or Claude for Excel):**
1. Open **Settings → Customize → Plugins**.
2. Click **"+"** → **Add marketplace** → **Add from a repository**.
3. Enter `cloudextend/ai-skills`.
4. Install **extendinsights-netsuite**.

**Individual users — Claude Code / CLI:**
```bash
claude plugin marketplace add cloudextend/ai-skills
claude plugin install extendinsights-netsuite@cloudextend
```
Installs at user scope by default — available in all your sessions.

**Teams (Claude Team/Enterprise organizations):**
An organization owner adds this repository under
**Organization settings → Plugins → Add plugin → GitHub** with automatic
sync enabled. All members receive the plugin and its updates — no
individual installs needed.

## Updating
Bump `"version"` in the relevant `plugin.json` on every release you want users to receive.
How updates reach users depends on the surface:
- **Claude.ai, Desktop, and org-managed installs with auto-sync** — updates apply
  automatically shortly after the push; no user action needed.
- **Claude Code / CLI** — installed plugins are not upgraded by a marketplace refresh.
  Run:
```bash
  claude plugin update extendinsights-netsuite@cloudextend
```
  (or `claude plugin uninstall` + `install` on older CLI versions). Verify with
  `claude plugin list`.

## Repository structure

```
ai-skills/
├── .claude-plugin/
│   └── marketplace.json                  # Marketplace catalog — lists one plugin per connector
└── plugins/
    └── extendinsights-netsuite/
        ├── .claude-plugin/
        │   └── plugin.json               # Plugin manifest (name, version, author, etc.)
        └── skills/
            └── xavi-report-builder/
                ├── SKILL.md               # Skill instructions Claude follows
                └── references/            # Supporting reference docs loaded on demand
```

**Grain of separation: one plugin per connector**, not per platform. `extendinsights-netsuite`
covers only the NetSuite/XAVI skill(s); a future `extendinsights-hubspot` plugin would cover
only HubSpot skills, and so on. This keeps versioning and installs scoped to what a given
customer actually uses — a NetSuite-only customer never has to install or update anything
related to HubSpot.

## Adding a new connector

1. Create `plugins/extendinsights-<connector>/.claude-plugin/plugin.json` (copy the NetSuite
   one as a template, update `name`, `description`, `keywords`).
2. Add the skill content under `plugins/extendinsights-<connector>/skills/<skill-name>/SKILL.md`.
3. Add a matching entry to the `plugins` array in `.claude-plugin/marketplace.json`.

## Adding a second skill to an existing connector plugin

Drop a new `<skill-name>/SKILL.md` (plus any `references/`) under
`plugins/<connector>/skills/`. Claude Code automatically picks up every skill directory under a
plugin's `skills/` folder — no manifest changes needed beyond bumping `version`.

## Renaming a plugin later

If a plugin's `name` ever needs to change after customers have already installed it, add a
top-level `renames` entry in `marketplace.json` mapping the old name to the new one (or to
`null` if removed) — otherwise existing installs break with a `plugin-not-found` error.
Renaming before first publish, as done here, avoids needing this.

## Validating changes before pushing

```bash
claude plugin validate .
```

Checks `marketplace.json` and every plugin's `plugin.json` / `SKILL.md` frontmatter for schema
errors, duplicate names, and path issues.

## Support

- Help Center: https://www.cloudextend.io/support/
- Email: cloudextend-support@celigo.com
