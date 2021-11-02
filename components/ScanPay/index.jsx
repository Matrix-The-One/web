import React, { useState, useRef, useEffect } from 'react'
import { Modal, Input } from 'antd'
import styles from './index.less'
import { useRequestAop } from '@/hooks'
import { orderPay } from '@/api/order'

const ScanPay = ({ visible, hidden, refresh, currentRow }) => {
  // 输入框
  const inputRef = useRef(null)

  // 支付订单号
  const [payOrderCode, setPayOrderCode] = useState('')

  // 时间戳
  const [timestamp, setTimestamp] = useState(0)

  // 支付循环
  const timer = useRef(null)

  const [pay, payLoading] = useRequestAop({
    api: orderPay,
    loadingMsg: '提交中',
    successMsg: '支付成功',
  })

  const { orderId, orderNo, actualAmount } = currentRow || {}

  // 支付
  const payment = async () => {
    await pay({ orderId, payCode: payOrderCode })
    refresh()
  }

  // 获取焦点
  useEffect(() => {
    // 不能简写
    setTimeout(() => inputRef?.current?.focus(), 300)
  }, [])

  // 支付
  useEffect(() => {
    clearInterval(timer.current)
    timer.current = setInterval(async () => {
      if (timestamp && +new Date() - timestamp > 500 && payOrderCode) {
        clearInterval(timer.current)
        await payment()
        hidden()
      }
    }, 500)
    return () => {
      clearInterval(timer.current)
    }
  }, [timestamp])

  return (
    <Modal
      title={`${orderNo}（支付金额：${actualAmount}）`}
      visible={visible}
      maskClosable={false}
      footer={null}
      onCancel={hidden}
      destroyOnClose
      width={600}
    >
      <Input
        ref={inputRef}
        value={payOrderCode}
        onBlur={_ => inputRef.current.focus()}
        onChange={({ target }) => {
          if (payLoading) return
          setTimestamp(+new Date())
          if (timestamp && +new Date() - timestamp > 30 && payOrderCode) {
            setPayOrderCode(target.value.slice(-1))
          } else {
            setPayOrderCode(target.value)
          }
        }}
        className={styles['pay-input']}
      />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className={styles['qr-scanner']}>
          <div className={styles.box}>
            <div className={styles.line}></div>
            <div className={styles.angle}></div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ScanPay
