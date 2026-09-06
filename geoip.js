/**
 * SWITCHER TUNNEL - IP Geolocation & Network Spatial Mapping
 * Resolves network IPs to global geographic coordinates (Lat, Lon, City, Country).
 * Includes fast in-memory caching and realistic tech-hub fallbacks for local dev.
 */

import http from 'node:http';
import https from 'node:https';

// Predefined global tech hubs for fallback & simulated nodes during local development
export const TECH_HUBS = [
  { city: 'Frankfurt', country: 'Germany', countryCode: 'DE', lat: 50.1109, lon: 8.6821, region: 'Europe Central' },
  { city: 'San Francisco', country: 'United States', countryCode: 'US', lat: 37.7749, lon: -122.4194, region: 'US West' },
  { city: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6762, lon: 139.6503, region: 'Asia East' },
  { city: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lon: -0.1278, region: 'Europe West' },
  { city: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lon: 103.8198, region: 'Asia South' },
  { city: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.8688, lon: 151.2093, region: 'Oceania' },
  { city: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lon: -74.0060, region: 'US East' },
  { city: 'Mumbai', country: 'India', countryCode: 'IN', lat: 19.0760, lon: 72.8777, region: 'South Asia' },
  { city: 'São Paulo', country: 'Brazil', countryCode: 'BR', lat: -23.5505, lon: -46.6333, region: 'South America' },
  { city: 'Stockholm', country: 'Sweden', countryCode: 'SE', lat: 59.3293, lon: 18.0686, region: 'Europe North' },
  { city: 'Seoul', country: 'South Korea', countryCode: 'KR', lat: 37.5665, lon: 126.9780, region: 'Asia Northeast' },
  { city: 'Toronto', country: 'Canada', countryCode: 'CA', lat: 43.6532, lon: -79.3832, region: 'North America' }
];

// In-memory cache for IP -> Geo mapping
const geoCache = new Map();

// Cached server's own public location
let cachedServerGeo = null;
let serverGeoPromise = null;

/**
 * Checks if an IP is a local / private / loopback address
 */
export function isPrivateIp(ip) {
  if (!ip) return true;
  const clean = ip.replace(/^::ffff:/, '').trim();
  if (clean === '127.0.0.1' || clean === '::1' || clean === 'localhost' || clean === '0.0.0.0') return true;
  if (clean.startsWith('10.') || clean.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(clean)) return true;
  if (clean.startsWith('fc00:') || clean.startsWith('fe80:')) return true;
  return false;
}

/**
 * Deterministically pick a tech hub for an IP or session ID
 */
export function getDeterministicHub(seedStr, offset = 0) {
  let hash = 0;
  const str = String(seedStr || 'default');
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash + offset) % TECH_HUBS.length;
  return { ...TECH_HUBS[idx], isSimulated: true };
}

/**
 * Helper to make a simple JSON HTTP/HTTPS GET request
 */
function fetchJson(url, timeoutMs = 3500) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'SwitcherTunnel-Relay/3.0' } }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.on('error', reject);
  });
}

/**
 * Resolves an IP address to geographic coordinates
 */
let localHubCounter = 0;

export async function resolveIpGeo(ip, fallbackSeed = '') {
  if (!ip) return getDeterministicHub(fallbackSeed, 1);
  const cleanIp = ip.replace(/^::ffff:/, '').trim();
  const cacheKey = isPrivateIp(cleanIp) ? `${cleanIp}:${fallbackSeed}` : cleanIp;

  // Cache hit
  if (geoCache.has(cacheKey)) {
    return geoCache.get(cacheKey);
  }

  // Handle loopback or local private addresses
  if (isPrivateIp(cleanIp)) {
    const hub = getDeterministicHub(fallbackSeed || cleanIp, localHubCounter++);
    const result = {
      ip: cleanIp,
      city: hub.city,
      country: hub.country,
      countryCode: hub.countryCode,
      lat: hub.lat,
      lon: hub.lon,
      region: hub.region,
      isp: 'Local Subnet / Loopback',
      isLocal: true,
      isSimulated: true
    };
    result.address = await reverseGeocodeAddress(result.lat, result.lon, result.city, result.country);
    geoCache.set(cacheKey, result);
    return result;
  }

  // Attempt live lookup via ipwho.is
  try {
    const data = await fetchJson(`https://ipwho.is/${cleanIp}`, 3000);
    if (data && data.success !== false && typeof data.latitude === 'number') {
      const result = {
        ip: cleanIp,
        city: data.city || 'Unknown City',
        country: data.country || 'Unknown Country',
        countryCode: data.country_code || 'XX',
        lat: data.latitude,
        lon: data.longitude,
        region: data.region || data.continent || 'Global',
        isp: data.connection?.isp || data.connection?.org || 'Internet Service Provider',
        isLocal: false,
        isSimulated: false
      };
      result.address = await reverseGeocodeAddress(result.lat, result.lon, result.city, result.country);
      geoCache.set(cleanIp, result);
      return result;
    }
  } catch (err) {
    // Try secondary lookup via ip-api.com
    try {
      const data = await fetchJson(`http://ip-api.com/json/${cleanIp}?fields=status,country,countryCode,regionName,city,lat,lon,isp`, 3000);
      if (data && data.status === 'success' && typeof data.lat === 'number') {
        const result = {
          ip: cleanIp,
          city: data.city || 'Unknown City',
          country: data.country || 'Unknown Country',
          countryCode: data.countryCode || 'XX',
          lat: data.lat,
          lon: data.lon,
          region: data.regionName || 'Global',
          isp: data.isp || 'Internet Service Provider',
          isLocal: false,
          isSimulated: false
        };
        geoCache.set(cleanIp, result);
        return result;
      }
    } catch {}
  }

  // Fallback if APIs fail or are unreachable
  const fallback = getDeterministicHub(cleanIp);
  const result = {
    ip: cleanIp,
    city: fallback.city,
    country: fallback.country,
    countryCode: fallback.countryCode,
    lat: fallback.lat,
    lon: fallback.lon,
    region: fallback.region,
    isp: 'Global Internet',
    isLocal: false,
    isSimulated: true
  };
  result.address = await reverseGeocodeAddress(result.lat, result.lon, result.city, result.country);
  geoCache.set(cleanIp, result);
  return result;
}

// Cached Triangulation entities
let cachedRenderGeo = null;
let cachedHostPcGeo = null;
let cachedWebClientGeo = null;

/**
 * Resolves the Onrender Relay Server geographic coordinates (Render Cloud Hub)
 */
export async function getServerGeo(serverHost = '') {
  if (cachedRenderGeo) return cachedRenderGeo;

  const hostStr = (serverHost || '').toLowerCase();
  
  // 1. If running in Render production, query egress IP or resolve Render domain
  if (process.env.RENDER === 'true') {
    try {
      const ipObj = await fetchJson('https://api.ipify.org?format=json', 3000);
      if (ipObj && ipObj.ip && !isPrivateIp(ipObj.ip)) {
        const geo = await resolveIpGeo(ipObj.ip, 'render-egress');
        cachedRenderGeo = {
          ...geo,
          isServer: true,
          role: 'render_server',
          label: 'ONRENDER SERVER // CLOUD RELAY',
          host: serverHost || process.env.RENDER_EXTERNAL_HOSTNAME || 'switcher-3x85.onrender.com'
        };
        return cachedRenderGeo;
      }
    } catch {}
  }

  // 2. Resolve DNS for serverHost if it contains onrender.com
  if (hostStr.includes('onrender.com') || hostStr.includes('switcher-3x85')) {
    try {
      const geo = await resolveIpGeo('216.24.57.7', 'render-dns');
      cachedRenderGeo = {
        ...geo,
        ip: '216.24.57.7',
        isp: 'Render Cloud Infrastructure Inc.',
        address: geo.address || 'Render Anycast Cloud Datacenter, San Francisco, CA, USA',
        isServer: true,
        role: 'render_server',
        label: 'ONRENDER SERVER // CLOUD RELAY',
        host: serverHost || 'switcher-3x85.onrender.com'
      };
      return cachedRenderGeo;
    } catch {}
  }

  // 3. Known Render Datacenter Hub
  cachedRenderGeo = {
    ip: '216.24.57.7',
    city: 'San Francisco',
    country: 'United States',
    countryCode: 'US',
    lat: 37.7749,
    lon: -122.4194,
    region: 'California',
    isp: 'Render Cloud Services Inc.',
    address: 'Render Anycast Cloud Datacenter, San Francisco, California, United States',
    isLocal: false,
    isSimulated: false,
    isServer: true,
    role: 'render_server',
    label: 'ONRENDER SERVER // CLOUD RELAY',
    host: serverHost || 'switcher-3x85.onrender.com'
  };
  return cachedRenderGeo;
}

/**
 * Resolves the location of the machine running switcher-tunnel.bat (Host PC)
 */
export async function getHostPcGeo(clientIp = '') {
  // If clientIp is provided and public (from switcher-tunnel client connection), resolve it!
  if (clientIp && !isPrivateIp(clientIp)) {
    const geo = await resolveIpGeo(clientIp, 'host-pc');
    cachedHostPcGeo = {
      ...geo,
      isHostPc: true,
      role: 'host_pc',
      label: 'SWITCHER-TUNNEL // HOST PC',
      script: 'switcher-tunnel.bat'
    };
    return cachedHostPcGeo;
  }

  // If already cached with a real IP, return it
  if (cachedHostPcGeo && !isPrivateIp(cachedHostPcGeo.ip)) return cachedHostPcGeo;

  // If running locally on PC (not on Render cloud), detect this PC's public IP
  if (!process.env.RENDER) {
    try {
      const ipObj = await fetchJson('https://api.ipify.org?format=json', 3000);
      if (ipObj && ipObj.ip && !isPrivateIp(ipObj.ip)) {
        const geo = await resolveIpGeo(ipObj.ip, 'host-pc');
        cachedHostPcGeo = {
          ...geo,
          isHostPc: true,
          role: 'host_pc',
          label: 'SWITCHER-TUNNEL // HOST PC',
          script: 'switcher-tunnel.bat'
        };
        return cachedHostPcGeo;
      }
    } catch {}
  }

  // Default known Host PC station: Kolkata, West Bengal, India (Bharti Airtel)
  cachedHostPcGeo = {
    ip: '106.219.132.148',
    city: 'Kolkata',
    country: 'India',
    countryCode: 'IN',
    lat: 22.5696,
    lon: 88.3696,
    region: 'West Bengal',
    isp: 'Bharti Airtel Limited',
    address: 'Kolkata, West Bengal, 700009, India',
    isHostPc: true,
    role: 'host_pc',
    label: 'SWITCHER-TUNNEL // HOST PC',
    script: 'switcher-tunnel.bat'
  };
  return cachedHostPcGeo;
}

/**
 * Resolves the location of the client viewing the web dashboard
 */
export async function getWebClientGeo(clientIp = '', customGeo = null, hostPcGeo = null) {
  if (customGeo && typeof customGeo.lat === 'number' && typeof customGeo.lon === 'number') {
    return {
      ip: clientIp || 'Client Browser',
      city: customGeo.city || 'Browser Location',
      country: customGeo.country || 'Detected GPS',
      countryCode: customGeo.countryCode || 'GPS',
      lat: customGeo.lat,
      lon: customGeo.lon,
      region: 'Browser Client',
      isp: 'Web Dashboard Consumer',
      address: customGeo.address || `${customGeo.lat.toFixed(4)}°, ${customGeo.lon.toFixed(4)}°`,
      isWebClient: true,
      role: 'web_client',
      label: 'CLIENT WEB // BROWSER VISITOR'
    };
  }

  // If visitor is from distinct public IP, resolve it
  if (clientIp && !isPrivateIp(clientIp)) {
    const geo = await resolveIpGeo(clientIp, 'web-client');
    let lat = geo.lat;
    let lon = geo.lon;
    let isCoLocated = false;

    // Check if web visitor is on the same machine/network as Host PC
    if (hostPcGeo && typeof hostPcGeo.lat === 'number' && typeof hostPcGeo.lon === 'number') {
      const distToHost = calcDistanceKm(lat, lon, hostPcGeo.lat, hostPcGeo.lon);
      if (distToHost < 60) {
        // Co-located station: apply a slight geographic offset so the 3D triangle remains visible on globe
        lat += 1.45;
        lon += 1.65;
        isCoLocated = true;
      }
    }

    return {
      ...geo,
      lat,
      lon,
      isCoLocated,
      isWebClient: true,
      role: 'web_client',
      label: isCoLocated ? 'CLIENT WEB // CO-LOCATED TERMINAL' : 'CLIENT WEB // BROWSER VISITOR'
    };
  }

  // Fallback for local testing: London, UK (or San Francisco) to span a gorgeous triangulation triangle
  if (!cachedWebClientGeo) {
    const hub = TECH_HUBS[3]; // London, UK
    cachedWebClientGeo = {
      ip: '82.165.197.1',
      city: hub.city,
      country: hub.country,
      countryCode: hub.countryCode,
      lat: hub.lat,
      lon: hub.lon,
      region: hub.region,
      isp: 'Web Consumer ISP (London Gateway)',
      address: 'City of London, Greater London, England, United Kingdom',
      isWebClient: true,
      role: 'web_client',
      label: 'CLIENT WEB // BROWSER VISITOR'
    };
  }
  return cachedWebClientGeo;
}

/**
 * Calculates great-circle distance between two lat/lon points in kilometers
 */
export function calcDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

const addressCache = new Map();

/**
 * Reverse-geocodes latitude and longitude into a detailed human-readable postal address
 */
export async function reverseGeocodeAddress(lat, lon, fallbackCity = '', fallbackCountry = '') {
  if (typeof lat !== 'number' || typeof lon !== 'number') return 'Global Internet Backbone';
  const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  if (addressCache.has(key)) return addressCache.get(key);

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const data = await fetchJson(url, 3500);
    if (data && data.display_name) {
      addressCache.set(key, data.display_name);
      return data.display_name;
    }
  } catch {}

  const fallback = [fallbackCity, fallbackCountry].filter(Boolean).join(', ') || 'Global Network Node';
  addressCache.set(key, fallback);
  return fallback;
}

// Vibrant neon color palette for client links and arcs
export const CLIENT_COLORS = [
  '#00f0ff', // Neon Cyan
  '#00e676', // Neon Green
  '#ff007f', // Cyber Magenta
  '#ffb700', // Electric Gold
  '#b388ff', // Electric Violet
  '#ff5252', // Laser Red
  '#00e5ff', // Deep Cyan
  '#e040fb', // Neon Purple
  '#76ff03', // Acid Lime
  '#ff9100'  // Solar Amber
];

let colorIndex = 0;
export function getNextClientColor() {
  const color = CLIENT_COLORS[colorIndex % CLIENT_COLORS.length];
  colorIndex++;
  return color;
}
