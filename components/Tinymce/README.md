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

| 属性             | 说明                 | 类型       | 是否必传 | 默认值                                              |
| ---------------- | -------------------- | ---------- | -------- | --------------------------------------------------- |
| height           | 高度                 | `String`   | false    | 500px                                               |
| editor           | 编辑文本             | `String`   | true     |                                                     |
| setEditor        | 文本回调             | `Function` | true     |                                                     |
| tinymceScriptSrc | CDN 地址或本地包地址 | `String`   | false    | //cdn.jsdelivr.net/npm/tinymce@5.9.2/tinymce.min.js |

> tinymceScriptSrc 根据使用版本自行修改：
> 其余属性均会传递给 Tinymce 组件。

## 更新时间

该文档最后更新于： 2021-09-30 PM 16:10
