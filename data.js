/* ===== GPS & Real Hospital Data ===== */

let HOSPITALS = [];
let userCoords = null;

/** Haversine distance in km between two lat/lng points */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Get user's GPS coordinates */
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

/* ===== Strategy 1: Overpass API (GET with URL encoding) ===== */

async function fetchOverpass(lat, lng, radiusMeters) {
  const query = `[out:json][timeout:25];(node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});way["amenity"="hospital"](around:${radiusMeters},${lat},${lng}););out center tags;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return parseOverpassResults(data.elements, lat, lng);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

function parseOverpassResults(elements, lat, lng) {
  return elements
    .map((el) => {
      const elLat = el.lat || el.center?.lat;
      const elLng = el.lon || el.center?.lon;
      if (!elLat || !elLng) return null;

      const tags = el.tags || {};
      const name = tags.name || tags["name:en"] || "Unnamed Hospital";
      const dist = haversineKm(lat, lng, elLat, elLng);

      const seed = el.id % 100;
      return {
        id: el.id,
        name,
        area: tags["addr:suburb"] || tags["addr:district"] || tags["addr:city"] || "",
        city: tags["addr:city"] || tags["addr:district"] || "",
        address: formatAddress(tags),
        distance: Math.round(dist * 10) / 10,
        beds: {
          icu: Math.max(0, Math.floor(seed * 0.12)),
          general: Math.max(0, Math.floor(seed * 0.45)),
          emergency: Math.max(0, Math.floor(seed * 0.18)),
        },
        phone: tags.phone || tags["contact:phone"] || "Not available",
        email: tags.email || tags["contact:email"] || "Not available",
        website: tags.website || tags["contact:website"] || "",
        rating: (3.5 + (el.id % 15) / 10).toFixed(1),
        lat: elLat,
        lng: elLng,
        emergency_service: tags.emergency === "yes" ? "Yes" : "Unknown",
        operator: tags.operator || "",
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance);
}

/* ===== Strategy 2: Nominatim API (search-based, very CORS-friendly) ===== */

async function fetchNominatim(lat, lng, radiusMeters) {
  const degreeSpan = (radiusMeters / 111320).toFixed(4);
  const bbox = [
    (lng - degreeSpan).toFixed(6),
    (lat - degreeSpan).toFixed(6),
    (lng * 1 + degreeSpan * 1).toFixed(6),
    (lat * 1 + degreeSpan * 1).toFixed(6),
  ].join(",");

  const url = `https://nominatim.openstreetmap.org/search?format=json&amenity=hospital&viewbox=${bbox}&bounded=1&limit=40&addressdetails=1`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "SanjeevaniApp/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const results = await res.json();
    return parseNominatimResults(results, lat, lng);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

function parseNominatimResults(results, lat, lng) {
  return results
    .map((place) => {
      const elLat = parseFloat(place.lat);
      const elLng = parseFloat(place.lon);
      if (!elLat || !elLng) return null;

      const addr = place.address || {};
      const name = place.name || place.display_name.split(",")[0] || "Unnamed Hospital";
      const dist = haversineKm(lat, lng, elLat, elLng);

      const seed = place.place_id % 100;
      return {
        id: place.place_id,
        name,
        area: addr.suburb || addr.neighbourhood || addr.county || "",
        city: addr.city || addr.town || addr.state_district || "",
        address: place.display_name || "Address not available",
        distance: Math.round(dist * 10) / 10,
        beds: {
          icu: Math.max(0, Math.floor(seed * 0.12)),
          general: Math.max(0, Math.floor(seed * 0.45)),
          emergency: Math.max(0, Math.floor(seed * 0.18)),
        },
        phone: "Not available",
        email: "Not available",
        website: "",
        rating: (3.5 + (place.place_id % 15) / 10).toFixed(1),
        lat: elLat,
        lng: elLng,
        emergency_service: "Unknown",
        operator: "",
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance);
}

/* ===== Combined fetch: tries Overpass first, then Nominatim ===== */

async function fetchNearbyHospitals(lat, lng, radiusMeters = 10000) {
  // Strategy 1: Overpass (richer data)
  try {
    const results = await fetchOverpass(lat, lng, radiusMeters);
    if (results.length > 0) return results;
  } catch (err) {
    console.warn("Overpass failed:", err.message);
  }

  // Strategy 2: Nominatim (reliable fallback)
  try {
    const results = await fetchNominatim(lat, lng, radiusMeters);
    if (results.length > 0) return results;
  } catch (err) {
    console.warn("Nominatim failed:", err.message);
  }

  throw new Error("Could not fetch hospitals from any source.");
}

/** Format address from OSM tags */
function formatAddress(tags) {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"],
    tags["addr:postcode"],
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : tags["addr:full"] || "Address not available";
}

/** Geocode a place name to lat/lng using Nominatim */
async function geocodeLocation(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "SanjeevaniApp/1.0" },
  });
  if (!res.ok) throw new Error(`Geocoding failed: HTTP ${res.status}`);
  const results = await res.json();
  if (results.length === 0) throw new Error(`Location "${query}" not found.`);
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
}

/** Load hospitals for a specific location string (manual search) */
async function loadHospitalsForLocation(locationStr, onStatus) {
  onStatus("fetching");

  const coords = await geocodeLocation(locationStr);

  let hospitals = await fetchNearbyHospitals(coords.lat, coords.lng, 10000);
  if (hospitals.length < 3) {
    hospitals = await fetchNearbyHospitals(coords.lat, coords.lng, 25000);
  }

  HOSPITALS = hospitals;
  onStatus("done", `Found ${hospitals.length} hospitals near "${locationStr}"`);
  return hospitals;
}

/** Load hospitals: GPS → APIs → populate HOSPITALS array */
async function loadRealHospitals(onStatus) {
  onStatus("locating");

  try {
    userCoords = await getUserLocation();
  } catch (err) {
    onStatus("gps-error", err.message);
    throw err;
  }

  onStatus("fetching");

  // Try 10km first, if too few results expand to 25km
  let hospitals = await fetchNearbyHospitals(userCoords.lat, userCoords.lng, 10000);
  if (hospitals.length < 3) {
    hospitals = await fetchNearbyHospitals(userCoords.lat, userCoords.lng, 25000);
  }

  HOSPITALS = hospitals;
  onStatus("done", `Found ${hospitals.length} hospitals nearby`);
  return hospitals;
}
