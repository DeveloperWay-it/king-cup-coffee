const Header = {
  init: function init(container) {
    const themeHeader = document.querySelector(".js-theme-header"),
          clearElement = document.querySelector(".js-clear-element"),
          menuItemsWithNestedDropdowns = document.querySelectorAll(".js-menuitem-with-nested-dropdown"),
          doubleTapToGoItems = document.querySelectorAll(".js-doubletap-to-go");

    if (container.querySelector('.js-stickynav')) {
      Header.prepareSticky();
    }

    if (container.querySelector('.js-search-toggle')) {
      Header.initSearch(container);
    }

    if ( menuItemsWithNestedDropdowns ) {
      Header.nestedDropdowns(menuItemsWithNestedDropdowns);
    }

    if ( doubleTapToGoItems ) {
      Header.doubleTapToGo(doubleTapToGoItems);
    }

    // Aria support
    WAU.a11yHelpers.setUpAriaExpansion();
    WAU.a11yHelpers.setUpAccessibleNavigationMenus();

    window.addEventListener('scroll', function (event) {
      Header.prepareSticky();
    });
    window.addEventListener('resize', function (event) {
      Header.prepareSticky();
    });
    document.addEventListener('shopify:section:select', function (event) {
      Header.prepareSticky();
      Header.initSearch(container);
    });
    document.addEventListener('shopify:section:load', (event) => {
      if (event.target.classList.contains('js-site-header')) {
        WAU.Slideout.init("mobile-navigation");
      }
    });
  },
  initSearch: function initSearchSlideout(container) {
    var searchSlideout = container.querySelector('.searchbox');
    var toggle = container.querySelector('.js-search-toggle');

    // Take search slideout out of tab order until open
    searchSlideout.querySelectorAll('*').forEach((item, i) => {
      item.setAttribute('tabIndex', '-1');
    });

    toggle.addEventListener("click", function() {
      Header.toggleSearch(container);
    });
    container.querySelector('.search-close').addEventListener("click", function() {
      Header.hideSearch(container);
    });
    document.addEventListener('keyup', function(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        Header.hideSearch(container);
      }
    });
    document.addEventListener('click', function(event) {
      const slideoutEl = container.querySelector('.searchbox');
      let targetEl = event.target; // clicked element

      if ( !toggle.contains(targetEl) && !slideoutEl.contains(targetEl) ) {
        Header.hideSearch(container);
      }
    });
  },
  hideSearch:  function hideSearchSlideout(container) {
    var element = container.querySelector('.searchbox');
    element.classList.remove("section-fade-in");
    // Take search slideout out of tab order until open
    element.querySelectorAll('*').forEach((item, i) => {
      item.setAttribute('tabIndex', '-1');
    });
  },
  toggleSearch: function toggleSearch(container) {
    var element = container.querySelector('.searchbox');
    element.classList.toggle("section-fade-in");

    // return tab order
    element.querySelectorAll('*').forEach((item, i) => {
      item.removeAttribute('tabIndex');
    });
    element.querySelector('.searchbox__input').focus();

  },
  isSectionBeforeHeader: function(elem, selector) {
    var sibling = elem.previousElementSibling;

    while (sibling) {
      if (sibling.matches(selector)) return true;
      sibling = sibling.previousElementSibling
    }
  },
  prepareSticky: function prepareSticky() {
    let isMobile = window.innerWidth < 767,
        topBar = document.querySelector(".js-top-bar"),
        elementClass, elementHeight, amountToScroll, isSticky,
        siteHeader = document.querySelector('.js-site-header');

    switch ( isMobile ) {
      case true:
        amountToScroll = 0;
        elementClass = ".js-mobile-header";
        elementHeight = (document.querySelector(".js-mobile-header")) ? document.querySelector(".js-mobile-header").clientHeight : '';
        isSticky = (document.querySelector(".js-mobile-header")) ? document.querySelector(".js-mobile-header").classList.contains("stickynav") : '';
        break;
      case false:
        if (topBar) {
          if (Header.isSectionBeforeHeader(siteHeader, '.js-site-announcement-bar')) {
            amountToScroll = topBar.clientHeight;
          } else {
            amountToScroll = 0;
          }

        } else {
          amountToScroll = 0;
        }

        elementClass = ".js-theme-header";
        elementHeight = (document.querySelector(".js-theme-header")) ? document.querySelector(".js-theme-header").clientHeight : '';
        isSticky = (document.querySelector(".js-theme-header")) ? document.querySelector(".js-theme-header").classList.contains("stickynav") : '';
        break;
    }

    if (isSticky) return WAU.Helpers.makeSticky(amountToScroll, elementClass, elementHeight);
  },
  nestedDropdowns: function nestedDropdowns(dropdown) {
    // Making sure that nested dropdowns are properly placed in the correct place if they're offscreen.
    dropdown.forEach(function (menuItem) {
      menuItem.addEventListener('mouseenter', function (event) {
        const nestedDropdown = menuItem.querySelector(".js-dropdown-nested");

        if (nestedDropdown) {
          if (WAU.Helpers.isElementPastEdge(nestedDropdown)) {
            nestedDropdown.classList.add("dropdown--edge");

            // Check if first level menu item
            if (menuItem.classList.contains('js-first-level')) {
              // Add relative class
              menuItem.classList.add('relative');
            }

          }
        }

      });
    });
  },
  doubleTapToGo: function doubleTapToGo(items) {
    items.forEach(function (doubleTapItem) {
      let preventClick = false,
        prevEventTarget = undefined;

      const activeClass = doubleTapItem.getAttribute("data-active-class");

      Events.on("device:touchstart", function() {
        preventClick = true;
      });

      doubleTapItem.addEventListener("click", function (event) {
        if (preventClick) {
          event.preventDefault();
        }
      });

      doubleTapItem.addEventListener("touchstart", function (event) {
        event.target.setAttribute("aria-expanded", "false");
        Header.closeMenu(activeClass);

        if (prevEventTarget === event.target) {
          preventClick = false;
        } else {
          event.target.classList.toggle(activeClass);
          event.target.setAttribute("aria-expanded", "true");
        }

        prevEventTarget = event.target;
      }, {passive: true});
    });
  },
  closeMenu: function closeMenu(activeClass) {
    document
      .querySelectorAll(`[data-active-class="${activeClass}"]`)
      .forEach(function (activeMenu) {
        activeMenu.classList.remove(activeClass);
      });
  }
}

document.querySelectorAll('[data-section-type="header"]').forEach(function(container){
  Header.init(container);
});

document.querySelectorAll('.megamenu-sublink').forEach(function(sublink) {
  sublink.addEventListener('click', function(event) {
    event.preventDefault(); // Previene il comportamento predefinito del link

    document.querySelectorAll('.megamenu-sublink').forEach(function(sl) {
      sl.style.fontWeight = "normal";
    })
    sublink.style.fontWeight = "bold";

    // Nascondi tutti i megamenu-subsublink
    document.querySelectorAll('.megamenu-subsublink').forEach(function(subsub) {
      subsub.style.display = 'none';
    });

    // Nascondi tutte le megamenu-sublink-image
    document.querySelectorAll('.megamenu-sublink-image').forEach(function(image) {
      image.style.display = 'none';
    });

    // Ottieni l'ID del megamenu-sublink cliccato
    const sublinkId = this.getAttribute('data-target-id'); // Assicurati che il megamenu-sublink abbia un attributo data-target-id

    // Trova il corrispondente megamenu-subsublink usando l'ID
    const correspondingSubsub = document.getElementById(sublinkId);

    if (correspondingSubsub) {
      correspondingSubsub.style.display = 'block'; // Mostra il corrispondente megamenu-subsublink
    }

    // Trova il corrispondente megamenu-sublink-image usando l'ID
    const correspondingImageId = this.getAttribute('data-image-target-id'); // Assicurati che il megamenu-sublink abbia un attributo data-image-target-id
    const correspondingImage = document.getElementById(correspondingImageId);

    if (correspondingImage) {
      console.log(correspondingImage);
      correspondingImage.style.display = 'block'; // Mostra il corrispondente megamenu-sublink-image
    }
  });
});
