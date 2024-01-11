

function oneLineTag(tag,options){
  return Object.assign(document.createElement(tag),options);
}

const modifyGitlab = () => {

  const exists = document.getElementById("dotnav")
  
  if (!exists) {
    try {
      const target = document.querySelector("#super-sidebar > div.gl-display-flex.gl-flex-direction-column.gl-flex-grow-1.gl-overflow-hidden > div.gl-flex-grow-1.gl-overflow-auto")
      
      const repos = [
        "tonybianco/tony-bianco-website",
        "purebaby/purebaby-website",
        "charles-rose/charles-rose-theme",
        "i-love-linen/i-love-linen-theme",
        "helen-kaminski/helen-kaminski-theme",
        "calibre-menswear/calibre-website",
        "peter-sheppard/peter-sheppard-theme",
        "propel-group/rb-sellars-website",
        "propel-group/rossi-boots-website",
        "propel-group/driza-bone-website",
      ]

      const newNav = oneLineTag("div", {
        id: "dotnav",
        className: "gl-display-flex gl-flex-direction-column gl-overflow-auto gl-flex-grow-1"
      })

      repos.forEach(repo => {
        const siteSection = oneLineTag("div", {
          className: "gl-display-flex gl-flex-direction-row gl-overflow-auto gl-flex-grow-1",
          style: "border-bottom: 1px solid #EAE9EC"
        })
        const mainLink = oneLineTag("a", {
          href: `https://gitlab.com/dotdevv/clients/${repo}`,
          style: "text-transform: capitalize; flex-grow: 1; align-items: center; justify-content: center; color: #333238; font-weight: 500; font-size: 12px",
          className: "gl-py-6 gl-px-1 gl-display-flex",
          innerText: repo.split("/")[1].replace(/-/g, " "),
        })
        const actions = oneLineTag("div", {
          className: "gl-display-flex gl-flex-direction-column",
          style: "align-items: center; justify-content: center; border-left: 1px solid #EAE9EC;"
        })
        const MRlink = oneLineTag("a", {
          href: `https://gitlab.com/dotdevv/clients/${repo}/-/merge_requests`,
          className: 'gl-display-flex gl-hover-bg-t-gray-a-08 gl-py-4 gl-px-6',
          style: "text-transform: capitalize; height: 100%; width: 100%; align-items: center; justify-content: center; color: #333238; margin-left: auto; font-size: 10px; font-weight: 600",
          innerText: "MRs",
        })
        const Branches = oneLineTag("a", {
          href: `https://gitlab.com/dotdevv/clients/${repo}/-/branches`,
          className: 'gl-display-flex gl-hover-bg-t-gray-a-08 gl-py-4 gl-px-6',
          style: "text-transform: capitalize; height: 100%; width: 100%; border-top: 1px solid #EAE9EC; align-items: center; justify-content: center; color: #333238; margin-left: auto; font-size: 10px; font-weight: 600",
          innerText: "Branches",
        })

        actions.appendChild(MRlink)
        actions.appendChild(Branches)
        
        siteSection.appendChild(mainLink)
        siteSection.appendChild(actions)
        newNav.appendChild(siteSection)
      })


      target.insertBefore(newNav, target.firstChild)
      clearInterval(int)
    } catch (err) {
      // console.error('nik err', err)
    }
    
    try {
      
      // add styling to change background of .contextual-nav to white
      const contextualNav = document.querySelector(".contextual-nav")
      contextualNav.style.backgroundColor = "white"
      
    } catch (err) {
      // nothing
    }
    
  }

}

let clicked = false

const assignMR = () => {
  
  // automatically assign merge request to me
  // data-qa-selector
  const assignToMeEl = document.querySelector("[data-qa-selector='assign_to_me_link']")
  
  // if assignToMeEl exists and dropdown value is empty
  // dropdown value stored at data-testid='assignee-ids-dropdown-toggle' > span
  const assigneeIdsText = document.querySelector("[data-testid='assignee-ids-dropdown-toggle'] > span")?.innerText?.toLowerCase?.()
  const notAssigned = assigneeIdsText?.includes?.("unassigned")
  if (assignToMeEl && notAssigned) {
    // click assignToMeEl
    assignToMeEl?.click?.()
  } else {
    
    const assignToMeAux = document.querySelector("[data-testid='assign-to-me-link']")
    
    if (assignToMeAux && !clicked) {
      clicked = true
      assignToMeAux?.click?.()
    }
    
  }
  
  // auto select name="merge_request[squash]" checkbox
  const squashEls = document.querySelectorAll("[name='merge_request[squash]']")
  if (squashEls?.length) {
    squashEls.forEach(squashEl => squashEl.checked = true)
  }
  
  const branchSelector = document.querySelector(".branch-selector")
  
  if (branchSelector) {
    // add buttons master and develop to toggle between
    // &merge_request%5Btarget_branch%5D=develop
    // &merge_request%5Btarget_branch%5D=develop
    // url params
    const masterBtn = oneLineTag("div", {
      className: "gl-button btn btn-default btn-sm ml-2",
      innerText: "master",
      onclick: () => {
        if (window.location.href.includes("merge_request%5Btarget_branch%5D=develop")) {
          window.location.href = window.location.href.replace("merge_request%5Btarget_branch%5D=develop", "merge_request%5Btarget_branch%5D=master")
        } else {
          window.location.href = `${window.location.href}&merge_request%5Btarget_branch%5D=master`
        }
      }
    })
    const developBtn = oneLineTag("div", {
      className: "change-branch-buttons gl-button btn btn-default btn-sm ml-2",
      innerText: "develop",
      onclick: () => {
        console.log("[mods] window.location.href", window.location.href)
        if (window.location.href.includes("merge_request%5Btarget_branch%5D=master")) {
          window.location.href = window.location.href.replace("merge_request%5Btarget_branch%5D=master", "merge_request%5Btarget_branch%5D=develop")
        } else {
          window.location.href = `${window.location.href}&merge_request%5Btarget_branch%5D=develop`
        }
      }
    })
    
    const exists = document.querySelector(".change-branch-buttons")
    
    if (!exists) {
      branchSelector.appendChild(masterBtn)
      branchSelector.appendChild(developBtn)        
    }
    
        
  }

}

const removeGatsbyDiscontinued = () => {
  
  // add css styling to hide aside
  if (window?.location?.href?.includes('gatsby')) {
    if (aside) {
      aside.style.display = "none"
    }
  }
  const aside = document.querySelector("aside")
  
}

// add .annotate-beside 
// margin: -400px

const addAnnotateBeside = () => {
  const annotateBeside = document.querySelector(".annotate-beside")
  if (annotateBeside) {
    annotateBeside.style.margin = "-400px"
  }
}

let modifyLocalhost300Xdone = false

const modifyLocalhost300X = () => {
  
  if (!modifyLocalhost300Xdone) {
    
    if (!window.location.href.includes("localhost:300")) {
      
      if (window.location.href.includes("localhost")) {
        window.localStorage.setItem(
          'LOCATOR_OPTIONS',
          // '{"templateOrTemplateId": "vscode://file/Users/lopu/things/code/dotdev/tony-bianco-website-hydrogen/app/${filePath}:${line}:${column}", "replacePath":{"from":"vscode","to":"vscode-insiders"}}'
          '{"replacePath":{"from":"vscode","to":"vscode-insiders"}}'
        )
        modifyLocalhost300Xdone = true
      }
      
      return

    }
    
    console.log('[mods] modifying localhost:300X locator options')
    
    let siteName = "tony-bianco"
    
    // search whole document for text kikki
    // if found, update siteName to kikki-k
    
    const kikki = document.querySelector("body")?.innerText?.toLowerCase?.()?.includes?.("kikki")
    
    if (kikki) {
      siteName = "kikki-k"
    }
    
    const ps = document.querySelector("body")?.innerText?.toLowerCase?.()?.includes?.("peter sheppard")
    
    if (ps) {
      siteName = "peter-sheppard-website"
    }
    
    console.log(`[mods] detected ${siteName} site`)
    
    if (siteName) {
      window.localStorage.setItem(
        'LOCATOR_OPTIONS',
        `{"templateOrTemplateId": "vscode://file/Users/lopu/things/code/dotdev/${siteName}/app/\${filePath}:\${line}:\${column}", "replacePath":{"from":"vscode","to":"vscode-insiders"}}`
      )
      
      modifyLocalhost300Xdone = true
      
      // window.localStorage.setItem(
      //   'LOCATOR_OPTIONS',
      //   '{"templateOrTemplateId": "vscode://file/Users/lopu/things/code/dotdev/unison-label/app/${filePath}:${line}:${column}", "replacePath":{"from":"vscode","to":"vscode-insiders"}}'
      // )

      // vscode://file/Users/lopu/things/code/dotdev/unison-label/app/${filePath}:${line}:${column}
      // window.localStorage.removeItem('tony-bianco:subscribe')
    }
    

    window.localStorage.setItem('locator3000', Math.random())
    
    modifyLocalhost300Xdone = true
    
  }
  

}

// if url contains github.com
// modify html[data-color-mode] to "light"

const modifyGithub = () => {
  
  const el = document.querySelector("html[data-color-mode]")
  
  if (el) {
    // el.setAttribute("data-color-mode", "light")
  }
  
}

modifyGithub()

let count = 1

let initialised = false

let int1

let int2



const runMessenger = () => {
  // change css var --chat-incoming-message-bubble-background-color to var(--wash)
  const body = document.querySelector("body")
  
  if (body) {
    body.style.setProperty("--chat-incoming-message-bubble-background-color", "var(--wash) !important")
    
    // set css var for class .__fb-light-mode to var(--wash) !important
    
    const style = document.createElement("style")
    
    style.innerHTML = `
      
      .__fb-light-mode {
        --chat-incoming-message-bubble-background-color: var(--wash) !important;
      }
      
    `
    
    body.appendChild(style)
    
    // remove all classes called .__fb-light-mode
    
    // const fbLightMode = document.querySelectorAll(".__fb-light-mode")
    
    // if (fbLightMode?.length) {
    //   fbLightMode.forEach(el => el.classList.remove("__fb-light-mode"))
    // }
    
  }
  
}

const modifySeekApplication = () => {
  
  // automatically click on data-testid="dontIncludecoverLetter" if not selected
  const coverLetterEl = document.querySelector("[data-testid='dontIncludecoverLetter']")
  
  if (coverLetterEl && !coverLetterEl.checked) {
    coverLetterEl.click()
  }
  
  // click button data-testid="continue-button" after 1 second
  
  const continueButtonEl = document.querySelector("[data-testid='continue-button']")
  
  if (continueButtonEl) {
    setTimeout(() => {
      continueButtonEl.click()
    }, 1000)
  }
  
  // click button data-testid="review-submit-application" if it exists
  
  const reviewSubmitApplicationEl = document.querySelector("[data-testid='review-submit-application']")
  
  if (reviewSubmitApplicationEl) {
    
    setTimeout(() => {
      reviewSubmitApplicationEl.click()
    }, 1000)
    
  }
  
  
}
  

const runAll = () => {
  
  const enabledSites = [
    "localhost",
    "gitlab",
    "github",
    "slack",
    "messenger",
    "productive",
    "seek"
  ]
  
  const disabledSites = [
    "localhost:8080"
  ]
  
  // check if current site is enabled
  
  const enabled = enabledSites.some(site => window.location.host.includes(site))
  const disabled = disabledSites.some(site => window.location.host.includes(site))
  
  if (!enabled || disabled) {
    console.log('[mods] Disabled custom mods')
    try {
      clearInterval(int1)
      clearInterval(int2)
    } catch {}
    return
  }
  
  if (!initialised) {
    console.log('[mods] Loaded custom mods')
    initialised = true
  }
  
  modifyLocalhost300X()
  modifyGithub()
  modifyGitlab()
  addAnnotateBeside()
  removeGatsbyDiscontinued()
  assignMR()
  runMessenger()
  modifySeekApplication()
  
  count++
  
  if (count >= 100) {
    clearInterval(int1)
  }
  
}

int1 = setInterval(runAll, 25)


int2 = setInterval(runAll, 1000)

runAll()
