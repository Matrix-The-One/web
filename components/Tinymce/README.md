# Tinymce 重封装组件说明

## 封装说明

该 `Tinymce` 由 [@Neo](https://github.com/Matrix-The-One) 完成封装。

## 例子

```jsx
import React, { useState } from 'react'
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout'
import { Tinymce } from '@/components'

export default function Demo() {
  const [content, setContent] = useState('')

  return (
    <PageContainer>
      <Card>
        <Tinymce
          width='100%'
          height='700px'
          editor={content}
          setEditor={setContent}
        />
      </Card>
    </PageContainer>
  )
}
```

## 内置属性

| 属性      | 说明     | 类型       | 是否必传 | 默认值 |
| --------- | -------- | ---------- | -------- | ------ |
| height    | 高度     | `String`   | false    | 500px  |
| editor    | 编辑文本 | `String`   | true     |        |
| setEditor | 文本回调 | `Function` | true     |        |

> 其余属性均会传递给 Tinymce 组件。

## 注意事项

> 你需要为了与后端提供的接口而去修改以下代码：
> (需要注意的是，这里的修改是全局性的，意味着整个项目所有使用该 UploadFiles 组件都需要遵守这个返回结果定义的字段。)

修改请求接口 `@/components/UploadFiles/index.jsx` 第 55 行

```js
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
```

修改 tinymceScriptSrc `@/components/UploadFiles/index.jsx` 第 89 行

```js
tinymceScriptSrc = '//cdn.jsdelivr.net/npm/tinymce@5.9.2/tinymce.min.js'
```

## 更新时间

该文档最后更新于： 2021-09-30 PM 16:10
