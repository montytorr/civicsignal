const ADJECTIVES = [
  'amber', 'arctic', 'autumn', 'azure', 'birch', 'brass', 'cedar', 'chalk',
  'cliff', 'cloud', 'cobalt', 'copper', 'coral', 'dusk', 'elm', 'ember',
  'fern', 'flint', 'frost', 'granite', 'hazel', 'iron', 'ivory', 'jade',
  'lark', 'linden', 'maple', 'marsh', 'moss', 'mist', 'oak', 'olive',
  'onyx', 'opal', 'pearl', 'pine', 'quartz', 'reed', 'ridge', 'river',
  'sage', 'sand', 'slate', 'snow', 'spruce', 'steel', 'stone', 'storm',
  'swift', 'thorn', 'tide', 'vale', 'willow', 'wind', 'wren', 'zinc',
]

const NOUNS = [
  'badger', 'bunting', 'crane', 'curlew', 'dove', 'eagle', 'egret', 'falcon',
  'finch', 'fox', 'gull', 'hare', 'hawk', 'heron', 'ibis', 'jay',
  'kestrel', 'lark', 'lynx', 'magpie', 'martin', 'merlin', 'osprey', 'otter',
  'owl', 'plover', 'raven', 'robin', 'sandpiper', 'shrike', 'sparrow', 'starling',
  'swift', 'tern', 'thrush', 'vole', 'wagtail', 'warbler', 'weasel', 'wren',
]

export const generateHandle = (): string => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const num = String(Math.floor(Math.random() * 100)).padStart(2, '0')
  return `${adj}-${noun}-${num}`
}
