```tsx
// Modal.tsx
import React, {
  useState,
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import styles from './Modal.module.scss';
import FocusTrap from 'focus-trap-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  ariaLabelledBy?: string;
}

interface ModalContextProps {
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  ariaLabelledBy,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      if (modalRef.current) {
        (modalRef.current as HTMLDivElement).focus();
      }
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeModal]);

  if (!isOpen) {
    return null;
  }

  const modalContextValue: ModalContextProps = {
    closeModal,
  };

  return (
    <div className={styles.modalBackdrop}>
      <FocusTrap>
        <div
          className={`${styles.modal} ${className}`}
          ref={modalRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledBy}
        >
          <ModalContext.Provider value={modalContextValue}>
            {children}
          </ModalContext.Provider>
        </div>
      </FocusTrap>
    </div>
  );
};

interface ModalHeaderProps {
  title: string;
  children?: ReactNode;
}

const Header: React.FC<ModalHeaderProps> = ({ title, children }) => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('Modal.Header must be used within a Modal');
  }

  return (
    <div className={styles.modalHeader}>
      <h2 className={styles.modalTitle}>{title}</h2>
      {children ? (
        children
      ) : (
        <button
          className={styles.closeButton}
          onClick={context.closeModal}
          aria-label="Close Modal"
        >
          &times;
        </button>
      )}
    </div>
  );
};

interface ModalBodyProps {
  description?: string;
  children: ReactNode;
}

const Body: React.FC<ModalBodyProps> = ({ description, children }) => {
  return (
    <div className={styles.modalBody}>
      {description && <p className={styles.modalDescription}>{description}</p>}
      <div>{children}</div>
    </div>
  );
};

interface ModalFooterProps {
  children: ReactNode;
}

const Footer: React.FC<ModalFooterProps> = ({ children }) => {
  return <div className={styles.modalFooter}>{children}</div>;
};

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;

export default Modal;
```

```scss
// Modal.module.scss
.modalBackdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  width: 50%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  outline: none;
}

.modalHeader {
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modalTitle {
  font-size: 1.25rem;
  margin: 0;
}

.closeButton {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
}

.modalBody {
  padding: 1rem;
  flex-grow: 1;
  overflow-y: auto;
}

.modalDescription {
  margin-bottom: 1rem;
}

.modalFooter {
  padding: 1rem;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: flex-end;
}
```

```tsx
// Usage Example (App.tsx or similar)
import React, { useState } from 'react';
import Modal from './Modal';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <button onClick={openModal}>Open Modal</button>

      <Modal isOpen={isModalOpen} onClose={closeModal} ariaLabelledBy="modal-title">
        <Modal.Header title="My Modal" />
        <Modal.Body description="This is a description of the modal.">
          <p>Some content inside the modal body.</p>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={closeModal}>Cancel</button>
          <button>Confirm</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default App;
```