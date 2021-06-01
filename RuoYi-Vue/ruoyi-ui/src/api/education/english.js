import request from '@/utils/request'

// 查询岗位列表
export function listPost(query) {
  return request({
    url: '/education/english/list',
    method: 'get',
    params: query
  })
}

// 查询岗位详细
export function getPost(postId) {
  return request({
    url: '/system/post/' + postId,
    method: 'get'
  })
}

// 新增Word
export function addWord(data) {
  return request({
    url: '/education/english/addWord',
    method: 'post',
    data: data
  })
}

//获得WordList
export function getWordClassAllList() {
  return request({
    url: '/education/english/getWordClassAllList',
    method: 'get'
  })
}

//修改Word
export function updateWordByWordId(data) {
  return request({
    url: '/education/english/updateWordByWordId',
    method: 'post',
    data: data
  })
}

// 删除岗位
export function deleteEnglishWordById(data) {
  return request({
    url: '/education/english/deleteEnglishWordById',
    method: 'post',
    params: data
  })
}

// 导出岗位
export function exportPost(query) {
  return request({
    url: '/system/post/export',
    method: 'get',
    params: query
  })
}