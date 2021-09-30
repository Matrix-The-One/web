# UltraTable 重封装组件说明

## 封装说明

> 基础的使用方式与 API 与 [官方版(Table)](https://procomponents.ant.design/components/table/) 基本一致，在其基础上，封装了加载数据的方法。
>
> 主要针对项目接口返回数据字段与官方定义字段不一做处理，并增加删除最后一项时自动翻页功能；

该 `UltraTable` 由 [@Neo](https://github.com/Matrix-The-One) 完成封装

## 例子

```jsx
import React, { useState } from 'react'
import { Card, Button, DatePicker, Popconfirm } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import { PlusOutlined } from '@ant-design/icons'
import { UltraTable } from '@/components'
import Details from './components/Details'
import { SearchByPage, Remove, EditIsTop } from '@/api/notice'
import { useRequestAop } from '@/hooks'

const { RangePicker } = DatePicker

const Notice = () => {
  const [proTable, setProTable] = useState({})

  // 0: 隐藏, 1: 新增, 2: 编辑
  const [visible, setVisible] = useState(0)

  const [currentRow, setCurrentRow] = useState({})

  const [RemoveNotice] = useRequestAop({
    api: Remove,
    loadingMsg: '提交中',
    successMsg: '删除成功',
  })

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 60,
    },
    {
      title: '标题',
      key: 'title',
      dataIndex: 'title',
      copyable: true,
      ellipsis: true,
    },
    {
      title: '内容',
      key: 'content',
      dataIndex: 'content',
      copyable: true,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '排序',
      key: 'sort',
      dataIndex: 'sort',
      hideInSearch: true,
      sorter: (a, b) => a.sort - b.sort,
    },
    {
      title: '是否置顶',
      key: 'isTop',
      dataIndex: 'isTop',
      valueType: 'select',
      valueEnum: {
        all: { text: '全部', status: 'Default' },
        true: { text: '是', status: 'Success' },
        false: { text: '否', status: 'Error' },
      },
      fieldProps: {
        allowClear: false,
        defaultValue: 'all',
      },
    },
    {
      title: '创建时间',
      key: 'inTime',
      dataIndex: 'inTime',
      hideInSearch: true,
      valueType: 'dateTime',
      sorter: (a, b) => new Date(a.inTime) - new Date(b.inTime),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 160,
      render: (text, row, _, action) => {
        return [
          <a
            key='editable'
            onClick={() => {
              setCurrentRow(row)
              setVisible(2)
            }}
          >
            编辑
          </a>,
          row.isTop ? null : (
            <a
              key='top'
              onClick={async _ => {
                await EditIsTop({ id: row.id })
                action.reload()
              }}
            >
              置顶
            </a>
          ),
          <Popconfirm
            key='delete'
            title='该操作将永久删除此公告，是否继续！'
            placement='topRight'
            onConfirm={async _ => {
              await RemoveNotice({ id: row.id })
              action.reload()
            }}
            okText='确认'
            cancelText='取消'
          >
            <a>删除</a>
          </Popconfirm>,
        ]
      },
    },
    {
      title: '时间',
      key: 'searchTime',
      hideInTable: true,
      renderFormItem: () => <RangePicker />,
      fieldProps: {
        placeholder: ['开始日期', '结束日期'],
        format: 'YYYY-MM-DD',
      },
    },
  ]

  return (
    <PageContainer>
      <Card>
        <UltraTable
          rowKey={row => row.id}
          headerTitle='公告列表'
          setProTable={setProTable}
          columns={columns}
          requestFn={async params => {
            const { isTop, searchTime } = params
            return await SearchByPage({
              ...params,
              isTop: { all: void 0, true: true, false: false }[isTop],
              StartTime: searchTime?.[0],
              EndTime: searchTime?.[1],
            })
          }}
          toolBarRender={() => [
            <Button
              key='add'
              icon={<PlusOutlined />}
              type='primary'
              onClick={_ => setVisible(1)}
            >
              新增
            </Button>,
          ]}
        />

        <Details
          visible={visible}
          hidden={_ => setVisible(0)}
          refresh={proTable.reload}
          currentRow={currentRow}
        />
      </Card>
    </PageContainer>
  )
}

export default Notice
```

## 内置属性

| 属性        | 说明                       | 类型     | 是否必传 | 默认值 |
| ----------- | -------------------------- | -------- | -------- | ------ |
| setProTable | 获取 ProTable 组件实例     | Function | false    |        |
| requestFn   | 请求方法（需返回 Promise） | Function | true     |        |

> Table 的 rowKey 属性默认为行数据的 id 属性 (rowKey={row => row.id})
> 其余属性均会传递给 Table 组件

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
