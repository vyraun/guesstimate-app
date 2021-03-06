import React from 'react'

import Icon from 'react-fa'

import './style.css'

const MetricReadableId = ({readableId}) => (
  <div className='ui label green tiny'>
    {readableId}
  </div>
)

const MetricExpandButton = ({onOpenModal}) => (
  <span
    className='hover-toggle hover-icon'
    onMouseDown={onOpenModal}
    data-select='false'
  >
    <Icon name='expand'/>
  </span>
)

const MetricReasoningIcon = () => (
  <span className='hover-hide hover-icon'>
    <Icon name='comment'/>
  </span>
)

export const MetricToken = ({anotherFunctionSelected, readableId, onOpenModal, hasGuesstimateDescription}) => (
  <div className='MetricToken'>
    {anotherFunctionSelected && <MetricReadableId readableId={readableId} /> }
    {!anotherFunctionSelected && <MetricExpandButton onOpenModal={onOpenModal}/> }
    {!anotherFunctionSelected && hasGuesstimateDescription && <MetricReasoningIcon/> }
  </div>
)
