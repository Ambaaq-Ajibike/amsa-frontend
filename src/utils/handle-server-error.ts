import { AxiosError } from 'axios'
import { handleApiError, showErrorToast } from './error-handler'

export function handleServerError(error: unknown) {
  // eslint-disable-next-line no-console
  console.log(error)

  if (error instanceof AxiosError) {
    showErrorToast(error)
    return handleApiError(error).message
  }

  // Handle non-Axios errors
  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    showErrorToast({ message: 'Content not found.' })
    return 'Content not found.'
  }

  showErrorToast({ message: 'Something went wrong!' })
  return 'Something went wrong!'
}
