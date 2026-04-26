import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const root = process.cwd()

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8')
}

test('official KataGo model installer is wired through main preload and settings', () => {
  const types = read('src/main/lib/types.ts')
  assert.match(types, /KataGoAssetInstallRequest/)
  assert.match(types, /KataGoAssetInstallProgress/)
  assert.match(types, /KataGoAssetInstallResult/)

  const service = read('src/main/services/katago/katagoAssets.ts')
  assert.match(service, /installOfficialKataGoModel/)
  assert.match(service, /discoverModelDownloadUrl/)
  assert.match(service, /katagotraining\.org/)
  assert.match(service, /Readable\.fromWeb/)
  assert.match(service, /copyPlatformBinaryIfAvailable/)

  const main = read('src/main/index.ts')
  assert.match(main, /katago-assets:install-official-model/)
  assert.match(main, /katago-assets:install-progress/)

  const preload = read('src/preload/index.ts')
  assert.match(preload, /installKataGoOfficialModel/)
  assert.match(preload, /onKataGoAssetInstallProgress/)

  const app = read('src/renderer/src/App.tsx')
  assert.match(app, /installOfficialKataGoModel/)
  assert.match(app, /katagoInstallProgress/)
  assert.match(app, /onKataGoAssetInstallProgress/)
  assert.match(app, /onInstallOfficialModel/)

  const panel = read('src/renderer/src/features/settings/KataGoAssetsPanel.tsx')
  assert.match(panel, /一键安装官方权重/)
  assert.match(panel, /katago-install-progress/)
  assert.match(panel, /selectedPreset/)
})
