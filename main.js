import "./style.css";

const previewEle = document.getElementById("preview");
const messageEle = document.getElementById("message");
const clearBtn = document.getElementById("clearBtn");

if (!sessionStorage.getItem("downloadCount")) {
  sessionStorage.setItem("downloadCount", 0);
}

function handlePaste(evt) {
  messageEle.textContent = "";
  messageEle.classList.add("hidden");

  const items = [...evt.clipboardData.items].filter((item) =>
    /^image\/(png|jpeg|gif)/.test(item.type)
  );

  if (items.length === 0) {
    messageEle.textContent = "Paste a image";
    messageEle.classList.remove("hidden");
    return;
  }

  const item = items[0];
  const blob = item.getAsFile();
  previewEle.src = URL.createObjectURL(blob);

  // Increment the download count
  let downloadCount = parseInt(sessionStorage.getItem("downloadCount"), 10) + 1;
  sessionStorage.setItem("downloadCount", downloadCount);

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `svepste_${downloadCount}.png`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  clearBtn.classList.remove("hidden");
  clearBtn.addEventListener("click", clearImage, { once: true });
}

function clearImage() {
  previewEle.src = "";
  clearBtn.classList.add("hidden");
  clearBtn.removeEventListener("click", clearImage);
}

document.addEventListener("paste", handlePaste);

const toggleSidebarBtn = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

toggleSidebarBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("open");
  document.getElementById("sidebar-toggle-icon").classList.toggle("open");
});

overlay.addEventListener("click", () => {
  sidebar.classList.add("closing");
  overlay.classList.remove("open");
  setTimeout(() => {
    sidebar.classList.remove("open", "closing");
  }, 300);
});
