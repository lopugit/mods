const {
  Box,
  Flex,
  Center,
  Input,
  Button,
  Text,
  Stack,
  Link,
  Grid,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Select,
  GridItem,
  Image,
  Heading,
  List,
  ListItem,
  ListIcon,
  Divider,
  Icon,
  Switch,
  FormControl,
  FormLabel,
  Spinner
} = ChakraUI;

const { Global } = Emotion;

const { createBrowserRouter, RouterProvider, useLocation } = ReactRouterDom;

let stateInitialised = false;

try {
  // overwrite console log so tt can output messages
  // TBD
  // const old = console.log;
  // console.log = function () {
  //   const logger = document.getElementById('tt-logs');
  //   if (arguments?.some?.(a => a?.includes?.('mcout'))) {
  //     for (var i = 0; i < arguments.length; i++) {
  //       if (typeof arguments[i] == 'object') {
  //         if (logger) {
  //           logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(arguments[i], undefined, 2) : arguments[i]) + '<br />';
  //         }
  //       } else {
  //         if (logger) {
  //           logger.innerHTML += arguments[i] + '<br />';
  //         }
  //       }
  //     }
  //   }
  //   old.apply(this, arguments);
  // }
} catch (err) {
  console.error('Error overwriting console.log', err);
}

const initialiseStateFromParams = (forceState, location, ignoreInitialised) => {
  try {
    if (stateInitialised && !ignoreInitialised) {
      return;
    }

    stateInitialised = true;

    const params = new URLSearchParams(location.search);
    const newState = forceState ? { ...forceState, tt: true } : { tt: true };

    for (let [key, value] of params) {
      if (
        !ignoreInIframe?.includes(key) &&
        (forceState?.__stateKey === initialStateKey || key === '__stateKey' || !Object.hasOwnProperty?.(forceState, key))
      ) {
        if (value == Number(value)) {
          newState[key] = Number(value);
          // remove leading __
          newState[key?.slice(2, key?.length)] = Number(value);
        } else if (value === 'true' || value === 'false') {
          if (value === 'true') {
            newState[key] = true;
            newState[key?.slice(2, key?.length)] = true;
          } else {
            newState[key] = false;
            newState[key?.slice(2, key?.length)] = false;
          }
        } else {
          newState[key] = value;
          newState[key?.slice(2, key?.length)] = value;
        }
      }
    }

    return newState;

    // setState((state) => {
    //   return { ...state, ...newState }
    // }, 4)
  } catch (err) {
    console.error('Error initialising state from params', err);
  }
};

// get initialStateKey from window query params stateKey
// if it exists
const initialStateKey = new URLSearchParams(window.location.search).get('__stateKey');

window.templateRenderCount = 0;

const App = (props) => {
  templateRenderCount++;

  const location = useLocation();

  // const [stateKey, setStateKey] = React.useState(initialStateKey ? initialStateKey : '')
  const [stateKey, setStateKey] = React.useState('');

  const stateString = React.useMemo(() => {
    return localStorage.getItem('mods-template-script' + stateKey);
  }, []);

  const cachedState = React.useMemo(() => {
    try {
      return JSON.parse(stateString);
    } catch (err) {
      console.error('Error parsing cached state', err);
      throw err;
    }
  }, []);

  const [state, setStateAux] = React.useState(
    initialiseStateFromParams(
      stateString
        ? {
            ...cachedState
          }
        : {},
      location
    )
  );

  console.log('nik state', state);

  const stateRef = React.useRef(state);

  const setState = (newState, uid) => {
    if (window?.ttTrace) {
      console.trace('🦄 setState trace');
    }

    setStateAux((state) => {
      const realNewState = typeof newState === 'function' ? newState(state) : newState;
      stateRef.current = realNewState;

      return realNewState;
    });

    try {
      window?.modsTemplateSubscriber?.(Math.random());
    } catch (err) {
      console.error('[Template] Error calling modsTemplateSubscriber', err);
    }
  };

  const oldStateStringRef = React.useRef(stateString);

  const lastKeyRef = React.useRef('');

  const set = (key, value, uid) => {
    lastKeyRef.current = key;

    // clear timeout of refresh each time set is called 😂

    if (typeof key === 'object') {
      const newState = {};
      key?.forEach((key, i) => {
        newState[key] = value instanceof Array ? value[i] : value;
        if (key?.startsWith('__')) {
          newState[key?.replace('__', '')] = value instanceof Array ? value[i] : value;
        }
      });
      setState((state) => {
        return Object.assign({}, state, newState);
        // return { ...state, ...newState }
      }, 1);
    } else {
      setState((state) => {
        if (key?.startsWith('__')) {
          return Object.assign({}, state, { [key?.replace('__', '')]: value, [key]: value });
        }

        return Object.assign({}, state, { [key]: value });
        return { ...state, [key]: value };
      }, 2);
    }
  };

  const deleteKey = (key) => {
    const newState = { ...state };
    delete newState[key];
    if (window?.ttLog) {
      console.log('🦄 tt deleteKey', key, newState);
    }
    setState(newState, 3);
  };

  try {
    window[modName].set = set;
    window[modName].state = state;
  } catch (err) {
    console.error('[Template] Error setting window[modName].set', err);
  }

  const areas = ['FrontCounter', 'DriveThru', 'Dining', 'Pylon', 'McCafeReel', 'McCafeMenu'];

  const dayparts = ['Breakfast', 'MTea', 'Lunch', 'ATea', 'Dinner', 'LateNight', 'Overnight', 'NotBreakfast'];

  const copyWithNotification = (string) => {
    try {
      const navigator = window.navigator;
      navigator.clipboard.writeText(string);
      set('copiedText', string);
      set('copied', true);

      setTimeout(() => {
        set('copied', false);
        setTimeout(() => {
          set('copiedText', null);
        }, 1000);
      }, 1200);
    } catch (err) {
      console.error('Error copying to clipboard', err);
    }
  };

  const scale = React.useMemo(() => state?.scale || 1, [state]);

  const lowerStep = 0.1;

  const increaseScale = React.useCallback(() => {
    const newScale = Number(scale) + lowerStep || 1;
    set('scale', newScale);
  }, [scale]);

  const decreaseScale = React.useCallback(() => {
    const newScale = Number(scale) - lowerStep || 1;
    set('scale', newScale);
  }, [scale]);

  // update state daypart location changes
  // map all query params to state

  const [logs, setLogs] = React.useState(null);

  const logsRef = React.useRef(logs);

  const log = (...rest) => {
    // create string delimitted by spaces out of all arguments, similar to console log, and push to logs object

    const logs = logsRef.current instanceof Array ? logsRef.current : [];

    const newLogs = [];

    if (rest) {
      // add current minute seconds ms timestamp at start
      newLogs.push(
        new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) +
          ': ' +
          Array.from(rest).join(' ')
      );
    }

    newLogs.push(...logs);

    logsRef.current = newLogs;
    setLogs(newLogs);
  };

  window.ttlog = log;
  window.ttLog = log;
  window.TtLog = log;
  window.TtLog = log;

  // use fuse to search DB
  const searchDb = React.useMemo(() => {
    // const data = [...mcdControl, ...mcdPos6, mcdTextDb];
    const data = [];

    // include score
    return new Fuse(data, {
      includeScore: true,
      keys: [
        {
          name: 'Actual Name',
          weight: 3
        },
        'Product Code',
        'Family',
        'Description'
      ]
    });
  }, []);

  window.searchDb = searchDb;

  const [searchResults, setSearchResults] = React.useState(null);

  const searchRef = React.useRef({ timeout: null, search: true });

  const searchDB = (string) => {
    searchRef.current.search = false;
    try {
      const strings = string?.split?.('|');
      const results = strings?.map((string) => {
        // trim start and end
        const strippedString = string?.trim();
        return (
          searchDb?.search?.(strippedString)?.map((result) => ({ ...result, string: strippedString })) || [
            {
              'Actual Name': 'none',
              string: strippedString
            }
          ]
        );
      });

      const flattedResults = results?.flat?.();
      const sortedResults = flattedResults?.sort?.((a, b) => a?.score - b?.score);

      const resultsLimited = sortedResults instanceof Array ? sortedResults?.slice?.(0, 50) : ['none'];
      if (!resultsLimited || resultsLimited == 0) {
        setSearchResults(null);
      } else {
        setSearchResults(resultsLimited);
      }
    } catch (err) {
      setSearchResults(['Error searching switchboard']);
      console.error('Error searching switchboard', err);
    }

    searchRef.current.search = true;
  };

  const searchDBDebounced = (string) => {
    clearTimeout(searchRef.current?.timeout);

    searchRef.current.timeout = setTimeout(() => {
      if (stateRef.current?.search !== false) {
        searchDB(string);
      }
    }, 1000);
  };

  const updateStateFromParams = (forceState) => {
    const params = new URLSearchParams(location.search);
    const newState = forceState ? { ...forceState } : {};
    const paramsObj = {};
    for (let [key, value] of params) {
      paramsObj[key] = value;

      // check if value contains any latin characters
      // if so don't cast to number
      const latinRegex = /[A-Za-z]/;
      const notNumber = latinRegex.test(value);

      if (!notNumber && value == Number(value)) {
        newState[key] = Number(value);
      } else if (value === 'true' || value === 'false') {
        if (value === 'true') {
          newState[key] = true;
        } else {
          newState[key] = false;
        }
      } else {
        newState[key] = value;
      }
    }

    setState((state) => {
      return { ...state, ...newState };
    }, 4);
  };

  const [oldSearch, setOldSearch] = React.useState(location.search);

  React.useEffect(() => {
    // update once at start
    if (!state?.iframeMode) {
      updateStateFromParams();
    }
  }, []);

  React.useEffect(() => {
    if (location.search !== oldSearch) {
      setOldSearch(location.search);
      updateStateFromParams();
    }
  }, [location]);

  const [oldParams, setOldParams] = React.useState(location.search);

  const [oldState, setOldState] = React.useState(state);

  const refreshRef = React.useRef({ timeout: null });

  const refresh = () => {
    clearTimeout(refreshRef.current?.timeout);

    refreshRef.current.timeout = setTimeout(() => {
      if (stateRef.current?.__refresh !== false) {
        window.location.reload();
      }
    }, 1000);
  };

  const paramWhitelist = ['debug', 'iframeMode', 'tt', 'figmaPreview', 'scale', 'dt_mode'];

  const ignoreParams = ['__time'];

  const createUrlFromState = (state, noSet) => {
    try {
      const params = new URLSearchParams();

      if (!noSet) {
        setOldParams(location.search);
      }
      for (let [key, value] of Object.entries(state)) {
        if (key?.startsWith('__') || paramWhitelist?.includes(key)) {
          params.set(key, value);
        }
      }

      const newUrl = `${location.pathname}?${params.toString()}`;
      return newUrl;
    } catch (err) {
      console.error('Error creating URL from state', err);
    }

    return 'Error';
  };

  const onStateChange = (state) => {
    const lastKey = lastKeyRef.current;

    if (!['__horizontal', '__vertical']?.includes(lastKey) && state?.__allOrientations === true) {
      if (state?.__horizontal !== true) {
        set('__horizontal', true);
      }
      if (state?.__vertical !== true) {
        set('__vertical', true);
      }
    } else if ([['__horizontal', '__vertical']]?.includes(lastKey)) {
      if (lastKey === '__horizontal') {
        set(['__vertical', '__allOrientations'], !state?.__horizontal);
      } else if (lastKey === '__vertical') {
        set(['__horizontal', '__allOrientations'], !state?.__vertical);
      }
    }
  };

  const lockVideos = () => {
    if (typeof stateRef.current?.__lockVideo === 'number') {
      // get all html videos and lock at seconds specified by lockVideo
      const videos = document.querySelectorAll('video');

      videos?.forEach?.((video) => {
        // if video loaded
        if (video.readyState === 4) {
          // set loop false
          video.loop = false;

          // stop video playing
          video.pause();
          video.currentTime = stateRef.current?.__lockVideo;
        }
      });
    }
  };

  // watch state
  React.useEffect(() => {
    stateRef.current = state;

    if (!state?.iframeMode) {
      const stringifiedState = JSON.stringify(state);
      oldStateStringRef.current = stringifiedState;
      if (stringifiedState && stringifiedState !== 'undefined') {
        window.localStorage.setItem('mod-template-script' + stateKey, stringifiedState);
      } else {
        console.error('Error setting localStorage because stringifiedState was undefined');
      }
    }

    window[modName].state = state;

    // update query params daypart state changes

    const newUrl = createUrlFromState(state);

    window.history.replaceState({}, '', newUrl);

    // check if any refreshable keys have changed
    // if so, refresh the page
    for (let [key, value] of Object.entries(state)) {
      if (!noRefresh?.includes(key) && value !== oldState[key]) {
        if (refreshable.includes(key)) {
          // debounced refresh
          refresh();
        } else if (refreshable?.some((r) => r.test?.(key))) {
          // debounced refresh
          refresh();
        }
      }
    }

    setOldState(state);

    onStateChange(state);
  }, [state, stateKey]);

  React.useEffect(() => {
    onStateChange(state);

    if (typeof state?.lockVideo === 'number') {
      const interval = setInterval(() => {
        window.intervalCount = window.intervalCount || 1;
        window.intervalCount++;
        if (window?.intervalLogging) {
          console.log('[Template] Running interval 2');
        }
        lockVideos();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, []);

  const iframePadding = 0;

  const allPreviews = React.useMemo(() => {
    const minScreens = 3;
    const maxScreens = 6;
    const orientations = ['horizontal', 'vertical'];

    const ret = [];

    for (let i = minScreens; i <= maxScreens; i++) {
      const orientationGroup = [];
      for (let __orientation of orientations) {
        orientationGroup.push({
          __no_of_screens: i,
          __orientation
        });
      }
      ret.push(orientationGroup);
    }

    return ret?.reverse();
  }, []);

  // make sure preview display is in sync with show
  React.useEffect(() => {
    const newState = { ...stateRef.current };

    allPreviews?.forEach((nScreens) => {
      const screenCount = nScreens?.[0]?.__no_of_screens;

      const uid = `show${screenCount}`;

      if (!newState?.[uid] || !newState?.[uid + 'disp']) {
        newState[uid] = false;
        newState[uid + 'disp'] = false;
      }

      nScreens.forEach((bank) => {
        const orientation = bank.__orientation;

        const uid2 = `show${screenCount}${orientation}`;

        if (!newState?.[uid2] || !newState?.[uid2 + 'disp']) {
          newState[uid2] = false;
          newState[uid2 + 'disp'] = false;
        }
      });
    });

    setState(newState, 5);
  }, [allPreviews]);

  const iframeRef = React.useRef({});

  const getCachedIframe = React.useCallback(
    (screenCount, orientation, i, width, height) => {
      const newUrl = createUrlFromState(
        {
          ...state,
          debug: true,
          __no_of_screens: screenCount,
          __screen_no: i,
          __orientation: orientation,
          iframeMode: true,
          tt: true
        },
        true
      );

      const uid = `iframe${screenCount}${orientation}${i}`;

      if (!iframeRef?.current?.[uid]) {
        const newIframe = (
          <iframe
            src={newUrl}
            width={width + 'px'}
            height={height + 'px'}
            style={{
              transformOrigin: '0 0',
              border: 'none'
            }}
          ></iframe>
        );

        iframeRef.current[uid] = newIframe;

        return newIframe;
      } else {
        return iframeRef.current[uid];
      }
    },
    [state, iframeRef]
  );

  const lowStepKeys = ['scale', 'figmaPreview', 'contentPreview', 'iframeScale'];

  const [pageTitle, setPageTitle] = React.useState(document.title);
  const pageTitleRef = React.useRef(pageTitle);
  const [splitChar, setSplitChar] = React.useState('/');

  const elScaleRef = React.useRef(elScale);

  // poll to add adjustment to elements with class .tt-position
  React.useEffect(() => {
    const interval = setInterval(() => {
      window.intervalCount = window.intervalCount || 1;
      window.intervalCount++;
      if (window?.intervalLogging) {
        console.log('[Template] Running interval 3');
      }
      const title = document.title?.replace('tt - ', '')?.replace('Template - ', '');
      if (title !== pageTitleRef?.current) {
        if (title?.includes?.('/')) {
          setSplitChar('/');
        } else if (title?.includes?.('-')) {
          setSplitChar('-');
        }
        pageTitleRef.current = title;
        setPageTitle(title);
      }

      const all = document.querySelectorAll('.tt-position');

      let allHaveMods = true;

      all?.forEach((el) => {
        // if el doesn't have a click event listener
        // add one that allows dragging the position via changing style.left and style.top
        if (!el?.__tt) {
          allHaveMods = false;
          el.__tt = true;

          // on click set grabbedEl to this element
          el.addEventListener('mousedown', (e) => {
            // if not with right click
            if (e?.button === 2) {
              return;
            }

            // use el.style.left/top instead of bounding client rect

            // sanitise style left and top into Numbers with decimals, so delete px/% etc..

            let left, top, bottom, right;

            // get left and top from tailwind styling in the format
            // left-[100px] top-[100px]
            // if it exists, otherwise use e.style.left/top

            left = el?.style?.left?.replace?.('px', '')?.replace?.('%', '');
            right = el?.style?.right?.replace?.('px', '')?.replace?.('%', '');
            top = el?.style?.top?.replace?.('px', '')?.replace?.('%', '');
            bottom = el?.style?.bottom?.replace?.('px', '')?.replace?.('%', '');

            if (
              stateRef?.current?.tailwindStyling &&
              !((left && top) || (left && bottom) || (right && top) || (right && bottom))
              // && !(Object.hasOwnProperty?.(el, 'style') && Object.hasOwnProperty?.(el?.style, 'left'))
            ) {
              const leftMatch = el?.className?.match?.(/left-\[(.*?)\]/);
              const topMatch = el?.className?.match?.(/top-\[(.*?)\]/);
              const rightMatch = el?.className?.match?.(/right-\[(.*?)\]/);
              const bottomMatch = el?.className?.match?.(/bottom-\[(.*?)\]/);

              if (leftMatch?.[1]) {
                left = Number(leftMatch?.[1]?.replace?.('px', '')?.replace?.('%', ''));
              }

              if (topMatch?.[1]) {
                top = Number(topMatch?.[1]?.replace?.('px', '')?.replace?.('%', ''));
              }

              if (bottomMatch?.[1]) {
                bottom = Number(bottomMatch?.[1]?.replace?.('px', '')?.replace?.('%', ''));
              }

              if (rightMatch?.[1]) {
                right = Number(rightMatch?.[1]?.replace?.('px', '')?.replace?.('%', ''));
              }
            } else {
              left = Number(left);
              top = Number(top);
              bottom = Number(bottom);
            }

            // store mouse position at grabbed time
            stateRef.current.grabbedMouseX = e.clientX;
            stateRef.current.grabbedMouseY = e.clientY;

            window[modName].grabbedEl = el;
            window[modName].lastEl = el;
            stateRef.current.grabbedLeft = left;
            stateRef.current.grabbedTop = top;
            stateRef.current.grabbedRight = right;
            stateRef.current.grabbedBottom = bottom;

            const boundingClientRect = el.getBoundingClientRect();

            // store initial mouse offset from origin of element
            // so we can add this to the new mouse position to get the new left and top
            // daypart dragging
            stateRef.current.grabbedMouseOffsetX = e.clientX - boundingClientRect?.left;
            stateRef.current.grabbedMouseOffsetY = e.clientY - boundingClientRect?.top;
          });
        }
      });

      if (allHaveMods) {
        clearInterval(interval);
      }
    }, 2000);

    const onMouseMove = (e) => {
      const currentEl = window[modName].grabbedEl;

      const condition =
        currentEl &&
        (typeof stateRef?.current.grabbedLeft === 'number' || typeof stateRef?.current.grabbedRight === 'number') &&
        (typeof stateRef?.current.grabbedTop === 'number' || typeof stateRef?.current.grabbedBottom === 'number');

      if (condition) {
        // get difference between current mouse position and original mouse position

        const x = e.clientX - stateRef.current.grabbedMouseX;
        const y = e.clientY - stateRef.current.grabbedMouseY;

        // add or substract difference to current left and top
        // set new left and top

        const left = stateRef.current.grabbedLeft;
        const top = stateRef.current.grabbedTop;
        const right = stateRef.current.grabbedRight;
        const bottom = stateRef.current.grabbedBottom;

        // create new left and new top accounting for new mouse position and original mouse offset from origin

        const newLeft = left + x;
        const newTop = top + y;
        const newRight = right - x;
        const newBottom = top - y;

        // set new left and top

        // only set values that the element has as classes

        const className = currentEl?.className;

        if (
          className?.includes?.(' left-') ||
          className?.startsWith('left-') ||
          className?.includes?.(' !left-') ||
          className?.startsWith('!left-')
        ) {
          console.log('nik wait what', newLeft, newTop, newRight, newBottom);

          currentEl.style.left = newLeft + 'px';
          currentEl.style.setProperty('left', newLeft + 'px', 'important');
        }

        if (
          className?.includes?.(' right-') ||
          className?.startsWith('right-') ||
          className?.includes?.(' !right-') ||
          className?.startsWith('!right-')
        ) {
          currentEl.style.right = newRight + 'px';
          currentEl.style.setProperty('right', newRight + 'px', 'important');
        }

        if (className?.includes?.(' top-') || className?.startsWith('top-') || className?.includes?.(' !top-') || className?.startsWith('!top-')) {
          currentEl.style.top = newTop + 'px';
          currentEl.style.setProperty('top', newTop + 'px', 'important');
        }

        if (
          className?.includes?.(' bottom-') ||
          className?.startsWith('bottom-') ||
          className?.includes?.(' !bottom-') ||
          className?.startsWith('!bottom-')
        ) {
          currentEl.style.bottom = newBottom + 'px';
          currentEl.style.setProperty('bottom', newBottom + 'px', 'important');
        }

        stateRef.current.currentGrabbedLeft = newLeft;
        stateRef.current.currentGrabbedTop = newTop;
        stateRef.current.currentGrabbedRight = newRight;
        stateRef.current.currentGrabbedBottom = newBottom;
      }
    };

    const onMouseUp = (e) => {
      const currentEl = window[modName].grabbedEl;

      if (currentEl) {
        const newTop = Number(currentEl?.style?.top?.replace?.('px', '')?.replace?.('%', ''));
        const newLeft = Number(currentEl?.style?.left?.replace?.('px', '')?.replace?.('%', ''));
        const newBottom = Number(currentEl?.style?.bottom?.replace?.('px', '')?.replace?.('%', ''));
        const newRight = Number(currentEl?.style?.right?.replace?.('px', '')?.replace?.('%', ''));

        let string = '';

        const className = currentEl?.className;

        const tw = stateRef?.current?.tailwindStyling;

        if (
          className?.includes?.(' left-') ||
          className?.startsWith('left-') ||
          className?.includes?.(' !left-') ||
          className?.startsWith('!left-')
        ) {
          string += tw ? `left-[${newLeft}px] ` : `left: "${newLeft}px",`;
        }

        if (
          className?.includes?.(' right-') ||
          className?.startsWith('right-') ||
          className?.includes?.(' !right-') ||
          className?.startsWith('!right-')
        ) {
          string += tw ? `right-[${newRight}px] ` : `right: "${newRight}px",`;
        }

        if (className?.includes?.(' top-') || className?.startsWith('top-') || className?.includes?.(' !top-') || className?.startsWith('!top-')) {
          string += tw ? `top-[${newTop}px] ` : `top: "${newTop}px",`;
        }

        if (
          className?.includes?.(' bottom-') ||
          className?.startsWith('bottom-') ||
          className?.includes?.(' !bottom-') ||
          className?.startsWith('!bottom-')
        ) {
          string += tw ? `bottom-[${newBottom}px] ` : `bottom: "${newBottom}px",`;
        }

        try {
          const trimmed = string?.trim();
          if (elScaleRef.current) {
            copyWithNotification(trimmed + ` scale-[${elScaleRef.current}]`);
          } else {
            copyWithNotification(trimmed);
          }
        } catch (err) {
          console.error('Error copying to clipboard', err);
        }
      }

      window[modName].grabbedEl = null;
      stateRef.current.grabbedLeft = null;
      stateRef.current.grabbedTop = null;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // listen to scroll events and store scroll position, then restore after page has been reloaded
    const onScroll = (e) => {
      set('scrollX', window.scrollX);
      set('scrollY', window.scrollY);
    };

    // scroll to saved position on refresh
    let inter = setInterval(() => {
      window.intervalCount = window.intervalCount || 1;
      window.intervalCount++;
      if (window?.intervalLogging) {
        console.log('[Template] Running interval 4');
      }

      const newX = stateRef.current?.scrollX || 0;
      const newY = stateRef.current?.scrollY || 0;

      // wait till body height greater than newY
      if (document.body.scrollHeight >= newY) {
        setTimeout(() => {
          if (!stateRef.current?.disableScrollRestore) {
            window.scrollTo(newX, newY);
          }
        }, 2000);
        clearInterval(inter);
      }

      // the reason we do this is so that if the body height changes between refreshes
      // then the scroll listener will never get set if it's smaller than newY
      setTimeout(() => {
        document.addEventListener('scroll', onScroll);
        clearInterval(inter);
      }, 4000);
    }, 500);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('scroll', onScroll);
    };
  }, []);

  const [elScale, setElScale] = React.useState(1);

  React.useEffect(() => {
    if (window[modName]?.lastEl) {
      // get the scale from class with format scale-[1.2]

      const styleScale = window[modName]?.lastEl?.style?.transform?.match?.(/scale\((.*?)\)/);

      if (styleScale) {
        setElScale(styleScale?.[1]);
        return;
      }

      const elScaleMatch = window[modName]?.lastEl?.className?.match?.(/scale-\[(.*?)\]/);

      if (elScaleMatch) {
        // remove scale from class
        window[modName].lastEl.className = window[modName].lastEl.className.replace(/scale-\[(.*?)\]/, '');
        setElScale(elScaleMatch?.[1]);
      } else {
        // check if el has scale style
        const scale = window[modName]?.lastEl?.style?.scale;
        if (scale) {
          setElScale(scale);
        }
      }
    }
  }, [window[modName]?.lastEl]);

  // transform lastEl scale by current value of el scale
  React.useEffect(() => {
    if (window[modName]?.lastEl) {
      // set transform scale style of lastEl to elScale
      window[modName].lastEl.style.scale = elScale;
      elScaleRef.current = elScale;
    } else {
      elScaleRef.current = undefined;
    }
  }, [elScale]);

  React.useEffect(() => {
    // set up modsTemplateSubscriber
    window?.modsTemplateSubscriber?.(Math.random());
  }, []);

  const [imgLoading, setImgLoading] = React.useState(false);

  const exportScreens = async (id = 'show-all-dayparts') => {
    const el = document.getElementsByClassName(id)?.[0];

    if (el) {
      document.body.style.zoom = '100%';
      window.Image = window?.ImageOG;

      // find the widest instance of .preview-bank
      let max = 0;
      const widest = Array.from(document.querySelectorAll('.preview-bank'))?.reduce((acc, el) => {
        const width = el?.scrollWidth;
        if (width > max) {
          max = width;
          return el;
        }
        return acc;
      }, null);

      let width = state?.__orientation === 'horizontal' ? 1920 : 1080;

      if (id === 'selfie') {
        width = el?.scrollWidth;
      }

      if (widest) {
        width = widest?.scrollWidth;
      }

      width = 1000;

      setImgLoading(true);

      domtoimage
        .toPng(el, {
          width
        })
        .then((png) => {
          setImgLoading(false);

          const link = document.createElement('a');
          const areaString =
            state?.__area === 'FrontCounter'
              ? state?.__area + (state?.__foodcourt ? ' -Foodcourt' : '') + (state?.__inspiration ? ' -Inspiration' : '')
              : state?.__area;

          const dayOfWeek = new Date().toLocaleString('en-us', {
            weekday: 'long'
          });

          // time formatted as "HH:MM"
          // replace _ with - and remove spaces
          // in 24 hour time
          const time = new Date()
            .toLocaleString('en-us', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: false
            })
            ?.replace(':', '-')
            ?.replace(' ', '-')
            ?.replace('_', '-');

          const random4letters = Math.random().toString(36).substring(2, 6);

          link.download = `tt-${time}-${dayOfWeek}-${areaString}-${state?.__orientation}-${random4letters}.png`;
          link.href = png;
          link.click();
        })
        .catch((err) => {
          setImgLoading(false);
          console.error('Error exporting screens', err);
        });
    }
  };
  /* sort keys starting with __ to the top but also alphabetically */
  const sortedState = Object.entries(state || {})?.sort(([key1, value1], [key2, value2]) => {
    if (key1?.startsWith('__') && !key2?.startsWith('__')) {
      return -1;
    } else if (!key1?.startsWith('__') && key2?.startsWith('__')) {
      return 1;
    } else {
      return key1?.localeCompare?.(key2);
    }
  });

  const stateInput = ({ key, value, note }) => {
    let input = null;

    const baseInput = (
      <Input
        color="black"
        padding={8}
        fontFamily="speedee"
        outline="none"
        borderRadius="8"
        value={String(value)}
        onChange={(e) => {
          const val = e.target.value;

          if (val == Number(val)) {
            if (val?.[val?.length - 1] === '.') {
              set(key, val);
            } else {
              set(key, Number(val));
            }
          } else {
            set(key, val);
          }
        }}
      />
    );

    if (typeof value === 'boolean') {
      input = (
        <>
          <Box w="auto" cursor="pointer" padding={8} bg="white" fontFamily="speedee" borderRadius={8} color="black" onClick={() => set(key, !value)}>
            {value ? '✅' : '❌'}
          </Box>
          {/* <Switch as="div" size="lg" isChecked={value} /> */}
        </>
      );
      // input = <Button onClick={() => set(key, !value)}>{value ? 'true' : 'false'}</Button>
    } else if (typeof value === 'number') {
      input = (
        <Flex w="auto" flexDir="row">
          {baseInput}
          <Grid ml={2} gap={3}>
            <GridItem bg="white" borderRadius="4" textAlign="center">
              <Flex
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                color="black"
                fontSize="18px"
                px={8}
                onClick={() => {
                  const increment = lowStepKeys?.includes(key) ? lowerStep : 1;
                  set(key, value + increment);
                }}
              >
                +
              </Flex>
            </GridItem>
            <GridItem bg="white" borderRadius="4" textAlign="center">
              <Flex
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                color="black"
                fontSize="18px"
                px={8}
                onClick={() => {
                  const increment = lowStepKeys?.includes(key) ? lowerStep : 1;
                  set(key, value - increment);
                }}
              >
                -
              </Flex>
            </GridItem>
          </Grid>
        </Flex>
      );
    } else if (key === '__orientation') {
      input = (
        <Flex w="auto" flexDir="row">
          {baseInput}
          <Grid ml={4} gap={3}>
            <GridItem bg="white" borderRadius="4" textAlign="center">
              <Flex
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                color="black"
                fontSize="20px"
                p={8}
                width="100%"
                height="100%"
                onClick={() => {
                  if (value === 'horizontal') {
                    set(key, 'vertical');
                  } else {
                    set(key, 'horizontal');
                  }
                }}
              >
                <img width="24px" src="https://emoji.aranja.com/static/emoji-data/img-apple-160/1f501.png" />
              </Flex>
            </GridItem>
          </Grid>
        </Flex>
      );
    } else {
      input = <Flex>{baseInput}</Flex>;
    }

    return (
      <Box mb={6} display="flex" flexGrow={0} flexShrink={1} flexDirection="column">
        <Flex flexDir="row" w="auto" flexShrink={0} position="relative" fontSize="16px" fontWeight="400" my={8}>
          {key} {note}
          <Box ml={4} cursor="pointer" fontSize="10px" onClick={() => deleteKey(key)}>
            🗑️
          </Box>
          {typeof value === 'undefined' && (
            <Box ml={12} cursor="pointer" fontSize="10px" onClick={() => set(key, !value)}>
              🌗
            </Box>
          )}
        </Flex>
        <Flex w="auto" flexShrink={0}>
          {input}
        </Flex>
      </Box>
    );
  };

  const groups = {
    [modName]: ['Hello World 👋']
  };

  const [devicePixelRatio, setDevicePixelRatio] = React.useState(window?.devicePixelRatio);

  const scaleRef = React.useRef(scale ?? 0);

  scaleRef.current = scale;

  // listen for devicePixelRatio change and trigger re-render
  React.useEffect(() => {
    // Listen for ctrl/cmd -/+ zoom in/out and change devicePixelRatio

    let timeout;

    const onKeydown = (e) => {
      const zoomOut = e?.key === '=' && (e?.ctrlKey || e?.metaKey);
      const zoomIn = e?.key === '-' && (e?.ctrlKey || e?.metaKey);
      if (zoomOut || zoomIn) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setDevicePixelRatio(window?.devicePixelRatio);
        }, 100);
      }
    };

    document.addEventListener('keydown', onKeydown);

    return () => clearInterval(interval);
  }, []);

  const screenScale = 1 / devicePixelRatio;
  const adjustment = (scaleRef.current - 1) * screenScale;
  const newScale = screenScale + adjustment;

  // template
  return (
    <>
      <Global
        styles={{
          body: {
            paddingBottom: '50vh !important'
          },
          '#webpack-dev-server-client-overlay': {
            transform: `scale(${newScale})`,
            transformOrigin: '0 0'
          },
          '.debug-speech-bubble': {
            opacity: state?.showDebugPill ? 1 : 0
          },
          h2: {
            '&.text-shadow-router': {
              opacity: state?.screenNames ? 1 : 0.35
            }
          },
          '.screen': {
            overflow: 'visible'
          },
          '.bank-of': {
            bg: 'orange',
            '&::after': {
              ...(state?.screenBorders
                ? {
                    borderRight: '1px solid rgba(0,0,0,0.3)',
                    position: 'absolute',
                    content: '""',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    zIndex: 999999999
                  }
                : {})
            }
          },
          '.figma-preview': {
            opacity: state?.figmaPreview == 0 || state?.figmaPreview ? state?.figmaPreview : 1,
            pointerEvents: 'none !important',
            zIndex: 1000
            // zIndex: state?.figmaTop ? 999999 : 0,
          },
          '.content-preview': {
            opacity: state?.contentPreview == 0 || state?.contentPreview ? state?.contentPreview : 1
          },
          '.no-cursor': {
            pointerEvents: 'none'
          },
          '#root *': {
            ...(state?.ttPosition && {
              pointerEvents: 'none'
            })
          },
          '#root .tt-child *': {
            pointerEvents: 'all !important'
          },
          '.tt-position': {
            // no drag
            '-webkit-user-drag': 'none',
            img: {
              '-webkit-user-drag': 'none'
            },
            ...(state?.ttPosition && {
              // grab cursor
              pointerEvents: 'all !important',
              userSelect: 'none',
              cursor: 'grab',
              '*': {
                userSelect: 'none'
              }
            })
          },
          '.tt-self-position': {
            // apply all of these
            // -webkit-appearance: none;
            // -moz-appearance: none;
            // text-indent: 1px;
            // text-overflow: '';
            select: {
              outline: 'none !important',
              border: 'none !important',
              '*': {
                outline: 'none !important',
                border: 'none !important'
              },
              width: '100px',
              '-webkit-appearance': 'none',
              '-moz-appearance': 'none',
              textIndent: '1px',
              textOverflow: ''
            }
          }
        }}
      ></Global>

      <Flex
        opacity={state?.copied ? 1 : 0}
        transition={!state?.copied ? 'opacity 1200ms ease' : 'opacity 50ms ease'}
        position="fixed"
        top={50 * screenScale + 'px'}
        flexDir="column"
        right={50 * screenScale + 'px'}
        bg="#DD2514"
        padding={24}
        border={`4px solid #FFCD27`}
        borderRadius="12px"
        color="white"
        fontSize={'24px'}
      >
        <Flex>
          Copied to Clipboard
          <Box ml={18}>📎</Box>
        </Flex>
        {state?.copiedText && (
          <Box mt={12} fontSize={'16px'} fontFamily="speedee" color="white">
            {state?.copiedText}
          </Box>
        )}
      </Flex>

      <Box
        className="tt-container"
        position="fixed"
        zIndex={999999999}
        top={0}
        p={50 * screenScale + 'px'}
        left={0}
        bottom={0}
        right={0}
        pointerEvents="none"
        // bg="rgba(0,0,0,0.2)"
      >
        <Box w="100%" h="100%" position="relative">
          <Box
            zIndex={9999999}
            sx={{
              '*': {
                'line-height': '100% !important'
              }
            }}
            position="absolute"
            bottom={0}
            right={0}
            display="flex"
            flexDir="column"
            transform={`scale(${newScale})`}
            className="tt-self-position"
            padding={16}
            color="white"
            w="auto"
            maxH={(window.outerHeight * 0.8) / scaleRef.current + 'px'}
            borderRadius="16px"
            bg="#DD2514"
            pointerEvents="all"
            transformOrigin="bottom right"
          >
            {!state?.open && <Box width="60px" height="56px"></Box>}

            <Box
              title="Open/Close tt"
              cursor="pointer"
              onClick={() => set('open', !state?.open)}
              position="absolute"
              top={-22}
              right={22}
              maxWidth="48px"
            >
              <img lazy src={modImg}></img>
            </Box>
            <Flex alignItems="center" flexDir="row" display={state?.open ? 'flex' : 'none'}>
              <Box fontSize="36px" pb={8}>
                {scriptName}
              </Box>
              <Box fontSize={24} px={18} mt={-5}>
                🌈
              </Box>
            </Flex>

            <Flex
              overflowY="scroll"
              display={state?.open && logs?.length && state?.showLogs !== false ? undefined : 'none'}
              flexDir="column"
              id="tt-logs"
              borderRadius={12}
              maxH={(window.outerHeight * (state?.maxHLog || 0.2)) / scaleRef.current + 'px'}
              gap={12}
              // bg="rgba(255,255,255,0.1)"
              bg="#FFCD2733"
              fontSize="24px"
              my={12}
              p={12}
            >
              {logs?.map?.((log, i) => {
                return (
                  <Box gap={12} key={i} fontSize="24px">
                    {log}
                  </Box>
                );
              })}
            </Flex>

            <Flex
              overflowY="scroll"
              display={state?.open && state?.showSearch !== false ? undefined : 'none'}
              maxH={(window.outerHeight * (state?.maxHSearch || 0.5)) / scaleRef.current + 'px'}
              flexDir="column"
              id="csv-search"
              borderRadius={12}
              gap={12}
              fontSize="24px"
              my={12}
              p={12}
            >
              <Input
                outline="none !important"
                px={8}
                py={16}
                type="search"
                color="black"
                borderRadius={12}
                fontWeight="normal"
                placeholder="McSearch"
                onChange={(e) => {
                  const val = e.target.value;
                  searchDBDebounced(val);
                }}
              />

              {searchResults?.length && (
                <Flex maxWidth="100%" flexDir="column" bg="rgba(255,255,255,0.1)" gap={8} fontSize="24px" my={12} p={12}>
                  {searchResults?.map?.((result, i) => {
                    return (
                      <Box overflowX="scroll" maxWidth="100%" gap={12} key={i} fontSize="24px">
                        {typeof result === 'string' ? (
                          result
                        ) : (
                          <pre
                            style={{
                              maxWidth: 100 / screenScale + 'px'
                            }}
                          >
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        )}
                        {/* {result} */}
                      </Box>
                    );
                  })}
                </Flex>
              )}
            </Flex>

            {/* This will render all state and allow all values to be editable with special interactions for certain state values/types depending on schema */}
            <Box
              display={state?.open && !state?.hideData ? 'block' : 'none'}
              // maxH={state?.varsMaxH}
              maxH={(window.outerHeight * (state?.maxHData || 0.3)) / scaleRef.current + 'px'}
              w={'auto'}
              overflowY="scroll"
            >
              {Object.entries(groups || {})
                ?.sort(([key1, value1], [key2, value2]) => {
                  // sort with pinned first
                  if (state?.[key1] && !state?.[key2]) {
                    return -1;
                  } else if (!state?.[key1] && state?.[key2]) {
                    return 1;
                  } else {
                    // return key1?.localeCompare?.(key2)
                  }
                })
                ?.map(([groupName, keys]) => {
                  return (
                    <Box>
                      <Box my={12} mt={48}>
                        <Box fontSize="36px" display="inline-block" position="relative">
                          {groupName}
                          <Box
                            position="absolute"
                            transform="translate(100%, -50%)"
                            right={0}
                            cursor="pointer"
                            top={0}
                            title="Sticky Group"
                            fontSize={'26px'}
                            opacity={state?.[groupName] ? 1 : 0.5}
                            onClick={() => {
                              // pin group on click
                              set(groupName, !state?.[groupName]);
                            }}
                          >
                            💛
                          </Box>
                        </Box>
                      </Box>
                      {/* <Flex width="100%" flexShrink={1} maxWidth={"700px"} flexWrap="wrap"> */}
                      {keys?.map((keyObj) => {
                        const key = typeof keyObj === 'string' ? keyObj : keyObj?.key;

                        return stateInput({ key, value: state?.[key], note: keyObj?.note });
                      })}
                      {/* </Flex> */}
                    </Box>
                  );
                })}

              <Box fontSize="36px" my={12} mt={48}>
                All
              </Box>
              {sortedState?.map(([key, value]) => {
                return stateInput({ key, value });
              })}
            </Box>

            <Flex
              userSelect="none"
              ml="auto"
              marginTop="12"
              flexDir="row"
              alignItems="center"
              cursor="pointer"
              display={state?.open ? 'flex' : 'none'}
              sx={{
                '> *': {
                  userSelect: 'none'
                },
                '* select::-ms-expand': {
                  display: 'none'
                }
              }}
            >
              {/* Area Selection Dropdown */}
              <Box
                // lower gap for these
                mr={16}
              >
                <select
                  style={{
                    outline: 'none !important',
                    border: 'none !important',
                    borderRadius: '8px',
                    color: 'black',
                    padding: '6px'
                  }}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    set(['area', '__area'], newVal);
                  }}
                  value={state?.area}
                >
                  {areas.map((val) => {
                    return <option key={val}>{val}</option>;
                  })}
                </select>
              </Box>

              {/* Daypart Selection Dropdown */}
              <Box mr={16}>
                <select
                  style={{
                    outline: 'none !important',
                    border: 'none !important',
                    borderRadius: '8px',
                    color: 'black',
                    padding: '6px'
                  }}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    set(['daypart', '__daypart'], newVal);
                    set(`__${newVal}`, true);

                    // unset all other dayparts
                    // '__allDayparts',
                    // '__Breakfast',
                    // '__MTea',
                    // '__Lunch',
                    // '__ATea',
                    // '__Dinner',
                    // '__LateNight',
                    // '__Overnight',
                    // '__NotBreakfast'

                    const filteredDayparts = dayparts.filter((val) => val !== newVal)?.map((val) => '__' + val);
                    set(['__allDayparts', ...filteredDayparts], false);
                  }}
                  value={state?.daypart}
                >
                  {dayparts.map((val) => {
                    return <option key={val}>{val}</option>;
                  })}
                </select>
              </Box>

              {/* Screen Selection Dropdown */}
              <Box mr={16}>
                <select
                  style={{
                    outline: 'none !important',
                    border: 'none !important',
                    borderRadius: '8px',
                    color: 'black',
                    padding: '6px'
                  }}
                  value={`${state?.__no_of_screens}_${state?.__orientation}_${state?.__screen_no}`}
                  onChange={(e) => {
                    const val = e.target.value;

                    const [screenCount, orientation, i] = val.split('_');

                    if (!(i === state?.__screen_no && orientation === state?.__orientation && screenCount === state?.__no_of_screens)) {
                      setState((state) => {
                        return {
                          ...state,
                          __no_of_screens: screenCount,
                          __startingScreen: 1,
                          __screenRange: screenCount,
                          __maxScreens: screenCount,
                          __minScreens: screenCount,
                          __screen_no: i,
                          __orientation: orientation
                        };
                      }, 6);

                      // set __horizontal and __vertical according to new orientation switch

                      set('__horizontal', orientation === 'horizontal');
                      set('__vertical', orientation === 'vertical');
                      set('__allOrientations', false);
                    }
                  }}
                >
                  {/* Flatten allPreviews into options of number of screens + screen # for that bank */}
                  {allPreviews?.map((nScreens) => {
                    const screenCount = nScreens?.[0]?.__no_of_screens;

                    const uid = `show${screenCount}`;

                    return (
                      <optgroup label={screenCount + ' Screens'}>
                        {nScreens.map((bank) => {
                          const orientation = bank.__orientation;

                          const uid2 = `${screenCount}_${orientation}`;

                          const mappable = Array(bank?.__no_of_screens).fill();

                          return mappable.map((_, fakei) => {
                            // if dt_mode true then make i go from length to 1
                            // if (state?.dt_mode) {
                            //   fakei = (mappable?.length - fakei - 1)
                            // }

                            const i = fakei + 1;

                            return (
                              <option value={uid2 + '_' + i}>
                                {screenCount} {orientation} {i}
                              </option>
                            );
                          });
                        })}
                      </optgroup>
                    );
                  })}
                </select>
              </Box>

              {/* Toggles Buttons Bottom Emojis */}

              {/* Screen Selection Dropdown */}
              <Box mr={16}>
                <select
                  style={{
                    outline: 'none !important',
                    border: 'none !important',
                    borderRadius: '8px',
                    color: 'black',
                    padding: '6px'
                  }}
                  value={`${state?.__screen_no}`}
                  onChange={(e) => {
                    const i = e.target.value;

                    if (!(i === state?.__screen_no)) {
                      setState((state) => {
                        return {
                          ...state,
                          __screen_no: i,
                          __startingScreen: i,
                          __screenRange: 1
                        };
                      }, 6);
                    }
                  }}
                >
                  {/* loop from 1 to no_of_screens to select screen */}

                  {Array.from({ length: state?.__no_of_screens }, (_, i) => {
                    i = i + 1;
                    return <option value={i}>Screen {i}</option>;
                  })}
                </select>
              </Box>

              {/* Toggle visibility of debug pull */}

              <Box
                mr={64}
                opacity={state?.showDebugPill ? 1 : 0.45}
                onClick={() => {
                  const newVal = !state?.showDebugPill;
                  set('showDebugPill', newVal);
                  set('_debugView', newVal);
                  set('__debugView', newVal);
                }}
                title="Toggle Debug Pill"
              >
                🪲
              </Box>

              {/* Toggle all screen numbers */}

              <Box
                mr={32}
                opacity={state?.__minScreens === 3 && state?.__maxScreens === 6 && state?.__startingScreen === 1 ? 1 : 0.45}
                onClick={() => {
                  set('__minScreens', 3);
                  set('__maxScreens', 6);
                  set('__startingScreen', 1);
                  set('__screenRange', 6);
                }}
                title="Toggle All Screen Numbers"
              >
                ⊞
              </Box>

              {/* Toggle all orientations */}

              <Box
                mr={32}
                opacity={state?.__allOrientations ? 1 : 0.45}
                onClick={() => {
                  set('__allOrientations', !state?.__allOrientations);
                }}
                title="Toggle All Orientations"
              >
                🫨
              </Box>

              {/* Toggle all dayparts */}

              <Box
                mr={32}
                opacity={state?.__allDayparts ? 1 : 0.45}
                onClick={() => {
                  set('__allDayparts', !state?.__allDayparts);
                }}
                title="Toggle All Dayparts"
              >
                🕰️
              </Box>

              {/* Toggle __mccafe */}

              <Box
                mr={32}
                opacity={state?.__mccafe ? 1 : 0.45}
                onClick={() => {
                  set('__mccafe', !state?.__mccafe);
                }}
                title="Toggle McCafe"
              >
                ☕
              </Box>

              {/* Reset Dayparts */}

              <Box
                mr={32}
                onClick={() => {
                  set(
                    ['__Breakfast', '__MTea', '__Lunch', '__ATea', '__Dinner', '__LateNight', '__Overnight', '__NotBreakfast', '__allDayparts'],
                    false
                  );
                }}
                title="Reset Dayparts"
              >
                🌅
              </Box>

              {/* Toggle Multi View which is where you see titles and multiple screens */}
              <Box
                mr={32}
                opacity={state?.__multiView ? 1 : 0.45}
                onClick={() => {
                  set('__multiView', !state?.__multiView);
                }}
                title="Toggle Multi View"
              >
                ⊟
              </Box>

              {/* Play next video of window.videoPlayers[uid] keys */}
              <Box
                mr={32}
                onClick={() => {
                  const videoPlayers = window?.videoPlayers || {};
                  Object.values(videoPlayers)?.forEach((player) => {
                    player?.();
                  });
                  const carouselNexts = window?.carouselNexts || {};
                  Object.values(carouselNexts)?.forEach((carouselNext) => {
                    carouselNext?.();
                  });
                }}
                title="Play Next Video"
              >
                ⏩
              </Box>

              {/* Toggle drag and drop position */}
              <Box
                mr={32}
                opacity={state?.ttPosition ? 1 : 0.45}
                onClick={() => {
                  set('ttPosition', !state?.ttPosition);
                }}
                title="Toggle Drag and Drop Position"
              >
                ✊
              </Box>

              {/* Flip between __orientation = 'horizontal' and 'vertical' */}
              <Box
                mr={32}
                transform={`rotate(${state?.__orientation === 'horizontal' ? 90 : 0}deg)`}
                onClick={() => {
                  const curOrientation = state?.__orientation;
                  const newOrientation = curOrientation === 'horizontal' ? 'vertical' : 'horizontal';
                  set('__orientation', newOrientation);

                  set('__horizontal', newOrientation === 'horizontal');
                  set('__vertical', newOrientation === 'vertical');
                  set('__allOrientations', false);
                }}
                title="Toggle Orientation"
              >
                📱
              </Box>

              {/* Toggle Shoppable */}

              <Box
                mr={32}
                opacity={state?.__shoppable ? 1 : 0.45}
                onClick={() => {
                  const newVal = !state?.__shoppable;

                  set('__shoppable', newVal);

                  if (newVal) {
                    set('dt_mode', false);
                    // set('__inspiration', false);
                  }
                }}
                title="Toggle Shoppable Mode"
              >
                🏪
              </Box>

              <Box
                mr={32}
                opacity={state?.__foodcourt ? 1 : 0.45}
                onClick={() => {
                  const newVal = !state?.__foodcourt;

                  set('__foodcourt', newVal);

                  if (newVal) {
                    set('dt_mode', false);
                    // set('__inspiration', false);
                  }
                }}
                title="Toggle Foodcourt Mode"
              >
                🍽️
              </Box>

              <Box
                mr={32}
                opacity={state?.__inspiration ? 1 : 0.45}
                onClick={() => {
                  const newVal = !state?.__inspiration;
                  set('__inspiration', newVal);

                  // set drive thru mode to false because it breaks inspiration view
                  if (newVal) {
                    set('dt_mode', false);
                    // set('__foodcourt', false);
                  }
                }}
                title="Toggle Inspiration Mode"
              >
                🙏
              </Box>

              <Box
                mr={32}
                opacity={state?.tailwindStyling ? 1 : 0.45}
                onClick={() => {
                  set('tailwindStyling', !state?.tailwindStyling);
                }}
                title="Toggle Tailwind Position Syntax"
              >
                🐒
                {/* 💨 */}
              </Box>

              <Box
                mr={32}
                onClick={() => {
                  const newVal = !state?.dt_mode;
                  set('dt_mode', newVal);

                  if (newVal) {
                    set('__area', 'DriveThru');
                    set('__screenRange', 3);
                    set('__minScreens', 3);
                    set('__maxScreens', 3);
                    set('__inspiration', false);
                    set('__foodcourt', false);
                    set('__orientation', 'vertical');
                    set('__vertical', true);
                    set('__horizontal', false);
                  }
                }}
                title="Toggle Drive Thru Mode (Reverse Order of Screens)"
                opacity={state?.dt_mode ? 1 : 0.45}
              >
                🚘
              </Box>

              {/* toggle screenBorders */}
              <Box
                mr={32}
                opacity={state?.screenBorders ? 1 : 0.45}
                onClick={() => {
                  set('screenBorders', !state?.screenBorders);
                }}
                title="Toggle Screen Borders"
              >
                🫥
              </Box>

              {/* Toggle refreshing on change */}

              <Box
                mr={32}
                opacity={state?.__refresh ? 1 : 0.45}
                onClick={() => {
                  set('__refresh', !state?.__refresh);
                }}
                title="Toggle Refresh on Change"
              >
                🌀
              </Box>

              <Box
                mr={32}
                // opacity={state?.refresh ? 1 : 0.45}
                onClick={() => {
                  window.location.reload();
                }}
                title="Refresh NOW"
              >
                🌊
              </Box>

              <Box mr={32} title="Toggle Figma Previews">
                <Box
                  opacity={state?.figmaPreview ? 1 : 0.45}
                  onClick={() => {
                    set('figmaPreview', state?.figmaPreview ? 0 : 0.3);
                  }}
                >
                  🥷
                </Box>
              </Box>

              {/* Slider for figma preview opacity */}
              <Box mr={32} position="relative" w="100px" title="Adjust Figma Previews">
                <Slider
                  aria-label="slider-ex-1"
                  defaultValue={state?.figmaPreview * 100}
                  onChange={(val) => {
                    set('figmaPreview', val / 100);
                  }}
                >
                  <SliderTrack h="5px" bg="white">
                    <SliderFilledTrack h="100%" bg="rgba(0,0,0,0.3)" />
                  </SliderTrack>
                  <SliderThumb>
                    <Box bg="white" mt={-7} h="15px" w="15px" borderRadius="9999px" />
                  </SliderThumb>
                </Slider>
              </Box>

              {/* Slider for current El scale */}
              <Box mr={32} position="relative" w="100px" title="Adjust Figma Previews">
                <Slider
                  aria-label="slider-ex-2"
                  defaultValue={elScale * 100}
                  onChange={(val) => {
                    setElScale(val / 100);
                  }}
                  // max value 300
                  max={300}
                >
                  <SliderTrack h="5px" bg="white">
                    <SliderFilledTrack h="100%" bg="rgba(0,0,0,0.3)" />
                  </SliderTrack>
                  <SliderThumb>
                    <Box bg="white" mt={-7} h="15px" w="15px" borderRadius="9999px" />
                  </SliderThumb>
                </Slider>
              </Box>
              <Box mr={32} title="Toggle Figma Previews">
                <Box
                  onClick={() => {
                    // copy value to clipboard
                    try {
                      copyWithNotification(`scale-[${elScale}]`);
                    } catch (err) {
                      console.error('Error copying elScale to clipboard', err);
                    }
                  }}
                >
                  🎁
                </Box>
              </Box>

              {/* Toggle Search */}

              <Box mr={32}>
                <Box
                  opacity={state?.showSearch ? 1 : 0.45}
                  onClick={() => {
                    set('showSearch', !state?.showSearch);
                  }}
                  title="Toggle Search"
                >
                  🔍
                </Box>
              </Box>

              {/* Toggle Logs */}
              <Box mr={32} title="Toggle Logs">
                <Box
                  opacity={state?.showLogs ? 1 : 0.45}
                  onClick={() => {
                    set('showLogs', !state?.showLogs);
                  }}
                >
                  📜
                </Box>
              </Box>

              <Box mr={32} title="Toggle Screen Names">
                <Box
                  opacity={state?.screenNames ? 1 : 0.45}
                  onClick={() => {
                    set('screenNames', state?.screenNames ? 0 : 0.3);
                  }}
                >
                  🪧
                </Box>
              </Box>

              <Box mr={32} title="Show Debug State">
                <Box
                  opacity={!state?.hideData ? 1 : 0.45}
                  onClick={() => {
                    set('hideData', !state?.hideData);
                  }}
                >
                  ✏️
                </Box>
              </Box>

              <Flex>
                <Box title="Scale Down tt" py={3} textAlign="center" bg="#FFCD27" borderRadius="8px" width="80px" ml="auto" onClick={decreaseScale}>
                  <Box mt={3} fontSize="28px">
                    -
                  </Box>
                </Box>
                <Box title="Scale Up tt" ml={16} py={3} textAlign="center" bg="#FFCD27" borderRadius="8px" width="80px" onClick={increaseScale}>
                  <Box mt={3} fontSize="28px">
                    +
                  </Box>
                </Box>
              </Flex>
            </Flex>
          </Box>
        </Box>
      </Box>
    </>
  );
};

const root = ReactDOM.createRoot(mountQuery());

const router = createBrowserRouter([{ path: '*', element: <App /> }]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </React.StrictMode>
);
