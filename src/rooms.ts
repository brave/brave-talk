import { loadLocalJwtStore } from './jwt-store'

// the subscriptions service is forwarded by CloudFront onto talk.brave* so we're not
// making a cross domain call - see https://github.com/brave/devops/issues/5445.
const SUBSCRIPTIONS_ROOT_URL = '/api'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
interface RoomRequestBody {
  // is this the first case of this user making a request this month,
  // i.e. it's a new monthly active user
  mauP?: boolean

  // some requests expect a jwt
  jwt?: string
}

interface RoomResponse {
  jwt: string
  refresh?: string
}

interface RoomsRequestParams {
  roomName: string
  urlSuffix?: string
  method: RequestMethod
  body: RoomRequestBody
  successCodes: number[]
  failureMessages: { [status: number]: string }
}

const GENERIC_ERROR_MESSAGE =
  'Oops! We were unable to connect to your meeting room. Please try again.'
const FETCH_TIMEOUT_MS = 5_000

const roomsRequest = async ({
  roomName,
  urlSuffix = '',
  method,
  body,
  successCodes,
  failureMessages
}: RoomsRequestParams): Promise<RoomResponse> => {
  const optionsUrl = `${SUBSCRIPTIONS_ROOT_URL}/v1/rooms/${encodeURIComponent(
    roomName
  )}`
  const url = `${optionsUrl}${urlSuffix}`
  try {
    console.log(`>>> OPTIONS ${optionsUrl}`)
    const optionsResponse = await fetchWithTimeout(optionsUrl, {
      method: 'OPTIONS',
      credentials: 'include'
    })

    console.log(`<<< OPTIONS ${optionsUrl} ${optionsResponse.status}`)

    const csrfToken = optionsResponse.headers.get('x-csrf-token')
    if (csrfToken === null || csrfToken === '') {
      console.warn(
        'OPTIONS request failed to return x-csrf-token, which is likely due to incorrectly configured CORS policy'
      )
      throw new Error(GENERIC_ERROR_MESSAGE)
    }

    const reqParams: RequestInit = {
      method,
      headers: {
        'x-csrf-token': csrfToken,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body)
    }

    console.log(`>>> ${method} ${url}`)
    const response = await fetchWithTimeout(url, reqParams)
    const { status } = response
    console.log(`<<< ${method} ${url} ${status}`)

    if (!successCodes.includes(status)) {
      let message
      if (failureMessages[status] === null || failureMessages[status] === '') {
        message = `Request failed: ${status} ${response.statusText}`
      } else {
        message = failureMessages[status]
      }

      console.warn(`^^^ body: ${await response.text()}`)
      throw new Error(message)
    }

    const resBody = await response.json()

    /* eslint-disable @typescript-eslint/strict-boolean-expressions */
    if (!resBody.jwt) {
    /* eslint-enable @typescript-eslint/strict-boolean-expressions */
      console.warn('response does not include jwt eleement!')
      throw new Error('Request failed: internal error(1)')
    }

    return resBody
  } catch (e: any) {
    if (e.message === 'Failed to fetch') {
      console.warn(
        'fetch threw an error, which is likely due to incorrectly configured CORS policy'
      )
      throw new Error(GENERIC_ERROR_MESSAGE)
    }

    if (e.name === 'AbortError') {
      throw new Error('Timeout: please try again later')
    }

    throw e
  }
}

// HT: https://dmitripavlutin.com/timeout-fetch-request/
async function fetchWithTimeout (
  input: RequestInfo,
  init: RequestInit
): Promise<Response> {
  const controller = new AbortController()

  const id = window.setTimeout(() => {
    controller.abort()
  }, FETCH_TIMEOUT_MS)

  const response = await fetch(input, {
    ...init,
    signal: controller.signal
  })

  clearTimeout(id)

  return response
}

const attemptTokenRefresh = async (
  roomName: string,
  refreshToken: string
): Promise<RoomResponse | undefined> => {
  try {
    const response = await roomsRequest({
      roomName,
      urlSuffix: '/moderator',
      method: 'PUT',
      body: { jwt: refreshToken },
      successCodes: [201],
      failureMessages: {}
    })
    return response
  } catch (e) {
    console.warn('failed to refresh jwt: ', e)
    // but just ignore the error as we can get a new jwt as we always used to
  }

  return undefined
}

interface FetchJWTResult {
  url?: string
  jwt: string
}

export const fetchJWT = async (
  roomName: string,
  createP: boolean,
  reportProgress: (message: string) => void
): Promise<FetchJWTResult> => {
  const store = loadLocalJwtStore()

  const jwt = store.findJwtForRoom(roomName)
  if (jwt !== undefined && jwt !== '') {
    console.log('found local jwt: ', jwt)
    return { jwt }
  }

  const refreshToken = store.findRefreshTokenForRoom(roomName)
  if (refreshToken !== undefined && refreshToken !== '') {
    reportProgress('Checking moderator status...')
    console.log('attempting refresh: ', refreshToken)
    const response = await attemptTokenRefresh(roomName, refreshToken)
    if (response != null) {
      store.storeJwtForRoom(roomName, response.jwt, response.refresh)
      return { jwt: response.jwt }
    }
  }

  const body: RoomRequestBody = {
    mauP: store.isNewMonthlyActiveUser() && true
  }

  let method: RequestMethod, success: number

  if (createP) {
    reportProgress('Creating meeting room...')
    method = 'POST'
    success = 201
  } else {
    reportProgress('Locating meeting room...')
    method = 'PUT'
    success = 200
  }

  if (createP) {
    // need to ensure the subscriber credentials are presented
    const subs = await import('./subscriptions')
    await subs.setTemporaryCredentialCookie()
  }

  const response = await roomsRequest({
    roomName,
    method,
    body,
    successCodes: [success],
    failureMessages: {
      400: createP
        ? "Sorry, you are not a subscriber"
        : "Sorry, the call is already full",
      403: "Forbidden",
      404: "The room does not exist",
      405: "Method not allowed",
      408: "Request timeout",
      409: "Sorry, call already exists! (this should not happen)",
      417: "Expectation failed",
      420: "Method failure",
      429: "Too many requests",
      500: "Internal server error",
      502: "Bad gateway",
      503: "Service unavailable",
      504: "Gateway timeout",
    },
  });

  store.storeJwtForRoom(roomName, response.jwt, response.refresh)

  return {
    jwt: response.jwt,
    url: '//' + window.location.host + '/' + roomName
  }
}
