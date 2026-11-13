// The DevTools protocol of the plug-in's WebView2 (or a browser), for the development tools (Node 22+, no packages).
// The host runs with WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=<port>.

export async function connect(port = process.env.PLENIO_CDP_PORT ?? '9333') {
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
  // a browser's own pages (edge://, chrome://) are not the plug-in's
  const target = targets.find((t) => t.type === 'page' && !/^(edge|chrome|devtools):/.test(t.url))
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
  const evaluate = async (expression) => {
    const answer = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (answer.result?.exceptionDetails) throw new Error(answer.result.exceptionDetails.exception?.description ?? 'exception')
    return answer.result?.result?.value
  }
  return { send, evaluate, close: () => ws.close() }
}
