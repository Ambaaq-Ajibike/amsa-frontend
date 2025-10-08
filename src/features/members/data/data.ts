import {
  IconShield,
  IconSocial,
  IconUsersGroup,
  IconUserShield,
} from '@tabler/icons-react'
import { UserStatus } from './schema'

export const callTypes = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
  ['invited', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  [
    'suspended',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const userTypes = [
  {
    label: 'President',
    value: 'president',
    icon: IconShield,
  },
  {
    label: 'Tajneed',
    value: 'tajneed',
    icon: IconUserShield,
  },
  {
    label: 'Gensec',
    value: 'gensec',
    icon: IconUsersGroup,
  },
  {
    label: 'Pro',
    value: 'pro',
    icon: IconSocial,
  },
] as const
