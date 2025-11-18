import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ThemeService extends Service {
  @tracked isDarkMode = false;

  constructor() {
    super(...arguments);
    this.loadTheme();
  }

  loadTheme() {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      // Default to system preference
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    this.applyTheme();
  }

  applyTheme() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  @action
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  @action
  setTheme(theme) {
    this.isDarkMode = theme === 'dark';
    localStorage.setItem('theme', theme);
    this.applyTheme();
  }
}
