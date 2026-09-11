import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyAdminPassword } from '../src/admin-password.js';

test('D1 credential lookup failure fails closed instead of throwing', async () => {
  const env = {
    ADMIN_PASSWORD: 'fallback-password',
    DB: {
      prepare() {
        throw new Error('D1 unavailable');
      }
    }
  };

  await assert.doesNotReject(() => verifyAdminPassword(env, 'wrong-password'));
  assert.equal(await verifyAdminPassword(env, 'wrong-password'), false);
  assert.equal(await verifyAdminPassword(env, 'fallback-password'), false);
});

test('missing persisted credential row uses bootstrap ADMIN_PASSWORD fallback', async () => {
  const env = {
    ADMIN_PASSWORD: 'fallback-password',
    DB: {
      prepare() {
        return { first: async () => null };
      }
    }
  };

  assert.equal(await verifyAdminPassword(env, 'fallback-password'), true);
  assert.equal(await verifyAdminPassword(env, 'wrong-password'), false);
});
