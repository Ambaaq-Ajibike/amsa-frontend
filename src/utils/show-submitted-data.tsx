import { toast } from 'sonner'

export function showSubmittedData(
  title: string = 'You submitted the following values:'
) {
  toast.message(title);
}
