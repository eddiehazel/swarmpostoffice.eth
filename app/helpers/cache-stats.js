import { helper } from '@ember/component/helper';
import { service } from '@ember/service';

/**
 * Helper to get cache statistics for debugging
 * Usage: {{cache-stats}}
 */
export default helper(function cacheStats(params, hash) {
  // This helper is primarily for debugging in the console
  // To use: Open browser console and type: window.getCacheStats()
  if (typeof window !== 'undefined') {
    window.getCacheStats = function () {
      const container = document.querySelector('.ember-application');
      if (container) {
        const appInstance = container.__container__;
        if (appInstance) {
          const cacheService = appInstance.lookup('service:etherscan-cache');
          return cacheService.getCacheStats();
        }
      }
      return null;
    };
  }

  return '';
});
