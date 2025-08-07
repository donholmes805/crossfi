import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center p-4 mt-8">
      <div className="text-sm text-gray-500">
        <span>CrossFIWord Wars by </span>
        <a 
          href="https://fitotechnology.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-gray-400 hover:text-blue-400 hover:underline transition-colors"
        >
          Fito Technology, LLC
        </a>
      </div>
      <div className="text-xs text-gray-600 mt-1">
        Copyright © 2025. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
