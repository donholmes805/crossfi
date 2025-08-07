import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-100 text-center p-4 mt-auto">
      <div className="small text-body-secondary">
        <span>CrossFIWord Wars by </span>
        <a 
          href="https://fitotechnology.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-body-secondary text-decoration-underline"
        >
          Fito Technology, LLC
        </a>
      </div>
      <div className="small text-body-tertiary mt-1">
        Copyright © 2025. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
