import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Profile, ProfileSearchRequest } from '@hey/lens';
import {
  CustomFiltersType,
  LimitType,
  useSearchProfilesLazyQuery
} from '@hey/lens';
import { Card, Input, Spinner } from '@hey/ui';
import cn from '@hey/ui/cn';
import { motion } from 'framer-motion';
import type { ChangeEvent, FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useDebounce, useOnClickOutside } from 'usehooks-ts';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

import UserProfile from '../UserProfile';

interface SearchProps {
  hideDropdown?: boolean;
  onProfileSelected?: (profile: Profile) => void;
  placeholder?: string;
}

const Search: FC<SearchProps> = ({
  hideDropdown = false,
  onProfileSelected,
  placeholder = 'Search…'
}) => {
  const push = useNavigate();
  const { pathname } = useLocation();
  const [searchParams, _] = useSearchParams();
  const [searchText, setSearchText] = useState('');
  const dropdownRef = useRef(null);
  const debouncedSearchText = useDebounce<string>(searchText, 500);

  useOnClickOutside(dropdownRef, () => setSearchText(''));

  const [searchUsers, { data: searchUsersData, loading: searchUsersLoading }] =
    useSearchProfilesLazyQuery();

  const handleSearch = (evt: ChangeEvent<HTMLInputElement>) => {
    const keyword = evt.target.value;
    setSearchText(keyword);
  };

  const handleKeyDown = (evt: ChangeEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (pathname === '/search') {
      push(
        `/search?q=${encodeURIComponent(searchText)}&type=${searchParams.get(
          'type'
        )}`
      );
    } else {
      push(`/search?q=${encodeURIComponent(searchText)}&type=profiles`);
    }
    setSearchText('');
  };

  useEffect(() => {
    if (pathname !== '/search' && !hideDropdown && debouncedSearchText) {
      // Variables
      const request: ProfileSearchRequest = {
        where: { customFilters: [CustomFiltersType.Gardeners] },
        query: debouncedSearchText,
        limit: LimitType.Ten
      };

      searchUsers({ variables: { request } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchText]);

  const searchResult = searchUsersData?.searchProfiles;
  const isProfileSearchResult =
    searchResult && searchResult.hasOwnProperty('items');
  const profiles = (
    isProfileSearchResult ? searchResult.items : []
  ) as Profile[];

  return (
    <div className="w-full">
      <form onSubmit={handleKeyDown}>
        <Input
          type="text"
          className="px-3 py-2 text-sm"
          placeholder={placeholder}
          value={searchText}
          iconLeft={<MagnifyingGlassIcon />}
          iconRight={
            <XMarkIcon
              className={cn(
                'cursor-pointer',
                searchText ? 'visible' : 'invisible'
              )}
              onClick={() => setSearchText('')}
            />
          }
          onChange={handleSearch}
        />
      </form>
      {pathname !== '/search' &&
      !hideDropdown &&
      debouncedSearchText.length > 0 ? (
        <div
          className="absolute mt-2 flex w-[94%] max-w-md flex-col"
          ref={dropdownRef}
        >
          <Card className="z-[2] max-h-[80vh] overflow-y-auto py-2">
            {searchUsersLoading ? (
              <div className="space-y-2 px-4 py-2 text-center text-sm font-bold">
                <Spinner size="sm" className="mx-auto" />
                <div>Searching users</div>
              </div>
            ) : (
              <>
                {profiles.map((profile) => (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={profile.id}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => {
                      if (onProfileSelected) {
                        onProfileSelected(profile);
                      }
                      setSearchText('');
                    }}
                  >
                    <UserProfile
                      linkToProfile={!onProfileSelected}
                      profile={profile}
                      showUserPreview={false}
                    />
                  </motion.div>
                ))}
                {profiles.length === 0 ? (
                  <div className="px-4 py-2">No matching users</div>
                ) : null}
              </>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default Search;
