if (!customElements.get('complementary-products')) {
  customElements.define('complementary-products', class ComplementaryProducts extends HTMLElement {
    constructor() {

      super();

    }


    connectedCallback() {

      this.element = this.querySelector(".js-complementary-products");

      setTimeout(() => {
        this.loadComplementaryProducts(this.element)
      }, 1000);

    }


    loadComplementaryProducts = function(element) {

      /**
       * Initialize Flickity slideshow in block.
       * @return {[type]} [description]
       */
      function initFlickity() {

        // Get carousel.
        let carousel = element.querySelector('.js-carousel');

        // Bail if no carousel.
        if (!carousel) {
          console.warn('Error. No carousel to select.');
          return false;
        }

        // Get the count of how many products will appear.
        let count = carousel.dataset.count;

        // Get Flickity options through attribute.
        let flickityData = carousel.getAttribute('data-flickity');

        // Bail if no data found.
        if (!flickityData) {
          console.warn('Error. No Flickity data.');
          return false;
        }

        // Parse the options.
        let flickityOptions = JSON.parse(flickityData);

        // Do not make draggable if less than three products.
        if (count == 1) {
          flickityOptions.draggable = false;
        }

        // Initialize Flickity slideshow.
        new Flickity(carousel, flickityOptions);

      } // end of initFlickity function      

      var baseUrl = element.dataset.baseUrl;

      if (element === null) { return; }
      // Read product id from data attribute
      var productId = element.dataset.productId;
      var sectionId = element.dataset.sectionId;
      var limit = element.dataset.limit;
      var intent = element.dataset.intent;

      var complementarySectionUrl = baseUrl + '?section_id='+ sectionId + '&product_id=' + productId + '&limit=' + limit + '&intent=' + intent;

      fetch(complementarySectionUrl)
      .then(response => response.text())
      .then(text => {

        const html = document.createElement('div');
        html.innerHTML = text;
        const recommendations = html.querySelector('.js-complementary-products');

        if (recommendations && recommendations.innerHTML.trim().length) {
          element.innerHTML = recommendations.innerHTML;
        }

        // Shopify.theme.quickview.init();
        // Shopify.theme.ajaxCart.init();
        WAU.Quickshop.init();
        WAU.Helpers.lazyLoad('.lazy', true);

        // Initialize Flickity
        initFlickity();

      }).catch(error => {
        console.log(error);
      });
    }


  });
}
