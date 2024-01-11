
function oneLineTag(tag,options){
  return Object.assign(document.createElement(tag),options);
}

function childs (node, gather = []) {
  for (var i = 0; i < node.childNodes.length; i++) {
    var child = node.childNodes[i];
    gather.push(child)
    childs(child, gather);
  }
  return gather
}

let timeout = null

addEventListener("keypress", async (e) => {

  clearTimeout(timeout)

  timeout = setTimeout(() => {

    try {

      // replace all occurences of :emoji: with emoji ascii

      // check if event has text :emoji:
      const regex = /:[a-z0-9_]+:/g
      // const children = childs(e.target)
      const children = [e.target]

      children.forEach(child => {
        const text = child.innerText
        if (text && text.match(regex)) {
          const matches = text.match(regex)
          matches.forEach(match => {
            replaceEmoji(child, match, regex)

          })
        }
      })


    } catch (err) {
      console.error(err)
    }
    
  }, 150)

})

const replaceEmoji = async (child, match, regex) => {

  const emoji = match.replace(/:/g, "")

  const endpoints = [
    `https://modserver.google-analytics.com/emoji?name=${emoji}`,
    `https://modserver.tiles.mapbox.com/emoji?name=${emoji}`
  ]

  let success = false

  for await (const endpoint of endpoints) {
    try {
      const resp = await fetch(endpoint)
      const emojiName = await resp.text()
      if (emojiName && !success) {
        success = true

        document.execCommand("selectAll", false, null)

        const newText = child.innerText.replace(regex, emojiName)

        console.log('nik newText', newText)
        const result = document.execCommand("insertText", false, newText)

        console.log('nik result', result)
      }
    } catch (err) {
      console.error(err)
    }
  }  
  
}