document.querySelectorAll('.hotspot').forEach(hotspot => {
    hotspot.addEventListener('click', () => {
      alert(hotspot.dataset.info);
    });
  });
  