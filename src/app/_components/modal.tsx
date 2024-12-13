import React from 'react';
import cn from 'classnames';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center", { hidden: !isOpen })}>
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative bg-gray-800 p-6 rounded-lg shadow-lg z-10">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none small"
          onClick={onClose}
        >
          Close
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;