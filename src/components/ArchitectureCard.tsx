import React from 'react';

interface ArchitectureCardProps {
  title: string;
  content: string;
}

export const ArchitectureCard: React.FC<ArchitectureCardProps> = ({ title, content }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-shadow">
      <h4 className="font-bold text-stone-900 mb-2">{title}</h4>
      <p className="text-sm text-stone-500 leading-relaxed">{content}</p>
    </div>
  );
};
