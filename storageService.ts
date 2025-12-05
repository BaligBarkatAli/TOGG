import { User } from './types';

const USER_KEY = 'togg_current_user';
const HISTORY_KEY = 'togg_user_history';

export const storageService = {
  /**
   * Get the currently logged in user from storage.
   */
  getCurrentUser: (): User | null => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Failed to load user', e);
      return null;
    }
  },

  /**
   * Save the current user to storage (Persist Login).
   */
  saveCurrentUser: (user: User) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user', e);
    }
  },

  /**
   * Remove user from storage (Logout).
   */
  clearCurrentUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get the entire history of users who have logged in.
   */
  getUserHistory: (): User[] => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Add or Update a user in the history log.
   */
  addToHistory: (user: User) => {
    try {
      const history = storageService.getUserHistory();
      // Remove existing entry for this specific user (by email) to avoid duplicates
      const filtered = history.filter(u => u.email !== user.email);
      // Add the updated user object to the top
      const updated = [user, ...filtered];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update history', e);
    }
  }
};