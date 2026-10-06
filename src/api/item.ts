import Http from '../network/Http'

export async function getItems() {
  const res = await Http.request<GetItemsResponse>({
    url: '/items/',
    method: 'GET',
  })
  return res
}

export async function getItemsBought() {
  const res = await Http.request<GetItemsBoughtResponse>({
    url: '/items/bought',
    method: 'GET',
  })
  return res
}

export async function getItemById(id: number) {
  const res = await Http.request<GetItemByIdResponse>({
    url: `/items/${id}`,
    method: 'GET',
  })
  return res
}

export async function postItemById(id: number) {
  const res = await Http.request<PostItemByIdResponse>({
    url: `/items/${id}`,
    method: 'POST',
  })
  return res
}

export async function postItemByIdEquip(id: number) {
  const res = await Http.request<PostItemByIdEquipResponse>({
    url: `/items/${id}/equip`,
    method: 'POST',
  })
  return res
}
