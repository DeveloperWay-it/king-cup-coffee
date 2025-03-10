class ProductsGrid extends HTMLElement {
  constructor() {
    super();
    this.infiniteScrollEnabled = this.getAttribute('infinite-scroll-enabled') === 'true';
    this.isLoading = false;
  }

  connectedCallback() {
    this.productsContainer = document.querySelector('.main-collection_products .main-collection_grid');
    this.loadProductsButton = this.querySelector('.main-collection_load-products');
    this.loadingIndicator = this.querySelector('#loading-indicator');
    this.pagination = this.querySelector('#pagination');

    this.initEventListeners();
  }

  initEventListeners() {
    console.log(this.infiniteScrollEnabled);
    
    if (this.infiniteScrollEnabled) {
      window.addEventListener('scroll', () => this.handleScroll());
    } else if (this.loadProductsButton) {
      this.loadProductsButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.loadMoreProducts();
      });
    }
  }

  handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const documentHeight = this.productsContainer.offsetHeight;

    if (scrollTop + viewportHeight >= documentHeight - 100) {
      this.loadMoreProducts();
    }
  }

  loadMoreProducts() {
    if (this.isLoading) return;

    const nextPage = this.pagination.getAttribute('data-next-page');
    if (!nextPage) return;

    this.isLoading = true;
    this.loadingIndicator.style.display = 'block';

    fetch(`${window.location.pathname}?page=${nextPage}`)
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Seleziona i nuovi prodotti
        const newProducts = doc.querySelectorAll('.main-collection_products .product-card');
        newProducts.forEach((product) => {
          this.productsContainer.appendChild(product);
        });

        // Aggiorna la pagina successiva
        const newPagination = doc.querySelector('#pagination');
        if (newPagination) {
          this.pagination.setAttribute('data-next-page', newPagination.getAttribute('data-next-page'));
        } else {
          this.pagination.removeAttribute('data-next-page'); // Nessuna pagina successiva
          this.loadProductsButton.style.display = 'none';
        }

        this.loadingIndicator.style.display = 'none';
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Errore nel caricamento dei prodotti:', error);
        this.loadingIndicator.style.display = 'none';
        this.isLoading = false;
      });
  }
}

// Registra il Web Component
customElements.define('products-grid', ProductsGrid);
