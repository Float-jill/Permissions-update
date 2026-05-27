import { useEffect, useState } from 'react'
import {
  ChevronDown,
  Circle,
  Filter,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react'
import { accessRoleLabel, ACCESS_ROLE_IDS, type AccessRoleId } from './accessRoles'
import { ROLES, GROUP_ORDER, ReadOnlyPermGroup } from './App'

/**
 * Per-user additive permission overrides (V1: additive only — these can only
 * grant permissions beyond what the assigned role already provides, never remove them).
 */
const AVAILABLE_ADDITIONAL_PERMISSIONS = [
  // People
  { id: 'people.view_cost_rates',    label: 'View cost rates',              category: 'People' },
  { id: 'people.view_bill_rates',    label: 'View bill rates',              category: 'People' },
  { id: 'people.approve_time_off',   label: 'Approve time off',             category: 'People' },
  { id: 'people.view_reports',       label: 'View people reports',          category: 'People' },
  { id: 'people.log_time_view',      label: 'View logged time for others',  category: 'People' },
  // Projects
  { id: 'project.view_budgets',      label: 'View project budgets',         category: 'Projects' },
  { id: 'project.view_profitability',label: 'View project profitability',   category: 'Projects' },
  { id: 'project.edit_budgets',      label: 'Edit project budgets',         category: 'Projects' },
  // Settings
  { id: 'settings.manage_billing',   label: 'Manage billing',               category: 'Settings' },
  { id: 'settings.manage_access',    label: 'Manage access rights',         category: 'Settings' },
]

const ADDITIONAL_PERM_CATEGORIES = ['People', 'Projects', 'Settings'] as const

const CATEGORY_TABS = [
  { id: 'employees', label: 'Employees' },
  { id: 'contractors', label: 'Contractors' },
  { id: 'departments', label: 'Departments' },
  { id: 'delivery', label: 'Delivery teams' },
  { id: 'groups', label: 'Groups' },
] as const

const STATUS_FILTERS = [
  { id: 'active', label: '243 Active' },
  { id: 'archived', label: '0 Archived' },
  { id: 'all', label: 'All' },
] as const

type CategoryId = (typeof CATEGORY_TABS)[number]['id']
type StatusFilterId = (typeof STATUS_FILTERS)[number]['id']

// ── People scope ─────────────────────────────────────────────────────────────

export type PeopleScope = 'everyone' | 'departments' | 'project-teams' | 'self' | 'groups'

const PEOPLE_SCOPE_OPTIONS: {
  id: PeopleScope
  label: string
  description: string
  isNew?: boolean
  isFuture?: boolean
}[] = [
  {
    id: 'everyone',
    label: 'Everyone',
    description: 'Can see all people in the organisation.',
  },
  {
    id: 'departments',
    label: 'Departments',
    description: 'Can see people in their own department(s) only.',
  },
  {
    id: 'project-teams',
    label: 'Project teams',
    description: 'Can see only members of projects they have access to. Designed for Project Managers — lets them plan and schedule within their projects, with Resource Planners staffing from the full people pool.',
    isNew: true,
  },
  {
    id: 'self',
    label: 'Self',
    description: 'Can only see themselves.',
  },
  {
    id: 'groups',
    label: 'Groups',
    description: 'Can see only people who share a group membership with them. Coming soon.',
    isFuture: true,
  },
]

/** Return the sensible default view scope for a given access role. */
function defaultPeopleScope(roleId: AccessRoleId): PeopleScope {
  if (roleId === 'project-manager') return 'project-teams'
  if (roleId === 'member') return 'self'
  return 'everyone'
}

/** Return the sensible default edit scope for a given access role. */
function defaultPeopleScopeEdit(_roleId: AccessRoleId): PeopleScope {
  return 'everyone'
}

export interface PeopleRow {
  id: string
  name: string
  /** Job title / function (e.g. Designer) — not the same as access role. */
  role: string
  /** Matches Settings → Access rights roles (Admin, Project manager, …). */
  accessRoleId: AccessRoleId
  department: string
  deliveryTeam: string
  groups: string[]
  office: string
  email: string
  /** Controls which people this user can view across Float. */
  peopleScope: PeopleScope
  /** Controls which people this user can edit across Float. */
  peopleScopeEdit: PeopleScope
  /** Projects this person can view — Access tab. */
  projectCanView: string[]
  /** Projects this person can edit — Access tab. */
  projectCanEdit: string[]
  /** Bespoke permissions granted to this individual beyond their role. */
  additionalPermissions: string[]
}

const PERSON_PANEL_TABS = [
  { id: 'info' as const, label: 'Info' },
  { id: 'access' as const, label: 'Access' },
  { id: 'availability' as const, label: 'Availability' },
  { id: 'timeoff' as const, label: 'Time off', badge: 8 },
  { id: 'projects' as const, label: 'Projects', badge: 76 },
  { id: 'manages' as const, label: 'Manages' },
]

type PersonPanelTabId = (typeof PERSON_PANEL_TABS)[number]['id']

const DEFAULT_PROJECT_VIEW = ['Build a house', 'Build a car', 'Build a spaceship']
const DEFAULT_PROJECT_EDIT = ['Build a fish']

// ── People generator ──────────────────────────────────────────────────────────

const GEN_FIRST = [
  'Emma','Liam','Olivia','Noah','Ava','Oliver','Sophia','Elijah','Isabella','James',
  'Charlotte','William','Mia','Benjamin','Amelia','Lucas','Harper','Mason','Evelyn','Ethan',
  'Abigail','Alexander','Emily','Henry','Elizabeth','Jacob','Ella','Michael','Avery','Daniel',
  'Sofia','Logan','Camila','Jackson','Aria','Sebastian','Scarlett','Jack','Victoria','Aiden',
]
const GEN_LAST = [
  'Smith','Johnson','Chen','Williams','Patel','Garcia','Kim',
]
const GEN_TITLES = [
  'Designer','Senior Designer','Lead Designer','UX Designer','Product Designer',
  'Developer','Senior Developer','Software Engineer','Frontend Developer','Backend Developer',
  'Engineering Manager','DevOps Engineer','QA Engineer',
  'Product Manager','Project Manager','Scrum Master',
  'Data Analyst','Business Analyst','Operations Lead',
  'Marketing Manager','Content Strategist','Brand Designer',
  'Finance Manager','HR Manager','Recruiter',
  'Account Manager','Customer Success Manager','Research Lead',
]
const GEN_DEPTS = ['Design','Engineering','Product','Marketing','Operations','Finance','HR','Sales','Research']
const GEN_TEAMS = ['Core','Acquisition','Retention','Creative studio','Growth','Platform','Infrastructure','Analytics','Enterprise']
const GEN_OFFICES = ['New York','London','Sydney','Melbourne','Berlin','Singapore','Toronto','Amsterdam','Austin']
const GEN_GROUPS = ['Leadership','Hiring committee','AI working group','Culture club','Safety team','DEI committee','Tech guild']

/** Role assignment — totals exactly 243 */
const GEN_ROLES: AccessRoleId[] = [
  ...Array<AccessRoleId>(2).fill('account-owner'),
  ...Array<AccessRoleId>(5).fill('admin'),
  ...Array<AccessRoleId>(35).fill('project-manager'),
  ...Array<AccessRoleId>(52).fill('resource-planner'),
  ...Array<AccessRoleId>(149).fill('member'),
]

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length] }

function generatePeople(count: number): PeopleRow[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = GEN_FIRST[i % GEN_FIRST.length]
    const lastName  = GEN_LAST[Math.floor(i / GEN_FIRST.length) % GEN_LAST.length]
    const name      = `${firstName} ${lastName}`
    const roleId    = GEN_ROLES[i]
    const dept      = pick(GEN_DEPTS, i)
    const groupSeed = i % 7
    const groups    = groupSeed === 0 ? [pick(GEN_GROUPS, Math.floor(i / 7))] : []
    return {
      id: String(i + 1),
      name,
      role: pick(GEN_TITLES, i),
      department: dept,
      deliveryTeam: pick(GEN_TEAMS, i + 3),
      groups,
      office: pick(GEN_OFFICES, i + 1),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 0 && GEN_FIRST[i % GEN_FIRST.length] === GEN_FIRST[(i - GEN_FIRST.length) % GEN_FIRST.length] ? i : ''}@example.com`,
      accessRoleId: roleId,
      peopleScope: defaultPeopleScope(roleId),
      peopleScopeEdit: defaultPeopleScopeEdit(roleId),
      projectCanView: DEFAULT_PROJECT_VIEW,
      projectCanEdit: i % 4 === 0 ? DEFAULT_PROJECT_EDIT : [],
      additionalPermissions: [],
    }
  })
}

const SAMPLE_PEOPLE: PeopleRow[] = generatePeople(243)

const ALL_PROJECTS = [
  'Build a house',
  'Build a car',
  'Build a spaceship',
  'Build a fish',
  'Design system refresh',
  'Q4 marketing campaign',
  'Mobile app v2',
  'Data platform migration',
  'Brand guidelines update',
  'Analytics dashboard',
]

function ProjectAddRow({
  onAdd,
  existing,
}: {
  onAdd: (project: string) => void
  existing: string[]
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const available = ALL_PROJECTS.filter((p) => !existing.includes(p))

  if (!open) {
    return (
      <button
        type="button"
        className="person-panel__proj-add"
        onClick={() => setOpen(true)}
        disabled={available.length === 0}
      >
        <Plus size={12} strokeWidth={2.5} aria-hidden />
        Add project
      </button>
    )
  }

  return (
    <div className="person-panel__proj-add-row">
      <select
        className="person-panel__proj-add-select"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
      >
        <option value="">Select a project…</option>
        {available.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <button
        type="button"
        className="person-panel__proj-add-confirm"
        disabled={!value}
        onClick={() => {
          if (value) { onAdd(value); setValue(''); setOpen(false) }
        }}
      >
        Add
      </button>
      <button
        type="button"
        className="person-panel__proj-add-cancel"
        aria-label="Cancel"
        onClick={() => { setValue(''); setOpen(false) }}
      >
        <X size={13} strokeWidth={2} aria-hidden />
      </button>
    </div>
  )
}

function ScopePicker({
  id,
  label,
  scope,
  onScopeChange,
}: {
  id: string
  label: string
  scope: PeopleScope
  onScopeChange: (s: PeopleScope) => void
}) {
  const active = PEOPLE_SCOPE_OPTIONS.find((o) => o.id === scope) ?? PEOPLE_SCOPE_OPTIONS[0]
  return (
    <div className="people-scope-sub">
      <p id={id} className="people-scope-sub__label">{label}</p>
      <div className="people-scope-picker" role="group" aria-labelledby={id}>
        {PEOPLE_SCOPE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={[
              'people-scope-opt',
              scope === opt.id ? 'people-scope-opt--active' : '',
              opt.isFuture ? 'people-scope-opt--future' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => !opt.isFuture && onScopeChange(opt.id)}
            aria-pressed={scope === opt.id}
            aria-disabled={opt.isFuture}
          >
            {opt.label}
            {opt.isNew && <span className="people-scope-opt__new">New</span>}
            {opt.isFuture && <span className="people-scope-opt__future">Future</span>}
          </button>
        ))}
      </div>
      <p className="people-scope-desc">{active.description}</p>
    </div>
  )
}

function PeopleScopeCard({
  scopeView,
  scopeEdit,
  onScopeViewChange,
  onScopeEditChange,
}: {
  scopeView: PeopleScope
  scopeEdit: PeopleScope
  onScopeViewChange: (s: PeopleScope) => void
  onScopeEditChange: (s: PeopleScope) => void
}) {
  return (
    <section className="person-panel__section" aria-labelledby="people-scope-heading">
      <p id="people-scope-heading" className="person-panel__section-label">
        People scope
      </p>
      <ScopePicker
        id="people-scope-view"
        label="Can view"
        scope={scopeView}
        onScopeChange={onScopeViewChange}
      />
      <div className="people-scope-divider" />
      <ScopePicker
        id="people-scope-edit"
        label="Can edit"
        scope={scopeEdit}
        onScopeChange={onScopeEditChange}
      />
    </section>
  )
}

function RolePermissionsCard({ accessRoleId }: { accessRoleId: AccessRoleId }) {
  const role = ROLES.find((r) => r.id === accessRoleId)
  if (!role) return null

  const groups = GROUP_ORDER.map((g) => ({
    label: g,
    perms: role.configPerms.filter((p) => p.group === g),
  })).filter((g) => g.perms.length > 0)

  return (
    <section className="person-panel__section" aria-labelledby="role-perms-heading">
      <p id="role-perms-heading" className="person-panel__section-label" style={{ marginBottom: 10 }}>
        {accessRoleLabel(accessRoleId)} permissions
      </p>
      <div className="role-card__table-wrap">
        <table className="cfg-table cfg-table--readonly">
          <thead>
            <tr>
              <th className="cfg-table__th">Permission</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <ReadOnlyPermGroup key={g.label} label={g.label} perms={g.perms} />
            ))}
          </tbody>
        </table>
        {role.footerNote && (
          <div className="cfg-table__footer">{role.footerNote}</div>
        )}
      </div>
    </section>
  )
}

function nameInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?'
}

export function DataStudioPeoplePage({ rbacEnforced = false }: { rbacEnforced?: boolean }) {
  const [category, setCategory] = useState<CategoryId>('employees')
  const [statusFilter, setStatusFilter] = useState<StatusFilterId>('active')
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [personPanelTab, setPersonPanelTab] = useState<PersonPanelTabId>('access')
  const [people, setPeople] = useState<PeopleRow[]>(SAMPLE_PEOPLE)

  const selectedPerson = selectedPersonId
    ? people.find((p) => p.id === selectedPersonId) ?? null
    : null

  function updatePersonRole(id: string, roleId: AccessRoleId) {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, accessRoleId: roleId } : p)))
  }

  function updatePeopleScope(id: string, scope: PeopleScope) {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, peopleScope: scope } : p)))
  }

  function updatePeopleScopeEdit(id: string, scope: PeopleScope) {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, peopleScopeEdit: scope } : p)))
  }

  function addProjectView(id: string, project: string) {
    setPeople((prev) =>
      prev.map((p) =>
        p.id === id && !p.projectCanView.includes(project)
          ? { ...p, projectCanView: [...p.projectCanView, project] }
          : p,
      ),
    )
  }

  function removeProjectView(id: string, project: string) {
    setPeople((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, projectCanView: p.projectCanView.filter((x) => x !== project) } : p,
      ),
    )
  }

  function addProjectEdit(id: string, project: string) {
    setPeople((prev) =>
      prev.map((p) =>
        p.id === id && !p.projectCanEdit.includes(project)
          ? { ...p, projectCanEdit: [...p.projectCanEdit, project] }
          : p,
      ),
    )
  }

  function removeProjectEdit(id: string, project: string) {
    setPeople((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, projectCanEdit: p.projectCanEdit.filter((x) => x !== project) } : p,
      ),
    )
  }

  function toggleAdditionalPermission(id: string, permId: string) {
    setPeople((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const has = p.additionalPermissions.includes(permId)
        return {
          ...p,
          additionalPermissions: has
            ? p.additionalPermissions.filter((x) => x !== permId)
            : [...p.additionalPermissions, permId],
        }
      }),
    )
  }

  function openPerson(id: string) {
    setSelectedPersonId(id)
    setPersonPanelTab('access')
  }

  function closePersonPanel() {
    setSelectedPersonId(null)
  }

  useEffect(() => {
    if (!selectedPersonId) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedPersonId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedPersonId])

  return (
    <>
    <div className="dh-people">
      <div className="dh-people__toolbar">
        <div className="dh-people__toolbar-left">
          <div className="dh-people__title-row">
            <h1 className="dh-people__title">243 People</h1>
            <button type="button" className="dh-people__filter-btn">
              <Filter size={16} strokeWidth={1.5} aria-hidden />
              Filter
            </button>
          </div>
        </div>
        <div className="dh-people__top-actions">
          <button type="button" className="dh-people__icon-add" aria-label="Add employee">
            <Plus size={22} strokeWidth={1.5} />
          </button>
          <button type="button" className="dh-people__import">
            <RefreshCw size={16} strokeWidth={1.5} aria-hidden />
            Import/Export
          </button>
        </div>
      </div>

      <div className="dh-people__tabs-wrap">
        <button type="button" className="dh-people__office-dd">
          All offices
          <ChevronDown size={14} strokeWidth={1.5} aria-hidden />
        </button>
        <div className="dh-people__tabs" role="tablist" aria-label="People categories">
          {CATEGORY_TABS.map((tab) => {
            const isActive = category === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`dh-people__tab${isActive ? ' dh-people__tab--active' : ''}`}
                onClick={() => setCategory(tab.id)}
              >
                {isActive ? (
                  <Circle className="dh-people__tab-dot" size={6} fill="currentColor" aria-hidden />
                ) : null}
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="dh-people__subfilters">
        <button type="button" className="dh-people__subfilter-plus" aria-label="Add filter">
          <Plus size={16} strokeWidth={1.5} />
        </button>
        <div className="dh-people__status-chips" role="group" aria-label="Status">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`dh-people__chip${statusFilter === s.id ? ' dh-people__chip--active' : ''}`}
              onClick={() => setStatusFilter(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dh-people__table-wrap">
        <table className="dh-people__table">
          <thead>
            <tr>
              <th className="dh-people__th dh-people__th--check" scope="col">
                <span className="sr-only">Select</span>
              </th>
              <th className="dh-people__th" scope="col">
                Name
              </th>
              <th className="dh-people__th" scope="col">
                <button type="button" className="dh-people__th-btn">
                  Role
                  <ChevronDown size={14} strokeWidth={1.5} aria-hidden />
                </button>
              </th>
              <th className="dh-people__th" scope="col">
                Access
              </th>
              <th className="dh-people__th" scope="col">
                <button type="button" className="dh-people__th-btn">
                  Department
                  <ChevronDown size={14} strokeWidth={1.5} aria-hidden />
                </button>
              </th>
              <th className="dh-people__th" scope="col">
                <button type="button" className="dh-people__th-btn">
                  Delivery Team
                  <ChevronDown size={14} strokeWidth={1.5} aria-hidden />
                </button>
              </th>
              <th className="dh-people__th" scope="col">
                Group
              </th>
              <th className="dh-people__th" scope="col">
                Office
              </th>
            </tr>
          </thead>
          <tbody>
            {people.map((row) => (
              <tr
                key={row.id}
                className={`dh-people__row${selectedPersonId === row.id ? ' dh-people__row--selected' : ''}`}
                onClick={() => openPerson(row.id)}
              >
                <td className="dh-people__td dh-people__td--check">
                  <input
                    type="checkbox"
                    className="dh-people__checkbox"
                    aria-label={`Select ${row.name}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="dh-people__td">
                  <span className="dh-people__name-cell">{row.name}</span>
                </td>
                <td className="dh-people__td">{row.role}</td>
                <td className="dh-people__td dh-people__td--access">
                  <span className="dh-people__access-cell">
                    {accessRoleLabel(row.accessRoleId)}
                    {!rbacEnforced && row.additionalPermissions.length > 0 && (
                      <span
                        className="dh-people__addl-count"
                        aria-label={`${row.additionalPermissions.length} additional permission${row.additionalPermissions.length === 1 ? '' : 's'}`}
                      >
                        +{row.additionalPermissions.length}
                      </span>
                    )}
                  </span>
                </td>
                <td className="dh-people__td">{row.department}</td>
                <td className="dh-people__td">{row.deliveryTeam}</td>
                <td className="dh-people__td">
                  <div className="dh-people__group-pills">
                    {row.groups.map((g) => (
                      <span key={g} className="dh-people__pill">
                        {g}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="dh-people__td">{row.office}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {selectedPerson && (
      <>
        <div
          className="person-panel__backdrop"
          role="presentation"
          aria-hidden
          onClick={closePersonPanel}
        />
        <aside
          className="person-panel"
          aria-label={`${selectedPerson.name} profile`}
          id="person-side-panel"
        >
          <header className="person-panel__header">
            <div className="person-panel__header-text">
              <h2 className="person-panel__name">{selectedPerson.name}</h2>
              <p className="person-panel__email">{selectedPerson.email}</p>
            </div>
            <div className="person-panel__header-actions">
              <div className="person-panel__avatar" aria-hidden>
                {nameInitial(selectedPerson.name)}
              </div>
              <button
                type="button"
                className="person-panel__close"
                onClick={closePersonPanel}
                aria-label="Close panel"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
          </header>

          <div className="person-panel__tabs" role="tablist" aria-label="Person sections">
            {PERSON_PANEL_TABS.map((tab) => {
              const isActive = personPanelTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`person-panel__tab${isActive ? ' person-panel__tab--active' : ''}`}
                  onClick={() => setPersonPanelTab(tab.id)}
                >
                  {tab.label}
                  {'badge' in tab && tab.badge != null ? (
                    <span className="person-panel__tab-badge">{tab.badge}</span>
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="person-panel__body">
            {personPanelTab === 'access' && (
              <div className="person-panel__access">

                {/* ── Access role ───────────────────────────────────────── */}
                <section className="person-panel__section" aria-labelledby="person-access-role-heading">
                  <div className="person-panel__role-row">
                    <p id="person-access-role-heading" className="person-panel__section-label">
                      Access role
                    </p>
                    <select
                      className="person-panel__role-select"
                      value={selectedPerson.accessRoleId}
                      onChange={(e) =>
                        updatePersonRole(selectedPerson.id, e.target.value as AccessRoleId)
                      }
                      aria-label="Access role"
                    >
                      {ACCESS_ROLE_IDS.map((roleId) => (
                        <option key={roleId} value={roleId}>
                          {accessRoleLabel(roleId)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {!rbacEnforced && selectedPerson.additionalPermissions.length > 0 && (
                    <p className="person-panel__role-addl">
                      +{selectedPerson.additionalPermissions.length} additional permission{selectedPerson.additionalPermissions.length === 1 ? '' : 's'} beyond this role
                    </p>
                  )}
                </section>

                <div className="person-panel__divider" />

                {/* ── Role permissions ──────────────────────────────────── */}
                <RolePermissionsCard accessRoleId={selectedPerson.accessRoleId} />

                <div className="person-panel__divider" />

                {/* ── Additional permissions ────────────────────────────── */}
                <section className="person-panel__section" aria-labelledby="person-addl-perms-heading">
                  <div className="person-panel__section-header-row">
                    <p id="person-addl-perms-heading" className="person-panel__section-label">
                      Additional permissions
                    </p>
                    {!rbacEnforced && (
                      <span className="person-panel__additive-pill">Additive only</span>
                    )}
                  </div>
                  {rbacEnforced ? (
                    <div className="person-panel__rbac-locked">
                      <p className="person-panel__rbac-locked__msg">
                        Per-user overrides are disabled. Role-based access controls are enforced
                        for this organisation — change the setting in{' '}
                        <strong>Settings → Access rights</strong>.
                      </p>
                    </div>
                  ) : (
                    ADDITIONAL_PERM_CATEGORIES.map((cat) => {
                      const catPerms = AVAILABLE_ADDITIONAL_PERMISSIONS.filter((p) => p.category === cat)
                      return (
                        <div key={cat} className="person-panel__perm-category">
                          <p className="person-panel__perm-category-label">{cat}</p>
                          <ul className="person-panel__perm-list">
                            {catPerms.map((perm) => {
                              const checked = selectedPerson.additionalPermissions.includes(perm.id)
                              return (
                                <li key={perm.id} className="person-panel__perm-item">
                                  <label className={`person-panel__perm-label${checked ? ' person-panel__perm-label--checked' : ''}`}>
                                    <input
                                      type="checkbox"
                                      className="person-panel__perm-checkbox"
                                      checked={checked}
                                      onChange={() =>
                                        toggleAdditionalPermission(selectedPerson.id, perm.id)
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
                  )}
                </section>

                <div className="person-panel__divider" />

                {/* ── People scope ──────────────────────────────────────── */}
                <PeopleScopeCard
                  scopeView={selectedPerson.peopleScope}
                  scopeEdit={selectedPerson.peopleScopeEdit}
                  onScopeViewChange={(s) => updatePeopleScope(selectedPerson.id, s)}
                  onScopeEditChange={(s) => updatePeopleScopeEdit(selectedPerson.id, s)}
                />

                <div className="person-panel__divider" />

                {/* ── Project access ────────────────────────────────────── */}
                <section className="person-panel__section" aria-labelledby="project-access-heading">
                  <p id="project-access-heading" className="person-panel__section-label">
                    Project access
                    <span className="person-panel__section-label-sub">active projects</span>
                  </p>
                  <div className="person-panel__access-block">
                    <p className="person-panel__access-sub">Can view</p>
                    <ul className="person-panel__proj-list">
                      {selectedPerson.projectCanView.map((proj) => (
                        <li key={proj} className="person-panel__proj-item">
                          <span className="person-panel__proj-name">{proj}</span>
                          <button
                            type="button"
                            className="person-panel__proj-remove"
                            aria-label={`Remove ${proj}`}
                            onClick={() => removeProjectView(selectedPerson.id, proj)}
                          >
                            <X size={12} strokeWidth={2} aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <ProjectAddRow
                      onAdd={(proj) => addProjectView(selectedPerson.id, proj)}
                      existing={selectedPerson.projectCanView}
                    />
                  </div>
                  <div className="person-panel__access-block">
                    <p className="person-panel__access-sub">Can edit</p>
                    <ul className="person-panel__proj-list">
                      {selectedPerson.projectCanEdit.map((proj) => (
                        <li key={proj} className="person-panel__proj-item">
                          <span className="person-panel__proj-name">{proj}</span>
                          <button
                            type="button"
                            className="person-panel__proj-remove"
                            aria-label={`Remove ${proj}`}
                            onClick={() => removeProjectEdit(selectedPerson.id, proj)}
                          >
                            <X size={12} strokeWidth={2} aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <ProjectAddRow
                      onAdd={(proj) => addProjectEdit(selectedPerson.id, proj)}
                      existing={selectedPerson.projectCanEdit}
                    />
                  </div>
                </section>

              </div>
            )}

            {personPanelTab === 'info' && (
              <div className="person-panel__placeholder">
                <p className="person-panel__muted">
                  Name, role, rates, department, tags, and type — as in the profile editor.
                </p>
              </div>
            )}

            {personPanelTab === 'availability' && (
              <div className="person-panel__placeholder">
                <p className="person-panel__muted">Availability schedule will appear here.</p>
              </div>
            )}

            {personPanelTab === 'timeoff' && (
              <div className="person-panel__placeholder">
                <p className="person-panel__muted">Time off history and balances will appear here.</p>
              </div>
            )}

            {personPanelTab === 'projects' && (
              <div className="person-panel__placeholder">
                <p className="person-panel__muted">All linked projects will appear here.</p>
              </div>
            )}

            {personPanelTab === 'manages' && (
              <div className="person-panel__placeholder">
                <p className="person-panel__muted">People and teams this person manages.</p>
              </div>
            )}
          </div>

          <footer className="person-panel__footer">
            <div className="person-panel__footer-left">
              <button type="button" className="btn btn--primary">
                Update person
              </button>
              <button type="button" className="btn btn--ghost" onClick={closePersonPanel}>
                Cancel
              </button>
            </div>
            <button type="button" className="person-panel__actions-link">
              Actions
              <ChevronDown size={14} strokeWidth={1.5} aria-hidden />
            </button>
          </footer>
        </aside>
      </>
    )}
    </>
  )
}
