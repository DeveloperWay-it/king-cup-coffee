class ProductsFilters extends HTMLElement {
  constructor() {
    super();
    this.url = new URL(window.location.href);
  }

  connectedCallback() {
    this.sectionId = this.dataset.sectionId;
    this.productsContainer = document.querySelector('.main-collection_products .main-collection_grid');
    this.selectorSortBy = this.querySelector('#sort-by');
    this.filterInputs = this.querySelectorAll('input[type="checkbox"], input[type="number"], input[type="range"], input[type="radio"]');
    this.priceRangeInputs = this.querySelectorAll('.js-filter-range-input');
    this.priceSliders = this.querySelectorAll('.js-price-range');

    this.initEventListeners();
    this.initPriceRange();
    this.initPriceSlider();
  }

  initEventListeners() {
    if (this.selectorSortBy) {
      this.selectorSortBy.addEventListener('change', () => this.handleSortChange());
    }

    this.filterInputs.forEach((input) => {
      input.addEventListener('change', (event) => this.handleFilterChange(event));
    });
  }

  handleSortChange() {
    const sortValue = this.selectorSortBy.value;
    this.url.searchParams.set('sort_by', sortValue);
    this.filterProducts();
  }

  handleFilterChange(event) {
    const input = event.target;
    const paramName = input.name;
    const paramValue = input.value;
  
    if (input.type === 'checkbox') {
      if (input.checked) {
        this.url.searchParams.append(paramName, paramValue);
      } else {
        const params = this.url.searchParams
          .getAll(paramName)
          .filter((value) => value !== paramValue);
        this.url.searchParams.delete(paramName);
        params.forEach((value) => this.url.searchParams.append(paramName, value));
      }
    } else if (input.type === 'radio') {
      // Rimuovi tutti i parametri con lo stesso nome prima di aggiungere il nuovo
      this.url.searchParams.delete(paramName);
      this.url.searchParams.set(paramName, paramValue);
    } else if (input.type === 'number' || input.type === 'range') {
      if (paramValue) {
        this.url.searchParams.set(paramName, paramValue);
      } else {
        this.url.searchParams.delete(paramName);
      }
    }
  
    this.filterProducts();
  }  

  filterProducts() {
    fetch(`${this.url.pathname}?section_id=${this.sectionId}&${this.url.searchParams.toString()}`)
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');
        const newSection = newDoc.querySelector('.main-collection_products .main-collection_grid');
        if (newSection && this.productsContainer) {
          this.productsContainer.innerHTML = newSection.innerHTML;
        }
      })
      .catch((error) => console.error('Error:', error));
  }

  initPriceRange() {
    if (this.priceRangeInputs.length > 0) {
      this.priceRangeInputs.forEach((item) => {
        item.addEventListener('change', () => {
          setTimeout(() => {
            this.filterProducts();
          }, 1000);
        });
      });
    }
  }

  initPriceSlider() {
    if (!this.priceSliders) return;

    this.priceSliders.forEach((parent) => {
      const rangeInputs = parent.querySelectorAll('input[type=range]');
      const numberInputs = parent.querySelectorAll('input[type=number]');

      rangeInputs.forEach((el) => {
        el.oninput = () => {
          const [slide1, slide2] = Array.from(rangeInputs).map(input => parseFloat(input.value));
          const [min, max] = slide1 > slide2 ? [slide2, slide1] : [slide1, slide2];

          numberInputs[0].value = min.toFixed(2);
          numberInputs[1].value = max.toFixed(2);
        };
      });

      rangeInputs[0].onchange = () => numberInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
      rangeInputs[1].onchange = () => numberInputs[1].dispatchEvent(new Event('change', { bubbles: true }));

      numberInputs.forEach((el, index) => {
        el.oninput = () => {
          const [num1, num2] = Array.from(numberInputs).map(input => parseFloat(input.value));
          const [min, max] = num1 > num2 ? [num2, num1] : [num1, num2];

          rangeInputs[0].value = min.toFixed(2);
          rangeInputs[1].value = max.toFixed(2);

          if (index === 0) rangeInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
          if (index === 1) rangeInputs[1].dispatchEvent(new Event('change', { bubbles: true }));
        };
      });
    });
  }
}

customElements.define('products-filters', ProductsFilters);
