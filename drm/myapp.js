
function initApp(manifestUri, licenseServer, isL1) {
  if (!window.location.href.startsWith('https://')) {
    window.location.href = window.location.href.replace('http://', 'https://');
    return;
  }

  // Install built-in polyfills to patch browser incompatibilities.
  shaka.polyfill.installAll();

  // Check to see if the browser supports the basic APIs Shaka needs.
  if (shaka.Player.isBrowserSupported()) {
    // Everything looks good!
    initPlayer(manifestUri, licenseServer, isL1);
  } else {
    // This browser does not have the minimum set of APIs we need.
    console.error('Browser not supported!');
  }
}

async function initPlayer(manifestUri, licenseServer, isL1) {
  // Create a Player instance.
  const video = document.getElementById('video');
  const player = new shaka.Player(video);
  const config = {
    drm: {
      servers: {
        'com.widevine.alpha': licenseServer
      }
    }
  };
  if (isL1) {
    config.drm.advanced = {
      'com.widevine.alpha': {
        'videoRobustness': 'HW_SECURE_ALL'
      }
    };
  } else {
    config.drm.advanced = {
      'com.widevine.alpha': {
        'videoRobustness': 'SW_SECURE_DECODE'
      }
    };
  }
  const elem = document.getElementById('output');
  if (elem) {
    elem.innerHTML = JSON.stringify(config);
  }
  console.log(config);
  player.configure(config);

  // Attach player to the window to make it easy to access in the JS console.
  window.player = player;

  // Listen for error events.
  player.addEventListener('error', onErrorEvent);

  // Try to load a manifest.
  // This is an asynchronous process.
  try {
    await player.load(manifestUri);
    // This runs if the asynchronous load is successful.
    console.log('The video has now been loaded!');
  } catch (e) {
    // onError is executed if the asynchronous load fails.
    onError(e);
  }
}

function onErrorEvent(event) {
  // Extract the shaka.util.Error object from the event.
  onError(event.detail);
}

function onError(error) {
  // Log the error.
  console.error('dsc Error code', error.code, 'object', JSON.stringify(error));
}

