import { useState } from 'react';
import type { SidebarSearchProps } from '../types';

export function SidebarSearch({ placeholder, onSearch, className }: SidebarSearchProps) {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch?.(newValue);
  };

  return (
    <div className={`sidebar-search ${className ?? ''}`.trim()}>
      <input
        type="text"
        role="searchbox"
        className="sidebar-search__input"
        placeholder={placeholder}
        aria-label="Search sidebar"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
