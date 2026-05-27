import './App.css'
import { ACCESS_ROLE_LABELS } from './accessRoles'
import { DataStudioPeoplePage } from './DataStudioPeoplePage'
import { Fragment, useEffect, useRef, useMemo, useState } from 'react'
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  Database,
  DollarSign,
  Folder,
  GraduationCap,
  LayoutDashboard,
  Lock,
  Network,
  PanelLeft,
  PanelLeftClose,
  Pencil,
  Plug,
  Plus,
  Settings2,
  Share2,
  ShieldCheck,
  Star,
  Tag,
  Timer,
  Trash2,
  Umbrella,
  UserCog,
  Users,
  Waypoints,
} from 'lucide-react'


export type PricingPlanId = 'starter' | 'pro' | 'enterprise'
export type OfficeModeId = 'single' | 'multi'

// ── Scope ────────────────────────────────────────────────────────────────────

export type ScopeId =
  | 'everyone'
  | 'departments'
  | 'direct-reports'
  | 'project-teams'
  | 'self'

const SCOPE_OPTIONS: { id: ScopeId; label: string }[] = [
  { id: 'everyone',       label: 'Everyone' },
  { id: 'departments',    label: 'Department(s)' },
  { id: 'direct-reports', label: 'Direct reports' },
  { id: 'project-teams',  label: 'Project teams' },
  { id: 'self',           label: 'Self' },
]

/** Higher rank = narrower scope. editScope rank must be ≥ viewScope rank. */
const SCOPE_RANK: Record<ScopeId, number> = {
  everyone: 0, departments: 1, 'direct-reports': 2, 'project-teams': 3, self: 4,
}

const PLAN_OPTIONS: { id: PricingPlanId; label: string; hint: string }[] = [
  { id: 'starter',    label: 'Starter',              hint: 'Core settings' },
  { id: 'pro',        label: 'Pro/Enterprise',        hint: 'Full org & offices' },
  { id: 'enterprise', label: 'Enterprise (future)',  hint: 'Advanced compliance & control' },
]

function PlanDropdown({
  value,
  onChange,
}: {
  value: PricingPlanId
  onChange: (plan: PricingPlanId) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const current = PLAN_OPTIONS.find((p) => p.id === value)!

  return (
    <div ref={ref} className="plan-dd">
      <button
        type="button"
        className={`plan-dd__trigger plan-dd__trigger--${value}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Pricing plan: ${current.label}. Change plan preview`}
      >
        <span className="plan-dd__trigger-text">{current.label}</span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={`plan-dd__chevron${open ? ' plan-dd__chevron--open' : ''}`}
          aria-hidden
        />
      </button>
      {open && (
        <ul className="plan-dd__menu" role="listbox">
          {PLAN_OPTIONS.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                role="option"
                aria-selected={opt.id === value}
                className={`plan-dd__option plan-dd__option--${opt.id}${opt.id === value ? ' plan-dd__option--active' : ''}`}
                onClick={() => {
                  onChange(opt.id)
                  setOpen(false)
                }}
              >
                <span className="plan-dd__option-label">{opt.label}</span>
                <span className="plan-dd__option-hint">{opt.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function OfficeModeControl({
  value,
  onChange,
}: {
  value: OfficeModeId
  onChange: (mode: OfficeModeId) => void
}) {
  return (
    <div className="office-mode-ctrl" role="group" aria-label="Office mode">
      <button
        type="button"
        className={`office-mode-ctrl__btn${value === 'single' ? ' office-mode-ctrl__btn--active' : ''}`}
        onClick={() => onChange('single')}
      >
        Single office
      </button>
      <button
        type="button"
        className={`office-mode-ctrl__btn${value === 'multi' ? ' office-mode-ctrl__btn--active' : ''}`}
        onClick={() => onChange('multi')}
      >
        Multi-office <span className="office-mode-ctrl__future">(future)</span>
      </button>
    </div>
  )
}

const ORG_NAV = [
  { id: 'billing',       label: 'Plans & billing', Icon: CreditCard,  description: 'Manage your subscription, invoices, and payment details.'           },
  { id: 'general',       label: 'General',          Icon: Settings2,   description: 'Set your plan, owner, and team name.'                               },
  { id: 'notifications', label: 'Notifications',    Icon: Bell,        description: 'Control when and how your team gets notified.'                      },
  { id: 'integrations',  label: 'Integrations',     Icon: Plug,        description: 'Connect third-party tools and manage API access.'                   },
  { id: 'security',      label: 'Security',         Icon: ShieldCheck, description: 'Configure SSO, two-factor authentication, and access policies.'     },
  { id: 'access',        label: 'Access rights',    Icon: UserCog,     description: 'Define what each role can view and edit across Float.'              },
] as const

/** Admin-section nav items (Pro / Enterprise only). */
const ADMIN_NAV = [
  { id: 'work-schedule', label: 'Work schedule',    Icon: Calendar,    description: 'Set working hours and days for your organisation.'                  },
  { id: 'currencies',    label: 'Currencies',       Icon: DollarSign,  description: 'Add currencies and set exchange rates for billing.'                 },
  { id: 'time-tracking', label: 'Time tracking',    Icon: Clock,       description: 'Configure how time is logged across projects.'                      },
  { id: 'guests',        label: 'Guests',           Icon: Users,       description: 'Manage guest access and external collaborators.'                    },
  { id: 'timeoff-org',   label: 'Time off',         Icon: Umbrella,    description: 'Set time-off types, policies, and approval workflows.'              },
  { id: 'projects',      label: 'Projects',         Icon: Folder,      description: 'Manage default project settings and templates.'                     },
  { id: 'statuses',      label: 'Statuses',         Icon: CheckSquare, description: 'Customise status options for people and projects.'                  },
  { id: 'tags',          label: 'Tags',             Icon: Tag,         description: 'Create and manage tags for people and projects.'                    },
  { id: 'departments',   label: 'Departments',      Icon: Network,     description: 'Organise your team into departments.'                               },
  { id: 'lock-logged',   label: 'Lock logged time', Icon: Lock,        description: 'Prevent edits to logged time after a set period.'                  },
] as const

/** Admin items shown on Starter (subset of ADMIN_NAV). */
const STARTER_ADMIN_IDS = new Set<string>(['timeoff-org', 'statuses'])

function adminNavForPlan(plan: PricingPlanId) {
  if (plan !== 'starter') return [...ADMIN_NAV]
  return ADMIN_NAV.filter((item) => STARTER_ADMIN_IDS.has(item.id))
}

type OfficeSectionId = (typeof OFFICE_SUBITEMS)[number]['id']

type OfficeNavActive =
  | { mode: 'overview'; officeId: string }
  | { mode: 'section'; officeId: string; childId: OfficeSectionId }

const OFFICE_SUBITEMS = [
  { id: 'policies', label: 'Policies' },
  { id: 'access', label: 'Access' },
  { id: 'work-schedule', label: 'Work schedule' },
  { id: 'currencies', label: 'Currencies' },
  { id: 'time-tracking', label: 'Time tracking' },
  { id: 'time-off', label: 'Time off' },
] as const

const OFFICES = [
  { id: 'beaverton', label: 'Beaverton HQ' },
  { id: 'hilversum', label: 'Hilversum' },
  { id: 'shanghai', label: 'Shanghai' },
  { id: 'new-york', label: 'New York' },
  { id: 'london', label: 'London' },
  { id: 'sydney', label: 'Sydney' },
] as const

// ── Access Rights ───────────────────────────────────────────────────────────

export interface ConfigPerm {
  id: string
  label: string
  description?: string     // subtitle shown below the label
  enabled: boolean
  group?: string           // which collapsible group this belongs to
  /** If set, this perm is auto-granted when the named parent perm is enabled */
  grantedBy?: string
  /** Who this role can see data for. Only on people-action perms. */
  viewScope?: ScopeId
  /** Who this role can act on. Rank must be ≥ viewScope rank (same or narrower). */
  editScope?: ScopeId
}

interface Role {
  id: string          // AccessRoleId for built-ins; free string for custom roles
  label: string
  count: number
  description: string
  configPerms: ConfigPerm[]
  footerNote?: string
  isCustom?: boolean  // true for roles added by the customer
}

interface ScopeOverride { view?: ScopeId; edit?: ScopeId }

/** Shared 28-permission template — each role gets its own copy with independent enabled flags */
function makePerms(
  enabledMap: Record<string, boolean>,
  scopeMap: Record<string, ScopeOverride> = {},
): ConfigPerm[] {
  const on = (id: string) => enabledMap[id] ?? false
  /** Spread scope fields onto people-action perms, defaulting to 'everyone'/'everyone' */
  const sc = (id: string): { viewScope: ScopeId; editScope: ScopeId } => ({
    viewScope: scopeMap[id]?.view ?? 'everyone',
    editScope: scopeMap[id]?.edit ?? 'everyone',
  })
  return [
    // ── Company ─────────────────────────────────────────────────────────────
    { id: 'billing',                  group: 'Company',             label: 'Billing',                    description: 'View and manage billing, subscription, and plan changes',                                    enabled: on('billing') },
    { id: 'security',                 group: 'Company',             label: 'Security',                   description: 'Manage SSO, 2FA, password policies, and security settings',                                 enabled: on('security') },
    { id: 'integrations',             group: 'Company',             label: 'Integrations & API keys',    description: 'Manage third-party integrations and API keys',                                               enabled: on('integrations') },
    { id: 'company-settings',         group: 'Company',             label: 'Company settings',           description: 'Edit company-wide preferences (work hours, regions, holidays, status types, time off types)', enabled: on('company-settings') },
    // ── Data studio ──────────────────────────────────────────────────────────
    { id: 'manage-offices',           group: 'Data studio',         label: 'Manage offices',             description: 'Create, edit, delete offices and manage office-level settings',                              enabled: on('manage-offices') },
    { id: 'manage-departments',       group: 'Data studio',         label: 'Manage departments',         description: 'Create, edit, delete departments',                                                           enabled: on('manage-departments') },
    { id: 'manage-roles',             group: 'Data studio',         label: 'Manage roles',               description: 'Create, edit, delete role placeholders',                                                     enabled: on('manage-roles') },
    { id: 'manage-clients',           group: 'Data studio',         label: 'Manage clients',             description: 'Create, edit, delete clients',                                                               enabled: on('manage-clients') },
    { id: 'manage-tags',              group: 'Data studio',         label: 'Manage tags',                description: 'Create, edit, delete project and people tags',                                               enabled: on('manage-tags') },
    { id: 'import-export',            group: 'Data studio',         label: 'Import / Export data',       description: 'Import and export data via bulk operations',                                                 enabled: on('import-export') },
    // ── Resource planning — scoped perms get view + edit scope ───────────────
    { id: 'add-remove-people',        group: 'Resource planning',   label: 'Add & remove people',        description: 'Create new people records, deactivate or delete people',                                     enabled: on('add-remove-people'), ...sc('add-remove-people') },
    { id: 'edit-people',              group: 'Resource planning',   label: 'Edit existing people',       description: "Granted because 'Add & remove people' is enabled",                                          enabled: on('edit-people'),        grantedBy: 'add-remove-people' },
    { id: 'approve-time-off',         group: 'Resource planning',   label: 'Approve time off',           description: 'Approve or reject time off requests',                                                       enabled: on('approve-time-off'), ...sc('approve-time-off') },
    { id: 'schedule-others',          group: 'Resource planning',   label: 'Schedule other people',      description: 'Create, edit, delete tasks and time off for other people',                                   enabled: on('schedule-others'), ...sc('schedule-others') },
    { id: 'schedule-self',            group: 'Resource planning',   label: 'Schedule themselves',        description: "Granted because 'Schedule other people' is enabled",                                        enabled: on('schedule-self'),      grantedBy: 'schedule-others' },
    { id: 'log-time-others',          group: 'Resource planning',   label: 'Log time for other people',  description: 'Create, edit, delete logged time entries for other people',                                  enabled: on('log-time-others'), ...sc('log-time-others') },
    { id: 'log-time-self',            group: 'Resource planning',   label: 'Log time for themselves',    description: "Granted because 'Log time for other people' is enabled",                                    enabled: on('log-time-self'),      grantedBy: 'log-time-others' },
    // ── Project management ───────────────────────────────────────────────────
    { id: 'add-remove-projects',      group: 'Project management',  label: 'Add & remove projects',      description: 'Create new projects, delete or archive existing projects',                                   enabled: on('add-remove-projects') },
    { id: 'edit-projects',            group: 'Project management',  label: 'Edit existing projects',     description: "Granted because 'Add & remove projects' is enabled",                                        enabled: on('edit-projects'),      grantedBy: 'add-remove-projects' },
    { id: 'manage-draft-projects',    group: 'Project management',  label: 'Manage draft projects',      description: "Granted because 'Add & remove projects' is enabled",                                        enabled: on('manage-draft-projects'), grantedBy: 'add-remove-projects' },
    { id: 'project-templates',        group: 'Project management',  label: 'Manage project templates',   description: 'Create, edit, delete project templates',                                                     enabled: on('project-templates') },
    { id: 'project-budgets',          group: 'Project management',  label: 'Manage project budgets',     description: 'Set and modify project/phase budgets, manage project expenses',                              enabled: on('project-budgets') },
    // ── Finance ──────────────────────────────────────────────────────────────
    { id: 'view-cost-rates',          group: 'Finance',             label: 'View cost rates',            description: 'See cost rate data on people and projects',                                                  enabled: on('view-cost-rates') },
    { id: 'view-bill-rates',          group: 'Finance',             label: 'View bill rates',            description: 'See bill rate data on people and projects',                                                  enabled: on('view-bill-rates') },
    { id: 'manage-cost-rates',        group: 'Finance',             label: 'Manage cost rates',          description: 'Set and modify cost rates on people',                                                        enabled: on('manage-cost-rates') },
    { id: 'manage-bill-rates',        group: 'Finance',             label: 'Manage bill rates',          description: 'Set and modify bill rates on people',                                                        enabled: on('manage-bill-rates') },
    { id: 'manage-project-bill-rates',group: 'Finance',             label: 'Manage project bill rates',  description: 'Set and modify bill rate overrides at the project or phase level',                          enabled: on('manage-project-bill-rates') },
    { id: 'manage-rate-cards',        group: 'Finance',             label: 'Manage rate cards',          description: 'Create, edit, delete rate cards',                                                            enabled: on('manage-rate-cards') },
  ]
}

export const ROLES: Role[] = [
  {
    id: 'admin',
    label: ACCESS_ROLE_LABELS.admin,
    count: 2,
    description: 'Full organisational control. Billing and Security are off by default — toggle them on to grant.',
    configPerms: makePerms({
      // Company — billing & security off by default
      integrations: true, 'company-settings': true,
      // Data studio — all on
      'manage-offices': true, 'manage-departments': true, 'manage-roles': true,
      'manage-clients': true, 'manage-tags': true, 'import-export': true,
      // Resource planning — all on
      'add-remove-people': true, 'edit-people': true, 'approve-time-off': true,
      'schedule-others': true, 'schedule-self': true, 'log-time-others': true, 'log-time-self': true,
      // Project management — all on
      'add-remove-projects': true, 'edit-projects': true, 'manage-draft-projects': true,
      'project-templates': true, 'project-budgets': true,
      // Finance — all on
      'view-cost-rates': true, 'view-bill-rates': true, 'manage-cost-rates': true,
      'manage-bill-rates': true, 'manage-project-bill-rates': true, 'manage-rate-cards': true,
    }, {
      'add-remove-people': { view: 'everyone', edit: 'everyone' },
      'approve-time-off':  { view: 'everyone', edit: 'everyone' },
      'schedule-others':   { view: 'everyone', edit: 'everyone' },
      'log-time-others':   { view: 'everyone', edit: 'everyone' },
    }),
  },
  {
    id: 'project-manager',
    label: ACCESS_ROLE_LABELS['project-manager'],
    count: 4,
    description: 'Plans and delivers projects, manages project teams and logs time for their team.',
    configPerms: makePerms({
      // Company — none
      // Data studio — clients and tags only
      'manage-clients': true, 'manage-tags': true,
      // Resource planning — scheduling and time logging
      'schedule-others': true, 'schedule-self': true,
      'log-time-others': true, 'log-time-self': true,
      // Project management — create/edit (draft only) + budgets
      'add-remove-projects': true, 'edit-projects': true, 'manage-draft-projects': true,
      'project-budgets': true,
      // Finance — view bill rates only (no cost rates)
      'view-bill-rates': true,
    }, {
      // Sees everyone on the schedule; can only act on their project teams
      'add-remove-people': { view: 'everyone', edit: 'everyone' },
      'approve-time-off':  { view: 'everyone', edit: 'project-teams' },
      'schedule-others':   { view: 'everyone', edit: 'project-teams' },
      'log-time-others':   { view: 'everyone', edit: 'project-teams' },
    }),
  },
  {
    id: 'resource-planner',
    label: ACCESS_ROLE_LABELS['resource-planner'],
    count: 2,
    description: 'Manages people records and schedules — not project delivery.',
    footerNote: 'Sees project margin % only — no cost rate or bill rate amounts.',
    configPerms: makePerms({
      // Company — none
      // Data studio — departments, roles, tags
      'manage-departments': true, 'manage-roles': true, 'manage-tags': true,
      // Resource planning — all people + scheduling; no log time for others
      'add-remove-people': true, 'edit-people': true, 'approve-time-off': true,
      'schedule-others': true, 'schedule-self': true,
      'log-time-self': true,
      // Project management — none
      // Finance — none (margin % is surfaced in reports, not a discrete permission)
    }, {
      'add-remove-people': { view: 'everyone', edit: 'everyone' },
      'approve-time-off':  { view: 'everyone', edit: 'everyone' },
      'schedule-others':   { view: 'everyone', edit: 'everyone' },
      'log-time-others':   { view: 'everyone', edit: 'everyone' },
    }),
  },
  {
    id: 'member',
    label: ACCESS_ROLE_LABELS.member,
    count: 6,
    description: 'Individual contributor. Manages their own time only.',
    configPerms: makePerms({
      // Everything off except scheduling and logging for self
      'schedule-self': true,
      'log-time-self': true,
    }, {
      'add-remove-people': { view: 'self', edit: 'self' },
      'approve-time-off':  { view: 'self', edit: 'self' },
      'schedule-others':   { view: 'self', edit: 'self' },
      'log-time-others':   { view: 'self', edit: 'self' },
    }),
  },
]

export const GROUP_ORDER = ['Company', 'Data studio', 'Resource planning', 'Project management', 'Finance']

type DraftPerms = Record<string, ConfigPerm[]>

// ── ScopeChip — inline dropdown for view / edit scope ─────────────────────

function ScopeChip({
  dim,
  value,
  minRank = 0,
  onChange,
}: {
  dim: 'View' | 'Edit'
  value: ScopeId
  /** Minimum rank allowed (inclusive). Edit scope can't be broader than view scope. */
  minRank?: number
  onChange: (v: ScopeId) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const options = SCOPE_OPTIONS.filter((o) => SCOPE_RANK[o.id] >= minRank)
  const current = SCOPE_OPTIONS.find((o) => o.id === value)!

  return (
    <span ref={ref} className="scope-chip">
      <span className="scope-chip__dim">{dim}</span>
      <button
        type="button"
        className="scope-chip__btn"
        onClick={(e) => { e.preventDefault(); setOpen((o) => !o) }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current.label}
        <ChevronDown size={10} strokeWidth={2.5} className="scope-chip__chevron" aria-hidden />
      </button>
      {open && (
        <ul className="scope-chip__menu" role="listbox">
          {options.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                role="option"
                aria-selected={opt.id === value}
                className={`scope-chip__option${opt.id === value ? ' scope-chip__option--active' : ''}`}
                onClick={() => { onChange(opt.id); setOpen(false) }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </span>
  )
}

// ── PermRow — editable permission row ─────────────────────────────────────

function PermRow({
  perm,
  isAutoGranted,
  onToggle,
  onScopeChange,
}: {
  perm: ConfigPerm
  isAutoGranted: boolean
  onToggle: () => void
  onScopeChange?: (dim: 'view' | 'edit', scope: ScopeId) => void
}) {
  const effectiveEnabled = isAutoGranted || perm.enabled
  const showScope = effectiveEnabled && !isAutoGranted && perm.viewScope !== undefined

  return (
    <tr className={`cfg-table__row${effectiveEnabled ? '' : ' cfg-table__row--off'}${isAutoGranted ? ' cfg-table__row--granted' : ''}`}>
      <td className="cfg-table__td">
        <label className={`cfg-perm-label${isAutoGranted ? ' cfg-perm-label--granted' : ''}`}>
          <input
            type="checkbox"
            className="perm-toggle"
            checked={effectiveEnabled}
            disabled={isAutoGranted}
            onChange={isAutoGranted ? undefined : onToggle}
          />
          <span className="cfg-perm-label__text">
            <span className="cfg-perm-label__name">{perm.label}</span>
            {perm.description && (
              <span className="cfg-perm-label__desc">{perm.description}</span>
            )}
            {showScope && (
              <span className="perm-scope-row">
                <ScopeChip
                  dim="View"
                  value={perm.viewScope!}
                  onChange={(v) => onScopeChange?.('view', v)}
                />
                <ScopeChip
                  dim="Edit"
                  value={perm.editScope!}
                  minRank={SCOPE_RANK[perm.viewScope!]}
                  onChange={(v) => onScopeChange?.('edit', v)}
                />
              </span>
            )}
          </span>
        </label>
      </td>
    </tr>
  )
}

function PermGroup({
  label,
  perms,
  onToggle,
  onScopeChange,
}: {
  label: string
  perms: ConfigPerm[]
  onToggle: (permId: string) => void
  onScopeChange?: (permId: string, dim: 'view' | 'edit', scope: ScopeId) => void
}) {
  const [open, setOpen] = useState(true)
  const permMap = new Map(perms.map((p) => [p.id, p]))
  const enabledCount = perms.filter((p) => {
    if (p.grantedBy) return (permMap.get(p.grantedBy)?.enabled ?? false)
    return p.enabled
  }).length

  return (
    <>
      <tr className="cfg-group-row">
        <td>
          <button type="button" className="cfg-group-toggle" onClick={() => setOpen((v) => !v)}>
            {open
              ? <ChevronDown size={13} strokeWidth={1.5} className="cfg-group-chevron" />
              : <ChevronRight size={13} strokeWidth={1.5} className="cfg-group-chevron" />}
            <span className="cfg-group-label">{label}</span>
            <span className="cfg-group-count">{enabledCount} / {perms.length}</span>
          </button>
        </td>
      </tr>
      {open && perms.map((perm) => {
        const isAutoGranted = !!perm.grantedBy && (permMap.get(perm.grantedBy)?.enabled ?? false)
        return (
          <PermRow
            key={perm.id}
            perm={perm}
            isAutoGranted={isAutoGranted}
            onToggle={() => onToggle(perm.id)}
            onScopeChange={(dim, scope) => onScopeChange?.(perm.id, dim, scope)}
          />
        )
      })}
    </>
  )
}

/** Row used in the read-only (collapsed) view */
function ReadOnlyPermRow({ perm, isAutoGranted }: { perm: ConfigPerm; isAutoGranted: boolean }) {
  const effectiveEnabled = isAutoGranted || perm.enabled
  const showScope = effectiveEnabled && perm.viewScope !== undefined

  return (
    <tr className={`cfg-table__row${effectiveEnabled ? '' : ' cfg-table__row--off'}${isAutoGranted ? ' cfg-table__row--granted' : ''}`}>
      <td className="cfg-table__td ro-perm-cell">
        <span className={`ro-perm-dot${effectiveEnabled ? ' ro-perm-dot--on' : ''}`} />
        <span className="cfg-perm-label__text">
          <span className="cfg-perm-label__name">{perm.label}</span>
          {perm.description && (
            <span className="cfg-perm-label__desc">{perm.description}</span>
          )}
          {showScope && (
            <span className="perm-scope-row perm-scope-row--ro">
              <span className="scope-pill">
                <span className="scope-pill__dim">View</span>
                <span className="scope-pill__val">
                  {SCOPE_OPTIONS.find((o) => o.id === perm.viewScope)?.label}
                </span>
              </span>
              <span className="scope-pill">
                <span className="scope-pill__dim">Edit</span>
                <span className="scope-pill__val">
                  {SCOPE_OPTIONS.find((o) => o.id === perm.editScope)?.label}
                </span>
              </span>
            </span>
          )}
        </span>
      </td>
    </tr>
  )
}

export function ReadOnlyPermGroup({ label, perms }: { label: string; perms: ConfigPerm[] }) {
  const [open, setOpen] = useState(false)
  const permMap = new Map(perms.map((p) => [p.id, p]))
  const enabledCount = perms.filter((p) => {
    if (p.grantedBy) return (permMap.get(p.grantedBy)?.enabled ?? false)
    return p.enabled
  }).length
  return (
    <>
      <tr className="cfg-group-row">
        <td>
          <button type="button" className="cfg-group-toggle" onClick={() => setOpen((v) => !v)}>
            {open
              ? <ChevronDown size={13} strokeWidth={1.5} className="cfg-group-chevron" />
              : <ChevronRight size={13} strokeWidth={1.5} className="cfg-group-chevron" />}
            <span className="cfg-group-label">{label}</span>
            <span className="cfg-group-count">{enabledCount} / {perms.length}</span>
          </button>
        </td>
      </tr>
      {open && perms.map((perm) => {
        const isAutoGranted = !!perm.grantedBy && (permMap.get(perm.grantedBy)?.enabled ?? false)
        return <ReadOnlyPermRow key={perm.id} perm={perm} isAutoGranted={isAutoGranted} />
      })}
    </>
  )
}

function AccessRightsPage({
  plan,
  rbacEnforced,
  onRbacEnforcedChange,
  onUpgradeToPro,
}: {
  plan: PricingPlanId
  rbacEnforced: boolean
  onRbacEnforcedChange: (v: boolean) => void
  onUpgradeToPro: () => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [savedPerms, setSavedPerms] = useState<DraftPerms>({})
  const [draftPerms, setDraftPerms] = useState<DraftPerms>({})
  const [confirmSaveRoleId, setConfirmSaveRoleId] = useState<string | null>(null)
  const [customRoles, setCustomRoles] = useState<Role[]>([])

  const pendingSaveRole = useMemo(
    () =>
      confirmSaveRoleId
        ? [...ROLES, ...customRoles].find((r) => r.id === confirmSaveRoleId)
        : undefined,
    [confirmSaveRoleId, customRoles],
  )

  useEffect(() => {
    setEditingId(null)
    setViewingId(null)
    setConfirmSaveRoleId(null)
  }, [plan])

  function startEdit(role: Role) {
    const base = savedPerms[role.id] ?? role.configPerms
    setDraftPerms((prev) => ({ ...prev, [role.id]: base.map((p) => ({ ...p })) }))
    setEditingId(role.id)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function saveEdit(roleId: string) {
    setSavedPerms((prev) => ({ ...prev, [roleId]: draftPerms[roleId] }))
    setEditingId(null)
  }

  function requestSave(roleId: string) {
    setConfirmSaveRoleId(roleId)
  }

  function confirmSave() {
    if (!confirmSaveRoleId) return
    saveEdit(confirmSaveRoleId)
    setConfirmSaveRoleId(null)
  }

  function dismissSaveConfirm() {
    setConfirmSaveRoleId(null)
  }

  useEffect(() => {
    if (!confirmSaveRoleId) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setConfirmSaveRoleId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmSaveRoleId])

  function togglePerm(roleId: string, permId: string) {
    setDraftPerms((prev) => {
      const perms = prev[roleId]
      const target = perms.find((p) => p.id === permId)
      if (!target) return prev
      const newEnabled = !target.enabled
      return {
        ...prev,
        [roleId]: perms.map((p) => {
          if (p.id === permId) return { ...p, enabled: newEnabled }
          // cascade: auto-granted children follow their parent's enabled state
          if (p.grantedBy === permId) return { ...p, enabled: newEnabled }
          return p
        }),
      }
    })
  }

  function setScopePerm(roleId: string, permId: string, dim: 'view' | 'edit', scope: ScopeId) {
    setDraftPerms((prev) => ({
      ...prev,
      [roleId]: prev[roleId].map((p) => {
        if (p.id !== permId) return p
        if (dim === 'view') {
          const newViewRank = SCOPE_RANK[scope]
          const curEditRank = SCOPE_RANK[p.editScope ?? 'everyone']
          // If edit is now broader than the new view, snap it to match view
          const newEdit = curEditRank < newViewRank ? scope : p.editScope
          return { ...p, viewScope: scope, editScope: newEdit }
        }
        return { ...p, editScope: scope }
      }),
    }))
  }

  // ── Custom roles ────────────────────────────────────────────────────────────

  const MAX_CUSTOM_ROLES = 12

  const [showAddModal, setShowAddModal] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleCloneId, setNewRoleCloneId] = useState<string>('')

  const allRoles = useMemo(
    () => (plan !== 'starter' ? [...ROLES, ...customRoles] : [...ROLES]),
    [plan, customRoles],
  )

  function openAddModal() {
    setNewRoleName('')
    setNewRoleCloneId('')
    setShowAddModal(true)
  }

  function closeAddModal() {
    setShowAddModal(false)
    setNewRoleName('')
    setNewRoleCloneId('')
  }

  function addCustomRole() {
    const name = newRoleName.trim()
    if (!name) return
    const id = `custom-${Date.now()}`
    const basePerms = newRoleCloneId
      ? (allRoles.find((r) => r.id === newRoleCloneId)?.configPerms ?? []).map((p) => ({ ...p }))
      : []
    const newRole: Role = {
      id,
      label: name,
      count: 0,
      description: '',
      configPerms: basePerms,
      isCustom: true,
    }
    setCustomRoles((prev) => [...prev, newRole])
    setDraftPerms((prev) => ({ ...prev, [id]: basePerms.map((p) => ({ ...p })) }))
    setEditingId(id)
    closeAddModal()
  }

  function deleteCustomRole(roleId: string) {
    setCustomRoles((prev) => prev.filter((r) => r.id !== roleId))
    if (editingId === roleId) setEditingId(null)
    if (viewingId === roleId) setViewingId(null)
  }

  function cloneRole(role: Role) {
    if (customRoles.length >= MAX_CUSTOM_ROLES) return
    const id = `custom-${Date.now()}`
    const perms = (savedPerms[role.id] ?? role.configPerms).map((p) => ({ ...p }))
    const cloned: Role = {
      id,
      label: `${role.label} (copy)`,
      count: 0,
      description: role.description,
      configPerms: perms,
      isCustom: true,
    }
    setCustomRoles((prev) => [...prev, cloned])
    setDraftPerms((prev) => ({ ...prev, [id]: perms.map((p) => ({ ...p })) }))
    setEditingId(id)
  }

  // close add-modal on Escape
  useEffect(() => {
    if (!showAddModal) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeAddModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showAddModal])

  const canEdit = plan !== 'starter'

  return (
    <div className="access-rights">
      {canEdit && pendingSaveRole && (
        <div
          className="confirm-modal-backdrop"
          role="presentation"
          onClick={dismissSaveConfirm}
        >
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-save-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-save-title" className="confirm-modal__title">
              Apply permission changes?
            </h2>
            <p className="confirm-modal__body">
              Proceeding will update permissions for all{' '}
              <strong>{pendingSaveRole.count}</strong> users assigned the{' '}
              <strong>{pendingSaveRole.label}</strong> access role. Do you want to
              continue?
            </p>
            <div className="confirm-modal__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={dismissSaveConfirm}
              >
                Cancel
              </button>
              <button type="button" className="btn btn--primary" onClick={confirmSave}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      {plan === 'starter' && (
        <div className="starter-upsell">
          <p className="starter-upsell__text">
            On Pro you can edit role permissions and apply changes to everyone assigned to that
            role — plus create up to 12 custom roles when our defaults don't fit your team.
          </p>
          <button
            type="button"
            className="btn btn--primary starter-upsell__cta"
            onClick={onUpgradeToPro}
          >
            Upgrade to Pro
          </button>
        </div>
      )}
      {canEdit && (
        <p className="access-rights__desc">
          Access roles: edit permissions here to update all users who are assigned the role,
          assign access in data studio
        </p>
      )}

      {plan === 'enterprise' && (
        <div className={`rbac-enforce-card${rbacEnforced ? ' rbac-enforce-card--on' : ''}`}>
          <div className="rbac-enforce-card__row">
            <div className="rbac-enforce-card__text">
              <p className="rbac-enforce-card__title">Enforce role-based access controls</p>
              <p className="rbac-enforce-card__desc">
                When on, per-user permission overrides are disabled across the organisation.
                Access is determined solely by each person's assigned role.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={rbacEnforced}
              className={`rbac-toggle${rbacEnforced ? ' rbac-toggle--on' : ''}`}
              onClick={() => onRbacEnforcedChange(!rbacEnforced)}
              aria-label={rbacEnforced ? 'Disable RBAC enforcement' : 'Enable RBAC enforcement'}
            >
              <span className="rbac-toggle__thumb" />
            </button>
          </div>
          {rbacEnforced && (
            <p className="rbac-enforce-card__warning">
              Per-user additional permissions are currently disabled. Existing overrides are
              preserved but not applied until enforcement is turned off.
            </p>
          )}
        </div>
      )}

      <div className="roles-table-wrap">
        <table className="roles-table">
          <thead>
            <tr>
              <th className="roles-table__th">Role</th>
              <th className="roles-table__th">Description</th>
              <th className="roles-table__th">Type</th>
              <th className="roles-table__th">Last modified by</th>
              <th className="roles-table__th">Last modified</th>
              <th className="roles-table__th" />
            </tr>
          </thead>
          <tbody>
            {allRoles.map((role) => {
              const isEditing = canEdit && editingId === role.id
              const isViewing = !isEditing && viewingId === role.id
              const isExpanded = isEditing || isViewing
              const displayPerms = isEditing
                ? draftPerms[role.id]
                : (savedPerms[role.id] ?? role.configPerms)
              const groups = GROUP_ORDER.map((g) => ({
                label: g,
                perms: (displayPerms ?? []).filter((p) => p.group === g),
              })).filter((g) => g.perms.length > 0)

              return (
                <Fragment key={role.id}>
                  <tr
                    className={`roles-table__row${isExpanded ? ' roles-table__row--expanded' : ''}`}
                    onClick={() => {
                      if (isEditing) return
                      setViewingId(isViewing ? null : role.id)
                    }}
                  >
                    <td className="roles-table__td">
                      <span className="roles-table__role-link">{role.label}</span>
                    </td>
                    <td className="roles-table__td roles-table__td--desc">
                      {role.description || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No description</span>}
                    </td>
                    <td className="roles-table__td">
                      <span className={`roles-table__type-badge${role.isCustom ? ' roles-table__type-badge--custom' : ''}`}>
                        {role.isCustom ? 'Custom' : 'Default'}
                      </span>
                    </td>
                    <td className="roles-table__td roles-table__td--meta">Float</td>
                    <td className="roles-table__td roles-table__td--meta">May 26, 2026</td>
                    <td className="roles-table__td roles-table__td--arrow">
                      <span className={`roles-table__arrow${isExpanded ? ' roles-table__arrow--open' : ''}`} aria-hidden>
                        {isExpanded ? '↓' : '→'}
                      </span>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="roles-table__detail-row">
                      <td colSpan={6} className="roles-table__detail-cell">
                        <div className="roles-table__detail">
                          <div className="role-card__table-wrap">
                            <table className={`cfg-table${isViewing ? ' cfg-table--readonly' : ''}`}>
                              <thead>
                                <tr>
                                  <th className="cfg-table__th">
                                    {isEditing ? 'Configurable permissions' : 'Permission'}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {groups.map((g) =>
                                  isEditing ? (
                                    <PermGroup
                                      key={g.label}
                                      label={g.label}
                                      perms={g.perms}
                                      onToggle={(permId) => togglePerm(role.id, permId)}
                                      onScopeChange={(permId, dim, scope) => setScopePerm(role.id, permId, dim, scope)}
                                    />
                                  ) : (
                                    <ReadOnlyPermGroup key={g.label} label={g.label} perms={g.perms} />
                                  )
                                )}
                              </tbody>
                            </table>
                            {role.footerNote && <div className="cfg-table__footer">{role.footerNote}</div>}
                          </div>
                          {canEdit && (
                            <div className="roles-table__detail-actions">
                              {isEditing ? (
                                <>
                                  <button className="btn btn--ghost" type="button" onClick={cancelEdit}>Cancel</button>
                                  <button
                                    className="btn btn--primary"
                                    type="button"
                                    onClick={() => role.isCustom ? saveEdit(role.id) : requestSave(role.id)}
                                  >
                                    Save
                                  </button>
                                </>
                              ) : (
                                <>
                                  {!role.isCustom && (
                                    <button
                                      className="btn btn--ghost"
                                      type="button"
                                      disabled={customRoles.length >= MAX_CUSTOM_ROLES}
                                      onClick={(e) => { e.stopPropagation(); cloneRole(role) }}
                                    >
                                      <Copy size={13} strokeWidth={2} aria-hidden /> Clone
                                    </button>
                                  )}
                                  <button
                                    className="btn btn--ghost"
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setViewingId(null); startEdit(role) }}
                                  >
                                    <Pencil size={13} strokeWidth={2} aria-hidden /> Edit
                                  </button>
                                  {role.isCustom && (
                                    <button
                                      className="btn btn--ghost"
                                      type="button"
                                      aria-label={`Delete ${role.label}`}
                                      onClick={(e) => { e.stopPropagation(); deleteCustomRole(role.id) }}
                                    >
                                      <Trash2 size={13} strokeWidth={2} aria-hidden />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Add custom role ─────────────────────────────────────────────────── */}
      {canEdit && (
        <div className="add-role-bar">
          <button
            type="button"
            className="btn btn--ghost add-role-bar__btn"
            onClick={openAddModal}
            disabled={customRoles.length >= MAX_CUSTOM_ROLES}
          >
            <Plus size={15} strokeWidth={1.5} aria-hidden />
            Add role
          </button>
          <span className="add-role-bar__limit">
            {customRoles.length} / {MAX_CUSTOM_ROLES} custom roles
          </span>
        </div>
      )}

      {/* ── Add role modal ──────────────────────────────────────────────────── */}
      {canEdit && showAddModal && (
        <div
          className="confirm-modal-backdrop"
          role="presentation"
          onClick={closeAddModal}
        >
          <div
            className="confirm-modal add-role-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-role-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="add-role-title" className="confirm-modal__title">Add custom role</h2>

            <div className="add-role-modal__field">
              <label htmlFor="new-role-name" className="add-role-modal__label">Role name</label>
              <input
                id="new-role-name"
                type="text"
                className="add-role-modal__input"
                placeholder="e.g. Finance viewer"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addCustomRole() }}
                autoFocus
                maxLength={48}
              />
            </div>

            <div className="add-role-modal__field">
              <label htmlFor="new-role-clone" className="add-role-modal__label">
                Start from <span className="add-role-modal__optional">(optional)</span>
              </label>
              <select
                id="new-role-clone"
                className="add-role-modal__select"
                value={newRoleCloneId}
                onChange={(e) => setNewRoleCloneId(e.target.value)}
              >
                <option value="">Blank role</option>
                {allRoles.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="confirm-modal__actions">
              <button type="button" className="btn btn--ghost" onClick={closeAddModal}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={addCustomRole}
                disabled={!newRoleName.trim()}
              >
                Create role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Shell ───────────────────────────────────────────────────────────────────

const RAIL_LOCATIONS = [
  'Beaverton HQ',
  'Hilversum',
  'Shanghai',
  'New York',
  'London',
  'Sydney',
] as const

export type DataStudioNavId =
  | 'offices'
  | 'people'
  | 'roles'
  | 'projects'
  | 'clients'
  | 'rate-cards'
  | 'activity'

const DATA_STUDIO_PLACEHOLDER: Record<DataStudioNavId, string> = {
  offices: 'Offices',
  people: 'People',
  roles: 'Roles',
  projects: 'Projects',
  clients: 'Clients',
  'rate-cards': 'Rate cards',
  activity: 'Activity log',
}

const SINGLE_OFFICE_NAV = [
  { id: 'dashboard',    label: 'Dashboard',    Icon: LayoutDashboard },
  { id: 'schedule',     label: 'Schedule',     Icon: Calendar },
  { id: 'project-plan', label: 'Project plan', Icon: Waypoints },
  { id: 'people',       label: 'People',       Icon: Users },
  { id: 'projects',     label: 'Projects',     Icon: Folder },
  { id: 'report',       label: 'Report',       Icon: BarChart3 },
  { id: 'log-team',     label: 'Log team',     Icon: Clock },
  { id: 'log-my-time',  label: 'Log my time',  Icon: Timer },
] as const

const SINGLE_OFFICE_DATA_STUDIO = [
  { id: 'roles',       label: 'Roles',       Icon: GraduationCap },
  { id: 'clients',     label: 'Clients',     Icon: Building2 },
  { id: 'rate-cards',  label: 'Rate cards',  Icon: DollarSign },
  { id: 'activity',    label: 'Activity',    Icon: Activity },
] as const

function AppRail({
  onOpenSettings,
  officeMode,
  dataStudioActive,
  onDataStudioActiveChange,
}: {
  onOpenSettings: () => void
  officeMode: OfficeModeId
  dataStudioActive: DataStudioNavId
  onDataStudioActiveChange: (id: DataStudioNavId) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [globalOpen, setGlobalOpen] = useState(true)
  const [gridOpen, setGridOpen] = useState(true)
  const [logoMenuOpen, setLogoMenuOpen] = useState(false)
  const [activeSingleOffice, setActiveSingleOffice] = useState<string>('beaverton')
  const [soNavActive, setSoNavActive] = useState<string>('schedule')
  const [soDataStudioOpen, setSoDataStudioOpen] = useState(true)
  const logoMenuRef = useRef<HTMLDivElement>(null)

  const iconSize = 16
  const iconStroke = 1.5

  useEffect(() => {
    if (!logoMenuOpen) return
    function onDocMouseDown(e: MouseEvent) {
      if (logoMenuRef.current && !logoMenuRef.current.contains(e.target as Node)) {
        setLogoMenuOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLogoMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [logoMenuOpen])

  function goToSettings() {
    setLogoMenuOpen(false)
    onOpenSettings()
  }

  return (
    <aside
      className={`app-rail${collapsed ? ' app-rail--collapsed' : ''}`}
      aria-label="Product navigation"
    >
      <header className="app-rail__header">
        <div className="app-rail__brand-wrap" ref={logoMenuRef}>
          <button
            type="button"
            className={`app-rail__brand${logoMenuOpen ? ' app-rail__brand--open' : ''}`}
            aria-label="Workspace menu"
            aria-expanded={logoMenuOpen}
            aria-haspopup="menu"
            onClick={() => setLogoMenuOpen((o) => !o)}
          >
            <svg
              className="app-rail__brand-mark"
              viewBox="0 0 48 18"
              aria-hidden
            >
              <path
                d="M2 14 Q14 2 28 10 Q36 14 46 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
            <ChevronDown size={14} strokeWidth={1.5} className="app-rail__brand-chevron" aria-hidden />
          </button>
          {logoMenuOpen && (
            <div className="workspace-menu" role="menu" aria-label="Workspace">
              <button
                type="button"
                className="workspace-menu__row"
                role="menuitem"
                onClick={goToSettings}
              >
                <span className="workspace-menu__label">Settings</span>
                <span className="workspace-menu__hint">G then S</span>
              </button>
              <div className="workspace-menu__sep" role="separator" />
              <button
                type="button"
                className="workspace-menu__row workspace-menu__row--with-chevron"
                role="menuitem"
                onClick={() => setLogoMenuOpen(false)}
              >
                <span className="workspace-menu__label">Switch workspace</span>
                <span className="workspace-menu__right">
                  <span className="workspace-menu__hint">O then W</span>
                  <ChevronRight size={16} strokeWidth={1.5} className="workspace-menu__chev" aria-hidden />
                </span>
              </button>
              <div className="workspace-menu__sep" role="separator" />
              <button
                type="button"
                className="workspace-menu__row"
                role="menuitem"
                onClick={() => setLogoMenuOpen(false)}
              >
                <span className="workspace-menu__label">Log out</span>
                <span className="workspace-menu__keys" aria-label="Option Shift Q">
                  <kbd className="workspace-menu__key">⌥</kbd>
                  <kbd className="workspace-menu__key">⇧</kbd>
                  <kbd className="workspace-menu__key">Q</kbd>
                </span>
              </button>
            </div>
          )}
        </div>
        <div className="app-rail__header-tools">
          <button type="button" className="app-rail__notif" aria-label="23 unread notifications">
            <Bell size={16} strokeWidth={1.5} aria-hidden />
            <span className="app-rail__notif-badge">23</span>
          </button>
          <button
            type="button"
            className="app-rail__collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {collapsed ? (
              <PanelLeft size={18} strokeWidth={1.5} aria-hidden />
            ) : (
              <PanelLeftClose size={18} strokeWidth={1.5} aria-hidden />
            )}
          </button>
        </div>
      </header>

      <nav className="app-rail__scroll" aria-label="Primary">
        {officeMode === 'single' ? (
          <>
            {/* ── Single office nav ─────────────────────────────────────── */}

            {/* Main nav items — flat, no section header */}
            <div className="app-rail__block">
              {SINGLE_OFFICE_NAV.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`app-rail__row${soNavActive === id ? ' app-rail__row--active' : ''}`}
                  onClick={() => setSoNavActive(id)}
                  aria-current={soNavActive === id ? 'page' : undefined}
                >
                  <Icon size={iconSize} strokeWidth={iconStroke} className="app-rail__ico" aria-hidden />
                  <span className="app-rail__row-label">{label}</span>
                </button>
              ))}
            </div>

            {/* Data studio */}
            <div className="app-rail__block app-rail__block--so-ds">
              <button
                type="button"
                className="app-rail__section-head"
                onClick={() => setSoDataStudioOpen((o) => !o)}
                aria-expanded={soDataStudioOpen}
              >
                <Database size={iconSize} strokeWidth={iconStroke} className="app-rail__ico" aria-hidden />
                <span className="app-rail__section-label">Data studio</span>
                <ChevronDown
                  size={16}
                  strokeWidth={1.5}
                  className={`app-rail__chev${soDataStudioOpen ? ' app-rail__chev--open' : ''}`}
                  aria-hidden
                />
              </button>
              {soDataStudioOpen && (
                <div className="app-rail__subnav">
                  <div className="app-rail__subnav-line" aria-hidden />
                  <div className="app-rail__subnav-rows">
                    {SINGLE_OFFICE_DATA_STUDIO.map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        className={`app-rail__subrow${dataStudioActive === id ? ' app-rail__subrow--active' : ''}`}
                        onClick={() => onDataStudioActiveChange(id as DataStudioNavId)}
                        aria-current={dataStudioActive === id ? 'page' : undefined}
                      >
                        <Icon size={iconSize} strokeWidth={iconStroke} className="app-rail__ico" aria-hidden />
                        <span className="app-rail__row-label">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* ── Multi-office nav (existing) ───────────────────────────── */}
            <div className="app-rail__block">
              <button
                type="button"
                className="app-rail__section-head"
                onClick={() => setGlobalOpen((o) => !o)}
                aria-expanded={globalOpen}
              >
                <BookOpen size={iconSize} strokeWidth={iconStroke} className="app-rail__ico" aria-hidden />
                <span className="app-rail__section-label">Global</span>
                <ChevronDown
                  size={16}
                  strokeWidth={1.5}
                  className={`app-rail__chev${globalOpen ? ' app-rail__chev--open' : ''}`}
                  aria-hidden
                />
              </button>
              {globalOpen && (
                <div className="app-rail__indent">
                  <button type="button" className="app-rail__row">
                    <LayoutDashboard size={iconSize} strokeWidth={iconStroke} className="app-rail__ico" aria-hidden />
                    <span className="app-rail__row-label">Dashboard</span>
                  </button>
                  <button type="button" className="app-rail__row">
                    <BarChart3 size={iconSize} strokeWidth={iconStroke} className="app-rail__ico" aria-hidden />
                    <span className="app-rail__row-label">Report</span>
                  </button>
                </div>
              )}
            </div>

            <div className="app-rail__block app-rail__block--locations">
              {RAIL_LOCATIONS.map((name) => (
                <button key={name} type="button" className="app-rail__location">
                  <BookOpen size={iconSize} strokeWidth={iconStroke} className="app-rail__ico" aria-hidden />
                  <span className="app-rail__row-label">{name}</span>
                  <ChevronUp size={16} strokeWidth={1.5} className="app-rail__chev-loc" aria-hidden />
                </button>
              ))}
            </div>

            <div className="app-rail__block">
              <button type="button" className="app-rail__row">
                <Star size={iconSize} strokeWidth={iconStroke} className="app-rail__ico" aria-hidden />
                <span className="app-rail__row-label">Skills graph</span>
              </button>
              <button type="button" className="app-rail__row">
                <Share2 size={iconSize} strokeWidth={iconStroke} className="app-rail__ico" aria-hidden />
                <span className="app-rail__row-label">Talent graph</span>
              </button>
              <button type="button" className="app-rail__row">
                <Waypoints size={iconSize} strokeWidth={iconStroke} className="app-rail__ico" aria-hidden />
                <span className="app-rail__row-label">Project graph</span>
              </button>
            </div>

            <div className="app-rail__block">
              <button
                type="button"
                className="app-rail__section-head"
                onClick={() => setGridOpen((o) => !o)}
                aria-expanded={gridOpen}
              >
                <Database size={iconSize} strokeWidth={iconStroke} className="app-rail__ico" aria-hidden />
                <span className="app-rail__section-label">Data studio</span>
                <ChevronDown
                  size={16}
                  strokeWidth={1.5}
                  className={`app-rail__chev${gridOpen ? ' app-rail__chev--open' : ''}`}
                  aria-hidden
                />
              </button>
              {gridOpen && (
                <div className="app-rail__subnav">
                  <div className="app-rail__subnav-line" aria-hidden />
                  <div className="app-rail__subnav-rows">
                    {(
                      [
                        { id: 'offices' as const, label: 'Offices', Icon: BookOpen },
                        { id: 'people' as const, label: 'People', Icon: Users },
                        { id: 'roles' as const, label: 'Roles', Icon: GraduationCap },
                        { id: 'projects' as const, label: 'Projects', Icon: Folder },
                        { id: 'clients' as const, label: 'Clients', Icon: Building2 },
                        { id: 'rate-cards' as const, label: 'Rate cards', Icon: DollarSign },
                        { id: 'activity' as const, label: 'Activity log', Icon: Clock },
                      ] as const
                    ).map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        className={`app-rail__subrow${dataStudioActive === id ? ' app-rail__subrow--active' : ''}`}
                        onClick={() => onDataStudioActiveChange(id)}
                        aria-current={dataStudioActive === id ? 'page' : undefined}
                      >
                        <Icon size={iconSize} strokeWidth={iconStroke} className="app-rail__ico" aria-hidden />
                        <span className="app-rail__row-label">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </nav>
    </aside>
  )
}

function NavItemIcon({ Icon, active }: { Icon: React.ElementType; active: boolean }) {
  return (
    <span className={`nav-row__icon${active ? ' nav-row__icon--active' : ''}`} aria-hidden>
      <Icon size={16} strokeWidth={1.5} />
    </span>
  )
}

export default function App() {
  const [dataStudioNavId, setDataStudioNavId] = useState<DataStudioNavId>('people')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pricingPlan, setPricingPlan] = useState<PricingPlanId>('pro')
  const [officeMode, setOfficeMode] = useState<OfficeModeId>('multi')
  const [rbacEnforced, setRbacEnforced] = useState(false)
  const [activeOrgId, setActiveOrgId] = useState<string | null>('access')
  const [expandedOfficeId, setExpandedOfficeId] = useState<string | null>('beaverton')
  const [officesUpsellOpen, setOfficesUpsellOpen] = useState(false)
  const [active, setActive] = useState<OfficeNavActive>({
    mode: 'section',
    officeId: 'beaverton',
    childId: 'policies',
  })

  function handleOfficeModeChange(mode: OfficeModeId) {
    setOfficeMode(mode)
    // If currently viewing an office section, reset to the primary office
    if (activeOrgId === null) {
      setActive({ mode: 'section', officeId: 'beaverton', childId: 'policies' })
      setExpandedOfficeId('beaverton')
    }
  }

  const orgNavItems = useMemo(() => [...ORG_NAV], [])
  const adminNavItems = useMemo(() => adminNavForPlan(pricingPlan), [pricingPlan])

  const officeLabelById = useMemo(
    () => Object.fromEntries(OFFICES.map((o) => [o.id, o.label])),
    [],
  )

  useEffect(() => {
    const allowed = new Set<string>([
      ...orgNavItems.map((i) => i.id),
      ...adminNavItems.map((i) => i.id),
    ])
    if (activeOrgId != null && !allowed.has(activeOrgId)) {
      setActiveOrgId('access')
    }
  }, [pricingPlan, orgNavItems, adminNavItems, activeOrgId])

  /** Starter: office routes aren’t available — return to org nav if user was on an office view. */
  useEffect(() => {
    if (pricingPlan !== 'starter') return
    if (activeOrgId === null) {
      setActiveOrgId('access')
    }
  }, [pricingPlan, activeOrgId])

  useEffect(() => {
    if (pricingPlan !== 'starter') setOfficesUpsellOpen(false)
  }, [pricingPlan])

  // Reset RBAC enforcement when leaving Enterprise
  useEffect(() => {
    if (pricingPlan !== 'enterprise') setRbacEnforced(false)
  }, [pricingPlan])

  useEffect(() => {
    if (!officesUpsellOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOfficesUpsellOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [officesUpsellOpen])

  useEffect(() => {
    if (!settingsOpen) return
    const el = document.getElementById('settings-sidebar')
    requestAnimationFrame(() => {
      el?.focus({ preventScroll: true })
    })
  }, [settingsOpen])

  const activeOfficeLabel = officeLabelById[active.officeId] ?? ''

  const officeTitle =
    active.mode === 'overview'
      ? 'Overview'
      : (OFFICE_SUBITEMS.find((s) => s.id === active.childId)?.label ?? 'Policies')

  const allNavItems = [...ORG_NAV, ...ADMIN_NAV]

  const orgTitle = activeOrgId
    ? (allNavItems.find((n) => n.id === activeOrgId)?.label ?? '')
    : ''

  const activeNavDescription = activeOrgId
    ? (allNavItems.find((n) => n.id === activeOrgId)?.description ?? '')
    : ''

  const mainTitle = activeOrgId ? orgTitle : officeTitle
  const mainContext = activeOrgId ? activeNavDescription : activeOfficeLabel

  const emptyPanelMessage = activeOrgId
    ? `${orgTitle} settings will appear here.`
    : active.mode === 'overview'
      ? 'Overview content for this office will appear here.'
      : `${officeTitle} settings will appear here.`

  function selectOrgItem(id: string) {
    setActiveOrgId(id)
  }

  function toggleOfficeExpand(officeId: string) {
    setExpandedOfficeId((prev) => (prev === officeId ? null : officeId))
  }

  function selectOfficeOverview(officeId: string) {
    setActiveOrgId(null)
    setActive({ mode: 'overview', officeId })
    setExpandedOfficeId(officeId)
  }

  return (
    <div className="app-shell">
      <AppRail
        onOpenSettings={() => setSettingsOpen(true)}
        officeMode={officeMode}
        dataStudioActive={dataStudioNavId}
        onDataStudioActiveChange={setDataStudioNavId}
      />
      {officesUpsellOpen && (
        <div
          className="offices-upsell-backdrop"
          role="presentation"
          onClick={() => setOfficesUpsellOpen(false)}
        >
          <div
            className="offices-upsell-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="offices-upsell-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="offices-upsell-title" className="offices-upsell-modal__title">
              Offices are included on Pro
            </h2>
            <p className="offices-upsell-modal__lede">
              Represent each site, studio, or entity in one workspace. On Pro you can open an
              office in the sidebar and manage its own policies, access, schedules, currencies,
              time tracking, and time off — without changing everyone else’s defaults.
            </p>
            <ul className="offices-upsell-modal__list">
              <li>
                <strong>Add offices</strong> for every location your team works from.
              </li>
              <li>
                <strong>Switch context</strong> in the sidebar to edit settings for just that
                office.
              </li>
              <li>
                <strong>Keep org-wide rules</strong> under Organization, and layer office
                specifics where they matter.
              </li>
            </ul>
            <div className="offices-upsell-modal__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setOfficesUpsellOpen(false)}
              >
                Not now
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  setPricingPlan('pro')
                  setOfficesUpsellOpen(false)
                }}
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      )}
      {!settingsOpen && (
        <main className="main">
          {dataStudioNavId === 'people' ? (
            <DataStudioPeoplePage rbacEnforced={rbacEnforced} />
          ) : (
            <div className="shell-placeholder" role="status">
              <p className="shell-placeholder__text">
                <strong>{DATA_STUDIO_PLACEHOLDER[dataStudioNavId]}</strong> — this section will appear here.
                Open the workspace menu (logo) and choose <strong>Settings</strong> for organization
                options.
              </p>
            </div>
          )}
        </main>
      )}
      {settingsOpen && (
        <div
          className="settings-fullpage"
          id="settings-sidebar"
          tabIndex={-1}
        >
          <header className="settings-fullpage__header">
            <button
              type="button"
              className="settings-fullpage__back"
              onClick={() => setSettingsOpen(false)}
              aria-label="Back"
            >
              <ArrowLeft size={16} strokeWidth={1.5} aria-hidden />
            </button>
            <span className="settings-fullpage__title">Company settings</span>
            <div className="settings-fullpage__header-actions" />
          </header>

          <div className="settings-fullpage__split">
            <div className="settings-fullpage__nav" aria-label="Settings sections">
              {/* Top-level nav — no section label, matches Figma */}
              <nav className="sidebar__nav" aria-label="Settings navigation">
                {orgNavItems.map((item) => {
                  const isActive = activeOrgId === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`nav-row${isActive ? ' nav-row--active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => selectOrgItem(item.id)}
                    >
                      <NavItemIcon Icon={item.Icon} active={isActive} />
                      <span className="nav-row__label">{item.label}</span>
                    </button>
                  )
                })}
              </nav>

              {/* Admin section */}
              <div>
                <p className="sidebar__section-label">Admin</p>
                <nav className="sidebar__nav" aria-label="Admin settings">
                  {adminNavItems.map((item) => {
                    const isActive = activeOrgId === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`nav-row${isActive ? ' nav-row--active' : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => selectOrgItem(item.id)}
                      >
                        <NavItemIcon Icon={item.Icon} active={isActive} />
                        <span className="nav-row__label">{item.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>

              <div>
                {pricingPlan === 'starter' ? (
                  <button
                    type="button"
                    className="sidebar__offices-starter-title"
                    onClick={() => setOfficesUpsellOpen(true)}
                    aria-haspopup="dialog"
                  >
                    <span className="sidebar__section-label sidebar__section-label--inline">Offices</span>
                    <span className="sidebar__pro-pill" title="Included on Pro">
                      Pro
                    </span>
                  </button>
                ) : officeMode === 'single' ? null : (
                  <>
                    <div className="sidebar__section-label-row">
                      <p className="sidebar__section-label sidebar__section-label--inline">Offices</p>
                    </div>
                    <div className="sidebar__nav">
                      {OFFICES.map((office) => {
                        const isExpanded = expandedOfficeId === office.id
                        const overviewActive =
                          !activeOrgId &&
                          active.mode === 'overview' &&
                          active.officeId === office.id
                        return (
                          <div key={office.id} className="office-group">
                            <div
                              className={`office-row${overviewActive ? ' office-row--office-active' : ''}`}
                            >
                              <button
                                type="button"
                                className="office-row__main"
                                onClick={() => selectOfficeOverview(office.id)}
                                aria-current={overviewActive ? 'page' : undefined}
                              >
                                <NavItemIcon Icon={Building2} active={overviewActive} />
                                <span className="nav-row__label">{office.label}</span>
                              </button>
                              <button
                                type="button"
                                className="office-row__toggle"
                                onClick={() => toggleOfficeExpand(office.id)}
                                aria-expanded={isExpanded}
                                aria-label={
                                  isExpanded
                                    ? `Collapse ${office.label} sections`
                                    : `Expand ${office.label} sections`
                                }
                              >
                                {isExpanded ? (
                                  <ChevronDown
                                    className="nav-row__chevron"
                                    size={18}
                                    strokeWidth={1.5}
                                    aria-hidden
                                  />
                                ) : (
                                  <ChevronRight
                                    className="nav-row__chevron"
                                    size={18}
                                    strokeWidth={1.5}
                                    aria-hidden
                                  />
                                )}
                              </button>
                            </div>
                            {isExpanded && (
                              <div
                                className="office-group__nested"
                                role="group"
                                aria-label={office.label}
                              >
                                {OFFICE_SUBITEMS.map((item) => {
                                  const isActive =
                                    !activeOrgId &&
                                    active.mode === 'section' &&
                                    active.officeId === office.id &&
                                    active.childId === item.id
                                  return (
                                    <button
                                      key={item.id}
                                      type="button"
                                      className={`nav-row nav-row--nested${isActive ? ' nav-row--active' : ''}`}
                                      aria-current={isActive ? 'page' : undefined}
                                      onClick={() => {
                                        setActiveOrgId(null)
                                        setActive({
                                          mode: 'section',
                                          officeId: office.id,
                                          childId: item.id,
                                        })
                                      }}
                                    >
                                      <NavItemIcon Icon={ChevronRight} active={isActive} />
                                      <span className="nav-row__label">{item.label}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="settings-fullpage__content">
              <header className="page-header">
                <h2 className="page-header__title">{mainTitle}</h2>
                <p className="page-header__context">{mainContext}</p>
              </header>

              {activeOrgId === 'access' ? (
                <AccessRightsPage
                  plan={pricingPlan}
                  rbacEnforced={rbacEnforced}
                  onRbacEnforcedChange={setRbacEnforced}
                  onUpgradeToPro={() => setPricingPlan('pro')}
                />
              ) : (
                <div className="empty-panel" role="status" aria-live="polite">
                  <p className="empty-panel__text">{emptyPanelMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Floating prototype controls ──────────────────────────────── */}
      <div className="floating-controls" role="group" aria-label="Prototype controls">
        <OfficeModeControl value={officeMode} onChange={handleOfficeModeChange} />
        <div className="floating-controls__divider" aria-hidden />
        <PlanDropdown value={pricingPlan} onChange={setPricingPlan} />
      </div>
    </div>
  )
}
