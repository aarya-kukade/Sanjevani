/* ===== DOM References ===== */
const dom = {
  bedType: document.getElementById("bed-type"),
  location: document.getElementById("location"),
  searchBtn: document.getElementById("search-btn"),
  hospitalGrid: document.getElementById("hospital-grid"),
  loading: document.getElementById("loading"),
  emptyState: document.getElementById("empty-state"),
  hospitalSection: document.getElementById("hospital-section"),

  gpsBanner: document.getElementById("gps-banner"),
  gpsIcon: document.getElementById("gps-icon"),
  gpsText: document.getElementById("gps-text"),
  gpsRetry: document.getElementById("gps-retry"),

  symptomInput: document.getElementById("symptom-input"),
  analyzeBtn: document.getElementById("analyze-btn"),
  aiLoading: document.getElementById("ai-loading"),
  aiResult: document.getElementById("ai-result"),
  aiBedType: document.getElementById("ai-bed-type"),
  aiExplanation: document.getElementById("ai-explanation"),
  aiApplyBtn: document.getElementById("ai-apply-btn"),
  aiError: document.getElementById("ai-error"),
  aiErrorMsg: document.getElementById("ai-error-msg"),

  detailModal: document.getElementById("detail-modal"),
  modalContent: document.getElementById("modal-content"),
  modalClose: document.getElementById("modal-close"),
};

/* ===== Config ===== */
const GEMINI_API_KEY = "AIzaSyBgqRVXBE54eAaDzwiM_YOO9j_I0_KU8WQ";
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
function geminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

/* ===== State ===== */
let currentFilter = { bedType: "all", location: "" };
let updateInterval = null;

/* ===== GPS Banner ===== */

function setGpsBanner(state, message) {
  dom.gpsBanner.className = "gps-banner";
  dom.gpsRetry.classList.add("hidden");

  if (state === "locating") {
    dom.gpsBanner.classList.add("gps-locating");
    dom.gpsIcon.textContent = "📡";
    dom.gpsText.textContent = "Detecting your location...";
  } else if (state === "fetching") {
    dom.gpsBanner.classList.add("gps-locating");
    dom.gpsIcon.textContent = "🔍";
    dom.gpsText.textContent = "Finding real hospitals near you...";
  } else if (state === "done") {
    dom.gpsBanner.classList.add("gps-success");
    dom.gpsIcon.textContent = "✅";
    dom.gpsText.textContent = message || "Location detected. Showing nearby hospitals.";
  } else if (state === "gps-error") {
    dom.gpsBanner.classList.add("gps-error");
    dom.gpsIcon.textContent = "⚠️";
    dom.gpsText.textContent = message || "Could not detect location. Please allow GPS access.";
    dom.gpsRetry.classList.remove("hidden");
  } else if (state === "api-error") {
    dom.gpsBanner.classList.add("gps-error");
    dom.gpsIcon.textContent = "⚠️";
    dom.gpsText.textContent = message || "Failed to fetch hospital data. Please try again.";
    dom.gpsRetry.classList.remove("hidden");
  }
}

/* ===== Hospital Rendering ===== */

function getTotalBeds(hospital) {
  return hospital.beds.icu + hospital.beds.general + hospital.beds.emergency;
}

function isAvailable(hospital, bedType) {
  if (bedType === "all") return getTotalBeds(hospital) > 0;
  return hospital.beds[bedType] > 0;
}

function filterHospitals(bedType, location) {
  let filtered = [...HOSPITALS];

  if (location.trim()) {
    const loc = location.trim().toLowerCase();
    filtered = filtered.filter(
      (h) =>
        h.name.toLowerCase().includes(loc) ||
        h.city.toLowerCase().includes(loc) ||
        h.area.toLowerCase().includes(loc) ||
        h.address.toLowerCase().includes(loc)
    );
  }

  if (bedType !== "all") {
    filtered = filtered.filter((h) => h.beds[bedType] > 0);
  }

  filtered.sort((a, b) => a.distance - b.distance);
  return filtered;
}

function findNearestAvailable(hospitals, bedType) {
  return hospitals.find((h) => isAvailable(h, bedType)) || null;
}

function createBedItem(count, label) {
  return `
    <div class="bed-item">
      <span class="count ${count === 0 ? "zero" : ""}">${count}</span>
      <span class="label">${label}</span>
    </div>
  `;
}

function mapsUrl(hospital) {
  return `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`;
}

function createHospitalCard(hospital, isNearest) {
  const available = getTotalBeds(hospital) > 0;
  const card = document.createElement("div");
  card.className = `hospital-card${isNearest ? " nearest" : ""}`;
  card.innerHTML = `
    <div class="card-header">
      <div>
        <div class="hospital-name">${hospital.name}</div>
        <div class="hospital-distance">📍 ${hospital.distance} km away</div>
      </div>
      <span class="status-badge ${available ? "status-available" : "status-full"}">
        ${available ? "Available" : "Full"}
      </span>
    </div>
    <div class="bed-counts">
      ${createBedItem(hospital.beds.icu, "ICU")}
      ${createBedItem(hospital.beds.general, "General")}
      ${createBedItem(hospital.beds.emergency, "Emergency")}
    </div>
    <div class="card-footer">
      <span class="hospital-area">📍 ${hospital.area || "Nearby"}${hospital.city ? ", " + hospital.city : ""}</span>
      <div class="card-actions">
        <a href="${mapsUrl(hospital)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm" title="Get directions">🗺️ Directions</a>
        <button class="btn btn-outline btn-sm" data-id="${hospital.id}">View Details</button>
      </div>
    </div>
  `;
  return card;
}

function renderHospitals(bedType, location) {
  const hospitals = filterHospitals(bedType, location);
  const nearest = findNearestAvailable(hospitals, bedType);

  dom.hospitalGrid.innerHTML = "";
  dom.emptyState.classList.add("hidden");

  if (hospitals.length === 0) {
    dom.emptyState.classList.remove("hidden");
    return;
  }

  hospitals.forEach((h) => {
    const isNearest = nearest && h.id === nearest.id;
    const card = createHospitalCard(h, isNearest);
    dom.hospitalGrid.appendChild(card);
  });
}

/* ===== Loading ===== */

function showLoading() {
  dom.loading.classList.remove("hidden");
  dom.hospitalGrid.innerHTML = "";
  dom.emptyState.classList.add("hidden");
}

function hideLoading() {
  dom.loading.classList.add("hidden");
}

/* ===== Real-Time Bed Simulation ===== */

function simulateBedUpdate() {
  if (HOSPITALS.length === 0) return;
  HOSPITALS.forEach((h) => {
    const types = ["icu", "general", "emergency"];
    const type = types[Math.floor(Math.random() * types.length)];
    const delta = Math.random() > 0.5 ? 1 : -1;
    h.beds[type] = Math.max(0, h.beds[type] + delta);
  });
  renderHospitals(currentFilter.bedType, currentFilter.location);
}

/* ===== Modal ===== */

function openModal(hospitalId) {
  const h = HOSPITALS.find((h) => h.id === hospitalId);
  if (!h) return;

  const available = getTotalBeds(h) > 0;
  dom.modalContent.innerHTML = `
    <h3>${h.name}</h3>
    <p class="modal-subtitle">📍 ${h.address}</p>
    ${h.operator ? `<div class="detail-row"><span class="detail-label">Operated by</span><span class="detail-value">${h.operator}</span></div>` : ""}
    <div class="detail-row">
      <span class="detail-label">Distance</span>
      <span class="detail-value">${h.distance} km</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Status</span>
      <span class="detail-value" style="color: ${available ? "var(--green-600)" : "var(--red-600)"}">
        ${available ? "Beds Available" : "Full"}
      </span>
    </div>
    <div class="detail-row">
      <span class="detail-label">ICU Beds</span>
      <span class="detail-value">${h.beds.icu}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">General Beds</span>
      <span class="detail-value">${h.beds.general}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Emergency Beds</span>
      <span class="detail-value">${h.beds.emergency}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Emergency Service</span>
      <span class="detail-value">${h.emergency_service}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Rating</span>
      <span class="detail-value">⭐ ${h.rating} / 5</span>
    </div>
    <div class="contact-section">
      <h4>Contact Information</h4>
      <p>📞 ${h.phone}</p>
      <p>📧 ${h.email}</p>
      ${h.website ? `<p>🌐 <a href="${h.website}" target="_blank" rel="noopener">${h.website}</a></p>` : ""}
    </div>
    <a href="${mapsUrl(h)}" target="_blank" rel="noopener" class="btn btn-primary btn-sm" style="margin-top:16px; display:inline-flex;">🗺️ Get Directions on Google Maps</a>
  `;

  dom.detailModal.classList.remove("hidden");
}

function closeModal() {
  dom.detailModal.classList.add("hidden");
}

/* ===== AI Symptom Analysis ===== */

function setAiState(state) {
  dom.aiLoading.classList.add("hidden");
  dom.aiResult.classList.add("hidden");
  dom.aiError.classList.add("hidden");

  if (state === "loading") {
    dom.aiLoading.classList.remove("hidden");
    dom.symptomInput.disabled = true;
    dom.analyzeBtn.disabled = true;
    dom.analyzeBtn.querySelector(".btn-text").textContent = "Analyzing...";
    dom.analyzeBtn.querySelector(".btn-spinner").classList.remove("hidden");
  } else {
    dom.symptomInput.disabled = false;
    dom.analyzeBtn.disabled = false;
    dom.analyzeBtn.querySelector(".btn-text").textContent = "🧠 Analyze Symptoms";
    dom.analyzeBtn.querySelector(".btn-spinner").classList.add("hidden");
  }

  if (state === "result") dom.aiResult.classList.remove("hidden");
  if (state === "error") dom.aiError.classList.remove("hidden");
}

async function analyzeSymptoms() {
  const symptoms = dom.symptomInput.value.trim();

  if (!symptoms) {
    dom.aiErrorMsg.textContent = "Please describe your symptoms before analyzing.";
    setAiState("error");
    return;
  }

  setAiState("loading");

  const prompt = `You are an experienced hospital triage nurse. A patient describes their symptoms below. Based ONLY on what they describe, recommend which hospital bed type they need.

STRICT TRIAGE RULES — follow these carefully:

**General Ward** — for non-life-threatening, stable conditions:
- Common fever, cold, cough, mild body ache, headache
- Mild to moderate abdominal pain, nausea, vomiting, diarrhea
- General weakness, fatigue, joint pain, back pain
- Routine infections, skin issues, minor injuries
- Chronic condition flare-ups (diabetes, hypertension) without danger signs

**Emergency** — for acute, potentially dangerous conditions needing IMMEDIATE attention:
- High fever (>103°F) with confusion or rash
- Severe abdominal pain (sharp, sudden, unbearable)
- Injuries: fractures, heavy bleeding, burns, accidents
- Sudden severe headache ("worst headache of my life")
- Allergic reactions with swelling/breathing trouble
- Seizures, fainting, sudden vision loss
- Poisoning or overdose

**ICU** — for critical, life-threatening conditions needing continuous monitoring:
- Breathing difficulty, oxygen dropping, respiratory failure
- Chest pain with heart attack signs (radiating arm/jaw pain, sweating)
- Stroke symptoms (face drooping, arm weakness, slurred speech)
- Severe trauma or post-surgery critical care
- Organ failure signs, sepsis, unconsciousness
- Severe COVID/pneumonia with breathing distress

IMPORTANT: Do NOT over-triage. Most common symptoms (fever, body ache, headache, mild stomach pain) go to **General**, not Emergency. Only escalate when symptoms clearly indicate danger or life-threat.

Also provide simple home remedies for IMMEDIATE RELIEF while the patient is on their way to the hospital. Only suggest safe, common remedies (hydration, rest, warm compress, ORS, etc.). For serious/critical symptoms, skip home remedies and say "Please seek medical attention immediately without delay."

Respond ONLY in this exact JSON format, no markdown, no code fences:
{"bedType":"General or Emergency or ICU","explanation":"One clear sentence explaining why this bed type, referencing the specific symptoms.","homeRemedy":"2-3 short, practical home remedy tips for immediate relief, separated by semicolons."}

Patient's symptoms: ${symptoms}`;

  try {
    let res;
    let lastStatus = 0;
    const maxAttempts = 5;
    const baseDelay = 1000; // 1s
    let success = false;
    for (const model of GEMINI_MODELS) {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        res = await fetch(geminiUrl(model), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          }),
        });
        lastStatus = res.status;
        if (res.ok) {
          success = true;
          break;
        }
        if (res.status === 429 && attempt < maxAttempts) {
          // Exponential backoff
          await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt - 1)));
          continue;
        } else {
          break;
        }
      }
      if (success) break;
    }

    if (!res || !res.ok) throw new Error(`API error: ${lastStatus}`);

    const data = await res.json();

    // Extract text from all candidate parts
    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts.map((p) => p.text || "").join("").trim();

    if (!text) throw new Error("Empty response from AI");

    // Clean: strip code fences, whitespace
    let clean = text.replace(/```json?\s*/gi, "").replace(/```/g, "").trim();

    // Parse JSON — try direct parse first, then regex extraction
    let result;
    try {
      result = JSON.parse(clean);
    } catch {
      // Extract the last complete JSON object (greedy braces)
      const jsonMatch = clean.match(/\{[^{}]*("bedType")[^{}]*\}/);
      if (!jsonMatch) throw new Error("No valid JSON found in AI response");
      result = JSON.parse(jsonMatch[0]);
    }

    const rawBedType = (result.bedType || "").trim().toLowerCase();
    const explanation = result.explanation || "Please consult a doctor for detailed evaluation.";
    const homeRemedy = result.homeRemedy || "";

    // Normalize bed type — accept variations like "general ward", "icu bed", "emergency room"
    let bedType;
    if (rawBedType.includes("icu")) bedType = "ICU";
    else if (rawBedType.includes("general")) bedType = "General";
    else if (rawBedType.includes("emergency")) bedType = "Emergency";
    else bedType = "General"; // safe default for unrecognized responses

    dom.aiBedType.textContent = `Suggested Bed Type: ${bedType}`;
    dom.aiExplanation.textContent = explanation;

    // Show home remedies
    const remedyEl = document.getElementById("ai-remedy");
    if (homeRemedy) {
      const tips = homeRemedy.split(";").map((t) => t.trim()).filter(Boolean);
      remedyEl.innerHTML = `
        <h4>🏠 Home Remedies for Immediate Relief</h4>
        <ul>${tips.map((t) => `<li>${t}</li>`).join("")}</ul>
      `;
      remedyEl.classList.remove("hidden");
    } else {
      remedyEl.classList.add("hidden");
    }

    setAiState("result");

    dom.aiApplyBtn.dataset.bedType = bedType.toLowerCase();
  } catch (err) {
    console.error("AI analysis failed:", err.message, err);
    dom.aiErrorMsg.textContent =
      "Unable to analyze symptoms (" + err.message + "). Please try again or consult a medical professional.";
    setAiState("error");
  }
}

function applyAiFilter() {
  const bedType = dom.aiApplyBtn.dataset.bedType;
  if (!bedType) return;

  dom.bedType.value = bedType;
  currentFilter.bedType = bedType;
  renderHospitals(currentFilter.bedType, currentFilter.location);

  dom.hospitalSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ===== Init: Load Real Hospitals ===== */

async function initApp() {
  showLoading();

  try {
    await loadRealHospitals((state, msg) => setGpsBanner(state, msg));
    hideLoading();
    renderHospitals(currentFilter.bedType, currentFilter.location);

    // Simulate bed count changes every 30s
    updateInterval = setInterval(simulateBedUpdate, 30000);
  } catch (err) {
    hideLoading();
    console.error("Init failed:", err);

    if (!err.message.includes("Geolocation")) {
      setGpsBanner("api-error", "Failed to fetch hospitals: " + err.message);
    }
    dom.emptyState.classList.remove("hidden");
  }
}

/* ===== Event Listeners ===== */

dom.searchBtn.addEventListener("click", async () => {
  const bedType = dom.bedType.value;
  const location = dom.location.value.trim();

  currentFilter.bedType = bedType;
  currentFilter.location = location;

  // If user typed a location, geocode it and fetch new hospitals for that area
  if (location) {
    showLoading();
    try {
      await loadHospitalsForLocation(location, (state, msg) => setGpsBanner(state, msg));
      hideLoading();
      renderHospitals(bedType, ""); // no text filter needed — data is already for that location
    } catch (err) {
      hideLoading();
      console.error("Location search failed:", err);
      setGpsBanner("api-error", err.message);
      dom.hospitalGrid.innerHTML = "";
      dom.emptyState.classList.remove("hidden");
    }
  } else {
    // No location typed — just filter existing loaded hospitals by bed type
    renderHospitals(bedType, "");
  }
});

dom.location.addEventListener("keydown", (e) => {
  if (e.key === "Enter") dom.searchBtn.click();
});

dom.analyzeBtn.addEventListener("click", analyzeSymptoms);
dom.aiApplyBtn.addEventListener("click", applyAiFilter);

dom.hospitalGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (btn) openModal(Number(btn.dataset.id));
});

dom.modalClose.addEventListener("click", closeModal);
dom.detailModal.addEventListener("click", (e) => {
  if (e.target === dom.detailModal) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

dom.gpsRetry.addEventListener("click", () => {
  initApp();
});

/* ===== Start ===== */
initApp();
