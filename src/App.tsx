import './App.css'
import { ACCESS_ROLE_LABELS, ACCESS_ROLE_IDS, type AccessRoleId } from './accessRoles'
import { DataStudioPeoplePage, DeptTagPicker, SAMPLE_PEOPLE, AVAILABLE_ADDITIONAL_PERMISSIONS, ADDITIONAL_PERM_CATEGORIES, RolePermissionsCard } from './DataStudioPeoplePage'
import { useEffect, useRef, useMemo, useState } from 'react'
import {
  Activity,
  ArrowLeft,
  ArrowLeftRight,
  Download,
  ExternalLink,
  ListFilter,
  SlidersHorizontal,
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
  Eye,
  Folder,
  Globe,
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
  CalendarPlus,
  FileDown,
  FolderPlus,
  LayoutGrid,
  Paperclip,
  UserCog,
  UserPlus,
  Users,
  Waypoints,
  X,
} from 'lucide-react'


export type PricingPlanId = 'starter' | 'pro' | 'enterprise'
export type OfficeModeId = 'single' | 'single-dsv1' | 'single-datastudio' | 'multi'

// ── Scope ────────────────────────────────────────────────────────────────────

export type ScopeId =
  | 'everyone'
  | 'departments'
  | 'direct-reports'
  | 'project-teams'
  | 'self'

export const SCOPE_OPTIONS: { id: ScopeId; label: string; description: string }[] = [
  { id: 'everyone',        label: 'Everyone',        description: 'Can see all people in the organisation.' },
  { id: 'departments',     label: 'Department(s)',    description: 'Can see people in the selected departments only.' },
  { id: 'direct-reports',  label: 'Direct reports',  description: 'Always includes people this user directly manages.' },
  { id: 'project-teams',   label: 'Project teams',   description: 'Can see only members of projects they have access to. Designed for Project Managers — lets them plan and schedule within their projects, with Resource Planners staffing from the full people pool.' },
  { id: 'self',            label: 'Self',             description: 'Can only see themselves.' },
]


export type ProjectScopeId = 'all' | 'owned' | 'member'

const PROJECT_SCOPE_OPTIONS: { id: ProjectScopeId; label: string; description: string }[] = [
  { id: 'all',    label: 'All projects',       description: 'Can see and act on every project in the account.' },
  { id: 'owned',  label: 'Projects owned',     description: 'Can only act on projects where they are listed as an owner.' },
  { id: 'member', label: 'Projects member of', description: 'Can only act on projects where they are a member of the project team.' },
]

export type ClientScopeId = 'all' | 'client-group'

const CLIENT_SCOPE_OPTIONS: { id: ClientScopeId; label: string; description: string }[] = [
  { id: 'all',          label: 'All',                    description: 'Can see all clients in the account.' },
  { id: 'client-group', label: 'Scoped via Client group', description: 'Visibility is controlled per client group membership. Requires Pro+.' },
]

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
        Single office current
      </button>
      <button
        type="button"
        className={`office-mode-ctrl__btn${value === 'single-dsv1' ? ' office-mode-ctrl__btn--active' : ''}`}
        onClick={() => onChange('single-dsv1')}
      >
        Single office DS V1
      </button>
      <button
        type="button"
        className={`office-mode-ctrl__btn${value === 'single-datastudio' ? ' office-mode-ctrl__btn--active' : ''}`}
        onClick={() => onChange('single-datastudio')}
      >
        Single office data studio
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
  { id: 'guests',        label: 'Guests',           Icon: Users,       description: 'Guests have account access but do not appear in the schedule. Guest access is free.' },
  { id: 'timeoff-org',   label: 'Time off',         Icon: Umbrella,    description: 'Set time-off types, policies, and approval workflows.'              },
  { id: 'projects',      label: 'Projects',         Icon: Folder,      description: 'Manage default project settings and templates.'                     },
  { id: 'statuses',      label: 'Statuses',         Icon: CheckSquare, description: 'Customise status options for people and projects.'                  },
  { id: 'tags',          label: 'Tags',             Icon: Tag,         description: 'Create and manage tags for people and projects.'                    },
  { id: 'departments',   label: 'Departments',      Icon: Network,     description: 'Organise your team into departments.'                               },
  { id: 'lock-logged',   label: 'Lock logged time', Icon: Lock,        description: 'Prevent edits to logged time after a set period.'                  },
] as const

function adminNavForPlan(_plan: PricingPlanId) {
  return [...ADMIN_NAV]
}

type OfficeSectionId = (typeof OFFICE_SUBITEMS)[number]['id']

type OfficeNavActive =
  | { mode: 'overview'; officeId: string }
  | { mode: 'section'; officeId: string; childId: OfficeSectionId }

const OFFICE_SUBITEMS = [
  { id: 'policies', label: 'Policies' },
  { id: 'work-schedule', label: 'Work schedule' },
  { id: 'currencies', label: 'Currencies' },
  { id: 'time-tracking', label: 'Time tracking' },
  { id: 'time-off', label: 'Time off' },
] as const

export const OFFICES = [
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
}

interface Role {
  id: string          // AccessRoleId for built-ins; free string for custom roles
  label: string
  count: number
  description: string
  /** Data scope: the people/projects this role's permissions apply to */
  scope: ScopeId
  configPerms: ConfigPerm[]
  footerNote?: string
  isCustom?: boolean  // true for roles added by the customer
}

/** Permission template — each role gets its own copy with independent enabled flags */
function makePerms(enabledMap: Record<string, boolean>): ConfigPerm[] {
  const on = (id: string) => enabledMap[id] ?? false
  return [
    // ── People ───────────────────────────────────────────────────────────────
    { id: 'people.schedule',              group: 'People',   label: 'Schedule people',                description: 'Schedule people — can edit scope: {{people-edit-scope}}',                                                               enabled: on('people.schedule') },
    { id: 'people.create',                group: 'People',   label: 'Add new people',                 description: 'Create new people records',                                                                                             enabled: on('people.create') },
    { id: 'people.delete',                group: 'People',   label: 'Delete people',                  description: 'Delete people records',                                                                                                 enabled: on('people.delete') },
    { id: 'people.request_time_off',      group: 'People',   label: 'Request time off for self',      description: 'Request time off (Self scope)',                                                                                          enabled: on('people.request_time_off') },
    { id: 'people.approve_time_off',      group: 'People',   label: 'Approve time off requests',      description: "Approve people's time off requests — can edit scope: {{people-edit-scope}}",                                            enabled: on('people.approve_time_off') },
    { id: 'people.view_reports',          group: 'People',   label: 'View people reports',            description: 'View people reports — can view scope: {{people-view-scope}}',                                                           enabled: on('people.view_reports') },
    { id: 'people.log_time.view',         group: 'People',   label: 'View log time for people',       description: 'View logged time for others — can view scope: {{people-view-scope}}',                                                   enabled: on('people.log_time.view') },
    { id: 'people.log_time',              group: 'People',   label: 'Log time for people',            description: 'Log time for people against projects',                                                                                  enabled: on('people.log_time') },
    { id: 'people.log_time.edit',         group: 'People',   label: 'Edit logged time for people',    description: 'Edit logged time for others against projects — can edit scope: {{people-edit-scope}}',                                  enabled: on('people.log_time.edit') },
    { id: 'people.approve_log_time',      group: 'People',   label: 'Approve logged time',            description: "Approve people's logged time",                                                                                          enabled: on('people.approve_log_time') },
    { id: 'people.view_bill_rates',       group: 'People',   label: 'View bill rates',                description: 'View bill rates for roles, people and on projects',                                                                     enabled: on('people.view_bill_rates') },
    { id: 'people.view_cost_rates',       group: 'People',   label: 'View cost rates',                description: 'View cost rates for people and roles',                                                                                  enabled: on('people.view_cost_rates') },
    // ── Projects ─────────────────────────────────────────────────────────────
    { id: 'project.plan',                 group: 'Projects', label: 'Plan unassigned roles',          description: 'Plan allocations on unassigned roles — project edit scope',                                                            enabled: on('project.plan') },
    { id: 'project.create',               group: 'Projects', label: 'Create new projects',            description: 'Create new projects',                                                                                                   enabled: on('project.create') },
    { id: 'project.delete',               group: 'Projects', label: 'Delete projects',                description: 'Delete projects',                                                                                                       enabled: on('project.delete') },
    { id: 'project.manage_estimates',     group: 'Projects', label: 'Manage project estimates',       description: 'Create and edit project estimates — project edit scope',                                                               enabled: on('project.manage_estimates') },
    { id: 'project.view_budgets',         group: 'Projects', label: 'See budgets',                    description: 'View project budgets in hours and/or currency',                                                                         enabled: on('project.view_budgets') },
    { id: 'project.edit_budgets',         group: 'Projects', label: 'Set and edit project budgets',   description: 'Set and edit project budgets in hours and/or currency',                                                                 enabled: on('project.edit_budgets') },
    { id: 'project.view_profitability',   group: 'Projects', label: 'View project profitability',     description: 'View project profitability (margin, revenue) — project view scope',                                             enabled: on('project.view_profitability') },
    { id: 'project.view_reports',         group: 'Projects', label: 'View project reports',           description: 'View project-level reports — project view scope',                                                               enabled: on('project.view_reports') },
    { id: 'project.owner',                group: 'Projects', label: 'Project owner',                  description: 'Designation on the project record that activates project.edit for the designated user',                                enabled: on('project.owner') },
    { id: 'project.contributors',         group: 'Projects', label: 'Project contributors',           description: 'List of people and/or groups with edit rights on a specific project',                                                  enabled: on('project.contributors') },
    { id: 'project.view_notes',           group: 'Projects', label: 'View project notes',             description: 'View notes on projects',                                                                                                enabled: on('project.view_notes') },
    // ── Clients ──────────────────────────────────────────────────────────────
    { id: 'client.create',                group: 'Clients',  label: 'Add new clients',                description: 'Create new client records',                                                                                             enabled: on('client.create') },
    { id: 'client.delete',                group: 'Clients',  label: 'Delete clients',                 description: 'Delete client records',                                                                                                 enabled: on('client.delete') },
    { id: 'client_group.view',            group: 'Clients',  label: 'Client group visibility',        description: 'Scope controls per-user visibility policy for a client group',                                                          enabled: on('client_group.view') },
    // ── Offices ──────────────────────────────────────────────────────────────
    { id: 'office.view',                  group: 'Offices',  label: 'View office',                    description: 'View people and projects in an office',                                                                                 enabled: on('office.view') },
    { id: 'office.edit',                  group: 'Offices',  label: 'Edit office',                    description: 'Schedule, resource, and manage within an office',                                                                       enabled: on('office.edit') },
    { id: 'office.grant_access',          group: 'Offices',  label: 'Grant office access',            description: 'Grant additional office access to other users',                                                                         enabled: on('office.grant_access') },
    { id: 'office.manage_settings',       group: 'Offices',  label: 'Manage office settings',         description: 'Manage office-level settings. Operations Admin: [Office] or Company',                                                  enabled: on('office.manage_settings') },
    { id: 'office.home',                  group: 'Offices',  label: 'Home office',                    description: 'Per-user attribute. Sets default scope.',                                                                               enabled: on('office.home') },
    { id: 'office.additional_access',     group: 'Offices',  label: 'Additional office access',       description: 'Per-user multi-select of additional [Office: view] or [Office: edit] grants',                                          enabled: on('office.additional_access') },
    // ── Settings ─────────────────────────────────────────────────────────────
    { id: 'settings.manage_team',         group: 'Settings', label: 'Manage team settings',           description: 'Manage team settings',                                                                                                  enabled: on('settings.manage_team') },
    { id: 'settings.manage_billing',      group: 'Settings', label: 'Manage billing and plan',        description: 'Manage billing and plan',                                                                                               enabled: on('settings.manage_billing') },
    { id: 'settings.manage_security_sso', group: 'Settings', label: 'Manage security & SSO',          description: 'Manage SSO, domain restrictions',                                                                                       enabled: on('settings.manage_security_sso') },
    { id: 'settings.manage_api_keys',     group: 'Settings', label: 'Manage API keys',                description: 'Manage API keys',                                                                                                       enabled: on('settings.manage_api_keys') },
    { id: 'settings.access_activity_log', group: 'Settings', label: 'Access activity log',            description: "Access the activity log. If a user doesn't have permission to see an entity and they can see the activity log, they won't see the entity in the log.", enabled: on('settings.access_activity_log') },
    { id: 'settings.manage_access_rights',group: 'Settings', label: 'Manage access rights',           description: 'Manage the Access Rights settings page — view and edit profile configurations. Operations Admin: Company.',             enabled: on('settings.manage_access_rights') },
  ]
}

export const ROLES: Role[] = [
  // ── 1. Account owner — all permissions, all data ──────────────────────────
  {
    id: 'account-owner',
    label: ACCESS_ROLE_LABELS['account-owner'],
    count: 2,
    scope: 'everyone',
    description: 'Full account control. All permissions across all offices. Cannot be modified.',
    configPerms: makePerms({
      'people.view': true, 'people.edit': true, 'people.schedule': true,
      'people.create': true, 'people.delete': true, 'people.request_time_off': true,
      'people.approve_time_off': true, 'people.view_reports': true,
      'people.log_time.view': true, 'people.log_time': true, 'people.log_time.edit': true,
      'people.approve_log_time': true, 'people.view_bill_rates': true, 'people.view_cost_rates': true,
      'project.view': true, 'project.edit': true, 'project.plan': true,
      'project.create': true, 'project.delete': true, 'project.manage_estimates': true,
      'project.view_budgets': true, 'project.edit_budgets': true,
      'project.view_profitability': true, 'project.view_reports': true,
      'project.owner': true, 'project.contributors': true, 'project.view_notes': true,
      'client.view': true, 'client.create': true, 'client.edit': true, 'client.delete': true,
      'client.view_rate_cards': true, 'client.edit_rate_cards': true, 'client_group.view': true,
      'office.view': true, 'office.edit': true, 'office.grant_access': true,
      'office.manage_settings': true, 'office.home': true, 'office.additional_access': true,
      'settings.manage_team': true, 'settings.manage_billing': true,
      'settings.manage_security_sso': true, 'settings.manage_api_keys': true,
      'settings.access_activity_log': true, 'settings.manage_access_rights': true,
    }),
  },

  // ── 2. Admin — all permissions, scoped to managed offices ─────────────────
  {
    id: 'admin',
    label: ACCESS_ROLE_LABELS.admin,
    count: 5,
    scope: 'everyone',
    description: 'All permissions scoped to managed offices. Billing is off by default.',
    configPerms: makePerms({
      'people.view': true, 'people.edit': true, 'people.schedule': true,
      'people.create': true, 'people.delete': true, 'people.request_time_off': true,
      'people.approve_time_off': true, 'people.view_reports': true,
      'people.log_time.view': true, 'people.log_time': true, 'people.log_time.edit': true,
      'people.approve_log_time': true, 'people.view_bill_rates': true, 'people.view_cost_rates': true,
      'project.view': true, 'project.edit': true, 'project.plan': true,
      'project.create': true, 'project.delete': true, 'project.manage_estimates': true,
      'project.view_budgets': true, 'project.edit_budgets': true,
      'project.view_profitability': true, 'project.view_reports': true,
      'project.owner': true, 'project.contributors': true, 'project.view_notes': true,
      'client.view': true, 'client.create': true, 'client.edit': true, 'client.delete': true,
      'client.view_rate_cards': true, 'client.edit_rate_cards': true, 'client_group.view': true,
      'office.view': true, 'office.edit': true, 'office.grant_access': true,
      'office.manage_settings': true, 'office.home': true, 'office.additional_access': true,
      'settings.manage_team': true, 'settings.manage_billing': false,
      'settings.manage_security_sso': true, 'settings.manage_api_keys': true,
      'settings.access_activity_log': true, 'settings.manage_access_rights': true,
    }),
  },

  // ── 3. Project manager — projects & estimates, scoped to project teams ────
  {
    id: 'project-manager',
    label: ACCESS_ROLE_LABELS['project-manager'],
    count: 20,
    scope: 'project-teams',
    description: 'Manages projects and estimates. Scoped to projects they own or contribute to.',
    configPerms: makePerms({
      'people.view': true, 'people.schedule': true,
      'people.request_time_off': true,
      'people.log_time.view': true, 'people.log_time': true, 'people.log_time.edit': true,
      'people.view_bill_rates': true,
      'project.view': true, 'project.edit': true, 'project.plan': true,
      'project.create': true, 'project.manage_estimates': true,
      'project.view_budgets': true, 'project.edit_budgets': true,
      'project.view_reports': true, 'project.owner': true,
      'project.contributors': true, 'project.view_notes': true,
      'client.view': true, 'client.view_rate_cards': true,
      'office.view': true, 'office.home': true, 'office.additional_access': true,
    }),
  },

  // ── 5. Resource planner — all staffing, scoped to departments ─────────────
  {
    id: 'resource-planner',
    label: ACCESS_ROLE_LABELS['resource-planner'],
    count: 52,
    scope: 'departments',
    description: 'All staffing permissions. Scoped to departments or projects they own or contribute to.',
    configPerms: makePerms({
      'people.view': true, 'people.edit': true, 'people.schedule': true,
      'people.create': true, 'people.request_time_off': true,
      'people.approve_time_off': true, 'people.view_reports': true,
      'people.log_time.view': true, 'people.log_time': true,
      'project.view': true, 'project.plan': true,
      'project.view_reports': true, 'project.view_notes': true,
      'client.view': true,
      'office.view': true, 'office.edit': true,
      'office.home': true, 'office.additional_access': true,
    }),
  },

  // ── 6. Member — own data only, self scope ─────────────────────────────────
  {
    id: 'member',
    label: ACCESS_ROLE_LABELS.member,
    count: 149,
    scope: 'self',
    description: 'Individual contributor. No reports or finance data. Sees only their own data.',
    configPerms: makePerms({
      'people.view': true, 'people.request_time_off': true, 'people.log_time': true,
      'project.view': true, 'project.view_notes': true,
      'office.home': true,
    }),
  },
]

export const GROUP_ORDER = ['People', 'Projects', 'Clients', 'Offices', 'Settings']

type DraftPerms = Record<string, ConfigPerm[]>

// ── RoleScopeSelector — standalone scope control for the role card ──────────

export function RoleScopeSelector({
  value,
  onChange,
  readOnly = false,
}: {
  value: ScopeId[]
  onChange?: (v: ScopeId[]) => void
  readOnly?: boolean
}) {
  const hasEveryone = value.includes('everyone')
  // direct-reports is always locked-on unless everyone is selected
  const effectiveValue: ScopeId[] = hasEveryone
    ? value.filter((v) => v !== 'direct-reports')
    : value.includes('direct-reports') ? value : [...value, 'direct-reports']

  const selected = SCOPE_OPTIONS.filter((o) => effectiveValue.includes(o.id))
  const toggleableOptions = SCOPE_OPTIONS.filter((o) => o.id !== 'direct-reports')

  function toggle(id: ScopeId) {
    let next: ScopeId[]
    if (id === 'everyone') {
      next = effectiveValue.includes('everyone')
        ? ([...effectiveValue.filter((v) => v !== 'everyone' && v !== 'direct-reports'), 'direct-reports'] as ScopeId[])
        : ['everyone']
    } else {
      if (effectiveValue.includes(id)) {
        const without = effectiveValue.filter((v) => v !== id && v !== 'direct-reports') as ScopeId[]
        next = without.length > 0 ? ([...without, 'direct-reports'] as ScopeId[]) : [id]
      } else {
        next = [...effectiveValue.filter((v) => v !== 'everyone'), id] as ScopeId[]
      }
    }
    if (!next.includes('everyone') && !next.includes('direct-reports')) {
      next = [...next, 'direct-reports'] as ScopeId[]
    }
    onChange?.(next)
  }

  if (readOnly) {
    return (
      <div className="role-scope-selector role-scope-selector--readonly">
        <div className="role-scope-selector__pills">
          {selected.map((opt) => (
            <span key={opt.id} className="role-scope-opt role-scope-opt--active role-scope-opt--readonly">
              {opt.label}
            </span>
          ))}
        </div>
        {selected.map((opt) => (
          <p key={opt.id} className="role-scope-selector__desc">{opt.description}</p>
        ))}
      </div>
    )
  }

  return (
    <div className="role-scope-selector">
      <div className="role-scope-selector__pills">
        {toggleableOptions.map((opt) => {
          const isActive = effectiveValue.includes(opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              className={`role-scope-opt${isActive ? ' role-scope-opt--active' : ''}`}
              onClick={() => toggle(opt.id)}
              aria-pressed={isActive}
            >
              {opt.label}
            </button>
          )
        })}
        {!hasEveryone && (
          <span
            className="role-scope-opt role-scope-opt--active role-scope-opt--locked"
            title="Direct reports are always included"
          >
            Direct reports
          </span>
        )}
      </div>
      {selected.map((opt) => (
        <p key={opt.id} className="role-scope-selector__desc">{opt.description}</p>
      ))}
    </div>
  )
}

export function ProjectScopeSelector({
  value,
  onChange,
  readOnly = false,
}: {
  value: ProjectScopeId
  onChange?: (v: ProjectScopeId) => void
  readOnly?: boolean
}) {
  const active = PROJECT_SCOPE_OPTIONS.find((o) => o.id === value)

  if (readOnly) {
    return (
      <div className="role-scope-selector role-scope-selector--readonly">
        <span className="role-scope-opt role-scope-opt--active role-scope-opt--readonly">
          {active?.label ?? value}
        </span>
        {active?.description && (
          <p className="role-scope-selector__desc">{active.description}</p>
        )}
      </div>
    )
  }

  return (
    <div className="role-scope-selector">
      <div className="role-scope-selector__pills">
        {PROJECT_SCOPE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`role-scope-opt${value === opt.id ? ' role-scope-opt--active' : ''}`}
            onClick={() => onChange?.(opt.id)}
            aria-pressed={value === opt.id}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {active?.description && (
        <p className="role-scope-selector__desc">{active.description}</p>
      )}
    </div>
  )
}

export function ClientScopeSelector({
  value,
  onChange,
  readOnly = false,
}: {
  value: ClientScopeId
  onChange?: (v: ClientScopeId) => void
  readOnly?: boolean
}) {
  const active = CLIENT_SCOPE_OPTIONS.find((o) => o.id === value)

  if (readOnly) {
    return (
      <div className="role-scope-selector role-scope-selector--readonly">
        <span className="role-scope-opt role-scope-opt--active role-scope-opt--readonly">
          {active?.label ?? value}
        </span>
        {active?.description && (
          <p className="role-scope-selector__desc">{active.description}</p>
        )}
      </div>
    )
  }

  return (
    <div className="role-scope-selector">
      <div className="role-scope-selector__pills">
        {CLIENT_SCOPE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`role-scope-opt${value === opt.id ? ' role-scope-opt--active' : ''}`}
            onClick={() => onChange?.(opt.id)}
            aria-pressed={value === opt.id}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {active?.description && (
        <p className="role-scope-selector__desc">{active.description}</p>
      )}
    </div>
  )
}

// ── PermRow — editable permission row (no scope — scope is role-level) ──────

function PermRow({
  perm,
  isAutoGranted,
  onToggle,
}: {
  perm: ConfigPerm
  isAutoGranted: boolean
  onToggle: () => void
}) {
  const effectiveEnabled = isAutoGranted || perm.enabled

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
}: {
  label: string
  perms: ConfigPerm[]
  onToggle: (permId: string) => void
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
          />
        )
      })}
    </>
  )
}

/** Row used in the read-only (collapsed) view */
function ReadOnlyPermRow({ perm, isAutoGranted }: { perm: ConfigPerm; isAutoGranted: boolean }) {
  const effectiveEnabled = isAutoGranted || perm.enabled

  return (
    <tr className={`cfg-table__row${effectiveEnabled ? '' : ' cfg-table__row--off'}${isAutoGranted ? ' cfg-table__row--granted' : ''}`}>
      <td className="cfg-table__td ro-perm-cell">
        <span className={`ro-perm-dot${effectiveEnabled ? ' ro-perm-dot--on' : ''}`} />
        <span className="cfg-perm-label__text">
          <span className="cfg-perm-label__name">{perm.label}</span>
          {perm.description && (
            <span className="cfg-perm-label__desc">{perm.description}</span>
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

const GUESTS = [
  { id: '1', name: 'Jordan Blake',   email: 'jordan.blake@example.com',    access: 'Admin', joined: 'Nov 07 2023' },
  { id: '2', name: 'Priya Nair',     email: 'priya.nair@example.com',      access: 'Admin', joined: 'Jan 29 2025' },
  { id: '3', name: 'Marcus Osei',    email: 'marcus.osei@example.com',     access: 'Admin', joined: 'Jan 13 2024' },
]

const AVATAR_COLORS = ['#5b7e4a', '#4a6d8c', '#8c4a6d', '#6d4a8c', '#8c7a4a', '#4a8c7a']

function avatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

type Guest = typeof GUESTS[number]

function GuestPanel({ guest, onClose }: { guest: Guest; onClose: () => void }) {
  const [panelTab, setPanelTab] = useState<'access' | 'manages'>('access')
  const [actionsOpen, setActionsOpen] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)
  const initial = guest.name.charAt(0).toUpperCase()
  const color = avatarColor(guest.name)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!actionsOpen) return
    function onDoc(e: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setActionsOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [actionsOpen])

  return (
    <div className="guest-panel__backdrop" onClick={onClose}>
      <div className="guest-panel" role="dialog" aria-modal aria-label="Update guest" onClick={(e) => e.stopPropagation()}>
        <p className="guest-panel__heading">Update guest</p>

        <div className="guest-panel__identity">
          <span className="guest-panel__name">{guest.name}</span>
          <span className="guest-panel__avatar" style={{ background: color }}>{initial}</span>
        </div>

        <div className="guest-panel__tabs">
          <button
            className={`guest-panel__tab${panelTab === 'access' ? ' guest-panel__tab--active' : ''}`}
            onClick={() => setPanelTab('access')}
          >Access</button>
          <button
            className={`guest-panel__tab${panelTab === 'manages' ? ' guest-panel__tab--active' : ''}`}
            onClick={() => setPanelTab('manages')}
          >Manages</button>
        </div>

        <div className="guest-panel__body">
          {panelTab === 'access' && (
            <>
              <div className="guest-panel__email-card">
                <label className="guest-panel__field-label">Email</label>
                <input className="guest-panel__email-input" type="email" defaultValue={guest.email} readOnly />
              </div>

              <label className="guest-panel__field-label guest-panel__field-label--loose">Access</label>
              <div className="guest-panel__select-wrap">
                <select className="guest-panel__select" defaultValue={guest.access}>
                  <option>Admin</option>
                  <option>Member</option>
                  <option>Viewer</option>
                </select>
                <ChevronDown size={16} className="guest-panel__select-chevron" aria-hidden />
              </div>

              <div className="guest-panel__perm-row">
                <span className="guest-panel__perm-icon"><Eye size={16} strokeWidth={1.5} /></span>
                <div className="guest-panel__perm-text">
                  <span className="guest-panel__perm-title">Can view</span>
                  <span className="guest-panel__perm-desc">Specify which People they can see</span>
                </div>
                <span className="guest-panel__perm-value">Everyone</span>
              </div>

              <div className="guest-panel__divider" />

              <div className="guest-panel__perm-row">
                <span className="guest-panel__perm-icon"><Globe size={16} strokeWidth={1.5} /></span>
                <div className="guest-panel__perm-text">
                  <span className="guest-panel__perm-title">Manages</span>
                </div>
                <span className="guest-panel__perm-value">All people, projects, and settings</span>
              </div>

              <div className="guest-panel__divider" />
            </>
          )}

          {panelTab === 'manages' && (
            <p className="guest-panel__empty">No manage settings configured.</p>
          )}
        </div>

        <div className="guest-panel__footer">
          <button type="button" className="btn btn--primary" onClick={onClose}>Update</button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <div className="guest-panel__actions-wrap" ref={actionsRef}>
            <button
              type="button"
              className="guest-panel__actions-btn"
              onClick={() => setActionsOpen((o) => !o)}
            >
              Actions <ChevronDown size={14} />
            </button>
            {actionsOpen && (
              <div className="guest-panel__actions-menu">
                <button type="button" className="guest-panel__actions-item">Remove guest</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function GuestsPage() {
  const [activeTab, setActiveTab] = useState<'guests' | 'pending'>('guests')
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)

  return (
    <div className="guests-page">
      <div className="guests-card">
        <div className="guests-card__header">
          <div className="guests-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'guests'}
              className={`guests-tab${activeTab === 'guests' ? ' guests-tab--active' : ''}`}
              onClick={() => setActiveTab('guests')}
            >
              Guests <span className="guests-tab__count">{GUESTS.length}</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'pending'}
              className={`guests-tab${activeTab === 'pending' ? ' guests-tab--active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending invites <span className="guests-tab__count">0</span>
            </button>
          </div>
          <button type="button" className="btn btn--primary">Invite</button>
        </div>

        {activeTab === 'guests' && (
          <table className="guests-table">
            <thead>
              <tr>
                <th className="guests-table__th">Name</th>
                <th className="guests-table__th">Access</th>
                <th className="guests-table__th">Manages</th>
                <th className="guests-table__th">Joined</th>
              </tr>
            </thead>
            <tbody>
              {GUESTS.map((guest) => (
                <tr
                  key={guest.id}
                  className="guests-table__row guests-table__row--clickable"
                  onClick={() => setSelectedGuest(guest)}
                >
                  <td className="guests-table__td">
                    <span className="guests-table__name">{guest.name}</span>
                    <span className="guests-table__email">{guest.email}</span>
                  </td>
                  <td className="guests-table__td guests-table__td--muted">{guest.access}</td>
                  <td className="guests-table__td" />
                  <td className="guests-table__td guests-table__td--muted">{guest.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'pending' && (
          <div className="guests-empty">
            <p className="guests-empty__text">No pending invites.</p>
          </div>
        )}
      </div>

      {selectedGuest && (
        <GuestPanel guest={selectedGuest} onClose={() => setSelectedGuest(null)} />
      )}
    </div>
  )
}

// ── DSUserPanel ───────────────────────────────────────────────────────────────

type DSUserPanelRow = {
  id: string
  name: string
  email: string
  accessRoleId: string
  seat: 'schedule' | 'guest'
  department: string
  lastLogin: string
  personType: 'Employee' | 'Contractor' | 'Placeholder'
}

function DSUserPanel({ user, onClose }: { user: DSUserPanelRow; onClose: () => void }) {
  const [accessRoleId, setAccessRoleId] = useState(user.accessRoleId)
  const [seat, setSeat] = useState(user.seat)
  const [department, setDepartment] = useState(user.department)
  const [personType, setPersonType] = useState(user.personType)
  const [actionsOpen, setActionsOpen] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)
  const initial = user.name.charAt(0).toUpperCase()
  const color = avatarColor(user.name)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!actionsOpen) return
    function onDoc(e: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setActionsOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [actionsOpen])

  return (
    <div className="ds-user-drawer-backdrop" onClick={onClose}>
      <aside className="ds-user-drawer" role="dialog" aria-modal aria-label="Edit user" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="ds-user-drawer__header">
          <div className="ds-user-drawer__header-identity">
            <span className="ds-user-drawer__avatar" style={{ background: color }}>{initial}</span>
            <div>
              <span className="ds-user-drawer__name">{user.name}</span>
              <span className="ds-user-drawer__email">{user.email}</span>
            </div>
          </div>
          <button type="button" className="ds-user-drawer__close" aria-label="Close" onClick={onClose}>
            <X size={18} strokeWidth={2} aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="ds-user-drawer__body">

          {user.seat !== 'guest' && (
            <div className="ds-person-field">
              <label className="ds-person-field__label">Person type</label>
              <div className="ds-person-field__select-wrap">
                <select
                  className="ds-person-field__select"
                  value={personType}
                  onChange={e => setPersonType(e.target.value as typeof personType)}
                >
                  <option value="Employee">Employee</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Placeholder">Placeholder</option>
                </select>
                <ChevronDown size={15} className="ds-person-field__chev" aria-hidden />
              </div>
            </div>
          )}

          <div className="ds-person-field">
            <label className="ds-person-field__label">Access role</label>
            <div className="ds-person-field__select-wrap">
              <select
                className="ds-person-field__select"
                value={accessRoleId}
                onChange={e => setAccessRoleId(e.target.value)}
              >
                {ACCESS_ROLE_IDS.map(id => (
                  <option key={id} value={id}>{ACCESS_ROLE_LABELS[id]}</option>
                ))}
              </select>
              <ChevronDown size={15} className="ds-person-field__chev" aria-hidden />
            </div>
          </div>

          <div className="ds-person-field">
            <label className="ds-person-field__label">Seat</label>
            <div className="ds-person-field__select-wrap">
              <select
                className="ds-person-field__select"
                value={seat}
                onChange={e => setSeat(e.target.value as 'schedule' | 'guest')}
              >
                <option value="schedule">Schedule</option>
                <option value="guest">Guest</option>
              </select>
              <ChevronDown size={15} className="ds-person-field__chev" aria-hidden />
            </div>
          </div>

          <div className="ds-person-field">
            <label className="ds-person-field__label">Department</label>
            <input
              className="ds-person-field__input"
              type="text"
              value={department === '—' ? '' : department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="No department"
            />
          </div>

          <div className="ds-person-field">
            <label className="ds-person-field__label">Last login</label>
            <div className="ds-person-field__readonly ds-person-field__readonly--muted">{user.lastLogin}</div>
          </div>

        </div>

        {/* Footer */}
        <div className="ds-user-drawer__footer">
          <button type="button" className="btn btn--primary" onClick={onClose}>Update user</button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <div className="ds-person-panel__actions-wrap" ref={actionsRef}>
            <button
              type="button"
              className="ds-person-panel__actions-btn"
              onClick={() => setActionsOpen(o => !o)}
            >
              Actions <ChevronDown size={14} />
            </button>
            {actionsOpen && (
              <div className="ds-person-panel__actions-menu">
                <button type="button" className="ds-person-panel__actions-item">Resend invite</button>
                <button type="button" className="ds-person-panel__actions-item ds-person-panel__actions-item--danger">Remove user</button>
              </div>
            )}
          </div>
        </div>

      </aside>
    </div>
  )
}

// ── DSV1UsersPage ────────────────────────────────────────────────────────────

const DSV1_LAST_LOGIN = [
  'Today, 9:14 AM', '2 days ago', 'Jun 5, 2026', 'Jun 3, 2026', 'Today, 11:02 AM',
  'Jun 1, 2026', '3 days ago', 'Jun 7, 2026', 'May 30, 2026', 'Today, 8:47 AM',
  'Jun 4, 2026', '5 days ago', 'Jun 6, 2026', 'May 28, 2026', 'Jun 2, 2026',
]

function ManageAccessModal({ count, onClose }: { count: number; onClose: () => void }) {
  const [accessRoleId, setAccessRoleId] = useState<AccessRoleId | ''>('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="manage-access-backdrop" onClick={onClose}>
      <div
        className="manage-access-modal"
        role="dialog"
        aria-modal
        aria-labelledby="manage-access-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="manage-access-modal__header">
          <h2 className="manage-access-modal__title" id="manage-access-title">
            Manage access
          </h2>
          <p className="manage-access-modal__subtitle">
            Update access role for {count} selected {count === 1 ? 'user' : 'users'}
          </p>
        </div>

        <div className="manage-access-modal__body">
          <label className="manage-access-modal__label" htmlFor="manage-access-role">Access role</label>
          <select
            id="manage-access-role"
            className="manage-access-modal__select"
            value={accessRoleId}
            onChange={e => setAccessRoleId(e.target.value as AccessRoleId | '')}
          >
            <option value="">No change</option>
            {ACCESS_ROLE_IDS.map(id => (
              <option key={id} value={id}>{ACCESS_ROLE_LABELS[id]}</option>
            ))}
          </select>
        </div>

        <div className="manage-access-modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={!accessRoleId}
            onClick={onClose}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export function ImportPeopleModal({ onClose }: { onClose: () => void }) {
  const [prepopulate, setPrepopulate] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="import-modal-backdrop" onClick={onClose}>
      <div
        className="import-modal"
        role="dialog"
        aria-modal
        aria-labelledby="import-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="import-modal__title" id="import-modal-title">Import people</h2>

        {/* Step 1 */}
        <section className="import-modal__step">
          <h3 className="import-modal__step-heading">1. Build your list</h3>
          <p className="import-modal__step-desc">
            This template provides all the fields you'll need.{' '}
            <button type="button" className="import-modal__link" onClick={e => e.stopPropagation()}>
              See the guide
            </button>
            {' '}for help.
          </p>
          <label className="import-modal__checkbox-row">
            <input
              type="checkbox"
              className="import-modal__checkbox"
              checked={prepopulate}
              onChange={e => setPrepopulate(e.target.checked)}
            />
            Pre-populate with existing team to update people
          </label>
          <button type="button" className="import-modal__action-btn">
            <FileDown size={17} strokeWidth={1.5} aria-hidden />
            Download people template
          </button>
        </section>

        {/* Step 2 */}
        <section className="import-modal__step">
          <h3 className="import-modal__step-heading">2. Upload your CSV</h3>
          <button type="button" className="import-modal__action-btn">
            <Paperclip size={17} strokeWidth={1.5} aria-hidden />
            Upload CSV file
          </button>
        </section>

        <div className="import-modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

const GEN_ROLES_LIST = [
  'Designer','Senior Designer','Lead Designer','UX Designer','Product Designer',
  'Developer','Senior Developer','Software Engineer','Frontend Developer','Backend Developer',
  'Engineering Manager','Product Manager','Project Manager','Data Analyst','Operations Lead',
]

const GEN_DEPTS_LIST = [
  'Design','Engineering','Product','Marketing','Operations','Finance','HR','Sales','Research',
]

export function AddPersonModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [costRate, setCostRate] = useState('')
  const [billRate, setBillRate] = useState('')
  const [department, setDepartment] = useState('')
  const [tags, setTags] = useState('')
  const [personType, setPersonType] = useState('Employee')
  const [email, setEmail] = useState('')
  const [accessRoleId, setAccessRoleId] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="add-person-backdrop" onClick={onClose}>
      <div
        className="add-person-modal"
        role="dialog"
        aria-modal
        aria-labelledby="add-person-title"
        onClick={e => e.stopPropagation()}
      >
        {step === 1 ? (
          <>
            {/* Step 1: Create person */}
            <div className="add-person-modal__header">
              <h2 className="add-person-modal__title" id="add-person-title">Add person</h2>
            </div>

            <div className="add-person-modal__body">
              {/* Name */}
              <div className="add-person-modal__field">
                <label className="add-person-modal__field-label" htmlFor="ap-name">Name</label>
                <input
                  id="ap-name"
                  type="text"
                  className="add-person-modal__text-input"
                  placeholder="Full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Role / rates card */}
              <div className="add-person-modal__card">
                <div className="add-person-modal__field">
                  <label className="add-person-modal__field-label" htmlFor="ap-role">Role</label>
                  <div className="add-person-modal__select-wrap">
                    <select id="ap-role" className="add-person-modal__select" value={role} onChange={e => setRole(e.target.value)}>
                      <option value="">No role</option>
                      {GEN_ROLES_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ChevronDown size={15} className="add-person-modal__select-chev" aria-hidden />
                  </div>
                </div>

                <div className="add-person-modal__rate-row">
                  <label className="add-person-modal__field-label">Cost rate</label>
                  <div className="add-person-modal__rate-input-wrap">
                    <span className="add-person-modal__rate-prefix">$</span>
                    <input type="number" className="add-person-modal__rate-input" value={costRate} onChange={e => setCostRate(e.target.value)} placeholder="0" min="0" />
                    <span className="add-person-modal__rate-suffix">/hr</span>
                  </div>
                </div>

                <div className="add-person-modal__rate-row">
                  <label className="add-person-modal__field-label">Bill rate</label>
                  <div className="add-person-modal__rate-input-wrap">
                    <span className="add-person-modal__rate-prefix">$</span>
                    <input type="number" className="add-person-modal__rate-input" value={billRate} onChange={e => setBillRate(e.target.value)} placeholder="0" min="0" />
                    <span className="add-person-modal__rate-suffix">/hr</span>
                  </div>
                </div>
              </div>

              {/* Department */}
              <div className="add-person-modal__field">
                <label className="add-person-modal__field-label" htmlFor="ap-dept">Department</label>
                <div className="add-person-modal__select-wrap">
                  <select id="ap-dept" className="add-person-modal__select" value={department} onChange={e => setDepartment(e.target.value)}>
                    <option value="">No department</option>
                    {GEN_DEPTS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={15} className="add-person-modal__select-chev" aria-hidden />
                </div>
              </div>

              {/* Tags */}
              <div className="add-person-modal__field">
                <label className="add-person-modal__field-label" htmlFor="ap-tags">Tags</label>
                <input id="ap-tags" type="text" className="add-person-modal__text-input" placeholder="No tags" value={tags} onChange={e => setTags(e.target.value)} />
              </div>

              {/* Type */}
              <div className="add-person-modal__field">
                <label className="add-person-modal__field-label" htmlFor="ap-type">Type</label>
                <div className="add-person-modal__select-wrap">
                  <select id="ap-type" className="add-person-modal__select" value={personType} onChange={e => setPersonType(e.target.value)}>
                    <option value="Employee">Employee</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Placeholder">Placeholder</option>
                  </select>
                  <ChevronDown size={15} className="add-person-modal__select-chev" aria-hidden />
                </div>
              </div>
            </div>

            <div className="add-person-modal__footer">
              <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
              <button type="button" className="btn btn--primary" onClick={() => setStep(2)}>
                Add person
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Step 2: Invite (optional) */}
            <div className="add-person-modal__header">
              <h2 className="add-person-modal__title" id="add-person-title">
                {name || 'Person'} added
              </h2>
              <p className="add-person-modal__subtitle">
                Send them an invite to access Float. You can always do this later from their profile.
              </p>
            </div>

            <div className="add-person-modal__body">
              <div className="add-person-modal__field">
                <label className="add-person-modal__field-label" htmlFor="ap-email">Email</label>
                <input
                  id="ap-email"
                  type="email"
                  className="add-person-modal__text-input"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="add-person-modal__field">
                <label className="add-person-modal__field-label" htmlFor="ap-access">Access role</label>
                <div className="add-person-modal__select-wrap">
                  <select id="ap-access" className="add-person-modal__select" value={accessRoleId} onChange={e => setAccessRoleId(e.target.value)}>
                    <option value="">Select a role</option>
                    {ACCESS_ROLE_IDS.map(id => (
                      <option key={id} value={id}>{ACCESS_ROLE_LABELS[id]}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="add-person-modal__select-chev" aria-hidden />
                </div>
              </div>
            </div>

            <div className="add-person-modal__footer">
              <button type="button" className="btn btn--ghost" onClick={onClose}>Skip for now</button>
              <button type="button" className="btn btn--primary" disabled={!email || !accessRoleId} onClick={onClose}>
                Send invite
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function InviteGuestModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [accessRoleId, setAccessRoleId] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="invite-guest-backdrop" onClick={onClose}>
      <div
        className="invite-guest-modal"
        role="dialog"
        aria-modal
        aria-labelledby="invite-guest-title"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="invite-guest-modal__title" id="invite-guest-title">Invite guest</h2>

        {/* Identity row */}
        <div className="invite-guest-modal__identity">
          <span className="invite-guest-modal__name-placeholder">Name</span>
          <span className="invite-guest-modal__avatar-placeholder" aria-hidden />
        </div>

        {/* Tab */}
        <div className="invite-guest-modal__tabs">
          <span className="invite-guest-modal__tab invite-guest-modal__tab--active">Access</span>
        </div>

        {/* Email card */}
        <div className="invite-guest-modal__email-card">
          <label className="invite-guest-modal__field-label" htmlFor="invite-email">Email</label>
          <input
            id="invite-email"
            type="email"
            className="invite-guest-modal__email-input"
            placeholder="email@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
          />
        </div>

        {/* Access role */}
        <div className="invite-guest-modal__field">
          <label className="invite-guest-modal__field-label" htmlFor="invite-role">Access</label>
          <div className="invite-guest-modal__select-wrap">
            <select
              id="invite-role"
              className="invite-guest-modal__select"
              value={accessRoleId}
              onChange={e => setAccessRoleId(e.target.value)}
            >
              <option value="">Select a role</option>
              {ACCESS_ROLE_IDS.map(id => (
                <option key={id} value={id}>{ACCESS_ROLE_LABELS[id]}</option>
              ))}
            </select>
            <ChevronDown size={15} className="invite-guest-modal__select-chev" aria-hidden />
          </div>
        </div>

        <div className="invite-guest-modal__divider" />

        {/* Message */}
        <div className="invite-guest-modal__field">
          <label className="invite-guest-modal__field-label" htmlFor="invite-message">Message</label>
          <textarea
            id="invite-message"
            className="invite-guest-modal__textarea"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
          />
          <p className="invite-guest-modal__hint">When you invite them we'll send an email with login details.</p>
        </div>

        {/* Footer */}
        <div className="invite-guest-modal__footer">
          <button type="button" className="btn btn--primary invite-guest-modal__invite-btn" onClick={onClose}>
            Invite
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function DSV1UsersPage() {
  const schedulePeople = SAMPLE_PEOPLE.slice(0, 15)

  type V1UserRow = {
    id: string
    name: string
    email: string
    accessRoleId: string
    seat: 'schedule' | 'guest'
    lastActivity: string
  }

  const rows: V1UserRow[] = [
    ...schedulePeople.map((p, i) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      accessRoleId: p.accessRoleId,
      seat: 'schedule' as const,
      lastActivity: DSV1_LAST_LOGIN[i % DSV1_LAST_LOGIN.length],
    })),
    ...GUESTS.map((g) => ({
      id: `guest-${g.id}`,
      name: g.name,
      email: g.email,
      accessRoleId: 'admin',
      seat: 'guest' as const,
      lastActivity: 'Invite pending',
    })),
  ]

  const [seatTab, setSeatTab] = useState<'schedule' | 'guest'>('schedule')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectedUser, setSelectedUser] = useState<V1UserRow | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showAddPersonModal, setShowAddPersonModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showManageAccessModal, setShowManageAccessModal] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const addMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showAddMenu) return
    function onDoc(e: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setShowAddMenu(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [showAddMenu])

  const displayRows = rows.filter(r => r.seat === seatTab)
  const allChecked = displayRows.length > 0 && displayRows.every(r => selected.has(r.id))
  const someChecked = displayRows.some(r => selected.has(r.id))

  function toggleAll() {
    if (allChecked) { setSelected(new Set()) }
    else { setSelected(new Set(displayRows.map(r => r.id))) }
  }
  function toggleRow(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const TABS = [
    { id: 'schedule' as const, label: 'Schedule seats', count: schedulePeople.length },
    { id: 'guest' as const,    label: 'Guests',         count: GUESTS.length },
  ]

  return (
    <div className="ds-users-page">
      {/* Header */}
      <div className="ds-people-header">
        <div className="ds-people-header__left">
          <h1 className="ds-people-header__title">Users</h1>
          <button type="button" className="ds-people-header__filter-btn">
            <ListFilter size={14} strokeWidth={1.75} />
            Filter
            <ChevronDown size={13} strokeWidth={1.75} />
          </button>
        </div>
        <div className="ds-people-header__right">
          <button type="button" className="ds-people-header__action-btn" onClick={() => setShowImportModal(true)}>
            <Download size={14} strokeWidth={1.75} />
            Import
          </button>
          <button type="button" className="ds-people-header__icon-btn" aria-label="Export">
            <ExternalLink size={14} strokeWidth={1.75} />
          </button>
          <div className="ds-add-menu-wrap" ref={addMenuRef}>
            <button
              type="button"
              className="btn btn--primary ds-people-header__add-btn"
              aria-label="Add"
              aria-haspopup="true"
              aria-expanded={showAddMenu}
              onClick={() => setShowAddMenu(o => !o)}
            >
              <Plus size={16} strokeWidth={2} />
            </button>
            {showAddMenu && (
              <div className="ds-add-menu" role="menu">
                {([
                  { label: 'Allocate time', shortcut: 'T', Icon: LayoutGrid },
                  { label: 'Log time',      shortcut: 'G', Icon: Clock },
                  { label: 'Add time off',  shortcut: 'I', Icon: CalendarPlus },
                  { label: 'Add project',   shortcut: 'P', Icon: FolderPlus },
                  { label: 'Add person',    shortcut: 'E', Icon: UserPlus },
                ] as const).map(({ label, shortcut, Icon }) => (
                  <button
                    key={label}
                    type="button"
                    role="menuitem"
                    className="ds-add-menu__item"
                    onClick={() => { setShowAddMenu(false); if (label === 'Add person') setShowAddPersonModal(true) }}
                  >
                    <Icon size={18} strokeWidth={1.5} className="ds-add-menu__icon" aria-hidden />
                    <span className="ds-add-menu__label">{label}</span>
                    <span className="ds-add-menu__shortcut">{shortcut}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="ds-people-types">
        {TABS.map(({ id, label, count }) => (
          <button
            key={id}
            type="button"
            className={`ds-people-type${seatTab === id ? ' ds-people-type--active' : ''}`}
            onClick={() => setSeatTab(id)}
          >
            {seatTab === id && <span className="ds-people-type__dot" aria-hidden />}
            {label}
            <span className="ds-people-type__count">{count}</span>
          </button>
        ))}
      </div>

      {seatTab === 'guest' && (
        <div className="ds-guest-tab-bar">
          <p className="ds-guest-tab-desc">
            Guests have account access but do not appear in the schedule. Guest access is free.
          </p>
          <button type="button" className="ds-invite-guest-btn" onClick={() => setShowInviteModal(true)}>
            <UserPlus size={14} strokeWidth={1.75} aria-hidden />
            Invite guest
          </button>
        </div>
      )}

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="ds-bulk-bar">
          <span className="ds-bulk-bar__count">{selected.size} selected</span>
          <button type="button" className="btn btn--primary ds-bulk-bar__action-btn" onClick={() => setShowManageAccessModal(true)}>
            Manage access
          </button>
          <span style={{ color: 'var(--text-secondary)' }}>·</span>
          <button type="button" className="ds-bulk-bar__action" style={{ color: '#c0392b' }}>Remove</button>
          <div style={{ flex: 1 }} />
          <button type="button" className="ds-bulk-bar__clear" onClick={() => setSelected(new Set())} aria-label="Clear">
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead>
            <tr>
              <th className="ds-table__th" style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked }}
                  onChange={toggleAll}
                  aria-label="Select all"
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th className="ds-table__th">Name / Email</th>
              <th className="ds-table__th">Access role</th>
              <th className="ds-table__th">Seat</th>
              <th className="ds-table__th">Last activity</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => {
              const initial = row.name.charAt(0).toUpperCase()
              const color = avatarColor(row.name)
              const roleLabel = ACCESS_ROLE_LABELS[row.accessRoleId as keyof typeof ACCESS_ROLE_LABELS] ?? row.accessRoleId
              return (
                <tr
                  key={row.id}
                  className={`ds-table__row${selected.has(row.id) ? ' ds-table__row--checked' : ''}`}
                  onClick={() => setSelectedUser(row)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="ds-table__td" style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      onClick={e => e.stopPropagation()}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td className="ds-table__td">
                    <div className="ds-name-cell">
                      <span className="ds-avatar" style={{ background: color }}>{initial}</span>
                      <div className="ds-name-cell__text">
                        <span className="ds-name-cell__name">{row.name}</span>
                        <span className="ds-name-cell__sub">{row.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="ds-table__td">
                    <span className="ds-role-badge">{roleLabel}</span>
                  </td>
                  <td className="ds-table__td">
                    {row.seat === 'schedule'
                      ? <span className="ds-seat-pill ds-seat-pill--schedule">Schedule</span>
                      : <span className="ds-seat-pill ds-seat-pill--guest">Guest</span>
                    }
                  </td>
                  <td className="ds-table__td">
                    {row.lastActivity === 'Invite pending'
                      ? <span className="ds-login-pending">{row.lastActivity}</span>
                      : <span className="ds-table__td--muted" style={{ fontSize: 13 }}>{row.lastActivity}</span>
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Side panel */}
      {selectedUser && (
        <DSV1UserPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {showInviteModal && (
        <InviteGuestModal onClose={() => setShowInviteModal(false)} />
      )}

      {showAddPersonModal && (
        <AddPersonModal onClose={() => setShowAddPersonModal(false)} />
      )}

      {showImportModal && (
        <ImportPeopleModal onClose={() => setShowImportModal(false)} />
      )}

      {showManageAccessModal && (
        <ManageAccessModal count={selected.size} onClose={() => setShowManageAccessModal(false)} />
      )}
    </div>
  )
}

function DSV1UserPanel({ user, onClose }: { user: { id: string; name: string; email: string; accessRoleId: string; seat: 'schedule' | 'guest'; lastActivity: string }; onClose: () => void }) {
  const [accessRoleId, setAccessRoleId] = useState(user.accessRoleId)
  const [seat, setSeat] = useState(user.seat)
  const [additionalPermissions, setAdditionalPermissions] = useState<string[]>([])
  const [accessOpen, setAccessOpen] = useState(true)
  const [seatOpen, setSeatOpen] = useState(true)
  const [actionsOpen, setActionsOpen] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)
  const initial = user.name.charAt(0).toUpperCase()
  const color = avatarColor(user.name)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!actionsOpen) return
    function onDoc(e: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setActionsOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [actionsOpen])

  return (
    <div className="ds-user-drawer-backdrop" onClick={onClose}>
      <aside className="ds-user-drawer" role="dialog" aria-modal aria-label="Edit user" onClick={e => e.stopPropagation()}>
        <div className="ds-user-drawer__header">
          <div className="ds-user-drawer__header-identity">
            <span className="ds-user-drawer__avatar" style={{ background: color }}>{initial}</span>
            <div>
              <span className="ds-user-drawer__name">{user.name}</span>
              <span className="ds-user-drawer__email">{user.email}</span>
            </div>
          </div>
          <button type="button" className="ds-user-drawer__close" aria-label="Close" onClick={onClose}>
            <X size={18} strokeWidth={2} aria-hidden />
          </button>
        </div>
        <div className="ds-user-drawer__body">

          {/* ── Access section ── */}
          <div className="ds-drawer-section">
            <button
              type="button"
              className="ds-drawer-section__toggle"
              onClick={() => setAccessOpen(o => !o)}
              aria-expanded={accessOpen}
            >
              <span>Access</span>
              {accessOpen
                ? <ChevronUp size={14} strokeWidth={1.75} aria-hidden />
                : <ChevronDown size={14} strokeWidth={1.75} aria-hidden />}
            </button>
            {accessOpen && (
              <div className="ds-drawer-section__body">
                <div className="ds-person-field">
                  <label className="ds-person-field__label">Access role</label>
                  <div className="ds-person-field__select-wrap">
                    <select className="ds-person-field__select" value={accessRoleId} onChange={e => setAccessRoleId(e.target.value)}>
                      {ACCESS_ROLE_IDS.map(id => (
                        <option key={id} value={id}>{ACCESS_ROLE_LABELS[id]}</option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="ds-person-field__chev" aria-hidden />
                  </div>
                </div>

                <div className="person-panel__divider" />
                <RolePermissionsCard accessRoleId={accessRoleId as AccessRoleId} />
                <div className="person-panel__divider" />

                <div className="ds-person-field ds-person-field--section">
                  <div className="person-panel__section-header-row" style={{ marginBottom: 8 }}>
                    <p className="ds-person-field__label" style={{ marginBottom: 0 }}>Additional permissions</p>
                    <span className="person-panel__additive-pill">Additive only</span>
                  </div>
                  {(() => {
                    const roleEnabledIds = new Set(
                      (ROLES.find((r) => r.id === accessRoleId)?.configPerms ?? [])
                        .filter((p) => p.enabled)
                        .map((p) => p.id),
                    )
                    const availablePerms = AVAILABLE_ADDITIONAL_PERMISSIONS.filter(
                      (p) => !roleEnabledIds.has(p.id),
                    )
                    if (availablePerms.length === 0) {
                      return (
                        <p className="person-panel__muted" style={{ fontSize: 13 }}>
                          This role already includes all additional permissions.
                        </p>
                      )
                    }
                    return ADDITIONAL_PERM_CATEGORIES.map((cat) => {
                      const catPerms = availablePerms.filter((p) => p.category === cat)
                      if (catPerms.length === 0) return null
                      return (
                        <div key={cat} className="person-panel__perm-category">
                          <p className="person-panel__perm-category-label">{cat}</p>
                          <ul className="person-panel__perm-list">
                            {catPerms.map((perm) => {
                              const checked = additionalPermissions.includes(perm.id)
                              return (
                                <li key={perm.id} className="person-panel__perm-item">
                                  <label className={`person-panel__perm-label${checked ? ' person-panel__perm-label--checked' : ''}`}>
                                    <input
                                      type="checkbox"
                                      className="person-panel__perm-checkbox"
                                      checked={checked}
                                      onChange={() =>
                                        setAdditionalPermissions((prev) =>
                                          prev.includes(perm.id)
                                            ? prev.filter((x) => x !== perm.id)
                                            : [...prev, perm.id],
                                        )
                                      }
                                    />
                                    {perm.label}
                                  </label>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* ── Seat section ── */}
          <div className="ds-drawer-section">
            <button
              type="button"
              className="ds-drawer-section__toggle"
              onClick={() => setSeatOpen(o => !o)}
              aria-expanded={seatOpen}
            >
              <span>Seat</span>
              {seatOpen
                ? <ChevronUp size={14} strokeWidth={1.75} aria-hidden />
                : <ChevronDown size={14} strokeWidth={1.75} aria-hidden />}
            </button>
            {seatOpen && (
              <div className="ds-drawer-section__body">
                <div className="ds-person-field">
                  <label className="ds-person-field__label">Seat</label>
                  <div className="ds-person-field__select-wrap">
                    <select className="ds-person-field__select" value={seat} onChange={e => setSeat(e.target.value as 'schedule' | 'guest')}>
                      <option value="schedule">Schedule</option>
                      <option value="guest">Guest</option>
                    </select>
                    <ChevronDown size={15} className="ds-person-field__chev" aria-hidden />
                  </div>
                </div>
                <div className="ds-person-field">
                  <label className="ds-person-field__label">Last activity</label>
                  <div className="ds-person-field__readonly ds-person-field__readonly--muted">{user.lastActivity}</div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="ds-user-drawer__footer">
          <button type="button" className="btn btn--primary" onClick={onClose}>Update user</button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <div className="ds-person-panel__actions-wrap" ref={actionsRef}>
            <button type="button" className="ds-person-panel__actions-btn" onClick={() => setActionsOpen(o => !o)}>
              Actions <ChevronDown size={14} />
            </button>
            {actionsOpen && (
              <div className="ds-person-panel__actions-menu">
                <button type="button" className="ds-person-panel__actions-item">Resend invite</button>
                <button type="button" className="ds-person-panel__actions-item ds-person-panel__actions-item--danger">Remove user</button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}

// ── DataStudioUsersPage ───────────────────────────────────────────────────────

const LAST_LOGIN_SAMPLES = [
  'Today, 9:14 AM', '2 days ago', 'Jun 5, 2026', 'Jun 3, 2026', 'Today, 11:02 AM',
  'Jun 1, 2026', '3 days ago', 'Jun 7, 2026', 'May 30, 2026', 'Today, 8:47 AM',
  'Jun 4, 2026', '5 days ago', 'Jun 6, 2026', 'May 28, 2026', 'Jun 2, 2026',
]

function DataStudioUsersPage() {
  const schedulePeople = SAMPLE_PEOPLE.slice(0, 15)
  type PersonType = 'Employee' | 'Contractor' | 'Placeholder'
  type UserRow = {
    id: string
    name: string
    email: string
    accessRoleId: string
    seat: 'schedule' | 'guest'
    department: string
    lastLogin: string
    personType: PersonType
  }
  const rows: UserRow[] = [
    ...schedulePeople.map((p, i) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      accessRoleId: p.accessRoleId,
      seat: 'schedule' as const,
      department: p.department,
      lastLogin: LAST_LOGIN_SAMPLES[i % LAST_LOGIN_SAMPLES.length],
      personType: (i % 5 === 0 ? 'Placeholder' : i % 3 === 0 ? 'Contractor' : 'Employee') as PersonType,
    })),
    ...GUESTS.map((g) => ({
      id: `guest-${g.id}`,
      name: g.name,
      email: g.email,
      accessRoleId: 'admin',
      seat: 'guest' as const,
      department: '—',
      lastLogin: 'Invite pending',
      personType: 'Employee' as PersonType,
    })),
  ]

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [seatTab, setSeatTab] = useState<'all' | 'schedule' | 'guest'>('all')
  const [selectedUser, setSelectedUser] = useState<DSUserPanelRow | null>(null)

  const USER_TABS = [
    { id: 'all' as const,      label: 'All users',       count: rows.length },
    { id: 'schedule' as const, label: 'Schedule seats',  count: schedulePeople.length },
    { id: 'guest' as const,    label: 'Guests',          count: GUESTS.length },
  ]

  function toggleAll() {
    if (selected.size === displayRows.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(displayRows.map((r) => r.id)))
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const displayRows = seatTab === 'all' ? rows : rows.filter(r => r.seat === seatTab)

  const allChecked = displayRows.length > 0 && selected.size === displayRows.length
  const someChecked = selected.size > 0

  return (
    <div className="ds-users-page">
      {/* Row 1 — title + actions */}
      <div className="ds-people-header">
        <div className="ds-people-header__left">
          <h1 className="ds-people-header__title">Users</h1>
          <button type="button" className="ds-people-header__icon-btn" aria-label="Customise columns">
            <ArrowLeftRight size={14} strokeWidth={1.75} />
          </button>
          <button type="button" className="ds-people-header__filter-btn">
            <ListFilter size={14} strokeWidth={1.75} />
            Filter
            <ChevronDown size={13} strokeWidth={1.75} />
          </button>
        </div>
        <div className="ds-people-header__right">
          <button type="button" className="ds-people-header__icon-btn" aria-label="Display options">
            <SlidersHorizontal size={15} strokeWidth={1.75} />
          </button>
          <button type="button" className="ds-people-header__action-btn">
            <Download size={14} strokeWidth={1.75} />
            Import
          </button>
          <button type="button" className="ds-people-header__icon-btn" aria-label="Export">
            <ExternalLink size={14} strokeWidth={1.75} />
          </button>
          <button type="button" className="btn btn--primary ds-people-header__add-btn" aria-label="Add user">
            <Plus size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Row 2 — seat type tabs */}
      <div className="ds-people-types">
        {USER_TABS.map(({ id, label, count }) => (
          <button
            key={id}
            type="button"
            className={`ds-people-type${seatTab === id ? ' ds-people-type--active' : ''}`}
            onClick={() => setSeatTab(id)}
          >
            {seatTab === id && <span className="ds-people-type__dot" aria-hidden />}
            {label}
            <span className="ds-people-type__count">{count}</span>
          </button>
        ))}
      </div>

      {someChecked && (
        <div className="ds-bulk-bar">
          <span className="ds-bulk-bar__count">{selected.size} selected</span>
          <span style={{ color: 'var(--text-secondary)' }}>·</span>
          <button type="button" className="ds-bulk-bar__action">
            Change role <ChevronDown size={12} strokeWidth={2} aria-hidden />
          </button>
          <span style={{ color: 'var(--text-secondary)' }}>·</span>
          <button type="button" className="ds-bulk-bar__action" style={{ color: '#c0392b' }}>
            Remove
          </button>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            className="ds-bulk-bar__clear"
            aria-label="Clear selection"
            onClick={() => setSelected(new Set())}
          >
            <X size={14} strokeWidth={2} aria-hidden />
          </button>
        </div>
      )}

      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead>
            <tr>
              <th className="ds-table__th" style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  aria-label="Select all"
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th className="ds-table__th">Name / Email</th>
              <th className="ds-table__th">Person type</th>
              <th className="ds-table__th">Access role</th>
              <th className="ds-table__th">Seat</th>
              <th className="ds-table__th">Department</th>
              <th className="ds-table__th">Last login</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => {
              const initial = row.name.charAt(0).toUpperCase()
              const color = avatarColor(row.name)
              const roleLabel =
                row.seat === 'guest'
                  ? 'Admin'
                  : ACCESS_ROLE_LABELS[row.accessRoleId as keyof typeof ACCESS_ROLE_LABELS] ?? row.accessRoleId
              return (
                <tr
                  key={row.id}
                  className="ds-table__row"
                  onClick={() => setSelectedUser(row)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="ds-table__td" style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td className="ds-table__td">
                    <div className="ds-name-cell">
                      <span className="ds-avatar" style={{ background: color }}>{initial}</span>
                      <div className="ds-name-cell__text">
                        <span className="ds-name-cell__name">{row.name}</span>
                        <span className="ds-name-cell__sub">{row.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="ds-table__td">
                    {row.seat !== 'guest' && (
                      <span className={`ds-person-type-pill ds-person-type-pill--${row.personType.toLowerCase()}`}>
                        {row.personType}
                      </span>
                    )}
                  </td>
                  <td className="ds-table__td">
                    <span className="ds-role-badge">{roleLabel}</span>
                  </td>
                  <td className="ds-table__td">
                    {row.seat === 'schedule' ? (
                      <span className="ds-seat-pill ds-seat-pill--schedule">Schedule</span>
                    ) : (
                      <span className="ds-seat-pill ds-seat-pill--guest">Guest</span>
                    )}
                  </td>
                  <td className="ds-table__td ds-table__td--muted">{row.department}</td>
                  <td className="ds-table__td">
                    {row.lastLogin === 'Invite pending' ? (
                      <span className="ds-login-pending">{row.lastLogin}</span>
                    ) : (
                      <span className="ds-table__td--muted" style={{ fontSize: 13 }}>{row.lastLogin}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <DSUserPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  )
}

// ── DSPersonPanel ─────────────────────────────────────────────────────────────

type DSPersonPanelTab = 'info' | 'availability' | 'timeoff' | 'projects' | 'manages'

function DSPersonPanel({ person, meta, onClose }: {
  person: import('./DataStudioPeoplePage').PeopleRow
  meta: ReturnType<typeof teamMeta>
  onClose: () => void
}) {
  const [tab, setTab] = useState<DSPersonPanelTab>('info')
  const [actionsOpen, setActionsOpen] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)
  const initial = person.name.charAt(0).toUpperCase()
  const color = avatarColor(person.name)
  const hasRateChange = person.id.charCodeAt(0) % 3 === 0

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!actionsOpen) return
    function onDoc(e: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setActionsOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [actionsOpen])

  const TABS: { id: DSPersonPanelTab; label: string; count?: number }[] = [
    { id: 'info',         label: 'Info' },
    { id: 'availability', label: 'Availability' },
    { id: 'timeoff',      label: 'Time off', count: meta.timeOff.used },
    { id: 'projects',     label: 'Projects',  count: meta.projects.total },
    { id: 'manages',      label: 'Manages' },
  ]

  return (
    <div className="ds-person-backdrop" onClick={onClose}>
      <div className="ds-person-panel" role="dialog" aria-modal aria-label="Update person" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="ds-person-panel__header">
          <span className="ds-person-panel__name">{person.name}</span>
          <span className="ds-person-panel__avatar" style={{ background: color }}>{initial}</span>
        </div>

        {/* Tabs */}
        <div className="ds-person-panel__tabs">
          {TABS.map(({ id, label, count }) => (
            <button
              key={id}
              type="button"
              className={`ds-person-panel__tab${tab === id ? ' ds-person-panel__tab--active' : ''}`}
              onClick={() => setTab(id)}
            >
              {label}{count !== undefined && ` ${count}`}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="ds-person-panel__body">
          {tab === 'info' && (
            <>
              <div className="ds-person-field">
                <label className="ds-person-field__label">Role</label>
                <div className="ds-person-field__select-wrap">
                  <select className="ds-person-field__select" defaultValue={person.role}>
                    <option>{person.role}</option>
                  </select>
                  <ChevronDown size={15} className="ds-person-field__chev" aria-hidden />
                </div>
              </div>

              <div className="ds-person-rates-card">
                <div className="ds-person-rates-row">
                  <span className="ds-person-field__label">Cost rate</span>
                  <div className="ds-person-rates-input">
                    <span className="ds-person-rates-input__prefix">$</span>
                    {hasRateChange && (
                      <span className="ds-person-rates-input__old">{meta.costRate + 70}</span>
                    )}
                    <input
                      className="ds-person-rates-input__field"
                      type="text"
                      defaultValue={meta.costRate}
                    />
                    <span className="ds-person-rates-input__suffix">/hr</span>
                  </div>
                </div>
                {hasRateChange && (
                  <button type="button" className="ds-person-rates__view-changes">View changes</button>
                )}
                <div className="ds-person-rates-row ds-person-rates-row--top-border">
                  <span className="ds-person-field__label">Bill rate</span>
                  <div className="ds-person-rates-input">
                    <span className="ds-person-rates-input__prefix">$</span>
                    <input
                      className="ds-person-rates-input__field"
                      type="text"
                      defaultValue={meta.billRate ?? '—'}
                    />
                    <span className="ds-person-rates-input__suffix">/hr</span>
                  </div>
                </div>
              </div>

              <div className="ds-person-field">
                <label className="ds-person-field__label">Department</label>
                <div className="ds-person-field__readonly">{person.department}</div>
              </div>

              <div className="ds-person-field">
                <label className="ds-person-field__label">Tags</label>
                <div className="ds-person-field__readonly ds-person-field__readonly--muted">No tags</div>
              </div>

            </>
          )}

          {tab !== 'info' && (
            <p className="ds-person-panel__empty">
              {TABS.find(t => t.id === tab)?.label} details will appear here.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="ds-person-panel__footer">
          <button type="button" className="btn btn--primary" onClick={onClose}>Update person</button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <div className="ds-person-panel__actions-wrap" ref={actionsRef}>
            <button
              type="button"
              className="ds-person-panel__actions-btn"
              onClick={() => setActionsOpen(o => !o)}
            >
              Actions <ChevronDown size={14} />
            </button>
            {actionsOpen && (
              <div className="ds-person-panel__actions-menu">
                <button type="button" className="ds-person-panel__actions-item">Archive person</button>
                <button type="button" className="ds-person-panel__actions-item ds-person-panel__actions-item--danger">Delete person</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── DataStudioTeamPage ────────────────────────────────────────────────────────

const SKILL_POOL = [
  'Figma','React','TypeScript','Python','SQL','Leadership','Agile','Sketch',
  'After Effects','Copywriting','Analytics','CSS','Node.js','Brand strategy',
  'UX research','Illustration',
]

function teamMeta(i: number) {
  const managers = ['Sarah Chen', 'Marcus Webb', '—']
  const skillCount = 1 + (i % 5)
  const skills = Array.from({ length: skillCount }, (_, k) => SKILL_POOL[(i + k * 3) % SKILL_POOL.length])
  return {
    managedBy: managers[i % 3],
    timeOff: { used: i % 12, total: 20 },
    projects: { total: 2 + (i % 6), active: 1 + (i % 3) },
    burnoutRisk: i % 7 === 0 ? 'high' : i % 4 === 0 ? 'medium' : null,
    billRate: SAMPLE_PEOPLE[i].accessRoleId === 'member' ? null : 100 + (i % 5) * 25,
    costRate: 55 + (i % 4) * 15,
    skills,
  }
}

function DataStudioTeamPage() {
  const people = SAMPLE_PEOPLE.slice(0, 15)
  const [personType, setPersonType] = useState<'employees' | 'contractors'>('employees')
  const [selectedPerson, setSelectedPerson] = useState<{ person: typeof people[number]; meta: ReturnType<typeof teamMeta> } | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const PERSON_TYPES = [
    { id: 'employees' as const,   label: 'Employees',   count: SAMPLE_PEOPLE.length },
    { id: 'contractors' as const, label: 'Contractors', count: 12 },
  ]

  const filtered = people

  const allSelected = filtered.length > 0 && filtered.every(p => selectedIds.has(p.id))
  const someSelected = filtered.some(p => selectedIds.has(p.id))

  function toggleRow(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(p => p.id)))
    }
  }

  return (
    <div className="ds-team-page">
      {/* Row 1 — title + actions */}
      <div className="ds-people-header">
        <div className="ds-people-header__left">
          <h1 className="ds-people-header__title">People</h1>
          <button type="button" className="ds-people-header__icon-btn" aria-label="Customise columns">
            <ArrowLeftRight size={14} strokeWidth={1.75} />
          </button>
          <button type="button" className="ds-people-header__filter-btn">
            <ListFilter size={14} strokeWidth={1.75} />
            Filter
            <ChevronDown size={13} strokeWidth={1.75} />
          </button>
        </div>
        <div className="ds-people-header__right">
          <button type="button" className="ds-people-header__icon-btn" aria-label="Display options">
            <SlidersHorizontal size={15} strokeWidth={1.75} />
          </button>
          <button type="button" className="ds-people-header__action-btn">
            <Download size={14} strokeWidth={1.75} />
            Import
          </button>
          <button type="button" className="ds-people-header__icon-btn" aria-label="Export">
            <ExternalLink size={14} strokeWidth={1.75} />
          </button>
          <button type="button" className="btn btn--primary ds-people-header__add-btn" aria-label="Add person">
            <Plus size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Row 2 — type tabs */}
      <div className="ds-people-types">
        {PERSON_TYPES.map(({ id, label, count }) => (
          <button
            key={id}
            type="button"
            className={`ds-people-type${personType === id ? ' ds-people-type--active' : ''}`}
            onClick={() => setPersonType(id)}
          >
            {personType === id && <span className="ds-people-type__dot" aria-hidden />}
            {label}
            <span className="ds-people-type__count">{count}</span>
          </button>
        ))}
      </div>

      {selectedIds.size > 0 && (
        <div className="ds-bulk-bar">
          <span className="ds-bulk-bar__count">{selectedIds.size} selected</span>
          <span style={{ color: 'var(--text-secondary)' }}>·</span>
          <button type="button" className="ds-bulk-bar__action">
            Edit <ChevronDown size={12} strokeWidth={2} aria-hidden />
          </button>
          <span style={{ color: 'var(--text-secondary)' }}>·</span>
          <button type="button" className="ds-bulk-bar__action">
            Assign to project
          </button>
          <span style={{ color: 'var(--text-secondary)' }}>·</span>
          <button type="button" className="ds-bulk-bar__action" style={{ color: '#c0392b' }}>
            Archive
          </button>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            className="ds-bulk-bar__clear"
            aria-label="Clear selection"
            onClick={() => setSelectedIds(new Set())}
          >
            <X size={14} strokeWidth={2} aria-hidden />
          </button>
        </div>
      )}

      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead>
            <tr>
              <th className="ds-table__th" style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected }}
                  onChange={toggleAll}
                  aria-label="Select all"
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th className="ds-table__th">Name / Title</th>
              <th className="ds-table__th">Managed by</th>
              <th className="ds-table__th">Time off</th>
              <th className="ds-table__th">Projects</th>
              <th className="ds-table__th">Burnout risk</th>
              <th className="ds-table__th">Skills</th>
              <th className="ds-table__th">Effective bill rate</th>
              <th className="ds-table__th">Cost rate</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((person) => {
              const i = SAMPLE_PEOPLE.indexOf(person)
              const meta = teamMeta(i)
              const initial = person.name.charAt(0).toUpperCase()
              const color = avatarColor(person.name)
              return (
                <tr key={person.id} className={`ds-table__row ds-table__row--clickable${selectedIds.has(person.id) ? ' ds-table__row--checked' : ''}`} onClick={() => setSelectedPerson({ person, meta })}>
                  <td className="ds-table__td" style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(person.id)}
                      onChange={() => {}}
                      onClick={(e) => toggleRow(person.id, e)}
                      style={{ cursor: 'pointer' }}
                      aria-label={`Select ${person.name}`}
                    />
                  </td>
                  <td className="ds-table__td">
                    <div className="ds-name-cell">
                      <span className="ds-avatar" style={{ background: color }}>{initial}</span>
                      <div className="ds-name-cell__text">
                        <span className="ds-name-cell__name">{person.name}</span>
                        <span className="ds-name-cell__sub">{person.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="ds-table__td ds-table__td--muted">{meta.managedBy}</td>
                  <td className="ds-table__td ds-table__td--muted">
                    {meta.timeOff.used} / {meta.timeOff.total} days
                  </td>
                  <td className="ds-table__td ds-table__td--muted">
                    {meta.projects.total} total · {meta.projects.active} active
                  </td>
                  <td className="ds-table__td">
                    {meta.burnoutRisk === 'high' ? (
                      <span className="ds-risk-badge ds-risk-badge--high">
                        <span className="ds-risk-dot" />High
                      </span>
                    ) : meta.burnoutRisk === 'medium' ? (
                      <span className="ds-risk-badge ds-risk-badge--medium">
                        <span className="ds-risk-dot" />Medium
                      </span>
                    ) : (
                      <span className="ds-table__td--muted" style={{ fontSize: 13 }}>—</span>
                    )}
                  </td>
                  <td className="ds-table__td">
                    <div className="ds-skills-cell">
                      {meta.skills.slice(0, 2).map((skill) => (
                        <span key={skill} className="ds-skill-tag">{skill}</span>
                      ))}
                      {meta.skills.length > 2 && (
                        <span className="ds-skill-tag ds-skill-tag--more">+{meta.skills.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="ds-table__td ds-table__td--muted">
                    {meta.billRate !== null ? `$${meta.billRate}/hr` : '—'}
                  </td>
                  <td className="ds-table__td ds-table__td--muted">
                    ${meta.costRate}/hr
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedPerson && (
        <DSPersonPanel
          person={selectedPerson.person}
          meta={selectedPerson.meta}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  )
}

function AccessRightsPage({
  plan,
  rbacEnforced,
  onRbacEnforcedChange,
  onUpgradeToPro,
  officeMode = 'single',
}: {
  plan: PricingPlanId
  rbacEnforced: boolean
  onRbacEnforcedChange: (v: boolean) => void
  onUpgradeToPro: () => void
  officeMode?: OfficeModeId
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [savedPerms, setSavedPerms] = useState<DraftPerms>({})
  const [draftPerms, setDraftPerms] = useState<DraftPerms>({})
  const [savedScope, setSavedScope] = useState<Record<string, ScopeId[]>>({})
  const [draftScope, setDraftScope] = useState<Record<string, ScopeId[]>>({})
  const [savedScopeEdit, _setSavedScopeEdit] = useState<Record<string, ScopeId[]>>({})
  const [draftScopeEdit, setDraftScopeEdit] = useState<Record<string, ScopeId[]>>({})
  const [roleScopeDepts, setRoleScopeDepts] = useState<Record<string, string[]>>({})
  const [roleScopeEditDepts, setRoleScopeEditDepts] = useState<Record<string, string[]>>({})
  const [savedProjectScope, _setSavedProjectScope] = useState<Record<string, ProjectScopeId>>({})
  const [draftProjectScope, setDraftProjectScope] = useState<Record<string, ProjectScopeId>>({})
  const [savedProjectScopeEdit, _setSavedProjectScopeEdit] = useState<Record<string, ProjectScopeId>>({})
  const [draftProjectScopeEdit, setDraftProjectScopeEdit] = useState<Record<string, ProjectScopeId>>({})
  const [savedClientScope, _setSavedClientScope] = useState<Record<string, ClientScopeId>>({})
  const [draftClientScope, setDraftClientScope] = useState<Record<string, ClientScopeId>>({})
  const [savedClientScopeEdit, _setSavedClientScopeEdit] = useState<Record<string, ClientScopeId>>({})
  const [draftClientScopeEdit, setDraftClientScopeEdit] = useState<Record<string, ClientScopeId>>({})
  const [savedClientRateView, _setSavedClientRateView] = useState<Record<string, ClientScopeId>>({})
  const [draftClientRateView, setDraftClientRateView] = useState<Record<string, ClientScopeId>>({})
  const [savedClientRateEdit, _setSavedClientRateEdit] = useState<Record<string, ClientScopeId>>({})
  const [draftClientRateEdit, setDraftClientRateEdit] = useState<Record<string, ClientScopeId>>({})
  const [confirmSaveRoleId, setConfirmSaveRoleId] = useState<string | null>(null)
  const [customRoles, setCustomRoles] = useState<Role[]>([])
  const [draftLabel, setDraftLabel] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [peopleSectionOpen, setPeopleSectionOpen] = useState(true)
  const [peoplePage, setPeoplePage] = useState(1)
  const PEOPLE_PAGE_SIZE = 15
  const [savedMeta, setSavedMeta] = useState<Record<string, { label: string; description: string }>>({})

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

  useEffect(() => {
    setPeopleSectionOpen(true)
    setPeoplePage(1)
  }, [viewingId, editingId])

  function startEdit(role: Role) {
    const base = savedPerms[role.id] ?? role.configPerms
    setDraftPerms((prev) => ({ ...prev, [role.id]: base.map((p) => ({ ...p })) }))
    setDraftScope((prev) => ({ ...prev, [role.id]: savedScope[role.id] ?? [role.scope] }))
    const meta = savedMeta[role.id]
    setDraftLabel(meta?.label ?? role.label)
    setDraftDescription(meta?.description ?? role.description ?? '')
    setEditingId(role.id)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function saveEdit(roleId: string) {
    setSavedPerms((prev) => ({ ...prev, [roleId]: draftPerms[roleId] }))
    setSavedScope((prev) => ({ ...prev, [roleId]: draftScope[roleId] }))
    setSavedMeta((prev) => ({ ...prev, [roleId]: { label: draftLabel, description: draftDescription } }))
    setCustomRoles((prev) =>
      prev.map((r) => r.id === roleId ? { ...r, label: draftLabel, description: draftDescription } : r)
    )
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

  // ── Custom roles ────────────────────────────────────────────────────────────

  const MAX_CUSTOM_ROLES = 10

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
    const sourceRole = newRoleCloneId ? allRoles.find((r) => r.id === newRoleCloneId) : undefined
    const basePerms = sourceRole ? sourceRole.configPerms.map((p) => ({ ...p })) : []
    const baseScope: ScopeId = sourceRole?.scope ?? 'everyone'
    const newRole: Role = {
      id,
      label: name,
      count: 0,
      description: '',
      scope: baseScope,
      configPerms: basePerms,
      isCustom: true,
    }
    setCustomRoles((prev) => [...prev, newRole])
    setDraftPerms((prev) => ({ ...prev, [id]: basePerms.map((p) => ({ ...p })) }))
    setDraftScope((prev) => ({ ...prev, [id]: [baseScope] }))
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
    const scopeArr: ScopeId[] = savedScope[role.id] ?? [role.scope]
    const cloned: Role = {
      id,
      label: `${role.label} (copy)`,
      count: 0,
      description: role.description,
      scope: scopeArr[0] ?? role.scope,
      configPerms: perms,
      isCustom: true,
    }
    setCustomRoles((prev) => [...prev, cloned])
    setDraftPerms((prev) => ({ ...prev, [id]: perms.map((p) => ({ ...p })) }))
    setDraftScope((prev) => ({ ...prev, [id]: scopeArr }))
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
              <th className="roles-table__th roles-table__th--num">People</th>
              {officeMode === 'multi' && <th className="roles-table__th">Last modified by <span className="roles-table__future-badge" title="Backend will retain full history — UI display is scoped out of V1">Future state</span></th>}
              {officeMode === 'multi' && <th className="roles-table__th">Last modified <span className="roles-table__future-badge" title="Backend will retain full history — UI display is scoped out of V1">Future state</span></th>}
              <th className="roles-table__th" />
            </tr>
          </thead>
          <tbody>
            {allRoles.map((role) => {
              const isActive = editingId === role.id || viewingId === role.id
              const effectiveLabel = savedMeta[role.id]?.label ?? role.label
              const rawDescription = savedMeta[role.id]?.description ?? role.description ?? ''
              const effectiveDescription = officeMode !== 'multi'
                ? rawDescription
                    .replace('All permissions across all offices. ', '')
                    .replace('scoped to managed offices. ', '')
                : rawDescription
              return (
                <tr
                  key={role.id}
                  className={`roles-table__row${isActive ? ' roles-table__row--expanded' : ''}`}
                  onClick={() => {
                    if (editingId === role.id) return
                    setViewingId(viewingId === role.id ? null : role.id)
                  }}
                >
                  <td className="roles-table__td">
                    <span className="roles-table__role-link">{effectiveLabel}</span>
                  </td>
                  <td className="roles-table__td roles-table__td--desc">
                    {effectiveDescription || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No description</span>}
                  </td>
                  <td className="roles-table__td">
                    <span className={`roles-table__type-badge${role.isCustom ? ' roles-table__type-badge--custom' : ''}`}>
                      {role.isCustom ? 'Custom' : 'Default'}
                    </span>
                  </td>
                  <td className="roles-table__td roles-table__td--num">
                    <span className="roles-table__people-count">{role.count}</span>
                  </td>
                  {officeMode === 'multi' && <td className="roles-table__td roles-table__td--meta">Float</td>}
                  {officeMode === 'multi' && <td className="roles-table__td roles-table__td--meta">May 26, 2026</td>}
                  <td className="roles-table__td roles-table__td--actions">
                    <div className="roles-table__row-actions">
                      {canEdit && !role.isCustom && role.id !== 'account-owner' && (
                        <button
                          type="button"
                          className="roles-table__icon-btn"
                          aria-label={`Clone ${role.label}`}
                          title="Clone role"
                          disabled={customRoles.length >= MAX_CUSTOM_ROLES}
                          onClick={(e) => { e.stopPropagation(); cloneRole(role) }}
                        >
                          <Copy size={14} strokeWidth={1.75} aria-hidden />
                        </button>
                      )}
                      <ChevronRight size={14} strokeWidth={1.75} className="roles-table__chevron" aria-hidden />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Role side panel ─────────────────────────────────────────────────── */}
      {(viewingId || editingId) && (() => {
        const activeId = editingId ?? viewingId!
        const role = allRoles.find((r) => r.id === activeId)
        if (!role) return null
        const isEditing = canEdit && editingId === role.id
        const isViewing = !isEditing
        const displayPerms = isEditing ? draftPerms[role.id] : (savedPerms[role.id] ?? role.configPerms)
        const effectiveLabel = savedMeta[role.id]?.label ?? role.label
        const effectiveScope: ScopeId[] = isEditing ? (draftScope[role.id] ?? [role.scope]) : (savedScope[role.id] ?? [role.scope])
        const effectiveScopeEdit: ScopeId[] = isEditing ? (draftScopeEdit[role.id] ?? [role.scope]) : (savedScopeEdit[role.id] ?? [role.scope])
        const effectiveProjectScope: ProjectScopeId = isEditing ? (draftProjectScope[role.id] ?? 'all') : (savedProjectScope[role.id] ?? 'all')
        const effectiveProjectScopeEdit: ProjectScopeId = isEditing ? (draftProjectScopeEdit[role.id] ?? 'all') : (savedProjectScopeEdit[role.id] ?? 'all')
        const effectiveClientScope: ClientScopeId = isEditing ? (draftClientScope[role.id] ?? 'all') : (savedClientScope[role.id] ?? 'all')
        const effectiveClientScopeEdit: ClientScopeId = isEditing ? (draftClientScopeEdit[role.id] ?? 'all') : (savedClientScopeEdit[role.id] ?? 'all')
        const effectiveClientRateView: ClientScopeId = isEditing ? (draftClientRateView[role.id] ?? 'all') : (savedClientRateView[role.id] ?? 'all')
        const effectiveClientRateEdit: ClientScopeId = isEditing ? (draftClientRateEdit[role.id] ?? 'all') : (savedClientRateEdit[role.id] ?? 'all')
        const viewScopeLabel = effectiveScope.map((s) => SCOPE_OPTIONS.find((o) => o.id === s)?.label ?? s).join(', ')
        const editScopeLabel = effectiveScopeEdit.map((s) => SCOPE_OPTIONS.find((o) => o.id === s)?.label ?? s).join(', ')
        const projectViewScopeLabel = PROJECT_SCOPE_OPTIONS.find((o) => o.id === effectiveProjectScope)?.label ?? effectiveProjectScope
        const projectEditScopeLabel = PROJECT_SCOPE_OPTIONS.find((o) => o.id === effectiveProjectScopeEdit)?.label ?? effectiveProjectScopeEdit
        const resolvedPerms = (displayPerms ?? []).map((p) => ({
          ...p,
          description: (p.description ?? '')
            .replace('{{people-view-scope}}', viewScopeLabel)
            .replace('{{people-edit-scope}}', editScopeLabel)
            .replace('project view scope', projectViewScopeLabel)
            .replace('project edit scope', projectEditScopeLabel),
        }))
        const visibleGroupOrder = officeMode === 'multi' ? GROUP_ORDER : GROUP_ORDER.filter((g) => g !== 'Offices')
        const groups = visibleGroupOrder.map((g) => ({
          label: g,
          perms: resolvedPerms.filter((p) => p.group === g),
        })).filter((g) => g.perms.length > 0)
        const closePanel = () => { setViewingId(null); cancelEdit() }

        return (
          <>
            <div className="role-panel__backdrop" role="presentation" aria-hidden onClick={closePanel} />
            <aside className="role-panel" aria-label={`${effectiveLabel} permissions`}>
              {/* Header */}
              <header className="role-panel__header">
                <div className="role-panel__header-left">
                  <span className="role-panel__title">{effectiveLabel}</span>
                  <span className="role-panel__subtitle">{role.count} {role.count === 1 ? 'person' : 'people'}</span>
                </div>
                <div className="role-panel__header-right">
                  {isViewing && canEdit && !role.isCustom && role.id !== 'account-owner' && (
                    <button
                      type="button"
                      className="roles-table__icon-btn"
                      title="Clone role"
                      disabled={customRoles.length >= MAX_CUSTOM_ROLES}
                      onClick={() => { cloneRole(role); closePanel() }}
                    >
                      <Copy size={14} strokeWidth={1.75} aria-hidden />
                    </button>
                  )}
                  {isViewing && role.id !== 'account-owner' && (
                    <button
                      type="button"
                      className="role-panel__edit-btn"
                      onClick={() => { setViewingId(null); startEdit(role) }}
                    >
                      <Pencil size={13} strokeWidth={2} aria-hidden />
                      Edit
                    </button>
                  )}
                  <button type="button" className="role-panel__close" aria-label="Close" onClick={closePanel}>
                    <X size={18} strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </header>

              {/* Body */}
              <div className="role-panel__body">
                {role.id === 'account-owner' && (
                  <p className="role-panel__readonly-notice">
                    Account owner is read-only. There must always be at least one account owner.
                  </p>
                )}
                {isEditing && (
                  <div className="role-edit-meta">
                    <div className="role-edit-field">
                      <label className="role-edit-label" htmlFor={`rp-name-${role.id}`}>Role name</label>
                      <input
                        id={`rp-name-${role.id}`}
                        type="text"
                        className="role-edit-input"
                        value={draftLabel}
                        onChange={(e) => setDraftLabel(e.target.value)}
                        placeholder="Role name"
                      />
                    </div>
                    <div className="role-edit-field">
                      <label className="role-edit-label" htmlFor={`rp-desc-${role.id}`}>Description</label>
                      <textarea
                        id={`rp-desc-${role.id}`}
                        className="role-edit-input role-edit-input--textarea"
                        value={draftDescription}
                        onChange={(e) => setDraftDescription(e.target.value)}
                        placeholder="Describe what this role can do…"
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {groups.map((g) => (
                  <div key={g.label} className="role-section-card">
                    <div className="role-section-card__header">
                      <span className="role-section-card__title">{g.label}</span>
                    </div>
                    {g.label === 'People' && (
                      <div className="role-inline-scope">
                        <div className="role-scope-sub">
                          <p className="role-scope-sub__label">Can view</p>
                          <RoleScopeSelector
                            value={effectiveScope}
                            readOnly={!isEditing}
                            onChange={(v) => setDraftScope((prev) => ({ ...prev, [role.id]: v }))}
                          />
                          {effectiveScope.includes('departments') && (
                            <DeptTagPicker
                              selected={roleScopeDepts[role.id] ?? []}
                              onChange={(depts) => setRoleScopeDepts((prev) => ({ ...prev, [role.id]: depts }))}
                              readOnly={!isEditing}
                            />
                          )}
                        </div>
                        <div className="role-scope-divider" />
                        <div className="role-scope-sub">
                          <p className="role-scope-sub__label">Can edit</p>
                          <RoleScopeSelector
                            value={effectiveScopeEdit}
                            readOnly={!isEditing}
                            onChange={(v) => setDraftScopeEdit((prev) => ({ ...prev, [role.id]: v }))}
                          />
                          {effectiveScopeEdit.includes('departments') && (
                            <DeptTagPicker
                              selected={roleScopeEditDepts[role.id] ?? []}
                              onChange={(depts) => setRoleScopeEditDepts((prev) => ({ ...prev, [role.id]: depts }))}
                              readOnly={!isEditing}
                            />
                          )}
                        </div>
                      </div>
                    )}
                    {g.label === 'Projects' && (
                      <div className="role-inline-scope">
                        <div className="role-scope-sub">
                          <p className="role-scope-sub__label">Can view</p>
                          <ProjectScopeSelector
                            value={effectiveProjectScope}
                            readOnly={!isEditing}
                            onChange={(v) => setDraftProjectScope((prev) => ({ ...prev, [role.id]: v }))}
                          />
                        </div>
                        <div className="role-scope-divider" />
                        <div className="role-scope-sub">
                          <p className="role-scope-sub__label">Can edit</p>
                          <ProjectScopeSelector
                            value={effectiveProjectScopeEdit}
                            readOnly={!isEditing}
                            onChange={(v) => setDraftProjectScopeEdit((prev) => ({ ...prev, [role.id]: v }))}
                          />
                        </div>
                      </div>
                    )}
                    {g.label === 'Clients' && (
                      <div className="role-inline-scope">
                        <div className="role-scope-sub">
                          <p className="role-scope-sub__label">Can view</p>
                          <ClientScopeSelector
                            value={effectiveClientScope}
                            readOnly={!isEditing}
                            onChange={(v) => setDraftClientScope((prev) => ({ ...prev, [role.id]: v }))}
                          />
                        </div>
                        <div className="role-scope-divider" />
                        <div className="role-scope-sub">
                          <p className="role-scope-sub__label">Can edit</p>
                          <ClientScopeSelector
                            value={effectiveClientScopeEdit}
                            readOnly={!isEditing}
                            onChange={(v) => setDraftClientScopeEdit((prev) => ({ ...prev, [role.id]: v }))}
                          />
                        </div>
                        <div className="role-scope-divider" />
                        <div className="role-scope-sub">
                          <p className="role-scope-sub__label">Can view rate cards</p>
                          <ClientScopeSelector
                            value={effectiveClientRateView}
                            readOnly={!isEditing}
                            onChange={(v) => setDraftClientRateView((prev) => ({ ...prev, [role.id]: v }))}
                          />
                        </div>
                        <div className="role-scope-divider" />
                        <div className="role-scope-sub">
                          <p className="role-scope-sub__label">Can edit rate cards</p>
                          <ClientScopeSelector
                            value={effectiveClientRateEdit}
                            readOnly={!isEditing}
                            onChange={(v) => setDraftClientRateEdit((prev) => ({ ...prev, [role.id]: v }))}
                          />
                        </div>
                      </div>
                    )}
                    <table className={`cfg-table role-perms-group-table${isViewing ? ' cfg-table--readonly' : ''}`}>
                      <tbody>
                        {isEditing
                          ? <PermGroup label="Permissions" perms={g.perms} onToggle={(permId) => togglePerm(role.id, permId)} />
                          : <ReadOnlyPermGroup label="Permissions" perms={g.perms} />
                        }
                      </tbody>
                    </table>
                  </div>
                ))}
                {role.footerNote && <div className="cfg-table__footer cfg-table__footer--standalone">{role.footerNote}</div>}

                {/* ── People assigned this role ────────────────────────── */}
                {(() => {
                  const assigned = SAMPLE_PEOPLE.filter((p) => p.accessRoleId === role.id)
                  const visible = assigned.slice(0, PEOPLE_PAGE_SIZE * peoplePage)
                  const remaining = assigned.length - visible.length
                  if (assigned.length === 0) return null
                  return (
                    <div className="role-section-card">
                      <button
                        type="button"
                        className="role-section-card__toggle"
                        aria-expanded={peopleSectionOpen}
                        onClick={() => setPeopleSectionOpen((o) => !o)}
                      >
                        <div className="role-section-card__header">
                          <span className="role-section-card__title">
                            People
                            <span className="role-panel-people__count">{assigned.length}</span>
                          </span>
                          <span className="role-section-card__desc">People currently assigned this access role.</span>
                        </div>
                        <ChevronDown
                          size={15}
                          strokeWidth={1.75}
                          className={`role-section-card__chevron${peopleSectionOpen ? ' role-section-card__chevron--open' : ''}`}
                          aria-hidden
                        />
                      </button>
                      {peopleSectionOpen && (
                        <>
                          <ul className="role-panel-people__list">
                            {visible.map((person) => (
                              <li key={person.id} className="role-panel-people__item">
                                <span className="role-panel-people__avatar" aria-hidden>
                                  {person.name.trim().charAt(0).toUpperCase()}
                                </span>
                                <span className="role-panel-people__name">{person.name}</span>
                                <span className="role-panel-people__role">{person.role}</span>
                              </li>
                            ))}
                          </ul>
                          {remaining > 0 && (
                            <button
                              type="button"
                              className="role-panel-people__load-more"
                              onClick={(e) => { e.stopPropagation(); setPeoplePage((p) => p + 1) }}
                            >
                              Load more
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )
                })()}
              </div>

              {/* Footer */}
              {(isEditing || (role.isCustom && isViewing)) && (
                <footer className="role-panel__footer">
                  {isEditing ? (
                    <>
                      <button className="btn btn--ghost" type="button" onClick={closePanel}>Cancel</button>
                      <button
                        className="btn btn--primary"
                        type="button"
                        onClick={() => role.isCustom ? saveEdit(role.id) : requestSave(role.id)}
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <button className="btn btn--ghost" type="button" onClick={() => { deleteCustomRole(role.id); closePanel() }}>
                      <Trash2 size={13} strokeWidth={2} aria-hidden /> Delete role
                    </button>
                  )}
                </footer>
              )}
            </aside>
          </>
        )
      })()}

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
  | 'users'
  | 'team'

const DATA_STUDIO_PLACEHOLDER: Record<DataStudioNavId, string> = {
  offices: 'Offices',
  people: 'People',
  roles: 'Roles',
  projects: 'Projects',
  clients: 'Clients',
  'rate-cards': 'Rate cards',
  activity: 'Activity log',
  users: 'Users',
  team: 'Team',
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

const SO_DS_NAV = [
  { id: 'schedule',     label: 'Schedule',     Icon: Calendar,  contentId: null },
  { id: 'project-plan', label: 'Project plan', Icon: Waypoints, contentId: null },
  { id: 'team',         label: 'People',       Icon: Users,     contentId: 'team' as DataStudioNavId },
  { id: 'projects',     label: 'Projects',     Icon: Folder,    contentId: null },
  { id: 'report',       label: 'Report',       Icon: BarChart3, contentId: null },
  { id: 'log-team',     label: 'Log team',     Icon: Clock,     contentId: null },
  { id: 'log-my-time',  label: 'Log my time',  Icon: Timer,     contentId: null },
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
  const [_activeSingleOffice, _setActiveSingleOffice] = useState<string>('beaverton')
  const [soNavActive, setSoNavActive] = useState<string>('people')
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
        {officeMode === 'single' || officeMode === 'single-dsv1' || officeMode === 'single-datastudio' ? (
          <>
            {officeMode === 'single' || officeMode === 'single-dsv1' ? (
              <>
                {/* ── Single office nav ───────────────────────────────── */}
                <div className="app-rail__block">
                  {SINGLE_OFFICE_NAV.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      className={`app-rail__row${soNavActive === id ? ' app-rail__row--active' : ''}`}
                      onClick={() => {
                        setSoNavActive(id)
                        if (officeMode === 'single-dsv1' && id === 'people') {
                          onDataStudioActiveChange('people')
                        }
                      }}
                      aria-current={soNavActive === id ? 'page' : undefined}
                    >
                      <Icon size={iconSize} strokeWidth={iconStroke} className="app-rail__ico" aria-hidden />
                      <span className="app-rail__row-label">{label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* ── Single office + data studio nav ─────────────────── */}
                <div className="app-rail__block">
                  {SO_DS_NAV.map((item) => {
                    const isActive = item.contentId !== null
                      ? dataStudioActive === item.contentId
                      : soNavActive === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`app-rail__row${isActive ? ' app-rail__row--active' : ''}`}
                        onClick={() => {
                          if (item.contentId !== null) {
                            onDataStudioActiveChange(item.contentId)
                          } else {
                            setSoNavActive(item.id)
                          }
                        }}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <item.Icon size={iconSize} strokeWidth={iconStroke} className="app-rail__ico" aria-hidden />
                        <span className="app-rail__row-label">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {/* Data studio sub-nav */}
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
                    {(officeMode === 'single-datastudio' || officeMode === 'single-dsv1') && (
                      <button
                        type="button"
                        className={`app-rail__subrow${dataStudioActive === 'users' ? ' app-rail__subrow--active' : ''}`}
                        onClick={() => { onDataStudioActiveChange('users'); setSoNavActive('') }}
                        aria-current={dataStudioActive === 'users' ? 'page' : undefined}
                      >
                        <UserCog size={iconSize} strokeWidth={iconStroke} className="app-rail__ico" aria-hidden />
                        <span className="app-rail__row-label">Users</span>
                      </button>
                    )}
                    {SINGLE_OFFICE_DATA_STUDIO.map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        className={`app-rail__subrow${dataStudioActive === id ? ' app-rail__subrow--active' : ''}`}
                        onClick={() => { onDataStudioActiveChange(id as DataStudioNavId); setSoNavActive('') }}
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
  const [officeMode, setOfficeMode] = useState<OfficeModeId>('single')
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
    if (mode === 'single-datastudio') {
      setDataStudioNavId('users')
    } else if (mode === 'single' || mode === 'single-dsv1') {
      setDataStudioNavId('people')
    }
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
            <DataStudioPeoplePage
              rbacEnforced={rbacEnforced}
              officeMode={officeMode}
              onNavigateToUsers={officeMode === 'single-dsv1' ? () => setDataStudioNavId('users') : undefined}
            />
          ) : dataStudioNavId === 'users' && officeMode === 'single-dsv1' ? (
            <DSV1UsersPage />
          ) : dataStudioNavId === 'users' ? (
            <DataStudioUsersPage />
          ) : dataStudioNavId === 'team' ? (
            <DataStudioTeamPage />
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
                  {adminNavItems
                    .filter(item => !(officeMode === 'single-dsv1' && item.id === 'guests'))
                    .map((item) => {
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
                {pricingPlan === 'starter' ? null : (officeMode === 'single' || officeMode === 'single-dsv1' || officeMode === 'single-datastudio') ? null : (
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
                  officeMode={officeMode}
                />
              ) : activeOrgId === 'guests' && officeMode !== 'single-dsv1' ? (
                <GuestsPage />
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
