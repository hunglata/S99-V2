import { setAccessToken, setRefreshToken } from '../data/GameDataManager'

export function setToken(token, refreshToken = null) {
  setAccessToken(token)
  setRefreshToken(refreshToken)
  Http.Authorization = `Bearer ${token}`
  Http.refreshToken = refreshToken
}

export function clearToken() {
  setAccessToken('')
  setRefreshToken('')
  // GameState.profile = null;
  Http.Authorization = undefined
  Http.refreshToken = undefined
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!Http.refreshToken) return null
  const response = await fetch(`${Http.baseURL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: Http.refreshToken }),
  })
  if (!response.ok) return null

  try {
    const data = await response.json()
    if (!data.token) return null

    setToken(data.token, Http.refreshToken)
    return data.token
  } catch {
    return null
  }
}

export default class Http {
  static baseURL = import.meta.env.VITE_API_URL
  static Authorization: string
  static refreshToken: string

  static async request<T>({ url, method, data }: { url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: object }): Promise<T> {
    try {
      return await Http._request<T>({ url, method, data })
    } catch (err) {
      // If unauthorized, try to refresh token and retry once
      if (err === 401 && Http.refreshToken) {
        const newToken = await refreshAccessToken()
        // console.log('refreshAccessToken', newToken)
        if (newToken) {
          return await Http._request<T>({ url, method, data })
        }
      }
      throw err
    }
  }

  private static async _request<T>({ url, method, data }: { url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: object }): Promise<T> {
    const headers: Record<string, string> = {}
    if (data) headers['Content-Type'] = 'application/json'
    if (Http.Authorization) headers.Authorization = Http.Authorization

    const requestUrl = Http.baseURL + url
    const startedAt = Date.now()
    console.log('[Http] fetch:start', method, requestUrl)
    const response = await fetch(requestUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })
    console.log('[Http] fetch:response', method, requestUrl, response.status, `${Date.now() - startedAt}ms`)
    if (!response.ok) throw response.status

    console.log('[Http] response.text:start', method, requestUrl)
    const text = await response.text()
    console.log('[Http] response.text:done', method, requestUrl, `${Date.now() - startedAt}ms`)
    try {
      return JSON.parse(text) as T
    } catch {
      return text as T
    }
  }
}
