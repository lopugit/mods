
// On document load inject css
// vanilla js not jquery
console.log('slack mods injected by nik')

// background: linear-gradient(to right, #f34a4a, #ffbc48, #58ca70, #47b5e6, #a555e8, #f34a4a);


var css = `
  /* rainbow animation keyframes */

  @keyframes rainbow-bg-mod {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
  
  @keyframes rainbow-text {
    0% {
      color: #f34a4a;
    }
    20% {
      color: #ffbc48;
    }
    40% {
      color: #58ca70;
    }
    60% {
      color: #47b5e6;
    }
    80% {
      color: #a555e8;
    }
    100% {
      color: #f34a4a;
    }
  }

  .p-top_nav,
  .rainbow-bg-mod {
    background: linear-gradient(to right, #FBB4B4, #FBFAB4, #DAFDDF, #B5F9FB, #CDC5FC, #FBB4B4);
    background-size: 200%; 
    animation: rainbow-bg-mod 20s infinite linear ;
    -webkit-animation: rainbow-bg-mod 10s infinite linear;
  }
  
  .c-reaction--reacted {
    background: none !important;
    border: none !important;
  }
  
  .c-reaction--reacted .c-reaction__count {
    // animate color between all rainbows
    // animation: rainbow-text 55s infinite linear;
    // -webkit-animation: rainbow-text 55s infinite linear;
    color: #ffbc48 !important;
    padding-left: 4px;
    font-weight: bold;
  }
  
  
  
  .c-emoji.c-emoji__small {
    height: 18px !important;
    width: 18px !important;
  }
  
`


// apend style to bottom of body

var style = document.createElement('style');
style.type = 'text/css';
style.appendChild(document.createTextNode(css));

document.body.appendChild(style);

