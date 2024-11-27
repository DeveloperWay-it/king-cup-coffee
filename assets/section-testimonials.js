    // Function to initialize the gallery
    function initializeGallery() {
      const galleryContainers = document.querySelectorAll('.testimonial--item_image');

      galleryContainers.forEach(galleryContainer => {
          galleryContainer.addEventListener('click', (event) => {
              const thumbnail = event.target.closest('.testimonial--thumb');

              if (thumbnail) {
                  event.preventDefault();
                  const dataSrc = thumbnail.getAttribute('data-src');
                  const mainImage = galleryContainer.querySelector('.js-testimonial-image img');
                  mainImage.setAttribute('srcset', dataSrc);
              }
          });
      });
  }

  // Function to initialize the gallery when a section is loaded
  function onSectionLoad() {
      initializeGallery();
  }

  // Function to clean up the gallery when a section is unloaded
  function onSectionUnload() {
      const galleryContainers = document.querySelectorAll('.testimonial--item_image');

      galleryContainers.forEach(galleryContainer => {
          galleryContainer.removeEventListener('click', initializeGallery);
      });
  }

  // Initialize the gallery when the page loads
  window.addEventListener('DOMContentLoaded', () => {
      onSectionLoad();
  });

  // Add event listeners for section load and unload
  document.addEventListener('shopify:section:load', onSectionLoad);
  document.addEventListener('shopify:section:unload', onSectionUnload);

