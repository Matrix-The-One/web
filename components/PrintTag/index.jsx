import React, { useRef, useEffect } from 'react'
import { Modal, Form, Input, Row, Col, Button } from 'antd'
import Barcode from 'react-barcode'
import tagLogo from '@/assets/images/tag-logo.png'

const logo = new Image()
logo.src = tagLogo
logo.crossOrigin = 'Anonymous'

const QRCodeValueReg = /^[0-9A-Za-z/!@#$%^&*-=_+,/\\.{}:;"'?]*$/

const PrintTag = ({ form, visible, hidden, currentRow }) => {
  const canvasRef = useRef(null)
  const barcodeRef = useRef(null)

  const { spuCode, productCategoryName, retailPrice } = currentRow || {}

  useEffect(() => {
    form.setFieldsValue({
      productCategoryName,
      retailPrice,
      QRCodeText: spuCode,
      QRCodeValue: spuCode,
    })
    setTimeout(draw)
  }, [])

  const draw = () => {
    const { productCategoryName, content1, content2, retailPrice } =
      form.getFieldsValue()

    const svg = barcodeRef.current?.refs?.renderElement

    if (!svg) return

    const str = new XMLSerializer().serializeToString(svg)
    const src = `data:image/svg+xml;base64,${window.btoa(
      unescape(encodeURIComponent(str))
    )}`

    const img = new Image()
    img.src = src
    img.crossOrigin = 'Anonymous'

    img.onload = () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      const fontFamily = 'PingFangSC-Regular, PingFang SC Microsoft YaHei'

      // 导出为jpg图片使用
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#000'

      ctx.drawImage(logo, 35, 30, 230, 87)
      ctx.font = `20px ${fontFamily}`
      ctx.textAlign = 'start'
      ctx.fillText(`品名：${productCategoryName}`, 30, 180)
      ctx.fillText(`内容：${content1 || ''}`, 30, 220)
      ctx.fillText(content2 || '', 90, 260)
      ctx.font = `36px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.fillText(`售价：${retailPrice}`, 150, 330)
      ctx.drawImage(img, 40, 360, 220, 85)
    }
  }

  const download = () => {
    const canvas = canvasRef.current
    const url = canvas.toDataURL('image/jpeg')
    const a = document.createElement('a')

    a.download = spuCode
    a.href = url
    a.click()
  }

  const renderBarcode = () => {
    if (!QRCodeValueReg.test(form.getFieldValue('QRCodeValue'))) return

    const value = form.getFieldValue('QRCodeValue') || spuCode

    const barcodeProps = {
      value,
      text: form.getFieldValue('QRCodeText') || spuCode,
      width: 2,
      height: 77,
      format: 'CODE128',
      displayValue: true,
      fontOptions: '',
      font: 'monospace',
      textAlign: 'center',
      textPosition: 'bottom',
      textMargin: 5,
      fontSize: 20,
      background: 'transparent',
      lineColor: '#000000',
    }

    return <Barcode key={Date.now()} ref={barcodeRef} {...barcodeProps} />
  }

  return (
    <Modal
      title={`打印标签：${currentRow.spuCode}`}
      visible={visible}
      onOk={hidden}
      onCancel={hidden}
      destroyOnClose
      width={1000}
    >
      <Row>
        <Col span={16} style={{ paddingTop: '30px' }}>
          <Form labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}>
            <Form.Item label='品名'>
              {form.getFieldDecorator('productCategoryName')(
                <Input allowClear placeholder='请输入' />
              )}
            </Form.Item>
            <Form.Item label='内容一'>
              {form.getFieldDecorator('content1')(
                <Input allowClear placeholder='请输入' />
              )}
            </Form.Item>
            <Form.Item label='内容二'>
              {form.getFieldDecorator('content2')(
                <Input allowClear placeholder='请输入' />
              )}
            </Form.Item>
            <Form.Item label='售价'>
              {form.getFieldDecorator('retailPrice')(
                <Input allowClear placeholder='请输入' />
              )}
            </Form.Item>
            <Form.Item label='条形码文本'>
              {form.getFieldDecorator('QRCodeText')(
                <Input allowClear placeholder='请输入' />
              )}
            </Form.Item>
            <Form.Item label='扫码结果'>
              {form.getFieldDecorator('QRCodeValue', {
                rules: [
                  {
                    pattern: QRCodeValueReg,
                    message: '非法字符',
                  },
                ],
              })(<Input allowClear placeholder='请输入' />)}
            </Form.Item>
            <Form.Item
              label={<span style={{ opacity: 0 }}></span>}
              colon={false}
            >
              <Button
                type='primary'
                onClick={_ => draw()}
                style={{ marginRight: '15px' }}
              >
                绘制
              </Button>
              <Button type='primary' onClick={_ => download()}>
                下载
              </Button>
            </Form.Item>
          </Form>
        </Col>
        <Col span={8}>
          <div style={{ display: 'none' }}>{renderBarcode()}</div>
          <canvas ref={canvasRef} width='300' height='500'></canvas>
        </Col>
      </Row>
    </Modal>
  )
}

export default Form.create()(PrintTag)
