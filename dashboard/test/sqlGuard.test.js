import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertReadOnly, withRowLimit } from '../server/sqlGuard.js';

test('accepts plain SELECT and CTEs', () => {
  assert.equal(assertReadOnly('SELECT 1;'), 'SELECT 1');
  assert.equal(assertReadOnly('  with t as (select 1) select * from t'), 'with t as (select 1) select * from t');
});

test('rejects writes and DDL', () => {
  for (const sql of [
    'DELETE FROM users',
    'UPDATE users SET name = 1',
    'INSERT INTO users VALUES (1)',
    'DROP TABLE users',
    'SELECT 1; DROP TABLE users',
    'CREATE TABLE x (a int)',
    'SELECT pg_sleep(100)',
    'EXPLAIN SELECT 1',
    '',
  ]) {
    assert.throws(() => assertReadOnly(sql), new RegExp('.'), sql);
  }
});

test('keywords inside string literals and comments are fine', () => {
  const sql = `SELECT * FROM events -- update later\nWHERE kind = 'delete' /* drop */ AND updated_at > now()`;
  const out = assertReadOnly(sql);
  assert.match(out, /kind = 'delete'/);
  assert.doesNotMatch(out, /drop/);
});

test('row limit wrapper caps the count', () => {
  assert.match(withRowLimit('SELECT 1', 10), /LIMIT 10$/);
  assert.match(withRowLimit('SELECT 1', 999999), /LIMIT 5000$/);
  assert.match(withRowLimit('SELECT 1', undefined), /LIMIT 500$/);
});
