# ProTable 重封装组件说明

## 封装说明

> 基础的使用方式与 API 与 [官方版(Table)](https://3x.ant.design/components/table-cn/) 基本一致，在其基础上，封装了加载数据的方法。
>
> 你无需在你是用表格的页面进行分页逻辑处理，仅需向 ProTable 组件传递绑定 `data={Promise}` 对象即可。

该 `ProTable` 由 [@Neo](https://github.com/Matrix-The-One) 完成封装。

## 例子

```jsx
import React, { useState } from 'react'
import { Button } from 'antd'
import { userList } from '@/api/user'
import { ProTable } from '@/components'

export default function Demo() {
  // ProTable
  const [pTable, setPTable] = useState({})

  // 请求参数
  const [queryParams, setQueryParams] = useState({
    name: '',
    mobile: '',
  })

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
    },
    {
      title: '更新时间',
      dataIndex: 'modifyTime',
      key: 'modifyTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (text, row) => (
        <span>
          <a>编辑</a>
          <Divider type='vertical' />
          <Popconfirm
            placement='topRight'
            title='该操作将永久删除此用户, 是否继续?'
            onConfirm={_ => deleteUser(row)}
            okText='确认'
            cancelText='取消'
          >
            <a>删除</a>
          </Popconfirm>
        </span>
      ),
    },
  ]

  return (
    <ProTable
      columns={columns}
      data={parameter => {
        return userList({ ...parameter, ...queryParams }).then(
          ({ code, data }) => {
            if (code === 200) return data
          }
        )
      }}
      callback={res => setPTable(res)}
      title={<Button type='primary'>新增用户</Button>}
    />
  )
}
```

## 内置方法

通过 `callback` 获取 `{ page, list, setList, refresh, refreshFirst }`（页面状态、列表数据、设置列表数据方法、刷新列表方法、刷新至第一页方法）。

## 内置属性

| 属性          | 说明                                          | 类型                                                                                                                                   | 是否必传 | 默认值 |
| ------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ |
| current       | 当前页数                                      | Number                                                                                                                                 | false    | 1      |
| size          | 每页条数                                      | Number                                                                                                                                 | false    | 10     |
| data          | 返回数据格式：{ totalSize: Number, list: [] } | Promise                                                                                                                                | true     |
| card          | 是否采用 Card 包裹组件                        | boolean                                                                                                                                | false    | true   |
| title         | Card 组件 title 属性                          | string\|ReactNode                                                                                                                      | false    | null   |
| callback      | 获取数据与方法                                | function                                                                                                                               | false    |        |
| pagination    | 分页组件属性                                  | Object                                                                                                                                 | false    |        |
| pageChange    | 页码条数变化前回调                            | Function                                                                                                                               | false    |        |
| pRowSelection | 因 antd 3.x 版本无跨页保存选择行而封装        | Object: { key<`String`>: Table 绑定的属性, preserve<`Boolean`>: 是否跨页保存, rows<`Array`>: 选择行, setRows<`Function`>: 设置选择行 } | false    |        |

> Table 的 rowKey 属性默认为行数据的 id 属性 (rowKey={row => row.id})；
> 其余属性均会传递给 Table 组件。

## 注意事项

> 你可能需要为了与后端提供的接口返回结果一致而去修改以下代码：
> (需要注意的是，这里的修改是全局性的，意味着整个项目所有使用该 ProTable 组件都需要遵守这个返回结果定义的字段。)

修改 `@/components/ProTable/index.js` 第 34 行起

```js
// 刷新
const refresh = useSyncCallback(_ => {
  const { current, size } = pagination
  setLoading(true)
  const result = data({ current, size })
  if (
    (typeof result === 'object' || typeof result === 'function') &&
    typeof result.then === 'function'
  ) {
    result.then(({ totalSize, list }) => {
      // 删除最后一项时, 自动翻页
      if (!list.length && pagination.current > 1)
        return setPagination({
          ...pagination,
          current: pagination.current - 1,
        })

      // totalSize: 总数量, list: 列表数据
      setPagination({ ...pagination, totalSize })
      setList(list)
      setLoading(false)
      cb()
    })
  }
})
```

返回 JSON 例子：

```json
{
  "code": 200,
  "createTime": "2021-08-20T17:20:40.618",
  "data": {
    "list": [
      {
        "adminToken": null,
        "avatar": "1212212",
        "createTime": "2021-08-11 02:39:29",
        "email": "7777777@qq.com",
        "id": 1,
        "mobile": "13566624148",
        "modifyTime": "2021-08-12 00:34:33",
        "name": "超级管理员",
        "username": "admin"
      },
      {
        "adminToken": null,
        "avatar": "",
        "createTime": "2021-08-18 23:14:04",
        "email": "coderljw@dingtalk.com",
        "id": 6,
        "mobile": "13627978798",
        "modifyTime": "2021-08-18 23:14:04",
        "name": "五条悟",
        "username": "5t5"
      }
    ],
    "size": 1,
    "totalCurrent": 1,
    "totalSize": 11
  },
  "errorMsg": ""
}
```

## 其他

`useSyncCallback`（在 useState 改变值之后获取最新的状态，可以理解为 Vue 中的$nextTick）

```jsx
import { useEffect, useState, useCallback } from 'react'

const useSyncCallback = callback => {
  const [proxyState, setProxyState] = useState(false)

  const fn = useCallback(() => {
    setProxyState(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxyState])

  useEffect(() => {
    if (proxyState) {
      setProxyState(false)
      callback()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxyState])

  return fn
}

export default useSyncCallback
```

## 更新时间

该文档最后更新于： 2021-08-31 PM 17:49
