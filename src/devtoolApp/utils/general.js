export const pause = async (timeout) => {
  return new Promise((res) => {
    setTimeout(res, timeout);
  });
};

export const debounce = (func, wait, immediate) => {
  let timeout;
  return function () {
    let context = this,
      args = arguments;
    let later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

export const logIfDev = (...props) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEVTOOL]', ...props);
  }
};

import { minimatch } from 'minimatch';

/**
 * Glob pattern matching using minimatch library
 * Supports * (wildcard), ** (recursive wildcard), and negation with !
 * Supports multiple patterns separated by | (pipe)
 * @param {string} pattern - glob pattern(s), can be separated by |
 * @param {string} str - string to match
 * @returns {boolean} - whether the string matches the pattern
 */
export const globMatch = (pattern, str) => {
  if (!pattern || pattern.trim() === '') return true; // Empty pattern matches everything
  if (!str) return false;
  
  // Split pattern by | to support multiple patterns
  const patterns = pattern.split('|').map(p => p.trim()).filter(p => p);
  
  // If no valid patterns after filtering, match everything
  if (patterns.length === 0) return true;
  
  // Separate positive and negative patterns
  const positivePatterns = [];
  const negativePatterns = [];
  
  patterns.forEach(singlePattern => {
    if (singlePattern.startsWith('!')) {
      negativePatterns.push(singlePattern.slice(1)); // Remove the ! prefix
    } else {
      positivePatterns.push(singlePattern);
    }
  });
  
  // If there are no positive patterns, default to match all
  const hasPositiveMatch = positivePatterns.length === 0 || positivePatterns.some(pattern => {
    try {
      return minimatch(str, pattern, { nocase: true });
    } catch (e) {
      console.warn('[DEVTOOL] Invalid glob pattern:', pattern, e);
      return false;
    }
  });
  
  // If positive patterns don't match, return false
  if (!hasPositiveMatch) return false;
  
  // Check negative patterns - if any negative pattern matches, exclude this item
  const hasNegativeMatch = negativePatterns.some(pattern => {
    try {
      return minimatch(str, pattern, { nocase: true });
    } catch (e) {
      console.warn('[DEVTOOL] Invalid negative glob pattern:', pattern, e);
      return false;
    }
  });
  
  // Return true if positive matches and no negative matches
  return !hasNegativeMatch;
};

/**
 * Storage utilities for URL filter persistence
 */
const URL_FILTER_STORAGE_KEY = 'resources_saver_url_filter';

export const saveUrlFilterToStorage = (filter) => {
  try {
    sessionStorage.setItem(URL_FILTER_STORAGE_KEY, filter || '');
  } catch (e) {
    console.warn('[DEVTOOL] Failed to save URL filter to sessionStorage:', e);
  }
};

export const loadUrlFilterFromStorage = () => {
  try {
    return sessionStorage.getItem(URL_FILTER_STORAGE_KEY) || '';
  } catch (e) {
    console.warn('[DEVTOOL] Failed to load URL filter from sessionStorage:', e);
    return '';
  }
};
