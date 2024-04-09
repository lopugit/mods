// global configs up here
window.ttLog = true;
window.ttTrace = true;
window.ttLog = false;
window.ttTrace = false;

// Settings go here
const modTitle = 'ytm Scraper';
const modName = modTitle?.toLowerCase()?.replace(' ', '-');
const scriptName = modName + '/index';

const mountId = modName + '-mods-mount';

const mountQuery = () => {
  return document.querySelector('#' + mountId);
};

// default to the funniest picture on the internet, a png !
const modImg = `/${modName}/🦄.png`;

console.log('🦄', modName, 'Injected 🦄');

const localState = window.localStorage.getItem(modName);

let localStateParsed = {};

try {
  parsed = JSON.parse(localState);
  // uncomment to clear local state
  // parsed = null;
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    localStateParsed = parsed;
  }
} catch (err) {
  console.error('❤️‍🔥 Error parsing localState', err);
}

const state = localStateParsed;

try {
  window[modName] = window?.[modName] || {};

  window[modName].state = state;

  // listen to scroll events
  window.addEventListener('scroll', () => {
    state.scrollY = window.scrollY;

    // grab all els of type <ytmusic-responsive-list-item-renderer>
    const allItems = document.querySelectorAll('ytmusic-responsive-list-item-renderer');

    const matchedElsArray = Array.from(allItems);

    console.log('🦄 Found', matchedElsArray?.length, 'Songs 🦄');

    const mappedItems = matchedElsArray.map((item, idx) => {
      // title is innerText of title-column
      const title = item.querySelector('.title-column').innerText;

      // artist is the first child of .secondary-flex-columns innerText
      const artist = item.querySelector('.secondary-flex-columns').children[0].innerText;
      const album = item.querySelector('.secondary-flex-columns').children[1].innerText;

      // duration is from .fixed-columns > yt-formatted-string first child innerText

      const duration = item.querySelector('.fixed-columns').children[0].innerText;

      // album art comes from item <ytmusic-thumbnail-renderer> img src
      const albumArt = item.querySelector('ytmusic-thumbnail-renderer img').src;

      let id = null;

      const titleTrimmed = title?.trim();
      const artistTrimmed = artist?.trim();

      if (titleTrimmed || artistTrimmed) {
        id = idx;
      }

      if (!id) {
        return null;
      }

      const ret = {
        title,
        artist,
        album,
        duration,
        albumArt,
        id
      };

      return ret;
    });

    // get playlist id and title
    // title comes from <ytmusic-detail-header-renderer> h2 innerText
    const playlistId = window.location.href?.split?.('list=')?.[1]?.split?.('&')?.[0];
    const playlistTitle = document.querySelector('ytmusic-detail-header-renderer h2').innerText;

    // store in state
    state[playlistId] = state[playlistId] || {};

    const playlist = state[playlistId];

    playlist.title = playlistTitle;

    playlist.items = playlist.items || {};

    const filteredItems = mappedItems.filter((item) => item !== null && item.id !== null);

    filteredItems.forEach((item) => {
      // create unique id for each item out of all Artist, Title, Album, Duration
      if (item.id) {
        playlist.items[item.id] = item;
      }
    });

    playlist.exportToClipboard = () => {
      window[modName].copyToClipboard(playlistId);
    };
  });

  let startingSongs = Object.keys(state).reduce((acc, key) => {
    let itemsLength = 0;

    if (state[key].items) {
      itemsLength = Object.keys(state[key].items).length;
    }

    return acc + itemsLength;
  }, 0);

  console.log('🦄 startingSongs', startingSongs, '🦄');

  // save state to local storage every 5 seconds
  setInterval(() => {
    let currentSongs = Object.keys(state).reduce((acc, key) => {
      let itemsLength = 0;

      if (state[key].items) {
        itemsLength = Object.keys(state[key].items).length;
      }

      return acc + itemsLength;
    }, 0);

    console.log('🦄 currentSongs', currentSongs, '🦄');
    console.log("🦄 That's ", currentSongs - startingSongs, ' new songs! 🦄');
    startingSongs = currentSongs;
    if (state && typeof state === 'object' && !Array.isArray(state)) {
      window.localStorage.setItem(modName, JSON.stringify(state));
    }
  }, 5000);
} catch (err) {
  console.error(`Error in ${scriptName} .js`, err);
}

// expose a copyToClipboard function to the window which copies

window[modName].copyToClipboard = (playlistId) => {
  const playlist = state[playlistId];

  const playlistItems = Object.values(playlist.items);

  const playlistText = playlistItems.reduce((acc, item) => {
    // const toAdd = `${item.artist} - ${item.title} - ${item.album} - ${item.duration}`;
    const toAdd = `${item.artist} - ${item.title}`;

    // remove any new lines
    // replace any spaces longer than 1 with a single space
    const sanitisedToAdd = toAdd.replace(/\n/g, '').replace(/\s{2,}/g, ' ');

    const ret = acc + sanitisedToAdd + '\n';

    return ret;
  }, '');

  const first100chars = playlistText.slice(0, 100);

  console.log('🦄 first100chars', first100chars, '🦄');

  const last100chars = playlistText.slice(-100);

  console.log('🦄 last100chars', last100chars, '🦄');

  try {
    navigator.clipboard.writeText(playlistText).then(() => {
      console.log('🦄 Playlist copied to clipboard 🦄');
    });
  } catch (err) {
    console.error('🦄 Error copying playlist to clipboard 🦄', err);
  }
};

console.log('🦄 ytm Scraper', window[modName]);
