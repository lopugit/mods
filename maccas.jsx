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
} = ChakraUI

const { Global } = Emotion

const { createBrowserRouter, RouterProvider, useLocation } = ReactRouterDom

const refreshable = [
  '__inspiration',
  '__orientation',
  // match anything that starts with __
  /^__.*/
]

const noRefresh = [
  // '__when', 
  '__where'
]

let stateInitialised = false

const ignoreInIframe = ['figmaPreview']

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
  console.error('Error overwriting console.log', err)
}

const initialiseStateFromParams = (forceState, location, ignoreInitialised) => {
  try {
    if (stateInitialised && !ignoreInitialised) {
      return
    }

    stateInitialised = true
    

    const params = new URLSearchParams(location.search)
    const newState = forceState ? { ...forceState, mdt: true } : { mdt: true }
    
    for (let [key, value] of params) {
      
      console.log('[McDev][initialiseStateFromParams][key][value]', key, value)
      
      if (key === '__stateKey') {
        // console.log('nik forceState?.__stateKey', forceState?.__stateKey)
        // console.log('nik initialStateKey', initialStateKey)
        // console.log('nik key', key)
      }
      
      if (!ignoreInIframe?.includes(key) && (forceState?.__stateKey === initialStateKey || key === '__stateKey' || !Object.hasOwnProperty?.(forceState, key))) {
        // console.log('nik setting 123')
        if (value == Number(value)) {
          newState[key] = Number(value)
          // remove leading __
          newState[key?.slice(2, key?.length)] = Number(value)
        } else if (value === 'true' || value === 'false') {
          if (value === 'true') {
            newState[key] = true
            newState[key?.slice(2, key?.length)] = true
          } else {
            newState[key] = false
            newState[key?.slice(2, key?.length)] = false
          }
        } else {
          newState[key] = value
          newState[key?.slice(2, key?.length)] = value
        }
      }
    }

    return newState

    // setState((state) => {
    //   return { ...state, ...newState }
    // }, 4)
  } catch (err) {
    console.error('Error initialising state from params', err)
  }
}

console.log('[McDev] Loaded React App')


// get initialStateKey from window query params stateKey
// if it exists
const initialStateKey = new URLSearchParams(window.location.search).get('__stateKey')

const App = props => {
  const location = useLocation()
  
  // const [stateKey, setStateKey] = React.useState(initialStateKey ? initialStateKey : '')
  const [stateKey, setStateKey] = React.useState('')

  const stateString = React.useMemo(() => {
    return localStorage.getItem('maccas-dev-tools'+stateKey)
  }, [])

  const cachedState = React.useMemo(() => {
    try {
      return JSON.parse(stateString)
    } catch (err) {
      console.error('Error parsing cached state', err)
      throw err
    }
  }, [])
  
  const [state, setStateAux] = React.useState(
    initialiseStateFromParams(
      stateString
        ? {
            ...cachedState,
            fixedWidth: cachedState?.fixedWidth || '600px',
            fixedHeight: cachedState?.fixedHeight || '600px',
            varsMaxH: cachedState?.varsMaxH || '30vh',
            previewsMaxH: cachedState?.previewsMaxH || '35vh'
          }
        : {},
      location
    )
  )
  
  console.log('nik stateKey', stateKey)
  console.log('nik cachedState', cachedState)
  console.log('nik cachedState?.scale', cachedState?.scale)
  console.log('nik state', state)
  console.log('nik state?.scale', state?.scale)

  const stateRef = React.useRef(state)

  const setState = (newState, uid) => {
    setStateAux(state => {
      const realNewState =
        typeof newState === 'function' ? newState(state) : newState
      stateRef.current = realNewState

      return realNewState
    })

    try {
      window?.MDTsubscriber?.(Math.random())
    } catch (err) {
      console.error('[McDev] Error calling MDTsubscriber', err)
    }
  }

  const oldStateStringRef = React.useRef(stateString)

  React.useEffect(() => {
    // poll localStorage for changes
    if (state?.iframeMode) {
      const interval = setInterval(() => {
        const stateString = window.localStorage.getItem(stateKey)

        if (stateString !== oldStateStringRef?.current) {
          console.log('[McDev] Updating state from localStorage')
          oldStateStringRef.current = stateString
          try {
            const newState = initialiseStateFromParams(
              JSON.parse(stateString),
              location,
              true
            )
            setState(newState, 7)
          } catch {
            console.error('Error parsing cached state')
          }
        }
      }, 500)

      return () => clearInterval(interval)
    }
  }, [])

  const set = (key, value, uid) => {
    
    // clear timeout of refresh each time set is called 😂

    if (typeof key === 'object') {
      const newState = {}
      key?.forEach((key, i) => {
        newState[key] = value instanceof Array ? value[i] : value
      })
      setState(state => {
        return Object.assign({}, state, newState)
        // return { ...state, ...newState }
      }, 1)
    } else {
      setState(state => {
        return Object.assign({}, state, { [key]: value })
        return { ...state, [key]: value }
      }, 2)
    }
  }

  const deleteKey = key => {
    const newState = { ...state }
    delete newState[key]
    setState(newState, 3)
  }

  try {
    window.MDT.set = set
    window.MDT.state = state
  } catch (err) {
    console.error('[McDev] Error setting window.MDT.set', err)
  }

  const wheres = ['FrontCounter', 'DriveThru', 'Dining', 'Pylon', 'McCafeReel', 'McCafeMenu']

  const whens = [
    'Breakfast',
    'MTea',
    'Lunch',
    'ATea',
    'Dinner',
    'LateNight',
    'Overnight',
    'NotBreakfast'
  ]
  
  const copyWithNotification = (string) => {
    try {
      navigator.clipboard.writeText(string)
      set('copiedText', string)
      set('copied', true)

      setTimeout(() => {
        set('copied', false)
        setTimeout(() => {
          set('copiedText', null)
        }, 1000)
      }, 1200)
    } catch (err) {
      console.error('Error copying to clipboard', err)
    }
  }

  const scale = React.useMemo(() => state?.scale || 1, [state])

  const lowerStep = 0.1

  const increaseScale = React.useCallback(() => {
    const newScale = Number(scale) + lowerStep || 1
    set('scale', newScale)
  }, [scale])

  const decreaseScale = React.useCallback(() => {
    const newScale = Number(scale) - lowerStep || 1
    set('scale', newScale)
  }, [scale])

  // update state when location changes
  // map all query params to state

  const updateStateFromParams = forceState => {
    const params = new URLSearchParams(location.search)
    const newState = forceState ? { ...forceState } : {}
    const paramsObj = {}
    for (let [key, value] of params) {
      paramsObj[key] = value

      // check if value contains any latin characters
      // if so don't cast to number
      const latinRegex = /[A-Za-z]/
      const notNumber = latinRegex.test(value)

      if (!notNumber && value == Number(value)) {
        newState[key] = Number(value)
      } else if (value === 'true' || value === 'false') {
        if (value === 'true') {
          newState[key] = true
        } else {
          newState[key] = false
        }
      } else {
        newState[key] = value
      }
    }

    console.log('[McDev][updateStateFromParams][paramsObj]', paramsObj)
    console.log('[McDev][updateStateFromParams][newState]', newState)

    setState(state => {
      return { ...state, ...newState }
    }, 4)
  }

  const [oldSearch, setOldSearch] = React.useState(location.search)

  React.useEffect(() => {
    // update once at start
    if (!state?.iframeMode) {
      updateStateFromParams()
    }
  }, [])

  React.useEffect(() => {
    if (location.search !== oldSearch) {
      setOldSearch(location.search)
      updateStateFromParams()
    }
  }, [location])

  const [oldParams, setOldParams] = React.useState(location.search)

  const [oldState, setOldState] = React.useState(state)
  
  const refreshRef = React.useRef({ timeout: null })

  const refresh = () => {
    
    clearTimeout(refreshRef.current?.timeout)
    
    refreshRef.current.timeout = setTimeout(() => {
    
      if (stateRef.current?.refresh !== false) {
        window.location.reload()
      }
      
    }, 1000)
    
  }

  const paramWhitelist = [
    'debug',
    'iframeMode',
    'mdt',
    'figmaPreview',
    'scale',
    'dt_mode'
  ]
  
  const ignoreParams = [
    '__time'
  ]

  const createUrlFromState = (state, noSet) => {
    try {
      const params = new URLSearchParams()

      if (!noSet) {
        setOldParams(location.search)
      }
      for (let [key, value] of Object.entries(state)) {
        if (key?.startsWith('__') || paramWhitelist?.includes(key)) {
          params.set(key, value)
        }
      }
            
      const newUrl = `${location.pathname}?${params.toString()}`
      return newUrl
    } catch (err) {
      console.error('Error creating URL from state', err)
    }

    return 'Error'
  }

  React.useEffect(() => {
    stateRef.current = state

    
    console.log('[McDev] Checking stateKey !== stateKey', state?.stateKey, stateKey, state?.stateKey !== stateKey)

    if (!state?.iframeMode) {
      const stringifiedState = JSON.stringify(state)
      oldStateStringRef.current = stringifiedState
      console.log('[McDev] Setting localStorage with stateKey', stateKey)
      if (stringifiedState && stringifiedState !== 'undefined') {
        window.localStorage.setItem('maccas-dev-tools'+stateKey, stringifiedState)
        console.log('[McDev] Set localStorage with stateKey', stateKey)
      } else {
        console.error('Error setting localStorage because stringifiedState was undefined')
      }
    }
    

    window.MDT.state = state

    // update query params when state changes

    const newUrl = createUrlFromState(state)

    window.history.replaceState({}, '', newUrl)

    // check if any refreshable keys have changed
    // if so, refresh the page
    for (let [key, value] of Object.entries(state)) {
      if (!noRefresh?.includes(key) && value !== oldState[key]) {
        if (refreshable.includes(key)) {
          // debounced refresh
          refresh()
        } else if (refreshable?.some(r => r.test?.(key))) {
          // debounced refresh
          refresh()
        }
      }
    }

    setOldState(state)
  }, [state, stateKey])

  const iframePadding = 0

  const allPreviews = React.useMemo(() => {
    const minScreens = 3
    const maxScreens = 6
    const orientations = ['horizontal', 'vertical']

    const ret = []

    for (let i = minScreens; i <= maxScreens; i++) {
      const orientationGroup = []
      for (let __orientation of orientations) {
        orientationGroup.push({
          __no_of_screens: i,
          __orientation
        })
      }
      ret.push(orientationGroup)
    }

    return ret?.reverse()
  }, [])

  // make sure preview display is in sync with show
  React.useEffect(() => {
    const newState = { ...stateRef.current }

    allPreviews?.forEach(nScreens => {
      const screenCount = nScreens?.[0]?.__no_of_screens

      const uid = `show${screenCount}`

      if (!newState?.[uid] || !newState?.[uid + 'disp']) {
        newState[uid] = false
        newState[uid + 'disp'] = false
      }

      nScreens.forEach(bank => {
        const orientation = bank.__orientation

        const uid2 = `show${screenCount}${orientation}`

        if (!newState?.[uid2] || !newState?.[uid2 + 'disp']) {
          newState[uid2] = false
          newState[uid2 + 'disp'] = false
        }
      })
    })

    setState(newState, 5)
  }, [allPreviews])

  const iframeRef = React.useRef({})

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
          mdt: true
        },
        true
      )

      const uid = `iframe${screenCount}${orientation}${i}`

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
        )

        iframeRef.current[uid] = newIframe

        return newIframe
      } else {
        return iframeRef.current[uid]
      }
    },
    [state, iframeRef]
  )

  const lowStepKeys = ['scale', 'figmaPreview', 'contentPreview', 'iframeScale']

  const [pageTitle, setPageTitle] = React.useState(document.title)
  const pageTitleRef = React.useRef(pageTitle)
  const [splitChar, setSplitChar] = React.useState('/')
  
  const elScaleRef = React.useRef(elScale)

  // poll to add adjustment to elements with class .mdt-position
  React.useEffect(() => {
    const interval = setInterval(() => {
      const title = document.title
        ?.replace('McDev - ', '')
        ?.replace('Maccas DMB - ', '')
      if (title !== pageTitleRef?.current) {
        if (title?.includes?.('/')) {
          setSplitChar('/')
        } else if (title?.includes?.('-')) {
          setSplitChar('-')
        }
        pageTitleRef.current = title
        setPageTitle(title)
      }

      const all = document.querySelectorAll('.mdt-position')

      all?.forEach(el => {
        // if el doesn't have a click event listener
        // add one that allows dragging the position via changing style.left and style.top
        if (!el?.__mdt) {
          el.__mdt = true

          // on click set grabbedEl to this element
          el.addEventListener('mousedown', e => {

            // if not with right click
            if (e?.button === 2) {
              return
            }

            // use el.style.left/top instead of bounding client rect

            // sanitise style left and top into Numbers with decimals, so delete px/% etc..

            let left, top, bottom, right

            // get left and top from tailwind styling in the format
            // left-[100px] top-[100px]
            // if it exists, otherwise use e.style.left/top

            left = el?.style?.left?.replace?.('px', '')?.replace?.('%', '')
            right = el?.style?.right?.replace?.('px', '')?.replace?.('%', '')
            top = el?.style?.top?.replace?.('px', '')?.replace?.('%', '')
            bottom = el?.style?.bottom?.replace?.('px', '')?.replace?.('%', '')

            if (
              stateRef?.current?.tailwindStyling &&
              !(
                (left && top) ||
                (left && bottom) ||
                (right && top) ||
                (right && bottom)
              )
              // && !(Object.hasOwnProperty?.(el, 'style') && Object.hasOwnProperty?.(el?.style, 'left'))
            ) {
              const leftMatch = el?.className?.match?.(/left-\[(.*?)\]/)
              const topMatch = el?.className?.match?.(/top-\[(.*?)\]/)
              const rightMatch = el?.className?.match?.(/right-\[(.*?)\]/)
              const bottomMatch = el?.className?.match?.(/bottom-\[(.*?)\]/)

              if (leftMatch?.[1]) {
                left = Number(
                  leftMatch?.[1]?.replace?.('px', '')?.replace?.('%', '')
                )
              }

              if (topMatch?.[1]) {
                top = Number(
                  topMatch?.[1]?.replace?.('px', '')?.replace?.('%', '')
                )
              }

              if (bottomMatch?.[1]) {
                bottom = Number(
                  bottomMatch?.[1]?.replace?.('px', '')?.replace?.('%', '')
                )
              }

              if (rightMatch?.[1]) {
                right = Number(
                  rightMatch?.[1]?.replace?.('px', '')?.replace?.('%', '')
                )
              }
            } else {
              left = Number(left)
              top = Number(top)
              bottom = Number(bottom)
            }

            // store mouse position at grabbed time
            stateRef.current.grabbedMouseX = e.clientX
            stateRef.current.grabbedMouseY = e.clientY

            window.MDT.grabbedEl = el
            window.MDT.lastEl = el
            stateRef.current.grabbedLeft = left
            stateRef.current.grabbedTop = top
            stateRef.current.grabbedRight = right
            stateRef.current.grabbedBottom = bottom

            const boundingClientRect = el.getBoundingClientRect()

            // store initial mouse offset from origin of element
            // so we can add this to the new mouse position to get the new left and top
            // when dragging
            stateRef.current.grabbedMouseOffsetX =
              e.clientX - boundingClientRect?.left
            stateRef.current.grabbedMouseOffsetY =
              e.clientY - boundingClientRect?.top

            const debug = false

            if (debug) {
              console.log('[McDebug][mousedown] left', left)
              console.log('[McDebug][mousedown] top', top)
              console.log('[McDebug][mousedown] right', right)
              console.log('[McDebug][mousedown] bottom', bottom)
              console.log(
                '[McDebug][mousedown] boundingClientRect',
                boundingClientRect
              )
              console.log(
                '[McDebug][mousedown] boundingClientRect?.left',
                boundingClientRect?.left
              )
              console.log(
                '[McDebug][mousedown] boundingClientRect?.top',
                boundingClientRect?.top
              )
              console.log(
                '[McDebug][mousedown] stateRef.current.grabbedMouseOffsetX',
                stateRef.current.grabbedMouseOffsetX
              )
              console.log(
                '[McDebug][mousedown] stateRef.current.grabbedMouseOffsetY',
                stateRef.current.grabbedMouseOffsetY
              )
              console.log(
                '[McDebug][mousedown] stateRef.current.grabbedMouseX',
                stateRef.current.grabbedMouseX
              )
              console.log(
                '[McDebug][mousedown] stateRef.current.grabbedMouseY',
                stateRef.current.grabbedMouseY
              )
            }
          })
        }
      })
    }, 2000)

    const onMouseMove = e => {
      const currentEl = window.MDT.grabbedEl

      const condition =
        currentEl &&
        (typeof stateRef?.current.grabbedLeft === 'number' ||
          typeof stateRef?.current.grabbedRight === 'number') &&
        (typeof stateRef?.current.grabbedTop === 'number' ||
          typeof stateRef?.current.grabbedBottom === 'number')

      // console.log('[McDev][debug] mousemove currentEl', currentEl)
      // console.log('[McDev][debug] condition', condition)

      if (condition) {
        // get difference between current mouse position and original mouse position

        const x = e.clientX - stateRef.current.grabbedMouseX
        const y = e.clientY - stateRef.current.grabbedMouseY

        // add or substract difference to current left and top
        // set new left and top

        const left = stateRef.current.grabbedLeft
        const top = stateRef.current.grabbedTop
        const right = stateRef.current.grabbedRight
        const bottom = stateRef.current.grabbedBottom

        // create new left and new top accounting for new mouse position and original mouse offset from origin

        const newLeft = left + x
        const newTop = top + y
        const newRight = right - x
        const newBottom = top - y

        const debug = true

        if (debug) {
          console.log(
            '[McDebug][onMouseMove] stateRef.current.grabbedMouseX',
            stateRef.current.grabbedMouseX
          )
          console.log(
            '[McDebug][onMouseMove] stateRef.current.grabbedMouseY',
            stateRef.current.grabbedMouseY
          )
          console.log('[McDebug][onMouseMove] e.clientX', e.clientX)
          console.log('[McDebug][onMouseMove] e.clientY', e.clientY)
          console.log('[McDebug][onMouseMove] x', x)
          console.log('[McDebug][onMouseMove] y', y)
          console.log('[McDebug][onMouseMove] left', left)
          console.log('[McDebug][onMouseMove] top', top)
          console.log('[McDebug][onMouseMove] newLeft', newLeft)
          console.log('[McDebug][onMouseMove] newTop', newTop)
          console.log('[McDebug][onMouseMove] newRight', newRight)
          console.log('[McDebug][onMouseMove] newBottom', newBottom)
        }

        // set new left and top

        // only set values that the element has as classes

        const className = currentEl?.className

        if (className?.includes?.(' left-') || className?.startsWith('left-')) {
          currentEl.style.left = newLeft + 'px'
        }

        if (
          className?.includes?.(' right-') ||
          className?.startsWith('right-')
        ) {
          currentEl.style.right = newRight + 'px'
        }

        if (className?.includes?.(' top-') || className?.startsWith('top-')) {
          currentEl.style.top = newTop + 'px'
        }

        if (
          className?.includes?.(' bottom-') ||
          className?.startsWith('bottom-')
        ) {
          currentEl.style.bottom = newBottom + 'px'
        }

        stateRef.current.currentGrabbedLeft = newLeft
        stateRef.current.currentGrabbedTop = newTop
        stateRef.current.currentGrabbedRight = newRight
        stateRef.current.currentGrabbedBottom = newBottom
      }
    }

    const onMouseUp = e => {
      const currentEl = window.MDT.grabbedEl

      if (currentEl) {
        const newTop = Number(
          currentEl?.style?.top?.replace?.('px', '')?.replace?.('%', '')
        )
        const newLeft = Number(
          currentEl?.style?.left?.replace?.('px', '')?.replace?.('%', '')
        )
        const newBottom = Number(
          currentEl?.style?.bottom?.replace?.('px', '')?.replace?.('%', '')
        )
        const newRight = Number(
          currentEl?.style?.right?.replace?.('px', '')?.replace?.('%', '')
        )

        let string = ''

        const className = currentEl?.className

        const tw = stateRef?.current?.tailwindStyling

        if (className?.includes?.(' left-') || className?.startsWith('left-')) {
          string += tw ? `left-[${newLeft}px] ` : `left: "${newLeft}px",`
        }

        if (
          className?.includes?.(' right-') ||
          className?.startsWith('right-')
        ) {
          string += tw ? `right-[${newRight}px] ` : `right: "${newRight}px",`
        }

        if (className?.includes?.(' top-') || className?.startsWith('top-')) {
          string += tw ? `top-[${newTop}px] ` : `top: "${newTop}px",`
        }

        if (
          className?.includes?.(' bottom-') ||
          className?.startsWith('bottom-')
        ) {
          string += tw
            ? `bottom-[${newBottom}px] `
            : `bottom: "${newBottom}px",`
        }

        try {
          const trimmed = string?.trim()
          if (elScaleRef.current) {
            copyWithNotification(trimmed + ` scale-[${elScaleRef.current}]`)
          } else {
            copyWithNotification(trimmed)
          }
        } catch (err) {
          console.error('Error copying to clipboard', err)
        }
      }
      
      window.MDT.grabbedEl = null
      stateRef.current.grabbedLeft = null
      stateRef.current.grabbedTop = null
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    // listen to scroll events and store scroll position, then restore after page has been reloaded
    const onScroll = e => {
      set('scrollX', window.scrollX)
      set('scrollY', window.scrollY)
    }

    // scroll to saved position on refresh
    let inter = setInterval(() => {
      const newX = stateRef.current?.scrollX || 0
      const newY = stateRef.current?.scrollY || 0
      
      console.log('[McDev][newY]', newY)
      console.log('[McDev][document.body.scrollHeight]', document.body.scrollHeight)
      
      // wait till body height greater than newY
      if (document.body.scrollHeight >= newY) {
        console.log('[McDev][scrollTimeout] Scrolling to', newX, newY)
        setTimeout(() => {
          if (!stateRef.current?.disableScrollRestore) {
            window.scrollTo(newX, newY)
          }
        }, 2000)
        clearInterval(inter)
      }
      
      // the reason we do this is so that if the body height changes between refreshes
      // then the scroll listener will never get set if it's smaller than newY
      setTimeout(() => {
        document.addEventListener('scroll', onScroll)
        clearInterval(inter)
      }, 4000)
      
    }, 500)

    return () => {
      clearInterval(interval)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('scroll', onScroll)
    }
  }, [])

  const [mdtPositionEls, setMdtPositionEls] = React.useState([])
  const mdtPositionElsRef = React.useRef(mdtPositionEls)
  
  const [elScale, setElScale] = React.useState(1)
  
  React.useEffect(() => {
    if (window?.MDT?.lastEl) {
      
      // get the scale from class with format scale-[1.2]
      
      const styleScale = window?.MDT?.lastEl?.style?.transform?.match?.(/scale\((.*?)\)/)
      
      if (styleScale) {
        setElScale(styleScale?.[1])
        return
      }
        
      const elScaleMatch = window?.MDT?.lastEl?.className?.match?.(/scale-\[(.*?)\]/)
      
      if (elScaleMatch) {
        // remove scale from class
        window.MDT.lastEl.className = window.MDT.lastEl.className.replace(/scale-\[(.*?)\]/, '')
        setElScale(elScaleMatch?.[1])
      } else {
        // check if el has scale style
        const scale = window?.MDT?.lastEl?.style?.scale
        if (scale) {
          setElScale(scale)
        }
      }
      
    }
  }, [window?.MDT?.lastEl])
  
  // transform lastEl scale by current value of el scale
  React.useEffect(() => {
    
    if (window?.MDT?.lastEl) {
      console.log('nik elScale', elScale)
      
      // set transform scale style of lastEl to elScale
      window.MDT.lastEl.style.scale = elScale
      elScaleRef.current = elScale
      
    } else {
      elScaleRef.current = undefined
    }
    
  }, [elScale])

  React.useEffect(() => {
    // set up MDTsubscriber
    console.log('[McDev] Setting up MDTsubscriber', window?.MDTsubscriber)
    window?.MDTsubscriber?.(Math.random())

    const interval = setInterval(() => {
      const mdtPositionEls = document.querySelectorAll('.mdt-position')
      if (mdtPositionEls?.length !== mdtPositionElsRef?.current?.length) {
        setMdtPositionEls(mdtPositionEls)
        mdtPositionElsRef.current = mdtPositionEls
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const [imgLoading, setImgLoading] = React.useState(false)

  const exportScreens = async (id = 'show-all-whens') => {
    const el = document.getElementsByClassName(id)?.[0]

    if (el) {
      document.body.style.zoom = '100%'
      window.Image = window?.ImageOG
      
      
      // find the widest instance of .preview-bank
      let max = 0
      const widest = Array.from(document.querySelectorAll('.preview-bank'))?.reduce(
        (acc, el) => {
          const width = el?.scrollWidth
          if (width > max) {
            max = width
            return el
          }
          return acc
        },
        null
      )
      
      console.log('nik widest', widest)
      let width = state?.__orientation === 'horizontal' ? 1920 : 1080

      if (id === 'selfie') {
        width = el?.scrollWidth
      }
      
      if (widest) {
        width = widest?.scrollWidth
      }
      
      console.log('nik width', width)
      width = 1000

      setImgLoading(true)

      domtoimage
        .toPng(el, {
          width
        })
        .then(png => {
          setImgLoading(false)

          const link = document.createElement('a')
          const whereString =
            state?.__where === 'FrontCounter'
              ? state?.__where +
                (state?.__foodcourt ? ' -Foodcourt' : '') +
                (state?.__inspiration ? ' -Inspiration' : '')
              : state?.__where

          const dayOfWeek = new Date().toLocaleString('en-us', {
            weekday: 'long'
          })

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
            ?.replace('_', '-')

          const random4letters = Math.random().toString(36).substring(2, 6)

          link.download = `McDev-${time}-${dayOfWeek}-${whereString}-${state?.__orientation}-${random4letters}.png`
          link.href = png
          link.click()
        })
        .catch(err => {
          setImgLoading(false)
          console.error('Error exporting screens', err)
        })
    }
  }
  /* sort keys starting with __ to the top but also alphabetically */
  const sortedState = Object.entries(state || {})
    ?.sort(([key1, value1], [key2, value2]) => {
      if (key1?.startsWith('__') && !key2?.startsWith('__')) {
        return -1
      } else if (!key1?.startsWith('__') && key2?.startsWith('__')) {
        return 1
      } else {
        return key1?.localeCompare?.(key2)
      }
    })
    
  const stateInput = ({ key, value, note }) => {
    
    let input = null

    const baseInput = (
      <Input
        color='black'
        padding={8}
        fontFamily='speedee'
        outline='none'
        borderRadius='8'
        value={String(value)}
        onChange={e => {
          const val = e.target.value

          if (val == Number(val)) {
            if (val?.[val?.length - 1] === '.') {
              set(key, val)
            } else {
              set(key, Number(val))
            }
          } else {
            set(key, val)
          }
        }}
      />
    )

    if (typeof value === 'boolean') {
      input = (
        <>
          <Box
            w='auto'
            cursor='pointer'
            padding={8}
            bg='white'
            fontFamily='speedee'
            borderRadius={8}
            color='black'
            onClick={() => set(key, !value)}
          >
            {value ? '✅' : '❌'}
          </Box>
          {/* <Switch as="div" size="lg" isChecked={value} /> */}
        </>
      )
      // input = <Button onClick={() => set(key, !value)}>{value ? 'true' : 'false'}</Button>
    } else if (typeof value === 'number') {
      input = (
        <Flex w='auto' flexDir='row'>
          {baseInput}
          <Grid ml={2} gap={3}>
            <GridItem
              bg='white'
              borderRadius='4'
              textAlign='center'
            >
              <Flex
                alignItems='center'
                justifyContent='center'
                cursor='pointer'
                color='black'
                fontSize='18px'
                px={8}
                onClick={() => {
                  const increment = lowStepKeys?.includes(key)
                    ? lowerStep
                    : 1
                  set(key, value + increment)
                }}
              >
                +
              </Flex>
            </GridItem>
            <GridItem
              bg='white'
              borderRadius='4'
              textAlign='center'
            >
              <Flex
                alignItems='center'
                justifyContent='center'
                cursor='pointer'
                color='black'
                fontSize='18px'
                px={8}
                onClick={() => {
                  const increment = lowStepKeys?.includes(key)
                    ? lowerStep
                    : 1
                  set(key, value - increment)
                }}
              >
                -
              </Flex>
            </GridItem>
          </Grid>
        </Flex>
      )
    } else if (key === '__orientation') {
      input = (
        <Flex w='auto' flexDir='row'>
          {baseInput}
          <Grid ml={4} gap={3}>
            <GridItem
              bg='white'
              borderRadius='4'
              textAlign='center'
            >
              <Flex
                alignItems='center'
                justifyContent='center'
                cursor='pointer'
                color='black'
                fontSize='20px'
                p={8}
                width='100%'
                height='100%'
                onClick={() => {
                  if (value === 'horizontal') {
                    set(key, 'vertical')
                  } else {
                    set(key, 'horizontal')
                  }
                }}
              >
                <img
                  width='24px'
                  src='https://emoji.aranja.com/static/emoji-data/img-apple-160/1f501.png'
                />
              </Flex>
            </GridItem>
          </Grid>
        </Flex>
      )
    } else {
      input = <Flex>{baseInput}</Flex>
    }

    return (
      <Box
        mb={6}
        display='flex'
        flexGrow={0}
        flexShrink={1}
        flexDirection='column'
      >
        <Flex
          flexDir='row'
          w='auto'
          flexShrink={0}
          position='relative'
          fontSize='16px'
          fontWeight='400'
          my={8}
        >
          {key} {note}
          <Box
            ml={4}
            cursor='pointer'
            fontSize='10px'
            onClick={() => deleteKey(key)}
          >
            🗑️
          </Box>
          {typeof value === 'undefined' && (
            <Box
              ml={12}
              cursor='pointer'
              fontSize='10px'
              onClick={() => set(key, !value)}
            >
              🌗
            </Box>
          )}
        </Flex>
        <Flex w='auto' flexShrink={0}>
          {input}
        </Flex>
      </Box>
    )
  }
  
  const groups = {
    'Region': ['__country'],
    'Orientation': [
      '__allOrientations', 
      '__horizontal', 
      '__vertical',
    ],
    'Whens': [
      '__time', 
      '__allWhens', 
      '__showAllWhens', 
      '__Breakfast', 
      '__MTea', 
      '__Lunch', 
      '__ATea', 
      '__Dinner', 
      '__LateNight', 
      '__Overnight',
      '__NotBreakfast'
    ],
    'Screens': [
      '__screen_no',
      '__no_of_screens',
      '__startingScreen',
      '__screenRange',
      '__minScreens',
      '__maxScreens',
    ],
    'Creme Brulle': [
      '__35221',
      '__35222',
      '__35223',
    ],
    'Big Breakfast Deal': [
      '__big-breakfast-deal',
      '__10032'
    ],
    'Surprise Fries': [
      '__surprise-fries'
    ],
    'McCrispy': [
      '__20562',
      '__20578'
    ],
    'Easter / HCB': [
      {
        key: '__35205',
        note: 'HCB With Cadbury Choc Chips with butter'
      },
      {
        key: '__7701',
        note: 'Fruit HCB with butter'
      }
    ],
    'Kerwin 🍔': [
      '__20606', 
      '__20607', 
      '__40259'
    ],
    'Crash 🦊': [
      { key: '__happymeal-crash-bandicoot', note: 'Crash Bandicoot Happy Meal' }
    ],
    '$12 Nugs': [
      '__twelve-dollar-nuggets',
      { key: '__5079', note: '20pc Chicken McNuggets for $12' }
    ],
    'POP 🎈💢': [
      { key: '__mcpops-trial', note: 'McPops Trial' },
      { key: '__35228', note: 'Berry'},
      { key: '__35229', note: 'Chocolate'},
      { key: '__35227', note: 'Cookiebutter'}
    ],
    'Merch LCM 💰🪙': [
      '__merch-LCM-trial-subtle', 
      '__merch-LCM-trial-vic', 
      '__merch-LCM-trial-thornleigh',
      { key: '', note: 'Applicable new RFMs/trials'},
      { key: '__10031', note: '2x Hash Browns Deal'},
      { key: '__8574', note: 'LCM Soft Serve Cone with Flake'},
      { key: '__5026', note: 'LCM 24pc Chicken McNuggets'},
      { key: '__5738', note: 'LCM Oreo McFlurry'},
      { key: '__30001', note: 'LCM Hot Fudge Sundae Sml'},
      { key: '', note: 'Vanilla & Choc Soft RFMs:'},
      { key: '__40065', note: 'Vanilla Soft Serve for Small Sundae'},
      { key: '__40066', note: 'Chocolate Soft Serve Small Sundae'},
      { key: '__40068', note: 'Vanilla oft Serve for Large Sundae'},
      { key: '__40069', note: 'Chocolate Soft Serve Large Sundae'},
      { key: '__40070', note: 'Vanilla Soft Serve for McFlurry'},
      { key: '__40071', note: 'Chocolate Soft Serve McFlurry'},
      { key: '__40072', note: 'Vanilla Soft Serve for Cone'},
      { key: '__40073', note: 'Chocolate Soft Serve for Cone'}
    ],
  }
  
  // template
  return (
    <>
      <Global
        styles={{
          body: {
            paddingBottom: '50vh !important'
          },
          '.debug-speech-bubble': {
            opacity: state?.showDebugPill ? 1 : 0,
          },
          'h2': {
            '&.text-shadow-router': {
              opacity: state?.screenNames ? 1 : 0.35,
            }
          },
          '.figma-preview': {
            opacity:
              state?.figmaPreview == 0 || state?.figmaPreview
                ? state?.figmaPreview
                : 1,
            pointerEvents: 'none !important',
            zIndex: 1000
            // zIndex: state?.figmaTop ? 999999 : 0,
          },
          '.content-preview': {
            opacity:
              state?.contentPreview == 0 || state?.contentPreview
                ? state?.contentPreview
                : 1
          },
          '.no-cursor': {
            pointerEvents: 'none'
          },
          '#root *': {
            ...(state?.mdtPosition &&
              mdtPositionEls?.length && {
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
          }
        }}
      ></Global>

      <Flex
        opacity={state?.copied ? 1 : 0}
        transition={
          !state?.copied ? 'opacity 1200ms ease' : 'opacity 50ms ease'
        }
        position='fixed'
        top={'1vw'}
        flexDir='column'
        right={'1vw'}
        bg='#DD2514'
        padding={24}
        border={`4px solid #FFCD27`}
        borderRadius='12px'
        color='white'
        fontSize={'24px'}
      >
        <Flex>
          Copied to Clipboard
          <Box ml={18}>📎</Box>
        </Flex>
        {state?.copiedText && (
          <Box mt={12} fontSize={'16px'} fontFamily='speedee' color='white'>
            {state?.copiedText}
          </Box>
        )}
      </Flex>

      <Box
        maxHeight='90vh'
        overflow='scroll'
        cursor={!state?.open ? 'pointer' : 'auto'}
        onClick={() => {
          if (!state?.open) {
            set('open', true)
          }
        }}
        display={state?.iframeMode ? 'none' : 'block'}
      >
        <Box
          zIndex={9999999}
          sx={{
            '*': {
              'line-height': '100% !important'
            }
          }}
          position='fixed'
          display='flex'
          flexDir='column'
          className='mdt-self-position'
          style={{
            bottom:
              (typeof state?.windowTop === 'number' ? state?.windowTop : 5) +
              '%',
            right:
              (typeof state?.windowRight === 'number'
                ? state?.windowRight
                : 5) + '%'
          }}
          // width={
          //   state?.hideIframes && state?.hideData ? "auto" :
          //     state?.open ? state?.fixedWidth : "auto"
          // }
          padding={16}
          color='white'
          maxH='84vh'
          borderRadius='16px'
          bg='#DD2514'
          transform={`scale(${scale})`}
          transformOrigin='bottom right'
        >
          {!state?.open && <Box width='60px' height='56px'></Box>}

          <Box
            title='Open/Close McDev'
            cursor='pointer'
            onClick={() => set('open', !state?.open)}
            position='absolute'
            top={-22}
            right={22}
            maxWidth='48px'
          >
            <img
              lazy
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png'
            ></img>
          </Box>
          <Flex
            alignItems='center'
            flexDir='row'
            display={state?.open ? 'flex' : 'none'}
          >
            <Box fontSize='36px' pb={8}>
              McDev
            </Box>
            <Box fontSize={24} px={18} mt={-5}>
              🍔
            </Box>
            <Flex alignItems='center' fontSize='36px' pb={8}>
              {pageTitle?.split(splitChar)?.[0]}
              <Box px={12} fontSize={24} mt={-2}>
                🍟
              </Box>
              {pageTitle?.split(splitChar)?.[1]}
            </Flex>
            <Flex alignItems='center' fontSize='36px' pb={8}>
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
          
          <Box id="mdt-logs" fontSize='24px' my={12} display={state?.open ? 'block' : 'none'}>
          </Box>

          {/* This will render all state and allow all values to be editable with special interactions for certain state values/types depending on schema */}
          <Box
            display={state?.open && !state?.hideData ? 'block' : 'none'}
            maxH={state?.varsMaxH}
            w={'auto'}
            overflowY='scroll'
          >
            {
              Object.entries(groups || {})
              ?.sort(([key1, value1], [key2, value2]) => {
                // sort with pinned first
                if (state?.[key1] && !state?.[key2]) {
                  return -1
                } else if (!state?.[key1] && state?.[key2]) {
                  return 1
                } else {
                  // return key1?.localeCompare?.(key2)
                }
              })
                ?.map(([groupName, keys]) => {
                return (
                  <Box>
                    <Box my={12} mt={48}>
                      <Box fontSize='36px' display="inline-block"  position="relative">
                        {groupName}
                        <Box
                          position="absolute"
                          transform="translate(100%, -50%)"
                          right={0}
                          cursor="pointer"
                          top={0}
                          title="Sticky Group"
                          fontSize={"26px"}
                          opacity={state?.[groupName] ? 1 : 0.5}
                          onClick={() => {
                            // pin group on click
                            set(groupName, !state?.[groupName])
                          }}
                        >
                          💛
                        </Box>
                      </Box>
                    </Box>
                    {/* <Flex width="100%" flexShrink={1} maxWidth={"700px"} flexWrap="wrap"> */}
                      {
                        keys?.map(keyObj => {
                          
                          const key = typeof keyObj === 'string' ? keyObj : keyObj?.key
                          
                          return stateInput({ key, value: state?.[key], note: keyObj?.note })
                        })
                      }
                    {/* </Flex> */}
                  </Box>
                )
              })
            }
            
            <Box fontSize='36px' my={12} mt={48}>
              All
            </Box>
            {
              sortedState?.map(([key, value]) => {
                
                return stateInput({ key, value })
                
              })
            }
          </Box>

          {!state?.iframeMode && !state?.killIframes && (
            <Box
              maxH={state?.previewsMaxH}
              overflowY='scroll'
              className='selfie'
              display={state?.open && !state?.hideIframes ? 'block' : 'none'}
            >
              {allPreviews?.map(nScreens => {
                const screenCount = nScreens?.[0]?.__no_of_screens

                const uid = `show${screenCount}`

                return (
                  <Box key={uid} my={32}>
                    <Text
                      display={state?.screenshotMode ? 'none' : 'block'}
                      cursor='pointer'
                      fontSize='32px'
                      onClick={() => {
                        if (!state?.[uid]) {
                          set([uid, uid + 'disp'], true)
                        } else {
                          set(uid + 'disp', !state?.[uid + 'disp'])
                        }
                      }}
                      title={`
                      Hide or Show Bank of ${screenCount} Screens
                    `}
                    >
                      {screenCount} Screens
                    </Text>
                    {state?.[uid] &&
                      nScreens.map(bank => {
                        const orientation = bank.__orientation

                        const width = orientation === 'horizontal' ? 1920 : 1080
                        const height =
                          orientation === 'horizontal' ? 1080 : 1920

                        const uid2 = `show${screenCount}${orientation}`

                        const mappable = Array(bank?.__no_of_screens).fill()

                        return (
                          <Box
                            key={uid2}
                            display={state?.[uid + 'disp'] ? 'block' : 'none'}
                            my={24}
                          >
                            <Flex
                              cursor='pointer'
                              flexDir='row'
                              alignItems='center'
                            >
                              <Text
                                display={
                                  state?.screenshotMode &&
                                  !state?.[uid2 + 'disp']
                                    ? 'none'
                                    : 'block'
                                }
                                onClick={() => {
                                  if (!state?.[uid2]) {
                                    set([uid2, uid2 + 'disp'], true)
                                  } else {
                                    set(uid2 + 'disp', !state?.[uid2 + 'disp'])
                                  }
                                }}
                                mr={5}
                                fontSize='24px'
                                textTransform='capitalize'
                                title={`
                            Hide or Show ${screenCount} ${orientation} Screens
                          `}
                              >
                                {/* Horizontal or Vertical */}
                                {screenCount} {orientation}
                              </Text>

                              {/* map using number of screens hack with array */}
                              {mappable.map((_, fakei) => {
                                // if dt_mode true then make i go from length to 1
                                if (state?.dt_mode) {
                                  fakei = mappable?.length - fakei - 1
                                }

                                const i = fakei + 1

                                return (
                                  <Box
                                    display={
                                      state?.screenshotMode &&
                                      !state?.[uid2 + 'disp']
                                        ? 'none'
                                        : 'block'
                                    }
                                    mt={-5}
                                    ml={2}
                                    title={'Toggle Visibility of Screen ' + i}
                                    width={width / 100 + 'px'}
                                    height={height / 100 + 'px'}
                                    onClick={() => {
                                      const newVal =
                                        state?.[uid2 + 'disp' + i] !== false
                                          ? false
                                          : true
                                      set(uid2 + 'disp' + i, newVal)
                                    }}
                                    cursor='pointer'
                                    transition='all 300ms ease'
                                    _hover={{
                                      opacity: 0.75
                                    }}
                                    opacity={
                                      state?.[uid2 + 'disp' + i] === false
                                        ? 0.5
                                        : 1
                                    }
                                    bg='white'
                                    borderRadius='3'
                                  ></Box>
                                )
                              })}
                            </Flex>

                            <Box
                              display={
                                state?.[uid2 + 'disp'] ? 'block' : 'none'
                              }
                              py={7}
                              width='100%'
                              overflow='scroll'
                            >
                              <Flex
                                flexDir='row'
                                maxWidth='100%'
                                height='auto'
                                overflow='scroll'
                              >
                                {state?.[uid2] &&
                                  mappable.map((_, fakei) => {
                                    // if dt_mode true then make i go from length to 1
                                    if (state?.dt_mode) {
                                      fakei = mappable?.length - fakei - 1
                                    }

                                    const i = fakei + 1

                                    return (
                                      <>
                                        {!(
                                          state?.[uid2 + 'disp' + i] === false
                                        ) && (
                                          <Box
                                            sx={{
                                              iframe: {
                                                transform: `scale(${
                                                  state?.iframeScale || 0.25
                                                })`
                                              }
                                            }}
                                            key={uid2 + '_' + fakei}
                                            mr={4}
                                            cursor='pointer'
                                          >
                                            <Flex
                                              padding={iframePadding}
                                              alignItems='center'
                                              justifyContent='center'
                                            >
                                              <Box
                                                maxWidth={
                                                  width *
                                                    (state?.iframeScale ||
                                                      0.25) +
                                                  'px'
                                                }
                                                maxHeight={
                                                  height *
                                                    (state?.iframeScale ||
                                                      0.25) +
                                                  'px'
                                                }
                                                position='relative'
                                                overflow='hidden'
                                                bg='white'
                                              >
                                                <Flex
                                                  position='absolute'
                                                  top='0'
                                                  left='0'
                                                  width='100%'
                                                  height='100%'
                                                  alignItems='center'
                                                  justifyContent='center'
                                                >
                                                  <img
                                                    width='160px'
                                                    src={
                                                      window?.MDT?.baseUrl +
                                                      'McLoading4.gif'
                                                    }
                                                  ></img>
                                                </Flex>
                                                {getCachedIframe(
                                                  screenCount,
                                                  orientation,
                                                  i,
                                                  width,
                                                  height
                                                )}
                                              </Box>
                                            </Flex>
                                            <Flex
                                              display={
                                                state?.screenshotMode
                                                  ? 'none'
                                                  : 'flex'
                                              }
                                              flexDir='row'
                                              gap={8}
                                              py={10}
                                            >
                                              <Box color='white'>{i}</Box>
                                              <Box
                                                onClick={() => {
                                                  if (
                                                    !(
                                                      i ===
                                                        state?.__screen_no &&
                                                      orientation ===
                                                        state?.__orientation &&
                                                      screenCount ===
                                                        state?.__no_of_screens
                                                    )
                                                  ) {
                                                    setState(state => {
                                                      return {
                                                        ...state,
                                                        __no_of_screens:
                                                          screenCount,
                                                        __screen_no: i,
                                                        __orientation:
                                                          orientation
                                                      }
                                                    }, 6)
                                                  }
                                                }}
                                                title={
                                                  i === state?.__screen_no &&
                                                  orientation ===
                                                    state?.__orientation &&
                                                  screenCount ===
                                                    state?.__no_of_screens
                                                    ? 'Selected Screen'
                                                    : 'Select Screen'
                                                }
                                              >
                                                {i === state?.__screen_no &&
                                                orientation ===
                                                  state?.__orientation &&
                                                screenCount ===
                                                  state?.__no_of_screens
                                                  ? '🌈🦄✨🍔🍟'
                                                  : '👀'}
                                              </Box>
                                              <Box
                                                onClick={() => {
                                                  set('copied', true)

                                                  const url =
                                                    'localhost:8080' +
                                                    createUrlFromState({
                                                      ...state,
                                                      debug: true,
                                                      __no_of_screens:
                                                        screenCount,
                                                      __screen_no: i,
                                                      __orientation: orientation
                                                    })

                                                  const type = 'text/plain'
                                                  const blob = new Blob([url], {
                                                    type
                                                  })
                                                  const data = [
                                                    new ClipboardItem({
                                                      [type]: blob
                                                    })
                                                  ]
                                                  copyWithNotification(data)
                                                }}
                                                title='Copy Screen URL to Clipboard'
                                              >
                                                📎
                                              </Box>
                                            </Flex>
                                          </Box>
                                        )}
                                      </>
                                    )
                                  })}
                              </Flex>
                            </Box>
                          </Box>
                        )
                      })}
                  </Box>
                )
              })}
            </Box>
          )}

          <Flex
            userSelect='none'
            ml='auto'
            marginTop='12'
            flexDir='row'
            alignItems='center'
            cursor='pointer'
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
            {/* Where Selection Dropdown */}
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
                onChange={e => {
                  const newVal = e.target.value
                  set(['where', '__where'], newVal)
                }}
                value={state?.where}
              >
                {wheres.map(val => {
                  return <option key={val}>{val}</option>
                })}
              </select>
            </Box>

            {/* When Selection Dropdown */}
            <Box mr={16}>
              <select
                style={{
                  outline: 'none !important',
                  border: 'none !important',
                  borderRadius: '8px',
                  color: 'black',
                  padding: '6px'
                }}
                onChange={e => {
                  const newVal = e.target.value
                  set(['when', '__when'], newVal)
                  set(`__${newVal}`, true)
                  
                  // unset all other whens
                  // '__allWhens', 
                  // '__Breakfast', 
                  // '__MTea', 
                  // '__Lunch', 
                  // '__ATea', 
                  // '__Dinner', 
                  // '__LateNight', 
                  // '__Overnight',
                  // '__NotBreakfast'
                  
                  const filteredWhens = whens.filter(val => val !== newVal)?.map(val => '__' + val)
                  set(['__allWhens', ...filteredWhens], false)

                  
                }}
                value={state?.when}
              >
                {whens.map(val => {
                  return <option key={val}>{val}</option>
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
                onChange={e => {
                  const val = e.target.value

                  const [screenCount, orientation, i] = val.split('_')

                  if (
                    !(
                      i === state?.__screen_no &&
                      orientation === state?.__orientation &&
                      screenCount === state?.__no_of_screens
                    )
                  ) {
                    setState(state => {
                      return {
                        ...state,
                        __no_of_screens: screenCount,
                        __startingScreen: 1,
                        __screenRange: screenCount,
                        __maxScreens: 6,
                        __minScreens: 3,
                        __screen_no: i,
                        __orientation: orientation
                      }
                    }, 6)
                  }
                }}
              >
                {/* Flatten allPreviews into options of number of screens + screen # for that bank */}
                {allPreviews?.map(nScreens => {
                  const screenCount = nScreens?.[0]?.__no_of_screens

                  const uid = `show${screenCount}`

                  return (
                    <optgroup label={screenCount + ' Screens'}>
                      {nScreens.map(bank => {
                        const orientation = bank.__orientation

                        const uid2 = `${screenCount}_${orientation}`

                        const mappable = Array(bank?.__no_of_screens).fill()

                        return mappable.map((_, fakei) => {
                          // if dt_mode true then make i go from length to 1
                          // if (state?.dt_mode) {
                          //   fakei = (mappable?.length - fakei - 1)
                          // }

                          const i = fakei + 1

                          return (
                            <option value={uid2 + '_' + i}>
                              {screenCount} {orientation} {i}
                            </option>
                          )
                        })
                      })}
                    </optgroup>
                  )
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
                value={`${state?.__screen_no}`}
                onChange={e => {
                  const i = e.target.value

                  if (
                    !(
                      i === state?.__screen_no
                    )
                  ) {
                    setState(state => {
                      return {
                        ...state,
                        __screen_no: i,
                        __startingScreen: i,
                        __screenRange: 1,
                        __minScreens: i,
                        __maxScreens: i
                      }
                    }, 6)
                  }
                }}
              >
                {/* loop from 1 to no_of_screens to select screen */}
                
                {Array.from({ length: state?.__no_of_screens }, (_, i) => {
                  i = i + 1
                  return (
                    <option value={i}>
                      Screen {i}
                    </option>
                  )
                })}
              </select>
            </Box>
            
            {/* Toggle visibility of debug pull */}
            
            <Box
              mr={32}
              opacity={state?.showDebugPill ? 1 : 0.45}
              onClick={() => {
                set('showDebugPill', !state?.showDebugPill)
              }}
              title='Toggle Debug Pill'
            >
              🪲
            </Box>
            
            {/* Toggle showing of all when's */}
            <Box
              ml={24}
              mr={32}
              opacity={state?.showAllWhens ? 1 : 0.45}
              onClick={() => {
                set('showAllWhens', !state?.showAllWhens)
              }}
              title="Toggle Showing of All Time's for this Location"
            >
              ⏰
            </Box>

            {/* Toggle drag and drop position */}
            <Box
              mr={32}
              opacity={state?.mdtPosition ? 1 : 0.45}
              onClick={() => {
                set('mdtPosition', !state?.mdtPosition)
              }}
              title='Toggle Drag and Drop Position'
            >
              ✊
            </Box>

            {/* Flip between __orientation = 'horizontal' and 'vertical' */}
            <Box
              mr={32}
              transform={`rotate(${
                state?.__orientation === 'horizontal' ? 90 : 0
              }deg)`}
              onClick={() => {
                const curOrientation = state?.__orientation
                const newOrientation =
                  curOrientation === 'horizontal' ? 'vertical' : 'horizontal'
                set('__orientation', newOrientation)
              }}
              title='Toggle Orientation'
            >
              📱
            </Box>

            <Box
              mr={32}
              opacity={state?.__foodcourt ? 1 : 0.45}
              onClick={() => {
                set('__foodcourt', !state?.__foodcourt)
              }}
              title='Toggle Foodcourt Mode'
            >
              🍽️
            </Box>

            <Box
              mr={32}
              opacity={state?.__inspiration ? 1 : 0.45}
              onClick={() => {
                const newVal = !state?.__inspiration
                set('__inspiration', newVal)
                
                // set drive thru mode to false because it breaks inspiration view
                if (newVal) {
                  set('dt_mode', false)
                }
                
              }}
              title='Toggle Inspiration Mode'
            >
              🙏
            </Box>

            <Box
              mr={32}
              opacity={state?.tailwindStyling ? 1 : 0.45}
              onClick={() => {
                set('tailwindStyling', !state?.tailwindStyling)
              }}
              title='Toggle Tailwind Position Syntax'
            >
              🐒💨
            </Box>

            <Box
              mr={32}
              onClick={() => {
                set('dt_mode', !state?.dt_mode)
              }}
              title='Toggle Drive Thru Mode (Reverse Order of Screens)'
              opacity={state?.dt_mode ? 1 : 0.45}
            >
              🚘
            </Box>
            
            <Box mr={32} title='Toggle Figma Previews'>
              <Box
                opacity={state?.figmaPreview ? 1 : 0.45}
                onClick={() => {
                  set('figmaPreview', state?.figmaPreview ? 0 : 0.3)
                }}
              >
                🥷
              </Box>
            </Box>

            {/* Slider for figma preview opacity */}
            <Box
              mr={32}
              position='relative'
              w='100px'
              title='Adjust Figma Previews'
            >
              <Slider
                aria-label='slider-ex-1'
                defaultValue={state?.figmaPreview * 100}
                onChange={val => {
                  set('figmaPreview', val / 100)
                }}
              >
                <SliderTrack h='5px' bg='white'>
                  <SliderFilledTrack h='100%' bg='rgba(0,0,0,0.3)' />
                </SliderTrack>
                <SliderThumb>
                  <Box
                    bg='white'
                    mt={-7}
                    h='15px'
                    w='15px'
                    borderRadius='9999px'
                  />
                </SliderThumb>
              </Slider>
            </Box>
            
            {/* Slider for current El scale */}
            <Box
              mr={32}
              position='relative'
              w='100px'
              title='Adjust Figma Previews'
            >
              <Slider
                aria-label='slider-ex-2'
                defaultValue={elScale * 100}
                onChange={val => {
                  setElScale(val / 100)
                }}
                // max value 300
                max={300}
              >
                <SliderTrack h='5px' bg='white'>
                  <SliderFilledTrack h='100%' bg='rgba(0,0,0,0.3)' />
                </SliderTrack>
                <SliderThumb>
                  <Box
                    bg='white'
                    mt={-7}
                    h='15px'
                    w='15px'
                    borderRadius='9999px'
                  />
                </SliderThumb>
              </Slider>
            </Box>
            <Box mr={32} title='Toggle Figma Previews'>
              <Box
                onClick={() => {
                  // copy value to clipboard
                  try {
                    copyWithNotification(`scale-[${elScale}]`)
                  } catch (err) {
                    console.error('Error copying elScale to clipboard', err)
                  }
                }}
              >
                🎁
              </Box>
            </Box>
            
            <Box mr={32} title='Toggle Screen Names'>
              <Box
                opacity={state?.screenNames ? 1 : 0.45}
                onClick={() => {
                  set('screenNames', state?.screenNames ? 0 : 0.3)
                }}
              >
                🪧
              </Box>
            </Box>

            <Box mr={32} title='Hide All iFrames'>
              <Box
                opacity={!state?.hideIframes ? 1 : 0.45}
                onClick={() => {
                  if (state?.killIframes) {
                    set(
                      ['hideIframes', 'killIframes'],
                      [!state?.hideIframes, !state?.hideIframes]
                    )
                  } else {
                    set('hideIframes', !state?.hideIframes)
                  }
                }}
              >
                👀
              </Box>
            </Box>

            <Box mr={32} title='Unload/Kill All iFrames'>
              <Box
                opacity={!state?.killIframes ? 1 : 0.45}
                onClick={() => {
                  set(['hideIframes', 'killIframes'], !state?.killIframes)
                }}
              >
                ☠️
              </Box>
            </Box>

            <Box mr={32} title='Show Debug State'>
              <Box
                opacity={!state?.hideData ? 1 : 0.45}
                onClick={() => {
                  set('hideData', !state?.hideData)
                }}
              >
                ✏️
              </Box>
            </Box>

            {/* <Box mr={32} title='Enter Screenshot Mode for iFrames'>
              <Box
                opacity={state?.screenshotMode ? 1 : 0.45}
                onClick={() => {
                  set('screenshotMode', !state?.screenshotMode)
                }}
              >
                🎥
              </Box>
            </Box>

            <Box mr={32} title='Capture the McDev window as a screenshot'>
              <Box
                onClick={() => {
                  exportScreens('selfie')
                }}
              >
                🤳
              </Box>
            </Box>

            <Box mr={32} title='Save Current Screens to PNG'>
              <Box
                onClick={() => {
                  exportScreens()
                }}
              >
                {imgLoading ? '📸' : '📷'}
              </Box>
            </Box>

            */}
            
            <Flex>
              <Box
                title='Scale Down McDev'
                py={3}
                textAlign='center'
                bg='#FFCD27'
                borderRadius='8px'
                width='80px'
                ml='auto'
                onClick={decreaseScale}
              >
                <Box mt={3} fontSize='28px'>
                  -
                </Box>
              </Box>
              <Box
                title='Scale Up McDev'
                ml={16}
                py={3}
                textAlign='center'
                bg='#FFCD27'
                borderRadius='8px'
                width='80px'
                onClick={increaseScale}
              >
                <Box mt={3} fontSize='28px'>
                  +
                </Box>
              </Box>
            </Flex> 
          </Flex>
        </Box>
      </Box>
    </>
  )
}

const root = ReactDOM.createRoot(document.getElementById('maccas-dev-tools'))

const router = createBrowserRouter([
  { path: '*', element: <App /> }
])

root.render(
  <React.StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </React.StrictMode>
)
