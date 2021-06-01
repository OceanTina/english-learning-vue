import request from '@/utils/request'

// 查询岗位列表
export function listPost(query) {
  return request({
    url: '/education/english/list',
    method: 'get',
    params: query
  })
}



// 导出岗位
export function getGroupWordByGrouIdClassId(query) {
  return request({
    url: '/education/english/getGroupWordByGrouIdClassId',
    method: 'get',
    params: query
  })
}

export function getWordClassAllList() {
  return request({
    url: '/education/english/getWordClassAllList',
    method: 'get'
  })
}