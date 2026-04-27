import { existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const knowledge = join(root, 'data', 'knowledge', 'p0-cards.json')
if (!existsSync(knowledge)) {
  console.error('Missing data/knowledge/p0-cards.json')
  process.exit(1)
}

const platform = `${process.platform}-${process.arch}`
const binary = join(root, 'data', 'katago', 'bin', platform, process.platform === 'win32' ? 'katago.exe' : 'katago')
const model = join(root, 'data', 'katago', 'models', 'kata1-b18c384nbt-s9996604416-d4316597426.bin.gz')

console.log(`Knowledge cards: ${knowledge}`)
console.log(`Expected KataGo binary: ${binary}`)
console.log(`Expected default model: ${model}`)
console.log('KataGo binary present:', existsSync(binary))
console.log('Default model present:', existsSync(model))

if (!existsSync(binary) || !existsSync(model)) {
  console.warn('KataGo runtime resources are missing. This is expected in source checkout, but not in release packaging.')
}
