import { type FC, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import cn from '../cn';

interface TabButtonProps {
  name: string;
  icon?: ReactNode;
  active: boolean;
  type?: string;
  count?: string;
  className?: string;
  showOnSm?: boolean;
  onClick: () => void;
}

const TabButton: FC<TabButtonProps> = ({
  name,
  icon,
  active,
  type,
  count,
  showOnSm = false,
  className = '',
  onClick
}) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => {
        if (type) {
          const presentURL = new URL(window.location.href);
          presentURL.searchParams.set('type', type.toString());
          navigate(presentURL.pathname + presentURL.search, {
            replace: true
          });
        }
        onClick();
      }}
      className={cn(
        {
          '!text-brand-500 dark:!text-brand-400/80 bg-brand-100 dark:bg-brand-300/20':
            active
        },
        'flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 sm:px-3 sm:py-1.5',
        'hover:bg-brand-100/80 hover:text-brand-400 dark:hover:bg-brand-300/30 outline-brand-500 justify-center',
        className
      )}
      aria-label={name}
    >
      {icon}
      <span className={cn({ 'hidden sm:block': !showOnSm })}>{name}</span>
      {count ? (
        <span
          className={cn(
            active
              ? 'bg-brand-500 dark:bg-brand-500/80 text-white dark:text-white'
              : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
            'ml-2 rounded-2xl px-2 py-0.5 text-xs font-bold'
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
};

export default TabButton;
