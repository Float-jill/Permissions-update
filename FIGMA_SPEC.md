# Permissions Prototype — Figma Spec

**Generated from:** `/Users/jillavis/Desktop/Permissions/src/` (App.tsx, App.css, DataStudioPeoplePage.tsx)
**Target Figma file:** https://www.figma.com/design/xZrUALQeC2yh6UuaxROSeQ/Untitled
**Date:** 2026-05-26
**Skill:** prototype-to-figma (inspect-only run — MCP write tools not yet active; reload VS Code window to enable direct Figma build)

---

## Overview

This prototype demonstrates the **Access Rights & Permissions** system for Float — specifically the left navigation shell, the Company Settings overlay (with role-based access configuration), and the Data Studio People page (with per-person permission overrides). It covers three distinct surface areas: a collapsible app rail, a full-page settings overlay, and a data table with a slide-in detail panel.

**Open questions for reviewers:**
- Should the Settings overlay be a full takeover or a side drawer?
- Do scope chips (View/Edit selectors on permission rows) need tooltips explaining "Everyone / Department / Direct reports / Project teams / Self"?
- The `grantedBy` auto-grant pattern shows locked child permissions — is the visual treatment (greyed toggle + italic description) clear enough?
- Should Starter plan users see a paywall/upsell for hidden Admin nav items, or simply not see them?

---

## Canvas layout

```
Page: "Permissions — Prototype Flows"

  Section: "Overview"
    Frame: "0 — Overview & legend"              x:100  y:100   1440×400

  Section: "Flow 1: App Rail"
    Frame: "1.1 — Rail expanded (default)"      x:100  y:700   1440×900
    Frame: "1.2 — Rail collapsed"               x:1840 y:700   1440×900
    Frame: "1.3 — Workspace menu open"          x:3580 y:700   1440×900

  Section: "Flow 2: Company Settings"
    Frame: "2.1 — Settings overlay (Access rights selected)"  x:100  y:1800  1440×900
    Frame: "2.2 — Role card expanded (Admin)"                 x:1840 y:1800  1440×900
    Frame: "2.3 — Role card edit mode"                        x:3580 y:1800  1440×900
    Frame: "2.4 — Plan = Starter (reduced Admin nav)"         x:5320 y:1800  1440×900

  Section: "Flow 3: Data Studio — People"
    Frame: "3.1 — People table (default)"       x:100  y:2900  1440×900
    Frame: "3.2 — Person panel open (Info tab)" x:1840 y:2900  1440×900
    Frame: "3.3 — Person panel (Access tab)"    x:3580 y:2900  1440×900

200px gaps between sequential frames, 400px gap between sections (Y-axis).
```

---

## Flows

---

### Flow 1: App Rail Navigation

**Goal:** Show the collapsible left nav and workspace switcher states.
**Entry point:** App loads, rail is expanded by default.

---

#### 1.1 — Rail expanded (default)

- **Frame size:** 1440×900
- **Background:** `#f3f2f5` (--bg-app)

**Layout — App Rail (left column):**

| Element | CSS class | Width | Height | Padding | Background | Border |
|---|---|---|---|---|---|---|
| Rail outer | `.app-rail` | 236px | 100vh | — | `#f8f7f9` | right: 1px `#dce2eb` |
| Header area | `.app-rail__header` | 236px | auto | 14px 10px 12px 12px | — | — |
| Brand button | `.app-rail__brand` | auto | auto | 4px 6px | transparent | radius 8px |
| Brand SVG mark | `.app-rail__brand-mark` | 42px | 16px | — | — | — |
| Brand chevron | `ChevronDown` | 14px icon | — | — | — | — |
| Notification btn | `.app-rail__notif` | 28px | 28px | — | — | radius 8px |
| Collapse btn | `.app-rail__collapse-btn` | 28px | 28px | — | — | radius 8px |

**Rail nav sections (inside `.app-rail__scroll`):**

| Section | Icon | Label | State |
|---|---|---|---|
| Global (collapsible) | BookOpen 16px | Global | expanded → shows Dashboard + Report rows |
| Locations block | BookOpen 16px per row | Beaverton HQ, Hilversum, Shanghai, New York, London, Sydney | each row has ChevronUp 16px |
| Favourites | Star 16px | Favourites | — |
| Shared | Share2 16px | Shared | — |
| Connected | Waypoints 16px | Connected | — |
| Data Studio (collapsible) | Database 16px | Data studio | expanded → shows 7 sub-items |

**Data Studio sub-items (when expanded):**

| Sub-row | Icon | Active? |
|---|---|---|
| Offices | BookOpen | — |
| People | Users | ✅ active (`#e1e4eb` bg) |
| Roles | GraduationCap | — |
| Projects | Folder | — |
| Clients | Building2 | — |
| Rate cards | DollarSign | — |
| Activity log | Clock | — |

**Main content area:**
| Element | CSS | Value |
|---|---|---|
| Background | `#ffffff` | — |
| Padding | `.settings-fullpage__content` or `.main` | 28px 36px 40px 36px |

Shows Data Studio People page (see Flow 3).

**Annotations (Interaction):**
- **Rail header:** "Workspace brand button → opens workspace menu (Flow 1.3). Collapse button → toggles rail to 56px icon-only mode (Flow 1.2)"
- **Data Studio section head:** "Click to collapse/expand Data studio sub-nav. ChevronDown rotates 180° when open."
- **People sub-row (active):** "Click any sub-row to navigate to that Data Studio section. Active row: bg `#e1e4eb`, icon colour `#0b0c10`."
- **Notification button:** "Badge shows unread count (23). Click → notification panel (not prototyped)."

---

#### 1.2 — Rail collapsed

- **Frame size:** 1440×900
- **Background:** `#f3f2f5`

**Rail changes:**
| Element | Collapsed value |
|---|---|
| Rail width | 56px (--rail-width-collapsed) |
| Header | flex-direction: column, padding: 14px 8px 12px 8px |
| Brand chevron | display: none |
| Labels | hidden (overflow: hidden, rail too narrow) |
| Icons | still visible at 16px |

**Annotations (Interaction):**
- **PanelLeft icon button:** "Click → expands rail back to 236px. Transition: width 0.2s ease."

---

#### 1.3 — Workspace menu open

- **Frame size:** 1440×900

**Workspace menu dropdown (`.workspace-menu`):**
| Property | Value |
|---|---|
| Position | absolute, top: calc(100% + 8px), left: 0 |
| Width | min-width: 268px |
| Background | `#ffffff` |
| Border | 1px `#dce2eb`, radius: 14px |
| Shadow | `0 0 1px rgba(95,106,126,0.15), 0 18px 28px rgba(9,30,66,0.15)` |
| Padding | 8px 0 |

**Menu rows** (`.workspace-menu__row`, padding 10px 14px, font 14px/400):
1. "Settings" → label only, no shortcut (triggers settings overlay)
2. Separator (`.workspace-menu__sep`, 1px `#dce2eb`)
3. "Switch workspace" + shortcut hint "O then W" + ChevronRight 16px
4. Separator
5. "Log out" + keyboard keys `⌥ ⇧ Q`

**Annotations (Interaction):**
- **Workspace menu:** "Opens on brand button click. Closes on outside click. Settings → opens Company Settings full overlay (Flow 2)."
- **Switch workspace row:** "ChevronRight indicates sub-menu (not prototyped). Shortcut: O then W."

---

### Flow 2: Company Settings Overlay

**Goal:** Admin configures role permissions. Triggered from workspace menu → Settings.
**Entry point:** Frame 1.3 (workspace menu open) → click "Settings".

---

#### 2.1 — Settings overlay, Access rights selected

- **Frame size:** 1440×900
- **Background:** `#f3f2f5`

**Settings overlay (`.settings-fullpage`) covers full viewport:**
| Layer | CSS | Value |
|---|---|---|
| Overlay wrapper | `.settings-fullpage` | position: fixed, inset: 0, z-index: 200, bg: `#ffffff` |
| Header | `.settings-fullpage__header` | height: 48px, padding: 0 16px 0 8px, border-bottom: 1px `#dce2eb` |
| Back button | `.settings-fullpage__back` | 32×32px, ArrowLeft 16px/1.5, color `#344765` |
| Title | `.settings-fullpage__title` | "Company settings", Inter 500 14px |
| Plan dropdown | `.plan-dd` | right-aligned in header, shows current plan label + ChevronDown |

**Settings left nav (`.settings-fullpage__nav`):**
| Property | Value |
|---|---|
| Width | 300px (--sidebar-width) |
| Background | `#f8f7f9` |
| Border-right | 1px `#dce2eb` |
| Padding | 20px 12px 28px 16px |
| Gap between groups | 28px |

**Org nav group (no label):**
| Icon | Label | Active? |
|---|---|---|
| CreditCard 16px | Plans & billing | — |
| Settings2 16px | General | — |
| Bell 16px | Notifications | — |
| Plug 16px | Integrations | — |
| ShieldCheck 16px | Security | — |

**Admin nav group (label: "Admin" + ChevronDown):**
| Icon | Label |
|---|---|
| UserCog 16px | Access rights ← **active** |
| Calendar 16px | Work schedule |
| DollarSign 16px | Currencies |
| Clock 16px | Time tracking |
| Users 16px | Guests |
| Umbrella 16px | Time off |
| Folder 16px | Projects |
| CheckSquare 16px | Statuses |
| Tag 16px | Tags |
| Network 16px | Departments |
| Lock 16px | Lock logged time |

**Nav row active state:**
- Background: `#e1e4eb` (--nav-active), radius: 8px
- Icon colour: `#0b0c10` (--text-primary)
- Label: `#0b0c10`, font-size: 13px, weight: 400

**Content area (`.settings-fullpage__content`):**
- Padding: 28px 36px 40px 36px
- Background: `#ffffff`
- Page header: title "Access rights" (Lexend 500 24px, line-height 32px) + description "Define what each role can view and edit across Float." (Inter 400 16px, line-height 26px, letter-spacing -0.2px)

**RBAC enforcement card (`.rbac-enforce-card`):**
| Element | CSS | Value |
|---|---|---|
| Card wrapper | border: 1px `#dce2eb`, radius: 8px, padding: 16px, mb: 24px | — |
| Title | `.rbac-enforce-card__title` | "Enforce role-based access controls", 14px/600 |
| Description | `.rbac-enforce-card__desc` | 13px/400, color `#617798` |
| Toggle | checkbox, right-aligned | off by default |

**Role cards list** (`.access-rights`, gap: 24px):
4 cards — Admin (2 members), Project manager (4), Resource planner (2), Member (6).

**Each role card (`.role-card`, collapsed):**
| Element | Value |
|---|---|
| Background | `#ffffff`, border: 1px `#dce2eb`, radius: 8px |
| Padding | 16px |
| Expand button | ChevronRight 15px/1.5 (rotates when open) |
| Role name | `.role-card__name`, 14px/600, color `#0b0c10` |
| Description | `.role-card__desc`, 13px/400, color `#344765` |
| Member count badge | border: 1px `#dce2eb`, radius: 6px, padding: 2px 8px, 12px/500 |
| Clone / Edit / Delete buttons | `.btn btn--ghost`, 13px, Copy/Pencil/Trash2 at 13px/strokeWidth 2 |

**Annotations (Interaction):**
- **Settings nav:** "Click any nav item to switch content area. Active item: `#e1e4eb` bg, icon `#0b0c10`. Admin section collapsible via ChevronDown."
- **RBAC toggle:** "Off by default. When on → enforces role permissions strictly across the app. Warning banner appears if toggled on."
- **Role card expand button:** "ChevronRight → rotates to ChevronDown when expanded. Shows permission table (Frame 2.2)."
- **Plan dropdown:** "Starter / Pro / Enterprise. Changes visible Admin nav items — Starter shows only Access rights, Time off, Statuses."

---

#### 2.2 — Role card expanded (Admin, view mode)

- **Frame size:** 1440×900

**Expanded role card shows permission table (`.cfg-table`):**

**Table structure — 1 column, 28 permission rows in 5 collapsible groups:**

| Group | # Perms | Collapsible? |
|---|---|---|
| Company | 4 | ✅ |
| Data studio | 6 | ✅ |
| Resource planning | 7 | ✅ |
| Project management | 5 | ✅ |
| Finance | 6 | ✅ |

**Group header row (`.cfg-group-row`, `.cfg-group-toggle`):**
- ChevronDown/Right 13px/1.5 + group label (13px/600) + enabled count "N / M" (12px/400 muted)

**Permission row (`.cfg-table__row`) — view mode (`ReadOnlyPermRow`):**
| Element | Value |
|---|---|
| Checkbox | checked/unchecked, read-only |
| Permission name | 13px/500, color `#0b0c10` |
| Permission description | 12px/400, color `#617798`, shown below name |
| Auto-granted row | Greyed toggle, italic description e.g. "Granted because 'Add & remove people' is enabled" |
| Scope chips (view/edit) | Shown on resource-planning perms when enabled: "View Everyone" "Edit Everyone" pills |

**Scope chip (`.scope-chip`):**
- `View` / `Edit` label dim + value button + ChevronDown 10px
- Border: 1px `#dce2eb`, radius: 6px, padding: 2px 8px, font: 12px/500

**Annotations (Interaction):**
- **Permission table:** "Read-only view mode. Shows which permissions are on/off for this role. Click Edit button to enter edit mode (Frame 2.3)."
- **cfg-group-toggle:** "Click to collapse/expand permission group. Count badge updates as permissions are toggled."
- **Auto-granted row:** "Greyed toggle — cannot be toggled independently. Enabled automatically when parent permission is on. Description explains the dependency."
- **Scope chips (view mode):** "Read-only in view mode. Show what data scope this role has. Click Edit to change."

---

#### 2.3 — Role card edit mode

- **Frame size:** 1440×900

**Changes from view mode:**
- Permission rows use `PermRow` (interactive toggles + scope dropdowns)
- Scope chips open a dropdown (`ScopeChip`) with options: Everyone / Department(s) / Direct reports / Project teams / Self
- Constraint: Edit scope rank must be ≥ View scope rank (can't be broader)
- Clone/Edit/Delete action buttons visible in card footer

**Scope chip dropdown (`.scope-chip__menu`):**
| Property | Value |
|---|---|
| Position | absolute, z-index: 50 |
| Background | `#ffffff`, border: 1px `#dce2eb` |
| Shadow | `var(--dropdown-shadow)` |
| Radius | 8px |
| Options | Everyone / Department(s) / Direct reports / Project teams / Self |
| Active option | `#e1e4eb` bg |

**Annotations (Interaction):**
- **Checkbox toggles:** "Tap to enable/disable a permission. Auto-granted children enable/disable automatically. Debounced update — no save button, changes are live."
- **Scope chip dropdown:** "Opens on click. Edit scope filtered to prevent selecting a broader scope than View. E.g. if View = 'Department', Edit options start from Department."
- **Delete button (custom roles only):** "Trash2 icon — shows only on custom (non-built-in) roles. Deletes role immediately with no undo in this prototype."

---

#### 2.4 — Plan = Starter (reduced Admin nav)

- **Frame size:** 1440×900

**Admin nav changes on Starter plan:**
Only 3 items visible (STARTER_ADMIN_IDS):
- UserCog → Access rights
- Umbrella → Time off
- CheckSquare → Statuses

Other 8 Admin items hidden entirely.

**Annotations (Interaction):**
- **Plan dropdown:** "Switch to Starter → Admin nav collapses to 3 items. Pro/Enterprise → all 11 items visible. No upsell shown — items simply disappear."

---

### Flow 3: Data Studio — People

**Goal:** Browse people, view/edit individual access settings.
**Entry point:** App loads with People sub-row active in Data Studio nav.

---

#### 3.1 — People table (default)

- **Frame size:** 1440×900 (scrollable, full content ~1200px tall)
- **Background:** `#ffffff`
- **Viewport fold at:** 900px

**Toolbar (`.dh-people__toolbar`):**
| Element | CSS | Value |
|---|---|---|
| Title | `.dh-people__title` | "64 Employees", Lexend 500 24px |
| Filter button | `.dh-people__filter-btn` | Filter 16px/1.5 + "Filter" label |
| Add person | `.dh-people__icon-add` | Plus 22px/1.5, icon-only 36×36px |
| Import/Export | `.dh-people__import` | RefreshCw 16px/1.5 + "Import/Export" label |

**Tabs row (`.dh-people__tabs-wrap`):**
- Office dropdown: "All offices" + ChevronDown 14px/1.5
- Tab bar: Employees (active) / Contractors / Departments / Delivery teams / Groups
- Active tab: Circle dot 6px + blue underline

**Sub-filters row (`.dh-people__subfilters`):**
- Plus button (add filter)
- Status chips: "64 Active" (active) / "0 Archived" / "All"

**Table (`.dh-people__table`):**
| Column | Width | Notes |
|---|---|---|
| Select (checkbox) | 40px | — |
| Name | flex 1.5 | Avatar circle 32px + name + role/title |
| Role | flex 1 | Job function (Designer etc.) + sort ChevronDown |
| Access | flex 1 | Access role badge (Admin/Project manager etc.) |
| Department | flex 1 | + sort ChevronDown |
| Delivery Team | flex 1 | + sort ChevronDown |
| Group | flex 1 | — |
| Office | flex 1 | — |

Rows: 12 sample people shown. Odd rows slightly tinted (`rgba(0,0,0,0.02)`).

**Annotations (Interaction):**
- **Table row:** "Click any row → opens person panel sliding in from the right (Frame 3.2). Row highlights on hover."
- **Filter button:** "Not yet prototyped — placeholder. Filter icon + label."
- **Add person button:** "Plus icon → add new person flow (not prototyped). 36×36px touch target."
- **Tab bar:** "Category tabs filter the table. Active tab has dot indicator + blue underline. Only Employees tab has data."

---

#### 3.2 — Person panel open (Info tab)

- **Frame size:** 1440×900

**Person panel (`.person-panel`, aside element):**
| Property | Value |
|---|---|
| Width | 380px |
| Position | fixed right-0, height: 100%, z-index: 100 |
| Background | `#ffffff` |
| Border-left | 1px `#dce2eb` |
| Shadow | `var(--dropdown-shadow)` |

**Panel header:**
- Avatar circle 40px (initials, random colour)
- Close button X 20px/strokeWidth 2 (top right)
- Person name (16px/600) + role/title (14px/400 muted)

**Panel tabs:** Info / Access / Availability / Time off (badge: 8) / Projects (badge: 76) / Manages

**Info tab content:**
- Read-only fields: Name, Email, Department, Delivery Team, Groups, Office, Access Role (badge)
- ChevronDown 14px/1.5 on dropdown fields

**Annotations (Interaction):**
- **Panel open:** "Slides in from right (transform: translateX). Table content shifts left or overlaps depending on viewport width."
- **Close button:** "X icon dismisses panel. Person row deselects."
- **Panel tabs:** "Info / Access / Availability / Time off / Projects / Manages. Only Info and Access tabs are prototyped."

---

#### 3.3 — Person panel (Access tab)

- **Frame size:** 1440×900

**Access tab content:**

**Access role section:**
- Label: "Access role" (12px/500, color `#344765`)
- Dropdown showing current role (Admin/Project manager/Resource planner/Member)
- ChevronDown 14px/1.5

**Additional permissions section:**
- Label: "Additional permissions"
- Description: "Grant specific permissions beyond what this person's role allows" (12px/400 muted)
- Categorised list: People / Projects / Settings
- Each permission: checkbox + label (13px/400)
- Enabled permissions highlighted (`rgba(46,95,232,0.06)` bg)

**Project visibility section:**
- "Can view" list of projects
- "Can edit" list of projects

**Footer:**
- Primary "Update person" button
- Ghost "Cancel" button
- "Actions" link + ChevronDown 14px/1.5

**Annotations (Interaction):**
- **Access role dropdown:** "Select from Admin / Project manager / Resource planner / Member. Change is pending until 'Update person' is clicked."
- **Additional permissions checkboxes:** "Additive only — can only grant beyond the role, never remove role permissions. Checking enables; unchecking removes. Changes pending until saved."
- **Update person button:** "Primary CTA — saves access role + additional permissions changes. On success: panel closes, row updates."

---

## Component inventory

| Code component | Props / variants | DS match | Build approach |
|---|---|---|---|
| `<PlanDropdown>` | value: starter/pro/enterprise | — | Primitive: button + dropdown list |
| App rail | expanded/collapsed | — | Primitive: vertical flex frame |
| Nav row | active/inactive, with icon | — | Primitive: horizontal flex row |
| Workspace menu | — | — | Primitive: card + rows |
| Settings overlay | — | — | Primitive: full-screen frame |
| `<NavItemIcon>` | Icon, active bool | — | Primitive: 18×18 icon container |
| Role card (collapsed) | — | — | Primitive: card frame |
| Role card (expanded) | — | — | Primitive: card + table |
| Permission group header | open/closed | — | Primitive: chevron + label + count |
| Permission row | enabled/disabled/auto-granted | — | Primitive: checkbox + label + description |
| `<ScopeChip>` | dim, value, options | — | Primitive: pill button + dropdown |
| People toolbar | — | — | Primitive: flex row |
| Tab bar | active tab | — | Primitive: button row |
| Status chip | active/inactive | — | Primitive: pill button |
| Data table | — | — | Primitive: table |
| Person panel | tab: info/access | — | Primitive: aside frame |
| Access role badge | role id | — | Primitive: coloured pill |

> ⚠️ No DS components were searched (MCP not active). All elements will be built from primitives. Once the Figma MCP is connected, re-run with `use_figma` to import DS matches and bind variables.

---

## Token reference (bind these as DS variables in Phase 4)

| Token name | Hex | Used for |
|---|---|---|
| `--bg-app` | `#f3f2f5` | Canvas / app background |
| `--bg-sidebar` / `--bg-rail` | `#f8f7f9` | Rail + settings nav background |
| `--bg-main` | `#ffffff` | Content area background |
| `--border-sidebar` | `#dce2eb` | All dividers and card borders |
| `--nav-active` | `#e1e4eb` | Active nav row fill |
| `--nav-hover` | `#ebedf0` | Nav row hover fill |
| `--text-primary` | `#0b0c10` | Headings, labels, active icons |
| `--text-secondary` | `#344765` | Body text, descriptions |
| `--text-muted` | `#617798` | Subdued / caption text |
| `--icon-default` | `#242c39` | All resting nav icons |
| `--focus-ring` | `#2e5fe8` | Brand blue, active tab indicator |
| `--dropdown-shadow` | `0 0 1px rgba(95,106,126,.15), 0 18px 28px rgba(9,30,66,.15)` | All floating surfaces |

---

## Typography reference

| Usage | Family | Weight | Size | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| Page title ("Access rights") | Lexend | 500 | 24px | 32px | 0 |
| Section card heading | Lexend | 600 | 20px | 30px | -0.3px |
| Page description | Inter | 400 | 16px | 26px | -0.2px |
| Body / permission label | Inter | 400 | 14px | 24px | -0.2px |
| Permission description | Inter | 400 | 12px | 16px | 0 |
| Form label | Inter | 500 | 12px | 16px | 0 |
| Nav item | Inter | 400 | 13px | 16px | 0 |
| Table body | Inter | 400 | 14px | 26px | -0.2px |
| Role name / card title | Inter | 600 | 14px | 20px | 0 |

---

## Figma build guide

**Page name:** `Permissions — Prototype Flows`
**Frame sizes:** 1440×900 desktop throughout. Settings panel is full-overlay, person panel is 380px wide.
**Left-to-right per flow. Branches stack vertically. 200px frame gaps, 400px section gaps.**

**Build order:**
1. Set up `Interaction` (blue) and `DS Drift` (orange) annotation categories once
2. Frame 0 — Overview legend
3. Frames 1.1 → 1.3 (App Rail)
4. Frames 2.1 → 2.4 (Settings)
5. Frames 3.1 → 3.3 (People)
6. Add flow arrows between sequential frames

**All components built from primitives** — no DS component imports until MCP write tools confirmed.

**To enable full Figma build:** Reload VS Code window, approve the Figma MCP server when prompted, then ask:
> "Use the prototype-to-figma skill and add the designs to https://www.figma.com/design/xZrUALQeC2yh6UuaxROSeQ/Untitled"
