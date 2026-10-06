import Http from '../network/Http'

export async function postRedeems(giftCode?: string) {
  const res = await Http.request<PostRedeemsResponse>({
    url: '/redeems/',
    method: 'POST',
    data: { giftCode },
  })
  return res
}
