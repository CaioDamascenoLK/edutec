document.querySelectorAll('.hotspot').forEach(hotspot => {
  hotspot.addEventListener('click', () => {
    const panelId = hotspot.getAttribute('data-panel');
    openPanel(panelId);
  });
});

function openPanel(panelId) {
  document.querySelectorAll('.side-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  document.getElementById(panelId).classList.add('active');
}

function closePanel(panelId) {
  document.getElementById(panelId).classList.remove('active');
}
