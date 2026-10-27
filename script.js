const STORAGE_KEY = "littlePagesDiaryEntries";

const form = document.querySelector("#entry-form");
const titleInput = document.querySelector("#entry-title");
const moodInput = document.querySelector("#entry-mood");
const textInput = document.querySelector("#entry-text");
const entriesList = document.querySelector("#entries-list");
const emptyState = document.querySelector("#empty-state");
const entryCount = document.querySelector("#entry-count");
const statusMessage = document.querySelector("#status-message");

document.querySelector("#today-date").textContent = new Date().toLocaleDateString(
  undefined, { month: "short", day: "numeric", year: "numeric" }
);

function getEntries() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Could not read diary entries:", error);
    return [];
  }
}

function saveEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error("Could not save diary entries:", error);
    statusMessage.textContent = "Could not save. Check your browser storage settings.";
    return false;
  }
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderEntries() {
  const entries = getEntries().sort((a, b) => b.createdAt - a.createdAt);
  entriesList.replaceChildren();
  entryCount.textContent = `${entries.length} ${entries.length === 1 ? "page" : "pages"}`;
  emptyState.hidden = entries.length > 0;

  entries.forEach((entry) => {
    const card = makeElement("article", "entry-card");
    const top = makeElement("div", "entry-top");
    const headingGroup = makeElement("div");
    const title = makeElement("h3", "entry-title", entry.title);
    const date = makeElement("p", "entry-meta", new Date(entry.createdAt).toLocaleString(
      undefined, { dateStyle: "medium", timeStyle: "short" }
    ));
    const deleteButton = makeElement("button", "delete-button", "Delete");
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", `Delete diary entry: ${entry.title}`);
    deleteButton.addEventListener("click", () => deleteEntry(entry.id));

    const mood = makeElement("span", "entry-mood", entry.mood);
    const body = makeElement("p", "entry-body", entry.text);

    headingGroup.append(title, date);
    top.append(headingGroup, deleteButton);
    card.append(top, mood, body);
    entriesList.append(card);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const text = textInput.value.trim();
  if (!title || !text) {
    statusMessage.textContent = "Please add a title and your thoughts first.";
    return;
  }

  const entries = getEntries();
  entries.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    mood: moodInput.value,
    text,
    createdAt: Date.now()
  });

  if (saveEntries(entries)) {
    form.reset();
    moodInput.value = "🌷 Calm";
    statusMessage.textContent = "Your page has been saved. Take a little breath. ♡";
    renderEntries();
  }
});

function deleteEntry(id) {
  const entries = getEntries().filter((entry) => entry.id !== id);
  if (saveEntries(entries)) {
    statusMessage.textContent = "Diary page deleted.";
    renderEntries();
  }
}

renderEntries();
