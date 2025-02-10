import React, { memo, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { Button, Table, message } from "antd"

import { getLang } from ".../utils/utils"
import { sendMessage } from "../../../utils/messageHelper"
import EditRule from "./EditRule"
import Style from "./ViewRuleStyle"
import ActionView from "./view/ActionView"
import MatchView from "./view/MatchView"
import OperationView from "./view/OperationView"
import TargetView from "./view/TargetView"

const { Map } = require("immutable")

const { Column } = Table

const ViewRule = memo((props) => {
  const [messageApi, contextHolder] = message.useMessage()

  const { options, configs, extensions, reverseSelection, updateReverseSelection, operation } =
    props

  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const paramRuleId = searchParams.get("id")

  // 正在编辑的规则
  const [editingConfig, setEditingConfig] = useState(null)
  const [selectedRuleId, setSelectedRuleId] = useState(null)

  // 规则列表
  const [records, setRecords] = useState()
  useEffect(() => {
    if (configs) {
      setRecords(configs.map((c, index) => Map(c).set("index", index).toJS()))
    }
  }, [configs])

  // 处理 URL 从的参数 id，如果存在，则高亮显示这条规则
  useEffect(() => {
    if (!paramRuleId) {
      return
    }
    setSelectedRuleId(paramRuleId)
    searchParams.delete("id")
    navigate(`?${searchParams.toString()}`, { replace: true })
    setTimeout(() => {
      // 一段时间之后，高亮显示消失
      setSelectedRuleId("")
    }, 3000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramRuleId])

  // 如果有 selectedRuleId 但没有找到，则给出提示
  useEffect(() => {
    if (!selectedRuleId || records === undefined || records.length === 0) {
      return
    }
    if (!records.find((c) => c.id === selectedRuleId)) {
      messageApi.warning(`Rule ${selectedRuleId} not found`)
    }
  }, [records, selectedRuleId, messageApi])

  const onAdd = () => {
    setEditingConfig({})
  }

  const onEdit = (record) => {
    setEditingConfig(record)
  }

  const onDuplicate = async (record) => {
    if (!record) {
      return
    }

    try {
      await operation.duplicate(record)
    } catch (error) {
      console.error("复制规则配置", error)
      if (error.message.includes("QUOTA_BYTES_PER_ITEM")) {
        // message.error("复制失败，超过浏览器存储限制")
      } else {
        messageApi.error(error.message)
      }
    }
  }

  const onSave = async (record) => {
    if (!record) {
      return
    }
    // 如果 record 没有 id，表示是新增的数据
    if (!record.id || record.id === "") {
      record.enable = true // 默认开启
      await operation.add(record)
      setEditingConfig(null)
    } else {
      await operation.update(record)
      setEditingConfig(null)
    }

    sendMessage("rule-config-changed")
  }

  const onEnabled = async (record, enable) => {
    if (!record) {
      return
    }
    record.enable = enable
    await operation.update(record)
    sendMessage("rule-config-changed")
  }

  const onDelete = async (record) => {
    await operation.delete(record.id)
    sendMessage("rule-config-changed")

    // 如果删除的正是当前正在编辑的，则取消编辑
    if (editingConfig?.id === record.id) {
      setEditingConfig(null)
    }
  }

  const onCancel = () => {
    setEditingConfig(null)
  }

  return (
    <Style>
      {contextHolder}
      <Table
        dataSource={records}
        rowKey="id"
        size="small"
        pagination={{ position: ["bottomCenter"], hideOnSinglePage: true }}
        rowClassName={(record, index) => {
          if (record.id === selectedRuleId) {
            return "rule-row-selected"
          } else {
            return ""
          }
        }}>
        <Column
          title={getLang("column_index")}
          dataIndex="index"
          width={60}
          align="center"
          render={(index, record) => {
            if (record.id === selectedRuleId) {
              return <span>✔</span>
            }
            return <span>{index + 1}</span>
          }}
        />
        <Column
          title={getLang("rule_column_match")}
          dataIndex="match"
          render={(match, record) => {
            return <MatchView config={match} options={options}></MatchView>
          }}
        />
        <Column
          title={getLang("rule_column_extensions")}
          dataIndex="target"
          render={(target, record) => {
            return <TargetView config={target} options={options} extensions={extensions} />
          }}
        />

        <Column
          title={getLang("rule_column_action")}
          dataIndex="action"
          width={200}
          render={(action, record) => {
            return <ActionView config={action} />
          }}
        />

        <Column
          title={getLang("rule_column_operation")}
          dataIndex="id"
          width={400}
          render={(id, record) => {
            return (
              <OperationView
                record={record}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onEnabled={onEnabled}
              />
            )
          }}
        />
      </Table>

      <div className="button-group">
        {!editingConfig && (
          <Button type="primary" onClick={() => onAdd(null)}>
            {getLang("rule_add")}
          </Button>
        )}

        <Button
          onClick={() => {
            chrome.tabs.create({
              url: "https://ext.jgrass.cc/docs/rule"
            })
          }}>
          {getLang("help")}
        </Button>
      </div>

      {editingConfig && (
        <EditRule
          options={options}
          config={editingConfig}
          extensions={extensions}
          reverseSelection={reverseSelection}
          updateReverseSelection={updateReverseSelection}
          onSave={onSave}
          onCancel={onCancel}></EditRule>
      )}
    </Style>
  )
})

export default ViewRule
