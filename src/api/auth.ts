import Http from '../network/Http'

export async function getAuthLogOut() {
  const res = await Http.request<GetAuthLogOutResponse>({
    url: '/auth/log-out',
    method: 'GET',
  })
  return res
}

export async function postAuthRefreshToken(refreshToken: string) {
  const res = await Http.request<PostAuthRefreshTokenResponse>({
    url: '/auth/refresh-token',
    method: 'POST',
    data: { refreshToken },
  })
  return res
}

export async function postAuthLoginCrazyGame(accessToken?: string) {
  const res = await Http.request<PostAuthLoginCrazyGameResponse>({
    url: '/auth/login-crazy-game',
    method: 'POST',
    data: { accessToken },
  })
  return res
}

export async function postAuthLoginGoogle(serverAuthCode: string) {
  const res = await Http.request<PostAuthLoginGoogleResponse>({
    url: '/auth/login-google',
    method: 'POST',
    data: { serverAuthCode },
  })
  return res
}

export async function postAuthLoginGuest(guestId?: string) {
  const res = await Http.request<PostAuthLoginGuestResponse>({
    url: '/auth/login-guest',
    method: 'POST',
    data: { guestId },
  })
  return res
}
