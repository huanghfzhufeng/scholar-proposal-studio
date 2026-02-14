import assert from 'node:assert/strict';
import test from 'node:test';
import { filterLowQualitySources } from '../src/services/search/source-filter';

test('filterLowQualitySources removes blocked domains and keeps academic links', () => {
  const filtered = filterLowQualitySources([
    {
      title: 'good',
      url: 'https://nature.com/article',
      content: '',
      score: 0.9
    },
    {
      title: 'bad',
      url: 'https://example-content-farm.com/post',
      content: '',
      score: 0.2
    }
  ]);

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].title, 'good');
});
