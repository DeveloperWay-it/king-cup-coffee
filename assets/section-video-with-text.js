var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var players = [];

function onYouTubeIframeAPIReady() {
    var videoContainers = document.querySelectorAll('.video--with_text-video');
    videoContainers.forEach(initializePlayer);
}

function initializePlayer(container) {
    var videoId = container.getAttribute('data-src');
    if (videoId) {
        var existingPlayerDiv = container.querySelector('.playerDiv');
        if (existingPlayerDiv) existingPlayerDiv.remove();

        var playerDiv = document.createElement('div');
        playerDiv.className = 'playerDiv';
        container.appendChild(playerDiv);

        var player = new YT.Player(playerDiv, {
            videoId: videoId,
            playerVars: {
                'controls': 0,
                'modestbranding': 1,
                'rel': 0,
                'loop': 0,
                'showinfo': 0,
                'playsinline': 1
            },
            events: {
                'onStateChange': function (event) {
                    if (event.data === YT.PlayerState.PLAYING) {
                        pauseOtherPlayers(player);
                    }
                }
            }
        });
        players.push(player);
    }
}

function pauseOtherPlayers(currentPlayer) {
    players.forEach(function (player) {
        if (player !== currentPlayer && player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        }
    });
}

document.querySelectorAll('[data-section-type="video-with-text"]').forEach(function (container) {
  const vendorAssetUrl = container.dataset.vendorAssetUrl;
  if(vendorAssetUrl) { // Check if vendorAssetUrl is defined
      const loader = new WAU.Helpers.scriptLoader();
      loader.load([vendorAssetUrl]).finally(() => {
          if (container.querySelector('.js-has-yt')) {
              initializePlayer(container.querySelector('.video--with_text-video'));
          }
      });
  } else if(container.querySelector('.js-has-yt')) {
      // If vendorAssetUrl is not defined but .js-has-yt is present, initialize the player
      initializePlayer(container.querySelector('.video--with_text-video'));
  }
});

document.addEventListener("shopify:section:load", function (event) {
    var container = event.target.querySelector('[data-section-type="video-with-text"]');
    if (container) {
        const loader = new WAU.Helpers.scriptLoader();
        loader.load([container.dataset.vendorAssetUrl]).finally(() => {
            var container = event.target.querySelector('.video--with_text-video');
            if (container) {
                initializePlayer(container);
            }
        });
    }
});

document.addEventListener("shopify:section:unload", function (event) {
    var container = event.target.querySelector('.video--with_text-video');
    if (container) {
        var playerDiv = container.querySelector('.playerDiv');
        if (playerDiv) {
            players = players.filter(function (player) {
                if (player.getIframe() === playerDiv) {
                    player.destroy();
                    return false;
                }
                return true;
            });
        }
    }
});
