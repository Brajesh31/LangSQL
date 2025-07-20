export class APIError extends Error {
  constructor(message, status, code) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.code = code
  }
}

export const handleAPIError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response
    throw new APIError(
      data.message || 'An error occurred',
      status,
      data.code
    )
  } else if (error.request) {
    // The request was made but no response was received
    throw new APIError('No response from server', 0, 'NETWORK_ERROR')
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new APIError(error.message, 0, 'REQUEST_ERROR')
  }
}

export const getErrorMessage = (error) => {
  if (error instanceof APIError) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export const isNetworkError = (error) => {
  return error instanceof APIError && error.code === 'NETWORK_ERROR'
}

export const isAuthError = (error) => {
  return error instanceof APIError && error.status === 401
}

export const isValidationError = (error) => {
  return error instanceof APIError && error.status === 422
}

export const isServerError = (error) => {
  return error instanceof APIError && error.status >= 500
} 