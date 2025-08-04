import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  DocumentIcon,
  Cog6ToothIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { useAppContext } from '@/context/AppContext';
import { PersianButton } from '@/components/ui/PersianButton';
import { strings } from '@/utils/strings';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: strings.chatAgent, href: '/chat', icon: ChatBubbleLeftRightIcon },
  { name: strings.tasks, href: '/tasks', icon: CheckCircleIcon },
  { name: strings.files, href: '/files', icon: DocumentIcon },
  { name: strings.settings, href: '/settings', icon: Cog6ToothIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useAppContext();
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-64 bg-sidebar border-l border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          state.sidebarCollapsed && 'lg:w-16'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            {!state.sidebarCollapsed && (
              <h2 className="text-lg font-semibold text-sidebar-foreground font-vazir">
                منو
              </h2>
            )}
            
            <div className="flex items-center space-x-2 space-x-reverse">
              {/* Desktop collapse toggle */}
              <PersianButton
                variant="ghost"
                size="icon"
                onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                className="hidden lg:flex"
              >
                <Bars3Icon className="h-5 w-5" />
              </PersianButton>
              
              {/* Mobile close button */}
              <PersianButton
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="lg:hidden"
              >
                <XMarkIcon className="h-5 w-5" />
              </PersianButton>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      state.sidebarCollapsed && 'justify-center'
                    )
                  }
                >
                  <item.icon
                    className={cn(
                      'flex-shrink-0 h-5 w-5',
                      !state.sidebarCollapsed && 'ml-3'
                    )}
                  />
                  {!state.sidebarCollapsed && (
                    <span className="font-vazir">{item.name}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          {!state.sidebarCollapsed && (
            <div className="p-4 border-t border-sidebar-border">
              <div className="text-xs text-sidebar-foreground font-vazir text-center">
                نسخه ۱.۰.۰
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};