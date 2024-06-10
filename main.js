import "./style.css";

const previewEle = document.getElementById("preview");
const messageEle = document.getElementById("message");
const clearBtn = document.getElementById("clearBtn");
const sidebarBtn = document.querySelector(".sidebar-toggle");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("overlay");

// Initialize the download count in session storage if it doesn't exist
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
    messageEle.textContent = "Paste an image";
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
  a.download = `svepste_${downloadCount}.png`; // Append the download count to the file name
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

// function toggleSidebar() {
//   if (sidebar.classList.contains("open")) {
//     sidebar.classList.remove("open");
//   } else {
//     sidebar.classList.add("open");
//   }

//   if (sidebarOverlay.classList.contains("hidden")) {
//     sidebarOverlay.classList.remove("hidden");
//   } else {
//     sidebarOverlay.classList.add("hidden");
//   }

//   if (sidebarBtn.classList.contains("open")) {
//     sidebarBtn.classList.remove("open");
//   } else {
//     sidebarBtn.classList.add("open");
//   }
// }

// document.addEventListener("paste", handlePaste);
// sidebarBtn.addEventListener("click", toggleSidebar);
// sidebarOverlay.addEventListener("click", toggleSidebar);

sidebarBtn.addEventListener("click", function () {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  if (sidebar.classList.contains("translate-x-full")) {
    sidebar.classList.remove("translate-x-full");
    overlay.classList.remove("hidden");
    overlay.classList.add("block");
  } else {
    sidebar.classList.add("translate-x-full");
    overlay.classList.add("hidden");
    overlay.classList.remove("block");
  }
});

sidebarOverlay.addEventListener("click", function () {
  document.getElementById("sidebar").classList.add("translate-x-full");
  document.getElementById("overlay").classList.add("hidden");
  document.getElementById("overlay").classList.remove("block");
});
