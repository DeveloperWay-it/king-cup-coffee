function BeforeAfter(container) {
  const baContainer = container.querySelector('.before--after');
  const before = container.querySelector('.before-image');
  const beforeImage = before.querySelector('img') || before.querySelector('.before--image_placeholder');
  const slider = container.querySelector('.before--after_slider');
  let active = false;
  let width = baContainer.offsetWidth;

  function initBeforeAfter() {
    // Add width to first image so that it does not shrink
    beforeImage.style.width = width + 'px';

    // Recalculate width on resize
    let resizeId;
    window.addEventListener('resize', function() {
      cancelAnimationFrame(resizeId);
      resizeId = requestAnimationFrame(function() {
        width = baContainer.offsetWidth;
        beforeImage.style.width = width + 'px';
      });
    });

    // Handle mouse events
    slider.addEventListener('mousedown', function() {
      active = true;
      slider.classList.add('resize');
    });

    document.body.addEventListener('mouseup', function() {
      active = false;
      slider.classList.remove('resize');
    });

    document.body.addEventListener('mouseleave', function() {
      active = false;
      slider.classList.remove('resize');
    });

    document.body.addEventListener('mousemove', function(e) {
      if (!active) return;
      const x = e.pageX - baContainer.getBoundingClientRect().left;
      slideIt(x);
      pauseEvent(e);
    });

    // Handle touch events
    slider.addEventListener('touchstart', function(e) {
      active = true;
      slider.classList.add('resize');
      e.preventDefault();
    }, { passive: true });

    document.body.addEventListener('touchend', function() {
      active = false;
      slider.classList.remove('resize');
    });

    document.body.addEventListener('touchcancel', function() {
      active = false;
      slider.classList.remove('resize');
    });

    document.body.addEventListener('touchmove', function(e) {
      if (!active) return;
      const x = e.changedTouches[e.changedTouches.length - 1].pageX - baContainer.getBoundingClientRect().left;
      slideIt(x);
      pauseEvent(e);
    }, { passive: true });

    // Helper functions
    function slideIt(x) {
      const transform = Math.max(0, Math.min(x, width));
      before.style.width = transform + 'px';
      slider.style.left = transform + 'px';
    }

    function pauseEvent(e) {
      e.stopPropagation();
      e.preventDefault();
    }
  }
  initBeforeAfter();
}

document.querySelectorAll('[data-section-type="before-after"]').forEach(function(container, i){
  BeforeAfter(container);
});
document.addEventListener("shopify:section:select", function(event) {
  if (!event.target.querySelector('[data-section-type="before-after"]')) return false;
  var container = event.target.querySelector('[data-section-type="before-after"]');
  BeforeAfter(container);
});