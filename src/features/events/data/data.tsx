import {
  IconArrowDown,
  IconArrowRight,
  IconArrowUp,
  IconCircleCheck,
  IconExclamationCircle,
  IconStopwatch,
} from '@tabler/icons-react'

export const labels = [
  {
    value: 'bug',
    label: 'Bug',
  },
  {
    value: 'feature',
    label: 'Feature',
  },
  {
    value: 'documentation',
    label: 'Documentation',
  },
]

export const statuses = [
  {
    value: 'upcoming',
    label: 'upcoming',
    icon: IconExclamationCircle,
  },
  {
    value: 'ongoing',
    label: 'ongoing',
    icon: IconStopwatch,
  },
  {
    value: 'completed',
    label: 'completed',
    icon: IconCircleCheck,
  },
  // {
  //   value: 'canceled',
  //   label: 'Canceled',
  //   icon: IconCircleX,
  // },
]

export const priorities = [
  {
    label: 'Low',
    value: 'low',
    icon: IconArrowDown,
  },
  {
    label: 'Medium',
    value: 'medium',
    icon: IconArrowRight,
  },
  {
    label: 'High',
    value: 'high',
    icon: IconArrowUp,
  },
]
