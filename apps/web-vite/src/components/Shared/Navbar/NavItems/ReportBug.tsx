import {
  ArrowTopRightOnSquareIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';
import cn from '@hey/ui/cn';
import { Link } from 'react-router-dom';
import { type FC } from 'react';
import urlcat from 'urlcat';

interface ReportBugProps {
  onClick?: () => void;
  className?: string;
}

const ReportBug: FC<ReportBugProps> = ({ onClick, className = '' }) => {
  return (
    <Link
      to={urlcat('https://github.com/heyxyz/hey/issues/new', {
        assignees: 'bigint',
        labels: 'needs review',
        template: 'bug_report.yml'
      })}
      className={cn(
        'flex w-full items-center justify-between px-2 py-1.5 text-sm text-gray-700 dark:text-gray-200',
        className
      )}
      target="_blank"
      onClick={onClick}
    >
      <div className="flex items-center space-x-1.5">
        <HandRaisedIcon className="h-4 w-4" />
        <div>Report a bug</div>
      </div>
      <ArrowTopRightOnSquareIcon className="h-4 w-4 md:hidden" />
    </Link>
  );
};

export default ReportBug;
