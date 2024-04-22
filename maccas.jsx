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

const Resizable = window?.Resizable;
const Draggable = window?.Draggable;

const refreshable = [
  '__inspiration',
  '__orientation',
  // match anything that starts with __
  /^__.*/
];

const noRefresh = [
  // '__daypart',
  '__area',
  '__refresh'
];

let stateInitialised = false;

const ignoreInIframe = ['figmaPreview'];

window.clearMcDev = () => {
  window.localStorage.clear('maccas-dev-tools');
  window.localStorage.clear('maccas-dev-tools__stateKey');
  window.localStorage.clear('mdtUrl');
  window.localStorage.clear('contextFields');
  // delete all queryParams
  window.history.replaceState({}, '', window.location.pathname);
  window.location.reload();
};

window.resetMcDev = window.clearMcDev;

try {
  // overwrite console log so McDev can output messages
  // TBD
  // const old = console.log;
  // console.log = function () {
  //   const logger = document.getElementById('mdt-logs');
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

const defaultState = {
  __allOrientations: true,
  __multiView: true,
  // __minScreens: 3,
  // __maxScreens: 6,
  __area: 'FrontCounter',
  debug: true,
  __daypart: 'Lunch',
  __country: 'AU',
  contextFields: '__orientation,__no_of_screens,__screen_no,__daypart,__country,__time,__channel,__screenNo,__noOfScreens'
};

const initialiseStateFromParams = (forceState, location, ignoreInitialised) => {
  try {
    if (stateInitialised && !ignoreInitialised) {
      return {};
    }

    stateInitialised = true;

    const params = new URLSearchParams(location.search);
    const newState = forceState ? { ...forceState, mdt: true } : { mdt: true };

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

    // set defaultState for some keys
    for (let [key, value] of Object.entries(defaultState)) {
      if (!newState.hasOwnProperty(key)) {
        newState[key] = value;
      }
    }

    // delete any keys that have the value "delete"
    for (let [key, value] of Object.entries(newState)) {
      if (value === 'delete') {
        delete newState[key];
      }
    }

    if (newState) {
      return newState;
    }
  } catch (err) {
    console.error('Error initialising state from params', err);
  }
  return {};
};

// get initialStateKey from window query params stateKey
// if it exists
const initialStateKey = new URLSearchParams(window.location.search).get('__stateKey');

window.mcdevRenderCount = 0;

const App = (props) => {
  mcdevRenderCount++;

  const location = useLocation();

  // const [stateKey, setStateKey] = React.useState(initialStateKey ? initialStateKey : '')
  const [stateKey, setStateKey] = React.useState('');

  const stateString = React.useMemo(() => {
    return localStorage.getItem('maccas-dev-tools' + stateKey);
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

  const stateRef = React.useRef(state);

  const setState = (newState, uid) => {
    setStateAux((state) => {
      const realNewState = typeof newState === 'function' ? newState(state) : newState;
      stateRef.current = realNewState;

      // delete any keys that have the value "delete"
      for (let [key, value] of Object.entries(realNewState)) {
        if (value === 'delete') {
          delete realNewState[key];
        }
      }

      return realNewState;
    });

    try {
      window?.MDTsubscriber?.(Math.random());
    } catch (err) {
      console.error('[McDev] Error calling MDTsubscriber', err);
    }
  };

  const oldStateStringRef = React.useRef(stateString);

  React.useEffect(() => {
    // poll localStorage for changes
    if (state?.iframeMode) {
      const interval = setInterval(() => {
        window.intervalCount = window.intervalCount || 1;
        window.intervalCount++;
        if (window?.intervalLogging) {
        }
        const stateString = window.localStorage.getItem(stateKey);

        if (stateString !== oldStateStringRef?.current) {
          oldStateStringRef.current = stateString;
          try {
            const newState = initialiseStateFromParams(JSON.parse(stateString), location, true);
            if (newState) {
              setState(newState, 7);
            }
          } catch {
            console.error('Error parsing cached state');
          }
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, []);

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
    setState(newState, 3);
  };

  try {
    window.MDT.set = set;
    window.MDT.state = state;
  } catch (err) {
    console.error('[McDev] Error setting window.MDT.set', err);
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
    // roundToNearest single digit decimal
    const roundedScale = Math.round(newScale * 10) / 10;
    set('scale', roundedScale);
  }, [scale]);

  const decreaseScale = React.useCallback(() => {
    const newScale = Number(scale) - lowerStep || 1;
    // roundToNearest single digit decimal
    const roundedScale = Math.round(newScale * 10) / 10;
    set('scale', roundedScale);
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

  window.mclog = log;
  window.McLog = log;
  window.Mclog = log;

  const controlFileName = state?.__country === 'NZ' ? 'mcd-control_NZ.csv' : 'mcd-control.csv';

  const mcdControl = (window?.Switchboard?.dataSources?.[controlFileName] || [])?.map((item) => {
    const ret = {
      ...item,
      source: controlFileName
    };

    for (let key in ret) {
      if (key?.startsWith?.('col_')) {
        delete ret[key];
      }
    }
    return ret;
  });

  const mcdPos6 = (window?.Switchboard?.dataSources?.['mcd-pos6.xml.csv'] || [])?.map((item) => {
    const ret = {
      ...item,
      source: 'mcd-pos6.xml.csv'
    };

    for (let key in ret) {
      if (key?.startsWith?.('col_')) {
        delete ret[key];
      }
    }
    return ret;
  });
  const mcdTextDb = (window?.Switchboard?.dataSources?.['mcd-text-db.csv'] || [])?.map((item) => {
    const ret = {
      ...item,
      source: 'mcd-text-db.csv'
    };

    for (let key in ret) {
      if (key?.startsWith?.('col_')) {
        delete ret[key];
      }
    }
    return ret;
  });

  const merged = React.useMemo(() => {
    const main = mcdControl?.map?.((item) => {
      return {
        ...item
      };
    });

    const posAdded = main?.map?.((item) => {
      const posItem = mcdPos6?.find?.(
        (posItem) => posItem?.['Product Code'] === item?.['Product Code'] && posItem?.Language?.includes(state.__country)
      );
      return {
        ...item,
        pos: {
          ...posItem
        },
        source: 'Merged'
      };
    });

    return posAdded;
  });

  window.mcdControl = mcdControl;
  window.mcdPos6 = mcdPos6;
  window.mcdTextDb = mcdTextDb;

  const searchDb = React.useMemo(() => {
    // const data = [...mcdControl, ...mcdPos6, mcdTextDb];
    const data = [...merged];

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
  }, [mcdControl, mcdTextDb, mcdPos6]);

  window.searchDb = searchDb;

  const [searchResults, setSearchResults] = React.useState(null);

  const searchRef = React.useRef({ timeout: null, search: true });

  const searchSwitchboard = (string) => {
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

  const searchSwitchboardDebounced = (string) => {
    clearTimeout(searchRef.current?.timeout);

    searchRef.current.timeout = setTimeout(() => {
      if (stateRef.current?.search !== false) {
        searchSwitchboard(string);
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

  const paramWhitelist = ['debug', 'iframeMode', 'mdt', 'figmaPreview', 'scale', 'dt_mode'];

  const ignoreParams = ['__time'];

  const createUrlFromState = (state, noSet) => {
    try {
      const params = new URLSearchParams();

      if (!noSet) {
        setOldParams(location.search);
      }
      for (let [key, value] of Object.entries(state)) {
        const currentParamValue = params.get(key);

        if (key?.includes('mdtUrl')) {
        }

        if (currentParamValue === 'delete' || value === 'delete') {
          params.delete(key, 'delete');
        } else {
          if (key?.startsWith('__') || paramWhitelist?.includes(key)) {
            params.set(key, value);
          }
        }
      }

      // loop over query params and delete any with the value "delete"
      const paramsObj = Object.fromEntries(params.entries());
      for (let [key, value] of Object.entries(paramsObj)) {
        if (value === 'delete') {
          params.delete(key);
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
        window.localStorage.setItem('maccas-dev-tools' + stateKey, stringifiedState);
      } else {
        console.error('Error setting localStorage because stringifiedState was undefined');
      }
    }

    window.MDT.state = state;

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

    const contextFields = state?.contextFields;

    if (contextFields) {
      try {
        if (contextFields === 'delete') {
          window.localStorage.setItem('contextFields', defaultState?.contextFields);
        } else {
          window.localStorage.setItem('contextFields', contextFields);
        }
      } catch (err) {
        console.error('Error setting contextFields', err);
      }
    }

    const mdtUrl = state?.mdtUrl || state?.__mdtUrl;

    if (mdtUrl && mdtUrl !== 'delete') {
      try {
        window.localStorage.setItem('mdtUrl', mdtUrl);
      } catch (err) {
        console.error('Error setting mdtUrl', err);
      }
    }
  }, [state, stateKey]);

  React.useEffect(() => {
    onStateChange(state);

    if (typeof state?.lockVideo === 'number') {
      const interval = setInterval(() => {
        window.intervalCount = window.intervalCount || 1;
        window.intervalCount++;
        if (window?.intervalLogging) {
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

  const lowStepKeys = ['scale', 'figmaPreview', 'contentPreview', 'iframeScale'];

  const [pageTitle, setPageTitle] = React.useState(document.title);
  const pageTitleRef = React.useRef(pageTitle);
  const [splitChar, setSplitChar] = React.useState('/');

  const elScaleRef = React.useRef(elScale);

  // poll to add adjustment to elements with class .mdt-position
  React.useEffect(() => {
    const interval = setInterval(() => {
      window.intervalCount = window.intervalCount || 1;
      window.intervalCount++;
      if (window?.intervalLogging) {
      }
      const title = document.title?.replace('McDev - ', '')?.replace('Maccas DMB - ', '');
      if (title !== pageTitleRef?.current) {
        if (title?.includes?.('/')) {
          setSplitChar('/');
        } else if (title?.includes?.('-')) {
          setSplitChar('-');
        }
        pageTitleRef.current = title;
        setPageTitle(title);
      }

      const all = document.querySelectorAll('.mdt-position');

      let allHaveMdt = true;

      all?.forEach((el) => {
        // if el doesn't have a click event listener
        // add one that allows dragging the position via changing style.left and style.top
        if (!el?.__mdt) {
          allHaveMdt = false;
          el.__mdt = true;

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

            window.MDT.grabbedEl = el;
            window.MDT.lastEl = el;
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

      if (allHaveMdt) {
        clearInterval(interval);
      }
    }, 2000);

    const onMouseMove = (e) => {
      const currentEl = window.MDT.grabbedEl;

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
      const currentEl = window.MDT.grabbedEl;

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

      window.MDT.grabbedEl = null;
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
    if (window?.MDT?.lastEl) {
      // get the scale from class with format scale-[1.2]

      const styleScale = window?.MDT?.lastEl?.style?.transform?.match?.(/scale\((.*?)\)/);

      if (styleScale) {
        setElScale(styleScale?.[1]);
        return;
      }

      const elScaleMatch = window?.MDT?.lastEl?.className?.match?.(/scale-\[(.*?)\]/);

      if (elScaleMatch) {
        // remove scale from class
        window.MDT.lastEl.className = window.MDT.lastEl.className.replace(/scale-\[(.*?)\]/, '');
        setElScale(elScaleMatch?.[1]);
      } else {
        // check if el has scale style
        const scale = window?.MDT?.lastEl?.style?.scale;
        if (scale) {
          setElScale(scale);
        }
      }
    }
  }, [window?.MDT?.lastEl]);

  // transform lastEl scale by current value of el scale
  React.useEffect(() => {
    if (window?.MDT?.lastEl) {
      // set transform scale style of lastEl to elScale
      window.MDT.lastEl.style.scale = elScale;
      elScaleRef.current = elScale;
    } else {
      elScaleRef.current = undefined;
    }
  }, [elScale]);

  React.useEffect(() => {
    try {
      window.MDTsubscriber(Math.random());
    } catch (err) {
      console.error('[McDev] Error calling MDTsubscriber', err);
    }
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

          link.download = `McDev-${time}-${dayOfWeek}-${areaString}-${state?.__orientation}-${random4letters}.png`;
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
          <Box as="span" maxWidth="160px">
            {key} {note}
          </Box>
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

  const nzShakeRfms = {
    CHOCOLATE_SHAKE_LARGE: '81',
    CHOCOLATE_SHAKE_MED: '80',
    CHOCOLATE_SHAKE_SMALL: '79',
    STRAWBERRY_SHAKE_LARGE: '87',
    STRAWBERRY_SHAKE_MED: '86',
    STRAWBERRY_SHAKE_SMALL: '85',
    VANILLA_SHAKE_LARGE: '7903',
    VANILLA_SHAKE_MED: '7902',
    VANILLA_SHAKE_SMALL: '7901'
  };

  const groups = {
    Region: ['__country'],
    Orientation: ['__allOrientations', '__horizontal', '__vertical'],
    Dayparts: [
      '__time',
      '__multiView',
      '__area',
      '__daypart',
      '__mccafe',
      '__allDayparts',
      '__Breakfast',
      '__MTea',
      '__Lunch',
      '__ATea',
      '__Dinner',
      '__LateNight',
      '__Overnight',
      '__NotBreakfast'
    ],
    Screens: ['__screen_no', '__no_of_screens', '__startingScreen', '__screenRange', '__minScreens', '__maxScreens'],
    Presell: [
      {
        key: '__lockVideo',
        note: "Lock's all videos at this timestamp in seconds"
      },
      {
        key: '__presellIndex',
        note: 'Filteres presell videos to only show either an index by number or where video filenames contain this value eg. 189_19_DT_Summer_2023_SoftServe_Presell_09s_10'
      }
    ],
    'Creme Brulle': ['__35221', '__35222', '__35223'],
    'Big Breakfast Deal': ['__big-breakfast-deal', '__10032'],

    'Spicy Nugs McBites': [
      {
        key: '__mcbites-trial',
        note: 'McBites Trial'
      },

      {
        key: '__4854',
        note: 'Spicy Nugs 20 piece'
      },

      {
        key: '__980',
        note: 'McBites 10 pc'
      },

      {
        key: '__6267',
        note: 'Custard Pie'
      },

      { key: '__1780', note: 'Hot Fudge Sundae Large' }
    ],

    'Surprise Fries': ['__surprise-fries'],
    'Caramello Flurry': [
      {
        key: '__30061',
        note: 'Caramel Flurry'
      },
      {
        key: '__30062',
        note: 'LCM Caramel Flurry LCM'
      },
      {
        key: '__40071',
        note: 'Chocolate Flurry'
      },
      {
        key: '__mcflurry-caramello',
        note: 'Caramello McFlurry Campaign'
      }
    ],
    'Shakes 🧋': Object.entries(nzShakeRfms || {})?.map((rfmPair) => {
      return {
        key: '__' + rfmPair[1],
        note: rfmPair[0]
      };
    }),

    'Chicken Muffins 🐔🍗': [
      // turn into groups
      // 40266 - CHICKEN MCMUFFIN
      // 40267 - CHICKEN MCMUFFIN - VM

      // 40268 - CHICKEN & BACON MCMUFFIN
      // 40269 - CHICKEN&BACON MCMUFFIN - VM

      {
        key: '__chicken-mcmuffin',
        note: 'Chicken McMuffin Campaign'
      },

      {
        key: '__40266',
        note: 'Chicken McMuffin'
      },
      {
        key: '__40267',
        note: 'Chicken McMuffin - VM'
      },
      {
        key: '__40268',
        note: 'Chicken & Bacon McMuffin'
      },
      {
        key: '__40269',
        note: 'Chicken & Bacon McMuffin - VM'
      }
    ],
    McCrispy: ['__20562', '__20578'],
    'Easter / HCB': [
      {
        key: '__hot-cross-buns-easter',
        note: 'HCB Easter'
      },
      {
        key: '__hot-cross-buns-pre-easter',
        note: 'HCB Pre Easter'
      },
      {
        key: '__35205',
        note: 'HCB With Cadbury Choc Chips with butter'
      },
      {
        key: '__7701',
        note: 'Fruit HCB with butter'
      }
    ],
    'Kerwin 🍔': ['__20606', '__20607', '__40259'],
    'Crash 🦊': [{ key: '__happymeal-crash-bandicoot', note: 'Crash Bandicoot Happy Meal' }],
    '$12 Nugs': ['__twelve-dollar-nuggets', { key: '__5079', note: '20pc Chicken McNuggets for $12' }],
    'POP 🎈💢': [
      { key: '__mcpops-trial', note: 'McPops Trial' },
      { key: '__35228', note: 'Berry' },
      { key: '__35229', note: 'Chocolate' },
      { key: '__35227', note: 'Cookiebutter' }
    ],
    'Merch LCM 💰🪙': [
      '__merch-LCM-trial-subtle',
      '__merch-LCM-trial-overt',
      '__merch-LCM-trial-vic',
      '__merch-LCM-trial-thornleigh',
      { key: '', note: 'Applicable new RFMs/trials' },
      { key: '__10031', note: '2x Hash Browns Deal' },
      { key: '__8574', note: 'LCM Soft Serve Cone with Flake' },
      { key: '__5026', note: 'LCM 24pc Chicken McNuggets' },
      { key: '__5738', note: 'LCM Oreo McFlurry' },
      { key: '__30001', note: 'LCM Hot Fudge Sundae Sml' },
      { key: '', note: 'Vanilla & Choc Soft RFMs:' },
      { key: '__40065', note: 'Vanilla Soft Serve for Small Sundae' },
      { key: '__40066', note: 'Chocolate Soft Serve Small Sundae' },
      { key: '__40068', note: 'Vanilla oft Serve for Large Sundae' },
      { key: '__40069', note: 'Chocolate Soft Serve Large Sundae' },
      { key: '__40070', note: 'Vanilla Soft Serve for McFlurry' },
      { key: '__40071', note: 'Chocolate Soft Serve McFlurry' },
      { key: '__40072', note: 'Vanilla Soft Serve for Cone' },
      { key: '__40073', note: 'Chocolate Soft Serve for Cone' }
    ]
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

  const [testState, setTestState] = React.useState({
    width: 500,
    height: 500
  });

  const onDrag = (e) => {
    const draggableBottom = state?.draggableBottom || 0;
    const draggableRight = state?.draggableRight || 0;

    const { movementX, movementY } = e;

    // current window zoom level
    const currentZoom = window?.devicePixelRatio;

    const { modifiedX, modifiedY } = {
      modifiedX: movementX / (currentZoom / newScale),
      modifiedY: movementY / (currentZoom / newScale)
    };

    set('draggableBottom', draggableBottom - modifiedY);
    set('draggableRight', draggableRight - modifiedX);
  };

  window.resetWindow = () => {
    set('draggableBottom', 0);
    set('draggableRight', 0);
    set('resizableHeight', 1000);
    set('resizableWidth', 1000);
  };

  const DraggableCore = Draggable?.DraggableCore;

  // template
  return (
    <>
      <Global
        styles={{
          body: {
            // paddingBottom: '50vh !important'
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
            ...(state?.mdtPosition && {
              pointerEvents: 'none'
            })
          },
          '#root .mdt-child *': {
            pointerEvents: 'all !important'
          },
          '.mdt-position': {
            // no drag
            '-webkit-user-drag': 'none',
            img: {
              '-webkit-user-drag': 'none'
            },
            ...(state?.mdtPosition && {
              // grab cursor
              pointerEvents: 'all !important',
              userSelect: 'none',
              cursor: 'grab',
              '*': {
                userSelect: 'none'
              }
            })
          },
          '.mdt-self-position': {
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
        className="mcdev-container"
        position="fixed"
        zIndex={999999999}
        top={0}
        p={50 * screenScale + 'px'}
        left={0}
        bottom={0}
        right={0}
        // pointerEvents="none"
        // bg="rgba(0,0,0,0.2)"
      >
        <Box w="100%" h="100%" position="relative">
          {Resizable && (
            <>
              <Resizable
                height={state?.resizableHeight || 1000}
                width={state?.resizableWidth || 1000}
                onResize={(event, { node, size, handle }) => {
                  set('resizableHeight', size.height);
                  set('resizableWidth', size.width);
                }}
                resizeHandles={state?.open ? ['sw', 'se', 'nw', 'ne', 'w', 'e', 'n', 's'] : []}
              >
                <Box
                  zIndex={9999999}
                  sx={{
                    '*': {
                      'line-height': '100% !important'
                    }
                  }}
                  position="absolute"
                  bottom={state?.draggableBottom || 0}
                  right={state?.draggableRight || 0}
                  display="flex"
                  flexDir="column"
                  transform={`scale(${newScale})`}
                  // className="mdt-self-position"
                  padding={16}
                  color="white"
                  // w="auto"
                  maxH={(window.outerHeight * 0.8) / scaleRef.current + 'px'}
                  height={state?.open ? state?.resizableHeight : 'auto'}
                  width={state?.open ? state?.resizableWidth : 'auto'}
                  maxW={(window.outerWidth * 0.6) / scaleRef.current + 'px'}
                  borderRadius="16px"
                  bg="#DD2514"
                  pointerEvents="all"
                  transformOrigin="bottom right"
                >
                  {!state?.open && <Box width="60px" height="56px"></Box>}

                  {DraggableCore && (
                    <>
                      <DraggableCore onDrag={onDrag}>
                        <Box
                          title="Open/Close McDev"
                          cursor="pointer"
                          onClick={() => set('open', !state?.open)}
                          position="absolute"
                          top={-22}
                          right={22}
                          maxWidth="48px"
                          onMouseDown={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <img
                            onMouseDown={(e) => {
                              e.preventDefault();
                            }}
                            lazy
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png"
                          ></img>
                        </Box>
                      </DraggableCore>
                    </>
                  )}
                  <Flex alignItems="center" flexDir="row" display={state?.open ? 'flex' : 'none'}>
                    <Box fontSize="36px" pb={8}>
                      McDev
                    </Box>
                    <Box fontSize={24} px={18} mt={-5}>
                      🍔
                    </Box>
                    <Flex alignItems="center" fontSize="36px" pb={8}>
                      {!state?.__multiView ? (
                        <>
                          {pageTitle?.split(splitChar)?.[0]}
                          <Box px={12} fontSize={24} mt={-2}>
                            🍟
                          </Box>
                          {pageTitle?.split(splitChar)?.[1]}
                        </>
                      ) : (
                        'Multi View'
                      )}
                    </Flex>
                    <Flex alignItems="center" fontSize="36px" pb={8}>
                      {state?.__inspiration && (
                        <>
                          <Box px={12} fontSize={24} mt={-2}>
                            👨‍🎨
                          </Box>
                          Inspiration
                        </>
                      )}
                      {state?.__foodcourt && (
                        <>
                          <Box px={12} fontSize={24} mt={-2}>
                            🍽️
                          </Box>
                          Foodcourt
                        </>
                      )}
                    </Flex>
                  </Flex>

                  <Flex
                    overflowY="scroll"
                    display={state?.open && logs?.length && state?.showLogs !== false ? undefined : 'none'}
                    flexDir="column"
                    id="mdt-logs"
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
                    display={state?.open && state?.showSearch ? undefined : 'none'}
                    maxH={(window.outerHeight * (state.maxHSearch || 0.5)) / scaleRef.current + 'px'}
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
                        searchSwitchboardDebounced(val);
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
                  <Flex
                    display={state?.open && !state?.hideData ? 'flex' : 'none'}
                    // maxH={state?.varsMaxH}
                    // maxH={(window.outerHeight * (state.maxHData || 0.3)) / scaleRef.current + 'px'}
                    w="100%"
                    h="100%"
                    gap={32}
                    // w={'auto'}
                    flexDir="row"
                    wrap={'wrap'}
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
                  </Flex>

                  <Box mt={'auto'}></Box>

                  <Flex display={state?.open ? 'flex' : 'none'} justifyContent="flex-end" my={30} gap={16} wrap={'wrap'}>
                    {/* Area Selection Dropdown */}
                    <Box
                    // lower gap for these
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
                    <Box>
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
                    <Box>
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
                    <Box>
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
                  </Flex>

                  <Flex
                    userSelect="none"
                    ml="auto"
                    marginTop="12"
                    flexDir="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    gap={'30px 30px'}
                    maxWidth="100%"
                    cursor="pointer"
                    // wrap
                    wrap="wrap"
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
                    {/* Toggle visibility of debug pull */}

                    <Box
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

                    {/* Toggle Multi View which is where you see titles and multiple screens */}
                    <Box
                      opacity={state?.__multiView ? 1 : 0.45}
                      onClick={() => {
                        set('__multiView', !state?.__multiView);
                      }}
                      title="Toggle Multi View"
                    >
                      🌈
                    </Box>

                    {/* Show all screen sets */}
                    <Box
                      opacity={state?.__minScreens === 3 && state?.__maxScreens === 6 && state?.__startingScreen === 1 ? 1 : 0.45}
                      onClick={() => {
                        set('__minScreens', 3);
                        set('__maxScreens', 6);
                        set('__startingScreen', 1);
                        set('__screenRange', 6);
                      }}
                      title="Show all screen sets"
                    >
                      🔢
                    </Box>

                    {/* Toggle all orientations */}

                    <Box
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

                    {/* Play next video of window.videoPlayers[uid] keys */}
                    <Box
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
                      opacity={state?.mdtPosition ? 1 : 0.45}
                      onClick={() => {
                        set('mdtPosition', !state?.mdtPosition);
                      }}
                      title="Toggle Drag and Drop Position"
                    >
                      ✊
                    </Box>

                    {/* Flip between __orientation = 'horizontal' and 'vertical' */}
                    <Box
                      transform={`rotate(${state?.__orientation === 'vertical' ? 90 : 0}deg)`}
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
                      🔁
                    </Box>

                    {/* Toggle Horizontal rotation */}
                    <Box
                      opacity={state?.__horizontal ? 1 : 0.45}
                      transform={`rotate(90deg)`}
                      mt={-10}
                      onClick={() => {
                        const newVal = !state?.__horizontal;
                        set('__horizontal', newVal);
                        if (newVal) {
                          set('__orientation', 'horizontal');
                        }
                        set('__allOrientations', false);
                      }}
                      title="Toggle Orientation"
                    >
                      📱
                    </Box>

                    {/* Toggle Vertical rotation */}
                    <Box
                      opacity={state?.__vertical ? 1 : 0.45}
                      onClick={() => {
                        const newVal = !state?.__vertical;
                        if (newVal) {
                          set('__orientation', 'vertical');
                        }
                        set('__vertical', newVal);
                        set('__allOrientations', false);
                      }}
                      title="Toggle Orientation"
                    >
                      📱
                    </Box>

                    {/* Toggle Shoppable */}

                    <Box
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
                      opacity={state?.__foodcourt ? 1 : 0.45}
                      onClick={() => {
                        const newVal = !state?.__foodcourt;

                        set('__foodcourt', newVal);

                        if (newVal) {
                          set('dt_mode', false);
                          set('__inspiration', false);
                        }
                      }}
                      title="Toggle Foodcourt Mode"
                    >
                      🍽️
                    </Box>

                    <Box
                      opacity={state?.__inspiration ? 1 : 0.45}
                      onClick={() => {
                        const newVal = !state?.__inspiration;
                        set('__inspiration', newVal);

                        // set drive thru mode to false because it breaks inspiration view
                        if (newVal) {
                          set('dt_mode', false);
                          set('__foodcourt', false);
                        }
                      }}
                      title="Toggle Inspiration Mode"
                    >
                      🙏
                    </Box>

                    <Box
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
                      opacity={state?.__refresh ? 1 : 0.45}
                      onClick={() => {
                        set('__refresh', !state?.__refresh);
                      }}
                      title="Toggle Refresh on Change"
                    >
                      🌀
                    </Box>

                    <Box
                      // opacity={state?.refresh ? 1 : 0.45}
                      onClick={() => {
                        window.location.reload();
                      }}
                      title="Refresh NOW"
                    >
                      🌊
                    </Box>

                    <Box title="Toggle Figma Previews">
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
                    <Box position="relative" w="100px" title="Adjust Figma Previews">
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
                    <Box position="relative" w="100px" title="Adjust Figma Previews">
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
                    <Box title="Toggle Figma Previews">
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

                    <Box>
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
                    <Box title="Toggle Logs">
                      <Box
                        opacity={state?.showLogs ? 1 : 0.45}
                        onClick={() => {
                          set('showLogs', !state?.showLogs);
                        }}
                      >
                        📜
                      </Box>
                    </Box>

                    <Box title="Toggle Screen Names">
                      <Box
                        opacity={state?.screenNames ? 1 : 0.45}
                        onClick={() => {
                          set('screenNames', state?.screenNames ? 0 : 0.3);
                        }}
                      >
                        🪧
                      </Box>
                    </Box>

                    <Box title="Show Debug State">
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
                      <Box
                        title="Scale Down McDev"
                        py={3}
                        textAlign="center"
                        bg="#FFCD27"
                        borderRadius="8px"
                        width="80px"
                        ml="auto"
                        onClick={decreaseScale}
                      >
                        <Box mt={3} fontSize="28px">
                          -
                        </Box>
                      </Box>
                      <Box
                        title="Scale Up McDev"
                        ml={16}
                        py={3}
                        textAlign="center"
                        bg="#FFCD27"
                        borderRadius="8px"
                        width="80px"
                        onClick={increaseScale}
                      >
                        <Box mt={3} fontSize="28px">
                          +
                        </Box>
                      </Box>
                    </Flex>
                  </Flex>
                </Box>
              </Resizable>
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('maccas-dev-tools'));

const router = createBrowserRouter([{ path: '*', element: <App /> }]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </React.StrictMode>
);

// css
const css = `
.react-resizable {
  // position: relative;
}
.react-resizable-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  background-repeat: no-repeat;
  background-origin: content-box;
  box-sizing: border-box;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjMwMiI+PHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQgNC4yIEwgNC4yIDQuMiBMIDQuMiAwIEwgNiAwIEwgNiA2IEwgNiA2IFoiIGZpbGw9IiMwMDAwMDAiLz48L2c+PC9zdmc+');
  background-position: bottom right;
  padding: 0 3px 3px 0;
}
.react-resizable-handle-sw {
  bottom: 0;
  left: 0;
  cursor: sw-resize;
  transform: rotate(90deg);
}
.react-resizable-handle-se {
  bottom: 0;
  right: 0;
  cursor: se-resize;
}
.react-resizable-handle-nw {
  top: 0;
  left: 0;
  cursor: nw-resize;
  transform: rotate(180deg);
}
.react-resizable-handle-ne {
  top: 0;
  right: 0;
  cursor: ne-resize;
  transform: rotate(270deg);
}
.react-resizable-handle-w,
.react-resizable-handle-e {
  top: 50%;
  margin-top: -10px;
  cursor: ew-resize;
}
.react-resizable-handle-w {
  left: 0;
  transform: rotate(135deg);
}
.react-resizable-handle-e {
  right: 0;
  transform: rotate(315deg);
}
.react-resizable-handle-n,
.react-resizable-handle-s {
  left: 50%;
  margin-left: -10px;
  cursor: ns-resize;
}
.react-resizable-handle-n {
  top: 0;
  transform: rotate(225deg);
}
.react-resizable-handle-s {
  bottom: 0;
  transform: rotate(45deg);
}
`;

const style = document.createElement('style');
style.innerHTML = css;

// attach to body
document.body.appendChild(style);
