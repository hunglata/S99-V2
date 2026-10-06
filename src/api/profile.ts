import Http from '../network/Http'

export async function getProfiles() {
  const res = await Http.request<GetProfilesResponse>({
    url: '/profiles/',
    method: 'GET',
  })
  return res
}

export async function getProfileById(id: string) {
  const res = await Http.request<GetProfileByIdResponse>({
    url: `/profiles/${id}`,
    method: 'GET',
  })
  return res
}
