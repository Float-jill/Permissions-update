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
  { id: 'active', label: '64 Active' },
  { id: 'archived', label: '0 Archived' },
  { id: 'all', label: 'All' },
] as const

type CategoryId = (typeof CATEGORY_TABS)[number]['id']
type StatusFilterId = (typeof STATUS_FILTERS)[number]['id']

// ── People scope ─────────────────────────────────────────────────────────────

export type PeopleScope = 'everyone' | 'departments' | 'project-teams' | 'self'

const PEOPLE_SCOPE_OPTIONS: {
  id: PeopleScope
  label: string
  description: string
  isNew?: boolean
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
]

/** Return the sensible default scope for a given access role. */
function defaultPeopleScope(roleId: AccessRoleId): PeopleScope {
  if (roleId === 'project-manager') return 'project-teams'
  if (roleId === 'member') return 'self'
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
  /** Controls which people this user can see across Float. */
  peopleScope: PeopleScope
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

/** Wireframe sample: project lists shared across demo rows (white mock). */
const DEFAULT_PROJECT_VIEW = ['Build a house', 'Build a car', 'Build a spaceship']
const DEFAULT_PROJECT_EDIT = ['Build a fish']

const SAMPLE_PEOPLE: PeopleRow[] = [
  {
    id: '1',
    name: 'Jake Peralta',
    role: 'Designer',
    department: 'Design',
    deliveryTeam: 'Acquisition',
    groups: ['Leadership'],
    office: 'New York',
    email: 'jake.peralta@example.com',
    accessRoleId: 'resource-planner',
    peopleScope: defaultPeopleScope('resource-planner'),
    projectCanView: DEFAULT_PROJECT_VIEW,
    projectCanEdit: DEFAULT_PROJECT_EDIT,
    additionalPermissions: ['people.approve_time_off', 'project.view_profitability'],
  },
  {
    id: '2',
    name: 'Amy Santiago',
    role: 'Senior Designer',
    department: 'Design',
    deliveryTeam: 'Retention',
    groups: ['Hiring committee'],
    office: 'New York',
    email: 'amy.santiago@example.com',
    accessRoleId: 'project-manager',
    peopleScope: defaultPeopleScope('project-manager'),
    projectCanView: DEFAULT_PROJECT_VIEW,
    projectCanEdit: DEFAULT_PROJECT_EDIT,
    additionalPermissions: ['people.view_cost_rates', 'people.view_bill_rates'],
  },
  {
    id: '3',
    name: 'Rosa Diaz',
    role: 'Developer',
    department: 'Engineering',
    deliveryTeam: 'Core',
    groups: [],
    office: 'Sydney',
    email: 'rosa.diaz@example.com',
    accessRoleId: 'admin',
    peopleScope: defaultPeopleScope('admin'),
    projectCanView: DEFAULT_PROJECT_VIEW,
    projectCanEdit: DEFAULT_PROJECT_EDIT,
    additionalPermissions: [],
  },
  {
    id: '4',
    name: 'Terry Jeffords',
    role: 'Engineering Manager',
    department: 'Engineering',
    deliveryTeam: 'Core',
    groups: ['Leadership', 'AI working group'],
    office: 'New York',
    email: 'terry.jeffords@example.com',
    accessRoleId: 'admin',
    peopleScope: defaultPeopleScope('admin'),
    projectCanView: DEFAULT_PROJECT_VIEW,
    projectCanEdit: DEFAULT_PROJECT_EDIT,
    additionalPermissions: [],
  },
  {
    id: '5',
    name: 'Charles Boyle',
    role: 'Designer',
    department: 'Design',
    deliveryTeam: 'Creative studio',
    groups: [],
    office: 'Melbourne',
    email: 'charles.boyle@example.com',
    accessRoleId: 'resource-planner',
    peopleScope: defaultPeopleScope('resource-planner'),
    projectCanView: DEFAULT_PROJECT_VIEW,
    projectCanEdit: DEFAULT_PROJECT_EDIT,
    additionalPermissions: [],
  },
  {
    id: '6',
    name: 'Gina Linetti',
    role: 'Operations Lead',
    department: 'Operations',
    deliveryTeam: 'Acquisition',
    groups: ['Leadership'],
    office: 'London',
    email: 'gina.linetti@example.com',
    accessRoleId: 'project-manager',
    peopleScope: defaultPeopleScope('project-manager'),
    projectCanView: DEFAULT_PROJECT_VIEW,
    projectCanEdit: DEFAULT_PROJECT_EDIT,
    additionalPermissions: ['settings.manage_billing'],
  },
  {
    id: '7',
    name: 'Raymond Holt',
    role: 'Principal Designer',
    department: 'Design',
    deliveryTeam: 'Retention',
    groups: ['Leadership', 'Hiring committee'],
    office: 'New York',
    email: 'raymond.holt@example.com',
    accessRoleId: 'admin',
    peopleScope: defaultPeopleScope('admin'),
    projectCanView: DEFAULT_PROJECT_VIEW,
    projectCanEdit: DEFAULT_PROJECT_EDIT,
    additionalPermissions: [],
  },
  {
    id: '8',
    name: 'Norm Scully',
    role: 'Developer',
    department: 'Engineering',
    deliveryTeam: 'Core',
    groups: [],
    office: 'Sydney',
    email: 'norm.scully@example.com',
    accessRoleId: 'member',
    peopleScope: defaultPeopleScope('member'),
    projectCanView: DEFAULT_PROJECT_VIEW,
    projectCanEdit: DEFAULT_PROJECT_EDIT,
    additionalPermissions: [],
  },
]

function PeopleScopeCard({
  scope,
  onScopeChange,
}: {
  scope: PeopleScope
  onScopeChange: (s: PeopleScope) => void
}) {
  const active = PEOPLE_SCOPE_OPTIONS.find((o) => o.id === scope) ?? PEOPLE_SCOPE_OPTIONS[0]
  return (
    <section className="person-panel__card" aria-labelledby="people-scope-heading">
      <p id="people-scope-heading" className="person-panel__card-label">
        People scope
      </p>
      <div className="people-scope-picker" role="group" aria-label="People scope">
        {PEOPLE_SCOPE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`people-scope-opt${scope === opt.id ? ' people-scope-opt--active' : ''}`}
            onClick={() => onScopeChange(opt.id)}
            aria-pressed={scope === opt.id}
          >
            {opt.label}
            {opt.isNew && <span className="people-scope-opt__new">New</span>}
          </button>
        ))}
      </div>
      <p className="people-scope-desc">{active.description}</p>
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
    <section aria-labelledby="role-perms-heading">
      <p id="role-perms-heading" className="person-panel__card-label" style={{ marginBottom: 8 }}>
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
            <h1 className="dh-people__title">64 Employees</h1>
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
                <section className="person-panel__card" aria-labelledby="person-access-role-heading">
                  <p id="person-access-role-heading" className="person-panel__card-label">
                    Access role
                  </p>
                  <div className="person-panel__role-row">
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
                    {!rbacEnforced && selectedPerson.additionalPermissions.length > 0 && (
                      <span
                        className="person-panel__bespoke-badge"
                        title="This person has additional permissions beyond their role"
                      >
                        +{selectedPerson.additionalPermissions.length} additional permission{selectedPerson.additionalPermissions.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                </section>

                <PeopleScopeCard
                  scope={selectedPerson.peopleScope}
                  onScopeChange={(s) => updatePeopleScope(selectedPerson.id, s)}
                />

                <RolePermissionsCard accessRoleId={selectedPerson.accessRoleId} />

                <section className="person-panel__card" aria-labelledby="person-addl-perms-heading">
                  <div className="person-panel__card-label-row">
                    <p id="person-addl-perms-heading" className="person-panel__card-label">
                      Additional permissions
                    </p>
                    {!rbacEnforced && (
                      <span className="person-panel__additive-note">Additive only — grants on top of role</span>
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
                                  <label className="person-panel__perm-label">
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

                <section className="person-panel__card person-panel__card--access" aria-labelledby="project-access-heading">
                  <h3 id="project-access-heading" className="person-panel__section-title">
                    Project access (active projects)
                  </h3>
                  <div className="person-panel__access-block">
                    <p className="person-panel__access-sub">Can view</p>
                    <ul className="person-panel__list">
                      {selectedPerson.projectCanView.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="person-panel__access-block">
                    <p className="person-panel__access-sub">Can edit</p>
                    <ul className="person-panel__list">
                      {selectedPerson.projectCanEdit.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
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
