document.querySelectorAll('[data-section-type="product"].product-page').forEach(function(container){
  const loader = new WAU.Helpers.scriptLoader();
  loader.load([jsAssets.flickity]).finally(() => {

    if ( container.dataset.productVideo === 'true' ) {
      loader.load([jsAssets.productVideo]).finally(() => {});
    }
    if ( container.dataset.productModel === 'true' ) {
      loader.load([jsAssets.productModel]).finally(() => {});
    }
    if ( container.dataset.clickToEnlarge === 'true' ) {
      loader.load([jsAssets.zoom]).finally(() => {});
    }
    if (container.dataset.productComplementaryProducts === 'true') {
      loader.load([jsAssets.productComplementaryProducts]).finally(() => {});
    }

    loader.load([jsAssets.product]).finally(() => {});
  });
});
