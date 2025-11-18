import { service } from '@ember/service';
import { on } from '@ember/modifier';

<template>
  {{#let (service "theme") as |themeService|}}
    <button
      type="button"
      class="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
             px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200
             flex items-center gap-2 font-medium text-sm
             hover:scale-105 active:scale-95"
      {{on "click" themeService.toggleTheme}}
      aria-label={{if themeService.isDarkMode "Light Mode" "Dark Mode"}}
    >
      <span class="text-lg">{{if themeService.isDarkMode "☀️" "🌙"}}</span>
      <span class="hidden sm:inline">{{if themeService.isDarkMode "Light Mode" "Dark Mode"}}</span>
    </button>
  {{/let}}
</template>
