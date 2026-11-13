// Development: drives the plug-in's page over the WebView2 DevTools protocol (Node 22+, no packages).
//
// Start the host with WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9333, then:
//   node tools/dev/cdp.mjs eval "<expression>"         prints the (awaited) value as JSON
//   node tools/dev/cdp.mjs call <method> ['<json>']    a plug-in call through window.plenioCall
//   node tools/dev/cdp.mjs shot <out.png>              a picture of the page
//   node tools/dev/cdp.mjs wait "<expression>" [s]     waits until the expression is truthy (default 600 s)
// PLENIO_CDP_PORT picks another port.

const port = process.env.PLENIO_CDP_PORT ?? '9333'
const [, , command, ...args] = process.argv

async function page() {
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
  const target = targets.find((t) => t.type === 'page' && !/^(edge|chrome|devtools):/.test(t.url))   // not a browser's own pages
  if (!target) throw new Error('no page: is the plug-in window open?')
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })
  let id = 0
  const waiting = new Map()
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data)
    if (message.id && waiting.has(message.id)) {
      waiting.get(message.id)(message)
      waiting.delete(message.id)
    }
  }
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      id += 1
      waiting.set(id, resolve)
      ws.send(JSON.stringify({ id, method, params }))
    })
  return { send, close: () => ws.close() }
}

async function evaluate(p, expression) {
  const answer = await p.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (answer.result?.exceptionDetails) throw new Error(answer.result.exceptionDetails.exception?.description ?? 'exception')
  return answer.result?.result?.value
}

const p = await page()
try {
  if (command === 'eval') {
    console.log(JSON.stringify(await evaluate(p, args[0]), null, 2))
  } else if (command === 'call') {
    const request = JSON.stringify({ method: args[0], params: JSON.parse(args[1] ?? '{}') })
    const text = await evaluate(p, `window.plenioCall(${JSON.stringify(request)})`)
    console.log(JSON.stringify(JSON.parse(text), null, 2))
  } else if (command === 'shot') {
    const { writeFile } = await import('node:fs/promises')
    const answer = await p.send('Page.captureScreenshot', { format: 'png' })
    await writeFile(args[0], Buffer.from(answer.result.data, 'base64'))
    console.log(args[0])
  } else if (command === 'wait') {
    const until = Date.now() + Number(args[1] ?? 600) * 1000
    for (;;) {
      const value = await evaluate(p, args[0])
      if (value) {
        console.log(JSON.stringify(value))
        break
      }
      if (Date.now() > until) throw new Error('timed out')
      await new Promise((r) => setTimeout(r, 2000))
    }
  } else {
    console.log('usage: cdp.mjs eval|call|shot|wait …')
  }
} finally {
  p.close()
}
