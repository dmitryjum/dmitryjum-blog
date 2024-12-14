'use client';
import React, { useState } from 'react';

interface CollapsibleCardProps {
  name: string;
  role: string;
  testimonial: string;
  image: string;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({ name, role, testimonial, image }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  }

  return (
    <div className="flex flex-col items-center text-center p-6 bg-opacity-60 bg-gray-800 rounded-lg shadow-lg">
      <img src={image} alt={`${name}`} className="w-16 h-16 rounded-full mb-4" />
      <h3 className="text-xl font-semibold text-white">{name}</h3>
      <p className="text-sm text-gray-400 mb-2">{role}</p>
      <p className={`text-lg text-gray-300 ${isCollapsed ? 'line-clamp-3' : ''}`}>
        "{testimonial}"
      </p>
      <button onClick={toggleCollapse} className="mt-2 text-blue-500">
        {isCollapsed ? 'Read More' : 'Read Less'}
      </button>
    </div>
  )
};

export default CollapsibleCard;