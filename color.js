let colorConfig = {
  "Account Type": {
    "Normal": 1,
    "Islamic": 2
  },
  "LP": {
    "No": 0,
    "IS": 1,
    "LMAX": 2,
    "CFH": 3,
    "B2B": 4,
    "INVAST": 5,
    "STP Hard": 8,
    "STP Soft": 9
  },
  "A-Book %": {
    "No": 0,
    "10%": 1,
    "30%": 2,
    "50%": 3,
    "70%": 4,
    "100%": 5
  },
  "Exceptions": {
    "No Action": 0,
    "Hard Delay": 1,
    "Soft Delay": 2,
    "Close Only": 3,
    "Lev-H": 4,
    "Lev-M": 5,
    "Lev-S": 6
  },
  "Swap Cancellation": {
    "No": 0,
    "Swap Cancellation": 1,
    "Swap Cancellation Limited": 2
  },
  "Market Depth": {
    "No": 0,
    "News Trader Hard": 1,
    "News Trader Soft": 2,
    "High Risk Hard": 3,
    "High Risk Soft": 4,
    "Low Risk Hard": 5,
    "Low Risk Soft": 6,
    "Rollover Hard": 7,
    "Rollover Soft": 8,
    "Market Depth Exemption": 9
  }
};

// ------------------------
// CONVERSIONS
// ------------------------
function rgbToMq(r, g, b) {
  return r + g * 256 + b * 256 * 256;
}

function rgbToHexa(r, g, b) {
  const hex = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}

function hexaToRgb(hexa) {
  hexa = String(hexa).trim().replace(/^#/, "");
  if (hexa.length === 3) hexa = hexa.split("").map((c) => c + c).join("");
  const r = parseInt(hexa.substring(0, 2), 16);
  const g = parseInt(hexa.substring(2, 4), 16);
  const b = parseInt(hexa.substring(4, 6), 16);
  return { r, g, b };
}

function mqToRgb(mq) {
  mq = Number(mq);
  return {
    r: mq % 256,
    g: Math.floor(mq / 256) % 256,
    b: Math.floor(mq / 65536) % 256
  };
}

function hexaToMq(hexa) {
  const { r, g, b } = hexaToRgb(hexa);
  return rgbToMq(r, g, b);
}

function mqToHexa(mq) {
  const { r, g, b } = mqToRgb(mq);
  return rgbToHexa(r, g, b);
}

// ------------------------
// VALIDATION
// ------------------------
function isValidHex(hex) {
  if (typeof hex !== "string") return false;
  const clean = hex.trim().replace(/^#/, "");
  return /^[0-9A-Fa-f]{6}$/.test(clean) || /^[0-9A-Fa-f]{3}$/.test(clean);
}

function isValidDecimalRGB(s) {
  if (typeof s !== "string") return false;
  if (!/^\s*\d+\s*,\s*\d+\s*,\s*\d+\s*$/.test(s)) return false;
  const [r, g, b] = s.split(",").map((x) => Number(x.trim()));
  const inRange = (n) => Number.isInteger(n) && n >= 0 && n <= 255;
  return inRange(r) && inRange(g) && inRange(b);
}

function isValidMqNumber(s) {
  if (s === null || s === undefined) return false;
  const str = String(s).trim();
  return /^\d{1,5}$/.test(str);
}

// ------------------------
// UI HELPERS
// ------------------------
function setPreview(hexColor) {
  const box = document.getElementById("colorPreview");
  if (box && typeof hexColor === "string") {
    box.style.backgroundColor = hexColor;
    box.textContent = hexColor.toUpperCase();
    const rgb = hexaToRgb(hexColor);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    box.style.color = brightness > 128 ? "#000" : "#FFF";
  }
}

function decodeDigitsToLabels(mqColor) {
  const mqString = String(mqColor).padStart(5, "0");
  const digits = mqString.split("").map(Number);
  const sections = ["Account Type", "LP", "A-Book %", "Swap Cancellation", "Market Depth"];
  const labels = sections.map((section, i) => {
    const val = digits[i];
    return Object.keys(colorConfig[section]).find((k) => colorConfig[section][k] === val) ?? "Unknown";
  });
  return { digits, labels };
}

// ------------------------
// POPULATE DROPDOWNS
// ------------------------
function populateDropdown(id, opts) {
  const dropdown = document.getElementById(id);
  dropdown.innerHTML = "";
  for (const [label, value] of Object.entries(opts)) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    dropdown.appendChild(option);
  }
}

function updateDropdownStates() {
  const lpValue = Number(document.getElementById("lp").value);
  const bookDropdown = document.getElementById("book");
  const exceptionDropdown = document.getElementById("exceptions");

  if (lpValue === 0) {
    bookDropdown.disabled = true;
    bookDropdown.style.backgroundColor = "#3a3a3a";
    exceptionDropdown.disabled = false;
    exceptionDropdown.style.backgroundColor = "";
  } else {
    bookDropdown.disabled = false;
    bookDropdown.style.backgroundColor = "";
    exceptionDropdown.disabled = true;
    exceptionDropdown.style.backgroundColor = "#3a3a3a";
  }
}

function handleExceptionChange() {
  const exceptionValue = Number(document.getElementById("exceptions").value);
  const lpDropdown = document.getElementById("lp");
  const bookDropdown = document.getElementById("book");

  if (exceptionValue !== 0) {
    lpDropdown.disabled = true;
    lpDropdown.style.backgroundColor = "#3a3a3a";
    bookDropdown.disabled = true;
    bookDropdown.style.backgroundColor = "#3a3a3a";
  } else {
    lpDropdown.disabled = false;
    lpDropdown.style.backgroundColor = "";
    updateDropdownStates();
  }
}

// Initialize
populateDropdown("accountType", colorConfig["Account Type"]);
populateDropdown("lp", colorConfig["LP"]);
populateDropdown("book", colorConfig["A-Book %"]);
populateDropdown("exceptions", colorConfig["Exceptions"]);
populateDropdown("swapsStorage", colorConfig["Swap Cancellation"]);
populateDropdown("marketDepthDelay", colorConfig["Market Depth"]);
updateDropdownStates();

document.getElementById("lp").addEventListener("change", updateDropdownStates);
document.getElementById("exceptions").addEventListener("change", handleExceptionChange);

// ------------------------
// MAIN COLOR OUTPUT
// ------------------------
function populateColor(mqColor, hexColor, rgbColor) {
  document.getElementById("mqColor").textContent = mqColor;
  document.getElementById("hexColor").textContent = hexColor;
  document.getElementById("decimalColor").textContent = `${rgbColor.r},${rgbColor.g},${rgbColor.b}`;
  setPreview(hexColor);
}

// Generate color
document.getElementById("configSubmit").addEventListener("click", (e) => {
  e.preventDefault();
  const accountType = document.getElementById("accountType").value;
  const lp = document.getElementById("lp").value;
  const book = document.getElementById("book").value;
  const exceptions = document.getElementById("exceptions").value;
  const swapsStorage = document.getElementById("swapsStorage").value;
  const marketDepthDelay = document.getElementById("marketDepthDelay").value;

  let mqColor;
  if (lp === "0") mqColor = Number(`${accountType}${lp}${exceptions}${swapsStorage}${marketDepthDelay}`);
  else mqColor = Number(`${accountType}${lp}${book}${swapsStorage}${marketDepthDelay}`);

  const hexColor = mqToHexa(mqColor);
  const rgbColor = mqToRgb(mqColor);
  populateColor(mqColor, hexColor, rgbColor);
});

// ------------------------
// REVERSE: MQ / HEX / RGB
// ------------------------
function populateDecodedLabels(prefix, labels, mqColor, hexCode, rgbCode) {
  const ids = [`${prefix}AccountType`, `${prefix}Lp`, `${prefix}Book`, `${prefix}SwapsStorage`, `${prefix}MarketDepthDelay`];
  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.textContent = labels[i];
  });
  if (document.getElementById(`${prefix}ColorFromMq`)) document.getElementById(`${prefix}ColorFromMq`).textContent = mqColor;
  if (document.getElementById(`${prefix}ColorFromHex`)) document.getElementById(`${prefix}ColorFromHex`).textContent = hexCode;
  if (document.getElementById(`${prefix}ColorFromRgb`)) document.getElementById(`${prefix}ColorFromRgb`).textContent = rgbCode;
  setPreview(hexCode);
}

// MQ → Decode
document.getElementById("mqsubmit").addEventListener("click", (e) => {
  e.preventDefault();
  const mqColor = document.getElementById("mqColorCode").value;
  if (!isValidMqNumber(mqColor)) return alert("Invalid MQ number (1–5 digits).");
  const { labels } = decodeDigitsToLabels(mqColor);
  const hexCode = mqToHexa(mqColor);
  const { r, g, b } = mqToRgb(mqColor);
  const rgbCode = `${r},${g},${b}`;
  populateDecodedLabels("mq", labels, mqColor, hexCode, rgbCode);
});

// HEX → Decode
document.getElementById("hexsubmit").addEventListener("click", (e) => {
  e.preventDefault();
  const hexColor = document.getElementById("hexColorCode").value;
  if (!isValidHex(hexColor)) return alert("Invalid HEX format (#RRGGBB).");
  const mqColor = hexaToMq(hexColor);
  const { labels } = decodeDigitsToLabels(mqColor);
  const { r, g, b } = mqToRgb(mqColor);
  const rgbCode = `${r},${g},${b}`;
  populateDecodedLabels("hex", labels, mqColor, hexColor, rgbCode);
});

// RGB → Decode
document.getElementById("decimalsubmit").addEventListener("click", (e) => {
  e.preventDefault();
  const rgbColor = document.getElementById("decimalColorCode").value;
  if (!isValidDecimalRGB(rgbColor)) return alert("Invalid RGB format (e.g., 16,39,0).");
  const [r, g, b] = rgbColor.split(",").map(Number);
  const mqColor = rgbToMq(r, g, b);
  const { labels } = decodeDigitsToLabels(mqColor);
  const hexCode = mqToHexa(mqColor);
  populateDecodedLabels("decimal", labels, mqColor, hexCode, rgbColor);
});

// ------------------------
// COPY BUTTONS (restored)
// ------------------------
function copyText(elementId, btnElement) {
  const target = document.getElementById(elementId);
  const copiedMsg = btnElement.parentElement.querySelector(".copied");
  let text = target?.textContent?.trim() || "";

  // fallback for hex preview
  if (!text && elementId === "hexColor") {
    const preview = document.getElementById("colorPreview");
    if (preview) text = preview.textContent.trim();
  }

  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    if (copiedMsg) {
      copiedMsg.classList.add("show");
      setTimeout(() => copiedMsg.classList.remove("show"), 1000);
    }
  });
}