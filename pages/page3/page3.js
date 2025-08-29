document.querySelectorAll('.hotspot').forEach(hotspot => {
  hotspot.addEventListener('click', () => {
    const info = hotspot.getAttribute('data-info');
    openPanel(info);
  });
});

function openPanel(content) {
  document.getElementById("panelContent").innerText = content;
  document.getElementById("sidePanel").classList.add("active");
}

function closePanel() {
  document.getElementById("sidePanel").classList.remove("active");
}
