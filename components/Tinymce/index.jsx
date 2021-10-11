import React, { useState } from 'react'
import tinymce from 'tinymce/tinymce.min'
import 'tinymce/themes/silver/theme' // 主题
import 'tinymce/icons/default' // 图标
// import 'tinymce/plugins/code' // code
// import 'tinymce/plugins/emoticons' // 表情
import 'tinymce/plugins/paste' // 粘贴
import 'tinymce/plugins/advlist' // 高级列表
import 'tinymce/plugins/autolink' // 自动链接
import 'tinymce/plugins/link' // 超链接
import 'tinymce/plugins/lists' // 列表插件
import 'tinymce/plugins/charmap' // 特殊字符
import 'tinymce/plugins/media' // 插入编辑媒体
import 'tinymce/plugins/wordcount' // 字数统计
import 'tinymce/plugins/hr' // 分割线
import 'tinymce/plugins/image' // 图片
import 'tinymce/plugins/imagetools' // 图片编辑
import 'tinymce/plugins/insertdatetime' // 时间
import 'tinymce/plugins/fullscreen' // 全屏
import 'tinymce/plugins/table' // 表格
import { Editor } from '@tinymce/tinymce-react'
import zh_CN from '@/assets/tinymce/zh_CN'
import 'tinymce/skins/ui/oxide/skin.min.css'
import 'tinymce/skins/ui/oxide/content.inline.min.css'
import storage from '@/utils/storage'
import { ACCESS_TOKEN } from '@/utils/types'

const Tinymce = ({ height = '500px', editor, setEditor, ...props }) => {
  const [content, setContent] = useState('')

  // 上传前校验
  const beforeUpload = ({ type, size }) => {
    let errorMsg
    const fileVerify = ['image/jpeg', 'image/png', 'image/webp'].includes(type)
    if (!fileVerify) errorMsg = '仅支持jpg、png、webp图片类型'

    const sizeVerify = size / 1024 / 1024 < 5
    if (!sizeVerify) errorMsg = '图片大小不能超过5M'
    return errorMsg
  }

  const init = {
    selector: '#tinymce',
    height: height,
    language_url: zh_CN,
    language: 'zh_CN',
    images_upload_handler: async (blobInfo, success, failure, progress) => {
      const formData = new FormData()
      const file = blobInfo.blob()
      const verifyRes = beforeUpload(file)
      if (verifyRes) return failure(verifyRes)
      formData.append('file', file)

      try {
        const response = await fetch(`${APP_BASE_URL}/api/Admin/File/Upload`, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: storage.get(ACCESS_TOKEN),
          },
        })
        const { code, data, errorMsg } = await response.json()
        if (code === 200) success(data[0])
        else failure(errorMsg || '上传失败')
      } catch (err) {
        failure(err || '上传失败')
      }
    },
    paste_data_images: true,
    content_css: false,
    image_class_list: null,
    plugins:
      'advlist autolink lists paste charmap wordcount hr link image imagetools insertdatetime fullscreen table lineheight',
    toolbar: `undo redo | forecolor  backcolor | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | formatselect | fontselect | removeformat formats hr charmap lineheight table | link image insertdatetime fullscreen`,
    branding: false,
    contextmenu: 'link image imagetools table spellchecker bold copy',
    elementpath: false,
    font_formats:
      '微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif',
    placeholder: '请输入',
  }

  return (
    <Editor
      init={init}
      initialValue={editor}
      onEditorChange={value => setContent(value)}
      onBlur={_ => setEditor(content)}
      tinymceScriptSrc="//cdn.jsdelivr.net/npm/tinymce@5.9.2/tinymce.min.js"
      {...props}
    />
  )
}

export default Tinymce
