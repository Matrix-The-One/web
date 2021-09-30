import React, { useState, useEffect } from 'react'
import { Card, Table, Pagination } from 'antd'
import useSyncCallback from './useSyncCallback'

const ProTable = ({
  current,
  size,
  data,
  callback,
  card = true,
  title,
  pagination,
  pageChange,
  pRowSelection,
  ...tableProps
}) => {
  const [page, setPage] = useState({
    current: current || 1,
    size: size || 10,
    totalSize: 0,
  })
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState([])

  // 初次加载与分页变化加载数据
  useEffect(
    _ => {
      refresh()
    },
    [page.current, page.size]
  )

  // 刷新
  const refresh = useSyncCallback(_ => {
    const { current, size } = page
    setLoading(true)
    const result = data({ current, size })
    if (
      (typeof result === 'object' || typeof result === 'function') &&
      typeof result.then === 'function'
    ) {
      result.then(({ totalSize, list }) => {
        // 删除最后一项时, 自动翻页
        if (!list.length && page.current > 1)
          return setPage({
            ...page,
            current: page.current - 1,
          })

        setPage({ ...page, totalSize })
        setList(list)
        setLoading(false)
        cb()
      })
    }
  })

  // 返回数据与方法
  const cb = useSyncCallback(_ => {
    typeof callback === 'function' &&
      callback({
        page,
        list,
        setList,
        refresh,
        refreshFirst: _ => {
          setPage({
            ...page,
            current: 1,
          })
          refresh()
        },
      })
  })

  // 保存选择行
  const rowSelection = () => {
    // preserve: 是否跨页保存
    const { key, preserve = true, rows, setRows } = pRowSelection
    return {
      selectedRowKeys: rows.map(i => i[key]),
      onChange: (selectedRowKeys, selectedRows) => {
        preserve || setRows(selectedRows)
      },
      onSelect: (record, selected, selectedRows) => {
        preserve &&
          (selected
            ? setRows([...rows, record])
            : setRows(rows.filter(i => i[key] !== record[key])))
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        preserve &&
          (selected
            ? setRows([...rows, ...changeRows])
            : setRows(
                rows.filter(i => !changeRows.map(r => r[key]).includes(i[key]))
              ))
      },
      ...pRowSelection,
    }
  }

  return (
    <>
      {card ? (
        <Card title={title || null}>
          <Table
            rowKey={row => row.id}
            dataSource={list}
            loading={loading}
            pagination={false}
            bordered
            rowSelection={pRowSelection ? rowSelection() : null}
            {...tableProps}
          ></Table>
          <br />
        </Card>
      ) : (
        <Table
          rowKey={row => row.id}
          dataSource={list}
          loading={loading}
          pagination={false}
          bordered
          rowSelection={pRowSelection ? rowSelection() : null}
          {...tableProps}
        ></Table>
      )}

      <br />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          current={page.current}
          total={page.totalSize}
          pageSizeOptions={['10', '20', '40']}
          showTotal={total => `共${total}条数据`}
          onChange={current => {
            pageChange && pageChange()
            setPage({ ...page, current })
          }}
          onShowSizeChange={(_, size) => {
            pageChange && pageChange()
            setPage({ ...page, size })
          }}
          showSizeChanger
          showQuickJumper
          hideOnSinglePage={true}
          {...pagination}
        />
      </div>
    </>
  )
}

export default ProTable
