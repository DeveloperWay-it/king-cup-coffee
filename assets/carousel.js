document.querySelectorAll('[data-section-type="carousel"]').forEach(function(container){
  const loader = new WAU.Helpers.scriptLoader();
  loader.load([jsAssets.flickity]).finally(() => {
    setTimeout(function() {
      carouselInit(container);
    }, 200);
  });
});

document.addEventListener("shopify:section:load", function(event) {
  if ( !event.target.querySelector('[data-section-type="carousel"]') ) return false;
  setTimeout(function() {
    carouselInit(event.target);
  }, 200);
});

document.addEventListener("shopify:block:select", function(event) {
  var container = event.target.closest('[data-section-type]');
  if (container.getAttribute('data-section-type') === 'carousel') {
    carouselInit(container); // Reinitialize the carousel
    carouselSlideEdit(event.target); // Call the existing functionality
  }
});

document.addEventListener("shopify:block:deselect", function(event) {
  var container = event.target.closest('[data-section-type]');
  if ( container.getAttribute('data-section-type') === 'carousel' ) {
    carouselSlideRestart(event.target);
  }
});

function carouselInit(container) {
  var carousel = container.querySelector('.js-carousel');
  var isFeaturedCollectionCarousel = container.classList.contains('section-featured-collection') ? true : false;
  var isLocationCarousel = container.classList.contains('section-featured-locations') ? true : false;
  var isProductCarousel = container.classList.contains('section-product-list') ? true : false;

  if ( !carousel ) return false;

  if ( carousel.classList.contains('carousel-loaded--false') ) {
    carousel.classList.remove('carousel-loaded--false');
    carousel.classList.add('carousel-loaded--true');
  }

  let flktyData = carousel.getAttribute('data-flickity');
  let flktyOptions = JSON.parse(flktyData);

  if (isFeaturedCollectionCarousel) {
    setTimeout(() => {
      handleMobileCarousel();
    }, 66);
  }

  // Helper function to add prev/next arrows when site renders on mobile
  function handleMobileCarousel() {
    let flktyData = carousel.getAttribute('data-flickity');
    let flktyOptions = JSON.parse(flktyData);

    // Get instance
    let instance = Flickity.data(carousel);
    instance.destroy();

    // If on a mobile device.
    if (window.matchMedia('screen and (max-width: 740px)').matches) {

      // Setup mobile options.
      const mobileOptions = {
        "wrapAround": true,
        "draggable": true,
        "prevNextButtons": true
      }

      flktyOptions = Object.assign({}, flktyOptions, mobileOptions);
    }

    new Flickity(carousel, flktyOptions);
  }

  new Flickity(carousel, flktyOptions);
  carouselResize(carousel);
  carouselAccesibility(carousel);

  class WauCarouselWithLinks extends HTMLElement {
    constructor() {
      super();
    };

    connectedCallback() {

      this.config = JSON.parse(this.getAttribute('data-config'));

      if (!this.config) return false;

      // Get elements.
      this.elements = {
        list: this.querySelector(this.config.classes.list),
        carousel: this.querySelector(this.config.classes.carousel),
        link: this.querySelector(this.config.classes.link)
      }

      this.getFlickityInstance = this.getFlickityInstance.bind(this);

      // Bail if we do not have access to "top level" Flickity script.
      if (typeof Flickity !== 'function') return false;

      // Get Flickity instance.
      this.flktyInstance = Flickity.data(this.elements.carousel);

      if (!this.flktyInstance) {
        console.warn('Warning, No Flickity instance.');
        this.flktyInstance = this.getFlickityInstance(this.elements.carousel);
      }

      this.flktyInstance.on('select', this.updateSelectedLocation.bind(this));
      document.addEventListener('click', this.handleClickEvent.bind(this));
    };

    disconnectedCallback() {
      document.removeEventListener('click', this.handleClickEvent);
    };

    getFlickityInstance(carousel) {
      let flktyData = carousel.getAttribute('data-flickity');
      let flktyOptions = JSON.parse(flktyData);
      return new Flickity(carousel, flktyOptions);
    };

    handleClickEvent(event) {
      const target = event.target;
      if (!target.matches(this.config.classes.link)) return false;
      const flktyEl = document.querySelector(`.${target.getAttribute('data-section-id')}`);
      const flktyInstance = Flickity.data(flktyEl);
      if (!flktyInstance) return false;
      event.preventDefault();
      const selector = target.getAttribute('data-selector');
      flktyInstance.selectCell(selector);
    }

    updateSelectedLocation(locationSelector) {

      // Remove '.is-selected' from any '.location--selector'
      var previousSelectedLocation = this.elements.list.querySelector('.is-selected');
      if (previousSelectedLocation) {
        previousSelectedLocation.classList.remove('is-selected');
      }

      // Find all '.location--selector' elements
      var locationSelectors = this.elements.list.querySelectorAll(this.config.classes.link);

      // Add '.is-selected' to the corresponding '.location--selector'
      if (locationSelectors[this.flktyInstance.selectedIndex]) {
        locationSelectors[this.flktyInstance.selectedIndex].classList.add('is-selected');
      }
    };
  }

  if (!customElements.get('wau-carousel-with-links')) {
    customElements.define('wau-carousel-with-links', WauCarouselWithLinks);
  }

  class WauProductCarouselWithLinks extends WauCarouselWithLinks {
    constructor() {
      super();
    }

    handleClickEvent(event) {
      if (event.target.closest('a')) return;
      const target = event.target.matches(this.config.classes.link) ? event.target : event.target.closest(this.config.classes.link);
      if (!target) return false;
      const flktyEl = document.querySelector(`.${target.getAttribute('data-section-id')}`);
      const flktyInstance = Flickity.data(flktyEl);
      if (!flktyInstance) return false;
      event.preventDefault();
      const selector = target.getAttribute('data-selector');
      flktyInstance.selectCell(selector);
    }
  }

  if (!customElements.get('wau-product-carousel-with-links')) {
    customElements.define('wau-product-carousel-with-links', WauProductCarouselWithLinks);
  }

  // Carousel pagination
  var carouselPag = container.querySelector('.js-carousel-pagination');
  if ( !carouselPag ) return false;
  carouselPagination(carousel, carouselPag);


}

function carouselAccesibility(carousel) {
  var flkty = Flickity.data(carousel);
  flkty.handles[0].before(flkty.nextButton.element);
  flkty.nextButton.element.before(flkty.prevButton.element);
}

function carouselSlideEdit(container) {
  var carousel = container.closest('.js-carousel');
  if (!carousel) return false;

  var flkty = Flickity.data(carousel);
  
  if (!flkty) return false; 

  var slide = container.getAttribute("data-slide-index");

  // Parse slide to an integer before passing it to flkty.select
  flkty.select(parseInt(slide, 10));
  flkty.pausePlayer();
}

function carouselSlideRestart(container) {
  var carousel = container.closest('.js-carousel');

  if ( !carousel ) return false;

  const flkty = Flickity.data(carousel);
  flkty.unpausePlayer();
}

function carouselResize(carousel) {
  var flkty = Flickity.data(carousel);
  flkty.resize();
}

function carouselPagination(carousel, pagination) {
  var flkty = Flickity.data(carousel);

  flkty.on( 'select', function() {
    var slideNumber = flkty.selectedIndex + 1;
    pagination.textContent = '(' + slideNumber + ' of ' + flkty.slides.length + ')';
  });
}
