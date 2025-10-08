import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  theme: z.string(),
  date: z.date({
    required_error: 'Event date of  is required.',
  }),
  status: z.string(),
})

export type Event = z.infer<typeof eventSchema>
