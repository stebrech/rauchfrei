// Get the current values from the form
const form = document.getElementById("form-settings");
let startDate,
  startDateMs,
  amountSmoked,
  pricePerPiece,
  today,
  todayMs,
  country,
  separator,
  decimal,
  currencyIso;
function getSettings() {
  startDate = document.getElementById("start-date");
  startDateMs = new Date(startDate.value).getTime();
  amountSmoked = document.getElementById("amount-smoked").value;
  pricePerPiece = document.getElementById("price-per-piece").value;
  today = new Date();
  todayMs = new Date().getTime();
  country = document.getElementById("country").value;
  separator = document.getElementById("separator").value;
  decimal = document.getElementById("decimal").value;
  currencyIso = document.getElementById("currency").value;
}
getSettings();

// Get the values from the local storage or initialize them
let settingsSaved = localStorage.getItem("settingsSaved") || "";
let streak = localStorage.getItem("streak") || 0;
let credits = localStorage.getItem("credits") || 0;
let streakDays = localStorage.getItem("streakDays") || 0;
let streakMonths = localStorage.getItem("streakMonths") || 0;
let streakYears = localStorage.getItem("streakYears") || 0;

// Close settings
document
  .getElementById("submit-settings")
  .addEventListener("click", function () {
    document.getElementById("settings").style.display = "none";
  });

// Toggle settings
const settingsBtn = document.getElementById("settings-btn");
const settings = document.getElementById("settings");
const overview = document.getElementById("overview");
const contentWrapper = document.getElementById("content-wrapper");

settingsBtn.addEventListener("click", () => {
  if (settings.style.display === "block") {
    settings.style.display = "none";
    settingsBtn.setAttribute("aria-expanded", "false");
    overview.style.display = "flex";
    contentWrapper.style.display = "flex";
  } else {
    settings.style.display = "block";
    settingsBtn.setAttribute("aria-expanded", "true");
    overview.style.display = "none";
    contentWrapper.style.display = "none";
  }
});

// If settings once saved, hide the settings form and fill the values
if (settingsSaved !== "") {
  document.getElementById("settings").style.display = "none";
  document.getElementById("start-date").value =
    localStorage.getItem("start-date");
  document.getElementById("amount-smoked").value =
    localStorage.getItem("amount-smoked");
  document.getElementById("price-per-piece").value =
    localStorage.getItem("price-per-piece");
  document.getElementById("country").value = localStorage.getItem("country");
  document.getElementById("separator").value =
    localStorage.getItem("separator");
  document.getElementById("decimal").value = localStorage.getItem("decimal");
  document.getElementById("currency").value = localStorage.getItem("currency");
} else {
  // Initially show settings
  document.getElementById("settings").style.display = "block";
  // Initially hide the overview
  document.getElementById("overview").style.display = "none";
}

// Fill in the values saved in the local storage
if (streak != 0) {
  document.querySelector("#streak").textContent = streak;
}
if (credits != 0) {
  document.querySelector("#savings-amount").textContent = credits;
}

// Update the values on form submit
form.addEventListener("submit", (event) => {
  event.preventDefault();
  getSettings();
  const data = new FormData(form);

  localStorage.setItem("settingsSaved", today);
  localStorage.setItem("country", data.get("country"));
  localStorage.setItem("separator", data.get("separator"));
  localStorage.setItem("decimal", data.get("decimal"));
  localStorage.setItem("currency", data.get("currency"));
  localStorage.setItem("start-date", data.get("start-date"));
  localStorage.setItem("amount-smoked", data.get("amount-smoked"));
  localStorage.setItem("price-per-piece", data.get("price-per-piece"));

  calculateStreak();
  calculateCredits();
  calculateLevel();

  document.getElementById("overview").style.display = "flex";
});

// Fetch the json data
async function fetchJSONData(jsonData) {
  try {
    const res = await fetch(jsonData);
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Unable to fetch data:", error);
    return null;
  }
}

const countryInput = document.getElementById("country");
countryInput.addEventListener("change", async () => {
  const selectedCountry = countryInput.value;
  await fetchJSONData("/data/countries.json")
    .then((data) => {
      const countryData = data.find((item) => item.iso2 === selectedCountry);
      if (countryData) {
        document.getElementById("currency").value = countryData.currency;
      }
    })
    .catch((error) =>
      console.error("Unable to fetch data from countries.json:", error)
    );
  await fetchJSONData("/data/separatorCountries.json")
    .then((data) => {
      const countryData = data.find(
        (item) => item.iso_code === selectedCountry
      );
      if (countryData) {
        document.getElementById("separator").value =
          countryData.thousand_separator;
        document.getElementById("decimal").value =
          countryData.decimal_separator;
      }
    })
    .catch((error) =>
      console.error("Unable to fetch data from separatorCountries.json:", error)
    );
});

// Function to calculate the streak
function calculateStreak() {
  getSettings();

  streak = Math.floor((todayMs - startDateMs) / (1000 * 60 * 60 * 24));
  console.log(`Streak: ${streak}`);

  // Get streak in years, months and days
  streakYears = Math.floor(streak / 365);
  streakMonths = Math.floor(streak / 30);
  streakDays = streak;
  streakMonths -= streakYears * 12;
  streakDays -= streakYears * 365 + streakMonths * 30;

  localStorage.setItem("streak", streak);
  localStorage.setItem("streakDays", streakDays);
  localStorage.setItem("streakMonths", streakMonths);
  localStorage.setItem("streakYears", streakYears);
  document.getElementById("streak").innerText = localStorage.getItem("streak");
}

// Function to calculate the credits
function calculateCredits() {
  // get current settings
  getSettings();

  // calculate credits with currency.js
  credits = currency(streak * amountSmoked * pricePerPiece, {
    separator: separator,
    decimal: decimal,
    symbol: currencyIso + " ",
  }).format();
  console.log(`Credits: ${credits}`);
  localStorage.setItem("credits", credits);

  const savedStartDate = new Date(localStorage.getItem("start-date"));
  const formattedDate = savedStartDate.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  document.getElementById("savings-amount").innerText =
    localStorage.getItem("credits");
  document.getElementById("savings-date").innerText = formattedDate;
}

export function calculateLevel() {
  // Get the level based on streak
  let level = 0;
  if (streak >= 1) {
    level = 2;
    document.getElementById("level1").classList.add("achieved");
    document.getElementById("level2").classList.add("achieved");
  }
  if (streak >= 14) {
    level = 3;
    document.getElementById("level3").classList.add("achieved");
  }
  if (streak >= 30) {
    level = 4;
    document.getElementById("level4").classList.add("achieved");
  }
  if (streak >= 365) {
    level = 5;
    document.getElementById("level5").classList.add("achieved");
  }
  if (streak >= 730) {
    level = 6;
    document.getElementById("level6").classList.add("achieved");
  }
  if (streak >= 1826) {
    level = 7;
    document.getElementById("level7").classList.add("achieved");
  }
  if (streak >= 3652) {
    level = 8;
    document.getElementById("level8").classList.add("achieved");
  }
  if (streak >= 5479) {
    level = 9;
    document.getElementById("level9").classList.add("achieved");
  }

  localStorage.setItem("level", level);
  document.getElementById("level").innerText = localStorage.getItem("level");
  return level;
}

// Run the function on page loadformat
calculateStreak();
calculateCredits();
calculateLevel();
