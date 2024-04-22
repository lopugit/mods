try {
  window.MDT = window?.MDT || {};

  const allScripts = document.querySelectorAll('script');

  const injectedScriptSrc = Array.from(allScripts).find((script) => script.src?.includes('maccas.js'));
  const prod = injectedScriptSrc?.src?.includes('jsdelivr');

  if (prod) {
    const version = injectedScriptSrc.src.split('@')[1].split('/')[0];
    MDT.baseUrl = `https://cdn.jsdelivr.net/gh/lopugit/mods@${version}/`;
  } else {
    MDT.baseUrl = 'https://localhost:3993/file?url=';
  }

  (async () => {
    const href = window.location.href;

    if (!href?.includes('mdt=false')) {
      let success = false;

      try {
        // check if div with id maccas-dev-tools already exists

        const existingAppStub = document.getElementById('maccas-dev-tools');

        if (existingAppStub) {
          return;
        }

        const div = document.createElement('div');
        div.id = 'maccas-dev-tools';
        document.body.appendChild(div);

        const appStub = document.getElementById('maccas-dev-tools');

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
          
            import React from "https://esm.sh/react@18";
            window.React = React
            
            import ReactDOM from "https://esm.sh/react-dom@18.2.0/client";
            window.ReactDOM = ReactDOM
            
            import * as ReactRouterDom from 'https://esm.sh/react-router-dom@6.21.1';
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
            
            import { Resizable } from 'https://esm.sh/react-resizable@3.0.5';
            window.Resizable = Resizable
            
            import Draggable from 'https://esm.sh/react-draggable@4.4.6';
            window.Draggable = Draggable
            
            import domtoimage from 'https://esm.sh/dom-to-image';
            window.domtoimage = domtoimage
            
          `
            },
            'module',
            'ChakraUI'
          );

          await loadScript(MDT.baseUrl + 'maccas.jsx', 'text/jsx', true);

          window.Babel.transformScriptTags();
        }
      } catch (err) {
        console.error('Injecting scripts failed', err);
      }
    }
  })();
} catch (err) {
  console.error('Error in maccas.js', err);
}
