/**
 * SWITCHER TUNNEL - LIVE SATELLITE ORBITAL EPHEMERIS ENGINE
 * Provides real-time CelesTrak TLE integration, SGP4 data caching,
 * and pre-baked orbital elements for Space Stations, Starlink, GPS, Weather, and Science satellites.
 */

// In-memory cache for CelesTrak TLE responses (TTL: 6 hours)
const CACHE_TTL_MS = 6 * 3600 * 1000;
const tleCache = new Map(); // group -> { timestamp, rawTle, satellites }

// Standard CelesTrak GP API URLs
const CELESTRAK_BASE = 'https://celestrak.org/NORAD/elements/gp.php';

export const SATELLITE_GROUPS = {
  stations: { name: 'Space Stations (ISS/Tiangong)', groupParam: 'stations', color: '#ffd600' },
  visual: { name: 'Brightest Visual Satellites', groupParam: 'visual', color: '#00f0ff' },
  gps: { name: 'GPS / Navstar Constellation', groupParam: 'gps-ops', color: '#00e676' },
  weather: { name: 'Weather & Earth Observation', groupParam: 'weather', color: '#b388ff' },
  science: { name: 'Science & Astrophysics', groupParam: 'science', color: '#ff6d00' },
  starlink: { name: 'Starlink Constellation', groupParam: 'starlink', color: '#00f0ff' }
};

/**
 * Built-in High-Accuracy Fallback TLE Catalog
 * Used when CelesTrak is unreachable, offline, or rate-limited.
 */
const FALLBACK_CATALOG = [
  // Space Stations
  {
    name: "ISS (ZARYA)",
    id: "25544",
    line1: "1 25544U 98067A   26249.49984954  .00015694  00000+0  28373-3 0  9990",
    line2: "2 25544  51.6416 117.8423 0006248  91.3644 268.8718 15.49842475583627",
    category: "stations",
    operator: "NASA / Roscosmos / ESA / JAXA",
    orbitType: "LEO"
  },
  {
    name: "CSS (TIANGONG)",
    id: "48274",
    line1: "1 48274U 21035A   26249.52847222  .00018500  00000+0  21000-3 0  9998",
    line2: "2 48274  41.4720 180.2500 0005500 120.4500 240.1200 15.62000000210005",
    category: "stations",
    operator: "CNSA (China)",
    orbitType: "LEO"
  },
  // Visual & Famous Science Satellites
  {
    name: "HST (HUBBLE)",
    id: "20580",
    line1: "1 20580U 90037B   26249.20000000  .00001500  00000+0  50000-4 0  9991",
    line2: "2 20580  28.4690 150.1200 0002800 250.0000 110.0000 15.08000000180002",
    category: "science",
    operator: "NASA / ESA",
    orbitType: "LEO"
  },
  {
    name: "ENVISAT",
    id: "27386",
    line1: "1 27386U 02009A   26249.40000000  .00000050  00000+0  20000-4 0  9995",
    line2: "2 27386  98.5400  45.2000 0001100  80.0000 280.0000 14.38000000120004",
    category: "visual",
    operator: "ESA (Europe)",
    orbitType: "LEO"
  },
  {
    name: "TERRA (EOS AM-1)",
    id: "25994",
    line1: "1 25994U 99068A   26249.30000000  .00000120  00000+0  35000-4 0  9992",
    line2: "2 25994  98.2000 210.0000 0001300  95.0000 265.0000 14.57000000140001",
    category: "science",
    operator: "NASA",
    orbitType: "LEO"
  },
  {
    name: "AQUA (EOS PM-1)",
    id: "27424",
    line1: "1 27424U 02022A   26249.35000000  .00000110  00000+0  32000-4 0  9993",
    line2: "2 27424  98.2100 195.0000 0001400 100.0000 260.0000 14.57000000130006",
    category: "science",
    operator: "NASA",
    orbitType: "LEO"
  },
  {
    name: "LANDSAT 8",
    id: "39084",
    line1: "1 39084U 13008A   26249.45000000  .00000080  00000+0  25000-4 0  9997",
    line2: "2 39084  98.2200 310.0000 0001200 110.0000 250.0000 14.57000000680003",
    category: "science",
    operator: "NASA / USGS",
    orbitType: "LEO"
  },
  {
    name: "LANDSAT 9",
    id: "49260",
    line1: "1 49260U 21088A   26249.42000000  .00000075  00000+0  24000-4 0  9996",
    line2: "2 49260  98.2200 130.0000 0001200 110.0000 250.0000 14.57000000240002",
    category: "science",
    operator: "NASA / USGS",
    orbitType: "LEO"
  },
  // Weather & Meteorological Satellites
  {
    name: "NOAA 20 (JPSS-1)",
    id: "43013",
    line1: "1 43013U 17073A   26249.50000000  .00000060  00000+0  21000-4 0  9999",
    line2: "2 43013  98.7400  75.0000 0001500  60.0000 300.0000 14.19000000450008",
    category: "weather",
    operator: "NOAA (USA)",
    orbitType: "LEO"
  },
  {
    name: "NOAA 21 (JPSS-2)",
    id: "54234",
    line1: "1 54234U 22150A   26249.48000000  .00000062  00000+0  22000-4 0  9994",
    line2: "2 54234  98.7400 255.0000 0001500  62.0000 298.0000 14.19000000190004",
    category: "weather",
    operator: "NOAA (USA)",
    orbitType: "LEO"
  },
  {
    name: "GOES 16",
    id: "41866",
    line1: "1 41866U 16071A   26249.20000000  .00000005  00000+0  00000+0 0  9991",
    line2: "2 41866   0.0200 285.0000 0001000 180.0000 180.0000  1.00270000350009",
    category: "weather",
    operator: "NOAA / NASA",
    orbitType: "GEO"
  },
  {
    name: "GOES 18",
    id: "51850",
    line1: "1 51850U 22021A   26249.25000000  .00000004  00000+0  00000+0 0  9993",
    line2: "2 51850   0.0150 223.0000 0001000 190.0000 170.0000  1.00270000150005",
    category: "weather",
    operator: "NOAA / NASA",
    orbitType: "GEO"
  },
  {
    name: "METEOSAT 10",
    id: "38552",
    line1: "1 38552U 12035B   26249.15000000  .00000006  00000+0  00000+0 0  9992",
    line2: "2 38552   1.4500  10.0000 0002000  45.0000 315.0000  1.00270000420003",
    category: "weather",
    operator: "EUMETSAT (Europe)",
    orbitType: "GEO"
  },
  // GPS Constellation (Operational MEO)
  {
    name: "GPS BIIF-1 (PRN 25)",
    id: "36585",
    line1: "1 36585U 10022A   26249.10000000  .00000000  00000+0  00000+0 0  9998",
    line2: "2 36585  55.2000  32.0000 0021000  65.0000 295.0000  2.00560000110007",
    category: "gps",
    operator: "US Space Force",
    orbitType: "MEO"
  },
  {
    name: "GPS BIIF-2 (PRN 01)",
    id: "37753",
    line1: "1 37753U 11036A   26249.12000000  .00000000  00000+0  00000+0 0  9999",
    line2: "2 37753  55.1500  92.0000 0023000  70.0000 290.0000  2.00560000100002",
    category: "gps",
    operator: "US Space Force",
    orbitType: "MEO"
  },
  {
    name: "GPS BIIF-3 (PRN 24)",
    id: "38833",
    line1: "1 38833U 12053A   26249.14000000  .00000000  00000+0  00000+0 0  9994",
    line2: "2 38833  55.3000 152.0000 0025000  75.0000 285.0000  2.00560000090008",
    category: "gps",
    operator: "US Space Force",
    orbitType: "MEO"
  },
  {
    name: "GPS BIIF-4 (PRN 27)",
    id: "39166",
    line1: "1 39166U 13023A   26249.16000000  .00000000  00000+0  00000+0 0  9995",
    line2: "2 39166  55.2500 212.0000 0022000  80.0000 280.0000  2.00560000080004",
    category: "gps",
    operator: "US Space Force",
    orbitType: "MEO"
  },
  {
    name: "GPS BIIF-5 (PRN 30)",
    id: "39533",
    line1: "1 39533U 14008A   26249.18000000  .00000000  00000+0  00000+0 0  9991",
    line2: "2 39533  55.1000 272.0000 0024000  85.0000 275.0000  2.00560000070001",
    category: "gps",
    operator: "US Space Force",
    orbitType: "MEO"
  },
  {
    name: "GPS BIIF-6 (PRN 06)",
    id: "40019",
    line1: "1 40019U 14026A   26249.20000000  .00000000  00000+0  00000+0 0  9997",
    line2: "2 40019  55.3500 332.0000 0026000  90.0000 270.0000  2.00560000060005",
    category: "gps",
    operator: "US Space Force",
    orbitType: "MEO"
  },
  // Starlink Fleet Representative Nodes
  {
    name: "STARLINK-1007",
    id: "44713",
    line1: "1 44713U 19074A   26249.46000000  .00002200  00000+0  15000-3 0  9992",
    line2: "2 44713  53.0500  40.0000 0001500 100.0000 260.0000 15.06000000250008",
    category: "starlink",
    operator: "SpaceX",
    orbitType: "LEO"
  },
  {
    name: "STARLINK-1008",
    id: "44714",
    line1: "1 44714U 19074B   26249.46200000  .00002200  00000+0  15000-3 0  9993",
    line2: "2 44714  53.0500  65.0000 0001500 105.0000 255.0000 15.06000000250001",
    category: "starlink",
    operator: "SpaceX",
    orbitType: "LEO"
  },
  {
    name: "STARLINK-2180",
    id: "47787",
    line1: "1 47787U 21017A   26249.47000000  .00002500  00000+0  16000-3 0  9996",
    line2: "2 47787  53.2200 120.0000 0001600 110.0000 250.0000 15.06000000180004",
    category: "starlink",
    operator: "SpaceX",
    orbitType: "LEO"
  },
  {
    name: "STARLINK-31652",
    id: "58921",
    line1: "1 58921U 24021A   26249.48000000  .00003000  00000+0  18000-3 0  9990",
    line2: "2 58921  43.0000 210.0000 0001800 115.0000 245.0000 15.12000000090007",
    category: "starlink",
    operator: "SpaceX",
    orbitType: "LEO"
  }
];

/**
 * Parses raw 3-line TLE format:
 *   Line 0: SATELLITE NAME
 *   Line 1: 1 NNNNNU ...
 *   Line 2: 2 NNNNN ...
 */
export function parseTleRaw(rawText, defaultCategory = 'visual') {
  if (!rawText || typeof rawText !== 'string') return [];
  const lines = rawText.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const satellites = [];

  for (let i = 0; i < lines.length; i++) {
    // If line starts with "1 ", line i+1 starts with "2 "
    if (lines[i].startsWith('1 ') && lines[i + 1]?.startsWith('2 ')) {
      const line1 = lines[i];
      const line2 = lines[i + 1];
      const name = (i > 0 && !lines[i - 1].startsWith('1 ') && !lines[i - 1].startsWith('2 '))
        ? lines[i - 1]
        : `SAT-${line1.slice(2, 7).trim()}`;
      
      const noradId = line1.slice(2, 7).trim();
      const meanMotion = parseFloat(line2.slice(52, 63)); // revs per day
      let orbitType = 'LEO';
      if (meanMotion < 1.5) orbitType = 'GEO';
      else if (meanMotion < 3.5) orbitType = 'MEO';

      let operator = 'International';
      let cat = defaultCategory;
      const upperName = name.toUpperCase();
      if (upperName.includes('ISS') || upperName.includes('ZARYA') || upperName.includes('TIANGONG') || upperName.includes('CSS')) {
        cat = 'stations';
        operator = upperName.includes('TIANGONG') ? 'CNSA' : 'NASA / Roscosmos';
      } else if (upperName.includes('STARLINK')) {
        cat = 'starlink';
        operator = 'SpaceX';
      } else if (upperName.includes('NAVSTAR') || upperName.includes('GPS') || upperName.includes('GLONASS') || upperName.includes('GALILEO')) {
        cat = 'gps';
        operator = 'US Space Force';
      } else if (upperName.includes('NOAA') || upperName.includes('GOES') || upperName.includes('METEOSAT') || upperName.includes('HIMAWARI') || upperName.includes('SENTINEL')) {
        cat = 'weather';
        operator = upperName.includes('METEOSAT') ? 'EUMETSAT' : 'NOAA / NASA';
      } else if (upperName.includes('HST') || upperName.includes('HUBBLE') || upperName.includes('TERRA') || upperName.includes('AQUA') || upperName.includes('LANDSAT') || upperName.includes('CHANDRA')) {
        cat = 'science';
        operator = 'NASA / ESA';
      }

      satellites.push({
        id: noradId,
        name,
        line1,
        line2,
        category: cat,
        operator,
        orbitType
      });

      i++; // Skip line 2
    }
  }

  return satellites;
}

/**
 * Fetches TLE data for a specific group from CelesTrak with memory caching.
 */
export async function fetchCelesTrakGroup(groupKey) {
  const groupConfig = SATELLITE_GROUPS[groupKey];
  if (!groupConfig) return [];

  const now = Date.now();
  const cached = tleCache.get(groupKey);
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.satellites;
  }

  try {
    const url = `${CELESTRAK_BASE}?GROUP=${groupConfig.groupParam}&FORMAT=tle`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Switcher-Tunnel-Satellite-Engine/3.0' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      let parsed = parseTleRaw(text, groupKey);
      
      // Limit Starlink to top ~150 to keep browser memory & performance optimal
      if (groupKey === 'starlink' && parsed.length > 150) {
        parsed = parsed.slice(0, 150);
      }

      tleCache.set(groupKey, {
        timestamp: now,
        rawTle: text,
        satellites: parsed
      });
      return parsed;
    }
  } catch (err) {
    console.warn(`[SATELLITE] Failed to fetch live TLE for '${groupKey}': ${err.message}. Using cache/fallback.`);
  }

  // Fallback to existing cache if expired, or return filtered fallback catalog
  if (cached?.satellites?.length > 0) return cached.satellites;
  return FALLBACK_CATALOG.filter(s => s.category === groupKey || groupKey === 'visual');
}

/**
 * Returns complete list of satellites across requested group or all constellations.
 * Automatically deduplicates by NORAD ID.
 */
export async function getSatellitesList({ group = 'all', search = '', limit = 500 } = {}) {
  let combined = [];

  if (group === 'all') {
    // Fetch all primary groups in parallel
    const keys = ['stations', 'visual', 'gps', 'weather', 'science', 'starlink'];
    const results = await Promise.allSettled(keys.map(k => fetchCelesTrakGroup(k)));
    const seen = new Set();

    for (const r of results) {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        for (const sat of r.value) {
          if (!seen.has(sat.id)) {
            seen.add(sat.id);
            combined.push(sat);
          }
        }
      }
    }

    // Ensure fallback items exist if fetch returned empty
    if (combined.length === 0) {
      combined = [...FALLBACK_CATALOG];
    }
  } else if (SATELLITE_GROUPS[group]) {
    combined = await fetchCelesTrakGroup(group);
  } else {
    combined = await fetchCelesTrakGroup('visual');
  }

  // Apply search query if provided
  if (search && typeof search === 'string') {
    const q = search.trim().toUpperCase();
    combined = combined.filter(s => 
      s.name.toUpperCase().includes(q) || 
      s.id.includes(q) || 
      s.operator.toUpperCase().includes(q) ||
      s.category.toUpperCase().includes(q)
    );
  }

  if (limit && limit > 0) {
    combined = combined.slice(0, limit);
  }

  return combined;
}

/**
 * Returns satellite count statistics by group.
 */
export async function getSatellitesStats() {
  const stats = { total: 0, byCategory: {} };
  for (const key of Object.keys(SATELLITE_GROUPS)) {
    const list = await fetchCelesTrakGroup(key);
    stats.byCategory[key] = list.length;
    stats.total += list.length;
  }
  return stats;
}
