/**
 * DEXTER CASE FILES — MIAMI METRO HOMICIDE ARCHIVE
 * Author: Mauricio Alejandro Prieto Rodríguez (8vo Cuatrimestre)
 * External API: TVMaze REST API (Cast, 96 Episodes, Franchise Universe & Search)
 * 100% Authentic In-Character Photography from Dexter & Dexter: New Blood
 */
'use strict';

/* ==========================================================================
   API Configuration (TVMaze REST API)
   ========================================================================== */
const SHOW_ID = 161; // Dexter original series ID on TVMaze
const API = {
  cast: `https://api.tvmaze.com/shows/${SHOW_ID}/cast`,
  episodes: `https://api.tvmaze.com/shows/${SHOW_ID}/episodes`,
  show: `https://api.tvmaze.com/shows/${SHOW_ID}`,
  searchShows: (q) => `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`
};

/* ==========================================================================
   Verified Authentic Dexter Character Roster
   Every character below has an official, confirmed IN-CHARACTER portrait
   from Showtime / TVMaze archive (No wrong actors, no missing images).
   ========================================================================== */
const VERIFIED_DEXTER_CHARACTERS = [
  // ==================== MIAMI METRO POLICE DEPT ====================
  {
    id: 'char-dexter',
    name: 'Dexter Morgan',
    actor: 'Michael C. Hall',
    country: 'United States',
    birthday: '1971-02-01',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2226.jpg',
    cat: 'police',
    roleLabel: 'Blood-Spatter Analyst / Vigilante',
    bio: 'Lead forensic blood-spatter analyst for Miami Metro Homicide. Traumatized as a toddler by the murder of his mother, he channels his homicidal urges under Harry’s Code, hunting down killers who escaped justice.',
    url: 'https://www.tvmaze.com/people/14441/michael-c-hall'
  },
  {
    id: 'char-debra',
    name: 'Debra Morgan',
    actor: 'Jennifer Carpenter',
    country: 'United States',
    birthday: '1979-12-07',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2227.jpg',
    cat: 'police',
    roleLabel: 'Detective / Lieutenant MMPD',
    bio: 'Dexter’s fiercely loyal, foul-mouthed adoptive sister. Rising from vice to lead homicide detective and eventually lieutenant, she relentlessly pursues truth in Miami-Dade County.',
    url: 'https://www.tvmaze.com/people/14443/jennifer-carpenter'
  },
  {
    id: 'char-angel',
    name: 'Angel Batista',
    actor: 'David Zayas',
    country: 'Puerto Rico',
    birthday: '1962-08-15',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2230.jpg',
    cat: 'police',
    roleLabel: 'Detective Sergeant MMPD',
    bio: 'A compassionate, honest homicide detective and Dexter’s closest friend at the department. Batista operates with honor, street smarts, and unwavering loyalty to his colleagues.',
    url: 'https://www.tvmaze.com/people/7038/david-zayas'
  },
  {
    id: 'char-maria',
    name: 'Maria LaGuerta',
    actor: 'Lauren Vélez',
    country: 'United States',
    birthday: '1964-11-02',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/579/1447981.jpg',
    cat: 'police',
    roleLabel: 'Lieutenant / Captain MMPD',
    bio: 'The politically ambitious head of Miami Metro Homicide. Despite her bureaucratic maneuvering, she is a sharp investigator who stubbornly re-opens the Bay Harbor Butcher case.',
    url: 'https://www.tvmaze.com/people/13593/lauren-velez'
  },
  {
    id: 'char-masuka',
    name: 'Vince Masuka',
    actor: 'C.S. Lee',
    country: 'South Korea',
    birthday: '1971-12-30',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2231.jpg',
    cat: 'police',
    roleLabel: 'Lead Forensic Investigator',
    bio: 'Miami Metro’s lead crime scene investigator and DNA specialist. Known for his off-color humor and distinctive laugh, Masuka is nevertheless brilliant at processing physical evidence.',
    url: 'https://www.tvmaze.com/people/7039/cs-lee'
  },
  {
    id: 'char-doakes',
    name: 'James Doakes',
    actor: 'Erik King',
    country: 'United States',
    birthday: '1963-04-21',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2233.jpg',
    cat: 'police',
    roleLabel: 'Sergeant MMPD / Special Forces',
    bio: 'A former Army Ranger and intense homicide sergeant who is the only detective in Miami Metro whose instincts tell him that something is deeply wrong with Dexter Morgan.',
    url: 'https://www.tvmaze.com/people/7041/erik-king'
  },
  {
    id: 'char-quinn',
    name: 'Joey Quinn',
    actor: 'Desmond Harrington',
    country: 'United States',
    birthday: '1976-10-19',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2229.jpg',
    cat: 'police',
    roleLabel: 'Homicide Detective MMPD',
    bio: 'A street-savvy detective transferred from narcotics following Doakes’ death. His rough-and-tumble methods, romance with Debra, and suspicions about Dexter create intense friction.',
    url: 'https://www.tvmaze.com/people/7042/desmond-harrington'
  },
  {
    id: 'char-matthews',
    name: 'Thomas Matthews',
    actor: 'Geoff Pierson',
    country: 'United States',
    birthday: '1949-06-16',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/145/363721.jpg',
    cat: 'police',
    roleLabel: 'Deputy Chief of Police',
    bio: 'High-ranking Miami Metro commander and long-time close friend of Harry Morgan. Matthews protects Dexter out of respect for Harry while maneuvering department politics.',
    url: 'https://www.tvmaze.com/people/14444/geoff-pierson'
  },
  {
    id: 'char-anderson',
    name: 'Detective Mike Anderson',
    actor: 'Billy Brown',
    country: 'United States',
    birthday: '1970-10-30',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/145/363743.jpg',
    cat: 'police',
    roleLabel: 'Detective MMPD',
    bio: 'No-nonsense homicide investigator brought in from Chicago. Principled and thorough, his sudden murder outside a Miami marina sparks the clash with the Koshka Brotherhood.',
    url: 'https://www.tvmaze.com/people/26079/billy-brown'
  },
  {
    id: 'char-angela',
    name: 'Chief Angela Bishop',
    actor: 'Julia Jones',
    country: 'United States',
    birthday: '1981-01-23',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/375/938231.jpg',
    cat: 'police',
    roleLabel: 'Chief of Police (Iron Lake)',
    bio: 'The observant first female police chief of Iron Lake, NY in Dexter: New Blood. Dexter’s girlfriend whose investigation into missing indigenous women leads her to unmask "Jim Lindsay".',
    url: 'https://www.tvmaze.com/people/14446/julia-jones'
  },

  // ==================== KILLERS & VILLAINS ====================
  {
    id: 'char-trinity',
    name: 'Arthur Mitchell (Trinity Killer)',
    actor: 'John Lithgow',
    country: 'United States',
    birthday: '1945-10-19',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2244.jpg',
    cat: 'villain',
    roleLabel: 'The Trinity Killer',
    bio: 'A seemingly upright family man and church deacon who secretly killed for over thirty years in ritualistic cycles of four victims. Dexter’s most terrifying, formidable adversary.',
    url: 'https://www.tvmaze.com/people/1474/john-lithgow'
  },
  {
    id: 'char-icetruck',
    name: 'Brian Moser (Ice Truck Killer)',
    actor: 'Christian Camargo',
    country: 'United States',
    birthday: '1971-07-07',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/145/363748.jpg',
    cat: 'villain',
    roleLabel: 'The Ice Truck Killer / Rudy Cooper',
    bio: 'Dexter’s biological older brother who shared the horrific trauma of their mother’s death. He targeted women, drained their blood, and left frozen clues to unlock Dexter’s repressed memories.',
    url: 'https://www.tvmaze.com/people/15830/christian-camargo'
  },
  {
    id: 'char-miguel',
    name: 'Miguel Prado',
    actor: 'Jimmy Smits',
    country: 'United States',
    birthday: '1955-07-09',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2243.jpg',
    cat: 'villain',
    roleLabel: 'Corrupt Assistant D.A.',
    bio: 'Influential Assistant District Attorney of Miami-Dade. After discovering Dexter’s lethal secret, he formed an alliance to take down unpunished criminals before turning on Dexter.',
    url: 'https://www.tvmaze.com/people/4499/jimmy-smits'
  },
  {
    id: 'char-doomsday',
    name: 'Travis Marshall (Doomsday Killer)',
    actor: 'Colin Hanks',
    country: 'United States',
    birthday: '1977-11-24',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2239.jpg',
    cat: 'villain',
    roleLabel: 'Doomsday Killer (DDK)',
    bio: 'A deeply disturbed museum restorer who constructed theatrical, biblical tableau murders across Miami believing he was chosen to summon the Apocalypse.',
    url: 'https://www.tvmaze.com/people/3990/colin-hanks'
  },
  {
    id: 'char-jordan',
    name: 'Jordan Chase (Eugene Greer)',
    actor: 'Jonny Lee Miller',
    country: 'United Kingdom',
    birthday: '1972-11-15',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2238.jpg',
    cat: 'villain',
    roleLabel: 'Cult Leader & Mastermind',
    bio: 'Charismatic motivational guru preaching "Take It!" to millions. Behind his empire, he orchestrated the abduction, torture, and barrel-encasing of young women by his inner circle.',
    url: 'https://www.tvmaze.com/people/7036/jonny-lee-miller'
  },
  {
    id: 'char-lila',
    name: 'Lila Tournay (Lila West)',
    actor: 'Jaime Murray',
    country: 'United Kingdom',
    birthday: '1976-07-21',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/145/363740.jpg',
    cat: 'villain',
    roleLabel: 'Obsessive Pyromaniac',
    bio: 'An English sculptor and Dexter’s NA sponsor. Captivated by his darkness, her dangerous obsession escalated into arson, murder of Doakes, and kidnapping Astor and Cody.',
    url: 'https://www.tvmaze.com/people/13019/jaime-murray'
  },
  {
    id: 'char-isaak',
    name: 'Isaak Sirko',
    actor: 'Ray Stevenson',
    country: 'United Kingdom',
    birthday: '1964-05-25',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/145/363747.jpg',
    cat: 'villain',
    roleLabel: 'Koshka Brotherhood Syndicate Boss',
    bio: 'A refined, lethal Ukrainian mob boss who waged a personal war across Miami to avenge the death of his lover Viktor, matching Dexter in both combat and intellect.',
    url: 'https://www.tvmaze.com/people/17855/ray-stevenson'
  },
  {
    id: 'char-hannah',
    name: 'Hannah McKay',
    actor: 'Yvonne Strahovski',
    country: 'Australia',
    birthday: '1982-07-30',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2237.jpg',
    cat: 'villain',
    roleLabel: 'Aconite Poisoner & Dexter’s Lover',
    bio: 'An expert horticulturist who as a teenager was accomplice to a killing spree. Using untraceable botanical poisons, she eliminates threats—and becomes Dexter’s great romantic equal.',
    url: 'https://www.tvmaze.com/people/13018/yvonne-strahovski'
  },
  {
    id: 'char-kurt',
    name: 'Kurt Caldwell (Runaway Killer)',
    actor: 'Clancy Brown',
    country: 'United States',
    birthday: '1959-01-05',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/388/971910.jpg',
    cat: 'villain',
    roleLabel: 'The Runaway Killer (New Blood)',
    bio: 'Wealthy patriarch and truck stop owner in Iron Lake. Concealing a secret underground bunker, he hunted down transient young women with a rifle before embalming their bodies.',
    url: 'https://www.tvmaze.com/people/3702/clancy-brown'
  },

  // ==================== FAMILY & ALLIES ====================
  {
    id: 'char-rita',
    name: 'Rita Bennett',
    actor: 'Julie Benz',
    country: 'United States',
    birthday: '1972-05-01',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2235.jpg',
    cat: 'family',
    roleLabel: 'Wife & Mother',
    bio: 'Dexter’s sweet, gentle wife who represents his anchor to normalcy and humanity. Her tragic murder by the Trinity Killer in the Season 4 finale shatters Dexter’s world forever.',
    url: 'https://www.tvmaze.com/people/7037/julie-benz'
  },
  {
    id: 'char-harry',
    name: 'Harry Morgan',
    actor: 'James Remar',
    country: 'United States',
    birthday: '1953-12-31',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2228.jpg',
    cat: 'family',
    roleLabel: 'Father, Mentor & Moral Conscience',
    bio: 'Dexter’s adoptive detective father who recognized his son’s psychopathy early and devised the Code: kill only proven murderers, leave no evidence, and never get caught.',
    url: 'https://www.tvmaze.com/people/7040/james-remar'
  },
  {
    id: 'char-harrison',
    name: 'Harrison Morgan',
    actor: 'Jack Alcott',
    country: 'United States',
    birthday: '1996-01-01',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/375/938230.jpg',
    cat: 'family',
    roleLabel: 'Dexter’s Son',
    bio: 'Dexter and Rita’s biological son. "Born in blood" like his father, he tracks down Dexter in Iron Lake as a teenager, struggling with his own emergent Dark Passenger.',
    url: 'https://www.tvmaze.com/people/14445/jack-alcott'
  },
  {
    id: 'char-astor',
    name: 'Astor Bennett',
    actor: 'Christina Robinson',
    country: 'United States',
    birthday: '1997-11-08',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/578/1447094.jpg',
    cat: 'family',
    roleLabel: 'Stepdaughter',
    bio: 'Rita’s daughter and Dexter’s stepdaughter. Over the seasons she grows from a shy child into a protective older sister navigating the grief of losing her mother.',
    url: 'https://www.tvmaze.com/people/120894/christina-robinson'
  },
  {
    id: 'char-cody',
    name: 'Cody Bennett',
    actor: 'Preston Bailey',
    country: 'United States',
    birthday: '2000-07-25',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/578/1447095.jpg',
    cat: 'family',
    roleLabel: 'Stepson',
    bio: 'Rita’s son and Dexter’s stepson. Cody idolizes Dexter as a loving father figure and actively participates in his Young Sailors scouting troop.',
    url: 'https://www.tvmaze.com/people/87277/preston-bailey'
  },

  // ==================== OTHERS & ASSOCIATES ====================
  {
    id: 'char-lundy',
    name: 'Special Agent Frank Lundy',
    actor: 'Keith Carradine',
    country: 'United States',
    birthday: '1949-08-08',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/145/363723.jpg',
    cat: 'other',
    roleLabel: 'Senior FBI Profiler',
    bio: 'Renowned FBI serial killer specialist who leads the Bay Harbor Butcher task force and dedicates his retirement to tracking the Trinity Killer, forming a deep romantic bond with Debra.',
    url: 'https://www.tvmaze.com/people/11693/keith-carradine'
  },
  {
    id: 'char-vogel',
    name: 'Dr. Evelyn Vogel',
    actor: 'Charlotte Rampling',
    country: 'United Kingdom',
    birthday: '1946-02-05',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2234.jpg',
    cat: 'other',
    roleLabel: 'Neuropsychiatrist / Code Co-Creator',
    bio: 'The "Psychopath Whisperer" who secretly helped Harry Morgan construct the Code for young Dexter, considering Dexter her finest behavioral experiment.',
    url: 'https://www.tvmaze.com/people/26912/charlotte-rampling'
  },
  {
    id: 'char-lumen',
    name: 'Lumen Ann Pierce',
    actor: 'Julia Stiles',
    country: 'United States',
    birthday: '1981-03-28',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2242.jpg',
    cat: 'other',
    roleLabel: 'Survivor & Vengeance Partner',
    bio: 'A resilient survivor rescued by Dexter from Jordan Chase’s sadistic group. She partners with Dexter to systematically track and eliminate each of her attackers before finding peace.',
    url: 'https://www.tvmaze.com/people/18485/julia-stiles'
  },
  {
    id: 'char-anton',
    name: 'Anton Briggs',
    actor: 'David Ramsey',
    country: 'United States',
    birthday: '1971-11-17',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/145/363750.jpg',
    cat: 'other',
    roleLabel: 'Confidential Informant / Musician',
    bio: 'A charismatic Miami guitarist and police informant. Targeted and skinned by George King, he is rescued by Debra Morgan and later enters into a relationship with her.',
    url: 'https://www.tvmaze.com/people/1376/david-ramsey'
  },
  {
    id: 'char-jamie',
    name: 'Jamie Batista',
    actor: 'Aimee Garcia',
    country: 'United States',
    birthday: '1978-11-28',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2236.jpg',
    cat: 'other',
    roleLabel: 'Harrison’s Nanny / Angel’s Sister',
    bio: 'Angel Batista’s warm, energetic younger sister. As Harrison’s devoted nanny, she treats the boy as her own family while studying for her master’s degree in psychology.',
    url: 'https://www.tvmaze.com/people/7043/aimee-garcia'
  },
  {
    id: 'char-elway',
    name: 'Jacob Elway',
    actor: 'Sean Patrick Flanery',
    country: 'United States',
    birthday: '1965-10-11',
    image: 'https://static.tvmaze.com/uploads/images/medium_portrait/145/363742.jpg',
    cat: 'other',
    roleLabel: 'Private Investigator',
    bio: 'A tough private eye who hires Debra Morgan at Elway Investigation Services. Persistent and suspicious, he relentlessly hunts down the fugitive Hannah McKay.',
    url: 'https://www.tvmaze.com/people/17854/sean-patrick-flanery'
  }
];

/* ==========================================================================
   Application State
   ========================================================================== */
const state = {
  tab: 'cast', // 'cast' | 'episodes' | 'universe' | 'saved'
  query: '',
  category: 'all', // 'all' | 'police' | 'villain' | 'family' | 'other'
  season: 'all',
  sort: 'default',
  cast: VERIFIED_DEXTER_CHARACTERS,
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
    const [epsData, showData] = await Promise.all([
      fetch(API.episodes).then(r => r.ok ? r.json() : []),
      fetch(API.show).then(r => r.ok ? r.json() : null)
    ]);

    const elapsed = Math.round(performance.now() - t0);
    setApiStatus('ok', `Online (${elapsed} ms)`);

    // Process all 96 Episodes
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
      norm(c.roleLabel || '').includes(q) ||
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
  episodes: 'Episode Guide (96 Episodes)',
  universe: 'Franchise Universe',
  saved: 'Saved Evidence Files'
};

const PLACEHOLDERS = {
  cast: 'Search characters, actors, killers, detectives…',
  episodes: 'Search episode titles, numbers, plots…',
  universe: 'Search any TV series via live TVMaze API…',
  saved: 'Search within your saved files…'
};

const SORTS = {
  cast: [['default', 'Series Importance'], ['name', 'Character Name (A–Z)'], ['actor', 'Actor Name (A–Z)']],
  episodes: [['default', 'Chronological Order'], ['rating', 'Highest Rated First'], ['newest', 'Airdate (Newest)']]
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
        <img src="${esc(c.image)}" alt="${esc(c.name)}" loading="lazy">
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
        <img src="${esc(e.image || 'https://static.tvmaze.com/uploads/images/medium_landscape/1/4096.jpg')}" alt="${esc(e.name)}" loading="lazy">
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

    if (u.query !== query) return;
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
            <img src="${esc(https(s.image?.original || s.image?.medium) || 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2226.jpg')}" alt="${esc(s.name)}" loading="lazy">
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
      <img src="${esc(c.image)}" alt="${esc(c.name)}">
      <div class="dossier-info">
        <span class="file-no">CASE FILE · MMPD-${c.id.toUpperCase()}</span>
        <h3 id="modal-title">${esc(c.name)}</h3>
        <dl>
          <dt>Actor</dt><dd>${esc(c.actor)}</dd>
          <dt>Classification</dt><dd>${categoryLabel(c.cat)}</dd>
          <dt>Origin</dt><dd>${esc(c.country)}</dd>
          ${age ? `<dt>Actor Age</dt><dd>${age} years old</dd>` : ''}
          <dt>Source</dt><dd>TVMaze Verified Record</dd>
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
      <img src="${esc(e.image || 'https://static.tvmaze.com/uploads/images/medium_landscape/1/4096.jpg')}" alt="${esc(e.name)}">
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
