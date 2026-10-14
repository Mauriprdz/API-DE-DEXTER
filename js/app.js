/**
 * DEXTER CASE FILES — MIAMI METRO ARCHIVE
 * Author: Mauricio Alejandro Prieto Rodríguez (8vo Cuatrimestre)
 * External API: TVMaze Public REST API (Cast, Episodes, Franchise Universe, Live Show Search)
 */
'use strict';

/* ==========================================================================
   API Configuration (TVMaze REST API)
   ========================================================================== */
const SHOW_ID = 161; // Dexter main show ID on TVMaze
const API = {
  cast: `https://api.tvmaze.com/shows/${SHOW_ID}/cast`,
  episodes: `https://api.tvmaze.com/shows/${SHOW_ID}/episodes`,
  show: `https://api.tvmaze.com/shows/${SHOW_ID}`,
  searchShows: (q) => `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`
};

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="#211619"/>
   <path d="M150 120s-48 62-48 100a48 48 0 0 0 96 0c0-38-48-100-48-100z" fill="#e11d2e" opacity=".55"/></svg>`);

/* ==========================================================================
   Iconic Dexter Antagonists & Guest Stars Roster (TVMaze Profiles)
   Enriches TVMaze main cast with the legendary killers, villains & key associates
   ========================================================================== */
const SPECIAL_CHARACTERS = [
  // --- KILLERS & VILLAINS ---
  {
    id: 'c-trinity',
    name: 'Arthur Mitchell (Trinity Killer)',
    actor: 'John Lithgow',
    country: 'United States',
    birthday: '1945-10-19',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/229/573959.jpg',
    cat: 'villain',
    roleLabel: 'The Trinity Killer',
    bio: 'A seemingly unassuming church deacon and family man who secretly operated for over 30 years as the United States’ most prolific serial killer, murdering victims in ritualistic cycles of four.',
    url: 'https://www.tvmaze.com/people/1474/john-lithgow'
  },
  {
    id: 'c-icetruck',
    name: 'Brian Moser (Ice Truck Killer)',
    actor: 'Christian Camargo',
    country: 'United States',
    birthday: '1971-07-07',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/10/25078.jpg',
    cat: 'villain',
    roleLabel: 'Ice Truck Killer',
    bio: 'Dexter Morgan’s biological older brother who shared his childhood trauma in the shipping container. Posing as prosthetist Rudy Cooper, he targeted women and drained them of blood to leave cryptic clues for Dexter.',
    url: 'https://www.tvmaze.com/people/15830/christian-camargo'
  },
  {
    id: 'c-miguel',
    name: 'Miguel Prado',
    actor: 'Jimmy Smits',
    country: 'United States',
    birthday: '1955-07-09',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/3/9681.jpg',
    cat: 'villain',
    roleLabel: 'Corrupt Assistant D.A.',
    bio: 'Charismatic and powerful Assistant District Attorney of Miami-Dade County. After bonding with Dexter over the murder of his brother, he attempted to adopt Dexter’s code before his own ambitions took over.',
    url: 'https://www.tvmaze.com/people/4499/jimmy-smits'
  },
  {
    id: 'c-doomsday',
    name: 'Travis Marshall (Doomsday Killer)',
    actor: 'Colin Hanks',
    country: 'United States',
    birthday: '1977-11-24',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/44/111009.jpg',
    cat: 'villain',
    roleLabel: 'Doomsday Killer (DDK)',
    bio: 'A deeply troubled art restorer driven by religious apocalyptic hallucinations, staging elaborate and gruesome tableau murders across Miami to usher in the end of the world.',
    url: 'https://www.tvmaze.com/people/3990/colin-hanks'
  },
  {
    id: 'c-jordanchase',
    name: 'Jordan Chase (Eugene Greer)',
    actor: 'Jonny Lee Miller',
    country: 'United Kingdom',
    birthday: '1972-11-15',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/2/7036.jpg',
    cat: 'villain',
    roleLabel: 'Cult Leader & Mastermind',
    bio: 'A renowned public speaker and self-help guru who secretly orchestrated a sadistic ring of predators known as the Barrel Girl Gang, manipulating others into committing crimes.',
    url: 'https://www.tvmaze.com/people/7036/jonny-lee-miller'
  },
  {
    id: 'c-lila',
    name: 'Lila Tournay (Lila West)',
    actor: 'Jaime Murray',
    country: 'United Kingdom',
    birthday: '1976-07-21',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/5/14442.jpg',
    cat: 'villain',
    roleLabel: 'Obsessive Pyromaniac',
    bio: 'An English visual artist and Narcotics Anonymous sponsor who became dangerously infatuated with Dexter’s "dark passenger," using arson and murder to eliminate anyone between them.',
    url: 'https://www.tvmaze.com/people/13019/jaime-murray'
  },
  {
    id: 'c-isaak',
    name: 'Isaak Sirko',
    actor: 'Ray Stevenson',
    country: 'United Kingdom',
    birthday: '1964-05-25',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/30/76800.jpg',
    cat: 'villain',
    roleLabel: 'Koshka Brotherhood Leader',
    bio: 'A high-ranking boss in the Ukrainian mob who arrives in Miami with a relentless, calculated vendetta against Dexter Morgan following the death of his secret lover Viktor.',
    url: 'https://www.tvmaze.com/people/17855/ray-stevenson'
  },
  {
    id: 'c-brainsurgeon',
    name: 'Oliver Saxon (The Brain Surgeon)',
    actor: 'Darri Ingolfsson',
    country: 'Iceland',
    birthday: '1979-12-22',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/27/68832.jpg',
    cat: 'villain',
    roleLabel: 'The Brain Surgeon',
    bio: 'Born Daniel Vogel, the estranged psychopathic son of Dr. Evelyn Vogel. He removes segments of his victims’ brains before sending them as twisted gifts to his mother.',
    url: 'https://www.tvmaze.com/people/30349/darri-ingolfsson'
  },
  {
    id: 'c-kurt',
    name: 'Kurt Caldwell (Runaway Killer)',
    actor: 'Clancy Brown',
    country: 'United States',
    birthday: '1959-01-05',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/1/4096.jpg',
    cat: 'villain',
    roleLabel: 'Iron Lake Predator',
    bio: 'The unofficial mayor of Iron Lake, NY in Dexter: New Blood. A beloved local businessman who concealed an underground bunker where he hunted transient young women with a sniper rifle.',
    url: 'https://www.tvmaze.com/people/3702/clancy-brown'
  },
  {
    id: 'c-skinner',
    name: 'George King (The Skinner)',
    actor: 'Jesse Borrego',
    country: 'United States',
    birthday: '1962-08-01',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/107/269151.jpg',
    cat: 'villain',
    roleLabel: 'The Skinner',
    bio: 'A former Nicaraguan contras operative working as a Miami tree trimmer who skinned victims alive with tree-cutting equipment while interrogating them about Freebo.',
    url: 'https://www.tvmaze.com/people/59230/jesse-borrego'
  },

  // --- OTHERS & ASSOCIATES ---
  {
    id: 'c-lundy',
    name: 'Special Agent Frank Lundy',
    actor: 'Keith Carradine',
    country: 'United States',
    birthday: '1949-08-08',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/4/11832.jpg',
    cat: 'other',
    roleLabel: 'Senior FBI Profiler',
    bio: 'A legendary FBI special agent renowned for hunting high-profile serial killers nationwide, including the Bay Harbor Butcher and the Trinity Killer. He developed a deep romantic bond with Debra Morgan.',
    url: 'https://www.tvmaze.com/people/11693/keith-carradine'
  },
  {
    id: 'c-vogel',
    name: 'Dr. Evelyn Vogel',
    actor: 'Charlotte Rampling',
    country: 'United Kingdom',
    birthday: '1946-02-05',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/38/95648.jpg',
    cat: 'other',
    roleLabel: 'Neuropsychiatrist / Code Architect',
    bio: 'The "Psychopath Whisperer" who helped Harry Morgan formulate the moral code that governed Dexter’s murderous impulses during his adolescence.',
    url: 'https://www.tvmaze.com/people/26912/charlotte-rampling'
  },
  {
    id: 'c-lumen',
    name: 'Lumen Pierce',
    actor: 'Julia Stiles',
    country: 'United States',
    birthday: '1981-03-28',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/204/511993.jpg',
    cat: 'other',
    roleLabel: 'Vengeance Partner & Survivor',
    bio: 'A traumatized victim who escaped Jordan Chase’s sadistic group. She teamed up with Dexter Morgan in Season 5 to systematically eliminate each of her tormentors.',
    url: 'https://www.tvmaze.com/people/18485/julia-stiles'
  },
  {
    id: 'c-anton',
    name: 'Anton Briggs',
    actor: 'David Ramsey',
    country: 'United States',
    birthday: '1971-11-17',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/1376.jpg',
    cat: 'other',
    roleLabel: 'Confidential Informant / Musician',
    bio: 'A local Miami musician working as a confidential informant for Miami Metro Narcotics who was kidnapped and tortured by The Skinner before being saved by Debra Morgan.',
    url: 'https://www.tvmaze.com/people/1376/david-ramsey'
  },
  {
    id: 'c-liddy',
    name: 'Stan Liddy',
    actor: 'Peter Weller',
    country: 'United States',
    birthday: '1947-06-24',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/2/7057.jpg',
    cat: 'other',
    roleLabel: 'Corrupt P.I. / Ex-Narcotics',
    bio: 'A disgraced ex-Miami Metro narcotics cop hired by Joey Quinn to investigate Dexter Morgan, discovering Dexter and Lumen’s clandestine operations before a fatal confrontation.',
    url: 'https://www.tvmaze.com/people/7057/peter-weller'
  },
  {
    id: 'c-zach',
    name: 'Zach Hamilton',
    actor: 'Sam Underwood',
    country: 'United Kingdom',
    birthday: '1987-08-04',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/5/14445.jpg',
    cat: 'other',
    roleLabel: 'Dexter’s Serial Killer Protégé',
    bio: 'A wealthy teenage psychopath whom Dr. Vogel convinced Dexter to mentor under Harry’s Code, marking Dexter’s first attempt to pass on his discipline.',
    url: 'https://www.tvmaze.com/people/14445/sam-underwood'
  }
];

/* ==========================================================================
   Category Mapping for TVMaze regular cast members
   ========================================================================== */
const CHARACTER_CATEGORIES = {
  'Dexter Morgan': 'police',
  'Debra Morgan': 'police',
  'Angel Batista': 'police',
  'Maria LaGuerta': 'police',
  'Vince Masuka': 'police',
  'James Doakes': 'police',
  'Joey Quinn': 'police',
  'Harry Morgan': 'family',
  'Rita Bennett': 'family',
  'Rita Morgan': 'family',
  'Hannah McKay': 'villain',
  'Thomas Matthews': 'police',
  'Tom Matthews': 'police',
  'Jamie Batista': 'other',
  'Mike Anderson': 'police'
};

/* ==========================================================================
   Application State
   ========================================================================== */
const state = {
  tab: 'cast', // 'cast' | 'episodes' | 'universe' | 'saved'
  query: '',
  category: 'all', // 'all' | 'police' | 'villain' | 'family' | 'other'
  season: 'all',
  sort: 'default',
  cast: [],
  episodes: [],
  show: null,
  universe: { query: '', items: [], loaded: false, loading: false },
  saved: new Set(JSON.parse(localStorage.getItem('dexter_saved') || '[]')),
  status: { tvmaze: 'loading' }
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const view = $('#view');

/* ==========================================================================
   Utilities
   ========================================================================== */
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const stripHtml = (html) => html ? new DOMParser().parseFromString(html, 'text/html').body.textContent.trim() : '';
const https = (u) => u ? u.replace(/^http:/, 'https:') : u;
const debounce = (fn, ms = 300) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function highlight(text) {
  const safe = esc(text);
  const q = state.query.trim();
  if (!q || state.tab === 'universe') return safe;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  return safe.replace(re, '<mark>$1</mark>');
}

function toast(msg, icon = 'fa-circle-check') {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<i class="fas ${icon}"></i><span>${esc(msg)}</span>`;
  $('#toasts').appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity .3s';
    setTimeout(() => el.remove(), 300);
  }, 2400);
}

function categoryLabel(c) {
  switch (c) {
    case 'police': return 'Miami Metro';
    case 'villain': return 'Killers & Villains';
    case 'family': return 'Family & Allies';
    case 'other': return 'Others & Associates';
    default: return 'General';
  }
}

/* ==========================================================================
   API Fetching (TVMaze)
   ========================================================================== */
async function loadAll() {
  renderSkeleton();
  const t0 = performance.now();
  setApiStatus('loading', 'Connecting…');

  try {
    const [castData, epsData, showData] = await Promise.all([
      fetch(API.cast).then(r => r.ok ? r.json() : []),
      fetch(API.episodes).then(r => r.ok ? r.json() : []),
      fetch(API.show).then(r => r.ok ? r.json() : null)
    ]);

    const elapsed = Math.round(performance.now() - t0);
    setApiStatus('ok', `Online (${elapsed} ms)`);

    // Process TVMaze Regular Cast
    const regularCast = (castData || []).map((c, i) => {
      const charName = c.character.name;
      const cat = CHARACTER_CATEGORIES[charName] || (norm(charName).includes('morgan') ? 'family' : 'other');
      return {
        id: `c-${c.character.id}`,
        name: charName,
        actor: c.person.name,
        country: c.person.country?.name || 'United States',
        birthday: c.person.birthday,
        image: https(c.character.image?.original || c.character.image?.medium || c.person.image?.medium),
        cat: cat,
        roleLabel: categoryLabel(cat),
        bio: `${charName} is a core character portrayed by ${c.person.name} in the television series Dexter.`,
        order: i,
        url: c.person.url
      };
    });

    // Merge Regular Cast + Enriched Special Roster (Avoid duplicates)
    const seenNames = new Set(regularCast.map(c => norm(c.name)));
    const additional = SPECIAL_CHARACTERS.filter(sc => !seenNames.has(norm(sc.name))).map((sc, idx) => ({
      ...sc,
      order: regularCast.length + idx
    }));

    state.cast = [...regularCast, ...additional];

    // Process Episodes
    state.episodes = (epsData || []).map((e) => ({
      id: `e-${e.id}`,
      name: e.name,
      season: e.season,
      number: e.number,
      airdate: e.airdate,
      runtime: e.runtime,
      rating: e.rating?.average,
      image: https(e.image?.original || e.image?.medium),
      summary: stripHtml(e.summary),
      url: e.url,
      order: e.id
    }));

    state.show = showData;

    updateStats();
    buildSeasonFilters();
    render();
  } catch (err) {
    console.error('[TVMaze API error]:', err);
    setApiStatus('fail', 'Offline');
    view.innerHTML = errorState();
  }
}

function setApiStatus(status, label) {
  state.status.tvmaze = status;
  const li = $(`#status-list [data-api="tvmaze"]`);
  if (!li) return;
  li.className = status;
  $('em', li).textContent = label;
}

function updateStats() {
  const counts = { all: state.cast.length, police: 0, villain: 0, family: 0, other: 0 };
  state.cast.forEach((c) => {
    if (counts[c.cat] !== undefined) counts[c.cat]++;
  });

  Object.entries(counts).forEach(([k, v]) => {
    const el = $(`#cnt-${k}`);
    if (el) el.textContent = v;
  });

  const rated = state.episodes.filter((e) => e.rating);
  const avg = rated.length ? (rated.reduce((s, e) => s + e.rating, 0) / rated.length).toFixed(1) : '8.2';
  const seasons = new Set(state.episodes.map((e) => e.season)).size || 8;

  animateCount($('[data-count="characters"]'), state.cast.length);
  animateCount($('[data-count="episodes"]'), state.episodes.length);
  animateCount($('[data-count="seasons"]'), seasons);
  $('[data-count="rating"]').textContent = `${avg} ★`;

  const recordsEl = $('#records-stat');
  if (recordsEl) recordsEl.textContent = `${state.cast.length + state.episodes.length} items`;

  updateSavedBadge();
}

function animateCount(el, to) {
  if (!el) return;
  const start = performance.now(), dur = 750;
  const step = (t) => {
    const p = Math.min((t - start) / dur, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function buildSeasonFilters() {
  const seasons = [...new Set(state.episodes.map((e) => e.season))].sort((a, b) => a - b);
  const container = $('#season-filters');
  if (!container) return;
  container.innerHTML =
    `<button class="chip active" data-season="all" style="grid-column:1/-1"><span>All Seasons (1–8)</span></button>` +
    seasons.map((s) => `<button class="chip" data-season="${s}">Season ${s}</button>`).join('');
}

/* ==========================================================================
   Filtering, Searching & Sorting
   ========================================================================== */
function getCast(source = state.cast) {
  const q = norm(state.query.trim());
  let list = source.filter((c) => {
    const matchesCategory = (state.category === 'all' || c.cat === state.category);
    const matchesSearch = (!q ||
      norm(c.name).includes(q) ||
      norm(c.actor).includes(q) ||
      norm(c.bio || '').includes(q) ||
      norm(categoryLabel(c.cat)).includes(q)
    );
    return matchesCategory && matchesSearch;
  });

  if (state.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (state.sort === 'actor') list = [...list].sort((a, b) => a.actor.localeCompare(b.actor));
  return list;
}

function getEpisodes(source = state.episodes) {
  const q = norm(state.query.trim());
  let list = source.filter((e) => {
    const matchesSeason = (state.season === 'all' || String(e.season) === state.season);
    const matchesSearch = (!q || norm(e.name).includes(q) || norm(e.summary).includes(q));
    return matchesSeason && matchesSearch;
  });

  if (state.sort === 'rating') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  if (state.sort === 'newest') list = [...list].sort((a, b) => (b.airdate || '').localeCompare(a.airdate || ''));
  return list;
}

/* ==========================================================================
   View Rendering
   ========================================================================== */
const TITLES = {
  cast: 'Cast & Character Dossiers',
  episodes: 'Episode Guide',
  universe: 'Franchise Universe',
  saved: 'Saved Evidence Files'
};

const PLACEHOLDERS = {
  cast: 'Search characters, actors, aliases…',
  episodes: 'Search episode titles, plots, numbers…',
  universe: 'Search any TV series via live TVMaze API…',
  saved: 'Search within your saved files…'
};

const SORTS = {
  cast: [['default', 'Relevance / Billing'], ['name', 'Character Name (A–Z)'], ['actor', 'Actor Name (A–Z)']],
  episodes: [['default', 'Episode Order (Chronological)'], ['rating', 'Highest Rated First'], ['newest', 'Airdate (Newest)']]
};

function render() {
  $('#view-title').textContent = TITLES[state.tab] || 'Investigation Records';
  $('#search').placeholder = PLACEHOLDERS[state.tab] || 'Search…';

  $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === state.tab));
  $$('.side-block[data-tabs]').forEach((b) => {
    b.hidden = !b.dataset.tabs.split(' ').includes(state.tab);
  });

  const sorts = SORTS[state.tab];
  if (sorts) {
    const sel = $('#sort');
    if (!sorts.some(([v]) => v === state.sort)) state.sort = 'default';
    sel.innerHTML = sorts.map(([v, l]) => `<option value="${v}" ${v === state.sort ? 'selected' : ''}>${l}</option>`).join('');
  }

  renderActiveFilters();

  const map = {
    cast: renderCast,
    episodes: renderEpisodes,
    universe: renderUniverse,
    saved: renderSaved
  };

  if (map[state.tab]) map[state.tab]();
  view.style.animation = 'none';
  void view.offsetWidth;
  view.style.animation = '';
}

function renderActiveFilters() {
  const tags = [];
  if (state.query) tags.push(['query', `Query: “${state.query}”`]);
  if (['cast', 'saved'].includes(state.tab) && state.category !== 'all') {
    tags.push(['category', categoryLabel(state.category)]);
  }
  if (state.tab === 'episodes' && state.season !== 'all') {
    tags.push(['season', `Season ${state.season}`]);
  }

  $('#active-filters').innerHTML = tags.map(([k, l]) =>
    `<span class="tag">${esc(l)}<button data-clear="${k}" aria-label="Remove filter ${esc(l)}"><i class="fas fa-xmark"></i></button></span>`
  ).join('');
}

function renderSkeleton() {
  view.innerHTML = `<div class="grid">${'<div class="skeleton"></div>'.repeat(8)}</div>`;
  $('#view-count').textContent = 'Loading records…';
}

function emptyState(icon, title, text, withReset = true) {
  return `
    <div class="empty">
      <i class="fas ${icon}"></i>
      <h3>${title}</h3>
      <p>${text}</p>
      ${withReset ? '<button class="btn btn-primary" data-action="reset"><i class="fas fa-rotate-left"></i> Reset All Filters</button>' : ''}
    </div>
  `;
}

function errorState() {
  return `
    <div class="empty">
      <i class="fas fa-triangle-exclamation" style="color:var(--red);"></i>
      <h3>TVMaze API Connection Error</h3>
      <p>Failed to connect to the public TVMaze REST API. Please check your network connection.</p>
      <button class="btn btn-primary" data-action="reload"><i class="fas fa-rotate"></i> Retry Connection</button>
    </div>
  `;
}

const saveBtn = (id) => `
  <button class="save-btn ${state.saved.has(id) ? 'on' : ''}" data-save="${id}"
    aria-label="${state.saved.has(id) ? 'Remove from saved' : 'Save'}" aria-pressed="${state.saved.has(id)}">
    <i class="${state.saved.has(id) ? 'fas' : 'far'} fa-bookmark"></i>
  </button>
`;

function castCard(c, i) {
  return `
    <article class="card" data-open-cast="${c.id}" style="--i:${Math.min(i, 14)}" tabindex="0">
      <div class="card-media">
        <img src="${esc(c.image || PLACEHOLDER)}" alt="${esc(c.name)}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
        <span class="badge ${c.cat}">${categoryLabel(c.cat)}</span>
        ${saveBtn(c.id)}
      </div>
      <div class="card-body">
        <h3 class="card-title">${highlight(c.name)}</h3>
        <p class="card-sub"><i class="fas fa-user-circle"></i> ${highlight(c.actor)}</p>
        <p class="card-text">${highlight(c.bio || '')}</p>
      </div>
    </article>
  `;
}

function episodeCard(e, i) {
  return `
    <article class="card" data-open-ep="${e.id}" style="--i:${Math.min(i, 14)}" tabindex="0">
      <div class="card-media landscape">
        <img src="${esc(e.image || PLACEHOLDER)}" alt="${esc(e.name)}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
        <span class="badge code">S${String(e.season).padStart(2, '0')} · E${String(e.number).padStart(2, '0')}</span>
        ${saveBtn(e.id)}
        ${e.rating ? `<span class="rating"><i class="fas fa-star"></i>${e.rating}</span>` : ''}
      </div>
      <div class="card-body">
        <h3 class="card-title">${highlight(e.name)}</h3>
        <p class="card-sub"><i class="far fa-calendar"></i> Airdate: ${e.airdate || 'TBA'}${e.runtime ? ` · ${e.runtime} min` : ''}</p>
        <p class="card-text">${highlight(e.summary || 'No synopsis available for this episode.')}</p>
      </div>
    </article>
  `;
}

function renderCast() {
  if (!state.cast.length) {
    view.innerHTML = errorState();
    $('#view-count').textContent = 'No records';
    return;
  }

  const list = getCast();
  $('#view-count').textContent = `${list.length} of ${state.cast.length} characters`;

  view.innerHTML = list.length
    ? `<div class="grid">${list.map(castCard).join('')}</div>`
    : emptyState('fa-user-slash', 'No matching characters found', `No records matched “${esc(state.query)}” under this classification.`);
}

function renderEpisodes() {
  if (!state.episodes.length) {
    view.innerHTML = errorState();
    $('#view-count').textContent = 'No episodes';
    return;
  }

  const list = getEpisodes();
  $('#view-count').textContent = `${list.length} of ${state.episodes.length} episodes`;

  view.innerHTML = list.length
    ? `<div class="grid grid-wide">${list.map(episodeCard).join('')}</div>`
    : emptyState('fa-film', 'No episodes found', 'Try adjusting your search keywords or season selector.');
}

function renderSaved() {
  const cast = getCast(state.cast.filter((c) => state.saved.has(c.id)));
  const eps = getEpisodes(state.episodes.filter((e) => state.saved.has(e.id)));
  $('#view-count').textContent = `${cast.length + eps.length} saved`;

  if (!cast.length && !eps.length) {
    view.innerHTML = emptyState(
      'fa-bookmark',
      'No saved evidence files yet',
      'Tap the bookmark icon on any character dossier or episode to add it to your evidence file. Records persist in your browser.',
      false
    );
    return;
  }

  view.innerHTML =
    (cast.length ? `<p class="section-label">Character Dossiers (${cast.length})</p><div class="grid">${cast.map(castCard).join('')}</div>` : '') +
    (eps.length ? `<p class="section-label">Episodes (${eps.length})</p><div class="grid grid-wide">${eps.map(episodeCard).join('')}</div>` : '');
}

/* ----- Universe: Live TVMaze Search ----- */
async function loadUniverse(query) {
  const u = state.universe;
  u.loading = true;
  u.query = query;
  view.innerHTML = `<div class="grid">${'<div class="skeleton"></div>'.repeat(6)}</div>`;

  try {
    const res = await fetch(API.searchShows(query || 'dexter'));
    if (!res.ok) throw new Error('API error');
    const data = await res.json();

    if (u.query !== query) return; // Stale request protection
    u.loading = false;
    u.loaded = true;

    let items = (data || []).map((r) => r.show);
    if (!query) {
      items = items.filter((s) => /^dexter(:|$|\s)/i.test(s.name));
    }

    u.items = items;
    u.failed = false;
    if (state.tab === 'universe') renderUniverse();
  } catch (e) {
    u.failed = true;
    u.loading = false;
    if (state.tab === 'universe') view.innerHTML = errorState();
  }
}

function renderUniverse() {
  const u = state.universe;
  if (!u.loaded || u.query !== state.query.trim()) {
    loadUniverse(state.query.trim());
    return;
  }

  if (u.failed) {
    view.innerHTML = errorState();
    $('#view-count').textContent = 'API Error';
    return;
  }

  $('#view-count').textContent = state.query ? `${u.items.length} live results from TVMaze` : `${u.items.length} franchise titles`;

  if (!u.items.length) {
    view.innerHTML = emptyState('fa-satellite-dish', 'No titles found on TVMaze', `No series matched “${esc(state.query)}”.`);
    return;
  }

  view.innerHTML = `
    ${state.query ? '' : '<p class="section-label">Dexter Official Franchise Universe · Live via TVMaze API</p>'}
    <div class="grid">
      ${u.items.map((s, i) => `
        <a class="card" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" style="--i:${Math.min(i, 14)}">
          <div class="card-media">
            <img src="${esc(https(s.image?.original || s.image?.medium) || PLACEHOLDER)}" alt="${esc(s.name)}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
            <span class="badge ${s.status === 'Running' ? 'police' : 'other'}">${esc(s.status || 'Status N/A')}</span>
            ${s.rating?.average ? `<span class="rating"><i class="fas fa-star"></i>${s.rating.average}</span>` : ''}
          </div>
          <div class="card-body">
            <h3 class="card-title">${esc(s.name)}</h3>
            <p class="card-sub"><i class="far fa-calendar"></i> ${s.premiered ? s.premiered.slice(0, 4) : 'TBA'}${s.network || s.webChannel ? ` · ${esc((s.network || s.webChannel).name)}` : ''}</p>
            <div class="card-meta">
              ${(s.genres || []).slice(0, 3).map((g) => `<span class="meta">${esc(g)}</span>`).join('')}
            </div>
          </div>
        </a>
      `).join('')}
    </div>
  `;
}

/* ==========================================================================
   Interactive Modals
   ========================================================================== */
let lastFocus = null;

function openModal(html) {
  lastFocus = document.activeElement;
  $('#modal-card').innerHTML = `
    <button class="icon-btn modal-close" data-action="close-modal" aria-label="Close modal">
      <i class="fas fa-xmark"></i>
    </button>
    ${html}
  `;
  $('#modal').hidden = false;
  document.body.style.overflow = 'hidden';
  const closeBtn = $('.modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeModal() {
  $('#modal').hidden = true;
  document.body.style.overflow = '';
  lastFocus?.focus?.();
}

function openCast(id) {
  const c = state.cast.find((x) => x.id === id);
  if (!c) return;

  const age = c.birthday ? Math.floor((Date.now() - new Date(c.birthday)) / 31557600000) : null;

  openModal(`
    <div class="dossier">
      <img src="${esc(c.image || PLACEHOLDER)}" alt="${esc(c.name)}" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
      <div class="dossier-info">
        <span class="file-no">CASE FILE · MMPD-${String(c.order + 1).padStart(3, '0')}</span>
        <h3 id="modal-title">${esc(c.name)}</h3>
        <dl>
          <dt>Actor</dt><dd>${esc(c.actor)}</dd>
          <dt>Classification</dt><dd>${categoryLabel(c.cat)}</dd>
          <dt>Actor Origin</dt><dd>${esc(c.country)}</dd>
          ${age ? `<dt>Actor Age</dt><dd>${age} years old</dd>` : ''}
          <dt>Source</dt><dd>TVMaze Public Database</dd>
        </dl>
        <p>${esc(c.bio || '')}</p>
        <div class="dossier-actions">
          <button class="btn btn-primary" data-save="${c.id}" data-modal-save>
            <i class="${state.saved.has(c.id) ? 'fas' : 'far'} fa-bookmark"></i>
            ${state.saved.has(c.id) ? 'Saved' : 'Save File'}
          </button>
          <a class="btn btn-ghost" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">
            TVMaze Profile <i class="fas fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
    </div>
  `);
}

function openEpisode(id) {
  const e = state.episodes.find((x) => x.id === id);
  if (!e) return;

  openModal(`
    <div class="dossier">
      <img src="${esc(e.image || PLACEHOLDER)}" alt="${esc(e.name)}" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
      <div class="dossier-info">
        <span class="file-no">SEASON ${e.season} · EPISODE ${e.number}</span>
        <h3 id="modal-title">${esc(e.name)}</h3>
        <dl>
          <dt>Airdate</dt><dd>${e.airdate || 'TBA'}</dd>
          <dt>Runtime</dt><dd>${e.runtime ? e.runtime + ' minutes' : 'N/A'}</dd>
          <dt>Rating</dt><dd>${e.rating ? '★ ' + e.rating + ' / 10' : 'Unrated'}</dd>
        </dl>
        <p>${esc(e.summary || 'No synopsis recorded.')}</p>
        <div class="dossier-actions">
          <button class="btn btn-primary" data-save="${e.id}" data-modal-save>
            <i class="${state.saved.has(e.id) ? 'fas' : 'far'} fa-bookmark"></i>
            ${state.saved.has(e.id) ? 'Saved' : 'Save Episode'}
          </button>
          <a class="btn btn-ghost" href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">
            View on TVMaze <i class="fas fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
    </div>
  `);
}

/* ==========================================================================
   Saved Items (LocalStorage)
   ========================================================================== */
function toggleSave(id) {
  const adding = !state.saved.has(id);
  adding ? state.saved.add(id) : state.saved.delete(id);
  localStorage.setItem('dexter_saved', JSON.stringify([...state.saved]));
  updateSavedBadge();
  toast(adding ? 'Added to saved evidence' : 'Removed from saved evidence', adding ? 'fa-bookmark' : 'fa-trash');

  if (!$('#modal').hidden) {
    $$('[data-modal-save]').forEach((b) => {
      b.innerHTML = `<i class="${adding ? 'fas' : 'far'} fa-bookmark"></i> ${adding ? 'Saved' : 'Save File'}`;
    });
  }

  if (state.tab === 'saved') {
    render();
  } else {
    $$(`.save-btn[data-save="${id}"]`).forEach((b) => {
      b.classList.toggle('on', adding);
      b.setAttribute('aria-pressed', adding);
      b.innerHTML = `<i class="${adding ? 'fas' : 'far'} fa-bookmark"></i>`;
    });
  }
}

function updateSavedBadge() {
  const b = $('#saved-badge');
  if (!b) return;
  b.textContent = state.saved.size;
  b.classList.toggle('show', state.saved.size > 0);
}

/* ==========================================================================
   Navigation & Event Handlers
   ========================================================================== */
function setTab(tab, push = true) {
  if (!TITLES[tab]) tab = 'cast';
  state.tab = tab;
  if (push) history.replaceState(null, '', `#${tab}`);
  closeSidebar();
  render();
}

function resetFilters() {
  state.query = '';
  state.category = 'all';
  state.season = 'all';
  state.sort = 'default';

  $('#search').value = '';
  $('#search-clear').hidden = true;

  $$('#category-filters .chip').forEach((c) => c.classList.toggle('active', c.dataset.cat === 'all'));
  $$('#season-filters .chip').forEach((c) => c.classList.toggle('active', c.dataset.season === 'all'));

  render();
}

const openSidebar = () => {
  $('#sidebar').classList.add('open');
  $('#backdrop').classList.add('show');
};

const closeSidebar = () => {
  $('#sidebar').classList.remove('open');
  $('#backdrop').classList.remove('show');
};

const onSearch = debounce(() => render(), 220);

function bindEvents() {
  $('#tabs').addEventListener('click', (e) => {
    const t = e.target.closest('.tab');
    if (t) setTab(t.dataset.tab);
  });

  $('#brand-link').addEventListener('click', (e) => {
    e.preventDefault();
    resetFilters();
    setTab('cast');
  });

  $('#menu-btn').addEventListener('click', openSidebar);
  $('#sidebar-close').addEventListener('click', closeSidebar);
  $('#backdrop').addEventListener('click', closeSidebar);
  $('#reset-btn').addEventListener('click', () => {
    resetFilters();
    toast('All filters reset', 'fa-rotate-left');
  });

  $('#search').addEventListener('input', (e) => {
    state.query = e.target.value;
    $('#search-clear').hidden = !state.query;
    onSearch();
  });

  $('#search-clear').addEventListener('click', () => {
    $('#search').value = '';
    state.query = '';
    $('#search-clear').hidden = true;
    render();
    $('#search').focus();
  });

  $('#category-filters').addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    state.category = b.dataset.cat;
    $$('#category-filters .chip').forEach((c) => c.classList.toggle('active', c === b));
    render();
  });

  $('#season-filters').addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    state.season = b.dataset.season;
    $$('#season-filters .chip').forEach((c) => c.classList.toggle('active', c === b));
    render();
  });

  $('#sort').addEventListener('change', (e) => {
    state.sort = e.target.value;
    render();
  });

  // Delegated clicks
  document.addEventListener('click', (e) => {
    const save = e.target.closest('[data-save]');
    if (save) {
      e.preventDefault();
      e.stopPropagation();
      toggleSave(save.dataset.save);
      return;
    }

    const act = e.target.closest('[data-action]');
    if (act) {
      const a = act.dataset.action;
      if (a === 'reset') resetFilters();
      if (a === 'reload') loadAll();
      if (a === 'close-modal') closeModal();
      return;
    }

    const clr = e.target.closest('[data-clear]');
    if (clr) {
      const k = clr.dataset.clear;
      if (k === 'query') {
        $('#search').value = '';
        state.query = '';
        $('#search-clear').hidden = true;
      }
      if (k === 'category') {
        state.category = 'all';
        $$('#category-filters .chip').forEach((c) => c.classList.toggle('active', c.dataset.cat === 'all'));
      }
      if (k === 'season') {
        state.season = 'all';
        $$('#season-filters .chip').forEach((c) => c.classList.toggle('active', c.dataset.season === 'all'));
      }
      render();
      return;
    }

    const cast = e.target.closest('[data-open-cast]');
    if (cast) return openCast(cast.dataset.openCast);

    const ep = e.target.closest('[data-open-ep]');
    if (ep) return openEpisode(ep.dataset.openEp);

    if (e.target === $('#modal')) closeModal();

    const link = e.target.closest('.footer a[href^="#"]');
    if (link) {
      e.preventDefault();
      setTab(link.getAttribute('href').slice(1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!$('#modal').hidden) closeModal();
      else closeSidebar();
    }
    if (e.key === '/' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      $('#search').focus();
    }
  });

  window.addEventListener('hashchange', () => setTab(location.hash.slice(1), false));
}

/* ==========================================================================
   Boot Application
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const initial = location.hash.slice(1);
  if (TITLES[initial]) state.tab = initial;
  bindEvents();
  updateSavedBadge();
  loadAll();
});
