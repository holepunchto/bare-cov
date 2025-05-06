const mergeCoverages = require('../lib/merge')
const test = require('brittle')

const path = 'file://baseline'
test('should merge two empty coverage objects', (t) => {
  const a = { path, s: {}, f: {}, b: {}, statementMap: {}, fnMap: {}, branchMap: {} }
  const b = { path, s: {}, f: {}, b: {}, statementMap: {}, fnMap: {}, branchMap: {} }
  const expected = { path, s: {}, f: {}, b: {}, statementMap: {}, fnMap: {}, branchMap: {} }
  t.alike(mergeCoverages(a, b), expected)
})

test('should merge coverage objects with simple statement hits', (t) => {
  const a = { path, s: { 0: 1 }, f: {}, b: {}, statementMap: { 0: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } } }, fnMap: {}, branchMap: {} }
  const b = { path, s: { 0: 2 }, f: {}, b: {}, statementMap: { 0: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } } }, fnMap: {}, branchMap: {} }
  const expected = { path, s: { 0: 3 }, f: {}, b: {}, statementMap: { 0: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } } }, fnMap: {}, branchMap: {} }
  t.alike(mergeCoverages(a, b), expected)
})

test('should merge coverage objects with different statement keys', (t) => {
  const a = { path, s: { 0: 1 }, f: {}, b: {}, statementMap: { 0: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } } }, fnMap: {}, branchMap: {} }
  const b = { path, s: { 1: 2 }, f: {}, b: {}, statementMap: { 1: { start: { line: 2, column: 1 }, end: { line: 2, column: 5 } } }, fnMap: {}, branchMap: {} }
  const expected = {
    path,
    s: { 0: 1, 1: 2 },
    f: {},
    b: {},
    statementMap: {
      0: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
      1: { start: { line: 2, column: 1 }, end: { line: 2, column: 5 } }
    },
    fnMap: {},
    branchMap: {}
  }
  t.alike(mergeCoverages(a, b), expected)
})

test('should merge coverage objects with function hits', (t) => {
  const a = { f: { 0: 1 }, path, s: {}, b: {}, fnMap: { 0: { name: '(anonymous)', loc: { start: { line: 3, column: 0 }, end: { line: 5, column: 1 } } } }, statementMap: {}, branchMap: {} }
  const b = { f: { 0: 2 }, path, s: {}, b: {}, fnMap: { 0: { name: '(anonymous)', loc: { start: { line: 3, column: 0 }, end: { line: 5, column: 1 } } } }, statementMap: {}, branchMap: {} }
  const expected = {
    f: { 0: 3 },
    path,
    s: {},
    b: {},
    fnMap: { 0: { name: '(anonymous)', loc: { start: { line: 3, column: 0 }, end: { line: 5, column: 1 } } } },
    statementMap: {},
    branchMap: {}
  }
  t.alike(mergeCoverages(a, b), expected)
})

test('should merge coverage objects with branch hits', (t) => {
  const a = { b: { 0: [1, 0] }, path, s: {}, f: {}, branchMap: { 0: { locations: [{ start: { line: 7, column: 2 }, end: { line: 7, column: 10 } }] } }, statementMap: {}, fnMap: {} }
  const b = { b: { 0: [0, 2] }, path, s: {}, f: {}, branchMap: { 0: { locations: [{ start: { line: 7, column: 2 }, end: { line: 7, column: 10 } }] } }, statementMap: {}, fnMap: {} }
  const expected = {
    b: { 0: [1, 2] },
    path,
    s: {},
    f: {},
    branchMap: { 0: { locations: [{ start: { line: 7, column: 2 }, end: { line: 7, column: 10 } }] } },
    statementMap: {},
    fnMap: {}
  }
  t.alike(mergeCoverages(a, b), expected)
})

test('should merge coverage objects with different branch keys', (t) => {
  const a = { b: { 0: [1, 0] }, path, s: {}, f: {}, branchMap: { 0: { locations: [{ start: { line: 7, column: 2 }, end: { line: 7, column: 10 } }] } }, statementMap: {}, fnMap: {} }
  const b = { b: { 1: [0, 2] }, path, s: {}, f: {}, branchMap: { 1: { locations: [{ start: { line: 8, column: 2 }, end: { line: 8, column: 10 } }] } }, statementMap: {}, fnMap: {} }
  const expected = {
    b: {
      0: [1, 0],
      1: [0, 2]
    },
    path,
    s: {},
    f: {},
    branchMap: {
      0: { locations: [{ start: { line: 7, column: 2 }, end: { line: 7, column: 10 } }] },
      1: { locations: [{ start: { line: 8, column: 2 }, end: { line: 8, column: 10 } }] }
    },
    statementMap: {},
    fnMap: {}
  }
  t.alike(mergeCoverages(a, b), expected)
})

test('should merge coverage objects with nested statements', (t) => {
  const a = {
    path,
    s: { 0: 1, 1: 1 },
    f: {},
    b: {},
    statementMap: {
      0: { start: { line: 1, column: 1 }, end: { line: 3, column: 1 } },
      1: { start: { line: 2, column: 3 }, end: { line: 2, column: 8 } }
    },
    fnMap: {},
    branchMap: {}
  }
  const b = {
    path,
    s: { 0: 2, 1: 2 },
    f: {},
    b: {},
    statementMap: {
      0: { start: { line: 1, column: 1 }, end: { line: 3, column: 1 } },
      1: { start: { line: 2, column: 3 }, end: { line: 2, column: 8 } }
    },
    fnMap: {},
    branchMap: {}
  }
  const expected = {
    path,
    s: { 0: 3, 1: 3 },
    f: {},
    b: {},
    statementMap: {
      0: { start: { line: 1, column: 1 }, end: { line: 3, column: 1 } },
      1: { start: { line: 2, column: 3 }, end: { line: 2, column: 8 } }
    },
    fnMap: {},
    branchMap: {}
  }
  t.alike(mergeCoverages(a, b), expected)
})

test('should merge coverage where one contains the other', (t) => {
  const a = {
    path,
    s: { 0: 1, 1: 1 },
    f: {},
    b: {},
    statementMap: {
      0: { start: { line: 1, column: 1 }, end: { line: 3, column: 1 } },
      1: { start: { line: 2, column: 3 }, end: { line: 2, column: 8 } }
    },
    fnMap: {},
    branchMap: {}
  }
  const b = {
    path,
    s: { 0: 2 },
    f: {},
    b: {},
    statementMap: {
      0: { start: { line: 1, column: 0 }, end: { line: 3, column: 2 } }
    },
    fnMap: {},
    branchMap: {}
  }
  const expected = {
    path,
    s: { 0: 3, 1: 3, 2: 2 },
    f: {},
    b: {},
    statementMap: {
      0: { start: { line: 1, column: 1 }, end: { line: 3, column: 1 } },
      1: { start: { line: 2, column: 3 }, end: { line: 2, column: 8 } },
      2: { start: { line: 1, column: 0 }, end: { line: 3, column: 2 } }
    },
    fnMap: {},
    branchMap: {}
  }
  t.alike(mergeCoverages(a, b), expected)
})

test('should merge coverage where the other contains one', (t) => {
  const a = {
    path,
    s: { 0: 2 },
    f: {},
    b: {},
    statementMap: {
      0: { start: { line: 1, column: 0 }, end: { line: 3, column: 2 } }
    },
    fnMap: {},
    branchMap: {}
  }
  const b = {
    path,
    s: { 0: 1, 1: 1 },
    f: {},
    b: {},
    statementMap: {
      0: { start: { line: 1, column: 1 }, end: { line: 3, column: 1 } },
      1: { start: { line: 2, column: 3 }, end: { line: 2, column: 8 } }
    },
    fnMap: {},
    branchMap: {}
  }
  const expected = {
    path,
    s: { 0: 2, 1: 3, 2: 3 },
    f: {},
    b: {},
    statementMap: {
      0: { start: { line: 1, column: 0 }, end: { line: 3, column: 2 } },
      1: { start: { line: 1, column: 1 }, end: { line: 3, column: 1 } },
      2: { start: { line: 2, column: 3 }, end: { line: 2, column: 8 } }
    },
    fnMap: {},
    branchMap: {}
  }
  t.alike(mergeCoverages(a, b), expected)
})

test('should merge coverage with overlapping but not containing statements', (t) => {
  const a = {
    path,
    s: { 0: 1 },
    f: {},
    b: {},
    statementMap: {
      0: { start: { line: 1, column: 1 }, end: { line: 2, column: 5 } }
    },
    fnMap: {},
    branchMap: {}
  }
  const b = {
    path,
    s: { 0: 2 },
    f: {},
    b: {},
    statementMap: {
      0: { start: { line: 2, column: 1 }, end: { line: 3, column: 5 } }
    },
    fnMap: {},
    branchMap: {}
  }
  const expected = {
    path,
    s: { 0: 1, 1: 2 },
    f: {},
    b: {},
    statementMap: {
      0: { start: { line: 1, column: 1 }, end: { line: 2, column: 5 } },
      1: { start: { line: 2, column: 1 }, end: { line: 3, column: 5 } }
    },
    fnMap: {},
    branchMap: {}
  }
  t.alike(mergeCoverages(a, b), expected)
})

test('should merge complex coverage with all types of hits and different keys (0-indexed)', (t) => {
  const a = {
    path,
    s: { 0: 1, 1: 2 },
    f: { 0: 3 },
    b: { 0: [4, 0], 1: [0, 5] },
    statementMap: {
      0: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
      1: { start: { line: 2, column: 1 }, end: { line: 3, column: 1 } }
    },
    fnMap: {
      0: { name: 'funcA', loc: { start: { line: 4, column: 0 }, end: { line: 6, column: 1 } } }
    },
    branchMap: {
      0: { locations: [{ start: { line: 7, column: 2 }, end: { line: 7, column: 10 } }] },
      1: { locations: [{ start: { line: 8, column: 2 }, end: { line: 8, column: 10 } }] }
    }
  }
  const b = {
    path,
    s: { 0: 6, 2: 7 },
    f: { 1: 8 },
    b: { 2: [9, 0], 1: [0, 10] },
    statementMap: {
      0: { start: { line: 9, column: 1 }, end: { line: 9, column: 5 } },
      2: { start: { line: 2, column: 0 }, end: { line: 3, column: 2 } }
    },
    fnMap: {
      1: { name: 'funcB', loc: { start: { line: 10, column: 0 }, end: { line: 12, column: 1 } } }
    },
    branchMap: {
      2: { locations: [{ start: { line: 13, column: 2 }, end: { line: 13, column: 10 } }] },
      1: { locations: [{ start: { line: 8, column: 1 }, end: { line: 8, column: 11 } }] }
    }
  }
  const expected = {
    path,
    s: {
      0: 1,
      1: 9,
      2: 6,
      3: 7
    },
    f: {
      0: 3,
      1: 8
    },
    b: {
      0: [4, 0],
      1: [0, 5],
      2: [0, 10],
      3: [9, 0]
    },
    statementMap: {
      0: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
      1: { start: { line: 2, column: 1 }, end: { line: 3, column: 1 } },
      2: { start: { line: 9, column: 1 }, end: { line: 9, column: 5 } },
      3: { start: { line: 2, column: 0 }, end: { line: 3, column: 2 } }
    },
    fnMap: {
      0: { name: 'funcA', loc: { start: { line: 4, column: 0 }, end: { line: 6, column: 1 } } },
      1: { name: 'funcB', loc: { start: { line: 10, column: 0 }, end: { line: 12, column: 1 } } }
    },
    branchMap: {
      0: { locations: [{ start: { line: 7, column: 2 }, end: { line: 7, column: 10 } }] },
      1: { locations: [{ start: { line: 8, column: 2 }, end: { line: 8, column: 10 } }] },
      2: { locations: [{ start: { line: 8, column: 1 }, end: { line: 8, column: 11 } }] },
      3: { locations: [{ start: { line: 13, column: 2 }, end: { line: 13, column: 10 } }] }
    }
  }
  const actual = mergeCoverages(a, b)
  t.alike(actual.s, expected.s)
  t.alike(actual.f, expected.f)
  t.alike(actual.b, expected.b)
  t.alike(actual.statementMap, expected.statementMap)
  t.alike(actual.fnMap, expected.fnMap)
  t.alike(actual.branchMap, expected.branchMap)
})

test('should merge branch hits where counts are uneven (first array longer) with valid locations', (t) => {
  const a = { b: { 0: [1, 2, 3] }, path, s: {}, f: {}, branchMap: { 0: { locations: [{ start: { line: 7, column: 2 }, end: { line: 7, column: 10 } }, { start: { line: 7, column: 12 }, end: { line: 7, column: 20 } }, { start: { line: 8, column: 4 }, end: { line: 8, column: 8 } }] } }, statementMap: {}, fnMap: {} }
  const b = { b: { 0: [4, 5] }, path, s: {}, f: {}, branchMap: { 0: { locations: [{ start: { line: 7, column: 2 }, end: { line: 7, column: 10 } }, { start: { line: 7, column: 12 }, end: { line: 7, column: 20 } }, { start: { line: 8, column: 4 }, end: { line: 8, column: 8 } }] } }, statementMap: {}, fnMap: {} }
  const expected = {
    b: { 0: [5, 7, 3] },
    path,
    s: {},
    f: {},
    branchMap: { 0: { locations: [{ start: { line: 7, column: 2 }, end: { line: 7, column: 10 } }, { start: { line: 7, column: 12 }, end: { line: 7, column: 20 } }, { start: { line: 8, column: 4 }, end: { line: 8, column: 8 } }] } },
    statementMap: {},
    fnMap: {}
  }
  t.alike(mergeCoverages(a, b).b, expected.b)
})

test('should merge branch hits where counts are uneven (second array longer) with valid locations', (t) => {
  const a = {
    b: { 0: [1, 2] },
    path,
    s: {},
    f: {},
    branchMap: { 0: { locations: [{ start: { line: 9, column: 1 }, end: { line: 9, column: 5 } }, { start: { line: 10, column: 3 }, end: { line: 10, column: 7 } }, { start: { line: 11, column: 0 }, end: { line: 11, column: 1 } }] } },
    statementMap: {},
    fnMap: {}
  }
  const b = { b: { 0: [3, 4, 5] }, path, s: {}, f: {}, branchMap: { 0: { locations: [{ start: { line: 9, column: 1 }, end: { line: 9, column: 5 } }, { start: { line: 10, column: 3 }, end: { line: 10, column: 7 } }, { start: { line: 11, column: 0 }, end: { line: 11, column: 1 } }] } }, statementMap: {}, fnMap: {} }
  const expected = {
    b: { 0: [4, 6, 5] },
    path,
    s: {},
    f: {},
    branchMap: { 0: { locations: [{ start: { line: 9, column: 1 }, end: { line: 9, column: 5 } }, { start: { line: 10, column: 3 }, end: { line: 10, column: 7 } }, { start: { line: 11, column: 0 }, end: { line: 11, column: 1 } }] } },
    statementMap: {},
    fnMap: {}
  }
  t.alike(mergeCoverages(a, b).b, expected.b)
})

test('should merge branch hits with different lengths and keys with valid locations', (t) => {
  const a = { b: { 0: [1, 2], 1: [3] }, path, s: {}, f: {}, branchMap: { 0: { locations: [{ start: { line: 12, column: 2 }, end: { line: 12, column: 6 } }, { start: { line: 12, column: 8 }, end: { line: 12, column: 12 } }] }, 1: { locations: [{ start: { line: 13, column: 4 }, end: { line: 13, column: 8 } }] } }, statementMap: {}, fnMap: {} }
  const b = { b: { 0: [4], 2: [5, 6, 7] }, path, s: {}, f: {}, branchMap: { 0: { locations: [{ start: { line: 12, column: 2 }, end: { line: 12, column: 6 } }, { start: { line: 12, column: 8 }, end: { line: 12, column: 12 } }] }, 2: { locations: [{ start: { line: 14, column: 1 }, end: { line: 14, column: 5 } }, { start: { line: 14, column: 7 }, end: { line: 14, column: 11 } }, { start: { line: 15, column: 3 }, end: { line: 15, column: 7 } }] } }, statementMap: {}, fnMap: {} }
  const expected = {
    b: { 0: [5, 2], 1: [3], 2: [5, 6, 7] },
    path,
    s: {},
    f: {},
    branchMap: { 0: { locations: [{ start: { line: 12, column: 2 }, end: { line: 12, column: 6 } }, { start: { line: 12, column: 8 }, end: { line: 12, column: 12 } }] }, 1: { locations: [{ start: { line: 13, column: 4 }, end: { line: 13, column: 8 } }] }, 2: { locations: [{ start: { line: 14, column: 1 }, end: { line: 14, column: 5 } }, { start: { line: 14, column: 7 }, end: { line: 14, column: 11 } }, { start: { line: 15, column: 3 }, end: { line: 15, column: 7 } }] } },
    statementMap: {},
    fnMap: {}
  }
  t.alike(mergeCoverages(a, b).b, expected.b)
})
