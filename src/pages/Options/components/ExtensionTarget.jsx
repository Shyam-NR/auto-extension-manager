import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import { Checkbox, Tag } from "antd"
import { styled } from "styled-components"

import { storage } from ".../storage/sync"
import isMatch from ".../utils/searchHelper"
import { getLang } from ".../utils/utils"
import EditorCommonStyle from "../rule/editor/CommonStyle"
import ExtensionItems from "./ExtensionItems"

const { CheckableTag } = Tag

const ExtensionTarget = (
  {
    options,
    config,
    extensions,
    reverseSelection,
    updateReverseSelection,
    searchText,
    params,
    children
  },
  ref
) => {
  const groupList = storage.helper.formatGroups(options.groups)

  let emptyMessage = params.emptyMessage
  if (!emptyMessage) {
    emptyMessage = "Not set any target"
  }

  useImperativeHandle(ref, () => ({
    // 获取配置
    getExtensionSelectConfig: () => {
      if (selectGroupIds.length === 0 && selectedExtensions.length === 0) {
        throw Error(emptyMessage)
      }

      return {
        groups: selectGroupIds.filter((id) => groupList.find((g) => g.id === id)),
        extensions: selectedExtensions.map((e) => e.id),
        reverseSelectedExtensions: reverseSelection ? [unselectedExtensions].map((e) => e.id) : []
      }
    }
  }))

  // 目标分组ID
  const [selectGroupIds, setSelectGroupIds] = useState([])

  // 目标扩展（规则执行的目标）
  const [selectedExtensions, setSelectedExtensions] = useState([])
  // 剩余没有被选择的所有扩展
  const [unselectedExtensions, setUnselectedExtensions] = useState([])
  // 显示到界面上的剩余扩展（搜索之后的结果）
  const [displayUnselectedExtensions, setDisplayUnselectedExtensions] = useState([])

  // 根据配置进行初始化
  useEffect(() => {
    const myConfig = config.target ?? {}
    // 初始化目标插件组
    if (myConfig.groups && myConfig.groups.length > 0) {
      setSelectGroupIds(myConfig.groups)
    } else {
      setSelectGroupIds([])
    }

    // 初始化目标插件
    if (!myConfig.extensions) {
      setSelectedExtensions([])
      setUnselectedExtensions(extensions)
      setDisplayUnselectedExtensions(extensions)
    } else {
      const inExtensions = extensions.filter((e) => myConfig.extensions?.includes(e.id))
      const outExtension = extensions.filter((e) => !myConfig.extensions?.includes(e.id))
      setSelectedExtensions(inExtensions)
      setUnselectedExtensions(outExtension)
      setDisplayUnselectedExtensions(outExtension)
    }
  }, [config, extensions])

  // 当搜索关键字变化，或者未选择列表更新时，更新界面显示
  useEffect(() => {
    const displayUnselected = unselectedExtensions.filter((ext) => {
      return isMatch(
        [ext.name, ext.shortName, ext.description, ext.__attach__?.alias, ext.__attach__?.remark],
        searchText,
        true
      )
    })
    setDisplayUnselectedExtensions(displayUnselected)
  }, [unselectedExtensions, searchText])

  /**
   * 点击已选择的扩展
   */
  const onSelectedExtensionClick = (e, item) => {
    const selected = selectedExtensions.filter((e) => e.id !== item.id)
    setSelectedExtensions(selected)

    const unselected = [...unselectedExtensions, item]
    setUnselectedExtensions(unselected)
  }

  /**
   * 点击未选择的扩展
   */
  const onUnselectedExtensionClick = (e, item) => {
    const unselected = unselectedExtensions.filter((e) => e.id !== item.id)
    setUnselectedExtensions(unselected)

    const selected = [...selectedExtensions, item]
    setSelectedExtensions(selected)
  }

  // 选择的扩展组方法变化
  const handleSelectGroupChange = (groupId, checked) => {
    const nextSelectedGroupIds = checked
      ? [...selectGroupIds, groupId]
      : selectGroupIds.filter((t) => t !== groupId)
    setSelectGroupIds(nextSelectedGroupIds)
  }

  return (
    <EditorCommonStyle>
      <Style>
        {children}

        <div className="group-match-mode-container">
          <span className="select-group-label">
            {getLang("rule_set_target_select_extension_group")}
          </span>
          {groupList.map((group) => {
            return (
              <CheckableTag
                key={group.id}
                checked={selectGroupIds.includes(group.id)}
                onChange={(checked) => handleSelectGroupChange(group.id, checked)}>
                {group.name}
              </CheckableTag>
            )
          })}
        </div>

        <div className="extension-container">
          <h3>{getLang("rule_set_target_select_extension")}</h3>
          <ExtensionItems
            items={selectedExtensions}
            placeholder={getLang("rule_set_target_no_selected_extension")}
            onClick={onSelectedExtensionClick}></ExtensionItems>

          <div className="unselected-extensions-container">
            <h3>{getLang("rule_set_target_other_extension")}</h3>
            <ExtensionItems
              items={displayUnselectedExtensions}
              placeholder={getLang("rule_set_target_no_any_extension")}
              onClick={onUnselectedExtensionClick}></ExtensionItems>
          </div>

          <div title={getLang("reverse_selection_description")}>
            <Checkbox
              className=""
              onChange={(e) => {
                updateReverseSelection(e.target.checked)
              }}>
              <h3>{getLang("reverse_selection")} </h3>
            </Checkbox>
          </div>
        </div>
      </Style>
    </EditorCommonStyle>
  )
}

export default memo(forwardRef(ExtensionTarget))

const Style = styled.div`
  .group-match-mode-container {
    margin: 10px 0 0 0;

    font-size: 14px;

    .select-group-label {
      font-weight: bold;
      margin-right: 10px;
    }

    .ant-tag-checkable {
      border: 1px solid #d9d9d9;
    }

    .ant-tag-checkable-checked {
      border: 1px solid #0984e3;
      background-color: #0984e3;
    }
  }

  .extension-container {
    & h3 {
      font-weight: bold;
      margin: 20px 0;
    }
  }
`
