import { useEffect, useState } from 'react'
import {
  Archive,
  ChevronDown,
  Download,
  ExternalLink,
  Pencil,
  Plus,
  SlidersHorizontal,
  UserPlus,
  X,
} from 'lucide-react'
import { accessRoleLabel, ACCESS_ROLE_IDS, type AccessRoleId } from './accessRoles'
import {
  ROLES, GROUP_ORDER, ReadOnlyPermGroup,
  RoleScopeSelector, ProjectScopeSelector, ClientScopeSelector,
  SCOPE_OPTIONS,
  type ScopeId, type ProjectScopeId, type ClientScopeId,
} from './App'

// ── Float custom icons (inline SVG, matched from Figma) ───────────────────────

/** Float views-20px: stacked diamond + add-view "+" */
function IconViews({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8.00008 3.1665L12.8334 5.99984L8.00008 8.83317L3.16675 5.99984L8.00008 3.1665Z" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.6001 8.12354L10.4002 8.58542" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.00008 12.8334L3.16675 10L6.16675 8" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.8999 10.3999V13.3999" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.3999 11.8999L13.3999 11.8999" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/** Float search-filter-16px: magnifying glass with trailing filter lines */
function IconSearchFilter({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M7.33342 3.1665C5.03223 3.1665 3.16675 5.03198 3.16675 7.33317C3.16675 9.63436 5.03223 11.4998 7.33342 11.4998C9.6346 11.4998 11.5001 9.63436 11.5001 7.33317M12.8334 12.8332L10.3334 10.3332" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 3.3335L12.6667 3.3335" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.6667 5.3335L12.0001 5.3335" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

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
  { id: 'people.log_time.view',      label: 'View logged time for others',  category: 'People' },
  // Projects
  { id: 'project.view_budgets',      label: 'View project budgets',         category: 'Projects' },
  { id: 'project.view_profitability',label: 'View project profitability',   category: 'Projects' },
  { id: 'project.edit_budgets',      label: 'Edit project budgets',         category: 'Projects' },
  // Settings
  { id: 'settings.manage_billing',   label: 'Manage billing',               category: 'Settings' },
  { id: 'settings.manage_access_rights', label: 'Manage access rights',     category: 'Settings' },
]

const ADDITIONAL_PERM_CATEGORIES = ['People', 'Projects', 'Settings'] as const

const CATEGORY_TABS = [
  { id: 'employees',  label: 'Employees' },
  { id: 'contractors', label: 'Contractors' },
  { id: 'departments', label: 'Departments' },
  { id: 'delivery',   label: 'Delivery teams' },
  { id: 'groups',     label: 'Groups' },
] as const

type CategoryId = (typeof CATEGORY_TABS)[number]['id']

const STATUS_FILTERS = [
  { id: 'active', label: '243 Active' },
  { id: 'archived', label: '0 Archived' },
  { id: 'all', label: 'All' },
] as const

type StatusFilterId = (typeof STATUS_FILTERS)[number]['id']

// ── People scope ─────────────────────────────────────────────────────────────

export type PeopleScope = 'everyone' | 'departments' | 'project-teams' | 'self'


/** Return the sensible default view scope for a given access role. */
function defaultPeopleScope(roleId: AccessRoleId): PeopleScope {
  if (roleId === 'project-manager') return 'project-teams'
  if (roleId === 'people-manager' || roleId === 'resource-planner') return 'departments'
  if (roleId === 'member') return 'self'
  return 'everyone'
}


export type ProjectAccessLevel = 'all' | 'assigned' | 'none'


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
  /** Controls which people this user can view and manage across Float. */
  peopleScope: PeopleScope
  /** Selected departments when peopleScope === 'departments'. */
  peopleScopeDepartments: string[]
  /** Number of people directly managed by this person. */
  directReportsCount: number
  /** Top-level project access level for this person. */
  projectAccess: ProjectAccessLevel
  /** Bespoke permissions granted to this individual beyond their role. */
  additionalPermissions: string[]
  /** Departments this person manages (manages.departments scope attribute). */
  managedDepartments: string[]
  /** IDs of people this person directly manages (manages.people scope attribute). */
  managedPersonIds: string[]
  /** Project IDs this person is owner of. */
  ownedProjectIds: string[]
  /** Project IDs this person contributes to (not owner). */
  contributorProjectIds: string[]
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

// ── Sample projects ───────────────────────────────────────────────────────────

export interface ProjectRow {
  id: string
  name: string
  client: string
  color: string
}

const PROJECT_COLORS = ['#3b6fd4','#c0392b','#e6a817','#27ae60','#8e44ad','#2980b9','#16a085','#d35400']

export const SAMPLE_PROJECTS: ProjectRow[] = [
  { id: 'p1',  name: '*1 Day',                   client: 'A new client',    color: PROJECT_COLORS[0] },
  { id: 'p2',  name: 'Monthly phases',            client: 'A new client',    color: PROJECT_COLORS[1] },
  { id: 'p3',  name: 'My draft project',          client: 'A new client',    color: PROJECT_COLORS[2] },
  { id: 'p4',  name: 'New project name',          client: 'A new client',    color: PROJECT_COLORS[3] },
  { id: 'p5',  name: 'Project name',              client: 'A new client',    color: PROJECT_COLORS[4] },
  { id: 'p6',  name: '*3 Days',                   client: 'Core',            color: PROJECT_COLORS[0] },
  { id: 'p7',  name: 'New Project Edit',          client: 'Core',            color: PROJECT_COLORS[3] },
  { id: 'p8',  name: 'Racing time - Brand campaign', client: 'Core',         color: PROJECT_COLORS[4] },
  { id: 'p9',  name: '* New Project',             client: 'Different client',color: PROJECT_COLORS[0] },
  { id: 'p10', name: 'Brand refresh',             client: 'Acme Corp',       color: PROJECT_COLORS[5] },
  { id: 'p11', name: 'Q3 Growth campaign',        client: 'Acme Corp',       color: PROJECT_COLORS[2] },
  { id: 'p12', name: 'Infrastructure upgrade',    client: 'Internal',        color: PROJECT_COLORS[6] },
  { id: 'p13', name: 'Sales enablement toolkit',  client: 'Bright Co',       color: PROJECT_COLORS[7] },
  { id: 'p14', name: 'Design system v2',          client: 'Internal',        color: PROJECT_COLORS[4] },
  { id: 'p15', name: 'Annual report 2024',        client: 'Pinnacle Ltd',    color: PROJECT_COLORS[1] },
]
const GEN_TEAMS = ['Core','Acquisition','Retention','Creative studio','Growth','Platform','Infrastructure','Analytics','Enterprise']
const GEN_OFFICES = ['New York','London','Sydney','Melbourne','Berlin','Singapore','Toronto','Amsterdam','Austin']
const GEN_GROUPS = ['Leadership','Hiring committee','AI working group','Culture club','Safety team','DEI committee','Tech guild']

/** Role assignment — totals exactly 243 */
const GEN_ROLES: AccessRoleId[] = [
  ...Array<AccessRoleId>(2).fill('account-owner'),
  ...Array<AccessRoleId>(5).fill('admin'),
  ...Array<AccessRoleId>(15).fill('people-manager'),
  ...Array<AccessRoleId>(20).fill('project-manager'),
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
      peopleScopeDepartments: [dept],
      directReportsCount: roleId === 'people-manager' ? 4 + (i % 6) : roleId === 'admin' ? 2 + (i % 4) : 0,
      projectAccess: (roleId === 'account-owner' || roleId === 'admin') ? 'all' : roleId === 'member' ? 'assigned' : 'all',
      additionalPermissions: [],
      managedDepartments: (roleId === 'people-manager' || roleId === 'admin') ? [dept] : [],
      managedPersonIds: [],
      ownedProjectIds: (roleId === 'project-manager' || roleId === 'admin')
        ? [SAMPLE_PROJECTS[i % 5].id, SAMPLE_PROJECTS[(i + 2) % 5].id]
        : [],
      contributorProjectIds: SAMPLE_PROJECTS.slice(5, 5 + (i % 5) + 1).map((p) => p.id),
    }
  })
}

export const SAMPLE_PEOPLE: PeopleRow[] = generatePeople(243)



export function DeptTagPicker({
  selected,
  onChange,
  readOnly = false,
}: {
  selected: string[]
  onChange: (depts: string[]) => void
  readOnly?: boolean
}) {
  const available = GEN_DEPTS.filter((d) => !selected.includes(d))

  function remove(dept: string) {
    onChange(selected.filter((d) => d !== dept))
  }

  function add(dept: string) {
    if (dept && !selected.includes(dept)) onChange([...selected, dept])
  }

  return (
    <div className="dept-tag-picker">
      <p className="dept-tag-picker__label">Departments</p>
      <div className={`dept-tag-picker__field${readOnly ? ' dept-tag-picker__field--readonly' : ''}`}>
        {selected.map((dept) => (
          <span key={dept} className="dept-tag-picker__tag">
            {dept}
            {!readOnly && (
              <button
                type="button"
                className="dept-tag-picker__remove"
                aria-label={`Remove ${dept}`}
                onClick={() => remove(dept)}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {!readOnly && available.length > 0 && (
          <select
            className="dept-tag-picker__add"
            value=""
            onChange={(e) => { add(e.target.value); e.target.value = '' }}
            aria-label="Add department"
          >
            <option value="">Add department…</option>
            {available.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}
        {readOnly && selected.length === 0 && (
          <span className="dept-tag-picker__empty">None selected</span>
        )}
      </div>
    </div>
  )
}


function RolePermissionsCard({ accessRoleId }: { accessRoleId: AccessRoleId }) {
  const role = ROLES.find((r) => r.id === accessRoleId)
  if (!role) return null

  const defaultScope: ScopeId[] = [role.scope]
  const defaultProjectScope: ProjectScopeId = 'all'
  const defaultClientScope: ClientScopeId = 'all'

  const groups = GROUP_ORDER.map((g) => ({
    label: g,
    perms: role.configPerms.filter((p) => p.group === g),
  })).filter((g) => g.perms.length > 0)

  const viewScopeLabel = defaultScope.map((s) => SCOPE_OPTIONS.find((o) => o.id === s)?.label ?? s).join(', ')

  const resolvedPerms = role.configPerms.map((p) => ({
    ...p,
    description: (p.description ?? '')
      .replace('{{people-view-scope}}', viewScopeLabel)
      .replace('{{people-edit-scope}}', viewScopeLabel)
      .replace('project view scope', 'All projects')
      .replace('project edit scope', 'All projects'),
  }))

  return (
    <section className="person-panel__section" aria-labelledby="role-perms-heading">
      <p id="role-perms-heading" className="person-panel__section-label" style={{ marginBottom: 10 }}>
        {accessRoleLabel(accessRoleId)} permissions
      </p>
      <div className="person-panel__role-groups">
        {groups.map((g) => {
          const resolvedGroupPerms = resolvedPerms.filter((p) => p.group === g.label)
          return (
            <div key={g.label} className="role-section-card">
              <div className="role-section-card__header">
                <span className="role-section-card__title">{g.label}</span>
              </div>
              {g.label === 'People' && (
                <div className="role-inline-scope">
                  <div className="role-scope-sub">
                    <p className="role-scope-sub__label">Can view</p>
                    <RoleScopeSelector value={defaultScope} readOnly />
                  </div>
                  <div className="role-scope-divider" />
                  <div className="role-scope-sub">
                    <p className="role-scope-sub__label">Can edit</p>
                    <RoleScopeSelector value={defaultScope} readOnly />
                  </div>
                </div>
              )}
              {g.label === 'Projects' && (
                <div className="role-inline-scope">
                  <div className="role-scope-sub">
                    <p className="role-scope-sub__label">Can view</p>
                    <ProjectScopeSelector value={defaultProjectScope} readOnly />
                  </div>
                  <div className="role-scope-divider" />
                  <div className="role-scope-sub">
                    <p className="role-scope-sub__label">Can edit</p>
                    <ProjectScopeSelector value={defaultProjectScope} readOnly />
                  </div>
                </div>
              )}
              {g.label === 'Clients' && (
                <div className="role-inline-scope">
                  <div className="role-scope-sub">
                    <p className="role-scope-sub__label">Can view</p>
                    <ClientScopeSelector value={defaultClientScope} readOnly />
                  </div>
                  <div className="role-scope-divider" />
                  <div className="role-scope-sub">
                    <p className="role-scope-sub__label">Can edit</p>
                    <ClientScopeSelector value={defaultClientScope} readOnly />
                  </div>
                  <div className="role-scope-divider" />
                  <div className="role-scope-sub">
                    <p className="role-scope-sub__label">Can view rate cards</p>
                    <ClientScopeSelector value={defaultClientScope} readOnly />
                  </div>
                  <div className="role-scope-divider" />
                  <div className="role-scope-sub">
                    <p className="role-scope-sub__label">Can edit rate cards</p>
                    <ClientScopeSelector value={defaultClientScope} readOnly />
                  </div>
                </div>
              )}
              <table className="cfg-table cfg-table--readonly role-perms-group-table">
                <tbody>
                  <ReadOnlyPermGroup label="Permissions" perms={resolvedGroupPerms} />
                </tbody>
              </table>
            </div>
          )
        })}
        {role.footerNote && (
          <div className="cfg-table__footer cfg-table__footer--standalone">{role.footerNote}</div>
        )}
      </div>
    </section>
  )
}

function ProjectsTab({
  person,
  allProjects,
  onOwnedChange,
  onContributorChange,
}: {
  person: PeopleRow
  allProjects: ProjectRow[]
  onOwnedChange: (ids: string[]) => void
  onContributorChange: (ids: string[]) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const assignedIds = new Set([...person.ownedProjectIds, ...person.contributorProjectIds])
  const available = allProjects.filter((p) => !assignedIds.has(p.id))
  const lowerQ = query.toLowerCase()
  const filtered = available.filter(
    (p) => p.name.toLowerCase().includes(lowerQ) || p.client.toLowerCase().includes(lowerQ),
  )

  function assign(projectId: string) {
    onContributorChange([...person.contributorProjectIds, projectId])
    setQuery('')
    setOpen(false)
  }

  function removeOwned(id: string) {
    onOwnedChange(person.ownedProjectIds.filter((x) => x !== id))
  }

  function removeContributor(id: string) {
    onContributorChange(person.contributorProjectIds.filter((x) => x !== id))
  }

  const ownedProjects = person.ownedProjectIds
    .map((id) => allProjects.find((p) => p.id === id))
    .filter(Boolean) as ProjectRow[]

  const contributorProjects = person.contributorProjectIds
    .map((id) => allProjects.find((p) => p.id === id))
    .filter(Boolean) as ProjectRow[]

  return (
    <div className="projects-tab">
      {/* ── Assign search ── */}
      <div className="projects-tab__search-wrap">
        <p className="projects-tab__search-label">Assign a project</p>
        <div className="projects-tab__search-field">
          <input
            type="text"
            className="projects-tab__input"
            placeholder="Type and select projects"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            aria-label="Search projects"
          />
          <ChevronDown size={14} strokeWidth={1.5} className="projects-tab__chevron" aria-hidden />
        </div>
        {open && (
          <div className="projects-tab__dropdown" role="listbox">
            {filtered.length === 0 ? (
              <div className="projects-tab__dropdown-empty">
                {query ? `No results for "${query}"` : 'All projects already assigned'}
              </div>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  className="projects-tab__dropdown-item"
                  onMouseDown={() => assign(p.id)}
                >
                  <span className="projects-tab__dot" style={{ background: p.color }} aria-hidden />
                  <span>
                    <span className="projects-tab__item-name">{p.name}</span>
                    <span className="projects-tab__item-client">{p.client}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Owner section ── */}
      <div className="projects-tab__section">
        <p className="projects-tab__section-label">Project owner of</p>
        {ownedProjects.length === 0 ? (
          <p className="projects-tab__empty">Not an owner of any projects.</p>
        ) : (
          <ul className="projects-tab__list">
            {ownedProjects.map((p) => (
              <li key={p.id} className="projects-tab__row">
                <span className="projects-tab__dot" style={{ background: p.color }} aria-hidden />
                <span className="projects-tab__row-text">
                  <span className="projects-tab__row-name">{p.name}</span>
                  <span className="projects-tab__row-client">{p.client}</span>
                </span>
                <button
                  type="button"
                  className="projects-tab__remove"
                  aria-label={`Remove ${p.name}`}
                  onClick={() => removeOwned(p.id)}
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Contributor section ── */}
      <div className="projects-tab__section">
        <p className="projects-tab__section-label">Project contributor</p>
        {contributorProjects.length === 0 ? (
          <p className="projects-tab__empty">Not a contributor on any projects.</p>
        ) : (
          <ul className="projects-tab__list">
            {contributorProjects.map((p) => (
              <li key={p.id} className="projects-tab__row">
                <span className="projects-tab__dot" style={{ background: p.color }} aria-hidden />
                <span className="projects-tab__row-text">
                  <span className="projects-tab__row-name">{p.name}</span>
                  <span className="projects-tab__row-client">{p.client}</span>
                </span>
                <button
                  type="button"
                  className="projects-tab__remove"
                  aria-label={`Remove ${p.name}`}
                  onClick={() => removeContributor(p.id)}
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function ManagesTab({
  person,
  allPeople,
  onDepartmentsChange,
  onPeopleChange,
}: {
  person: PeopleRow
  allPeople: PeopleRow[]
  onDepartmentsChange: (depts: string[]) => void
  onPeopleChange: (ids: string[]) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const availableDepts = GEN_DEPTS.filter((d) => !person.managedDepartments.includes(d))
  const availablePeople = allPeople.filter(
    (p) => p.id !== person.id && !person.managedPersonIds.includes(p.id),
  )

  const lowerQ = query.toLowerCase()
  const filteredDepts = availableDepts.filter((d) => d.toLowerCase().includes(lowerQ))
  const filteredPeople = availablePeople.filter((p) => p.name.toLowerCase().includes(lowerQ))
  const hasResults = filteredDepts.length > 0 || filteredPeople.length > 0

  function addDept(dept: string) {
    onDepartmentsChange([...person.managedDepartments, dept])
    setQuery('')
    setOpen(false)
  }

  function removeDept(dept: string) {
    onDepartmentsChange(person.managedDepartments.filter((d) => d !== dept))
  }

  function addPerson(id: string) {
    onPeopleChange([...person.managedPersonIds, id])
    setQuery('')
    setOpen(false)
  }

  function removePerson(id: string) {
    onPeopleChange(person.managedPersonIds.filter((x) => x !== id))
  }

  const managedPeople = person.managedPersonIds
    .map((id) => allPeople.find((p) => p.id === id))
    .filter(Boolean) as PeopleRow[]

  return (
    <div className="manages-tab">
      {/* ── Search field ── */}
      <div className="manages-tab__search-wrap">
        <div className="manages-tab__search-field">
          <input
            type="text"
            className="manages-tab__input"
            placeholder="Type and select departments and people"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            aria-label="Search departments and people"
          />
        </div>
        {open && query.length > 0 && (
          <div className="manages-tab__dropdown" role="listbox">
            {!hasResults && (
              <div className="manages-tab__dropdown-empty">No results for "{query}"</div>
            )}
            {filteredDepts.length > 0 && (
              <>
                <div className="manages-tab__dropdown-group-label">Departments</div>
                {filteredDepts.map((d) => (
                  <button
                    key={d}
                    type="button"
                    role="option"
                    aria-selected={false}
                    className="manages-tab__dropdown-item"
                    onMouseDown={() => addDept(d)}
                  >
                    <span className="manages-tab__dropdown-dept-icon" aria-hidden>⬡</span>
                    {d}
                  </button>
                ))}
              </>
            )}
            {filteredPeople.length > 0 && (
              <>
                <div className="manages-tab__dropdown-group-label">People</div>
                {filteredPeople.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="option"
                    aria-selected={false}
                    className="manages-tab__dropdown-item"
                    onMouseDown={() => addPerson(p.id)}
                  >
                    <span className="manages-tab__dropdown-avatar" aria-hidden>
                      {nameInitial(p.name)}
                    </span>
                    <span>
                      <span className="manages-tab__dropdown-name">{p.name}</span>
                      <span className="manages-tab__dropdown-role">{p.role}</span>
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Departments ── */}
      <div className="manages-tab__section">
        <p className="manages-tab__section-label">Departments</p>
        {person.managedDepartments.length === 0 ? (
          <p className="manages-tab__empty">No departments added yet.</p>
        ) : (
          <div className="manages-tab__dept-tags">
            {person.managedDepartments.map((d) => (
              <span key={d} className="manages-tab__dept-tag">
                {d}
                <button
                  type="button"
                  className="manages-tab__remove"
                  aria-label={`Remove ${d}`}
                  onClick={() => removeDept(d)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── People ── */}
      <div className="manages-tab__section">
        <p className="manages-tab__section-label">People</p>
        {managedPeople.length === 0 ? (
          <p className="manages-tab__empty">No people added yet.</p>
        ) : (
          <ul className="manages-tab__people-list">
            {managedPeople.map((p) => (
              <li key={p.id} className="manages-tab__person-row">
                <span className="manages-tab__person-avatar" aria-hidden>
                  {nameInitial(p.name)}
                </span>
                <span className="manages-tab__person-name">{p.name}</span>
                <button
                  type="button"
                  className="manages-tab__remove manages-tab__remove--person"
                  aria-label={`Remove ${p.name}`}
                  onClick={() => removePerson(p.id)}
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function nameInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?'
}

// ── Bulk edit ─────────────────────────────────────────────────────────────────

type BulkFieldId = 'department' | 'delivery-team' | 'office' | 'group' | 'access-role'

const BULK_FIELDS: { id: BulkFieldId; label: string }[] = [
  { id: 'department',    label: 'Department' },
  { id: 'delivery-team', label: 'Delivery team' },
  { id: 'office',        label: 'Office' },
  { id: 'group',         label: 'Group' },
  { id: 'access-role',   label: 'Access role' },
]

const BULK_FIELD_OPTIONS: Record<BulkFieldId, string[]> = {
  department:      GEN_DEPTS,
  'delivery-team': GEN_TEAMS,
  office:          GEN_OFFICES,
  group:           GEN_GROUPS,
  'access-role':   [...ACCESS_ROLE_IDS],
}

interface BulkEditValues {
  field?: BulkFieldId
  fieldValue?: string
  role?: string
  accessRoleId?: string
}

function BulkEditModal({
  count,
  onApply,
  onClose,
}: {
  count: number
  onApply: (values: BulkEditValues) => void
  onClose: () => void
}) {
  const [field, setField] = useState<BulkFieldId | ''>('')
  const [fieldValue, setFieldValue] = useState('')
  const [roleValue, setRoleValue] = useState('')

  const fieldOptions = field ? BULK_FIELD_OPTIONS[field] : []
  const canApply = (field !== '' && fieldValue !== '') || roleValue !== ''

  function handleFieldChange(f: BulkFieldId | '') {
    setField(f)
    setFieldValue('')
    setRoleValue('')
  }

  function handleApply() {
    if (!canApply) return
    const patch: BulkEditValues = {}
    if (field === 'access-role') {
      if (roleValue) patch.accessRoleId = roleValue
    } else {
      if (field && fieldValue) { patch.field = field; patch.fieldValue = fieldValue }
      if (roleValue) patch.role = roleValue
    }
    onApply(patch)
    onClose()
  }

  return (
    <div
      className="bulk-modal-backdrop"
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <div
        className="bulk-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bulk-modal__header">
          <h2 className="bulk-modal__title" id="bulk-modal-title">
            Edit {count} {count === 1 ? 'person' : 'people'}
          </h2>
          <button type="button" className="bulk-modal__close" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <div className="bulk-modal__body">

          {/* Field + conditional value */}
          <div className="bulk-modal__field-row">
            <label className="bulk-modal__label" htmlFor="bulk-field-select">Field</label>
            <select
              id="bulk-field-select"
              className="bulk-modal__select"
              value={field}
              onChange={(e) => handleFieldChange(e.target.value as BulkFieldId | '')}
            >
              <option value=""></option>
              {BULK_FIELDS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
            {field !== '' && field !== 'access-role' && (
              <select
                className="bulk-modal__select bulk-modal__select--value"
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                aria-label={`${BULK_FIELDS.find(f => f.id === field)?.label} value`}
              >
                <option value="">Select a value…</option>
                {fieldOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </div>

          {/* Role / Access role */}
          <div className="bulk-modal__field-row">
            <label className="bulk-modal__label" htmlFor="bulk-role-select">
              {field === 'access-role' ? 'Access role' : 'Role'}
            </label>
            <select
              id="bulk-role-select"
              className="bulk-modal__select"
              value={roleValue}
              onChange={(e) => setRoleValue(e.target.value)}
            >
              <option value=""></option>
              {field === 'access-role'
                ? ACCESS_ROLE_IDS.map((id) => (
                    <option key={id} value={id}>{accessRoleLabel(id)}</option>
                  ))
                : GEN_TITLES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))
              }
            </select>
          </div>

        </div>
        <div className="bulk-modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={!canApply}
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export function DataStudioPeoplePage({ rbacEnforced = false }: { rbacEnforced?: boolean }) {
  const [category, setCategory] = useState<CategoryId>('employees')
  const [statusFilter, setStatusFilter] = useState<StatusFilterId>('active')
  const [onlyWithAccess, setOnlyWithAccess] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [personPanelTab, setPersonPanelTab] = useState<PersonPanelTabId>('access')
  const [people, setPeople] = useState<PeopleRow[]>(SAMPLE_PEOPLE)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkModal, setShowBulkModal] = useState(false)

  const visiblePeople = onlyWithAccess
    ? people.filter((p) => p.accessRoleId !== 'member')
    : people

  const selectedPerson = selectedPersonId
    ? people.find((p) => p.id === selectedPersonId) ?? null
    : null

  function updatePersonRole(id: string, roleId: AccessRoleId) {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, accessRoleId: roleId } : p)))
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

  function updateOwnedProjects(id: string, ids: string[]) {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ownedProjectIds: ids } : p)))
  }

  function updateContributorProjects(id: string, ids: string[]) {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, contributorProjectIds: ids } : p)))
  }

  function updateManagedDepartments(id: string, depts: string[]) {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, managedDepartments: depts } : p)))
  }

  function updateManagedPersonIds(id: string, ids: string[]) {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, managedPersonIds: ids } : p)))
  }

  // ── Selection helpers ────────────────────────────────────────────────────
  const visibleIds = visiblePeople.map((p) => p.id)
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id))
  const someSelected = visibleIds.some((id) => selectedIds.has(id))

  function toggleRow(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(visibleIds))
    }
  }

  function applyBulkEdit(values: BulkEditValues) {
    setPeople((prev) =>
      prev.map((p) => {
        if (!selectedIds.has(p.id)) return p
        const next = { ...p }
        if (values.role)         next.role = values.role
        if (values.accessRoleId) next.accessRoleId = values.accessRoleId as AccessRoleId
        if (values.field && values.fieldValue) {
          switch (values.field) {
            case 'department':    next.department  = values.fieldValue; break
            case 'delivery-team': next.deliveryTeam = values.fieldValue; break
            case 'office':        next.office      = values.fieldValue; break
            case 'group':
              if (!next.groups.includes(values.fieldValue))
                next.groups = [...next.groups, values.fieldValue]
              break
          }
        }
        return next
      })
    )
    setSelectedIds(new Set())
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

      {/* ── Top header bar ─────────────────────────────────────────────── */}
      <div className="dh-people__topbar">
        <div className="dh-people__topbar-left">
          <h1 className="dh-people__title">People</h1>
          <button type="button" className="dh-people__hdr-icon-btn dh-people__views-btn" aria-label="Views">
            <IconViews size={16} />
          </button>
          <button type="button" className="dh-people__hdr-icon-btn dh-people__filter-trigger">
            <IconSearchFilter size={16} />
            Filter
            <ChevronDown size={12} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        <div className="dh-people__topbar-right">
          <button type="button" className="dh-people__hdr-icon-btn" aria-label="Column settings">
            <SlidersHorizontal size={15} strokeWidth={1.75} aria-hidden />
          </button>
          <button type="button" className="dh-people__import-btn">
            <Download size={14} strokeWidth={1.75} aria-hidden />
            Import
          </button>
          <button type="button" className="dh-people__hdr-icon-btn" aria-label="Open in new tab">
            <ExternalLink size={15} strokeWidth={1.75} aria-hidden />
          </button>
          <button type="button" className="dh-people__add-btn" aria-label="Add person">
            <Plus size={16} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>

      {/* ── Office selector + category tabs ───────────────────────────────── */}
      <div className="dh-people__catbar">
        <button type="button" className="dh-people__office-btn">
          All offices
          <ChevronDown size={13} strokeWidth={1.75} aria-hidden />
        </button>
        <div className="dh-people__cattabs" role="tablist" aria-label="People categories">
          {CATEGORY_TABS.map((tab) => {
            const isActive = category === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`dh-people__cattab${isActive ? ' dh-people__cattab--active' : ''}`}
                onClick={() => setCategory(tab.id)}
              >
                {isActive && <span className="dh-people__cattab-dot" aria-hidden>•</span>}
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Status tabs + access filter ────────────────────────────────── */}
      <div className="dh-people__statusbar">
        <div className="dh-people__status-tabs" role="group" aria-label="Status">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`dh-people__status-tab${statusFilter === s.id ? ' dh-people__status-tab--active' : ''}`}
              onClick={() => setStatusFilter(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <label className="dh-people__access-check">
          <input
            type="checkbox"
            checked={onlyWithAccess}
            onChange={(e) => setOnlyWithAccess(e.target.checked)}
          />
          Only show people with access rights
        </label>
      </div>



      {/* ── Bulk action bar ─────────────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="dh-people__bulk-bar">
          <span className="dh-people__bulk-count">{selectedIds.size} selected</span>
          <button
            type="button"
            className="btn btn--primary dh-people__bulk-btn"
            onClick={() => setShowBulkModal(true)}
          >
            <Pencil size={13} strokeWidth={2} aria-hidden />
            Edit
          </button>
          <button
            type="button"
            className="btn btn--primary dh-people__bulk-btn"
            onClick={() => {/* Assign to project */}}
          >
            <UserPlus size={14} strokeWidth={1.75} aria-hidden />
            Assign to project
          </button>
          <button
            type="button"
            className="btn btn--primary dh-people__bulk-btn"
            onClick={() => {/* Archive */}}
          >
            <Archive size={14} strokeWidth={1.75} aria-hidden />
            Archive
          </button>
          <button
            type="button"
            className="dh-people__bulk-clear"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </button>
        </div>
      )}

      <div className="dh-people__table-wrap">
        <table className="dh-people__table">
          <thead>
            <tr>
              <th className="dh-people__th dh-people__th--check" scope="col">
                <input
                  type="checkbox"
                  className="dh-people__checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected }}
                  onChange={toggleAll}
                />
              </th>
              <th className="dh-people__th" scope="col">Name</th>
              <th className="dh-people__th" scope="col">
                <button type="button" className="dh-people__th-btn">
                  Role <ChevronDown size={14} strokeWidth={1.5} aria-hidden />
                </button>
              </th>
              <th className="dh-people__th" scope="col">Access</th>
              <th className="dh-people__th" scope="col">
                <button type="button" className="dh-people__th-btn">
                  Department <ChevronDown size={14} strokeWidth={1.5} aria-hidden />
                </button>
              </th>
              <th className="dh-people__th" scope="col">
                <button type="button" className="dh-people__th-btn">
                  Delivery Team <ChevronDown size={14} strokeWidth={1.5} aria-hidden />
                </button>
              </th>
              <th className="dh-people__th" scope="col">Group</th>
              <th className="dh-people__th" scope="col">Office</th>
            </tr>
          </thead>
          <tbody>
            {visiblePeople.map((row) => {
              const isChecked = selectedIds.has(row.id)
              return (
              <tr
                key={row.id}
                className={`dh-people__row${selectedPersonId === row.id ? ' dh-people__row--selected' : ''}${isChecked ? ' dh-people__row--checked' : ''}`}
                onClick={() => openPerson(row.id)}
              >
                <td className="dh-people__td dh-people__td--check">
                  <input
                    type="checkbox"
                    className="dh-people__checkbox"
                    aria-label={`Select ${row.name}`}
                    checked={isChecked}
                    onChange={() => {}}
                    onClick={(e) => toggleRow(row.id, e)}
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
            )})}
          </tbody>
        </table>
      </div>
    </div>

    {selectedPerson && (
      <div
        className="person-panel__backdrop"
        role="presentation"
        onClick={closePersonPanel}
        onKeyDown={(e) => { if (e.key === 'Escape') closePersonPanel() }}
      >
        <aside
          className="person-panel"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedPerson.name} profile`}
          id="person-side-panel"
          onClick={(e) => e.stopPropagation()}
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
                  ) : (() => {
                    const roleEnabledIds = new Set(
                      (ROLES.find((r) => r.id === selectedPerson.accessRoleId)?.configPerms ?? [])
                        .filter((p) => p.enabled)
                        .map((p) => p.id),
                    )
                    const availablePerms = AVAILABLE_ADDITIONAL_PERMISSIONS.filter(
                      (p) => !roleEnabledIds.has(p.id),
                    )
                    if (availablePerms.length === 0) {
                      return (
                        <p className="person-panel__muted">
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
                  })()}
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
              <ProjectsTab
                person={selectedPerson}
                allProjects={SAMPLE_PROJECTS}
                onOwnedChange={(ids) => updateOwnedProjects(selectedPerson.id, ids)}
                onContributorChange={(ids) => updateContributorProjects(selectedPerson.id, ids)}
              />
            )}

            {personPanelTab === 'manages' && (
              <ManagesTab
                person={selectedPerson}
                allPeople={people}
                onDepartmentsChange={(depts) => updateManagedDepartments(selectedPerson.id, depts)}
                onPeopleChange={(ids) => updateManagedPersonIds(selectedPerson.id, ids)}
              />
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
      </div>
    )}

    {showBulkModal && (
      <BulkEditModal
        count={selectedIds.size}
        onApply={applyBulkEdit}
        onClose={() => setShowBulkModal(false)}
      />
    )}
    </>
  )
}
