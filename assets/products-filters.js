class ProductsFilters extends HTMLElement {
  constructor() {
    super();
    this.url = new URL(window.location.href);
  }

  connectedCallback() {
    this.sectionId = this.dataset.sectionId;
    this.productsContainer = document.querySelector('.main-collection_products .main-collection_grid');
    this.selectorSortBy = this.querySelector('#sort-by');
    this.filterInputs = this.querySelectorAll('input[type="checkbox"], input[type="number"]');

    console.log(this.productsContainer);
    
    this.initEventListeners();
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
    } else if (input.type === 'number') {
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
}

// Registra il Web Component
customElements.define('products-filters', ProductsFilters);
