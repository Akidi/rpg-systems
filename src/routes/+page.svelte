<!-- src/routes/+page.svelte -->
<script lang="ts">
  // Demo data for showcasing the themes
  const calculatorLinks = [
    { href: '/demo/system/enhancements', name: 'Enhancement Calculator', icon: '✨' },
    { href: '/demo/system/currency', name: 'Currency System', icon: '💰' },
    { href: '/demo/system/ap-progression', name: 'AP Progression', icon: '⚡' },
    { href: '/demo/system/turn-system', name: 'Turn System', icon: '🎯' },
    { href: '/demo/system/formula-planner', name: 'Formula Planner', icon: '📊' },
    { href: '/demo/system/skill-planner', name: 'Skill Planner', icon: '' }
  ];
  
  const features = [
    {
      title: 'Turn-Based Combat',
      description: 'Strategic Action Point system with Focus and Enhancement mechanics',
      icon: '⚔️'
    },
    {
      title: 'Progressive Skills',
      description: 'Deep character customization with class specializations',
      icon: '📈'
    },
    {
      title: 'Loot & Equipment',
      description: 'Extensive gear system with set bonuses and rare items',
      icon: '🎒'
    },
    {
      title: 'Ascension System',
      description: 'Meta-progression that unlocks new content and bonuses',
      icon: '🔄'
    },
    {
      title: 'Skill Planner',
      description: 'Plan out skill bonuses and costs.',
      icon: ' '
    }
  ];
</script>

<div class="home-page">
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <h1 class="hero-title">
        Welcome to the Dungeon
        <span class="hero-subtitle">Turn-Based RPG Adventure</span>
      </h1>
      <p class="hero-description">
        Experience deep tactical combat, character progression, and endless replayability 
        in this web-based dungeon crawler inspired by classic action RPGs.
      </p>
    </div>
  </section>

  <!-- System Calculators -->
  <section class="calculators-section">
    <h2 class="section-title">
      <span class="title-icon">🧮</span>
      System Calculators
    </h2>
    <div class="calculator-grid">
      {#each calculatorLinks as link}
        <a href={link.href} class="calculator-card">
          <div class="card-icon">{link.icon}</div>
          <div class="card-content">
            <h3 class="card-title">{link.name}</h3>
            <p class="card-description">Test and explore game mechanics</p>
          </div>
        </a>
      {/each}
    </div>
  </section>

  <!-- Features Overview -->
  <section class="features-section">
    <h2 class="section-title">
      <span class="title-icon">🎮</span>
      Core Features
    </h2>
    <div class="features-grid">
      {#each features as feature}
        <div class="feature-card">
          <div class="feature-icon">{feature.icon}</div>
          <div class="feature-content">
            <h3 class="feature-title">{feature.title}</h3>
            <p class="feature-description">{feature.description}</p>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- RPG Stats Demo -->
  <section class="demo-section">
    <h2 class="section-title">
      <span class="title-icon">📊</span>
      Theme Preview
    </h2>
    <div class="demo-content">
      <div class="stat-bars">
        <div class="stat-bar">
          <div class="stat-label">Health</div>
          <div class="bar-container">
            <div class="health-bar" style="width: 75%"></div>
          </div>
          <span class="stat-value">750/1000</span>
        </div>
        
        <div class="stat-bar">
          <div class="stat-label">Mana</div>
          <div class="bar-container">
            <div class="mana-bar" style="width: 60%"></div>
          </div>
          <span class="stat-value">300/500</span>
        </div>
        
        <div class="stat-bar">
          <div class="stat-label">Experience</div>
          <div class="bar-container">
            <div class="exp-bar" style="width: 40%"></div>
          </div>
          <span class="stat-value">2,400/6,000</span>
        </div>
      </div>
      
      <div class="rarity-demo">
        <h4 class="demo-subtitle">Item Rarity Colors</h4>
        <div class="rarity-items">
          <span class="rarity-common">Common Item</span>
          <span class="rarity-uncommon">Uncommon Item</span>
          <span class="rarity-rare">Rare Item</span>
          <span class="rarity-epic">Epic Item</span>
          <span class="rarity-legendary">Legendary Item</span>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .home-page {
    max-width: none;
    padding: 0;
  }

  /* Hero Section */
  .hero {
    background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
    padding: 4rem 2rem;
    text-align: center;
    border-bottom: 2px solid var(--border-primary);
  }

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .hero-title {
    font-size: 3rem;
    font-weight: 800;
    margin: 0 0 1rem 0;
    color: var(--color-primary);
    line-height: 1.2;
  }

  .hero-subtitle {
    display: block;
    font-size: 1.5rem;
    font-weight: 400;
    color: var(--color-secondary);
    margin-top: 0.5rem;
  }

  .hero-description {
    font-size: 1.125rem;
    line-height: 1.6;
    color: var(--text-secondary);
    margin: 0;
    max-width: 600px;
    margin: 0 auto;
  }

  /* Sections */
  section {
    padding: 3rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 2rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .title-icon {
    font-size: 2.5rem;
  }

  /* Calculator Grid */
  .calculator-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .calculator-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    transition: var(--transition-theme);
    box-shadow: 0 2px 4px var(--shadow-light);
  }

  .calculator-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px var(--shadow-medium);
    border-color: var(--color-primary);
  }

  .card-icon {
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background-color: var(--bg-tertiary);
    border-radius: 50%;
    flex-shrink: 0;
  }

  .card-content {
    flex: 1;
  }

  .card-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .card-description {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  /* Features Grid */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .feature-card {
    padding: 2rem;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    text-align: center;
    transition: var(--transition-theme);
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .feature-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 1rem 0;
  }

  .feature-description {
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
  }

  /* Demo Section */
  .demo-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: start;
  }

  .stat-bars {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .stat-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .stat-label {
    font-weight: 600;
    min-width: 80px;
    color: var(--text-primary);
  }

  .bar-container {
    flex: 1;
    height: 24px;
    background-color: var(--bg-tertiary);
    border-radius: 12px;
    border: 1px solid var(--border-primary);
    overflow: hidden;
    position: relative;
  }

  .bar-container > div {
    height: 100%;
    border-radius: 12px;
    transition: width 0.3s ease;
  }

  .stat-value {
    font-weight: 600;
    min-width: 80px;
    text-align: right;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .rarity-demo {
    padding: 2rem;
    background-color: var(--bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--border-primary);
  }

  .demo-subtitle {
    margin: 0 0 1.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .rarity-items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .rarity-items span {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-primary);
    font-weight: 600;
    transition: var(--transition-theme);
  }

  .rarity-items span:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 4px var(--shadow-light);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .hero {
      padding: 2rem 1rem;
    }
    
    .hero-title {
      font-size: 2rem;
    }
    
    .hero-subtitle {
      font-size: 1.125rem;
    }
    
    section {
      padding: 2rem 1rem;
    }
    
    .section-title {
      font-size: 1.5rem;
    }
    
    .calculator-grid {
      grid-template-columns: 1fr;
    }
    
    .features-grid {
      grid-template-columns: 1fr;
    }
    
    .demo-content {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    
    .stat-bar {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }
    
    .stat-label,
    .stat-value {
      min-width: auto;
      text-align: left;
    }
  }

  @media (max-width: 480px) {
    .hero-title {
      font-size: 1.75rem;
    }
    
    .calculator-card {
      padding: 1rem;
    }
    
    .card-icon {
      width: 48px;
      height: 48px;
      font-size: 1.5rem;
    }
    
    .feature-card {
      padding: 1.5rem;
    }
  }
</style>