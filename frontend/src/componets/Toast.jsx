// src/components/Toast.jsx
import React from 'react';

const Toast = ({ message, type = 'error', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success'
    ? 'bg-green-500'
    : type === 'warning'
      ? 'bg-yellow-500'
      : 'bg-red-500';

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium shadow-lg ${bgColor} animate-fadeIn`}>
      {message}
      <button
        onClick={onClose}
        className="ml-3 text-white hover:text-gray-200 focus:outline-none"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;