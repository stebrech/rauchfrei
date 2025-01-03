// Get the current values from the form
const form = document.getElementById("form-settings");
const startDate = document.getElementById("start-date");
const startDateMs = new Date(startDate.value).getTime();
const todayMs = new Date().getTime();
const separator = document.getElementById("separator").value;
const decimal = document.getElementById("decimal").value;
const currencySymbol = document.getElementById("currency").value;

// Get the values from the local storage or initialize them
let settingsSaved = localStorage.getItem("settingsSaved") || false;
let streak = localStorage.getItem("streak") || 0;
let credits = localStorage.getItem("credits") || 0;
let streakDays = localStorage.getItem("streakDays") || 0;
let streakMonths = localStorage.getItem("streakMonths") || 0;
let streakYears = localStorage.getItem("streakYears") || 0;

// Initially show settings
document.getElementById("settings").style.display = "block";

// Open settings
document
	.getElementById("settings-link")
	.addEventListener("click", function (event) {
		event.preventDefault();
		document.getElementById("settings").style.display = "block";
	});

// Close settings
document
	.getElementById("submit-settings")
	.addEventListener("click", function () {
		document.getElementById("settings").style.display = "none";
	});

// If settings once saved, hide the settings form and fill the values
if (settingsSaved) {
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
}

if (streak != 0) {
	document.querySelector("#streak").textContent = streak;
}

if (credits != 0) {
	document.querySelector("#credits").textContent = credits;
}

form.addEventListener("submit", (event) => {
	event.preventDefault();
	const data = new FormData(form);

	localStorage.setItem("settingsSaved", true);
	localStorage.setItem("start-date", data.get("start-date"));
	localStorage.setItem("ammount-smoked", data.get("ammount-smoked"));
	localStorage.setItem("price-per-piece", data.get("price-per-piece"));
	localStorage.setItem("separator", data.get("separator"));
	localStorage.setItem("decimal", data.get("decimal"));
	localStorage.setItem("currency", data.get("currency"));

	calculateStreak();
	calculateCredits();
});

function calculateStreak() {
	const startDateMs = new Date(startDate.value).getTime();
	const todayMs = new Date().getTime();

	streak = Math.floor((todayMs - startDateMs) / (1000 * 60 * 60 * 24));
	console.log(`Streak: ${streak}`);

	// Get streak in years, months and days
	streakYears = Math.floor(streak / 365);
	streakMonths = Math.floor(streak / 30);
	streakDays = streak;
	streakMonths -= streakYears * 12;
	streakDays -= streakMonths * 30;

	// Set streak text
	let streakText;
	if (streak == 1) {
		streakText = `${streak} Tag (`;
	} else {
		streakText = `${streak} Tage (`;
	}
	if (streakYears > 0) {
		if (streakYears == 1) {
			streakText += `${streakYears} Jahr `;
		} else {
			streakText += `${streakYears} Jahre `;
		}
	}
	if (streakMonths > 0) {
		if (streakMonths == 1) {
			streakText += `${streakMonths} Monat `;
		} else {
			streakText += `${streakMonths} Monate `;
		}
	}
	if (streakDays > 0 && (streakMonths == 0 || streakYears == 0)) {
		if (streakDays == 1) {
			streakText += `${streakDays} Tag`;
		} else {
			streakText += `${streakDays} Tage`;
		}
	}
	streakText += ")";
	localStorage.setItem("streak", streak);
	localStorage.setItem("streakDays", streakDays);
	localStorage.setItem("streakMonths", streakMonths);
	localStorage.setItem("streakYears", streakYears);
	localStorage.setItem("streakText", streakText);
	document.getElementById("streak").innerHTML = `<strong>${localStorage.getItem(
		"streakText"
	)}</strong><br>Streak (Serie in Tagen)`;
}

function calculateCredits() {
	const ammountSmoked = document.getElementById("ammount-smoked").value;
	const pricePerPiece = document.getElementById("price-per-piece").value;
	credits = currency(streak * ammountSmoked * pricePerPiece, {
		separator: separator,
		decimal: decimal,
		symbol: currencySymbol + " ",
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

calculateStreak();
calculateCredits();
