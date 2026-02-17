/**
 * Export utility functions for downloading files from the backend
 */

/**
 * Download file from backend endpoint
 * @param endpoint - Backend endpoint that returns a file stream
 * @param filename - Name of the file to save as
 * @param queryParams - Optional query parameters
 */
export async function downloadFileFromEndpoint(
  endpoint: string,
  filename: string,
  queryParams?: Record<string, string | number | boolean>
) {
  try {
    // Build query string
    const searchParams = new URLSearchParams()
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
    }

    const queryString = searchParams.toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint

    const token = localStorage.getItem('accessToken')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json') || contentType.includes('text/html')) {
      const errorText = await response.text()
      throw new Error(errorText || 'Unexpected response from server')
    }

    const contentDisposition = response.headers.get('content-disposition') || ''
    const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition)
    const serverFilename = decodeURIComponent(match?.[1] || match?.[2] || '')

    const inferredExtension = contentType.includes('spreadsheetml')
      ? 'xlsx'
      : contentType.includes('application/vnd.ms-excel')
        ? 'xls'
        : contentType.includes('text/csv')
          ? 'csv'
          : ''

    const finalFilename = serverFilename || (inferredExtension
      ? filename.replace(/\.[^.]+$/, `.${inferredExtension}`)
      : filename)

    // Get the blob from response
    const blob = await response.blob()

    // Create a temporary URL for the blob
    const blobUrl = window.URL.createObjectURL(blob)

    // Create a temporary anchor element and trigger download
    const anchor = document.createElement('a')
    anchor.href = blobUrl
    anchor.download = finalFilename
    document.body.appendChild(anchor)
    anchor.click()

    // Clean up
    document.body.removeChild(anchor)
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error downloading file:', error)
    throw error
  }
}

/**
 * Mock export function for development
 * Converts table data to CSV and triggers download
 */
export function exportTableAsCSV(
  data: unknown[],
  columns: string[],
  filename: string
) {
  try {
    if (data.length === 0) {
      throw new Error('No data to export')
    }

    // Create CSV header
    const header = columns.join(',')

    // Create CSV rows
    const rows = data.map((item) =>
      columns
        .map((col) => {
          const value = (item as Record<string, unknown>)[col] ?? ''
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(value).replace(/"/g, '""')
          return escaped.includes(',') ? `"${escaped}"` : escaped
        })
        .join(',')
    )

    // Combine header and rows
    const csv = [header, ...rows].join('\n')

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv' })
    const blobUrl = window.URL.createObjectURL(blob)

    const anchor = document.createElement('a')
    anchor.href = blobUrl
    anchor.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(anchor)
    anchor.click()

    document.body.removeChild(anchor)
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error exporting CSV:', error)
    throw error
  }
}

/**
 * Mock export function for Excel using XLSX library (if available)
 * Falls back to CSV if xlsx is not available
 */
export function exportTableAsExcel(
  data: unknown[],
  columns: string[],
  filename: string
) {
  try {
    // Check if xlsx is available
    const xlsx = (window as unknown as Record<string, unknown>).XLSX

    if (xlsx) {
      // Use XLSX library if available
      const worksheet = (xlsx as { utils: { json_to_sheet: (data: unknown[]) => unknown; book_new: () => unknown; book_append_sheet: (workbook: unknown, worksheet: unknown, name: string) => void; writeFile: (workbook: unknown, filename: string) => void } }).utils.json_to_sheet(
        data.map((item) =>
          columns.reduce((acc: Record<string, unknown>, col) => {
            acc[col] = (item as Record<string, unknown>)[col] ?? ''
            return acc
          }, {})
        )
      )
      const workbook = (xlsx as { utils: { json_to_sheet: (data: unknown[]) => unknown; book_new: () => unknown; book_append_sheet: (workbook: unknown, worksheet: unknown, name: string) => void; writeFile: (workbook: unknown, filename: string) => void } }).utils.book_new()
      ;(xlsx as { utils: { json_to_sheet: (data: unknown[]) => unknown; book_new: () => unknown; book_append_sheet: (workbook: unknown, worksheet: unknown, name: string) => void; writeFile: (workbook: unknown, filename: string) => void } }).utils.book_append_sheet(workbook, worksheet, 'Data')
      ;(xlsx as { utils: { json_to_sheet: (data: unknown[]) => unknown; book_new: () => unknown; book_append_sheet: (workbook: unknown, worksheet: unknown, name: string) => void; writeFile: (workbook: unknown, filename: string) => void } }).utils.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`)
    } else {
      // Fall back to CSV
      exportTableAsCSV(data, columns, filename)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error exporting Excel:', error)
    throw error
  }
}
