import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="w-24 h-24 border-8 border-t-8 border-gray-200 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;