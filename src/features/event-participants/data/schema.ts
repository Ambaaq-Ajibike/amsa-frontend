import { z } from 'zod'

const participantSchema = z.object({
  userId: z.string(),
  memberNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  unit: z.string(),
  isPresent: z.boolean().optional().default(false),
})
export type Participants = z.infer<typeof participantSchema>

export const participantsListSchema = z.array(participantSchema)
