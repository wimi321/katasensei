import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const cards = JSON.parse(await readFile(new URL('../data/knowledge/p0-cards.json', import.meta.url), 'utf8'))
const patterns = JSON.parse(await readFile(new URL('../data/knowledge/pattern-cards.json', import.meta.url), 'utf8'))

test('P0 knowledge cards are non-empty and stable', () => {
  assert.ok(cards.length >= 48)
  const ids = new Set(cards.map((card) => card.id))
  assert.equal(ids.size, cards.length)
})

test('every knowledge card has teaching fields', () => {
  for (const card of cards) {
    assert.ok(card.title, card.id)
    assert.ok(card.summary, card.id)
    assert.ok(card.coachShort, card.id)
    assert.ok(card.coachLong, card.id)
    assert.ok(card.drill, card.id)
    assert.ok(Array.isArray(card.tags), card.id)
  }
})

test('pattern knowledge cards cover joseki, life-death, tesuji, and shape matching', () => {
  assert.ok(patterns.length >= 10)
  const ids = new Set(patterns.map((card) => card.id))
  assert.equal(ids.size, patterns.length)
  for (const category of ['joseki', 'life_death', 'tesuji', 'shape']) {
    assert.ok(patterns.some((card) => card.category === category), category)
  }
})

test('every pattern card has matching triggers and teacher guidance', () => {
  for (const card of patterns) {
    assert.ok(card.title, card.id)
    assert.ok(card.patternType, card.id)
    assert.ok(Array.isArray(card.tags) && card.tags.length > 0, card.id)
    assert.ok(Array.isArray(card.aliases), card.id)
    assert.ok(Array.isArray(card.boardSignals), card.id)
    assert.ok(card.triggers && typeof card.triggers === 'object', card.id)
    assert.ok(Array.isArray(card.variations) && card.variations.length > 0, card.id)
    assert.ok(card.teaching?.recognition, card.id)
    assert.ok(card.teaching?.correctIdea, card.id)
    assert.ok(card.teaching?.memoryCue, card.id)
    assert.ok(card.teaching?.drill, card.id)
  }
})

test('teacher runtime wires pattern matching into knowledge retrieval', async () => {
  const source = await readFile(new URL('../src/main/services/teacherAgent.ts', import.meta.url), 'utf8')
  assert.match(source, /candidateMoves:/)
  assert.match(source, /principalVariation:/)
  assert.match(source, /定式、死活题或手筋型/)
})
