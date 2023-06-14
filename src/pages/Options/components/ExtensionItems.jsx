import React, { memo } from "react"

import classNames from "classnames"
import { styled } from "styled-components"

import { getIcon } from ".../utils/extensionHelper"

const ExtensionItems = memo(({ items, placeholder, onClick }) => {
  const isEmpty = items && items.length === 0

  return (
    <Style>
      {isEmpty ? (
        <p className="placeholder">{placeholder}</p>
      ) : (
        <ul>
          {items.map((item) => {
            return (
              <li
                key={item.id}
                className={classNames({
                  "ext-item": true,
                  "not-enable": !item.enabled
                })}
                onClick={(e) => onClick(e, item)}>
                <img src={getIcon(item, 128)} alt="" />
                <span>{item.name}</span>
              </li>
            )
          })}
        </ul>
      )}
    </Style>
  )
})

export default ExtensionItems

const Style = styled.div`
  .ext-item {
    margin: 12px 15px;
  }

  .not-enable {
    color: #cccccc;
  }

  .placeholder {
    margin-bottom: 20px;
    padding-left: 5px;

    color: #888;
    font-size: 14px;
    line-height: 20px;

    border-left: 2px solid #cccccc;
  }
`
