import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast'; // Assuming Toast component can handle type/title

const ToastContext = createContext({
  showToast: (type, title, message, duration) => {},
});

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    type: 'info', // Default type
    title: '',
    message: '',
    duration: 3000,
  });

  // Updated showToast to accept type, title, message, duration
  const showToast = useCallback((type = 'info', title = '', message = '', duration = 3000) => {
    setToast({
      visible: true,
      type,
      title,
      message,
      duration,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({
      ...prev,
      visible: false,
    }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        visible={toast.visible}
        type={toast.type} // Pass type to Toast component
        title={toast.title} // Pass title to Toast component
        message={toast.message}
        duration={toast.duration}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
};

// Custom hook to use the Toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
