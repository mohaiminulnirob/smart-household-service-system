export function openImageViewer(src) {
  const modal = document.createElement("div");
  modal.className = "image-viewer-modal";
  modal.innerHTML = `
    <div class="image-viewer-backdrop"></div>
    <img src="${src}" class="image-viewer-img" />
  `;

  // Close on click anywhere
  modal.onclick = () => modal.remove();

  document.body.appendChild(modal);
}
