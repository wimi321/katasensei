import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const cards = JSON.parse(await readFile(new URL('../data/knowledge/p0-cards.json', import.meta.url), 'utf8'))

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
