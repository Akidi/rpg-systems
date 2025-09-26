<!-- src/lib/components/ThemeSwitcher.svelte -->
<script lang="ts">
  import { themeStore, themeActions } from '$lib/stores/themes';
  import { themeConfigs, getAllThemes } from '$lib/config/themes';
  import type { ThemeVariant, ThemeMode } from '$lib/types/layout';
  
  // Get current theme state
  let themeState = $state($themeStore);
  
  // Derived values
  const currentTheme = $derived(themeState.theme);
  const currentMode = $derived(themeState.mode);
  const currentThemeConfig = $derived(themeConfigs[currentTheme]);
  
  // Get available themes
  const availableThemes = getAllThemes();
  
  // Theme change handlers
  const handleThemeChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const newTheme = target.value as ThemeVariant;
    themeActions.setTheme(newTheme);
  };
  
  const handleModeToggle = () => {
    themeActions.toggleMode();
  };
  
  // Icons for light/dark mode
  const modeIcons = {
    light: '☀️',
    dark: '🌙'
  };
  
  // Update local state when store changes
  themeStore.subscribe(value => {
    themeState = value;
  });
</script>

<div class="theme-switcher">
  <div class="theme-controls">
    <!-- Theme Selector -->
    <div class="theme-selector">
      <label for="theme-select" class="theme-label">
        🏰 Theme
      </label>
      <select 
        id="theme-select"
        value={currentTheme}
        onchange={handleThemeChange}
        class="theme-select"
      >
        {#each availableThemes as themeVariant}
          <option value={themeVariant}>
            {themeConfigs[themeVariant].displayName}
          </option>
        {/each}
      </select>
    </div>

    <!-- Mode Toggle -->
    <div class="mode-toggle">
      <button 
        onclick={handleModeToggle}
        class="mode-button"
        title={`Switch to ${currentMode === 'light' ? 'dark' : 'light'} mode`}
      >
        <span class="mode-icon">{modeIcons[currentMode]}</span>
        <span class="mode-text">
          {currentMode === 'light' ? 'Light' : 'Dark'}
        </span>
      </button>
    </div>
  </div>

  <!-- Theme Preview -->
  <div class="theme-preview">
    <div class="preview-info">
      <h4 class="preview-title">{currentThemeConfig.displayName}</h4>
      <p class="preview-description">{currentThemeConfig.description}</p>
    </div>
    
    <div class="preview-colors">
      <div class="color-swatch primary" title="Primary Color"></div>
      <div class="color-swatch secondary" title="Secondary Color"></div>
      <div class="color-swatch accent" title="Accent Color"></div>
    </div>
  </div>
</div>

<style>
  .theme-switcher {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px var(--shadow-light);
    transition: var(--transition-theme);
    max-width: 400px;
  }

  .theme-controls {
    display: flex;
    gap: 1rem;
    align-items: end;
    margin-bottom: 1rem;
  }

  .theme-selector {
    flex: 1;
  }

  .theme-label {
    display: block;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  .theme-select {
    width: 100%;
    padding: 0.75rem;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-primary);
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: var(--transition-theme);
  }

  .theme-select:hover {
    border-color: var(--color-primary);
  }

  .theme-select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(var(--color-primary), 0.2);
  }

  .mode-toggle {
    display: flex;
    flex-direction: column;
  }

  .mode-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background-color: var(--color-primary);
    color: var(--text-inverse);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: var(--transition-theme);
    white-space: nowrap;
  }

  .mode-button:hover {
    background-color: var(--color-primary-hover);
    transform: translateY(-1px);
  }

  .mode-icon {
    font-size: 1.125rem;
  }

  .theme-preview {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: var(--bg-tertiary);
    border-radius: 8px;
    border: 1px solid var(--border-secondary);
  }

  .preview-info {
    flex: 1;
  }

  .preview-title {
    margin: 0 0 0.25rem 0;
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 600;
  }

  .preview-description {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.75rem;
    line-height: 1.4;
  }

  .preview-colors {
    display: flex;
    gap: 0.5rem;
  }

  .color-swatch {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid var(--border-primary);
    cursor: pointer;
    transition: var(--transition-theme);
  }

  .color-swatch:hover {
    transform: scale(1.1);
    border-color: var(--text-primary);
  }

  .color-swatch.primary {
    background-color: var(--color-primary);
  }

  .color-swatch.secondary {
    background-color: var(--color-secondary);
  }

  .color-swatch.accent {
    background-color: var(--color-accent);
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .theme-switcher {
      padding: 1rem;
      max-width: none;
    }
    
    .theme-controls {
      flex-direction: column;
      align-items: stretch;
    }
    
    .theme-preview {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  }
</style>