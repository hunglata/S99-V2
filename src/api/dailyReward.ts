import Http from '../network/Http'

export async function getDailyRewards() {
  const res = await Http.request<GetDailyRewardsResponse>({
    url: '/dailyRewards/',
    method: 'GET',
  })
  return res
}

export async function postDailyRewardsClaim(doubled?: boolean) {
  const res = await Http.request<PostDailyRewardsClaimResponse>({
    url: '/dailyRewards/claim',
    method: 'POST',
    data: { doubled },
  })
  return res
}
