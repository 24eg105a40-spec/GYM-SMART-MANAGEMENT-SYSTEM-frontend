import React from 'react';

const ConfirmDialog = ({
  show,
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  confirmVariant = 'danger',
}) => {
  const visible = show || isOpen;
  if (!visible) return null;

  // Normalize variant class
  const variantClass = confirmVariant.startsWith('btn-')
    ? confirmVariant
    : `btn-${confirmVariant}`;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1060 }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content gym-card border-secondary text-white shadow-lg">
          <div className="modal-header border-secondary">
            <h5 className="modal-title fs-5 fw-bold">{title}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onCancel}></button>
          </div>
          <div className="modal-body py-4">
            <p className="text-secondary mb-0">{message}</p>
          </div>
          <div className="modal-footer border-secondary">
            <button type="button" className="btn btn-gym-outline" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className={`btn ${variantClass} fw-bold`} onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
