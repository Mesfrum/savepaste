import "./style.css";

const previewEle = document.getElementById("preview") as HTMLImageElement;
const messageEle = document.getElementById("message") as HTMLParagraphElement;
const infoEle = document.getElementById("info") as HTMLParagraphElement;
const toastEle = document.getElementById("toast") as HTMLDivElement;
const galleryEle = document.getElementById("gallery") as HTMLDivElement;
const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const clearBtn = document.getElementById("clearBtn") as HTMLButtonElement;
const toggleSidebarBtn = document.getElementById(
  "toggleSidebar"
) as HTMLButtonElement;
const sidebar = document.getElementById("sidebar") as HTMLDivElement;
const overlay = document.getElementById("overlay") as HTMLDivElement;
const sidebarToggleIcon = document.getElementById(
  "sidebar-toggle-icon"
) as HTMLSpanElement;

type Paste = { blob: Blob; url: string; name: string };

const pastes: Paste[] = [];
let current: Paste | null = null;

const FOLDER_KEY = "downloadFolder";

function getFolder(): string {
  try {
    return localStorage.getItem(FOLDER_KEY) ?? "";
  } catch {
    return "";
  }
}

// Function to check if the user is on a mobile device
function isMobileDevice(): boolean {
  return window.innerWidth < 630;
}

// Set the initial state of the sidebar based on the device type
if (isMobileDevice()) {
  sidebar.classList.add("open");
  overlay.classList.add("open");
  sidebarToggleIcon.classList.add("open");
} else {
  sidebar.classList.remove("open");
  overlay.classList.remove("open");
  sidebarToggleIcon.classList.remove("open");
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
};

function extensionFor(type: string): string {
  return EXTENSIONS[type] ?? type.replace(/^image\//, "").split("+")[0];
}

function timestamp(): string {
  const d = new Date();
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(
    d.getHours()
  )}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
}

// Unique within the session, so several pastes in one second don't collide.
function makeName(type: string): string {
  const base = `savepaste-${timestamp()}`;
  const ext = extensionFor(type);
  let name = `${base}.${ext}`;
  for (let i = 2; pastes.some((p) => p.name === name); i++) {
    name = `${base}-${i}.${ext}`;
  }
  return name;
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

let toastTimer: number | undefined;
function toast(text: string) {
  toastEle.textContent = text;
  toastEle.classList.remove("opacity-0");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(
    () => toastEle.classList.add("opacity-0"),
    2500
  );
}

function showError(text: string) {
  messageEle.textContent = text;
  messageEle.classList.remove("hidden");
}

function hideError() {
  messageEle.textContent = "";
  messageEle.classList.add("hidden");
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function copyLocation(name: string): Promise<boolean> {
  const folder = getFolder();
  const text = folder ? `${folder.replace(/[\\/]+$/, "")}${sep(folder)}${name}` : name;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function sep(folder: string): string {
  return folder.includes("\\") ? "\\" : "/";
}

function show(paste: Paste) {
  current = paste;
  previewEle.src = paste.url;
  previewEle.onload = () => {
    infoEle.textContent = `${paste.name} · ${previewEle.naturalWidth}×${
      previewEle.naturalHeight
    } · ${formatSize(paste.blob.size)}`;
  };
  clearBtn.classList.remove("hidden");
  infoEle.classList.remove("hidden");
  renderGallery();
}

function renderGallery() {
  galleryEle.replaceChildren(
    ...pastes.map((paste) => {
      const img = document.createElement("img");
      img.src = paste.url;
      img.title = paste.name;
      img.className = `h-14 w-14 object-cover rounded border-2 cursor-pointer ${
        paste === current ? "border-blue-500" : "border-transparent opacity-60"
      }`;
      img.addEventListener("click", () => show(paste));
      return img;
    })
  );
  galleryEle.classList.toggle("hidden", pastes.length < 2);
}

async function addImage(blob: Blob) {
  const name = makeName(blob.type);
  const paste: Paste = { blob, url: URL.createObjectURL(blob), name };
  pastes.push(paste);
  hideError();
  show(paste);
  download(blob, name);
  const copied = await copyLocation(name);
  toast(copied ? `Saved ${name} · location copied` : `Saved ${name}`);
}

function imageFrom(files: Iterable<File | null>): File | undefined {
  for (const file of files) {
    if (file && file.type.startsWith("image/")) return file;
  }
}

function handlePaste(evt: ClipboardEvent) {
  const items = evt.clipboardData?.items ?? [];
  const file = imageFrom(
    [...items]
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
  );

  if (!file) {
    showError("Paste an image");
    return;
  }
  evt.preventDefault();
  addImage(file);
}

function clearImage() {
  for (const paste of pastes) URL.revokeObjectURL(paste.url);
  pastes.length = 0;
  current = null;
  previewEle.onload = null;
  previewEle.removeAttribute("src");
  clearBtn.classList.add("hidden");
  infoEle.classList.add("hidden");
  renderGallery();
}

// Re-encodes through a canvas. Also strips EXIF/GPS metadata.
function convert(type: string, quality = 0.92): Promise<Blob | null> {
  if (!previewEle.naturalWidth) return Promise.resolve(null);
  const canvas = document.createElement("canvas");
  canvas.width = previewEle.naturalWidth;
  canvas.height = previewEle.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  if (type === "image/jpeg") {
    // JPEG has no alpha; fill white instead of black.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(previewEle, 0, 0);
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function saveAs(type: string) {
  if (!current) return;
  const blob = await convert(type);
  if (!blob || blob.type !== type) {
    toast(`This browser can't save ${extensionFor(type).toUpperCase()}`);
    return;
  }
  const name = current.name.replace(/\.[^.]+$/, `.${extensionFor(type)}`);
  download(blob, name);
  const copied = await copyLocation(name);
  toast(copied ? `Saved ${name} · location copied` : `Saved ${name}`);
}

async function copyImage() {
  if (!current) return;
  try {
    const blob =
      current.blob.type === "image/png"
        ? current.blob
        : await convert("image/png");
    if (!blob) throw new Error("convert failed");
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    toast("Image copied");
  } catch {
    toast("Couldn't copy image");
  }
}

function setFolder() {
  const folder = prompt(
    "Your downloads folder, so the full path gets copied (leave empty to copy just the filename):",
    getFolder()
  );
  if (folder === null) return;
  try {
    if (folder.trim()) localStorage.setItem(FOLDER_KEY, folder.trim());
    else localStorage.removeItem(FOLDER_KEY);
    toast(folder.trim() ? `Folder set: ${folder.trim()}` : "Folder cleared");
  } catch {
    toast("Couldn't save folder");
  }
}

function step(delta: number) {
  if (!current) return;
  const i = pastes.indexOf(current) + delta;
  if (i >= 0 && i < pastes.length) show(pastes[i]);
}

const shortcuts: Record<string, () => void> = {
  d: () => {
    if (!current) return;
    download(current.blob, current.name);
    toast(`Saved ${current.name}`);
  },
  c: copyImage,
  p: () => saveAs("image/png"),
  j: () => saveAs("image/jpeg"),
  w: () => saveAs("image/webp"),
  o: () => fileInput.click(),
  l: setFolder,
  arrowleft: () => step(-1),
  arrowright: () => step(1),
  "?": toggleSidebar,
  escape: () => {
    if (sidebar.classList.contains("open")) closeSidebar();
    else clearImage();
  },
};

document.addEventListener("keydown", (evt) => {
  if (evt.ctrlKey || evt.metaKey || evt.altKey) return;
  const action = shortcuts[evt.key.toLowerCase()];
  if (!action) return;
  evt.preventDefault();
  action();
});

document.addEventListener("paste", handlePaste);

document.addEventListener("dragover", (evt) => evt.preventDefault());
document.addEventListener("drop", (evt) => {
  evt.preventDefault();
  const file = imageFrom(evt.dataTransfer?.files ?? []);
  if (file) addImage(file);
  else showError("Drop an image");
});

fileInput.addEventListener("change", () => {
  const file = imageFrom(fileInput.files ?? []);
  if (file) addImage(file);
  fileInput.value = "";
});

clearBtn.addEventListener("click", clearImage);

function toggleSidebar() {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("open");
  sidebarToggleIcon.classList.toggle("open");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("open");
  sidebarToggleIcon.classList.remove("open");
}

toggleSidebarBtn.addEventListener("click", toggleSidebar);
overlay.addEventListener("click", closeSidebar);
