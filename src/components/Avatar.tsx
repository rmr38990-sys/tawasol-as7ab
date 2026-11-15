import React from 'react';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  className?: string;
}

const PALETTES = [
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-teal-500',
  'from-teal-400 to-sky-500',
  'from-rose-400 to-pink-600',
  'from-sky-400 to-cyan-600',
];

function getGradientForName(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return PALETTES[sum % PALETTES.length];
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const SIZE_CLASSES = {
  xs: 'w-7 h-7 text-[11px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-28 h-28 sm:w-32 sm:h-32 text-3xl',
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  isOnline,
  className = '',
}) => {
  const gradient = getGradientForName(name || 'T');
  const initials = getInitials(name || 'TW');

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          referrerPolicy="no-referrer"
          className={`${SIZE_CLASSES[size]} rounded-full object-cover ring-2 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-800`}
        />
      ) : (
        <div
          className={`${SIZE_CLASSES[size]} rounded-full bg-gradient-to-br ${gradient} text-white font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 select-none shadow-sm`}
          aria-label={name}
        >
          {initials}
        </div>
      )}
      {isOnline && (
        <span
          className="absolute bottom-0 end-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
          title="Online"
        />
      )}
    </div>
  );
};
