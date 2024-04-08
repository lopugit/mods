// rotate .livepreview-viewport by 90 degrees

setInterval(() => {
  const viewport = document.querySelector('.livepreview-viewport');

  if (viewport) {
    viewport.style.transform = 'rotate(-90deg)';
  }
}, 1000);
