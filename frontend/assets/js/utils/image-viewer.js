export function openImageViewer(src) {
  const modal = document.createElement("div");
  modal.className = "image-viewer-modal";
  modal.innerHTML = `
    <div class="image-viewer-backdrop"></div>
    <img src="${src}" class="image-viewer-img" />
  `;

  // Show the modal (important!)
  setTimeout(() => modal.classList.add("show"), 10);

  // Close on click anywhere
  modal.onclick = () => modal.remove();

  document.body.appendChild(modal);
}
