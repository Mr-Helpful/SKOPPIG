import React from 'react'
import Modal from './Modal'
import ModalContent from './ModalContent'

const NodeModal = (props: any) => (
  <Modal {...props}>
    <ModalContent />
  </Modal>
)

export default React.memo(NodeModal)
