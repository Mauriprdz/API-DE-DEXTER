/**
 * DEXTER CASE FILES
 * Author: Mauricio Alejandro Prieto Rodríguez
 * APIs: TVMaze (cast, episodes, franchise search) · Wikipedia REST · Open-Meteo
 */
'use strict';

/* ==========================================================================
   Config
   ========================================================================== */
const SHOW_ID = 161;
const API = {
  cast: `https://api.tvmaze.com/shows/${SHOW_ID}/cast`,
  episodes: `https://api.tvmaze.com/shows/${SHOW_ID}/episodes`,
  show: `https://api.tvmaze.com/shows/${SHOW_ID}`,
  searchShows: (q) => `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`,
  weather: 'https://api.open-meteo.com/v1/forecast?latitude=25.7617&longitude=-80.1918'
    + '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto',
  wiki: (title) => `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`
};

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="#211619"/>
   <path d="M150 120s-48 62-48 100a48 48 0 0 0 96 0c0-38-48-100-48-100z" fill="#e11d2e" opacity=".55"/></svg>`);

const CATEGORIES = {
  police: { label: 'Miami Metro', keys: ['dexter morgan', 'debra', 'batista', 'laguerta', 'masuka', 'doakes', 'quinn', 'harry', 'matthews', 'tucci', 'jamie', 'wright', 'vogel', 'hannah mckay', 'elway', 'angel'] },
  villain: { label: 'Killer / Villain', keys: ['brian moser', 'ice truck', 'trinity', 'arthur mitchell', 'miguel', 'prado', 'travis', 'gellar', 'lila', 'sirko', 'isaak', 'hannah', 'jordan chase', 'tony', 'lundy', 'oliver saxon', 'saxon', 'kurt', 'matthew'] },
  family: { label: 'Family & Friends', keys: ['rita', 'astor', 'cody', 'harrison', 'lumen', 'lumen pierce', 'angela', 'hannah'] }
};
// Explicit overrides for ambiguous names
const OVERRIDES = {
  'dexter morgan': 'police', 'debra morgan': 'police', 'angel batista': 'police', 'maria laguerta': 'police',
  'vince masuka': 'police', 'james doakes': 'police', 'joey quinn': 'police', 'harry morgan': 'family',
  'rita bennett': 'family', 'astor bennett': 'family', 'cody bennett': 'family', 'harrison morgan': 'family',
  'lumen pierce': 'family', 'hannah mckay': 'villain', 'brian moser': 'villain', 'arthur mitchell': 'villain',
  'miguel prado': 'villain', 'travis marshall': 'villain', 'lila tournay': 'villain', 'lila west': 'villain',
  'isaak sirko': 'villain', 'jordan chase': 'villain', 'george lundy': 'villain', 'frank lundy': 'police',
  'jonah mitchell': 'family', 'stan liddy': 'police', 'louis greene': 'police', 'tom matthews': 'police',
  'jamie batista': 'police', 'mike anderson': 'police'
};

/* ==========================================================================
   State
   ========================================================================== */
const state = {
  tab: 'cast',
  query: '',
  category: 'all',
  season: 'all',
  sort: 'default',
  cast: [],
  episodes: [],
  show: null,
  weather: null,
  wiki: {},
  universe: { query: '', items: [], loaded: false, loading: false },
  saved: new Set(JSON.parse(localStorage.getItem('dexter_saved') || '[]')),
  status: { tvmaze: 'loading', wiki: 'loading', meteo: 'loading' }
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
const debounce = (fn, ms = 350) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
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
  setTimeout(() => { el.style.opacity = 0; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 2400);
}

async function api(key, url) {
  const t0 = performance.now();
  setStatus(key, 'loading');
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setStatus(key, 'ok', Math.round(performance.now() - t0));
    return data;
  } catch (err) {
    console.error(`[${key}]`, err);
    setStatus(key, 'fail');
    return null;
  }
}

function setStatus(key, status, ms) {
  state.status[key] = status;
  const li = $(`#status-list [data-api="${key}"]`);
  if (!li) return;
  li.className = status;
  $('em', li).textContent = status === 'ok' ? `${ms} ms` : status === 'fail' ? 'Offline' : '…';
}

function categoryOf(name) {
  const n = norm(name);
  if (OVERRIDES[n]) return OVERRIDES[n];
  for (const [cat, def] of Object.entries(CATEGORIES)) if (def.keys.some((k) => n.includes(k))) return cat;
  return 'other';
}

const categoryLabel = (c) => ({ police: 'Miami Metro', villain: 'Killer / Villain', family: 'Family & Friends', other: 'Supporting' }[c]);

/* WMO weather codes → label + icon */
function wmo(code) {
  if (code === 0) return ['Clear sky', 'fa-sun'];
  if (code <= 2) return ['Partly cloudy', 'fa-cloud-sun'];
  if (code === 3) return ['Overcast', 'fa-cloud'];
  if (code <= 48) return ['Foggy', 'fa-smog'];
  if (code <= 57) return ['Drizzle', 'fa-cloud-rain'];
  if (code <= 67) return ['Rain', 'fa-cloud-showers-heavy'];
  if (code <= 77) return ['Snow', 'fa-snowflake'];
  if (code <= 82) return ['Rain showers', 'fa-cloud-showers-heavy'];
  if (code <= 86) return ['Snow showers', 'fa-snowflake'];
  return ['Thunderstorm', 'fa-bolt'];
}

/* ==========================================================================
   Data loading
   ========================================================================== */
async function loadAll() {
  renderSkeleton();
  const [cast, eps, show, weather, wikiShow, wikiLab] = await Promise.all([
    api('tvmaze', API.cast), api('tvmaze', API.episodes), api('tvmaze', API.show),
    api('meteo', API.weather),
    api('wiki', API.wiki('Dexter_(TV_series)')), api('wiki', API.wiki('Bloodstain_pattern_analysis'))
  ]);
  // TVMaze status is the worst of its three calls
  setStatus('tvmaze', cast && eps && show ? 'ok' : 'fail', 0);
  if (cast && eps && show) { const li = $('#status-list [data-api="tvmaze"] em'); li.textContent = 'Online'; }
  if (wikiShow && wikiLab) $('#status-list [data-api="wiki"] em').textContent = 'Online';
  if (weather) $('#status-list [data-api="meteo"] em').textContent = 'Online';

  state.cast = (cast || []).map((c, i) => ({
    id: `c${c.character.id}`,
    name: c.character.name,
    actor: c.person.name,
    country: c.person.country?.name || '—',
    birthday: c.person.birthday,
    image: https(c.character.image?.original || c.character.image?.medium || c.person.image?.original || c.person.image?.medium),
    actorImage: https(c.person.image?.medium),
    cat: categoryOf(c.character.name),
    order: i,
    url: c.person.url
  }));
  // De-duplicate characters shown more than once in the cast list
  const seen = new Set();
  state.cast = state.cast.filter((c) => !seen.has(c.id) && seen.add(c.id));

  state.episodes = (eps || []).map((e) => ({
    id: `e${e.id}`, name: e.name, season: e.season, number: e.number, airdate: e.airdate,
    runtime: e.runtime, rating: e.rating?.average, image: https(e.image?.original || e.image?.medium),
    summary: stripHtml(e.summary), url: e.url, order: e.id
  }));
  state.show = show;
  state.weather = weather;
  state.wiki = { show: wikiShow, lab: wikiLab };

  updateStats();
  updateWeatherChip();
  buildSeasonFilters();
  render();
}

function updateStats() {
  const counts = { all: state.cast.length, police: 0, villain: 0, family: 0, other: 0 };
  state.cast.forEach((c) => counts[c.cat]++);
  Object.entries(counts).forEach(([k, v]) => { const el = $(`#cnt-${k}`); if (el) el.textContent = v; });

  const rated = state.episodes.filter((e) => e.rating);
  const avg = rated.length ? (rated.reduce((s, e) => s + e.rating, 0) / rated.length).toFixed(1) : '–';
  const seasons = new Set(state.episodes.map((e) => e.season)).size;
  animateCount($('[data-count="characters"]'), state.cast.length);
  animateCount($('[data-count="episodes"]'), state.episodes.length);
  animateCount($('[data-count="seasons"]'), seasons);
  $('[data-count="rating"]').textContent = avg;
  updateSavedBadge();
}

function animateCount(el, to) {
  const start = performance.now(), dur = 900;
  const step = (t) => {
    const p = Math.min((t - start) / dur, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function updateWeatherChip() {
  const chip = $('#weather-chip');
  const cur = state.weather?.current;
  if (!cur) { chip.innerHTML = '<i class="fas fa-triangle-exclamation"></i><span>Weather offline</span>'; return; }
  const [label, icon] = wmo(cur.weather_code);
  chip.innerHTML = `<i class="fas ${icon}"></i><span>Miami ${Math.round(cur.temperature_2m)}°C · ${label}</span>`;
}

function buildSeasonFilters() {
  const seasons = [...new Set(state.episodes.map((e) => e.season))].sort((a, b) => a - b);
  $('#season-filters').innerHTML =
    `<button class="chip active" data-season="all" style="grid-column:1/-1"><span>All seasons</span></button>` +
    seasons.map((s) => `<button class="chip" data-season="${s}">${s}</button>`).join('');
}

/* ==========================================================================
   Filtering, searching, sorting
   ========================================================================== */
function getCast(source = state.cast) {
  const q = norm(state.query.trim());
  let list = source.filter((c) =>
    (state.category === 'all' || c.cat === state.category) &&
    (!q || norm(c.name).includes(q) || norm(c.actor).includes(q) || norm(categoryLabel(c.cat)).includes(q)));
  if (state.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (state.sort === 'actor') list = [...list].sort((a, b) => a.actor.localeCompare(b.actor));
  return list;
}

function getEpisodes(source = state.episodes) {
  const q = norm(state.query.trim());
  let list = source.filter((e) =>
    (state.season === 'all' || String(e.season) === state.season) &&
    (!q || norm(e.name).includes(q) || norm(e.summary).includes(q)));
  if (state.sort === 'rating') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  if (state.sort === 'newest') list = [...list].sort((a, b) => (b.airdate || '').localeCompare(a.airdate || ''));
  return list;
}

/* ==========================================================================
   Rendering
   ========================================================================== */
const TITLES = { cast: 'Cast', episodes: 'Episode guide', universe: 'Franchise universe', lab: 'Forensic lab', saved: 'Saved files' };
const PLACEHOLDERS = {
  cast: 'Search characters or actors…', episodes: 'Search episode titles or plots…',
  universe: 'Search any TV show on TVMaze…', lab: 'Search is disabled in the lab', saved: 'Search your saved files…'
};
const SORTS = {
  cast: [['default', 'Series billing'], ['name', 'Character A–Z'], ['actor', 'Actor A–Z']],
  episodes: [['default', 'Episode order'], ['rating', 'Top rated'], ['newest', 'Newest first']]
};

function render() {
  // Chrome that depends on tab
  $('#view-title').textContent = TITLES[state.tab];
  $('#search').placeholder = PLACEHOLDERS[state.tab];
  $('#search').disabled = state.tab === 'lab';
  $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === state.tab));
  $$('.side-block[data-tabs]').forEach((b) => { b.hidden = !b.dataset.tabs.split(' ').includes(state.tab); });
  const sorts = SORTS[state.tab];
  if (sorts) {
    const sel = $('#sort');
    if (!sorts.some(([v]) => v === state.sort)) state.sort = 'default';
    sel.innerHTML = sorts.map(([v, l]) => `<option value="${v}" ${v === state.sort ? 'selected' : ''}>${l}</option>`).join('');
  }
  renderActiveFilters();

  const map = { cast: renderCast, episodes: renderEpisodes, universe: renderUniverse, lab: renderLab, saved: renderSaved };
  map[state.tab]();
  view.style.animation = 'none'; void view.offsetWidth; view.style.animation = '';
}

function renderActiveFilters() {
  const tags = [];
  if (state.query && state.tab !== 'lab') tags.push(['query', `“${state.query}”`]);
  if (['cast', 'saved'].includes(state.tab) && state.category !== 'all') tags.push(['category', categoryLabel(state.category)]);
  if (state.tab === 'episodes' && state.season !== 'all') tags.push(['season', `Season ${state.season}`]);
  $('#active-filters').innerHTML = tags.map(([k, l]) =>
    `<span class="tag">${esc(l)}<button data-clear="${k}" aria-label="Remove filter ${esc(l)}"><i class="fas fa-xmark"></i></button></span>`).join('');
}

function renderSkeleton() {
  view.innerHTML = `<div class="grid">${'<div class="skeleton"></div>'.repeat(10)}</div>`;
  $('#view-count').textContent = 'Loading…';
}

function emptyState(icon, title, text, withReset = true) {
  return `<div class="empty"><i class="fas ${icon}"></i><h3>${title}</h3><p>${text}</p>
    ${withReset ? '<button class="btn btn-primary" data-action="reset"><i class="fas fa-rotate-left"></i> Reset filters</button>' : ''}</div>`;
}

function errorState() {
  return `<div class="empty"><i class="fas fa-plug-circle-xmark"></i><h3>Connection lost</h3>
    <p>We couldn't reach the data providers. Check your connection and try again.</p>
    <button class="btn btn-primary" data-action="reload"><i class="fas fa-rotate"></i> Try again</button></div>`;
}

const saveBtn = (id) => `<button class="save-btn ${state.saved.has(id) ? 'on' : ''}" data-save="${id}"
  aria-label="${state.saved.has(id) ? 'Remove from saved' : 'Save'}" aria-pressed="${state.saved.has(id)}">
  <i class="${state.saved.has(id) ? 'fas' : 'far'} fa-bookmark"></i></button>`;

function castCard(c, i) {
  return `<article class="card" data-open-cast="${c.id}" style="--i:${Math.min(i, 14)}" tabindex="0">
    <div class="card-media">
      <img src="${esc(c.image || PLACEHOLDER)}" alt="${esc(c.name)}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
      <span class="badge ${c.cat}">${categoryLabel(c.cat)}</span>${saveBtn(c.id)}
    </div>
    <div class="card-body">
      <h3 class="card-title">${highlight(c.name)}</h3>
      <p class="card-sub"><i class="fas fa-clapperboard"></i> ${highlight(c.actor)}</p>
    </div></article>`;
}

function episodeCard(e, i) {
  return `<article class="card" data-open-ep="${e.id}" style="--i:${Math.min(i, 14)}" tabindex="0">
    <div class="card-media landscape">
      <img src="${esc(e.image || PLACEHOLDER)}" alt="${esc(e.name)}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
      <span class="badge code">S${String(e.season).padStart(2, '0')} · E${String(e.number).padStart(2, '0')}</span>${saveBtn(e.id)}
      ${e.rating ? `<span class="rating"><i class="fas fa-star"></i>${e.rating}</span>` : ''}
    </div>
    <div class="card-body">
      <h3 class="card-title">${highlight(e.name)}</h3>
      <p class="card-sub"><i class="far fa-calendar"></i> ${e.airdate || 'TBA'}${e.runtime ? ` · ${e.runtime} min` : ''}</p>
      <p class="card-text">${highlight(e.summary || 'No synopsis available.')}</p>
    </div></article>`;
}

function renderCast() {
  if (!state.cast.length) { view.innerHTML = errorState(); $('#view-count').textContent = 'Offline'; return; }
  const list = getCast();
  $('#view-count').textContent = `${list.length} of ${state.cast.length} characters`;
  view.innerHTML = list.length
    ? `<div class="grid">${list.map(castCard).join('')}</div>`
    : emptyState('fa-user-slash', 'No suspects found', `Nothing matches “${esc(state.query)}” in this category.`);
}

function renderEpisodes() {
  if (!state.episodes.length) { view.innerHTML = errorState(); $('#view-count').textContent = 'Offline'; return; }
  const list = getEpisodes();
  $('#view-count').textContent = `${list.length} of ${state.episodes.length} episodes`;
  view.innerHTML = list.length
    ? `<div class="grid grid-wide">${list.map(episodeCard).join('')}</div>`
    : emptyState('fa-film', 'No episodes found', 'Try a different keyword or season.');
}

function renderSaved() {
  const cast = getCast(state.cast.filter((c) => state.saved.has(c.id)));
  const eps = getEpisodes(state.episodes.filter((e) => state.saved.has(e.id)));
  $('#view-count').textContent = `${cast.length + eps.length} saved`;
  if (!cast.length && !eps.length) {
    view.innerHTML = emptyState('fa-bookmark', 'No saved files yet',
      'Tap the bookmark on any character or episode to keep it here. Your list is stored in this browser.', false);
    return;
  }
  view.innerHTML =
    (cast.length ? `<p class="section-label">Characters (${cast.length})</p><div class="grid">${cast.map(castCard).join('')}</div>` : '') +
    (eps.length ? `<p class="section-label">Episodes (${eps.length})</p><div class="grid grid-wide">${eps.map(episodeCard).join('')}</div>` : '');
}

/* ----- Universe: live TVMaze search ----- */
async function loadUniverse(query) {
  const u = state.universe;
  u.loading = true; u.query = query;
  view.innerHTML = `<div class="grid">${'<div class="skeleton"></div>'.repeat(6)}</div>`;
  const data = await api('tvmaze', API.searchShows(query || 'dexter'));
  if (u.query !== query) return; // stale response
  u.loading = false; u.loaded = true;
  let items = (data || []).map((r) => r.show);
  if (!query) items = items.filter((s) => /^dexter(:|$)/i.test(s.name)); // curated franchise view
  u.items = items;
  u.failed = !data;
  if (state.tab === 'universe') renderUniverse();
}

function renderUniverse() {
  const u = state.universe;
  if (!u.loaded || u.query !== state.query.trim()) { loadUniverse(state.query.trim()); return; }
  if (u.failed) { view.innerHTML = errorState(); $('#view-count').textContent = 'Offline'; return; }
  $('#view-count').textContent = state.query ? `${u.items.length} results from TVMaze` : `${u.items.length} franchise titles`;
  if (!u.items.length) { view.innerHTML = emptyState('fa-satellite-dish', 'No shows found', `TVMaze has nothing for “${esc(state.query)}”.`); return; }
  view.innerHTML = `${state.query ? '' : '<p class="section-label">Official Dexter franchise · live from TVMaze</p>'}
    <div class="grid">${u.items.map((s, i) => `
    <a class="card" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" style="--i:${Math.min(i, 14)}">
      <div class="card-media">
        <img src="${esc(https(s.image?.original || s.image?.medium) || PLACEHOLDER)}" alt="${esc(s.name)}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
        <span class="badge ${s.status === 'Running' ? 'police' : 'other'}">${esc(s.status)}</span>
        ${s.rating?.average ? `<span class="rating"><i class="fas fa-star"></i>${s.rating.average}</span>` : ''}
      </div>
      <div class="card-body">
        <h3 class="card-title">${esc(s.name)}</h3>
        <p class="card-sub"><i class="far fa-calendar"></i> ${s.premiered ? s.premiered.slice(0, 4) : 'TBA'}${s.network || s.webChannel ? ` · ${esc((s.network || s.webChannel).name)}` : ''}</p>
        <div class="card-meta">${(s.genres || []).slice(0, 3).map((g) => `<span class="meta">${esc(g)}</span>`).join('')}</div>
      </div></a>`).join('')}</div>`;
}

/* ----- Lab: weather + wikipedia ----- */
function renderLab() {
  $('#view-count').textContent = 'Live data';
  const w = state.weather, cur = w?.current;
  const wiki = state.wiki;
  let weatherHtml;
  if (cur) {
    const [label, icon] = wmo(cur.weather_code);
    const days = w.daily.time.map((d, i) => {
      const date = new Date(d + 'T12:00');
      const [, ic] = wmo(w.daily.weather_code[i]);
      return `<div class="fday">${i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}<i class="fas ${ic}"></i>
        <b>${Math.round(w.daily.temperature_2m_max[i])}°</b> / ${Math.round(w.daily.temperature_2m_min[i])}°</div>`;
    }).join('');
    weatherHtml = `
      <div class="weather-now"><i class="fas ${icon} big-icon"></i>
        <div><div class="temp">${Math.round(cur.temperature_2m)}°C</div><div class="desc">${label} · ${cur.is_day ? 'Daytime' : 'Night'}</div></div></div>
      <div class="mini-stats">
        <div class="mini"><span>Humidity</span><b>${cur.relative_humidity_2m}%</b></div>
        <div class="mini"><span>Wind</span><b>${cur.wind_speed_10m} km/h</b></div>
        <div class="mini"><span>Location</span><b>Miami, FL</b></div>
      </div>
      <div class="forecast">${days}</div>`;
  } else weatherHtml = '<p class="desc">Weather data is currently unavailable.</p>';

  const wikiBlock = (w, fallback) => w ? `<div class="wiki">
      ${w.thumbnail ? `<img src="${esc(https(w.thumbnail.source))}" alt="${esc(w.title)}" loading="lazy">` : ''}
      <h4>${esc(w.title)}</h4><p>${esc(w.extract)}</p>
      <a href="${esc(w.content_urls?.desktop?.page || '#')}" target="_blank" rel="noopener noreferrer">Read on Wikipedia <i class="fas fa-arrow-up-right-from-square"></i></a>
    </div>` : `<p class="desc">${fallback}</p>`;

  const show = state.show;
  const showMeta = show ? `<div class="mini-stats">
      <div class="mini"><span>Premiered</span><b>${esc(show.premiered?.slice(0, 4) || '–')}</b></div>
      <div class="mini"><span>Network</span><b>${esc(show.network?.name || '–')}</b></div>
      <div class="mini"><span>TVMaze rating</span><b>${show.rating?.average ?? '–'}</b></div></div>` : '';

  view.innerHTML = `<div class="lab">
    <section class="panel"><div class="panel-head"><h3><i class="fas fa-cloud-sun" style="color:var(--teal)"></i> Miami weather</h3><span class="api-tag">Open-Meteo</span></div>${weatherHtml}</section>
    <section class="panel"><div class="panel-head"><h3><i class="fas fa-tv" style="color:var(--red)"></i> The series</h3><span class="api-tag">Wikipedia + TVMaze</span></div>${showMeta}${wikiBlock(wiki.show, 'Article unavailable.')}</section>
    <section class="panel full"><div class="panel-head"><h3><i class="fas fa-droplet" style="color:var(--red)"></i> Dexter's craft: blood-spatter analysis</h3><span class="api-tag">Wikipedia</span></div>${wikiBlock(wiki.lab, 'Article unavailable.')}</section>
  </div>`;
}

/* ==========================================================================
   Modal
   ========================================================================== */
let lastFocus = null;
function openModal(html) {
  lastFocus = document.activeElement;
  $('#modal-card').innerHTML = `<button class="icon-btn modal-close" data-action="close-modal" aria-label="Close"><i class="fas fa-xmark"></i></button>${html}`;
  $('#modal').hidden = false;
  document.body.style.overflow = 'hidden';
  $('.modal-close').focus();
}
function closeModal() {
  $('#modal').hidden = true;
  document.body.style.overflow = '';
  lastFocus?.focus?.();
}

function openCast(id) {
  const c = state.cast.find((x) => x.id === id); if (!c) return;
  const age = c.birthday ? Math.floor((Date.now() - new Date(c.birthday)) / 31557600000) : null;
  openModal(`<div class="dossier">
    <img src="${esc(c.image || PLACEHOLDER)}" alt="${esc(c.name)}" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
    <div class="dossier-info">
      <span class="file-no">CASE FILE · MMPD-${String(c.order + 1).padStart(3, '0')}</span>
      <h3 id="modal-title">${esc(c.name)}</h3>
      <dl><dt>Played by</dt><dd>${esc(c.actor)}</dd>
          <dt>Category</dt><dd>${categoryLabel(c.cat)}</dd>
          <dt>Actor origin</dt><dd>${esc(c.country)}</dd>
          ${age ? `<dt>Actor age</dt><dd>${age} years</dd>` : ''}
          <dt>Billing</dt><dd>#${c.order + 1} in the cast list</dd></dl>
      <p>${esc(c.name)} appears in <em>Dexter</em>, portrayed by ${esc(c.actor)}. Data provided by TVMaze.</p>
      <div class="dossier-actions">
        <button class="btn btn-primary" data-save="${c.id}" data-modal-save><i class="${state.saved.has(c.id) ? 'fas' : 'far'} fa-bookmark"></i> ${state.saved.has(c.id) ? 'Saved' : 'Save file'}</button>
        <a class="btn btn-ghost" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">Actor profile <i class="fas fa-arrow-up-right-from-square"></i></a>
      </div></div></div>`);
}

function openEpisode(id) {
  const e = state.episodes.find((x) => x.id === id); if (!e) return;
  openModal(`<div class="dossier">
    <img src="${esc(e.image || PLACEHOLDER)}" alt="${esc(e.name)}" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
    <div class="dossier-info">
      <span class="file-no">SEASON ${e.season} · EPISODE ${e.number}</span>
      <h3 id="modal-title">${esc(e.name)}</h3>
      <dl><dt>Aired</dt><dd>${e.airdate || 'TBA'}</dd>
          <dt>Runtime</dt><dd>${e.runtime ? e.runtime + ' min' : '–'}</dd>
          <dt>Rating</dt><dd>${e.rating ? '★ ' + e.rating + ' / 10' : 'Not rated'}</dd></dl>
      <p>${esc(e.summary || 'No synopsis available.')}</p>
      <div class="dossier-actions">
        <button class="btn btn-primary" data-save="${e.id}" data-modal-save><i class="${state.saved.has(e.id) ? 'fas' : 'far'} fa-bookmark"></i> ${state.saved.has(e.id) ? 'Saved' : 'Save episode'}</button>
        <a class="btn btn-ghost" href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">View on TVMaze <i class="fas fa-arrow-up-right-from-square"></i></a>
      </div></div></div>`);
}

/* ==========================================================================
   Saved items
   ========================================================================== */
function toggleSave(id) {
  const adding = !state.saved.has(id);
  adding ? state.saved.add(id) : state.saved.delete(id);
  localStorage.setItem('dexter_saved', JSON.stringify([...state.saved]));
  updateSavedBadge();
  toast(adding ? 'Added to saved files' : 'Removed from saved files', adding ? 'fa-bookmark' : 'fa-trash');
  if (!$('#modal').hidden) {
    $$('[data-modal-save]').forEach((b) => {
      b.innerHTML = `<i class="${adding ? 'fas' : 'far'} fa-bookmark"></i> ${adding ? 'Saved' : 'Save file'}`;
    });
  }
  if (state.tab === 'saved') render(); else $$(`.save-btn[data-save="${id}"]`).forEach((b) => {
    b.classList.toggle('on', adding); b.setAttribute('aria-pressed', adding);
    b.innerHTML = `<i class="${adding ? 'fas' : 'far'} fa-bookmark"></i>`;
  });
}

function updateSavedBadge() {
  const b = $('#saved-badge');
  b.textContent = state.saved.size;
  b.classList.toggle('show', state.saved.size > 0);
}

/* ==========================================================================
   Navigation & events
   ========================================================================== */
function setTab(tab, push = true) {
  if (!TITLES[tab]) tab = 'cast';
  state.tab = tab;
  if (push) history.replaceState(null, '', `#${tab}`);
  closeSidebar();
  render();
}

function resetFilters() {
  state.query = ''; state.category = 'all'; state.season = 'all'; state.sort = 'default';
  $('#search').value = ''; $('#search-clear').hidden = true;
  $$('#category-filters .chip').forEach((c) => c.classList.toggle('active', c.dataset.cat === 'all'));
  $$('#season-filters .chip').forEach((c) => c.classList.toggle('active', c.dataset.season === 'all'));
  render();
}

const openSidebar = () => { $('#sidebar').classList.add('open'); $('#backdrop').classList.add('show'); };
const closeSidebar = () => { $('#sidebar').classList.remove('open'); $('#backdrop').classList.remove('show'); };

const onSearch = debounce(() => render(), 220);

function bindEvents() {
  $('#tabs').addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (t) setTab(t.dataset.tab); });
  $('#brand-link').addEventListener('click', (e) => { e.preventDefault(); resetFilters(); setTab('cast'); });
  $('#menu-btn').addEventListener('click', openSidebar);
  $('#sidebar-close').addEventListener('click', closeSidebar);
  $('#backdrop').addEventListener('click', closeSidebar);
  $('#reset-btn').addEventListener('click', () => { resetFilters(); toast('Filters reset', 'fa-rotate-left'); });

  $('#search').addEventListener('input', (e) => {
    state.query = e.target.value;
    $('#search-clear').hidden = !state.query;
    onSearch();
  });
  $('#search-clear').addEventListener('click', () => { $('#search').value = ''; state.query = ''; $('#search-clear').hidden = true; render(); $('#search').focus(); });

  $('#category-filters').addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    state.category = b.dataset.cat;
    $$('#category-filters .chip').forEach((c) => c.classList.toggle('active', c === b));
    render();
  });
  $('#season-filters').addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    state.season = b.dataset.season;
    $$('#season-filters .chip').forEach((c) => c.classList.toggle('active', c === b));
    render();
  });
  $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });

  // Delegated clicks for cards / actions
  document.addEventListener('click', (e) => {
    const save = e.target.closest('[data-save]');
    if (save) { e.preventDefault(); e.stopPropagation(); toggleSave(save.dataset.save); return; }
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
      if (k === 'query') { $('#search').value = ''; state.query = ''; $('#search-clear').hidden = true; }
      if (k === 'category') { state.category = 'all'; $$('#category-filters .chip').forEach((c) => c.classList.toggle('active', c.dataset.cat === 'all')); }
      if (k === 'season') { state.season = 'all'; $$('#season-filters .chip').forEach((c) => c.classList.toggle('active', c.dataset.season === 'all')); }
      render(); return;
    }
    const cast = e.target.closest('[data-open-cast]'); if (cast) return openCast(cast.dataset.openCast);
    const ep = e.target.closest('[data-open-ep]'); if (ep) return openEpisode(ep.dataset.openEp);
    if (e.target === $('#modal')) closeModal();
    const link = e.target.closest('.footer a[href^="#"]');
    if (link) { e.preventDefault(); setTab(link.getAttribute('href').slice(1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (!$('#modal').hidden) closeModal(); else closeSidebar(); }
    if (e.key === '/' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); $('#search').focus(); }
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement.classList.contains('card') && !document.activeElement.href) {
      e.preventDefault(); document.activeElement.click();
    }
  });
  window.addEventListener('hashchange', () => setTab(location.hash.slice(1), false));
}

/* ==========================================================================
   Boot
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const initial = location.hash.slice(1);
  if (TITLES[initial]) state.tab = initial;
  bindEvents();
  updateSavedBadge();
  loadAll();
});
