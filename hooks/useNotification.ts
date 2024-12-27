'use client'

import toast from 'react-hot-toast';

export const useNotification = () => {
  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    });
  };

  const showError = (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
    });
  };

  const showInfo = (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
  };
};