import React from 'react';

const Card = ({ children, className = '', hover = true, ...props }) => {
  const baseStyles = 'bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6';
  const hoverStyles = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
