/**
 * Canonical access role ids and labels — single source of truth for
 * Settings → Access rights and Data studio → People (access role).
 */
export type AccessRoleId =
  | 'admin'
  | 'project-manager'
  | 'resource-planner'
  | 'member'

export const ACCESS_ROLE_LABELS: Record<AccessRoleId, string> = {
  admin: 'Admin',
  'project-manager': 'Project manager',
  'resource-planner': 'Resource planner',
  member: 'Member',
}

export function accessRoleLabel(id: AccessRoleId): string {
  return ACCESS_ROLE_LABELS[id]
}

/** Ordered list — same order as Settings → Access rights cards. */
export const ACCESS_ROLE_IDS: AccessRoleId[] = [
  'admin',
  'project-manager',
  'resource-planner',
  'member',
]
