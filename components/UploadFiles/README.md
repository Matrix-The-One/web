# UploadFiles 重封装组件说明

## 封装说明

该 `UploadFiles` 由 [@Neo](https://github.com/Matrix-The-One) 完成封装。

## 例子

```jsx
import React from 'react'
import {
  ProFormText,
  ProFormTextArea,
  ProFormRadio,
} from '@ant-design/pro-form'
import { UltraModalFrom, UploadFiles } from '@/components'
import { useRequestAop } from '@/hooks'
import { Save } from '@/api/news'

const Details = ({ visible, hidden, refresh, currentRow }) => {
  const [Notice] = useRequestAop({
    api: Save,
    successMsg: visible === 1 ? '新增成功' : '编辑成功',
  })

  const { id, title, authorName, type, linkUrl, details, coverImages, isTop } =
    currentRow || {}

  return (
    <UltraModalFrom
      title={visible === 1 ? '新增资讯' : `编辑资讯：${title}`}
      visible={!!visible}
      initialValues={
        visible === 1
          ? { type: 1, isTop: false }
          : {
              title,
              authorName,
              type,
              linkUrl,
              details,
              coverImages: [
                { uid: 1, name: coverImages, status: 'done', url: coverImages },
              ],
              isTop,
            }
      }
      hidden={hidden}
      onFinish={async values => {
        const { coverImages } = values
        if (coverImages[0].status !== 'done') return
        await Notice({
          ...values,
          id: visible === 1 ? void 0 : id,
          coverImages: coverImages[0].url,
        })
        refresh()
        hidden()
      }}
    >
      <ProFormText
        name='title'
        label='标题'
        rules={[{ required: true, whitespace: true, message: '标题不能为空' }]}
        fieldProps={{
          allowClear: true,
        }}
        placeholder='请输入标题'
      />
      <ProFormText
        name='authorName'
        label='作者'
        rules={[{ required: true, whitespace: true, message: '作者不能为空' }]}
        fieldProps={{
          allowClear: true,
        }}
        placeholder='请输入作者'
      />
      <ProFormRadio.Group
        name='type'
        label='类型'
        rules={[{ required: true }]}
        options={[
          {
            label: '站内',
            value: 1,
          },
          {
            label: '站外',
            value: 2,
          },
        ]}
      />
      <ProFormText
        name='linkUrl'
        label='链接'
        rules={[
          { required: true, whitespace: true, message: '链接不能为空' },
          {
            pattern:
              /^((https?):\/\/)[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,
            message: '链接格式错误',
          },
        ]}
        fieldProps={{
          allowClear: true,
        }}
        placeholder='请输入链接'
      />
      <ProFormTextArea
        name='details'
        label='详情'
        rules={[{ required: true, whitespace: true, message: '详情不能为空' }]}
        fieldProps={{
          autoSize: { minRows: 5, maxRows: 10 },
          allowClear: true,
          showCount: true,
        }}
        placeholder='请输入详情'
      />
      <UploadFiles
        name='coverImages'
        label='封面'
        rules={[{ required: true, message: '请上传封面' }]}
      />
      <ProFormRadio.Group
        name='isTop'
        label='是否置顶'
        rules={[{ required: true }]}
        options={[
          {
            label: '是',
            value: true,
          },
          {
            label: '否',
            value: false,
          },
        ]}
      />
    </UltraModalFrom>
  )
}

export default Details
```

## 内置属性

| 属性         | 说明                 | 类型     | 是否必传 | 默认值                                    |
| ------------ | -------------------- | -------- | -------- | ----------------------------------------- | --- |
| fileTypeList | 上传文件类型         | `Array`  | false    | ['image/jpeg', 'image/png', 'image/webp'] |
| typeWarning  | 文件类型错误提示     | `String` | false    | 仅支持 jpg、png、webp 图片类型            |
| fileSize     | 文件限制大小 /M      | `Number  | String`  | false                                     | 5   |
| sizeWarning  | 文件大小超出限制提示 | `String` | false    | 图片大小不能超过 5M                       |
| fieldProps   | Antd-Pro V5 透传属性 | `Object` | false    |                                           |

> 其余属性均会传递给 ProFormUploadButton 组件。

## 注意事项

> 你需要为了与后端提供的接口而去修改以下代码：
> (需要注意的是，这里的修改是全局性的，意味着整个项目所有使用该 UploadFiles 组件都需要遵守这个返回结果定义的字段。)

修改接口地址 `@/components/UploadFiles/index.jsx` 第 69 行

```js
action={`${APP_BASE_URL}/api/Admin/File/Upload`}
```

修改请求头 `@/components/UploadFiles/index.jsx` 第 78 行

```js
Authorization: storage.get(ACCESS_TOKEN)
```

## 更新时间

该文档最后更新于： 2021-09-30 PM 17:02
