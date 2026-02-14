import assert from 'node:assert/strict';
import test from 'node:test';
import { draftTools } from '../src/agents/draft/tools';

const sourceText = JSON.stringify([
  {
    id: 's1',
    title: '立项依据证据 1',
    source: 'Nature',
    year: '2024',
    url: 'https://example.org/s1',
    abstract: 'a',
    sectionKey: '立项依据',
    score: 95,
    selected: true
  },
  {
    id: 's2',
    title: '立项依据证据 2',
    source: 'Science',
    year: '2023',
    url: 'https://example.org/s2',
    abstract: 'b',
    sectionKey: '立项依据',
    score: 91,
    selected: true
  },
  {
    id: 's3',
    title: '研究内容证据 1',
    source: 'Cell',
    year: '2024',
    url: 'https://example.org/s3',
    abstract: 'c',
    sectionKey: '研究内容',
    score: 92,
    selected: true
  },
  {
    id: 's4',
    title: '研究内容证据 2',
    source: 'JAMA',
    year: '2022',
    url: 'https://example.org/s4',
    abstract: 'd',
    sectionKey: '研究内容',
    score: 88,
    selected: true
  },
  {
    id: 's5',
    title: '研究基础证据 1',
    source: 'IEEE',
    year: '2021',
    url: 'https://example.org/s5',
    abstract: 'e',
    sectionKey: '研究基础',
    score: 89,
    selected: true
  },
  {
    id: 's6',
    title: '研究基础证据 2',
    source: 'ACL',
    year: '2020',
    url: 'https://example.org/s6',
    abstract: 'f',
    sectionKey: '研究基础',
    score: 85,
    selected: true
  }
]);

test('draftTools builds grounded draft with required headings and citations', () => {
  const content = draftTools.buildGroundedDraft('测试课题', sourceText);

  assert.ok(content.includes('一、立项依据'));
  assert.ok(content.includes('二、研究内容'));
  assert.ok(content.includes('三、研究基础'));

  const citations = draftTools.extractCitationIds(content);
  assert.ok(citations.length >= 6);
  assert.ok(citations.includes('s1'));
  assert.ok(citations.includes('s6'));
});

test('draftTools detects insufficient section citations', () => {
  const badContent = `测试课题

一、立项依据
内容 [[s1]]

二、研究内容
内容 [[s3]]

三、研究基础
内容 [[s5]]
`;

  const missing = draftTools.findSectionsWithInsufficientCitations(badContent, 2);
  assert.deepEqual(missing, ['立项依据', '研究内容', '研究基础']);
});

test('draftTools parseSources skips invalid entries', () => {
  const parsed = draftTools.parseSources(
    JSON.stringify([
      {
        id: 'ok',
        title: 'ok',
        sectionKey: '研究内容',
        selected: true
      },
      {
        id: 1,
        title: 'bad'
      }
    ])
  );

  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].id, 'ok');
});
