/**
 * DEXTER MIAMI METRO FORENSIC ARCHIVE - CLIENT APPLICATION
 * Desarrollado por: Mauricio Alejandro Prieto Rodriguez
 * Consumo de APIs: TVMaze API, Wikipedia REST API, Open-Meteo Weather API
 */

// Estado global de la aplicación
const AppState = {
  characters: [],
  episodes: [],
  filteredCharacters: [],
  filteredEpisodes: [],
  favorites: JSON.parse(localStorage.getItem('dexter_favorites') || '[]'),
  currentTab: 'characters', // 'characters' | 'episodes' | 'forensics' | 'favorites'
  currentFilter: 'all',     // 'all' | 'police' | 'antagonist' | 'civilian'
  currentSort: 'default',
  currentSeason: 'all',
  searchQuery: '',
  mmpdWeather: null,
  wikiDexter: null,
  wikiForensics: null
};

// Clasificación contextual de personajes de Dexter
const CHARACTER_ROLES = {
  'Dexter Morgan': { role: 'police', label: 'Forense / Asesino', badgeClass: 'badge-forensic' },
  'Debra Morgan': { role: 'police', label: 'Detective MMPD', badgeClass: 'badge-police' },
  'Angel Batista': { role: 'police', label: 'Sargento MMPD', badgeClass: 'badge-police' },
  'Maria LaGuerta': { role: 'police', label: 'Teniente MMPD', badgeClass: 'badge-police' },
  'Vince Masuka': { role: 'police', label: 'Científico Forense', badgeClass: 'badge-police' },
  'James Doakes': { role: 'police', label: 'Sargento MMPD', badgeClass: 'badge-police' },
  'Joey Quinn': { role: 'police', label: 'Detective MMPD', badgeClass: 'badge-police' },
  'Harry Morgan': { role: 'police', label: 'Mentor / Código', badgeClass: 'badge-police' },
  'Rita Bennett': { role: 'civilian', label: 'Familia', badgeClass: 'badge-civilian' },
  'Hannah McKay': { role: 'antagonist', label: 'Envenenadora', badgeClass: 'badge-antagonist' },
  'Arthur Mitchell': { role: 'antagonist', label: 'Trinity Killer', badgeClass: 'badge-antagonist' },
  'Brian Moser': { role: 'antagonist', label: 'Ice Truck Killer', badgeClass: 'badge-antagonist' },
  'Miguel Prado': { role: 'antagonist', label: 'Fiscal / Vigilante', badgeClass: 'badge-antagonist' },
  'Travis Marshall': { role: 'antagonist', label: 'Doomsday Killer', badgeClass: 'badge-antagonist' },
  'Lila West': { role: 'antagonist', label: 'Pirómana', badgeClass: 'badge-antagonist' },
  'Isaak Sirko': { role: 'antagonist', label: 'Líder Koshka', badgeClass: 'badge-antagonist' }
};

// Fallback por si la red falla en el cast
const FALLBACK_CAST = [
  {
    person: { name: 'Michael C. Hall', image: { medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/573/1432542.jpg' } },
    character: { name: 'Dexter Morgan', image: { medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2226.jpg' } }
  },
  {
    person: { name: 'Jennifer Carpenter', image: { medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/576/1440047.jpg' } },
    character: { name: 'Debra Morgan', image: { medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2227.jpg' } }
  },
  {
    person: { name: 'David Zayas', image: { medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/2/7038.jpg' } },
    character: { name: 'Angel Batista', image: { medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2230.jpg' } }
  },
  {
    person: { name: 'James Remar', image: { medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/157/393379.jpg' } },
    character: { name: 'Harry Morgan', image: { medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2228.jpg' } }
  },
  {
    person: { name: 'C.S. Lee', image: { medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/2/7039.jpg' } },
    character: { name: 'Vince Masuka', image: { medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2231.jpg' } }
  },
  {
    person: { name: 'Erik King', image: { medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/2/7041.jpg' } },
    character: { name: 'James Doakes', image: { medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2233.jpg' } }
  }
];

// Inicialización de la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadAllApis();
});

/* ==========================================================================
   CONSUMO DE APIS EXTERNAS (CHECKLIST 2 - REQUISITOS 2 & 5)
   ========================================================================== */

async function loadAllApis() {
  renderLoadingState();
  try {
    // 1. API 1: TVMaze API (Cast de Dexter)
    const castPromise = fetch('https://api.tvmaze.com/shows/161/cast')
      .then(res => res.ok ? res.json() : FALLBACK_CAST)
      .catch(() => FALLBACK_CAST);

    // 2. API 1: TVMaze API (Episodios de Dexter)
    const episodesPromise = fetch('https://api.tvmaze.com/shows/161/episodes')
      .then(res => res.ok ? res.json() : [])
      .catch(() => []);

    // 3. API 2: Open-Meteo Weather API (Clima en Miami Metro Police Dept)
    const weatherPromise = fetch('https://api.open-meteo.com/v1/forecast?latitude=25.7617&longitude=-80.1918&current_weather=true')
      .then(res => res.ok ? res.json() : null)
      .catch(() => null);

    // 4. API 3: Wikipedia REST API (Resumen Oficial de Dexter)
    const wikiDexterPromise = fetch('https://en.wikipedia.org/api/rest_v1/page/summary/Dexter_(TV_series)')
      .then(res => res.ok ? res.json() : null)
      .catch(() => null);

    // 5. API 3: Wikipedia REST API (Forense de Salpicaduras de Sangre)
    const wikiForensicsPromise = fetch('https://en.wikipedia.org/api/rest_v1/page/summary/Bloodstain_pattern_analysis')
      .then(res => res.ok ? res.json() : null)
      .catch(() => null);

    const [castData, episodesData, weatherData, wikiDexterData, wikiForensicsData] = await Promise.all([
      castPromise,
      episodesPromise,
      weatherPromise,
      wikiDexterPromise,
      wikiForensicsPromise
    ]);

    // Procesar datos de Personajes
    AppState.characters = castData.map((item, index) => {
      const charName = item.character ? item.character.name : 'Desconocido';
      const actorName = item.person ? item.person.name : 'Desconocido';
      const roleMeta = CHARACTER_ROLES[charName] || { role: 'civilian', label: 'Reparto', badgeClass: 'badge-civilian' };
      const image = (item.character && item.character.image) 
        ? item.character.image.medium 
        : (item.person && item.person.image ? item.person.image.medium : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400');

      return {
        id: `char-${index + 1}`,
        name: charName,
        actor: actorName,
        role: roleMeta.role,
        roleLabel: roleMeta.label,
        badgeClass: roleMeta.badgeClass,
        image: image,
        details: `${charName} es interpretado por ${actorName} en el departamento de Miami Metro de la serie de drama y suspenso forense.`
      };
    });

    AppState.episodes = episodesData;
    AppState.mmpdWeather = weatherData;
    AppState.wikiDexter = wikiDexterData;
    AppState.wikiForensics = wikiForensicsData;

    updateStatsAndWeatherUI();
    applyFilters();
  } catch (error) {
    console.error('Error cargando APIs:', error);
    showErrorMessage('Ocurrió un error cargando los datos de las APIs externas.');
  }
}

/* ==========================================================================
   ACTUALIZACIÓN DE INTERFAZ & WIDGETS
   ========================================================================== */

function updateStatsAndWeatherUI() {
  // Actualizar conteos del sidebar
  document.getElementById('stat-chars-count').textContent = AppState.characters.length;
  document.getElementById('stat-episodes-count').textContent = AppState.episodes.length;
  document.getElementById('stat-favorites-count').textContent = AppState.favorites.length;

  // Actualizar conteos por categoría en el sidebar
  const policeCount = AppState.characters.filter(c => c.role === 'police').length;
  const antagCount = AppState.characters.filter(c => c.role === 'antagonist').length;
  const civilCount = AppState.characters.filter(c => c.role === 'civilian').length;

  document.getElementById('count-all').textContent = AppState.characters.length;
  document.getElementById('count-police').textContent = policeCount;
  document.getElementById('count-antagonists').textContent = antagCount;
  document.getElementById('count-civilians').textContent = civilCount;

  // Actualizar widget de clima en Miami (Open-Meteo)
  if (AppState.mmpdWeather && AppState.mmpdWeather.current_weather) {
    const temp = Math.round(AppState.mmpdWeather.current_weather.temperature);
    const wind = AppState.mmpdWeather.current_weather.windspeed;
    const isDay = AppState.mmpdWeather.current_weather.is_day;
    const weatherBadge = document.getElementById('navbar-weather-badge');
    if (weatherBadge) {
      weatherBadge.innerHTML = `<i class="fas ${isDay ? 'fa-sun' : 'fa-moon'}"></i> Miami Metro: ${temp}°C | Viento ${wind} km/h`;
    }
  }
}

/* ==========================================================================
   FILTRADO Y BÚSQUEDA (CHECKLIST 2 - REQUISITO 3)
   ========================================================================== */

function applyFilters() {
  const query = AppState.searchQuery.trim().toLowerCase();

  // 1. Filtrar personajes
  AppState.filteredCharacters = AppState.characters.filter(char => {
    const matchesSearch = !query || 
      char.name.toLowerCase().includes(query) || 
      char.actor.toLowerCase().includes(query) ||
      char.roleLabel.toLowerCase().includes(query);

    const matchesRole = AppState.currentFilter === 'all' || char.role === AppState.currentFilter;
    return matchesSearch && matchesRole;
  });

  // Ordenamiento de personajes
  if (AppState.currentSort === 'name-asc') {
    AppState.filteredCharacters.sort((a, b) => a.name.localeCompare(b.name));
  } else if (AppState.currentSort === 'actor-asc') {
    AppState.filteredCharacters.sort((a, b) => a.actor.localeCompare(b.actor));
  }

  // 2. Filtrar episodios
  AppState.filteredEpisodes = AppState.episodes.filter(ep => {
    const matchesSearch = !query || 
      ep.name.toLowerCase().includes(query) || 
      (ep.summary && ep.summary.toLowerCase().includes(query));

    const matchesSeason = AppState.currentSeason === 'all' || ep.season.toString() === AppState.currentSeason;
    return matchesSearch && matchesSeason;
  });

  renderCurrentView();
}

/* ==========================================================================
   RENDERIZADO DE VISTAS (CHECKLIST 1 - REQUISITO 3)
   ========================================================================== */

function renderCurrentView() {
  const container = document.getElementById('main-content-area');
  const resultsCountEl = document.getElementById('results-count-text');
  const activeFilterBadge = document.getElementById('active-filter-badge');

  if (AppState.currentTab === 'characters') {
    activeFilterBadge.textContent = `Filtro: ${getFilterName(AppState.currentFilter)}`;
    resultsCountEl.textContent = `${AppState.filteredCharacters.length} Personajes`;
    renderCharactersGrid(container, AppState.filteredCharacters);
  } else if (AppState.currentTab === 'episodes') {
    activeFilterBadge.textContent = AppState.currentSeason === 'all' ? 'Todas las temporadas' : `Temporada ${AppState.currentSeason}`;
    resultsCountEl.textContent = `${AppState.filteredEpisodes.length} Episodios`;
    renderEpisodesGrid(container, AppState.filteredEpisodes);
  } else if (AppState.currentTab === 'forensics') {
    activeFilterBadge.textContent = 'MMPD Intelligence';
    resultsCountEl.textContent = 'Laboratorio Forense & Clima en Vivo';
    renderForensicsView(container);
  } else if (AppState.currentTab === 'favorites') {
    activeFilterBadge.textContent = 'Mis Casos Guardados';
    const favItems = AppState.characters.filter(c => AppState.favorites.includes(c.id));
    resultsCountEl.textContent = `${favItems.length} Expedientes`;
    renderCharactersGrid(container, favItems, true);
  }
}

// Renderizado de tarjetas de personajes
function renderCharactersGrid(container, list, isFavorites = false) {
  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search-minus"></i>
        <h3>No se encontraron expedientes</h3>
        <p>${AppState.searchQuery ? `No hay coincidencias para "${AppState.searchQuery}". Intenta con otro término o limpia los filtros.` : 'No hay elementos guardados en esta categoría.'}</p>
        <button class="card-action-btn" style="max-width:200px; margin: 1rem auto;" onclick="resetAllFilters()">
          <i class="fas fa-redo"></i> Restablecer Filtros
        </button>
      </div>
    `;
    return;
  }

  const cardsHtml = list.map(char => {
    const isFav = AppState.favorites.includes(char.id);
    return `
      <div class="character-card" data-id="${char.id}">
        <div class="card-image-wrap">
          <img class="card-image" src="${char.image}" alt="${char.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'">
          <span class="card-role-badge ${char.badgeClass}">${char.roleLabel}</span>
          <button class="card-favorite-btn ${isFav ? 'favorited' : ''}" title="${isFav ? 'Quitar de expedientes' : 'Guardar en expedientes'}" onclick="toggleFavorite('${char.id}', event)">
            <i class="${isFav ? 'fas' : 'far'} fa-star"></i>
          </button>
        </div>
        <div class="card-body">
          <h3 class="card-character-name">${char.name}</h3>
          <p class="card-actor-name"><i class="fas fa-user-circle"></i> ${char.actor}</p>
          <p class="card-details">${char.details}</p>
          <div class="card-footer">
            <button class="card-action-btn" onclick="openCharacterModal('${char.id}')">
              <i class="fas fa-folder-open"></i> Ver Expediente
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `<div class="characters-grid">${cardsHtml}</div>`;
}

// Renderizado de episodios
function renderEpisodesGrid(container, list) {
  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-film"></i>
        <h3>No se encontraron episodios</h3>
        <p>No hay episodios que coincidan con la búsqueda actual.</p>
      </div>
    `;
    return;
  }

  const episodesHtml = list.map(ep => {
    const thumb = (ep.image && ep.image.medium) ? ep.image.medium : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400';
    const rating = (ep.rating && ep.rating.average) ? ep.rating.average : '8.2';
    const cleanSummary = ep.summary ? ep.summary.replace(/<[^>]*>?/gm, '') : 'Sin resumen oficial disponible para este episodio.';

    return `
      <div class="episode-card">
        <div class="episode-thumbnail-wrap">
          <img class="episode-thumbnail" src="${thumb}" alt="${ep.name}" loading="lazy">
          <span class="episode-code-badge">T${ep.season} · E${ep.number}</span>
          <span class="episode-rating-badge"><i class="fas fa-star"></i> ${rating}</span>
        </div>
        <div class="episode-card-body">
          <h4 class="episode-title">${ep.name}</h4>
          <p class="episode-airdate"><i class="far fa-calendar-alt"></i> Estreno: ${ep.airdate || '2006-2013'}</p>
          <p class="episode-summary">${cleanSummary}</p>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="episodes-filter-bar">
      <label for="season-select" style="font-size:0.85rem; font-weight:600;"><i class="fas fa-tv"></i> Temporada:</label>
      <select id="season-select" class="sidebar-select" style="max-width:200px;" onchange="handleSeasonChange(this.value)">
        <option value="all" ${AppState.currentSeason === 'all' ? 'selected' : ''}>Todas (1 a 8)</option>
        <option value="1" ${AppState.currentSeason === '1' ? 'selected' : ''}>Temporada 1 (2006)</option>
        <option value="2" ${AppState.currentSeason === '2' ? 'selected' : ''}>Temporada 2 (2007)</option>
        <option value="3" ${AppState.currentSeason === '3' ? 'selected' : ''}>Temporada 3 (2008)</option>
        <option value="4" ${AppState.currentSeason === '4' ? 'selected' : ''}>Temporada 4 (2009 - Trinity)</option>
        <option value="5" ${AppState.currentSeason === '5' ? 'selected' : ''}>Temporada 5 (2010)</option>
        <option value="6" ${AppState.currentSeason === '6' ? 'selected' : ''}>Temporada 6 (2011)</option>
        <option value="7" ${AppState.currentSeason === '7' ? 'selected' : ''}>Temporada 7 (2012)</option>
        <option value="8" ${AppState.currentSeason === '8' ? 'selected' : ''}>Temporada 8 (2013)</option>
      </select>
    </div>
    <div class="episodes-grid">${episodesHtml}</div>
  `;
}

// Renderizado de Laboratorio Forense y Clima MMPD (Open-Meteo & Wikipedia)
function renderForensicsView(container) {
  const weather = AppState.mmpdWeather ? AppState.mmpdWeather.current_weather : { temperature: 27, windspeed: 14, winddirection: 120 };
  const wikiDexter = AppState.wikiDexter || { extract: 'Dexter es una aclamada serie de drama y crimen forense emitida en Showtime centrada en Dexter Morgan, analista de salpicaduras de sangre.' };
  const wikiForensics = AppState.wikiForensics || { extract: 'El análisis de patrones de manchas de sangre es una técnica forense que busca reconstruir crímenes a partir de la física y trayectoria de fluidos.' };

  container.innerHTML = `
    <div class="forensics-view-container">
      <!-- Panel de Clima en Vivo de Miami (Open-Meteo API) -->
      <div class="forensic-panel">
        <div class="forensic-panel-header">
          <h3><i class="fas fa-cloud-sun" style="color:var(--miami-teal);"></i> Clima en Miami Metro HQ</h3>
          <span class="api-pill">Open-Meteo API</span>
        </div>
        <p style="font-size:0.85rem; color:var(--text-muted);">
          Condiciones meteorológicas en tiempo real de la estación de policía de Miami Metro (Lat 25.76°N, Long 80.19°W).
        </p>
        <div class="weather-stats-grid">
          <div class="weather-stat-box">
            <div class="weather-stat-icon"><i class="fas fa-temperature-high"></i></div>
            <div class="weather-stat-info">
              <h5>Temperatura</h5>
              <p>${Math.round(weather.temperature)}°C</p>
            </div>
          </div>
          <div class="weather-stat-box">
            <div class="weather-stat-icon"><i class="fas fa-wind"></i></div>
            <div class="weather-stat-info">
              <h5>Velocidad Viento</h5>
              <p>${weather.windspeed} km/h</p>
            </div>
          </div>
          <div class="weather-stat-box">
            <div class="weather-stat-icon"><i class="fas fa-compass"></i></div>
            <div class="weather-stat-info">
              <h5>Dirección Viento</h5>
              <p>${weather.winddirection}°</p>
            </div>
          </div>
          <div class="weather-stat-box">
            <div class="weather-stat-icon"><i class="fas fa-shield-alt"></i></div>
            <div class="weather-stat-info">
              <h5>Jurisdicción</h5>
              <p>Miami-Dade</p>
            </div>
          </div>
        </div>
        <div style="background:rgba(6,182,212,0.08); border:1px solid rgba(6,182,212,0.25); padding:1rem; border-radius:8px; font-size:0.8rem; color:#7dd3fc;">
          <i class="fas fa-info-circle"></i> Datos satelitales en vivo obtenidos directamente de la API pública de Open-Meteo sin necesidad de clave de acceso.
        </div>
      </div>

      <!-- Panel de Inteligencia de Wikipedia REST API -->
      <div class="forensic-panel">
        <div class="forensic-panel-header">
          <h3><i class="fas fa-dna" style="color:var(--crimson-light);"></i> Archivo Enciclopédico</h3>
          <span class="api-pill">Wikipedia REST API</span>
        </div>
        <div>
          <h4 style="font-size:0.95rem; color:#fff; margin-bottom:0.4rem;"><i class="fas fa-tv"></i> Dexter (Serie de Televisión)</h4>
          <p class="wiki-extract-text">${wikiDexter.extract}</p>
        </div>
        <div style="border-top:1px solid var(--border-subtle); padding-top:1rem;">
          <h4 style="font-size:0.95rem; color:#fff; margin-bottom:0.4rem;"><i class="fas fa-microscope"></i> Análisis de Salpicaduras de Sangre</h4>
          <p class="wiki-extract-text">${wikiForensics.extract}</p>
        </div>
      </div>
    </div>
  `;
}

// Estado de carga inicial
function renderLoadingState() {
  const container = document.getElementById('main-content-area');
  container.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <h3>Consultando Bases de Datos de Miami Metro...</h3>
      <p>Cargando información desde TVMaze API, Wikipedia REST API y Open-Meteo...</p>
    </div>
  `;
}

function showErrorMessage(msg) {
  const container = document.getElementById('main-content-area');
  container.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Fallo de Conexión</h3>
      <p>${msg}</p>
      <button class="card-action-btn" style="max-width:200px; margin: 1rem auto;" onclick="loadAllApis()">
        <i class="fas fa-sync"></i> Reintentar
      </button>
    </div>
  `;
}

/* ==========================================================================
   MODAL INTERACTIVO DE PERSONAJE
   ========================================================================== */

function openCharacterModal(id) {
  const char = AppState.characters.find(c => c.id === id);
  if (!char) return;

  const modal = document.getElementById('character-modal');
  document.getElementById('modal-char-name').textContent = char.name;
  document.getElementById('modal-char-actor').textContent = char.actor;
  document.getElementById('modal-char-role').textContent = char.roleLabel;
  document.getElementById('modal-char-image').src = char.image;
  document.getElementById('modal-char-desc').textContent = `${char.name} es uno de los personajes centrales del universo de Dexter. Interpretado con gran maestría por ${char.actor}. Presente en el laboratorio forense y en los expedientes criminales del Departamento de Policía de Miami Metro.`;
  document.getElementById('modal-char-id').textContent = `MMPD-CASE-${char.id.toUpperCase()}`;

  modal.classList.add('active');
}

function closeCharacterModal() {
  const modal = document.getElementById('character-modal');
  modal.classList.remove('active');
}

/* ==========================================================================
   FAVORITOS (EXPEDIENTES GUARDADOS - LOCALSTORAGE)
   ========================================================================== */

function toggleFavorite(id, event) {
  if (event) event.stopPropagation();

  const idx = AppState.favorites.indexOf(id);
  if (idx > -1) {
    AppState.favorites.splice(idx, 1);
  } else {
    AppState.favorites.push(id);
  }

  localStorage.setItem('dexter_favorites', JSON.stringify(AppState.favorites));
  updateStatsAndWeatherUI();
  renderCurrentView();
}

/* ==========================================================================
   EVENT LISTENERS Y NAVEGACIÓN
   ========================================================================== */

function setupEventListeners() {
  // Búsqueda en Navbar
  const searchInput = document.getElementById('nav-search');
  const clearBtn = document.getElementById('clear-search');

  searchInput.addEventListener('input', (e) => {
    AppState.searchQuery = e.target.value;
    clearBtn.style.display = AppState.searchQuery ? 'block' : 'none';
    applyFilters();
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    AppState.searchQuery = '';
    clearBtn.style.display = 'none';
    applyFilters();
    searchInput.focus();
  });

  // Pestañas del Navbar
  document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.currentTab = btn.getAttribute('data-tab');
      renderCurrentView();
    });
  });

  // Filtros del Sidebar
  document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.currentFilter = btn.getAttribute('data-filter');
      // Asegurarse de que esté en la pestaña de personajes
      if (AppState.currentTab !== 'characters') {
        switchTab('characters');
      } else {
        applyFilters();
      }
    });
  });

  // Ordenamiento en Sidebar
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      AppState.currentSort = e.target.value;
      applyFilters();
    });
  }

  // Toggle de sidebar en móvil
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Cerrar modal al dar click fuera o en botón cerrar
  const modal = document.getElementById('character-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCharacterModal();
    });
  }
}

function handleSeasonChange(val) {
  AppState.currentSeason = val;
  applyFilters();
}

function switchTab(tabName) {
  AppState.currentTab = tabName;
  document.querySelectorAll('.nav-btn').forEach(b => {
    if (b.getAttribute('data-tab') === tabName) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  renderCurrentView();
}

function resetAllFilters() {
  AppState.searchQuery = '';
  AppState.currentFilter = 'all';
  AppState.currentSort = 'default';
  AppState.currentSeason = 'all';

  document.getElementById('nav-search').value = '';
  document.getElementById('clear-search').style.display = 'none';
  document.getElementById('sort-select').value = 'default';

  document.querySelectorAll('.filter-btn').forEach(b => {
    if (b.getAttribute('data-filter') === 'all') {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  switchTab('characters');
  applyFilters();
}

function getFilterName(f) {
  switch (f) {
    case 'police': return 'Miami Metro Police';
    case 'antagonist': return 'Asesinos & Antagonistas';
    case 'civilian': return 'Civiles & Familia';
    default: return 'Todos los Personajes';
  }
}
