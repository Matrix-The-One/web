import React, { useState } from 'react'
import { ProFormUploadButton } from '@ant-design/pro-form'
import { Modal, message } from 'antd'
import storage from 'store'
import { ACCESS_TOKEN } from '@/utils/types'

// 转base64
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

const UploadFiles = ({
  fileTypeList,
  typeWarning,
  fileSize,
  sizeWarning,
  fieldProps,
  callback,
  ...props
}) => {
  const [visible, setVisible] = useState(false)

  const [previewImg, setPreviewImg] = useState('')

  // 预览
  const handlePreview = async file => {
    if (!file.url && !file.preview) file.preview = await getBase64(file.originFileObj)

    setPreviewImg(file.url || file.preview)
    setVisible(true)
  }

  // 上传前校验
  const beforeUpload = ({ type, size }) => {
    const fileVerify = (fileTypeList || ['image/jpeg', 'image/png', 'image/webp']).includes(type)
    if (!fileVerify) message.warning(typeWarning || '仅支持jpg、png、webp图片类型')

    const sizeVerify = size / 1024 / 1024 < (fileSize || 5)
    if (!sizeVerify) message.warning(sizeWarning || `图片大小不能超过${fileSize || 5}M`)
    return fileVerify && sizeVerify
  }

  // 上传
  const handleChange = ({ fileList }) => {
    return fileList.map(file => {
      if (file.response) {
        const { code, data } = file.response
        if (code === 200) file.url = data[0]
        else file.status = 'error'
      }
      return file
    })
  }

  return (
    <>
      <ProFormUploadButton
        name="upload"
        label="Upload"
        action={`${APP_BASE_URL}/api/Admin/File/Upload`}
        max={1}
        beforeUpload={beforeUpload}
        onPreview={handlePreview}
        onChange={handleChange}
        fieldProps={{
          name: 'file',
          listType: 'picture-card',
          headers: {
            Authorization: storage.get(ACCESS_TOKEN),
          },
          ...fieldProps,
        }}
        {...props}
      />

      <Modal visible={visible} footer={null} onCancel={_ => setVisible(false)} width="50%">
        <img src={previewImg} alt="picture" style={{ width: '100%' }} />
      </Modal>
    </>
  )
}

export default UploadFiles
