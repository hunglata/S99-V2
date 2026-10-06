import Http from '../network/Http'

export async function postLuckySpinsClaim() {
  const res = await Http.request<PostLuckySpinsClaimResponse>({
    url: '/luckySpins/claim',
    method: 'POST',
  })
  return res
}
