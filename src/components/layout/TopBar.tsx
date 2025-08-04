import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  Bars3Icon, 
  SunIcon, 
  MoonIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { useAppContext } from '@/context/AppContext';
import { PersianButton } from '@/components/ui/PersianButton';
import { strings } from '@/utils/strings';

interface TopBarProps {
  onToggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const { state, dispatch } = useAppContext();

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_AUTHENTICATED', payload: false });
  };

  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: newTheme });
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Right side - Logo and Sidebar Toggle */}
        <div className="flex items-center space-x-4 space-x-reverse">
          <PersianButton
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </PersianButton>
          
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-foreground font-vazir">
              سامانه مدیریت
            </h1>
          </div>
        </div>

        {/* Left side - Theme Toggle and User Menu */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Theme Toggle */}
          <PersianButton
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
          >
            {state.theme === 'light' ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </PersianButton>

          {/* User Menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-2 space-x-reverse text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
              <UserCircleIcon className="h-8 w-8 text-muted-foreground" />
              <span className="hidden md:block font-vazir text-foreground">
                {state.user?.name || state.user?.email}
              </span>
            </Menu.Button>

            <Transition
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute left-0 mt-2 w-48 rounded-md bg-card shadow-lg ring-1 ring-border focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-accent text-accent-foreground' : 'text-foreground'
                        } group flex w-full items-center px-4 py-2 text-sm font-vazir`}
                      >
                        <ArrowRightOnRectangleIcon className="ml-3 h-5 w-5" />
                        {strings.logout}
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};