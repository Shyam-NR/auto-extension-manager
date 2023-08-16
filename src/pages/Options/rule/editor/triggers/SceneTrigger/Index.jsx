import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import { ClearOutlined, DownOutlined, PlusOutlined } from "@ant-design/icons"
import { Alert, Button, Dropdown, Space } from "antd"
import { styled } from "styled-components"

const SceneTrigger = memo(({ options, config }) => {
  const sceneList = options.scenes

  // 匹配情景模式 ID
  const [matchScene, setMatchScene] = useState({})

  useEffect(() => {
    const sceneId = config?.matchScene ?? ""
    setMatchScene(sceneList.filter((s) => s.id === sceneId)[0])
  }, [options, sceneList, config])

  if (!sceneList || sceneList.length === 0) {
    return <p>没有创建任何情景模式，请先创建</p>
  }

  const sceneListMenuProps = {
    items: sceneList.map((scene) => ({
      key: scene.id,
      label: scene.name
    })),
    onClick: (e) => {
      // 用户选择的情景模式
      const selectScene = sceneList.filter((m) => m.id === e.key)[0]
      setMatchScene(selectScene)
    }
  }

  return (
    <Style>
      <Alert message="在启动浏览器和切换情景模式时触发" type="info" showIcon />

      <div className="scene-select-dropdown">
        <Dropdown menu={sceneListMenuProps}>
          <Button>
            <Space>
              {matchScene?.name ?? "选择情景模式"}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      </div>
    </Style>
  )
})

export default SceneTrigger

const Style = styled.div`
  .scene-select-dropdown {
    margin-top: 5px;
  }
`
