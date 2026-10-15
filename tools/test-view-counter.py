import asyncio, os, subprocess, time
os.environ['PLAYWRIGHT_BROWSERS_PATH'] = '/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    subprocess.run(['pkill', '-f', 'http.server 8763'])
    srv = subprocess.Popen(['python3', '-m', 'http.server', '8763'], cwd='/home/claude/bo-nini', stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
    async with async_playwright() as p:
        br = await p.chromium.launch(); ctx = await br.new_context(viewport={'width': 1280, 'height': 800})
        pg = await ctx.new_page(); beacons = []
        pg.on('request', lambda r: beacons.append(r.url) if 'cloudflareinsights' in r.url else None)
        # pretend a token is set, to see whether the counter would load
        await pg.route('**/index.html*', lambda route: route.fulfill(body=open('/home/claude/bo-nini/index.html').read().replace("const CF_TOKEN = '';", "const CF_TOKEN = 'test-token';"), content_type='text/html'))
        async def visit(url):
            beacons.clear(); await pg.goto(url); await pg.wait_for_timeout(1500)
            return bool(beacons), await pg.evaluate("[...document.querySelectorAll('div')].map(d => d.textContent).find(t => /browser/.test(t) && t.length < 80) || ''")
        print('a visitor:                 counted', (await visit('http://localhost:8763/index.html'))[0])
        c, n = await visit('http://localhost:8763/index.html?me'); print('opening the ?me link:      counted', c, '| note:', n)
        print('later visits, same browser: counted', (await visit('http://localhost:8763/index.html'))[0])
        c, n = await visit('http://localhost:8763/index.html?me=off'); print('opening ?me=off:           counted', c, '| note:', n)
        await br.close()
    srv.terminate()
asyncio.run(main())
