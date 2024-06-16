import "./style.css";

const previewEle = document.getElementById("preview");
const messageEle = document.getElementById("message");
const clearBtn = document.getElementById("clearBtn");
const toggleSidebarBtn = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const sidebarToggleIcon = document.getElementById("sidebar-toggle-icon");

let downloadCount = parseInt(
  sessionStorage.getItem("downloadCount") || "0",
  10
);

// Function to check if the user is on a mobile device
function isMobileDevice() {
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

function handlePaste(evt) {
  const items = [...evt.clipboardData.items].filter((item) =>
    /^image\/(png|jpeg|gif)/.test(item.type)
  );
  if (items.length === 0) {
    messageEle.textContent = "Paste an image";
    messageEle.classList.remove("hidden");
    return;
  }

  const blob = items[0].getAsFile();
  previewEle.src = URL.createObjectURL(blob);
  downloadCount++;
  sessionStorage.setItem("downloadCount", downloadCount);

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `paste-${downloadCount}.png`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  clearBtn.classList.remove("hidden");
  clearBtn.addEventListener("click", clearImage, { once: true });
  messageEle.textContent = "";
  messageEle.classList.add("hidden");
}

function clearImage() {
  previewEle.src = "";
  clearBtn.classList.add("hidden");
  clearBtn.removeEventListener("click", clearImage);
}

document.addEventListener("paste", handlePaste);

const toggleSidebar = () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("open");
  sidebarToggleIcon.classList.toggle("open");
};

toggleSidebarBtn.addEventListener("click", toggleSidebar);
overlay.addEventListener("click", () => {
  sidebar.classList.add("closing");
  overlay.classList.remove("open");
});
