
const { 
  Box,
  Flex,
  Input,
  Button,
  Text,
  Stack,
  Link,
  Grid,
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

const {
  createBrowserRouter,
  RouterProvider,
  useLocation
} = ReactRouterDom

const refreshable = [
  '__inspiration',
  '__orientation',
  // match anything that starts with __
  /^__.*/
]

console.log('[McDev] Loaded React App')

var App = (props) => {
  
  const location = useLocation()
  
  const stateString = window.localStorage.getItem('maccas-dev-tools')
  
  const cachedState = React.useMemo(() => {
    return JSON.parse(stateString)
  }, [])
  
  const [state, setState] = React.useState(stateString ? {
    ...cachedState,
    fixedWidth: cachedState?.fixedWidth || "600px",
    fixedHeight: cachedState?.fixedHeight || "600px",
    varsMaxH: cachedState?.varsMaxH || "30vh",
    previewsMaxH: cachedState?.previewsMaxH || "35vh",
  } : {})
  
  const set = (key, value) => {
    
    if (typeof key === 'object') {
      
      const newState = { ...state }
      key?.forEach((key) => {
        newState[key] = value
      }
      )
      setState(newState)
      
    } else {
      setState({ ...state, [key]: value })
    }
    
  }
    
  const deleteKey = (key) => {
    const newState = { ...state }
    delete newState[key]
    setState(newState)
  }
  
  const scale = React.useMemo(() => state.scale || 1, [state])
  
  const scaleChange = 0.25
  
  const increaseScale = React.useCallback(() => {
    const newScale = (Number(scale) + scaleChange) || 1
    set('scale', newScale)
  }, [scale])
  
  const decreaseScale = React.useCallback(() => {
    const newScale = (Number(scale) - scaleChange) || 1
    set('scale', newScale)
  }, [scale])
    
  // update state when location changes
  // map all query params to state
  
  const updateStateFromParams = () => {
    const params = new URLSearchParams(location.search)
    const newState = {}
    
    console.log('nik location.search 3', location.search)
    console.log('nik params 3', params)
    
    for (let [key, value] of params) {
      
      console.log('nik key,value 3', key, value)
      
      if (value == Number(value)) {
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
    
    console.log('nik newState 1', newState)
    console.log('nik newState?.__inspiration 1', newState?.__inspiration)
    
    setState((state) => {
      return { ...state, ...newState }
    })
  }
  
  React.useEffect(() => {
    console.log('nik here 1')
    updateStateFromParams()
  }, [])
  
  const [oldSearch, setOldSearch] = React.useState(location.search)
  
  React.useEffect(() => {
    if (location.search !== oldSearch) {
      setOldSearch(location.search)
      console.log('nik here 2')
      updateStateFromParams()
    }
  }, [location])
  
  const [oldParams, setOldParams] = React.useState(location.search)
  
  const [oldState, setOldState] = React.useState(state)
  
  const refresh = React.useCallback(() => {
    console.log('nik debounced refresh')
    window.location.reload()
  }, [])
  
  const debouncedRefresh = React.useMemo(() => debounce(refresh, 1000), [refresh])
  
  const paramWhitelist = [
    'debug',
    'no_mdt',
    'scale'
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
    
    return "Error"
    
    
  }
  
  
  React.useEffect(() => {
    
    console.log('nik here 3')
    
    console.log('nik state 3', state)
    console.log('nik state?.__inspiration 3', state?.__inspiration)
    
    window.localStorage.setItem('maccas-dev-tools', JSON.stringify(state))
    
    window.MDT.state = state
    
    // update query params when state changes
    
    const newUrl = createUrlFromState(state)
    
    window.history.replaceState({}, '', newUrl)
    
    // check if any refreshable keys have changed
    // if so, refresh the page
    for (let [key, value] of Object.entries(state)) {
      if (refreshable.includes(key) && value !== oldState[key]) {
        console.log('nik refreshing 1', key)
        // debounced refresh
        debouncedRefresh()
      } else if (refreshable?.some((r) => r.test?.(key)) && value !== oldState[key]) {
        console.log('nik refreshing 2', key)
        // debounced refresh
        debouncedRefresh()
      }
    }
    
    setOldState(state)
        
  }, [state])  
  
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
          __orientation,
        })
      }
      ret.push(orientationGroup)
    }
    
    return ret?.reverse()
    
  }, [])
  
  // make sure preview display is in sync with show
  React.useEffect(() => {
    
    const newState = { ...state }
    
    allPreviews?.forEach((nScreens) => {
        
        const screenCount = nScreens?.[0]?.__no_of_screens
        
        const uid = `show${screenCount}`
        
        if (!newState?.[uid] || !newState?.[uid+'disp']) {
          newState[uid] = false
          newState[uid+'disp'] = false
        }
        
        nScreens.forEach((bank) => {
          
          const orientation = bank.__orientation
          
          const uid2 = `show${screenCount}${orientation}`
          
          if (!newState?.[uid2] || !newState?.[uid2+'disp']) {
            newState[uid2] = false
            newState[uid2+'disp'] = false
          }
          
        })
        
      }
    )
    
    setState(newState)
    
  }, [allPreviews])
  
  const iframeRef = React.useRef({})
  
  const getCachedIframe = React.useCallback((screenCount, orientation, i, width, height) => {
    
    const newUrl = createUrlFromState({
      ...state,
      __no_of_screens: screenCount,
      __screen_no: i,
      __orientation: orientation,
      no_mdt: true,
    }, true)
    
    const uid = `iframe${screenCount}${orientation}${i}`
    
    console.log('nik iframe uid is', uid)
    
    console.log('nik iframeRef?.current', iframeRef?.current)

    if (!iframeRef?.current?.[uid]) {
      const newIframe = <iframe 
        src={
          newUrl
        }
        width={width + "px"}
        height={height + "px"}
        style={{ 
          transformOrigin: "0 0",
          transform: `scale(${0.25})`,
          border: 'none',
        }}
      ></iframe>
      
      iframeRef.current[uid] = newIframe
      
      return newIframe
      
    } else {
      console.log('nik using cached iframe with uid', uid)
      
      return iframeRef.current[uid]
      
    }
    
  }, [state, iframeRef])
  
  return (
    <Box
      maxHeight="90vh"
      overflow="scroll"
      cursor={!state?.open ? 'pointer' : 'auto'}
      onClick={() => {
        if (!state?.open) {
          set('open', true)
        }
      }}
    >
      <Box
        zIndex={9999999}
        sx={{
          '*': {
            "line-height": "100% !important",
          },
        }}
        position="fixed"
        display="flex"
        flexDir="column"
        bottom="5%"
        right="5%"
        width={state?.open ? state.fixedWidth : "auto"}
        padding={16}
        color="white"
        borderRadius="16px"
        bg="#DD2514"
        transform={`scale(${scale})`}
        transformOrigin="bottom right"
      >
        
        {!state?.open && (
          <Box width="60px" height="56px">
            
          </Box>
        )}
        

        <Box cursor="pointer" onClick={() => set('open', !state?.open)} position="absolute" top={-22} right={22} maxWidth="48px">
          <img lazy src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png">
            
          </img>
        </Box>
        <Box fontSize="36px" pb={4} display={state?.open ? 'block' : 'none'}>
          McDev
        </Box>
        
        {/* This will render all state and allow all values to be editable with special interactions for certain state values/types depending on schema */}
        <Box display={state?.open ? 'block' : 'none'} maxH={state?.varsMaxH} overflowY="scroll">
          
          {/* sort keys starting with __ to the top but also alphabetically */}
          {
            Object.entries(state)
            ?.sort(([key1, value1], [key2, value2]) => {
              
              if (key1?.startsWith('__') && !key2?.startsWith('__')) {
                return -1
              } else if (!key1?.startsWith('__') && key2?.startsWith('__')) {
                return 1
              } else {
                return key1?.localeCompare?.(key2)
              }
              
            })
            ?.map(([key, value]) => {
            
              let input = null
              
              const baseInput = <Input color="black" padding={8} fontFamily="speedee" outline="none" borderRadius="8" value={String(value)} onChange={(e) => {
                
                const val = e.target.value
                
                if (val == Number(val)) {
                  if (val?.[val?.length-1] === ".") {
                    set(key, val)
                  } else {
                    set(key, Number(val))
                  }
                } else {
                  set(key, val)
                }
                
              }} />

              
              if (typeof value === 'boolean') {
                
                input = (
                  <>
                    <Box w="auto" cursor="pointer" padding={8} bg="white" fontFamily="speedee" borderRadius={8} color="black" onClick={() => set(key, !value)}>{value ? '✅' : '❌'}</Box>
                    {/* <Switch as="div" size="lg" isChecked={value} /> */}
                  </>
                )
                // input = <Button onClick={() => set(key, !value)}>{value ? 'true' : 'false'}</Button>
              } else if (typeof value === 'number') {
                
                input = <Flex w="auto" flexDir="row">
                  {baseInput}
                  <Grid ml={2} gap={3}>
                    <GridItem bg="white" borderRadius="4" textAlign="center">
                      <Flex alignItems="center" justifyContent="center" cursor="pointer" color="black" fontSize="18px" px={8} onClick={() => {
                        const increment = key === 'scale' ? 0.25 : 1
                        set(key, value + increment)
                      }}>+</Flex>
                    </GridItem>
                    <GridItem bg="white" borderRadius="4" textAlign="center">
                      <Flex alignItems="center" justifyContent="center" cursor="pointer" color="black" fontSize="18px" px={8} onClick={() => {
                        const increment = key === 'scale' ? 0.25 : 1
                        set(key, value - increment)
                      }}>-</Flex>
                    </GridItem>
                  </Grid>
                </Flex>
              
              } else if (key === '__orientation') {
                
                input = <Flex w="auto" flexDir="row">
                  {baseInput}
                  <Grid ml={4} gap={3}>
                    <GridItem bg="white" borderRadius="4" textAlign="center">
                      <Flex alignItems="center" justifyContent="center" cursor="pointer" color="black" fontSize="20px" p={8} width="100%" height="100%" onClick={() => {
                        
                        if (value === 'horizontal') {
                          set(key, 'vertical')
                        } else {
                          set(key, 'horizontal')
                        }
                      }}>
                        <img width="24px" src="https://emoji.aranja.com/static/emoji-data/img-apple-160/1f501.png" />
                      </Flex>
                    </GridItem>
                  </Grid>
                </Flex>
                
              } else {
                input = baseInput
              }
              
              return (
                <Box mb={6} display="flex" flexGrow={0} flexShrink={1} flexDirection="column">
                  <Flex flexDir="row" w="auto" flexShrink={0} position="relative" fontSize="16px" fontWeight="400" my={8}>
                    {key}
                    <Box ml={4} cursor="pointer" fontSize="10px" onClick={() => deleteKey(key)}>🗑️</Box>
                  </Flex>
                  <Flex w="auto" flexShrink={0}>
                    
                    {input}
                    
                  </Flex>
                </Box>
              )
              
          }
          
          )}
          
        </Box>
        
        <Box maxH={state?.previewsMaxH} overflowY="scroll" display={state?.open ? 'block' : 'none'}>
          {allPreviews?.map(nScreens => {
            
            console.log('nik nScreens', nScreens)
            
            const screenCount = nScreens?.[0]?.__no_of_screens
            
            const uid = `show${screenCount}`
            
            return <Box key={uid} my={32}>
              <Text cursor="pointer" fontSize="32px" onClick={() => {
                
                if (!state?.[uid]) {
                  set([uid, uid+'disp'], true)
                } else {
                  set(uid+'disp', !state?.[uid+'disp'])
                }
                
            
              }}>
                {(screenCount)} Screens
              </Text>
              {state?.[uid] && nScreens.map((bank) => {
                
                console.log('nik bank', bank)
                
                const orientation = bank.__orientation
                
                const width =  orientation === 'horizontal' ? 1920 : 1080
                const height = orientation === 'horizontal' ? 1080 : 1920
                
                const uid2 = `show${screenCount}${orientation}`
                
                const mappable = Array(bank?.__no_of_screens).fill()
                
                console.log('nik uid2', uid2)
                console.log('nik mappable', mappable)
                
                return <Box key={uid2} display={state?.[uid+'disp'] ? 'block' : 'none'} my={24}>
                  <Flex onClick={() => {
                    
                    console.log('nik !state?.[uid2]', !state?.[uid2], state, uid2)
                    
                    if (!state?.[uid2]) {
                      set([uid2, uid2+'disp'], true)
                    } else {
                      set(uid2+'disp', !state?.[uid2+'disp'])
                    }
                    
                  }} cursor="pointer" flexDir="row" alignItems="center">
                    <Text mr={5} fontSize="24px" textTransform="capitalize">
                      {orientation}
                    </Text>
                    {/* map using number of screens hack with array */}
                    
                    {mappable.map((i) => {
                      return <Box mt={-5} ml={2} width={(width / 100) + "px"} height={(height / 100)+'px'} bg="white" borderRadius="3">
                      </Box>
                    })}
                    
                  </Flex>
                  
                  <Box display={state?.[uid2+'disp'] ? 'block' : 'none'} py={7} width="100%" overflow="scroll">
                    <Flex flexDir="row" maxWidth="100%" height="auto" overflow="scroll">
                      {state?.[uid2] && mappable.map((_, fakei) => {
                        
                        const i = fakei + 1
                        
                        
                        console.log('will return for ret', uid2)
                        
                        return (
                          <Box key={uid2+"_"+fakei} mr={4} cursor="pointer" onClick={() => {
                            
                            setState((state) => {
                              return {
                                ...state, 
                                __no_of_screens: screenCount,
                                __screen_no: i,
                                __orientation: orientation,
                              }
                            })
                            
                          }}>
                            <Flex
                              padding={iframePadding}
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Box
                                maxWidth={(width/4) + "px"}
                                maxHeight={(height/4) + "px"}
                                position="relative"
                                overflow="hidden"
                                bg="white"
                              >
                                <Flex position="absolute" top="0" left="0" width="100%" height="100%" alignItems="center" justifyContent="center" >
                                  <img width="160px" src={window?.MDT?.baseUrl + "McLoading4.gif"}></img>
                                </Flex>
                                {getCachedIframe(screenCount, orientation, i, width, height)}
                              </Box>
                            </Flex>
                            <Box py={10}>
                              {
                                (
                                  i === state?.__screen_no
                                  && orientation === state?.__orientation
                                  && screenCount === state?.__no_of_screens
                                ) ? '🌈🦄✨🍔🍟' : '👀'}
                            </Box>
                          </Box>
                        )
                        
                      })}
                      
                    </Flex>
                  </Box>
                  
                </Box>
                
              })}
            </Box>
            
          })}
        </Box>
          
        <Flex marginTop="auto" display={state?.open ? 'block' : 'none'}>
          <Box width="40px" ml="auto" cursor="pointer" onClick={decreaseScale}>➖</Box>
          <Box width="40px" cursor="pointer" onClick={increaseScale}>➕</Box>
        </Flex>
      </Box>
    </Box>
  )
}

const root = ReactDOM.createRoot(document.getElementById('maccas-dev-tools'));

const router = createBrowserRouter([
  { path: '/', element: <App /> }
])

root.render(
  <React.StrictMode>
    <RouterProvider router={router}>
    </RouterProvider>
  </React.StrictMode>
);