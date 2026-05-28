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
import { ROLES, GROUP_ORDER, ReadOnlyPermGroup } from './App'

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
  if (roleId === 'people-manager' || roleId === 'resource-planner') return 'departments'
  if (roleId === 'member') return 'self'
  return 'everyone'
}

/** Return the sensible default edit scope for a given access role. */
function defaultPeopleScopeEdit(roleId: AccessRoleId): PeopleScope {
  if (roleId === 'project-manager') return 'project-teams'
  if (roleId === 'people-manager' || roleId === 'resource-planner') return 'departments'
  if (roleId === 'member') return 'self'
  return 'everyone'
}

export type ProjectAccessLevel = 'all' | 'assigned' | 'none'

const PROJECT_ACCESS_OPTIONS: { id: ProjectAccessLevel; label: string; description: string }[] = [
  { id: 'all',      label: 'All projects',       description: 'Can see and be scheduled on every project in the account.' },
  { id: 'assigned', label: 'Assigned projects',  description: 'Can only see projects where they are an owner or member of the project team.' },
  { id: 'none',     label: 'None',               description: 'Cannot access any projects.' },
]

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
  /** Top-level project access level for this person. */
  projectAccess: ProjectAccessLevel
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
      peopleScopeEdit: defaultPeopleScopeEdit(roleId),
      projectAccess: (roleId === 'account-owner' || roleId === 'admin') ? 'all' : roleId === 'member' ? 'assigned' : 'all',
      additionalPermissions: [],
    }
  })
}

export const SAMPLE_PEOPLE: PeopleRow[] = generatePeople(243)

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

// ── Bulk edit ─────────────────────────────────────────────────────────────────

type BulkFieldId = 'department' | 'delivery-team' | 'office' | 'group'

const BULK_FIELDS: { id: BulkFieldId; label: string }[] = [
  { id: 'department',    label: 'Department' },
  { id: 'delivery-team', label: 'Delivery team' },
  { id: 'office',        label: 'Office' },
  { id: 'group',         label: 'Group' },
]

const BULK_FIELD_OPTIONS: Record<BulkFieldId, string[]> = {
  department:      GEN_DEPTS,
  'delivery-team': GEN_TEAMS,
  office:          GEN_OFFICES,
  group:           GEN_GROUPS,
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
  const [accessValue, setAccessValue] = useState('')

  const fieldOptions = field ? BULK_FIELD_OPTIONS[field] : []
  const canApply = (field !== '' && fieldValue !== '') || roleValue !== '' || accessValue !== ''

  function handleFieldChange(f: BulkFieldId | '') {
    setField(f)
    setFieldValue('')
  }

  function handleApply() {
    if (!canApply) return
    const patch: BulkEditValues = {}
    if (field && fieldValue) { patch.field = field; patch.fieldValue = fieldValue }
    if (roleValue)   patch.role = roleValue
    if (accessValue) patch.accessRoleId = accessValue
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
            {field !== '' && (
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

          {/* Role */}
          <div className="bulk-modal__field-row">
            <label className="bulk-modal__label" htmlFor="bulk-role-select">Role</label>
            <select
              id="bulk-role-select"
              className="bulk-modal__select"
              value={roleValue}
              onChange={(e) => setRoleValue(e.target.value)}
            >
              <option value=""></option>
              {GEN_TITLES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Access role */}
          <div className="bulk-modal__field-row">
            <label className="bulk-modal__label" htmlFor="bulk-access-select">Access role</label>
            <select
              id="bulk-access-select"
              className="bulk-modal__select"
              value={accessValue}
              onChange={(e) => setAccessValue(e.target.value)}
            >
              <option value=""></option>
              {ACCESS_ROLE_IDS.map((id) => (
                <option key={id} value={id}>{accessRoleLabel(id)}</option>
              ))}
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

  function updatePeopleScope(id: string, scope: PeopleScope) {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, peopleScope: scope } : p)))
  }

  function updatePeopleScopeEdit(id: string, scope: PeopleScope) {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, peopleScopeEdit: scope } : p)))
  }

  function updateProjectAccess(id: string, level: ProjectAccessLevel) {
    setPeople((prev) => prev.map((p) => p.id === id ? { ...p, projectAccess: level } : p))
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
                  </p>
                  <div className="proj-access-opts" role="group" aria-labelledby="project-access-heading">
                    {PROJECT_ACCESS_OPTIONS.map((opt) => {
                      const isActive = selectedPerson.projectAccess === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          className={`proj-access-opt${isActive ? ' proj-access-opt--active' : ''}`}
                          aria-pressed={isActive}
                          onClick={() => updateProjectAccess(selectedPerson.id, opt.id)}
                        >
                          <span className="proj-access-opt__label">{opt.label}</span>
                          <span className="proj-access-opt__desc">{opt.description}</span>
                        </button>
                      )
                    })}
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
