// global configs up here
window.ttLog = true;
window.ttTrace = true;
// window.ttLog = false;
// window.ttTrace = false;

// Settings go here
const modTitle = 'Template';
const modName = modTitle?.toLowerCase()?.replace(' ', '-');
const scriptName = modName + '/index';

const mountId = modName + '-mods-mount';

const mountQuery = () => {
  return document.querySelector('#' + mountId);
};

// default to the funniest picture on the internet, a png !
const modImg = `/${modName}/🦄.png`;

console.log('🦄', modName, 'Injected 🦄');

try {
  window[modName] = window?.[modName] || {};

  const allScripts = document.querySelectorAll('script');

  const injectedScriptSrc = Array.from(allScripts).find((script) => script.src?.includes(scriptName + '.js'));
  const prod = injectedScriptSrc?.src?.includes('jsdelivr');

  if (prod) {
    console.log('🦄', modName, 'prod', '🦄');
    const version = injectedScriptSrc.src.split('@')[1].split('/')[0];
    window[modName].baseUrl = `https://cdn.jsdelivr.net/gh/lopugit/mods@${version}/`;
  } else {
    console.log('🦄', modName, 'dev', '🦄');
    window[modName].baseUrl = 'https://localhost:3993/file?url=';
  }

  (async () => {
    const href = window.location.href;

    if (href?.includes('mods=true') || true) {
      let success = false;

      try {
        // check if div with id of mod mount already exists

        const existingAppStub = mountQuery();

        if (existingAppStub) {
          console.log('🦄', modName, 'already mounted 🦄');
          return;
        }

        const div = document.createElement('div');
        div.id = mountId;
        document.body.appendChild(div);

        const appStub = mountQuery();

        if (appStub) {
          function loadScript(src, type, instant) {
            return new Promise((resolve, reject) => {
              let script = document.createElement('script');

              if (typeof src === 'string') {
                script.src = src;
              } else if (typeof src === 'object') {
                script.innerHTML = src.content;
              }

              script.crossOrigin = true;
              if (type) {
                script.type = type;
              }
              script.onload = () => {
                resolve(script);
              };
              script.onerror = () => reject(new Error(`Script load error for ${src}`));
              document.head.appendChild(script);

              if (instant === true) {
                resolve(script);
              }

              if (typeof instant === 'string') {
                // keep checking for window[instant] to be defined and then resolve

                const interval = setInterval(() => {
                  if (window[instant]) {
                    clearInterval(interval);
                    resolve(script);
                  }
                }, 100);
              }
            });
          }

          // await loadScript("https://unpkg.com/react@17/umd/react.development.js", "text/javascript")

          // await loadScript("https://unpkg.com/react-dom@17/umd/react-dom.development.js", "text/javascript"),

          await loadScript('https://unpkg.com/@babel/standalone/babel.min.js', 'text/javascript');

          await loadScript(
            {
              content: `
          
            import React from "https://esm.sh/react@18?dev";
            window.React = React
            
            import ReactDOM from "https://esm.sh/react-dom@18.2.0/client?dev";
            window.ReactDOM = ReactDOM
            
            import * as ReactRouterDom from 'https://esm.sh/react-router-dom@6.21.1?dev';
            window.ReactRouterDom = ReactRouterDom
            
            import * as useQueryParams from "https://esm.sh/use-query-params@2.2.1";
            window.useQueryParams = useQueryParams
            
            import debounce from "https://esm.sh/debounce@2.0.0";
            window.debounce = debounce
            
            import * as Fuse from "https://esm.sh/fuse.js@6";
            window.Fuse = Fuse?.default
            
            import * as Emotion from 'https://esm.sh/@emotion/react@11.11.3';
            window.Emotion = Emotion          
            
            import * as ChakraUI from 'https://esm.sh/@chakra-ui/react@2.7.1';
            window.ChakraUI = ChakraUI
            
            import domtoimage from 'https://esm.sh/dom-to-image';
            window.domtoimage = domtoimage
            
          `
            },
            'module',
            'ChakraUI'
          );

          await loadScript(window[modName].baseUrl + scriptName + '.jsx', 'text/jsx', true);

          window.Babel.transformScriptTags();
        }
      } catch (err) {
        console.error('Injecting scripts failed', err);
      }
    }
  })();
} catch (err) {
  console.error(`Error in ${scriptName} .js`, err);
}
