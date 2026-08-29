const statsEndpoint = new URL("../api/stats", document.currentScript.src);
const loginForm = document.getElementById("login");
const tokenInput = document.getElementById("admin-token");
const periodSelect = document.getElementById("period");
const refreshButton = document.getElementById("refresh");
const status = document.getElementById("status");
const content = document.getElementById("analytics-content");

let adminToken = sessionStorage.getItem("analyticsAdminToken") || "";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function addCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value;
  row.append(cell);
}

function renderRows(targetId, rows, columns, emptyMessage) {
  const body = document.getElementById(targetId);
  body.replaceChildren();

  if (rows.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = columns.length;
    cell.textContent = emptyMessage;
    row.append(cell);
    body.append(row);
    return;
  }

  for (const item of rows) {
    const row = document.createElement("tr");
    for (const column of columns) {
      addCell(row, item[column] ?? "—");
    }
    body.append(row);
  }
}

function renderAnalytics(data) {
  document.getElementById("total-views").textContent = data.overview.views;
  document.getElementById("unique-visitors").textContent = data.overview.unique_visitors;

  const activeDays = data.daily
    .filter((day) => Number(day.views) > 0)
    .map((day) => ({
      ...day,
      day: dateFormatter.format(new Date(day.day)),
    }));

  renderRows(
    "daily-traffic",
    activeDays,
    ["day", "views", "unique_visitors"],
    "No traffic yet",
  );
  renderRows("top-pages", data.pages, ["path", "views"], "No routes yet");
  renderRows(
    "top-referrers",
    data.referrers,
    ["referrer_host", "views"],
    "No external referrers yet",
  );
}

async function loadAnalytics() {
  if (!adminToken) {
    loginForm.hidden = false;
    content.hidden = true;
    return;
  }

  status.textContent = "Loading…";
  refreshButton.disabled = true;

  const endpoint = new URL(statsEndpoint);
  endpoint.searchParams.set("days", periodSelect.value);

  try {
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${adminToken}` },
      cache: "no-store",
    });
    const data = await response.json();

    if (response.status === 401) {
      sessionStorage.removeItem("analyticsAdminToken");
      adminToken = "";
      loginForm.hidden = false;
      content.hidden = true;
      throw new Error("That admin token was not accepted.");
    }

    if (!response.ok) {
      throw new Error(data.error || "Unable to load analytics.");
    }

    renderAnalytics(data);
    loginForm.hidden = true;
    content.hidden = false;
    status.textContent = `Showing the last ${data.periodDays} days.`;
  } catch (error) {
    status.textContent = error.message;
  } finally {
    refreshButton.disabled = false;
  }
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  adminToken = tokenInput.value;
  sessionStorage.setItem("analyticsAdminToken", adminToken);
  tokenInput.value = "";
  loadAnalytics();
});

periodSelect.addEventListener("change", loadAnalytics);
refreshButton.addEventListener("click", loadAnalytics);

loadAnalytics();
