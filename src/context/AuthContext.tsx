import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole, NotificationItem } from '../types/index.ts';
import { INITIAL_USERS } from '../services/mockData.ts';
import { loginUser, registerUser, fetchNotifications, markAllNotificationsRead } from '../services/api.ts';

interface AuthContextType {
  currentUser: User;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  setCurrentUserByEmail: (email: string) => void;
  login: (email: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
  demoUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('hostelcare_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_USERS[0]; // Default: Student Rahul Verma
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem('hostelcare_active_user', JSON.stringify(currentUser));
    loadNotifications(currentUser.id);
  }, [currentUser]);

  const loadNotifications = async (userId: string) => {
    try {
      const data = await fetchNotifications(userId);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      // ignore
    }
  };

  const switchRole = (newRole: UserRole) => {
    const target = INITIAL_USERS.find((u) => u.role === newRole) || INITIAL_USERS[0];
    setCurrentUser(target);
  };

  const setCurrentUserByEmail = (email: string) => {
    const found = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) setCurrentUser(found);
  };

  const login = async (email: string) => {
    const res = await loginUser(email);
    if (res.user) setCurrentUser(res.user);
  };

  const register = async (payload: any) => {
    const res = await registerUser(payload);
    if (res.user) setCurrentUser(res.user);
  };

  const logout = () => {
    setCurrentUser(INITIAL_USERS[0]);
  };

  const markAllRead = async () => {
    await markAllNotificationsRead(currentUser.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser.role,
        switchRole,
        setCurrentUserByEmail,
        login,
        register,
        logout,
        notifications,
        unreadCount,
        refreshNotifications: () => loadNotifications(currentUser.id),
        markAllRead,
        demoUsers: INITIAL_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
