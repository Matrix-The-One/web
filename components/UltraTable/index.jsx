import React, { useRef, useEffect } from 'react'
import ProTable from '@ant-design/pro-table'

const UltraTable = ({ setProTable, requestFn, ...props }) => {
  const proTable = useRef(null)

  useEffect(() => {
    setProTable && setProTable(proTable.current)
  }, [])
  return (
    <ProTable
      actionRef={proTable}
      request={async params => {
        const { current, pageSize } = params
        return new Promise(resolve => {
          requestFn({
            PageIndex: current,
            PageSize: pageSize,
            ...params,
            current: void 0,
            pageSize: void 0,
          })
            .then(({ data: { data, totalCount } }) => {
              // 删除最后一项自动跳转上一页
              if (!data.length && proTable.current.pageInfo.current > 1) {
                proTable.current.pageInfo.current -= 1
                proTable.current.reload()
                return resolve()
              }
              resolve({
                success: true,
                data,
                total: totalCount,
              })
            })
            .catch(_ =>
              resolve({
                success: false,
                data: [],
                total: 0,
              }),
            )
        })
      }}
      pagination={{ defaultPageSize: 10 }}
      defaultSize="default"
      form={{
        ignoreRules: false,
      }}
      dateFormatter="string"
      editable={{
        type: 'multiple',
      }}
      {...props}
    />
  )
}

export default UltraTable
