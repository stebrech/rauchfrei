// Get the current values from the form
const form = document.getElementById("form-settings");
let startDate,
	startDateMs,
	ammountSmoked,
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
	ammountSmoked = document.getElementById("ammount-smoked").value;
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

settingsBtn.addEventListener("click", () => {
	if (settings.style.display === "block") {
		settings.style.display = "none";
		settingsBtn.setAttribute("aria-expanded", "false");
	} else {
		settings.style.display = "block";
		settingsBtn.setAttribute("aria-expanded", "true");
	}
});

// If settings once saved, hide the settings form and fill the values
if (settingsSaved !== "") {
	document.getElementById("settings").style.display = "none";
	document.getElementById("start-date").value =
		localStorage.getItem("start-date");
	document.getElementById("ammount-smoked").value =
		localStorage.getItem("ammount-smoked");
	document.getElementById("price-per-piece").value =
		localStorage.getItem("price-per-piece");
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
	document.querySelector("#credits").textContent = credits;
}

// Update the values on form submit
form.addEventListener("submit", (event) => {
	event.preventDefault();
	getSettings();
	const data = new FormData(form);

	localStorage.setItem("settingsSaved", today);
	localStorage.setItem("start-date", data.get("start-date"));
	localStorage.setItem("ammount-smoked", data.get("ammount-smoked"));
	localStorage.setItem("price-per-piece", data.get("price-per-piece"));
	localStorage.setItem("separator", data.get("separator"));
	localStorage.setItem("decimal", data.get("decimal"));
	localStorage.setItem("currency", data.get("currency"));

	calculateStreak();
	calculateCredits();

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

	// Set streak text
	let streakText = `${streak} Tag${streak !== 1 ? "e" : ""}`;
	const parts = [];

	if (streakYears > 0) {
		parts.push(`${streakYears} Jahr${streakYears !== 1 ? "e" : ""}`);
	}
	if (streakMonths > 0) {
		parts.push(`${streakMonths} Monat${streakMonths !== 1 ? "e" : ""}`);
	}
	if (streakDays > 0 && (streakMonths > 0 || streakYears > 0)) {
		parts.push(`${streakDays} Tag${streakDays !== 1 ? "e" : ""}`);
	}
	if (parts.length > 0) {
		streakText += ` (${parts.join(", ")})`;
	}

	localStorage.setItem("streak", streak);
	localStorage.setItem("streakDays", streakDays);
	localStorage.setItem("streakMonths", streakMonths);
	localStorage.setItem("streakYears", streakYears);
	localStorage.setItem("streakText", streakText);
	document.getElementById("streak").innerHTML = `<strong>${localStorage.getItem(
		"streakText"
	)}</strong><br>Streak (Serie in Tagen)`;
}

// Function to calculate the credits
function calculateCredits() {
	// get current settings
	getSettings();

	// calculate credits with currency.js
	credits = currency(streak * ammountSmoked * pricePerPiece, {
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

	document.getElementById(
		"credits"
	).innerHTML = `<strong>${localStorage.getItem(
		"credits"
	)}</strong><br>seit dem ${formattedDate} gespart`;
}

// Run the function on page load
calculateStreak();
calculateCredits();
