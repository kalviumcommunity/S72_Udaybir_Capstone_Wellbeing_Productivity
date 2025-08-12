
import React from 'react';

const FocusTips: React.FC = () => {
  return (
    <div className="sentience-card p-6 mt-6">
      <h2 className="text-lg font-medium mb-4">Focus Tips</h2>
      
      <ul className="space-y-3 text-sm">
        <li className="flex gap-2">
          <span className="text-primary">•</span>
          <span>Set clear goals for each focus session</span>
        </li>
        <li className="flex gap-2">
          <span className="text-primary">•</span>
          <span>Remove distractions from your environment</span>
        </li>
        <li className="flex gap-2">
          <span className="text-primary">•</span>
          <span>Take regular breaks to maintain productivity</span>
        </li>
        <li className="flex gap-2">
          <span className="text-primary">•</span>
          <span>Stay hydrated and maintain good posture</span>
        </li>
        <li className="flex gap-2">
          <span className="text-primary">•</span>
          <span>Use the break time to stretch and rest your eyes</span>
        </li>
      </ul>
    </div>
  );
};

export default FocusTips;
