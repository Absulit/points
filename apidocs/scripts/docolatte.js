(function () {
'use strict';

/**
 * Fuse.js v6.6.2 - Lightweight fuzzy-search (http://fusejs.io)
 *
 * Copyright (c) 2022 Kiro Risk (http://kiro.me)
 * All Rights Reserved. Apache Software License 2.0
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

function isArray$3(value) {
  return !Array.isArray
    ? getTag(value) === '[object Array]'
    : Array.isArray(value)
}

// Adapted from: https://github.com/lodash/lodash/blob/master/.internal/baseToString.js
const INFINITY = 1 / 0;
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value
  }
  let result = value + '';
  return result == '0' && 1 / value == -INFINITY ? '-0' : result
}

function toString$b(value) {
  return value == null ? '' : baseToString(value)
}

function isString(value) {
  return typeof value === 'string'
}

function isNumber(value) {
  return typeof value === 'number'
}

// Adapted from: https://github.com/lodash/lodash/blob/master/isBoolean.js
function isBoolean(value) {
  return (
    value === true ||
    value === false ||
    (isObjectLike$2(value) && getTag(value) == '[object Boolean]')
  )
}

function isObject$i(value) {
  return typeof value === 'object'
}

// Checks if `value` is object-like.
function isObjectLike$2(value) {
  return isObject$i(value) && value !== null
}

function isDefined(value) {
  return value !== undefined && value !== null
}

function isBlank(value) {
  return !value.trim().length
}

// Gets the `toStringTag` of `value`.
// Adapted from: https://github.com/lodash/lodash/blob/master/.internal/getTag.js
function getTag(value) {
  return value == null
    ? value === undefined
      ? '[object Undefined]'
      : '[object Null]'
    : Object.prototype.toString.call(value)
}

const EXTENDED_SEARCH_UNAVAILABLE = 'Extended search is not available';

const INCORRECT_INDEX_TYPE = "Incorrect 'index' type";

const LOGICAL_SEARCH_INVALID_QUERY_FOR_KEY = (key) =>
  `Invalid value for key ${key}`;

const PATTERN_LENGTH_TOO_LARGE = (max) =>
  `Pattern length exceeds max of ${max}.`;

const MISSING_KEY_PROPERTY = (name) => `Missing ${name} property in key`;

const INVALID_KEY_WEIGHT_VALUE = (key) =>
  `Property 'weight' in key '${key}' must be a positive integer`;

const hasOwn$b = Object.prototype.hasOwnProperty;

class KeyStore {
  constructor(keys) {
    this._keys = [];
    this._keyMap = {};

    let totalWeight = 0;

    keys.forEach((key) => {
      let obj = createKey(key);

      totalWeight += obj.weight;

      this._keys.push(obj);
      this._keyMap[obj.id] = obj;

      totalWeight += obj.weight;
    });

    // Normalize weights so that their sum is equal to 1
    this._keys.forEach((key) => {
      key.weight /= totalWeight;
    });
  }
  get(keyId) {
    return this._keyMap[keyId]
  }
  keys() {
    return this._keys
  }
  toJSON() {
    return JSON.stringify(this._keys)
  }
}

function createKey(key) {
  let path = null;
  let id = null;
  let src = null;
  let weight = 1;
  let getFn = null;

  if (isString(key) || isArray$3(key)) {
    src = key;
    path = createKeyPath(key);
    id = createKeyId(key);
  } else {
    if (!hasOwn$b.call(key, 'name')) {
      throw new Error(MISSING_KEY_PROPERTY('name'))
    }

    const name = key.name;
    src = name;

    if (hasOwn$b.call(key, 'weight')) {
      weight = key.weight;

      if (weight <= 0) {
        throw new Error(INVALID_KEY_WEIGHT_VALUE(name))
      }
    }

    path = createKeyPath(name);
    id = createKeyId(name);
    getFn = key.getFn;
  }

  return { path, id, weight, src, getFn }
}

function createKeyPath(key) {
  return isArray$3(key) ? key : key.split('.')
}

function createKeyId(key) {
  return isArray$3(key) ? key.join('.') : key
}

function get$1(obj, path) {
  let list = [];
  let arr = false;

  const deepGet = (obj, path, index) => {
    if (!isDefined(obj)) {
      return
    }
    if (!path[index]) {
      // If there's no path left, we've arrived at the object we care about.
      list.push(obj);
    } else {
      let key = path[index];

      const value = obj[key];

      if (!isDefined(value)) {
        return
      }

      // If we're at the last value in the path, and if it's a string/number/bool,
      // add it to the list
      if (
        index === path.length - 1 &&
        (isString(value) || isNumber(value) || isBoolean(value))
      ) {
        list.push(toString$b(value));
      } else if (isArray$3(value)) {
        arr = true;
        // Search each item in the array.
        for (let i = 0, len = value.length; i < len; i += 1) {
          deepGet(value[i], path, index + 1);
        }
      } else if (path.length) {
        // An object. Recurse further.
        deepGet(value, path, index + 1);
      }
    }
  };

  // Backwards compatibility (since path used to be a string)
  deepGet(obj, isString(path) ? path.split('.') : path, 0);

  return arr ? list : list[0]
}

const MatchOptions = {
  // Whether the matches should be included in the result set. When `true`, each record in the result
  // set will include the indices of the matched characters.
  // These can consequently be used for highlighting purposes.
  includeMatches: false,
  // When `true`, the matching function will continue to the end of a search pattern even if
  // a perfect match has already been located in the string.
  findAllMatches: false,
  // Minimum number of characters that must be matched before a result is considered a match
  minMatchCharLength: 1
};

const BasicOptions = {
  // When `true`, the algorithm continues searching to the end of the input even if a perfect
  // match is found before the end of the same input.
  isCaseSensitive: false,
  // When true, the matching function will continue to the end of a search pattern even if
  includeScore: false,
  // List of properties that will be searched. This also supports nested properties.
  keys: [],
  // Whether to sort the result list, by score
  shouldSort: true,
  // Default sort function: sort by ascending score, ascending index
  sortFn: (a, b) =>
    a.score === b.score ? (a.idx < b.idx ? -1 : 1) : a.score < b.score ? -1 : 1
};

const FuzzyOptions = {
  // Approximately where in the text is the pattern expected to be found?
  location: 0,
  // At what point does the match algorithm give up. A threshold of '0.0' requires a perfect match
  // (of both letters and location), a threshold of '1.0' would match anything.
  threshold: 0.6,
  // Determines how close the match must be to the fuzzy location (specified above).
  // An exact letter match which is 'distance' characters away from the fuzzy location
  // would score as a complete mismatch. A distance of '0' requires the match be at
  // the exact location specified, a threshold of '1000' would require a perfect match
  // to be within 800 characters of the fuzzy location to be found using a 0.8 threshold.
  distance: 100
};

const AdvancedOptions = {
  // When `true`, it enables the use of unix-like search commands
  useExtendedSearch: false,
  // The get function to use when fetching an object's properties.
  // The default will search nested paths *ie foo.bar.baz*
  getFn: get$1,
  // When `true`, search will ignore `location` and `distance`, so it won't matter
  // where in the string the pattern appears.
  // More info: https://fusejs.io/concepts/scoring-theory.html#fuzziness-score
  ignoreLocation: false,
  // When `true`, the calculation for the relevance score (used for sorting) will
  // ignore the field-length norm.
  // More info: https://fusejs.io/concepts/scoring-theory.html#field-length-norm
  ignoreFieldNorm: false,
  // The weight to determine how much field length norm effects scoring.
  fieldNormWeight: 1
};

var Config = {
  ...BasicOptions,
  ...MatchOptions,
  ...FuzzyOptions,
  ...AdvancedOptions
};

const SPACE = /[^ ]+/g;

// Field-length norm: the shorter the field, the higher the weight.
// Set to 3 decimals to reduce index size.
function norm(weight = 1, mantissa = 3) {
  const cache = new Map();
  const m = Math.pow(10, mantissa);

  return {
    get(value) {
      const numTokens = value.match(SPACE).length;

      if (cache.has(numTokens)) {
        return cache.get(numTokens)
      }

      // Default function is 1/sqrt(x), weight makes that variable
      const norm = 1 / Math.pow(numTokens, 0.5 * weight);

      // In place of `toFixed(mantissa)`, for faster computation
      const n = parseFloat(Math.round(norm * m) / m);

      cache.set(numTokens, n);

      return n
    },
    clear() {
      cache.clear();
    }
  }
}

class FuseIndex {
  constructor({
    getFn = Config.getFn,
    fieldNormWeight = Config.fieldNormWeight
  } = {}) {
    this.norm = norm(fieldNormWeight, 3);
    this.getFn = getFn;
    this.isCreated = false;

    this.setIndexRecords();
  }
  setSources(docs = []) {
    this.docs = docs;
  }
  setIndexRecords(records = []) {
    this.records = records;
  }
  setKeys(keys = []) {
    this.keys = keys;
    this._keysMap = {};
    keys.forEach((key, idx) => {
      this._keysMap[key.id] = idx;
    });
  }
  create() {
    if (this.isCreated || !this.docs.length) {
      return
    }

    this.isCreated = true;

    // List is Array<String>
    if (isString(this.docs[0])) {
      this.docs.forEach((doc, docIndex) => {
        this._addString(doc, docIndex);
      });
    } else {
      // List is Array<Object>
      this.docs.forEach((doc, docIndex) => {
        this._addObject(doc, docIndex);
      });
    }

    this.norm.clear();
  }
  // Adds a doc to the end of the index
  add(doc) {
    const idx = this.size();

    if (isString(doc)) {
      this._addString(doc, idx);
    } else {
      this._addObject(doc, idx);
    }
  }
  // Removes the doc at the specified index of the index
  removeAt(idx) {
    this.records.splice(idx, 1);

    // Change ref index of every subsquent doc
    for (let i = idx, len = this.size(); i < len; i += 1) {
      this.records[i].i -= 1;
    }
  }
  getValueForItemAtKeyId(item, keyId) {
    return item[this._keysMap[keyId]]
  }
  size() {
    return this.records.length
  }
  _addString(doc, docIndex) {
    if (!isDefined(doc) || isBlank(doc)) {
      return
    }

    let record = {
      v: doc,
      i: docIndex,
      n: this.norm.get(doc)
    };

    this.records.push(record);
  }
  _addObject(doc, docIndex) {
    let record = { i: docIndex, $: {} };

    // Iterate over every key (i.e, path), and fetch the value at that key
    this.keys.forEach((key, keyIndex) => {
      let value = key.getFn ? key.getFn(doc) : this.getFn(doc, key.path);

      if (!isDefined(value)) {
        return
      }

      if (isArray$3(value)) {
        let subRecords = [];
        const stack = [{ nestedArrIndex: -1, value }];

        while (stack.length) {
          const { nestedArrIndex, value } = stack.pop();

          if (!isDefined(value)) {
            continue
          }

          if (isString(value) && !isBlank(value)) {
            let subRecord = {
              v: value,
              i: nestedArrIndex,
              n: this.norm.get(value)
            };

            subRecords.push(subRecord);
          } else if (isArray$3(value)) {
            value.forEach((item, k) => {
              stack.push({
                nestedArrIndex: k,
                value: item
              });
            });
          } else ;
        }
        record.$[keyIndex] = subRecords;
      } else if (isString(value) && !isBlank(value)) {
        let subRecord = {
          v: value,
          n: this.norm.get(value)
        };

        record.$[keyIndex] = subRecord;
      }
    });

    this.records.push(record);
  }
  toJSON() {
    return {
      keys: this.keys,
      records: this.records
    }
  }
}

function createIndex(
  keys,
  docs,
  { getFn = Config.getFn, fieldNormWeight = Config.fieldNormWeight } = {}
) {
  const myIndex = new FuseIndex({ getFn, fieldNormWeight });
  myIndex.setKeys(keys.map(createKey));
  myIndex.setSources(docs);
  myIndex.create();
  return myIndex
}

function parseIndex(
  data,
  { getFn = Config.getFn, fieldNormWeight = Config.fieldNormWeight } = {}
) {
  const { keys, records } = data;
  const myIndex = new FuseIndex({ getFn, fieldNormWeight });
  myIndex.setKeys(keys);
  myIndex.setIndexRecords(records);
  return myIndex
}

function computeScore$1(
  pattern,
  {
    errors = 0,
    currentLocation = 0,
    expectedLocation = 0,
    distance = Config.distance,
    ignoreLocation = Config.ignoreLocation
  } = {}
) {
  const accuracy = errors / pattern.length;

  if (ignoreLocation) {
    return accuracy
  }

  const proximity = Math.abs(expectedLocation - currentLocation);

  if (!distance) {
    // Dodge divide by zero error.
    return proximity ? 1.0 : accuracy
  }

  return accuracy + proximity / distance
}

function convertMaskToIndices(
  matchmask = [],
  minMatchCharLength = Config.minMatchCharLength
) {
  let indices = [];
  let start = -1;
  let end = -1;
  let i = 0;

  for (let len = matchmask.length; i < len; i += 1) {
    let match = matchmask[i];
    if (match && start === -1) {
      start = i;
    } else if (!match && start !== -1) {
      end = i - 1;
      if (end - start + 1 >= minMatchCharLength) {
        indices.push([start, end]);
      }
      start = -1;
    }
  }

  // (i-1 - start) + 1 => i - start
  if (matchmask[i - 1] && i - start >= minMatchCharLength) {
    indices.push([start, i - 1]);
  }

  return indices
}

// Machine word size
const MAX_BITS = 32;

function search(
  text,
  pattern,
  patternAlphabet,
  {
    location = Config.location,
    distance = Config.distance,
    threshold = Config.threshold,
    findAllMatches = Config.findAllMatches,
    minMatchCharLength = Config.minMatchCharLength,
    includeMatches = Config.includeMatches,
    ignoreLocation = Config.ignoreLocation
  } = {}
) {
  if (pattern.length > MAX_BITS) {
    throw new Error(PATTERN_LENGTH_TOO_LARGE(MAX_BITS))
  }

  const patternLen = pattern.length;
  // Set starting location at beginning text and initialize the alphabet.
  const textLen = text.length;
  // Handle the case when location > text.length
  const expectedLocation = Math.max(0, Math.min(location, textLen));
  // Highest score beyond which we give up.
  let currentThreshold = threshold;
  // Is there a nearby exact match? (speedup)
  let bestLocation = expectedLocation;

  // Performance: only computer matches when the minMatchCharLength > 1
  // OR if `includeMatches` is true.
  const computeMatches = minMatchCharLength > 1 || includeMatches;
  // A mask of the matches, used for building the indices
  const matchMask = computeMatches ? Array(textLen) : [];

  let index;

  // Get all exact matches, here for speed up
  while ((index = text.indexOf(pattern, bestLocation)) > -1) {
    let score = computeScore$1(pattern, {
      currentLocation: index,
      expectedLocation,
      distance,
      ignoreLocation
    });

    currentThreshold = Math.min(score, currentThreshold);
    bestLocation = index + patternLen;

    if (computeMatches) {
      let i = 0;
      while (i < patternLen) {
        matchMask[index + i] = 1;
        i += 1;
      }
    }
  }

  // Reset the best location
  bestLocation = -1;

  let lastBitArr = [];
  let finalScore = 1;
  let binMax = patternLen + textLen;

  const mask = 1 << (patternLen - 1);

  for (let i = 0; i < patternLen; i += 1) {
    // Scan for the best match; each iteration allows for one more error.
    // Run a binary search to determine how far from the match location we can stray
    // at this error level.
    let binMin = 0;
    let binMid = binMax;

    while (binMin < binMid) {
      const score = computeScore$1(pattern, {
        errors: i,
        currentLocation: expectedLocation + binMid,
        expectedLocation,
        distance,
        ignoreLocation
      });

      if (score <= currentThreshold) {
        binMin = binMid;
      } else {
        binMax = binMid;
      }

      binMid = Math.floor((binMax - binMin) / 2 + binMin);
    }

    // Use the result from this iteration as the maximum for the next.
    binMax = binMid;

    let start = Math.max(1, expectedLocation - binMid + 1);
    let finish = findAllMatches
      ? textLen
      : Math.min(expectedLocation + binMid, textLen) + patternLen;

    // Initialize the bit array
    let bitArr = Array(finish + 2);

    bitArr[finish + 1] = (1 << i) - 1;

    for (let j = finish; j >= start; j -= 1) {
      let currentLocation = j - 1;
      let charMatch = patternAlphabet[text.charAt(currentLocation)];

      if (computeMatches) {
        // Speed up: quick bool to int conversion (i.e, `charMatch ? 1 : 0`)
        matchMask[currentLocation] = +!!charMatch;
      }

      // First pass: exact match
      bitArr[j] = ((bitArr[j + 1] << 1) | 1) & charMatch;

      // Subsequent passes: fuzzy match
      if (i) {
        bitArr[j] |=
          ((lastBitArr[j + 1] | lastBitArr[j]) << 1) | 1 | lastBitArr[j + 1];
      }

      if (bitArr[j] & mask) {
        finalScore = computeScore$1(pattern, {
          errors: i,
          currentLocation,
          expectedLocation,
          distance,
          ignoreLocation
        });

        // This match will almost certainly be better than any existing match.
        // But check anyway.
        if (finalScore <= currentThreshold) {
          // Indeed it is
          currentThreshold = finalScore;
          bestLocation = currentLocation;

          // Already passed `loc`, downhill from here on in.
          if (bestLocation <= expectedLocation) {
            break
          }

          // When passing `bestLocation`, don't exceed our current distance from `expectedLocation`.
          start = Math.max(1, 2 * expectedLocation - bestLocation);
        }
      }
    }

    // No hope for a (better) match at greater error levels.
    const score = computeScore$1(pattern, {
      errors: i + 1,
      currentLocation: expectedLocation,
      expectedLocation,
      distance,
      ignoreLocation
    });

    if (score > currentThreshold) {
      break
    }

    lastBitArr = bitArr;
  }

  const result = {
    isMatch: bestLocation >= 0,
    // Count exact matches (those with a score of 0) to be "almost" exact
    score: Math.max(0.001, finalScore)
  };

  if (computeMatches) {
    const indices = convertMaskToIndices(matchMask, minMatchCharLength);
    if (!indices.length) {
      result.isMatch = false;
    } else if (includeMatches) {
      result.indices = indices;
    }
  }

  return result
}

function createPatternAlphabet(pattern) {
  let mask = {};

  for (let i = 0, len = pattern.length; i < len; i += 1) {
    const char = pattern.charAt(i);
    mask[char] = (mask[char] || 0) | (1 << (len - i - 1));
  }

  return mask
}

class BitapSearch {
  constructor(
    pattern,
    {
      location = Config.location,
      threshold = Config.threshold,
      distance = Config.distance,
      includeMatches = Config.includeMatches,
      findAllMatches = Config.findAllMatches,
      minMatchCharLength = Config.minMatchCharLength,
      isCaseSensitive = Config.isCaseSensitive,
      ignoreLocation = Config.ignoreLocation
    } = {}
  ) {
    this.options = {
      location,
      threshold,
      distance,
      includeMatches,
      findAllMatches,
      minMatchCharLength,
      isCaseSensitive,
      ignoreLocation
    };

    this.pattern = isCaseSensitive ? pattern : pattern.toLowerCase();

    this.chunks = [];

    if (!this.pattern.length) {
      return
    }

    const addChunk = (pattern, startIndex) => {
      this.chunks.push({
        pattern,
        alphabet: createPatternAlphabet(pattern),
        startIndex
      });
    };

    const len = this.pattern.length;

    if (len > MAX_BITS) {
      let i = 0;
      const remainder = len % MAX_BITS;
      const end = len - remainder;

      while (i < end) {
        addChunk(this.pattern.substr(i, MAX_BITS), i);
        i += MAX_BITS;
      }

      if (remainder) {
        const startIndex = len - MAX_BITS;
        addChunk(this.pattern.substr(startIndex), startIndex);
      }
    } else {
      addChunk(this.pattern, 0);
    }
  }

  searchIn(text) {
    const { isCaseSensitive, includeMatches } = this.options;

    if (!isCaseSensitive) {
      text = text.toLowerCase();
    }

    // Exact match
    if (this.pattern === text) {
      let result = {
        isMatch: true,
        score: 0
      };

      if (includeMatches) {
        result.indices = [[0, text.length - 1]];
      }

      return result
    }

    // Otherwise, use Bitap algorithm
    const {
      location,
      distance,
      threshold,
      findAllMatches,
      minMatchCharLength,
      ignoreLocation
    } = this.options;

    let allIndices = [];
    let totalScore = 0;
    let hasMatches = false;

    this.chunks.forEach(({ pattern, alphabet, startIndex }) => {
      const { isMatch, score, indices } = search(text, pattern, alphabet, {
        location: location + startIndex,
        distance,
        threshold,
        findAllMatches,
        minMatchCharLength,
        includeMatches,
        ignoreLocation
      });

      if (isMatch) {
        hasMatches = true;
      }

      totalScore += score;

      if (isMatch && indices) {
        allIndices = [...allIndices, ...indices];
      }
    });

    let result = {
      isMatch: hasMatches,
      score: hasMatches ? totalScore / this.chunks.length : 1
    };

    if (hasMatches && includeMatches) {
      result.indices = allIndices;
    }

    return result
  }
}

class BaseMatch {
  constructor(pattern) {
    this.pattern = pattern;
  }
  static isMultiMatch(pattern) {
    return getMatch(pattern, this.multiRegex)
  }
  static isSingleMatch(pattern) {
    return getMatch(pattern, this.singleRegex)
  }
  search(/*text*/) {}
}

function getMatch(pattern, exp) {
  const matches = pattern.match(exp);
  return matches ? matches[1] : null
}

// Token: 'file

class ExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'exact'
  }
  static get multiRegex() {
    return /^="(.*)"$/
  }
  static get singleRegex() {
    return /^=(.*)$/
  }
  search(text) {
    const isMatch = text === this.pattern;

    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, this.pattern.length - 1]
    }
  }
}

// Token: !fire

class InverseExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'inverse-exact'
  }
  static get multiRegex() {
    return /^!"(.*)"$/
  }
  static get singleRegex() {
    return /^!(.*)$/
  }
  search(text) {
    const index = text.indexOf(this.pattern);
    const isMatch = index === -1;

    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, text.length - 1]
    }
  }
}

// Token: ^file

class PrefixExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'prefix-exact'
  }
  static get multiRegex() {
    return /^\^"(.*)"$/
  }
  static get singleRegex() {
    return /^\^(.*)$/
  }
  search(text) {
    const isMatch = text.startsWith(this.pattern);

    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, this.pattern.length - 1]
    }
  }
}

// Token: !^fire

class InversePrefixExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'inverse-prefix-exact'
  }
  static get multiRegex() {
    return /^!\^"(.*)"$/
  }
  static get singleRegex() {
    return /^!\^(.*)$/
  }
  search(text) {
    const isMatch = !text.startsWith(this.pattern);

    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, text.length - 1]
    }
  }
}

// Token: .file$

class SuffixExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'suffix-exact'
  }
  static get multiRegex() {
    return /^"(.*)"\$$/
  }
  static get singleRegex() {
    return /^(.*)\$$/
  }
  search(text) {
    const isMatch = text.endsWith(this.pattern);

    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [text.length - this.pattern.length, text.length - 1]
    }
  }
}

// Token: !.file$

class InverseSuffixExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'inverse-suffix-exact'
  }
  static get multiRegex() {
    return /^!"(.*)"\$$/
  }
  static get singleRegex() {
    return /^!(.*)\$$/
  }
  search(text) {
    const isMatch = !text.endsWith(this.pattern);
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, text.length - 1]
    }
  }
}

class FuzzyMatch extends BaseMatch {
  constructor(
    pattern,
    {
      location = Config.location,
      threshold = Config.threshold,
      distance = Config.distance,
      includeMatches = Config.includeMatches,
      findAllMatches = Config.findAllMatches,
      minMatchCharLength = Config.minMatchCharLength,
      isCaseSensitive = Config.isCaseSensitive,
      ignoreLocation = Config.ignoreLocation
    } = {}
  ) {
    super(pattern);
    this._bitapSearch = new BitapSearch(pattern, {
      location,
      threshold,
      distance,
      includeMatches,
      findAllMatches,
      minMatchCharLength,
      isCaseSensitive,
      ignoreLocation
    });
  }
  static get type() {
    return 'fuzzy'
  }
  static get multiRegex() {
    return /^"(.*)"$/
  }
  static get singleRegex() {
    return /^(.*)$/
  }
  search(text) {
    return this._bitapSearch.searchIn(text)
  }
}

// Token: 'file

class IncludeMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'include'
  }
  static get multiRegex() {
    return /^'"(.*)"$/
  }
  static get singleRegex() {
    return /^'(.*)$/
  }
  search(text) {
    let location = 0;
    let index;

    const indices = [];
    const patternLen = this.pattern.length;

    // Get all exact matches
    while ((index = text.indexOf(this.pattern, location)) > -1) {
      location = index + patternLen;
      indices.push([index, location - 1]);
    }

    const isMatch = !!indices.length;

    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices
    }
  }
}

// ❗Order is important. DO NOT CHANGE.
const searchers = [
  ExactMatch,
  IncludeMatch,
  PrefixExactMatch,
  InversePrefixExactMatch,
  InverseSuffixExactMatch,
  SuffixExactMatch,
  InverseExactMatch,
  FuzzyMatch
];

const searchersLen = searchers.length;

// Regex to split by spaces, but keep anything in quotes together
const SPACE_RE = / +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
const OR_TOKEN = '|';

// Return a 2D array representation of the query, for simpler parsing.
// Example:
// "^core go$ | rb$ | py$ xy$" => [["^core", "go$"], ["rb$"], ["py$", "xy$"]]
function parseQuery(pattern, options = {}) {
  return pattern.split(OR_TOKEN).map((item) => {
    let query = item
      .trim()
      .split(SPACE_RE)
      .filter((item) => item && !!item.trim());

    let results = [];
    for (let i = 0, len = query.length; i < len; i += 1) {
      const queryItem = query[i];

      // 1. Handle multiple query match (i.e, once that are quoted, like `"hello world"`)
      let found = false;
      let idx = -1;
      while (!found && ++idx < searchersLen) {
        const searcher = searchers[idx];
        let token = searcher.isMultiMatch(queryItem);
        if (token) {
          results.push(new searcher(token, options));
          found = true;
        }
      }

      if (found) {
        continue
      }

      // 2. Handle single query matches (i.e, once that are *not* quoted)
      idx = -1;
      while (++idx < searchersLen) {
        const searcher = searchers[idx];
        let token = searcher.isSingleMatch(queryItem);
        if (token) {
          results.push(new searcher(token, options));
          break
        }
      }
    }

    return results
  })
}

// These extended matchers can return an array of matches, as opposed
// to a singl match
const MultiMatchSet = new Set([FuzzyMatch.type, IncludeMatch.type]);

/**
 * Command-like searching
 * ======================
 *
 * Given multiple search terms delimited by spaces.e.g. `^jscript .python$ ruby !java`,
 * search in a given text.
 *
 * Search syntax:
 *
 * | Token       | Match type                 | Description                            |
 * | ----------- | -------------------------- | -------------------------------------- |
 * | `jscript`   | fuzzy-match                | Items that fuzzy match `jscript`       |
 * | `=scheme`   | exact-match                | Items that are `scheme`                |
 * | `'python`   | include-match              | Items that include `python`            |
 * | `!ruby`     | inverse-exact-match        | Items that do not include `ruby`       |
 * | `^java`     | prefix-exact-match         | Items that start with `java`           |
 * | `!^earlang` | inverse-prefix-exact-match | Items that do not start with `earlang` |
 * | `.js$`      | suffix-exact-match         | Items that end with `.js`              |
 * | `!.go$`     | inverse-suffix-exact-match | Items that do not end with `.go`       |
 *
 * A single pipe character acts as an OR operator. For example, the following
 * query matches entries that start with `core` and end with either`go`, `rb`,
 * or`py`.
 *
 * ```
 * ^core go$ | rb$ | py$
 * ```
 */
class ExtendedSearch {
  constructor(
    pattern,
    {
      isCaseSensitive = Config.isCaseSensitive,
      includeMatches = Config.includeMatches,
      minMatchCharLength = Config.minMatchCharLength,
      ignoreLocation = Config.ignoreLocation,
      findAllMatches = Config.findAllMatches,
      location = Config.location,
      threshold = Config.threshold,
      distance = Config.distance
    } = {}
  ) {
    this.query = null;
    this.options = {
      isCaseSensitive,
      includeMatches,
      minMatchCharLength,
      findAllMatches,
      ignoreLocation,
      location,
      threshold,
      distance
    };

    this.pattern = isCaseSensitive ? pattern : pattern.toLowerCase();
    this.query = parseQuery(this.pattern, this.options);
  }

  static condition(_, options) {
    return options.useExtendedSearch
  }

  searchIn(text) {
    const query = this.query;

    if (!query) {
      return {
        isMatch: false,
        score: 1
      }
    }

    const { includeMatches, isCaseSensitive } = this.options;

    text = isCaseSensitive ? text : text.toLowerCase();

    let numMatches = 0;
    let allIndices = [];
    let totalScore = 0;

    // ORs
    for (let i = 0, qLen = query.length; i < qLen; i += 1) {
      const searchers = query[i];

      // Reset indices
      allIndices.length = 0;
      numMatches = 0;

      // ANDs
      for (let j = 0, pLen = searchers.length; j < pLen; j += 1) {
        const searcher = searchers[j];
        const { isMatch, indices, score } = searcher.search(text);

        if (isMatch) {
          numMatches += 1;
          totalScore += score;
          if (includeMatches) {
            const type = searcher.constructor.type;
            if (MultiMatchSet.has(type)) {
              allIndices = [...allIndices, ...indices];
            } else {
              allIndices.push(indices);
            }
          }
        } else {
          totalScore = 0;
          numMatches = 0;
          allIndices.length = 0;
          break
        }
      }

      // OR condition, so if TRUE, return
      if (numMatches) {
        let result = {
          isMatch: true,
          score: totalScore / numMatches
        };

        if (includeMatches) {
          result.indices = allIndices;
        }

        return result
      }
    }

    // Nothing was matched
    return {
      isMatch: false,
      score: 1
    }
  }
}

const registeredSearchers = [];

function register(...args) {
  registeredSearchers.push(...args);
}

function createSearcher(pattern, options) {
  for (let i = 0, len = registeredSearchers.length; i < len; i += 1) {
    let searcherClass = registeredSearchers[i];
    if (searcherClass.condition(pattern, options)) {
      return new searcherClass(pattern, options)
    }
  }

  return new BitapSearch(pattern, options)
}

const LogicalOperator = {
  AND: '$and',
  OR: '$or'
};

const KeyType = {
  PATH: '$path',
  PATTERN: '$val'
};

const isExpression = (query) =>
  !!(query[LogicalOperator.AND] || query[LogicalOperator.OR]);

const isPath = (query) => !!query[KeyType.PATH];

const isLeaf = (query) =>
  !isArray$3(query) && isObject$i(query) && !isExpression(query);

const convertToExplicit = (query) => ({
  [LogicalOperator.AND]: Object.keys(query).map((key) => ({
    [key]: query[key]
  }))
});

// When `auto` is `true`, the parse function will infer and initialize and add
// the appropriate `Searcher` instance
function parse(query, options, { auto = true } = {}) {
  const next = (query) => {
    let keys = Object.keys(query);

    const isQueryPath = isPath(query);

    if (!isQueryPath && keys.length > 1 && !isExpression(query)) {
      return next(convertToExplicit(query))
    }

    if (isLeaf(query)) {
      const key = isQueryPath ? query[KeyType.PATH] : keys[0];

      const pattern = isQueryPath ? query[KeyType.PATTERN] : query[key];

      if (!isString(pattern)) {
        throw new Error(LOGICAL_SEARCH_INVALID_QUERY_FOR_KEY(key))
      }

      const obj = {
        keyId: createKeyId(key),
        pattern
      };

      if (auto) {
        obj.searcher = createSearcher(pattern, options);
      }

      return obj
    }

    let node = {
      children: [],
      operator: keys[0]
    };

    keys.forEach((key) => {
      const value = query[key];

      if (isArray$3(value)) {
        value.forEach((item) => {
          node.children.push(next(item));
        });
      }
    });

    return node
  };

  if (!isExpression(query)) {
    query = convertToExplicit(query);
  }

  return next(query)
}

// Practical scoring function
function computeScore(
  results,
  { ignoreFieldNorm = Config.ignoreFieldNorm }
) {
  results.forEach((result) => {
    let totalScore = 1;

    result.matches.forEach(({ key, norm, score }) => {
      const weight = key ? key.weight : null;

      totalScore *= Math.pow(
        score === 0 && weight ? Number.EPSILON : score,
        (weight || 1) * (ignoreFieldNorm ? 1 : norm)
      );
    });

    result.score = totalScore;
  });
}

function transformMatches(result, data) {
  const matches = result.matches;
  data.matches = [];

  if (!isDefined(matches)) {
    return
  }

  matches.forEach((match) => {
    if (!isDefined(match.indices) || !match.indices.length) {
      return
    }

    const { indices, value } = match;

    let obj = {
      indices,
      value
    };

    if (match.key) {
      obj.key = match.key.src;
    }

    if (match.idx > -1) {
      obj.refIndex = match.idx;
    }

    data.matches.push(obj);
  });
}

function transformScore(result, data) {
  data.score = result.score;
}

function format(
  results,
  docs,
  {
    includeMatches = Config.includeMatches,
    includeScore = Config.includeScore
  } = {}
) {
  const transformers = [];

  if (includeMatches) transformers.push(transformMatches);
  if (includeScore) transformers.push(transformScore);

  return results.map((result) => {
    const { idx } = result;

    const data = {
      item: docs[idx],
      refIndex: idx
    };

    if (transformers.length) {
      transformers.forEach((transformer) => {
        transformer(result, data);
      });
    }

    return data
  })
}

class Fuse {
  constructor(docs, options = {}, index) {
    this.options = { ...Config, ...options };

    if (
      this.options.useExtendedSearch &&
      !true
    ) {
      throw new Error(EXTENDED_SEARCH_UNAVAILABLE)
    }

    this._keyStore = new KeyStore(this.options.keys);

    this.setCollection(docs, index);
  }

  setCollection(docs, index) {
    this._docs = docs;

    if (index && !(index instanceof FuseIndex)) {
      throw new Error(INCORRECT_INDEX_TYPE)
    }

    this._myIndex =
      index ||
      createIndex(this.options.keys, this._docs, {
        getFn: this.options.getFn,
        fieldNormWeight: this.options.fieldNormWeight
      });
  }

  add(doc) {
    if (!isDefined(doc)) {
      return
    }

    this._docs.push(doc);
    this._myIndex.add(doc);
  }

  remove(predicate = (/* doc, idx */) => false) {
    const results = [];

    for (let i = 0, len = this._docs.length; i < len; i += 1) {
      const doc = this._docs[i];
      if (predicate(doc, i)) {
        this.removeAt(i);
        i -= 1;
        len -= 1;

        results.push(doc);
      }
    }

    return results
  }

  removeAt(idx) {
    this._docs.splice(idx, 1);
    this._myIndex.removeAt(idx);
  }

  getIndex() {
    return this._myIndex
  }

  search(query, { limit = -1 } = {}) {
    const {
      includeMatches,
      includeScore,
      shouldSort,
      sortFn,
      ignoreFieldNorm
    } = this.options;

    let results = isString(query)
      ? isString(this._docs[0])
        ? this._searchStringList(query)
        : this._searchObjectList(query)
      : this._searchLogical(query);

    computeScore(results, { ignoreFieldNorm });

    if (shouldSort) {
      results.sort(sortFn);
    }

    if (isNumber(limit) && limit > -1) {
      results = results.slice(0, limit);
    }

    return format(results, this._docs, {
      includeMatches,
      includeScore
    })
  }

  _searchStringList(query) {
    const searcher = createSearcher(query, this.options);
    const { records } = this._myIndex;
    const results = [];

    // Iterate over every string in the index
    records.forEach(({ v: text, i: idx, n: norm }) => {
      if (!isDefined(text)) {
        return
      }

      const { isMatch, score, indices } = searcher.searchIn(text);

      if (isMatch) {
        results.push({
          item: text,
          idx,
          matches: [{ score, value: text, norm, indices }]
        });
      }
    });

    return results
  }

  _searchLogical(query) {

    const expression = parse(query, this.options);

    const evaluate = (node, item, idx) => {
      if (!node.children) {
        const { keyId, searcher } = node;

        const matches = this._findMatches({
          key: this._keyStore.get(keyId),
          value: this._myIndex.getValueForItemAtKeyId(item, keyId),
          searcher
        });

        if (matches && matches.length) {
          return [
            {
              idx,
              item,
              matches
            }
          ]
        }

        return []
      }

      const res = [];
      for (let i = 0, len = node.children.length; i < len; i += 1) {
        const child = node.children[i];
        const result = evaluate(child, item, idx);
        if (result.length) {
          res.push(...result);
        } else if (node.operator === LogicalOperator.AND) {
          return []
        }
      }
      return res
    };

    const records = this._myIndex.records;
    const resultMap = {};
    const results = [];

    records.forEach(({ $: item, i: idx }) => {
      if (isDefined(item)) {
        let expResults = evaluate(expression, item, idx);

        if (expResults.length) {
          // Dedupe when adding
          if (!resultMap[idx]) {
            resultMap[idx] = { idx, item, matches: [] };
            results.push(resultMap[idx]);
          }
          expResults.forEach(({ matches }) => {
            resultMap[idx].matches.push(...matches);
          });
        }
      }
    });

    return results
  }

  _searchObjectList(query) {
    const searcher = createSearcher(query, this.options);
    const { keys, records } = this._myIndex;
    const results = [];

    // List is Array<Object>
    records.forEach(({ $: item, i: idx }) => {
      if (!isDefined(item)) {
        return
      }

      let matches = [];

      // Iterate over every key (i.e, path), and fetch the value at that key
      keys.forEach((key, keyIndex) => {
        matches.push(
          ...this._findMatches({
            key,
            value: item[keyIndex],
            searcher
          })
        );
      });

      if (matches.length) {
        results.push({
          idx,
          item,
          matches
        });
      }
    });

    return results
  }
  _findMatches({ key, value, searcher }) {
    if (!isDefined(value)) {
      return []
    }

    let matches = [];

    if (isArray$3(value)) {
      value.forEach(({ v: text, i: idx, n: norm }) => {
        if (!isDefined(text)) {
          return
        }

        const { isMatch, score, indices } = searcher.searchIn(text);

        if (isMatch) {
          matches.push({
            score,
            key,
            value: text,
            idx,
            norm,
            indices
          });
        }
      });
    } else {
      const { v: text, n: norm } = value;

      const { isMatch, score, indices } = searcher.searchIn(text);

      if (isMatch) {
        matches.push({ score, key, value: text, norm, indices });
      }
    }

    return matches
  }
}

Fuse.version = '6.6.2';
Fuse.createIndex = createIndex;
Fuse.parseIndex = parseIndex;
Fuse.config = Config;

{
  Fuse.parseQuery = parse;
}

{
  register(ExtendedSearch);
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var check = function (it) {
  return it && it.Math === Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global$l =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || Function('return this')();

var shared$4 = {exports: {}};

var global$k = global$l;

// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty$7 = Object.defineProperty;

var defineGlobalProperty$3 = function (key, value) {
  try {
    defineProperty$7(global$k, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    global$k[key] = value;
  } return value;
};

var global$j = global$l;
var defineGlobalProperty$2 = defineGlobalProperty$3;

var SHARED = '__core-js_shared__';
var store$3 = global$j[SHARED] || defineGlobalProperty$2(SHARED, {});

var sharedStore = store$3;

var store$2 = sharedStore;

(shared$4.exports = function (key, value) {
  return store$2[key] || (store$2[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.35.0',
  mode: 'global',
  copyright: '© 2014-2023 Denis Pushkarev (zloirock.ru)',
  license: 'https://github.com/zloirock/core-js/blob/v3.35.0/LICENSE',
  source: 'https://github.com/zloirock/core-js'
});

var sharedExports = shared$4.exports;

var fails$p = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

var fails$o = fails$p;

var functionBindNative = !fails$o(function () {
  // eslint-disable-next-line es/no-function-prototype-bind -- safe
  var test = (function () { /* empty */ }).bind();
  // eslint-disable-next-line no-prototype-builtins -- safe
  return typeof test != 'function' || test.hasOwnProperty('prototype');
});

var NATIVE_BIND$3 = functionBindNative;

var FunctionPrototype$3 = Function.prototype;
var call$e = FunctionPrototype$3.call;
var uncurryThisWithBind = NATIVE_BIND$3 && FunctionPrototype$3.bind.bind(call$e, call$e);

var functionUncurryThis = NATIVE_BIND$3 ? uncurryThisWithBind : function (fn) {
  return function () {
    return call$e.apply(fn, arguments);
  };
};

// we can't use just `it == null` since of `document.all` special case
// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
var isNullOrUndefined$7 = function (it) {
  return it === null || it === undefined;
};

var isNullOrUndefined$6 = isNullOrUndefined$7;

var $TypeError$b = TypeError;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible$6 = function (it) {
  if (isNullOrUndefined$6(it)) throw new $TypeError$b("Can't call method on " + it);
  return it;
};

var requireObjectCoercible$5 = requireObjectCoercible$6;

var $Object$5 = Object;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
var toObject$6 = function (argument) {
  return $Object$5(requireObjectCoercible$5(argument));
};

var uncurryThis$r = functionUncurryThis;
var toObject$5 = toObject$6;

var hasOwnProperty$1 = uncurryThis$r({}.hasOwnProperty);

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
// eslint-disable-next-line es/no-object-hasown -- safe
var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty$1(toObject$5(it), key);
};

var uncurryThis$q = functionUncurryThis;

var id$2 = 0;
var postfix = Math.random();
var toString$a = uncurryThis$q(1.0.toString);

var uid$3 = function (key) {
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString$a(++id$2 + postfix, 36);
};

var engineUserAgent = typeof navigator != 'undefined' && String(navigator.userAgent) || '';

var global$i = global$l;
var userAgent = engineUserAgent;

var process$1 = global$i.process;
var Deno = global$i.Deno;
var versions = process$1 && process$1.versions || Deno && Deno.version;
var v8 = versions && versions.v8;
var match, version$1;

if (v8) {
  match = v8.split('.');
  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
  // but their correct versions are not interesting for us
  version$1 = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
}

// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
// so check `userAgent` even if `.v8` exists, but 0
if (!version$1 && userAgent) {
  match = userAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent.match(/Chrome\/(\d+)/);
    if (match) version$1 = +match[1];
  }
}

var engineV8Version = version$1;

/* eslint-disable es/no-symbol -- required for testing */
var V8_VERSION$1 = engineV8Version;
var fails$n = fails$p;
var global$h = global$l;

var $String$5 = global$h.String;

// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
var symbolConstructorDetection = !!Object.getOwnPropertySymbols && !fails$n(function () {
  var symbol = Symbol('symbol detection');
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
  // of course, fail.
  return !$String$5(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && V8_VERSION$1 && V8_VERSION$1 < 41;
});

/* eslint-disable es/no-symbol -- required for testing */
var NATIVE_SYMBOL$1 = symbolConstructorDetection;

var useSymbolAsUid = NATIVE_SYMBOL$1
  && !Symbol.sham
  && typeof Symbol.iterator == 'symbol';

var global$g = global$l;
var shared$3 = sharedExports;
var hasOwn$a = hasOwnProperty_1;
var uid$2 = uid$3;
var NATIVE_SYMBOL = symbolConstructorDetection;
var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;

var Symbol$2 = global$g.Symbol;
var WellKnownSymbolsStore = shared$3('wks');
var createWellKnownSymbol = USE_SYMBOL_AS_UID$1 ? Symbol$2['for'] || Symbol$2 : Symbol$2 && Symbol$2.withoutSetter || uid$2;

var wellKnownSymbol$f = function (name) {
  if (!hasOwn$a(WellKnownSymbolsStore, name)) {
    WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn$a(Symbol$2, name)
      ? Symbol$2[name]
      : createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore[name];
};

var wellKnownSymbol$e = wellKnownSymbol$f;

var TO_STRING_TAG$2 = wellKnownSymbol$e('toStringTag');
var test = {};

test[TO_STRING_TAG$2] = 'z';

var toStringTagSupport = String(test) === '[object z]';

// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
var documentAll = typeof document == 'object' && document.all;

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
// eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
var isCallable$j = typeof documentAll == 'undefined' && documentAll !== undefined ? function (argument) {
  return typeof argument == 'function' || argument === documentAll;
} : function (argument) {
  return typeof argument == 'function';
};

var objectDefineProperty = {};

var fails$m = fails$p;

// Detect IE8's incomplete defineProperty implementation
var descriptors = !fails$m(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] !== 7;
});

var isCallable$i = isCallable$j;

var isObject$h = function (it) {
  return typeof it == 'object' ? it !== null : isCallable$i(it);
};

var global$f = global$l;
var isObject$g = isObject$h;

var document$1 = global$f.document;
// typeof document.createElement is 'object' in old IE
var EXISTS$1 = isObject$g(document$1) && isObject$g(document$1.createElement);

var documentCreateElement$2 = function (it) {
  return EXISTS$1 ? document$1.createElement(it) : {};
};

var DESCRIPTORS$a = descriptors;
var fails$l = fails$p;
var createElement = documentCreateElement$2;

// Thanks to IE8 for its funny defineProperty
var ie8DomDefine = !DESCRIPTORS$a && !fails$l(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a !== 7;
});

var DESCRIPTORS$9 = descriptors;
var fails$k = fails$p;

// V8 ~ Chrome 36-
// https://bugs.chromium.org/p/v8/issues/detail?id=3334
var v8PrototypeDefineBug = DESCRIPTORS$9 && fails$k(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype !== 42;
});

var isObject$f = isObject$h;

var $String$4 = String;
var $TypeError$a = TypeError;

// `Assert: Type(argument) is Object`
var anObject$d = function (argument) {
  if (isObject$f(argument)) return argument;
  throw new $TypeError$a($String$4(argument) + ' is not an object');
};

var NATIVE_BIND$2 = functionBindNative;

var call$d = Function.prototype.call;

var functionCall = NATIVE_BIND$2 ? call$d.bind(call$d) : function () {
  return call$d.apply(call$d, arguments);
};

var global$e = global$l;
var isCallable$h = isCallable$j;

var aFunction = function (argument) {
  return isCallable$h(argument) ? argument : undefined;
};

var getBuiltIn$4 = function (namespace, method) {
  return arguments.length < 2 ? aFunction(global$e[namespace]) : global$e[namespace] && global$e[namespace][method];
};

var uncurryThis$p = functionUncurryThis;

var objectIsPrototypeOf = uncurryThis$p({}.isPrototypeOf);

var getBuiltIn$3 = getBuiltIn$4;
var isCallable$g = isCallable$j;
var isPrototypeOf$2 = objectIsPrototypeOf;
var USE_SYMBOL_AS_UID = useSymbolAsUid;

var $Object$4 = Object;

var isSymbol$4 = USE_SYMBOL_AS_UID ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn$3('Symbol');
  return isCallable$g($Symbol) && isPrototypeOf$2($Symbol.prototype, $Object$4(it));
};

var $String$3 = String;

var tryToString$3 = function (argument) {
  try {
    return $String$3(argument);
  } catch (error) {
    return 'Object';
  }
};

var isCallable$f = isCallable$j;
var tryToString$2 = tryToString$3;

var $TypeError$9 = TypeError;

// `Assert: IsCallable(argument) is true`
var aCallable$5 = function (argument) {
  if (isCallable$f(argument)) return argument;
  throw new $TypeError$9(tryToString$2(argument) + ' is not a function');
};

var aCallable$4 = aCallable$5;
var isNullOrUndefined$5 = isNullOrUndefined$7;

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
var getMethod$5 = function (V, P) {
  var func = V[P];
  return isNullOrUndefined$5(func) ? undefined : aCallable$4(func);
};

var call$c = functionCall;
var isCallable$e = isCallable$j;
var isObject$e = isObject$h;

var $TypeError$8 = TypeError;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
var ordinaryToPrimitive$1 = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable$e(fn = input.toString) && !isObject$e(val = call$c(fn, input))) return val;
  if (isCallable$e(fn = input.valueOf) && !isObject$e(val = call$c(fn, input))) return val;
  if (pref !== 'string' && isCallable$e(fn = input.toString) && !isObject$e(val = call$c(fn, input))) return val;
  throw new $TypeError$8("Can't convert object to primitive value");
};

var call$b = functionCall;
var isObject$d = isObject$h;
var isSymbol$3 = isSymbol$4;
var getMethod$4 = getMethod$5;
var ordinaryToPrimitive = ordinaryToPrimitive$1;
var wellKnownSymbol$d = wellKnownSymbol$f;

var $TypeError$7 = TypeError;
var TO_PRIMITIVE = wellKnownSymbol$d('toPrimitive');

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
var toPrimitive$1 = function (input, pref) {
  if (!isObject$d(input) || isSymbol$3(input)) return input;
  var exoticToPrim = getMethod$4(input, TO_PRIMITIVE);
  var result;
  if (exoticToPrim) {
    if (pref === undefined) pref = 'default';
    result = call$b(exoticToPrim, input, pref);
    if (!isObject$d(result) || isSymbol$3(result)) return result;
    throw new $TypeError$7("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive(input, pref);
};

var toPrimitive = toPrimitive$1;
var isSymbol$2 = isSymbol$4;

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
var toPropertyKey$2 = function (argument) {
  var key = toPrimitive(argument, 'string');
  return isSymbol$2(key) ? key : key + '';
};

var DESCRIPTORS$8 = descriptors;
var IE8_DOM_DEFINE$1 = ie8DomDefine;
var V8_PROTOTYPE_DEFINE_BUG$1 = v8PrototypeDefineBug;
var anObject$c = anObject$d;
var toPropertyKey$1 = toPropertyKey$2;

var $TypeError$6 = TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty = Object.defineProperty;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;
var ENUMERABLE = 'enumerable';
var CONFIGURABLE$1 = 'configurable';
var WRITABLE = 'writable';

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
objectDefineProperty.f = DESCRIPTORS$8 ? V8_PROTOTYPE_DEFINE_BUG$1 ? function defineProperty(O, P, Attributes) {
  anObject$c(O);
  P = toPropertyKey$1(P);
  anObject$c(Attributes);
  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
    var current = $getOwnPropertyDescriptor$1(O, P);
    if (current && current[WRITABLE]) {
      O[P] = Attributes.value;
      Attributes = {
        configurable: CONFIGURABLE$1 in Attributes ? Attributes[CONFIGURABLE$1] : current[CONFIGURABLE$1],
        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
        writable: false
      };
    }
  } return $defineProperty(O, P, Attributes);
} : $defineProperty : function defineProperty(O, P, Attributes) {
  anObject$c(O);
  P = toPropertyKey$1(P);
  anObject$c(Attributes);
  if (IE8_DOM_DEFINE$1) try {
    return $defineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw new $TypeError$6('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var makeBuiltIn$3 = {exports: {}};

var DESCRIPTORS$7 = descriptors;
var hasOwn$9 = hasOwnProperty_1;

var FunctionPrototype$2 = Function.prototype;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getDescriptor = DESCRIPTORS$7 && Object.getOwnPropertyDescriptor;

var EXISTS = hasOwn$9(FunctionPrototype$2, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
var CONFIGURABLE = EXISTS && (!DESCRIPTORS$7 || (DESCRIPTORS$7 && getDescriptor(FunctionPrototype$2, 'name').configurable));

var functionName = {
  EXISTS: EXISTS,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE
};

var uncurryThis$o = functionUncurryThis;
var isCallable$d = isCallable$j;
var store$1 = sharedStore;

var functionToString$1 = uncurryThis$o(Function.toString);

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable$d(store$1.inspectSource)) {
  store$1.inspectSource = function (it) {
    return functionToString$1(it);
  };
}

var inspectSource$2 = store$1.inspectSource;

var global$d = global$l;
var isCallable$c = isCallable$j;

var WeakMap$2 = global$d.WeakMap;

var weakMapBasicDetection = isCallable$c(WeakMap$2) && /native code/.test(String(WeakMap$2));

var createPropertyDescriptor$3 = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var DESCRIPTORS$6 = descriptors;
var definePropertyModule$3 = objectDefineProperty;
var createPropertyDescriptor$2 = createPropertyDescriptor$3;

var createNonEnumerableProperty$6 = DESCRIPTORS$6 ? function (object, key, value) {
  return definePropertyModule$3.f(object, key, createPropertyDescriptor$2(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var shared$2 = sharedExports;
var uid$1 = uid$3;

var keys = shared$2('keys');

var sharedKey$3 = function (key) {
  return keys[key] || (keys[key] = uid$1(key));
};

var hiddenKeys$5 = {};

var NATIVE_WEAK_MAP$1 = weakMapBasicDetection;
var global$c = global$l;
var isObject$c = isObject$h;
var createNonEnumerableProperty$5 = createNonEnumerableProperty$6;
var hasOwn$8 = hasOwnProperty_1;
var shared$1 = sharedStore;
var sharedKey$2 = sharedKey$3;
var hiddenKeys$4 = hiddenKeys$5;

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var TypeError$1 = global$c.TypeError;
var WeakMap$1 = global$c.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject$c(it) || (state = get(it)).type !== TYPE) {
      throw new TypeError$1('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP$1 || shared$1.state) {
  var store = shared$1.state || (shared$1.state = new WeakMap$1());
  /* eslint-disable no-self-assign -- prototype methods protection */
  store.get = store.get;
  store.has = store.has;
  store.set = store.set;
  /* eslint-enable no-self-assign -- prototype methods protection */
  set = function (it, metadata) {
    if (store.has(it)) throw new TypeError$1(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    store.set(it, metadata);
    return metadata;
  };
  get = function (it) {
    return store.get(it) || {};
  };
  has = function (it) {
    return store.has(it);
  };
} else {
  var STATE = sharedKey$2('state');
  hiddenKeys$4[STATE] = true;
  set = function (it, metadata) {
    if (hasOwn$8(it, STATE)) throw new TypeError$1(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty$5(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return hasOwn$8(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return hasOwn$8(it, STATE);
  };
}

var internalState = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};

var uncurryThis$n = functionUncurryThis;
var fails$j = fails$p;
var isCallable$b = isCallable$j;
var hasOwn$7 = hasOwnProperty_1;
var DESCRIPTORS$5 = descriptors;
var CONFIGURABLE_FUNCTION_NAME$1 = functionName.CONFIGURABLE;
var inspectSource$1 = inspectSource$2;
var InternalStateModule$3 = internalState;

var enforceInternalState$1 = InternalStateModule$3.enforce;
var getInternalState$3 = InternalStateModule$3.get;
var $String$2 = String;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty$6 = Object.defineProperty;
var stringSlice$5 = uncurryThis$n(''.slice);
var replace$3 = uncurryThis$n(''.replace);
var join = uncurryThis$n([].join);

var CONFIGURABLE_LENGTH = DESCRIPTORS$5 && !fails$j(function () {
  return defineProperty$6(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
});

var TEMPLATE = String(String).split('String');

var makeBuiltIn$2 = makeBuiltIn$3.exports = function (value, name, options) {
  if (stringSlice$5($String$2(name), 0, 7) === 'Symbol(') {
    name = '[' + replace$3($String$2(name), /^Symbol\(([^)]*)\)/, '$1') + ']';
  }
  if (options && options.getter) name = 'get ' + name;
  if (options && options.setter) name = 'set ' + name;
  if (!hasOwn$7(value, 'name') || (CONFIGURABLE_FUNCTION_NAME$1 && value.name !== name)) {
    if (DESCRIPTORS$5) defineProperty$6(value, 'name', { value: name, configurable: true });
    else value.name = name;
  }
  if (CONFIGURABLE_LENGTH && options && hasOwn$7(options, 'arity') && value.length !== options.arity) {
    defineProperty$6(value, 'length', { value: options.arity });
  }
  try {
    if (options && hasOwn$7(options, 'constructor') && options.constructor) {
      if (DESCRIPTORS$5) defineProperty$6(value, 'prototype', { writable: false });
    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
    } else if (value.prototype) value.prototype = undefined;
  } catch (error) { /* empty */ }
  var state = enforceInternalState$1(value);
  if (!hasOwn$7(state, 'source')) {
    state.source = join(TEMPLATE, typeof name == 'string' ? name : '');
  } return value;
};

// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
// eslint-disable-next-line no-extend-native -- required
Function.prototype.toString = makeBuiltIn$2(function toString() {
  return isCallable$b(this) && getInternalState$3(this).source || inspectSource$1(this);
}, 'toString');

var makeBuiltInExports = makeBuiltIn$3.exports;

var isCallable$a = isCallable$j;
var definePropertyModule$2 = objectDefineProperty;
var makeBuiltIn$1 = makeBuiltInExports;
var defineGlobalProperty$1 = defineGlobalProperty$3;

var defineBuiltIn$7 = function (O, key, value, options) {
  if (!options) options = {};
  var simple = options.enumerable;
  var name = options.name !== undefined ? options.name : key;
  if (isCallable$a(value)) makeBuiltIn$1(value, name, options);
  if (options.global) {
    if (simple) O[key] = value;
    else defineGlobalProperty$1(key, value);
  } else {
    try {
      if (!options.unsafe) delete O[key];
      else if (O[key]) simple = true;
    } catch (error) { /* empty */ }
    if (simple) O[key] = value;
    else definePropertyModule$2.f(O, key, {
      value: value,
      enumerable: false,
      configurable: !options.nonConfigurable,
      writable: !options.nonWritable
    });
  } return O;
};

var uncurryThis$m = functionUncurryThis;

var toString$9 = uncurryThis$m({}.toString);
var stringSlice$4 = uncurryThis$m(''.slice);

var classofRaw$2 = function (it) {
  return stringSlice$4(toString$9(it), 8, -1);
};

var TO_STRING_TAG_SUPPORT$2 = toStringTagSupport;
var isCallable$9 = isCallable$j;
var classofRaw$1 = classofRaw$2;
var wellKnownSymbol$c = wellKnownSymbol$f;

var TO_STRING_TAG$1 = wellKnownSymbol$c('toStringTag');
var $Object$3 = Object;

// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw$1(function () { return arguments; }()) === 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
var classof$a = TO_STRING_TAG_SUPPORT$2 ? classofRaw$1 : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = $Object$3(it), TO_STRING_TAG$1)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw$1(O)
    // ES3 arguments fallback
    : (result = classofRaw$1(O)) === 'Object' && isCallable$9(O.callee) ? 'Arguments' : result;
};

var TO_STRING_TAG_SUPPORT$1 = toStringTagSupport;
var classof$9 = classof$a;

// `Object.prototype.toString` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.tostring
var objectToString$3 = TO_STRING_TAG_SUPPORT$1 ? {}.toString : function toString() {
  return '[object ' + classof$9(this) + ']';
};

var TO_STRING_TAG_SUPPORT = toStringTagSupport;
var defineBuiltIn$6 = defineBuiltIn$7;
var toString$8 = objectToString$3;

// `Object.prototype.toString` method
// https://tc39.es/ecma262/#sec-object.prototype.tostring
if (!TO_STRING_TAG_SUPPORT) {
  defineBuiltIn$6(Object.prototype, 'toString', toString$8, { unsafe: true });
}

// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
var domIterables = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};

// in old WebKit versions, `element.classList` is not an instance of global `DOMTokenList`
var documentCreateElement$1 = documentCreateElement$2;

var classList = documentCreateElement$1('span').classList;
var DOMTokenListPrototype$2 = classList && classList.constructor && classList.constructor.prototype;

var domTokenListPrototype = DOMTokenListPrototype$2 === Object.prototype ? undefined : DOMTokenListPrototype$2;

var classofRaw = classofRaw$2;
var uncurryThis$l = functionUncurryThis;

var functionUncurryThisClause = function (fn) {
  // Nashorn bug:
  //   https://github.com/zloirock/core-js/issues/1128
  //   https://github.com/zloirock/core-js/issues/1130
  if (classofRaw(fn) === 'Function') return uncurryThis$l(fn);
};

var uncurryThis$k = functionUncurryThisClause;
var aCallable$3 = aCallable$5;
var NATIVE_BIND$1 = functionBindNative;

var bind$2 = uncurryThis$k(uncurryThis$k.bind);

// optional / simple context binding
var functionBindContext = function (fn, that) {
  aCallable$3(fn);
  return that === undefined ? fn : NATIVE_BIND$1 ? bind$2(fn, that) : function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var uncurryThis$j = functionUncurryThis;
var fails$i = fails$p;
var classof$8 = classofRaw$2;

var $Object$2 = Object;
var split = uncurryThis$j(''.split);

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var indexedObject = fails$i(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !$Object$2('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof$8(it) === 'String' ? split(it, '') : $Object$2(it);
} : $Object$2;

var ceil = Math.ceil;
var floor$1 = Math.floor;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
// eslint-disable-next-line es/no-math-trunc -- safe
var mathTrunc = Math.trunc || function trunc(x) {
  var n = +x;
  return (n > 0 ? floor$1 : ceil)(n);
};

var trunc = mathTrunc;

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
var toIntegerOrInfinity$4 = function (argument) {
  var number = +argument;
  // eslint-disable-next-line no-self-compare -- NaN check
  return number !== number || number === 0 ? 0 : trunc(number);
};

var toIntegerOrInfinity$3 = toIntegerOrInfinity$4;

var min$2 = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
var toLength$3 = function (argument) {
  return argument > 0 ? min$2(toIntegerOrInfinity$3(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

var toLength$2 = toLength$3;

// `LengthOfArrayLike` abstract operation
// https://tc39.es/ecma262/#sec-lengthofarraylike
var lengthOfArrayLike$4 = function (obj) {
  return toLength$2(obj.length);
};

var classof$7 = classofRaw$2;

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
// eslint-disable-next-line es/no-array-isarray -- safe
var isArray$2 = Array.isArray || function isArray(argument) {
  return classof$7(argument) === 'Array';
};

var uncurryThis$i = functionUncurryThis;
var fails$h = fails$p;
var isCallable$8 = isCallable$j;
var classof$6 = classof$a;
var getBuiltIn$2 = getBuiltIn$4;
var inspectSource = inspectSource$2;

var noop = function () { /* empty */ };
var empty = [];
var construct = getBuiltIn$2('Reflect', 'construct');
var constructorRegExp = /^\s*(?:class|function)\b/;
var exec$2 = uncurryThis$i(constructorRegExp.exec);
var INCORRECT_TO_STRING = !constructorRegExp.test(noop);

var isConstructorModern = function isConstructor(argument) {
  if (!isCallable$8(argument)) return false;
  try {
    construct(noop, empty, argument);
    return true;
  } catch (error) {
    return false;
  }
};

var isConstructorLegacy = function isConstructor(argument) {
  if (!isCallable$8(argument)) return false;
  switch (classof$6(argument)) {
    case 'AsyncFunction':
    case 'GeneratorFunction':
    case 'AsyncGeneratorFunction': return false;
  }
  try {
    // we can't check .prototype since constructors produced by .bind haven't it
    // `Function#toString` throws on some built-it function in some legacy engines
    // (for example, `DOMQuad` and similar in FF41-)
    return INCORRECT_TO_STRING || !!exec$2(constructorRegExp, inspectSource(argument));
  } catch (error) {
    return true;
  }
};

isConstructorLegacy.sham = true;

// `IsConstructor` abstract operation
// https://tc39.es/ecma262/#sec-isconstructor
var isConstructor$1 = !construct || fails$h(function () {
  var called;
  return isConstructorModern(isConstructorModern.call)
    || !isConstructorModern(Object)
    || !isConstructorModern(function () { called = true; })
    || called;
}) ? isConstructorLegacy : isConstructorModern;

var isArray$1 = isArray$2;
var isConstructor = isConstructor$1;
var isObject$b = isObject$h;
var wellKnownSymbol$b = wellKnownSymbol$f;

var SPECIES$2 = wellKnownSymbol$b('species');
var $Array = Array;

// a part of `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesConstructor$1 = function (originalArray) {
  var C;
  if (isArray$1(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (isConstructor(C) && (C === $Array || isArray$1(C.prototype))) C = undefined;
    else if (isObject$b(C)) {
      C = C[SPECIES$2];
      if (C === null) C = undefined;
    }
  } return C === undefined ? $Array : C;
};

var arraySpeciesConstructor = arraySpeciesConstructor$1;

// `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesCreate$1 = function (originalArray, length) {
  return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
};

var bind$1 = functionBindContext;
var uncurryThis$h = functionUncurryThis;
var IndexedObject$3 = indexedObject;
var toObject$4 = toObject$6;
var lengthOfArrayLike$3 = lengthOfArrayLike$4;
var arraySpeciesCreate = arraySpeciesCreate$1;

var push$2 = uncurryThis$h([].push);

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
var createMethod$4 = function (TYPE) {
  var IS_MAP = TYPE === 1;
  var IS_FILTER = TYPE === 2;
  var IS_SOME = TYPE === 3;
  var IS_EVERY = TYPE === 4;
  var IS_FIND_INDEX = TYPE === 6;
  var IS_FILTER_REJECT = TYPE === 7;
  var NO_HOLES = TYPE === 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject$4($this);
    var self = IndexedObject$3(O);
    var length = lengthOfArrayLike$3(self);
    var boundFunction = bind$1(callbackfn, that);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate;
    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_REJECT ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: push$2(target, value);      // filter
        } else switch (TYPE) {
          case 4: return false;             // every
          case 7: push$2(target, value);      // filterReject
        }
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

var arrayIteration = {
  // `Array.prototype.forEach` method
  // https://tc39.es/ecma262/#sec-array.prototype.foreach
  forEach: createMethod$4(0),
  // `Array.prototype.map` method
  // https://tc39.es/ecma262/#sec-array.prototype.map
  map: createMethod$4(1),
  // `Array.prototype.filter` method
  // https://tc39.es/ecma262/#sec-array.prototype.filter
  filter: createMethod$4(2),
  // `Array.prototype.some` method
  // https://tc39.es/ecma262/#sec-array.prototype.some
  some: createMethod$4(3),
  // `Array.prototype.every` method
  // https://tc39.es/ecma262/#sec-array.prototype.every
  every: createMethod$4(4),
  // `Array.prototype.find` method
  // https://tc39.es/ecma262/#sec-array.prototype.find
  find: createMethod$4(5),
  // `Array.prototype.findIndex` method
  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod$4(6),
  // `Array.prototype.filterReject` method
  // https://github.com/tc39/proposal-array-filtering
  filterReject: createMethod$4(7)
};

var fails$g = fails$p;

var arrayMethodIsStrict$2 = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails$g(function () {
    // eslint-disable-next-line no-useless-call -- required for testing
    method.call(null, argument || function () { return 1; }, 1);
  });
};

var $forEach = arrayIteration.forEach;
var arrayMethodIsStrict$1 = arrayMethodIsStrict$2;

var STRICT_METHOD = arrayMethodIsStrict$1('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.foreach
var arrayForEach = !STRICT_METHOD ? function forEach(callbackfn /* , thisArg */) {
  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
// eslint-disable-next-line es/no-array-prototype-foreach -- safe
} : [].forEach;

var global$b = global$l;
var DOMIterables$1 = domIterables;
var DOMTokenListPrototype$1 = domTokenListPrototype;
var forEach = arrayForEach;
var createNonEnumerableProperty$4 = createNonEnumerableProperty$6;

var handlePrototype$1 = function (CollectionPrototype) {
  // some Chrome versions have non-configurable methods on DOMTokenList
  if (CollectionPrototype && CollectionPrototype.forEach !== forEach) try {
    createNonEnumerableProperty$4(CollectionPrototype, 'forEach', forEach);
  } catch (error) {
    CollectionPrototype.forEach = forEach;
  }
};

for (var COLLECTION_NAME$1 in DOMIterables$1) {
  if (DOMIterables$1[COLLECTION_NAME$1]) {
    handlePrototype$1(global$b[COLLECTION_NAME$1] && global$b[COLLECTION_NAME$1].prototype);
  }
}

handlePrototype$1(DOMTokenListPrototype$1);

var canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

var canUseDom = canUseDOM;

var canUseDOM$1 = /*@__PURE__*/getDefaultExportFromCjs(canUseDom);

var objectGetOwnPropertyDescriptor = {};

var objectPropertyIsEnumerable = {};

var $propertyIsEnumerable = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor$1 && !$propertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor$1(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable;

// toObject with fallback for non-array-like ES3 strings
var IndexedObject$2 = indexedObject;
var requireObjectCoercible$4 = requireObjectCoercible$6;

var toIndexedObject$6 = function (it) {
  return IndexedObject$2(requireObjectCoercible$4(it));
};

var DESCRIPTORS$4 = descriptors;
var call$a = functionCall;
var propertyIsEnumerableModule$1 = objectPropertyIsEnumerable;
var createPropertyDescriptor$1 = createPropertyDescriptor$3;
var toIndexedObject$5 = toIndexedObject$6;
var toPropertyKey = toPropertyKey$2;
var hasOwn$6 = hasOwnProperty_1;
var IE8_DOM_DEFINE = ie8DomDefine;

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
objectGetOwnPropertyDescriptor.f = DESCRIPTORS$4 ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject$5(O);
  P = toPropertyKey(P);
  if (IE8_DOM_DEFINE) try {
    return $getOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (hasOwn$6(O, P)) return createPropertyDescriptor$1(!call$a(propertyIsEnumerableModule$1.f, O, P), O[P]);
};

var objectGetOwnPropertyNames = {};

var toIntegerOrInfinity$2 = toIntegerOrInfinity$4;

var max$1 = Math.max;
var min$1 = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
var toAbsoluteIndex$1 = function (index, length) {
  var integer = toIntegerOrInfinity$2(index);
  return integer < 0 ? max$1(integer + length, 0) : min$1(integer, length);
};

var toIndexedObject$4 = toIndexedObject$6;
var toAbsoluteIndex = toAbsoluteIndex$1;
var lengthOfArrayLike$2 = lengthOfArrayLike$4;

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod$3 = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject$4($this);
    var length = lengthOfArrayLike$2(O);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el !== el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value !== value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var arrayIncludes = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod$3(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod$3(false)
};

var uncurryThis$g = functionUncurryThis;
var hasOwn$5 = hasOwnProperty_1;
var toIndexedObject$3 = toIndexedObject$6;
var indexOf$1 = arrayIncludes.indexOf;
var hiddenKeys$3 = hiddenKeys$5;

var push$1 = uncurryThis$g([].push);

var objectKeysInternal = function (object, names) {
  var O = toIndexedObject$3(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !hasOwn$5(hiddenKeys$3, key) && hasOwn$5(O, key) && push$1(result, key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (hasOwn$5(O, key = names[i++])) {
    ~indexOf$1(result, key) || push$1(result, key);
  }
  return result;
};

// IE8- don't enum bug keys
var enumBugKeys$3 = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

var internalObjectKeys$1 = objectKeysInternal;
var enumBugKeys$2 = enumBugKeys$3;

var hiddenKeys$2 = enumBugKeys$2.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
// eslint-disable-next-line es/no-object-getownpropertynames -- safe
objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys$1(O, hiddenKeys$2);
};

var objectGetOwnPropertySymbols = {};

// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;

var getBuiltIn$1 = getBuiltIn$4;
var uncurryThis$f = functionUncurryThis;
var getOwnPropertyNamesModule$1 = objectGetOwnPropertyNames;
var getOwnPropertySymbolsModule$1 = objectGetOwnPropertySymbols;
var anObject$b = anObject$d;

var concat$3 = uncurryThis$f([].concat);

// all object keys, includes non-enumerable and symbols
var ownKeys$1 = getBuiltIn$1('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule$1.f(anObject$b(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule$1.f;
  return getOwnPropertySymbols ? concat$3(keys, getOwnPropertySymbols(it)) : keys;
};

var hasOwn$4 = hasOwnProperty_1;
var ownKeys = ownKeys$1;
var getOwnPropertyDescriptorModule = objectGetOwnPropertyDescriptor;
var definePropertyModule$1 = objectDefineProperty;

var copyConstructorProperties$1 = function (target, source, exceptions) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule$1.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!hasOwn$4(target, key) && !(exceptions && hasOwn$4(exceptions, key))) {
      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  }
};

var fails$f = fails$p;
var isCallable$7 = isCallable$j;

var replacement = /#|\.prototype\./;

var isForced$2 = function (feature, detection) {
  var value = data[normalize(feature)];
  return value === POLYFILL ? true
    : value === NATIVE ? false
    : isCallable$7(detection) ? fails$f(detection)
    : !!detection;
};

var normalize = isForced$2.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced$2.data = {};
var NATIVE = isForced$2.NATIVE = 'N';
var POLYFILL = isForced$2.POLYFILL = 'P';

var isForced_1 = isForced$2;

var global$a = global$l;
var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
var createNonEnumerableProperty$3 = createNonEnumerableProperty$6;
var defineBuiltIn$5 = defineBuiltIn$7;
var defineGlobalProperty = defineGlobalProperty$3;
var copyConstructorProperties = copyConstructorProperties$1;
var isForced$1 = isForced_1;

/*
  options.target         - name of the target object
  options.global         - target is the global object
  options.stat           - export as static methods of target
  options.proto          - export as prototype methods of target
  options.real           - real prototype method for the `pure` version
  options.forced         - export even if the native feature is available
  options.bind           - bind methods to the target, required for the `pure` version
  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
  options.sham           - add a flag to not completely full polyfills
  options.enumerable     - export as enumerable property
  options.dontCallGetSet - prevent calling a getter on target
  options.name           - the .name of the function if it does not match the key
*/
var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global$a;
  } else if (STATIC) {
    target = global$a[TARGET] || defineGlobalProperty(TARGET, {});
  } else {
    target = (global$a[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.dontCallGetSet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced$1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty == typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty$3(sourceProperty, 'sham', true);
    }
    defineBuiltIn$5(target, key, sourceProperty, options);
  }
};

var classof$5 = classof$a;

var $String$1 = String;

var toString$7 = function (argument) {
  if (classof$5(argument) === 'Symbol') throw new TypeError('Cannot convert a Symbol value to a string');
  return $String$1(argument);
};

// a string of all valid unicode whitespaces
var whitespaces$2 = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
  '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

var uncurryThis$e = functionUncurryThis;
var requireObjectCoercible$3 = requireObjectCoercible$6;
var toString$6 = toString$7;
var whitespaces$1 = whitespaces$2;

var replace$2 = uncurryThis$e(''.replace);
var ltrim = RegExp('^[' + whitespaces$1 + ']+');
var rtrim = RegExp('(^|[^' + whitespaces$1 + '])[' + whitespaces$1 + ']+$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod$2 = function (TYPE) {
  return function ($this) {
    var string = toString$6(requireObjectCoercible$3($this));
    if (TYPE & 1) string = replace$2(string, ltrim, '');
    if (TYPE & 2) string = replace$2(string, rtrim, '$1');
    return string;
  };
};

var stringTrim = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimstart
  start: createMethod$2(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimend
  end: createMethod$2(2),
  // `String.prototype.trim` method
  // https://tc39.es/ecma262/#sec-string.prototype.trim
  trim: createMethod$2(3)
};

var global$9 = global$l;
var fails$e = fails$p;
var uncurryThis$d = functionUncurryThis;
var toString$5 = toString$7;
var trim = stringTrim.trim;
var whitespaces = whitespaces$2;

var $parseInt$1 = global$9.parseInt;
var Symbol$1 = global$9.Symbol;
var ITERATOR$6 = Symbol$1 && Symbol$1.iterator;
var hex = /^[+-]?0x/i;
var exec$1 = uncurryThis$d(hex.exec);
var FORCED$1 = $parseInt$1(whitespaces + '08') !== 8 || $parseInt$1(whitespaces + '0x16') !== 22
  // MS Edge 18- broken with boxed symbols
  || (ITERATOR$6 && !fails$e(function () { $parseInt$1(Object(ITERATOR$6)); }));

// `parseInt` method
// https://tc39.es/ecma262/#sec-parseint-string-radix
var numberParseInt = FORCED$1 ? function parseInt(string, radix) {
  var S = trim(toString$5(string));
  return $parseInt$1(S, (radix >>> 0) || (exec$1(hex, S) ? 16 : 10));
} : $parseInt$1;

var $$7 = _export;
var $parseInt = numberParseInt;

// `parseInt` method
// https://tc39.es/ecma262/#sec-parseint-string-radix
$$7({ global: true, forced: parseInt !== $parseInt }, {
  parseInt: $parseInt
});

var internalObjectKeys = objectKeysInternal;
var enumBugKeys$1 = enumBugKeys$3;

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
// eslint-disable-next-line es/no-object-keys -- safe
var objectKeys$2 = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys$1);
};

var DESCRIPTORS$3 = descriptors;
var uncurryThis$c = functionUncurryThis;
var call$9 = functionCall;
var fails$d = fails$p;
var objectKeys$1 = objectKeys$2;
var getOwnPropertySymbolsModule = objectGetOwnPropertySymbols;
var propertyIsEnumerableModule = objectPropertyIsEnumerable;
var toObject$3 = toObject$6;
var IndexedObject$1 = indexedObject;

// eslint-disable-next-line es/no-object-assign -- safe
var $assign = Object.assign;
// eslint-disable-next-line es/no-object-defineproperty -- required for testing
var defineProperty$5 = Object.defineProperty;
var concat$2 = uncurryThis$c([].concat);

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
var objectAssign = !$assign || fails$d(function () {
  // should have correct order of operations (Edge bug)
  if (DESCRIPTORS$3 && $assign({ b: 1 }, $assign(defineProperty$5({}, 'a', {
    enumerable: true,
    get: function () {
      defineProperty$5(this, 'b', {
        value: 3,
        enumerable: false
      });
    }
  }), { b: 2 })).b !== 1) return true;
  // should work with symbols and should have deterministic property order (V8 bug)
  var A = {};
  var B = {};
  // eslint-disable-next-line es/no-symbol -- safe
  var symbol = Symbol('assign detection');
  var alphabet = 'abcdefghijklmnopqrst';
  A[symbol] = 7;
  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
  return $assign({}, A)[symbol] !== 7 || objectKeys$1($assign({}, B)).join('') !== alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
  var T = toObject$3(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  var propertyIsEnumerable = propertyIsEnumerableModule.f;
  while (argumentsLength > index) {
    var S = IndexedObject$1(arguments[index++]);
    var keys = getOwnPropertySymbols ? concat$2(objectKeys$1(S), getOwnPropertySymbols(S)) : objectKeys$1(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!DESCRIPTORS$3 || call$9(propertyIsEnumerable, S, key)) T[key] = S[key];
    }
  } return T;
} : $assign;

var $$6 = _export;
var assign = objectAssign;

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
// eslint-disable-next-line es/no-object-assign -- required for testing
$$6({ target: 'Object', stat: true, arity: 2, forced: Object.assign !== assign }, {
  assign: assign
});

var fails$c = fails$p;
var wellKnownSymbol$a = wellKnownSymbol$f;
var V8_VERSION = engineV8Version;

var SPECIES$1 = wellKnownSymbol$a('species');

var arrayMethodHasSpeciesSupport$1 = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return V8_VERSION >= 51 || !fails$c(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES$1] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};

var $$5 = _export;
var $filter = arrayIteration.filter;
var arrayMethodHasSpeciesSupport = arrayMethodHasSpeciesSupport$1;

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter');

// `Array.prototype.filter` method
// https://tc39.es/ecma262/#sec-array.prototype.filter
// with adding support of @@species
$$5({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var objectDefineProperties = {};

var DESCRIPTORS$2 = descriptors;
var V8_PROTOTYPE_DEFINE_BUG = v8PrototypeDefineBug;
var definePropertyModule = objectDefineProperty;
var anObject$a = anObject$d;
var toIndexedObject$2 = toIndexedObject$6;
var objectKeys = objectKeys$2;

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
objectDefineProperties.f = DESCRIPTORS$2 && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject$a(O);
  var props = toIndexedObject$2(Properties);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule.f(O, key = keys[index++], props[key]);
  return O;
};

var getBuiltIn = getBuiltIn$4;

var html$1 = getBuiltIn('document', 'documentElement');

/* global ActiveXObject -- old IE, WSH */
var anObject$9 = anObject$d;
var definePropertiesModule = objectDefineProperties;
var enumBugKeys = enumBugKeys$3;
var hiddenKeys$1 = hiddenKeys$5;
var html = html$1;
var documentCreateElement = documentCreateElement$2;
var sharedKey$1 = sharedKey$3;

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO$1 = sharedKey$1('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    activeXDocument = new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = typeof document != 'undefined'
    ? document.domain && activeXDocument
      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
      : NullProtoObjectViaIFrame()
    : NullProtoObjectViaActiveX(activeXDocument); // WSH
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys$1[IE_PROTO$1] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
// eslint-disable-next-line es/no-object-create -- safe
var objectCreate = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject$9(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO$1] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : definePropertiesModule.f(result, Properties);
};

var wellKnownSymbol$9 = wellKnownSymbol$f;
var create$2 = objectCreate;
var defineProperty$4 = objectDefineProperty.f;

var UNSCOPABLES = wellKnownSymbol$9('unscopables');
var ArrayPrototype$1 = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype$1[UNSCOPABLES] === undefined) {
  defineProperty$4(ArrayPrototype$1, UNSCOPABLES, {
    configurable: true,
    value: create$2(null)
  });
}

// add a key to Array.prototype[@@unscopables]
var addToUnscopables$1 = function (key) {
  ArrayPrototype$1[UNSCOPABLES][key] = true;
};

var iterators = {};

var fails$b = fails$p;

var correctPrototypeGetter = !fails$b(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

var hasOwn$3 = hasOwnProperty_1;
var isCallable$6 = isCallable$j;
var toObject$2 = toObject$6;
var sharedKey = sharedKey$3;
var CORRECT_PROTOTYPE_GETTER = correctPrototypeGetter;

var IE_PROTO = sharedKey('IE_PROTO');
var $Object$1 = Object;
var ObjectPrototype = $Object$1.prototype;

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
// eslint-disable-next-line es/no-object-getprototypeof -- safe
var objectGetPrototypeOf = CORRECT_PROTOTYPE_GETTER ? $Object$1.getPrototypeOf : function (O) {
  var object = toObject$2(O);
  if (hasOwn$3(object, IE_PROTO)) return object[IE_PROTO];
  var constructor = object.constructor;
  if (isCallable$6(constructor) && object instanceof constructor) {
    return constructor.prototype;
  } return object instanceof $Object$1 ? ObjectPrototype : null;
};

var fails$a = fails$p;
var isCallable$5 = isCallable$j;
var isObject$a = isObject$h;
var getPrototypeOf$1 = objectGetPrototypeOf;
var defineBuiltIn$4 = defineBuiltIn$7;
var wellKnownSymbol$8 = wellKnownSymbol$f;

var ITERATOR$5 = wellKnownSymbol$8('iterator');
var BUGGY_SAFARI_ITERATORS$1 = false;

// `%IteratorPrototype%` object
// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype$2, PrototypeOfArrayIteratorPrototype, arrayIterator;

/* eslint-disable es/no-array-prototype-keys -- safe */
if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS$1 = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf$1(getPrototypeOf$1(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype$2 = PrototypeOfArrayIteratorPrototype;
  }
}

var NEW_ITERATOR_PROTOTYPE = !isObject$a(IteratorPrototype$2) || fails$a(function () {
  var test = {};
  // FF44- legacy iterators case
  return IteratorPrototype$2[ITERATOR$5].call(test) !== test;
});

if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype$2 = {};

// `%IteratorPrototype%[@@iterator]()` method
// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
if (!isCallable$5(IteratorPrototype$2[ITERATOR$5])) {
  defineBuiltIn$4(IteratorPrototype$2, ITERATOR$5, function () {
    return this;
  });
}

var iteratorsCore = {
  IteratorPrototype: IteratorPrototype$2,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS$1
};

var defineProperty$3 = objectDefineProperty.f;
var hasOwn$2 = hasOwnProperty_1;
var wellKnownSymbol$7 = wellKnownSymbol$f;

var TO_STRING_TAG = wellKnownSymbol$7('toStringTag');

var setToStringTag$4 = function (target, TAG, STATIC) {
  if (target && !STATIC) target = target.prototype;
  if (target && !hasOwn$2(target, TO_STRING_TAG)) {
    defineProperty$3(target, TO_STRING_TAG, { configurable: true, value: TAG });
  }
};

var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;
var create$1 = objectCreate;
var createPropertyDescriptor = createPropertyDescriptor$3;
var setToStringTag$3 = setToStringTag$4;
var Iterators$4 = iterators;

var returnThis$1 = function () { return this; };

var iteratorCreateConstructor = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create$1(IteratorPrototype$1, { next: createPropertyDescriptor(+!ENUMERABLE_NEXT, next) });
  setToStringTag$3(IteratorConstructor, TO_STRING_TAG, false);
  Iterators$4[TO_STRING_TAG] = returnThis$1;
  return IteratorConstructor;
};

var uncurryThis$b = functionUncurryThis;
var aCallable$2 = aCallable$5;

var functionUncurryThisAccessor = function (object, key, method) {
  try {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    return uncurryThis$b(aCallable$2(Object.getOwnPropertyDescriptor(object, key)[method]));
  } catch (error) { /* empty */ }
};

var isObject$9 = isObject$h;

var isPossiblePrototype$1 = function (argument) {
  return isObject$9(argument) || argument === null;
};

var isPossiblePrototype = isPossiblePrototype$1;

var $String = String;
var $TypeError$5 = TypeError;

var aPossiblePrototype$1 = function (argument) {
  if (isPossiblePrototype(argument)) return argument;
  throw new $TypeError$5("Can't set " + $String(argument) + ' as a prototype');
};

/* eslint-disable no-proto -- safe */
var uncurryThisAccessor = functionUncurryThisAccessor;
var anObject$8 = anObject$d;
var aPossiblePrototype = aPossiblePrototype$1;

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
// eslint-disable-next-line es/no-object-setprototypeof -- safe
var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = uncurryThisAccessor(Object.prototype, '__proto__', 'set');
    setter(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject$8(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

var $$4 = _export;
var call$8 = functionCall;
var FunctionName = functionName;
var isCallable$4 = isCallable$j;
var createIteratorConstructor = iteratorCreateConstructor;
var getPrototypeOf = objectGetPrototypeOf;
var setPrototypeOf$1 = objectSetPrototypeOf;
var setToStringTag$2 = setToStringTag$4;
var createNonEnumerableProperty$2 = createNonEnumerableProperty$6;
var defineBuiltIn$3 = defineBuiltIn$7;
var wellKnownSymbol$6 = wellKnownSymbol$f;
var Iterators$3 = iterators;
var IteratorsCore = iteratorsCore;

var PROPER_FUNCTION_NAME = FunctionName.PROPER;
var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
var IteratorPrototype = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR$4 = wellKnownSymbol$6('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

var iteratorDefine = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND && KIND in IterablePrototype) return IterablePrototype[KIND];

    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    }

    return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR$4]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME === 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
        if (setPrototypeOf$1) {
          setPrototypeOf$1(CurrentIteratorPrototype, IteratorPrototype);
        } else if (!isCallable$4(CurrentIteratorPrototype[ITERATOR$4])) {
          defineBuiltIn$3(CurrentIteratorPrototype, ITERATOR$4, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag$2(CurrentIteratorPrototype, TO_STRING_TAG, true);
    }
  }

  // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
  if (PROPER_FUNCTION_NAME && DEFAULT === VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    if (CONFIGURABLE_FUNCTION_NAME) {
      createNonEnumerableProperty$2(IterablePrototype, 'name', VALUES);
    } else {
      INCORRECT_VALUES_NAME = true;
      defaultIterator = function values() { return call$8(nativeIterator, this); };
    }
  }

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        defineBuiltIn$3(IterablePrototype, KEY, methods[KEY]);
      }
    } else $$4({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  // define iterator
  if (IterablePrototype[ITERATOR$4] !== defaultIterator) {
    defineBuiltIn$3(IterablePrototype, ITERATOR$4, defaultIterator, { name: DEFAULT });
  }
  Iterators$3[NAME] = defaultIterator;

  return methods;
};

// `CreateIterResultObject` abstract operation
// https://tc39.es/ecma262/#sec-createiterresultobject
var createIterResultObject$2 = function (value, done) {
  return { value: value, done: done };
};

var toIndexedObject$1 = toIndexedObject$6;
var addToUnscopables = addToUnscopables$1;
var Iterators$2 = iterators;
var InternalStateModule$2 = internalState;
var defineProperty$2 = objectDefineProperty.f;
var defineIterator$1 = iteratorDefine;
var createIterResultObject$1 = createIterResultObject$2;
var DESCRIPTORS$1 = descriptors;

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState$2 = InternalStateModule$2.set;
var getInternalState$2 = InternalStateModule$2.getterFor(ARRAY_ITERATOR);

// `Array.prototype.entries` method
// https://tc39.es/ecma262/#sec-array.prototype.entries
// `Array.prototype.keys` method
// https://tc39.es/ecma262/#sec-array.prototype.keys
// `Array.prototype.values` method
// https://tc39.es/ecma262/#sec-array.prototype.values
// `Array.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-array.prototype-@@iterator
// `CreateArrayIterator` internal method
// https://tc39.es/ecma262/#sec-createarrayiterator
var es_array_iterator = defineIterator$1(Array, 'Array', function (iterated, kind) {
  setInternalState$2(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject$1(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState$2(this);
  var target = state.target;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return createIterResultObject$1(undefined, true);
  }
  switch (state.kind) {
    case 'keys': return createIterResultObject$1(index, false);
    case 'values': return createIterResultObject$1(target[index], false);
  } return createIterResultObject$1([index, target[index]], false);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
// https://tc39.es/ecma262/#sec-createmappedargumentsobject
var values = Iterators$2.Arguments = Iterators$2.Array;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

// V8 ~ Chrome 45- bug
if (DESCRIPTORS$1 && values.name !== 'values') try {
  defineProperty$2(values, 'name', { value: 'values' });
} catch (error) { /* empty */ }

var uncurryThis$a = functionUncurryThis;
var toIntegerOrInfinity$1 = toIntegerOrInfinity$4;
var toString$4 = toString$7;
var requireObjectCoercible$2 = requireObjectCoercible$6;

var charAt$4 = uncurryThis$a(''.charAt);
var charCodeAt = uncurryThis$a(''.charCodeAt);
var stringSlice$3 = uncurryThis$a(''.slice);

var createMethod$1 = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = toString$4(requireObjectCoercible$2($this));
    var position = toIntegerOrInfinity$1(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = charCodeAt(S, position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = charCodeAt(S, position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING
          ? charAt$4(S, position)
          : first
        : CONVERT_TO_STRING
          ? stringSlice$3(S, position, position + 2)
          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

var stringMultibyte = {
  // `String.prototype.codePointAt` method
  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod$1(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod$1(true)
};

var charAt$3 = stringMultibyte.charAt;
var toString$3 = toString$7;
var InternalStateModule$1 = internalState;
var defineIterator = iteratorDefine;
var createIterResultObject = createIterResultObject$2;

var STRING_ITERATOR = 'String Iterator';
var setInternalState$1 = InternalStateModule$1.set;
var getInternalState$1 = InternalStateModule$1.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState$1(this, {
    type: STRING_ITERATOR,
    string: toString$3(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState$1(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return createIterResultObject(undefined, true);
  point = charAt$3(string, index);
  state.index += point.length;
  return createIterResultObject(point, false);
});

var fails$9 = fails$p;

var freezing = !fails$9(function () {
  // eslint-disable-next-line es/no-object-isextensible, es/no-object-preventextensions -- required for testing
  return Object.isExtensible(Object.preventExtensions({}));
});

var defineBuiltIn$2 = defineBuiltIn$7;

var defineBuiltIns$2 = function (target, src, options) {
  for (var key in src) defineBuiltIn$2(target, key, src[key], options);
  return target;
};

var internalMetadata = {exports: {}};

var objectGetOwnPropertyNamesExternal = {};

var uncurryThis$9 = functionUncurryThis;

var arraySlice$1 = uncurryThis$9([].slice);

/* eslint-disable es/no-object-getownpropertynames -- safe */
var classof$4 = classofRaw$2;
var toIndexedObject = toIndexedObject$6;
var $getOwnPropertyNames = objectGetOwnPropertyNames.f;
var arraySlice = arraySlice$1;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return $getOwnPropertyNames(it);
  } catch (error) {
    return arraySlice(windowNames);
  }
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
objectGetOwnPropertyNamesExternal.f = function getOwnPropertyNames(it) {
  return windowNames && classof$4(it) === 'Window'
    ? getWindowNames(it)
    : $getOwnPropertyNames(toIndexedObject(it));
};

// FF26- bug: ArrayBuffers are non-extensible, but Object.isExtensible does not report it
var fails$8 = fails$p;

var arrayBufferNonExtensible = fails$8(function () {
  if (typeof ArrayBuffer == 'function') {
    var buffer = new ArrayBuffer(8);
    // eslint-disable-next-line es/no-object-isextensible, es/no-object-defineproperty -- safe
    if (Object.isExtensible(buffer)) Object.defineProperty(buffer, 'a', { value: 8 });
  }
});

var fails$7 = fails$p;
var isObject$8 = isObject$h;
var classof$3 = classofRaw$2;
var ARRAY_BUFFER_NON_EXTENSIBLE = arrayBufferNonExtensible;

// eslint-disable-next-line es/no-object-isextensible -- safe
var $isExtensible = Object.isExtensible;
var FAILS_ON_PRIMITIVES = fails$7(function () { $isExtensible(1); });

// `Object.isExtensible` method
// https://tc39.es/ecma262/#sec-object.isextensible
var objectIsExtensible = (FAILS_ON_PRIMITIVES || ARRAY_BUFFER_NON_EXTENSIBLE) ? function isExtensible(it) {
  if (!isObject$8(it)) return false;
  if (ARRAY_BUFFER_NON_EXTENSIBLE && classof$3(it) === 'ArrayBuffer') return false;
  return $isExtensible ? $isExtensible(it) : true;
} : $isExtensible;

var $$3 = _export;
var uncurryThis$8 = functionUncurryThis;
var hiddenKeys = hiddenKeys$5;
var isObject$7 = isObject$h;
var hasOwn$1 = hasOwnProperty_1;
var defineProperty$1 = objectDefineProperty.f;
var getOwnPropertyNamesModule = objectGetOwnPropertyNames;
var getOwnPropertyNamesExternalModule = objectGetOwnPropertyNamesExternal;
var isExtensible$1 = objectIsExtensible;
var uid = uid$3;
var FREEZING$1 = freezing;

var REQUIRED = false;
var METADATA = uid('meta');
var id$1 = 0;

var setMetadata = function (it) {
  defineProperty$1(it, METADATA, { value: {
    objectID: 'O' + id$1++, // object ID
    weakData: {}          // weak collections IDs
  } });
};

var fastKey = function (it, create) {
  // return a primitive with prefix
  if (!isObject$7(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!hasOwn$1(it, METADATA)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible$1(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMetadata(it);
  // return object ID
  } return it[METADATA].objectID;
};

var getWeakData$1 = function (it, create) {
  if (!hasOwn$1(it, METADATA)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible$1(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMetadata(it);
  // return the store of weak collections IDs
  } return it[METADATA].weakData;
};

// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZING$1 && REQUIRED && isExtensible$1(it) && !hasOwn$1(it, METADATA)) setMetadata(it);
  return it;
};

var enable = function () {
  meta.enable = function () { /* empty */ };
  REQUIRED = true;
  var getOwnPropertyNames = getOwnPropertyNamesModule.f;
  var splice = uncurryThis$8([].splice);
  var test = {};
  test[METADATA] = 1;

  // prevent exposing of metadata key
  if (getOwnPropertyNames(test).length) {
    getOwnPropertyNamesModule.f = function (it) {
      var result = getOwnPropertyNames(it);
      for (var i = 0, length = result.length; i < length; i++) {
        if (result[i] === METADATA) {
          splice(result, i, 1);
          break;
        }
      } return result;
    };

    $$3({ target: 'Object', stat: true, forced: true }, {
      getOwnPropertyNames: getOwnPropertyNamesExternalModule.f
    });
  }
};

var meta = internalMetadata.exports = {
  enable: enable,
  fastKey: fastKey,
  getWeakData: getWeakData$1,
  onFreeze: onFreeze
};

hiddenKeys[METADATA] = true;

var internalMetadataExports = internalMetadata.exports;

var wellKnownSymbol$5 = wellKnownSymbol$f;
var Iterators$1 = iterators;

var ITERATOR$3 = wellKnownSymbol$5('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
var isArrayIteratorMethod$1 = function (it) {
  return it !== undefined && (Iterators$1.Array === it || ArrayPrototype[ITERATOR$3] === it);
};

var classof$2 = classof$a;
var getMethod$3 = getMethod$5;
var isNullOrUndefined$4 = isNullOrUndefined$7;
var Iterators = iterators;
var wellKnownSymbol$4 = wellKnownSymbol$f;

var ITERATOR$2 = wellKnownSymbol$4('iterator');

var getIteratorMethod$2 = function (it) {
  if (!isNullOrUndefined$4(it)) return getMethod$3(it, ITERATOR$2)
    || getMethod$3(it, '@@iterator')
    || Iterators[classof$2(it)];
};

var call$7 = functionCall;
var aCallable$1 = aCallable$5;
var anObject$7 = anObject$d;
var tryToString$1 = tryToString$3;
var getIteratorMethod$1 = getIteratorMethod$2;

var $TypeError$4 = TypeError;

var getIterator$1 = function (argument, usingIterator) {
  var iteratorMethod = arguments.length < 2 ? getIteratorMethod$1(argument) : usingIterator;
  if (aCallable$1(iteratorMethod)) return anObject$7(call$7(iteratorMethod, argument));
  throw new $TypeError$4(tryToString$1(argument) + ' is not iterable');
};

var call$6 = functionCall;
var anObject$6 = anObject$d;
var getMethod$2 = getMethod$5;

var iteratorClose$1 = function (iterator, kind, value) {
  var innerResult, innerError;
  anObject$6(iterator);
  try {
    innerResult = getMethod$2(iterator, 'return');
    if (!innerResult) {
      if (kind === 'throw') throw value;
      return value;
    }
    innerResult = call$6(innerResult, iterator);
  } catch (error) {
    innerError = true;
    innerResult = error;
  }
  if (kind === 'throw') throw value;
  if (innerError) throw innerResult;
  anObject$6(innerResult);
  return value;
};

var bind = functionBindContext;
var call$5 = functionCall;
var anObject$5 = anObject$d;
var tryToString = tryToString$3;
var isArrayIteratorMethod = isArrayIteratorMethod$1;
var lengthOfArrayLike$1 = lengthOfArrayLike$4;
var isPrototypeOf$1 = objectIsPrototypeOf;
var getIterator = getIterator$1;
var getIteratorMethod = getIteratorMethod$2;
var iteratorClose = iteratorClose$1;

var $TypeError$3 = TypeError;

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var ResultPrototype = Result.prototype;

var iterate$2 = function (iterable, unboundFunction, options) {
  var that = options && options.that;
  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
  var IS_RECORD = !!(options && options.IS_RECORD);
  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
  var INTERRUPTED = !!(options && options.INTERRUPTED);
  var fn = bind(unboundFunction, that);
  var iterator, iterFn, index, length, result, next, step;

  var stop = function (condition) {
    if (iterator) iteratorClose(iterator, 'normal', condition);
    return new Result(true, condition);
  };

  var callFn = function (value) {
    if (AS_ENTRIES) {
      anObject$5(value);
      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
    } return INTERRUPTED ? fn(value, stop) : fn(value);
  };

  if (IS_RECORD) {
    iterator = iterable.iterator;
  } else if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod(iterable);
    if (!iterFn) throw new $TypeError$3(tryToString(iterable) + ' is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod(iterFn)) {
      for (index = 0, length = lengthOfArrayLike$1(iterable); length > index; index++) {
        result = callFn(iterable[index]);
        if (result && isPrototypeOf$1(ResultPrototype, result)) return result;
      } return new Result(false);
    }
    iterator = getIterator(iterable, iterFn);
  }

  next = IS_RECORD ? iterable.next : iterator.next;
  while (!(step = call$5(next, iterator)).done) {
    try {
      result = callFn(step.value);
    } catch (error) {
      iteratorClose(iterator, 'throw', error);
    }
    if (typeof result == 'object' && result && isPrototypeOf$1(ResultPrototype, result)) return result;
  } return new Result(false);
};

var isPrototypeOf = objectIsPrototypeOf;

var $TypeError$2 = TypeError;

var anInstance$2 = function (it, Prototype) {
  if (isPrototypeOf(Prototype, it)) return it;
  throw new $TypeError$2('Incorrect invocation');
};

var wellKnownSymbol$3 = wellKnownSymbol$f;

var ITERATOR$1 = wellKnownSymbol$3('iterator');
var SAFE_CLOSING = false;

try {
  var called = 0;
  var iteratorWithReturn = {
    next: function () {
      return { done: !!called++ };
    },
    'return': function () {
      SAFE_CLOSING = true;
    }
  };
  iteratorWithReturn[ITERATOR$1] = function () {
    return this;
  };
  // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

var checkCorrectnessOfIteration$1 = function (exec, SKIP_CLOSING) {
  try {
    if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  } catch (error) { return false; } // workaround of old WebKit + `eval` bug
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR$1] = function () {
      return {
        next: function () {
          return { done: ITERATION_SUPPORT = true };
        }
      };
    };
    exec(object);
  } catch (error) { /* empty */ }
  return ITERATION_SUPPORT;
};

var isCallable$3 = isCallable$j;
var isObject$6 = isObject$h;
var setPrototypeOf = objectSetPrototypeOf;

// makes subclassing work correct for wrapped built-ins
var inheritIfRequired$1 = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    setPrototypeOf &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    isCallable$3(NewTarget = dummy.constructor) &&
    NewTarget !== Wrapper &&
    isObject$6(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) setPrototypeOf($this, NewTargetPrototype);
  return $this;
};

var $$2 = _export;
var global$8 = global$l;
var uncurryThis$7 = functionUncurryThis;
var isForced = isForced_1;
var defineBuiltIn$1 = defineBuiltIn$7;
var InternalMetadataModule$1 = internalMetadataExports;
var iterate$1 = iterate$2;
var anInstance$1 = anInstance$2;
var isCallable$2 = isCallable$j;
var isNullOrUndefined$3 = isNullOrUndefined$7;
var isObject$5 = isObject$h;
var fails$6 = fails$p;
var checkCorrectnessOfIteration = checkCorrectnessOfIteration$1;
var setToStringTag$1 = setToStringTag$4;
var inheritIfRequired = inheritIfRequired$1;

var collection$1 = function (CONSTRUCTOR_NAME, wrapper, common) {
  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
  var ADDER = IS_MAP ? 'set' : 'add';
  var NativeConstructor = global$8[CONSTRUCTOR_NAME];
  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
  var Constructor = NativeConstructor;
  var exported = {};

  var fixMethod = function (KEY) {
    var uncurriedNativeMethod = uncurryThis$7(NativePrototype[KEY]);
    defineBuiltIn$1(NativePrototype, KEY,
      KEY === 'add' ? function add(value) {
        uncurriedNativeMethod(this, value === 0 ? 0 : value);
        return this;
      } : KEY === 'delete' ? function (key) {
        return IS_WEAK && !isObject$5(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : KEY === 'get' ? function get(key) {
        return IS_WEAK && !isObject$5(key) ? undefined : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : KEY === 'has' ? function has(key) {
        return IS_WEAK && !isObject$5(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : function set(key, value) {
        uncurriedNativeMethod(this, key === 0 ? 0 : key, value);
        return this;
      }
    );
  };

  var REPLACE = isForced(
    CONSTRUCTOR_NAME,
    !isCallable$2(NativeConstructor) || !(IS_WEAK || NativePrototype.forEach && !fails$6(function () {
      new NativeConstructor().entries().next();
    }))
  );

  if (REPLACE) {
    // create collection constructor
    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
    InternalMetadataModule$1.enable();
  } else if (isForced(CONSTRUCTOR_NAME, true)) {
    var instance = new Constructor();
    // early implementations not supports chaining
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) !== instance;
    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = fails$6(function () { instance.has(1); });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    // eslint-disable-next-line no-new -- required for testing
    var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) { new NativeConstructor(iterable); });
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && fails$6(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new NativeConstructor();
      var index = 5;
      while (index--) $instance[ADDER](index, index);
      return !$instance.has(-0);
    });

    if (!ACCEPT_ITERABLES) {
      Constructor = wrapper(function (dummy, iterable) {
        anInstance$1(dummy, NativePrototype);
        var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
        if (!isNullOrUndefined$3(iterable)) iterate$1(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
        return that;
      });
      Constructor.prototype = NativePrototype;
      NativePrototype.constructor = Constructor;
    }

    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }

    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);

    // weak collections should not contains .clear method
    if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
  }

  exported[CONSTRUCTOR_NAME] = Constructor;
  $$2({ global: true, constructor: true, forced: Constructor !== NativeConstructor }, exported);

  setToStringTag$1(Constructor, CONSTRUCTOR_NAME);

  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

  return Constructor;
};

var uncurryThis$6 = functionUncurryThis;
var defineBuiltIns$1 = defineBuiltIns$2;
var getWeakData = internalMetadataExports.getWeakData;
var anInstance = anInstance$2;
var anObject$4 = anObject$d;
var isNullOrUndefined$2 = isNullOrUndefined$7;
var isObject$4 = isObject$h;
var iterate = iterate$2;
var ArrayIterationModule = arrayIteration;
var hasOwn = hasOwnProperty_1;
var InternalStateModule = internalState;

var setInternalState = InternalStateModule.set;
var internalStateGetterFor = InternalStateModule.getterFor;
var find = ArrayIterationModule.find;
var findIndex = ArrayIterationModule.findIndex;
var splice$1 = uncurryThis$6([].splice);
var id = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function (state) {
  return state.frozen || (state.frozen = new UncaughtFrozenStore());
};

var UncaughtFrozenStore = function () {
  this.entries = [];
};

var findUncaughtFrozen = function (store, key) {
  return find(store.entries, function (it) {
    return it[0] === key;
  });
};

UncaughtFrozenStore.prototype = {
  get: function (key) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) return entry[1];
  },
  has: function (key) {
    return !!findUncaughtFrozen(this, key);
  },
  set: function (key, value) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) entry[1] = value;
    else this.entries.push([key, value]);
  },
  'delete': function (key) {
    var index = findIndex(this.entries, function (it) {
      return it[0] === key;
    });
    if (~index) splice$1(this.entries, index, 1);
    return !!~index;
  }
};

var collectionWeak$1 = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var Constructor = wrapper(function (that, iterable) {
      anInstance(that, Prototype);
      setInternalState(that, {
        type: CONSTRUCTOR_NAME,
        id: id++,
        frozen: undefined
      });
      if (!isNullOrUndefined$2(iterable)) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
    });

    var Prototype = Constructor.prototype;

    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

    var define = function (that, key, value) {
      var state = getInternalState(that);
      var data = getWeakData(anObject$4(key), true);
      if (data === true) uncaughtFrozenStore(state).set(key, value);
      else data[state.id] = value;
      return that;
    };

    defineBuiltIns$1(Prototype, {
      // `{ WeakMap, WeakSet }.prototype.delete(key)` methods
      // https://tc39.es/ecma262/#sec-weakmap.prototype.delete
      // https://tc39.es/ecma262/#sec-weakset.prototype.delete
      'delete': function (key) {
        var state = getInternalState(this);
        if (!isObject$4(key)) return false;
        var data = getWeakData(key);
        if (data === true) return uncaughtFrozenStore(state)['delete'](key);
        return data && hasOwn(data, state.id) && delete data[state.id];
      },
      // `{ WeakMap, WeakSet }.prototype.has(key)` methods
      // https://tc39.es/ecma262/#sec-weakmap.prototype.has
      // https://tc39.es/ecma262/#sec-weakset.prototype.has
      has: function has(key) {
        var state = getInternalState(this);
        if (!isObject$4(key)) return false;
        var data = getWeakData(key);
        if (data === true) return uncaughtFrozenStore(state).has(key);
        return data && hasOwn(data, state.id);
      }
    });

    defineBuiltIns$1(Prototype, IS_MAP ? {
      // `WeakMap.prototype.get(key)` method
      // https://tc39.es/ecma262/#sec-weakmap.prototype.get
      get: function get(key) {
        var state = getInternalState(this);
        if (isObject$4(key)) {
          var data = getWeakData(key);
          if (data === true) return uncaughtFrozenStore(state).get(key);
          return data ? data[state.id] : undefined;
        }
      },
      // `WeakMap.prototype.set(key, value)` method
      // https://tc39.es/ecma262/#sec-weakmap.prototype.set
      set: function set(key, value) {
        return define(this, key, value);
      }
    } : {
      // `WeakSet.prototype.add(value)` method
      // https://tc39.es/ecma262/#sec-weakset.prototype.add
      add: function add(value) {
        return define(this, value, true);
      }
    });

    return Constructor;
  }
};

var FREEZING = freezing;
var global$7 = global$l;
var uncurryThis$5 = functionUncurryThis;
var defineBuiltIns = defineBuiltIns$2;
var InternalMetadataModule = internalMetadataExports;
var collection = collection$1;
var collectionWeak = collectionWeak$1;
var isObject$3 = isObject$h;
var enforceInternalState = internalState.enforce;
var fails$5 = fails$p;
var NATIVE_WEAK_MAP = weakMapBasicDetection;

var $Object = Object;
// eslint-disable-next-line es/no-array-isarray -- safe
var isArray = Array.isArray;
// eslint-disable-next-line es/no-object-isextensible -- safe
var isExtensible = $Object.isExtensible;
// eslint-disable-next-line es/no-object-isfrozen -- safe
var isFrozen = $Object.isFrozen;
// eslint-disable-next-line es/no-object-issealed -- safe
var isSealed = $Object.isSealed;
// eslint-disable-next-line es/no-object-freeze -- safe
var freeze$1 = $Object.freeze;
// eslint-disable-next-line es/no-object-seal -- safe
var seal = $Object.seal;

var IS_IE11 = !global$7.ActiveXObject && 'ActiveXObject' in global$7;
var InternalWeakMap;

var wrapper = function (init) {
  return function WeakMap() {
    return init(this, arguments.length ? arguments[0] : undefined);
  };
};

// `WeakMap` constructor
// https://tc39.es/ecma262/#sec-weakmap-constructor
var $WeakMap = collection('WeakMap', wrapper, collectionWeak);
var WeakMapPrototype = $WeakMap.prototype;
var nativeSet = uncurryThis$5(WeakMapPrototype.set);

// Chakra Edge bug: adding frozen arrays to WeakMap unfreeze them
var hasMSEdgeFreezingBug = function () {
  return FREEZING && fails$5(function () {
    var frozenArray = freeze$1([]);
    nativeSet(new $WeakMap(), frozenArray, 1);
    return !isFrozen(frozenArray);
  });
};

// IE11 WeakMap frozen keys fix
// We can't use feature detection because it crash some old IE builds
// https://github.com/zloirock/core-js/issues/485
if (NATIVE_WEAK_MAP) if (IS_IE11) {
  InternalWeakMap = collectionWeak.getConstructor(wrapper, 'WeakMap', true);
  InternalMetadataModule.enable();
  var nativeDelete = uncurryThis$5(WeakMapPrototype['delete']);
  var nativeHas = uncurryThis$5(WeakMapPrototype.has);
  var nativeGet = uncurryThis$5(WeakMapPrototype.get);
  defineBuiltIns(WeakMapPrototype, {
    'delete': function (key) {
      if (isObject$3(key) && !isExtensible(key)) {
        var state = enforceInternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeDelete(this, key) || state.frozen['delete'](key);
      } return nativeDelete(this, key);
    },
    has: function has(key) {
      if (isObject$3(key) && !isExtensible(key)) {
        var state = enforceInternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeHas(this, key) || state.frozen.has(key);
      } return nativeHas(this, key);
    },
    get: function get(key) {
      if (isObject$3(key) && !isExtensible(key)) {
        var state = enforceInternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeHas(this, key) ? nativeGet(this, key) : state.frozen.get(key);
      } return nativeGet(this, key);
    },
    set: function set(key, value) {
      if (isObject$3(key) && !isExtensible(key)) {
        var state = enforceInternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        nativeHas(this, key) ? nativeSet(this, key, value) : state.frozen.set(key, value);
      } else nativeSet(this, key, value);
      return this;
    }
  });
// Chakra Edge frozen keys fix
} else if (hasMSEdgeFreezingBug()) {
  defineBuiltIns(WeakMapPrototype, {
    set: function set(key, value) {
      var arrayIntegrityLevel;
      if (isArray(key)) {
        if (isFrozen(key)) arrayIntegrityLevel = freeze$1;
        else if (isSealed(key)) arrayIntegrityLevel = seal;
      }
      nativeSet(this, key, value);
      if (arrayIntegrityLevel) arrayIntegrityLevel(key);
      return this;
    }
  });
}

var global$6 = global$l;
var DOMIterables = domIterables;
var DOMTokenListPrototype = domTokenListPrototype;
var ArrayIteratorMethods = es_array_iterator;
var createNonEnumerableProperty$1 = createNonEnumerableProperty$6;
var setToStringTag = setToStringTag$4;
var wellKnownSymbol$2 = wellKnownSymbol$f;

var ITERATOR = wellKnownSymbol$2('iterator');
var ArrayValues = ArrayIteratorMethods.values;

var handlePrototype = function (CollectionPrototype, COLLECTION_NAME) {
  if (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype[ITERATOR] !== ArrayValues) try {
      createNonEnumerableProperty$1(CollectionPrototype, ITERATOR, ArrayValues);
    } catch (error) {
      CollectionPrototype[ITERATOR] = ArrayValues;
    }
    setToStringTag(CollectionPrototype, COLLECTION_NAME, true);
    if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
        createNonEnumerableProperty$1(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
      } catch (error) {
        CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
      }
    }
  }
};

for (var COLLECTION_NAME in DOMIterables) {
  handlePrototype(global$6[COLLECTION_NAME] && global$6[COLLECTION_NAME].prototype, COLLECTION_NAME);
}

handlePrototype(DOMTokenListPrototype, 'DOMTokenList');

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT$2 = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN$1 = 0 / 0;

/** `Object#toString` result references. */
var symbolTag$1 = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim$1 = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex$1 = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary$1 = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal$1 = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt$1 = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal$2 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf$2 = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root$2 = freeGlobal$2 || freeSelf$2 || Function('return this')();

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$2 = objectProto$2.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax$1 = Math.max,
    nativeMin$1 = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now$1 = function() {
  return root$2.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce$2(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT$2);
  }
  wait = toNumber$1(wait) || 0;
  if (isObject$2(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax$1(toNumber$1(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin$1(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now$1();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now$1());
  }

  function debounced() {
    var time = now$1(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT$2);
  }
  if (isObject$2(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce$2(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$2(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$1(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol$1(value) {
  return typeof value == 'symbol' ||
    (isObjectLike$1(value) && objectToString$2.call(value) == symbolTag$1);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber$1(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol$1(value)) {
    return NAN$1;
  }
  if (isObject$2(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject$2(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim$1, '');
  var isBinary = reIsBinary$1.test(value);
  return (isBinary || reIsOctal$1.test(value))
    ? freeParseInt$1(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex$1.test(value) ? NAN$1 : +value);
}

var lodash_throttle = throttle;

var throttle$1 = /*@__PURE__*/getDefaultExportFromCjs(lodash_throttle);

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT$1 = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf$1 = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root$1 = freeGlobal$1 || freeSelf$1 || Function('return this')();

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$1 = objectProto$1.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root$1.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  wait = toNumber(wait) || 0;
  if (isObject$1(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$1(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString$1.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject$1(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject$1(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

var lodash_debounce = debounce;

var debounce$1 = /*@__PURE__*/getDefaultExportFromCjs(lodash_debounce);

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var splice = arrayProto.splice;

/* Built-in method references that are verified to be native. */
var Map$1 = getNative(root, 'Map'),
    nativeCreate = getNative(Object, 'create');

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map$1 || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize.Cache = MapCache;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

var lodash_memoize = memoize;

var memoize$1 = /*@__PURE__*/getDefaultExportFromCjs(lodash_memoize);

var resizeObservers = [];

var hasActiveObservations = function () {
    return resizeObservers.some(function (ro) { return ro.activeTargets.length > 0; });
};

var hasSkippedObservations = function () {
    return resizeObservers.some(function (ro) { return ro.skippedTargets.length > 0; });
};

var msg = 'ResizeObserver loop completed with undelivered notifications.';
var deliverResizeLoopError = function () {
    var event;
    if (typeof ErrorEvent === 'function') {
        event = new ErrorEvent('error', {
            message: msg
        });
    }
    else {
        event = document.createEvent('Event');
        event.initEvent('error', false, false);
        event.message = msg;
    }
    window.dispatchEvent(event);
};

var ResizeObserverBoxOptions;
(function (ResizeObserverBoxOptions) {
    ResizeObserverBoxOptions["BORDER_BOX"] = "border-box";
    ResizeObserverBoxOptions["CONTENT_BOX"] = "content-box";
    ResizeObserverBoxOptions["DEVICE_PIXEL_CONTENT_BOX"] = "device-pixel-content-box";
})(ResizeObserverBoxOptions || (ResizeObserverBoxOptions = {}));

var freeze = function (obj) { return Object.freeze(obj); };

var ResizeObserverSize = (function () {
    function ResizeObserverSize(inlineSize, blockSize) {
        this.inlineSize = inlineSize;
        this.blockSize = blockSize;
        freeze(this);
    }
    return ResizeObserverSize;
}());

var DOMRectReadOnly = (function () {
    function DOMRectReadOnly(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.top = this.y;
        this.left = this.x;
        this.bottom = this.top + this.height;
        this.right = this.left + this.width;
        return freeze(this);
    }
    DOMRectReadOnly.prototype.toJSON = function () {
        var _a = this, x = _a.x, y = _a.y, top = _a.top, right = _a.right, bottom = _a.bottom, left = _a.left, width = _a.width, height = _a.height;
        return { x: x, y: y, top: top, right: right, bottom: bottom, left: left, width: width, height: height };
    };
    DOMRectReadOnly.fromRect = function (rectangle) {
        return new DOMRectReadOnly(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    };
    return DOMRectReadOnly;
}());

var isSVG = function (target) { return target instanceof SVGElement && 'getBBox' in target; };
var isHidden = function (target) {
    if (isSVG(target)) {
        var _a = target.getBBox(), width = _a.width, height = _a.height;
        return !width && !height;
    }
    var _b = target, offsetWidth = _b.offsetWidth, offsetHeight = _b.offsetHeight;
    return !(offsetWidth || offsetHeight || target.getClientRects().length);
};
var isElement = function (obj) {
    var _a;
    if (obj instanceof Element) {
        return true;
    }
    var scope = (_a = obj === null || obj === void 0 ? void 0 : obj.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView;
    return !!(scope && obj instanceof scope.Element);
};
var isReplacedElement = function (target) {
    switch (target.tagName) {
        case 'INPUT':
            if (target.type !== 'image') {
                break;
            }
        case 'VIDEO':
        case 'AUDIO':
        case 'EMBED':
        case 'OBJECT':
        case 'CANVAS':
        case 'IFRAME':
        case 'IMG':
            return true;
    }
    return false;
};

var global$5 = typeof window !== 'undefined' ? window : {};

var cache = new WeakMap();
var scrollRegexp = /auto|scroll/;
var verticalRegexp = /^tb|vertical/;
var IE = (/msie|trident/i).test(global$5.navigator && global$5.navigator.userAgent);
var parseDimension = function (pixel) { return parseFloat(pixel || '0'); };
var size = function (inlineSize, blockSize, switchSizes) {
    if (inlineSize === void 0) { inlineSize = 0; }
    if (blockSize === void 0) { blockSize = 0; }
    if (switchSizes === void 0) { switchSizes = false; }
    return new ResizeObserverSize((switchSizes ? blockSize : inlineSize) || 0, (switchSizes ? inlineSize : blockSize) || 0);
};
var zeroBoxes = freeze({
    devicePixelContentBoxSize: size(),
    borderBoxSize: size(),
    contentBoxSize: size(),
    contentRect: new DOMRectReadOnly(0, 0, 0, 0)
});
var calculateBoxSizes = function (target, forceRecalculation) {
    if (forceRecalculation === void 0) { forceRecalculation = false; }
    if (cache.has(target) && !forceRecalculation) {
        return cache.get(target);
    }
    if (isHidden(target)) {
        cache.set(target, zeroBoxes);
        return zeroBoxes;
    }
    var cs = getComputedStyle(target);
    var svg = isSVG(target) && target.ownerSVGElement && target.getBBox();
    var removePadding = !IE && cs.boxSizing === 'border-box';
    var switchSizes = verticalRegexp.test(cs.writingMode || '');
    var canScrollVertically = !svg && scrollRegexp.test(cs.overflowY || '');
    var canScrollHorizontally = !svg && scrollRegexp.test(cs.overflowX || '');
    var paddingTop = svg ? 0 : parseDimension(cs.paddingTop);
    var paddingRight = svg ? 0 : parseDimension(cs.paddingRight);
    var paddingBottom = svg ? 0 : parseDimension(cs.paddingBottom);
    var paddingLeft = svg ? 0 : parseDimension(cs.paddingLeft);
    var borderTop = svg ? 0 : parseDimension(cs.borderTopWidth);
    var borderRight = svg ? 0 : parseDimension(cs.borderRightWidth);
    var borderBottom = svg ? 0 : parseDimension(cs.borderBottomWidth);
    var borderLeft = svg ? 0 : parseDimension(cs.borderLeftWidth);
    var horizontalPadding = paddingLeft + paddingRight;
    var verticalPadding = paddingTop + paddingBottom;
    var horizontalBorderArea = borderLeft + borderRight;
    var verticalBorderArea = borderTop + borderBottom;
    var horizontalScrollbarThickness = !canScrollHorizontally ? 0 : target.offsetHeight - verticalBorderArea - target.clientHeight;
    var verticalScrollbarThickness = !canScrollVertically ? 0 : target.offsetWidth - horizontalBorderArea - target.clientWidth;
    var widthReduction = removePadding ? horizontalPadding + horizontalBorderArea : 0;
    var heightReduction = removePadding ? verticalPadding + verticalBorderArea : 0;
    var contentWidth = svg ? svg.width : parseDimension(cs.width) - widthReduction - verticalScrollbarThickness;
    var contentHeight = svg ? svg.height : parseDimension(cs.height) - heightReduction - horizontalScrollbarThickness;
    var borderBoxWidth = contentWidth + horizontalPadding + verticalScrollbarThickness + horizontalBorderArea;
    var borderBoxHeight = contentHeight + verticalPadding + horizontalScrollbarThickness + verticalBorderArea;
    var boxes = freeze({
        devicePixelContentBoxSize: size(Math.round(contentWidth * devicePixelRatio), Math.round(contentHeight * devicePixelRatio), switchSizes),
        borderBoxSize: size(borderBoxWidth, borderBoxHeight, switchSizes),
        contentBoxSize: size(contentWidth, contentHeight, switchSizes),
        contentRect: new DOMRectReadOnly(paddingLeft, paddingTop, contentWidth, contentHeight)
    });
    cache.set(target, boxes);
    return boxes;
};
var calculateBoxSize = function (target, observedBox, forceRecalculation) {
    var _a = calculateBoxSizes(target, forceRecalculation), borderBoxSize = _a.borderBoxSize, contentBoxSize = _a.contentBoxSize, devicePixelContentBoxSize = _a.devicePixelContentBoxSize;
    switch (observedBox) {
        case ResizeObserverBoxOptions.DEVICE_PIXEL_CONTENT_BOX:
            return devicePixelContentBoxSize;
        case ResizeObserverBoxOptions.BORDER_BOX:
            return borderBoxSize;
        default:
            return contentBoxSize;
    }
};

var ResizeObserverEntry = (function () {
    function ResizeObserverEntry(target) {
        var boxes = calculateBoxSizes(target);
        this.target = target;
        this.contentRect = boxes.contentRect;
        this.borderBoxSize = freeze([boxes.borderBoxSize]);
        this.contentBoxSize = freeze([boxes.contentBoxSize]);
        this.devicePixelContentBoxSize = freeze([boxes.devicePixelContentBoxSize]);
    }
    return ResizeObserverEntry;
}());

var calculateDepthForNode = function (node) {
    if (isHidden(node)) {
        return Infinity;
    }
    var depth = 0;
    var parent = node.parentNode;
    while (parent) {
        depth += 1;
        parent = parent.parentNode;
    }
    return depth;
};

var broadcastActiveObservations = function () {
    var shallowestDepth = Infinity;
    var callbacks = [];
    resizeObservers.forEach(function processObserver(ro) {
        if (ro.activeTargets.length === 0) {
            return;
        }
        var entries = [];
        ro.activeTargets.forEach(function processTarget(ot) {
            var entry = new ResizeObserverEntry(ot.target);
            var targetDepth = calculateDepthForNode(ot.target);
            entries.push(entry);
            ot.lastReportedSize = calculateBoxSize(ot.target, ot.observedBox);
            if (targetDepth < shallowestDepth) {
                shallowestDepth = targetDepth;
            }
        });
        callbacks.push(function resizeObserverCallback() {
            ro.callback.call(ro.observer, entries, ro.observer);
        });
        ro.activeTargets.splice(0, ro.activeTargets.length);
    });
    for (var _i = 0, callbacks_1 = callbacks; _i < callbacks_1.length; _i++) {
        var callback = callbacks_1[_i];
        callback();
    }
    return shallowestDepth;
};

var gatherActiveObservationsAtDepth = function (depth) {
    resizeObservers.forEach(function processObserver(ro) {
        ro.activeTargets.splice(0, ro.activeTargets.length);
        ro.skippedTargets.splice(0, ro.skippedTargets.length);
        ro.observationTargets.forEach(function processTarget(ot) {
            if (ot.isActive()) {
                if (calculateDepthForNode(ot.target) > depth) {
                    ro.activeTargets.push(ot);
                }
                else {
                    ro.skippedTargets.push(ot);
                }
            }
        });
    });
};

var process = function () {
    var depth = 0;
    gatherActiveObservationsAtDepth(depth);
    while (hasActiveObservations()) {
        depth = broadcastActiveObservations();
        gatherActiveObservationsAtDepth(depth);
    }
    if (hasSkippedObservations()) {
        deliverResizeLoopError();
    }
    return depth > 0;
};

var trigger;
var callbacks = [];
var notify = function () { return callbacks.splice(0).forEach(function (cb) { return cb(); }); };
var queueMicroTask = function (callback) {
    if (!trigger) {
        var toggle_1 = 0;
        var el_1 = document.createTextNode('');
        var config = { characterData: true };
        new MutationObserver(function () { return notify(); }).observe(el_1, config);
        trigger = function () { el_1.textContent = "".concat(toggle_1 ? toggle_1-- : toggle_1++); };
    }
    callbacks.push(callback);
    trigger();
};

var queueResizeObserver = function (cb) {
    queueMicroTask(function ResizeObserver() {
        requestAnimationFrame(cb);
    });
};

var watching = 0;
var isWatching = function () { return !!watching; };
var CATCH_PERIOD = 250;
var observerConfig = { attributes: true, characterData: true, childList: true, subtree: true };
var events = [
    'resize',
    'load',
    'transitionend',
    'animationend',
    'animationstart',
    'animationiteration',
    'keyup',
    'keydown',
    'mouseup',
    'mousedown',
    'mouseover',
    'mouseout',
    'blur',
    'focus'
];
var time = function (timeout) {
    if (timeout === void 0) { timeout = 0; }
    return Date.now() + timeout;
};
var scheduled = false;
var Scheduler = (function () {
    function Scheduler() {
        var _this = this;
        this.stopped = true;
        this.listener = function () { return _this.schedule(); };
    }
    Scheduler.prototype.run = function (timeout) {
        var _this = this;
        if (timeout === void 0) { timeout = CATCH_PERIOD; }
        if (scheduled) {
            return;
        }
        scheduled = true;
        var until = time(timeout);
        queueResizeObserver(function () {
            var elementsHaveResized = false;
            try {
                elementsHaveResized = process();
            }
            finally {
                scheduled = false;
                timeout = until - time();
                if (!isWatching()) {
                    return;
                }
                if (elementsHaveResized) {
                    _this.run(1000);
                }
                else if (timeout > 0) {
                    _this.run(timeout);
                }
                else {
                    _this.start();
                }
            }
        });
    };
    Scheduler.prototype.schedule = function () {
        this.stop();
        this.run();
    };
    Scheduler.prototype.observe = function () {
        var _this = this;
        var cb = function () { return _this.observer && _this.observer.observe(document.body, observerConfig); };
        document.body ? cb() : global$5.addEventListener('DOMContentLoaded', cb);
    };
    Scheduler.prototype.start = function () {
        var _this = this;
        if (this.stopped) {
            this.stopped = false;
            this.observer = new MutationObserver(this.listener);
            this.observe();
            events.forEach(function (name) { return global$5.addEventListener(name, _this.listener, true); });
        }
    };
    Scheduler.prototype.stop = function () {
        var _this = this;
        if (!this.stopped) {
            this.observer && this.observer.disconnect();
            events.forEach(function (name) { return global$5.removeEventListener(name, _this.listener, true); });
            this.stopped = true;
        }
    };
    return Scheduler;
}());
var scheduler = new Scheduler();
var updateCount = function (n) {
    !watching && n > 0 && scheduler.start();
    watching += n;
    !watching && scheduler.stop();
};

var skipNotifyOnElement = function (target) {
    return !isSVG(target)
        && !isReplacedElement(target)
        && getComputedStyle(target).display === 'inline';
};
var ResizeObservation = (function () {
    function ResizeObservation(target, observedBox) {
        this.target = target;
        this.observedBox = observedBox || ResizeObserverBoxOptions.CONTENT_BOX;
        this.lastReportedSize = {
            inlineSize: 0,
            blockSize: 0
        };
    }
    ResizeObservation.prototype.isActive = function () {
        var size = calculateBoxSize(this.target, this.observedBox, true);
        if (skipNotifyOnElement(this.target)) {
            this.lastReportedSize = size;
        }
        if (this.lastReportedSize.inlineSize !== size.inlineSize
            || this.lastReportedSize.blockSize !== size.blockSize) {
            return true;
        }
        return false;
    };
    return ResizeObservation;
}());

var ResizeObserverDetail = (function () {
    function ResizeObserverDetail(resizeObserver, callback) {
        this.activeTargets = [];
        this.skippedTargets = [];
        this.observationTargets = [];
        this.observer = resizeObserver;
        this.callback = callback;
    }
    return ResizeObserverDetail;
}());

var observerMap = new WeakMap();
var getObservationIndex = function (observationTargets, target) {
    for (var i = 0; i < observationTargets.length; i += 1) {
        if (observationTargets[i].target === target) {
            return i;
        }
    }
    return -1;
};
var ResizeObserverController = (function () {
    function ResizeObserverController() {
    }
    ResizeObserverController.connect = function (resizeObserver, callback) {
        var detail = new ResizeObserverDetail(resizeObserver, callback);
        observerMap.set(resizeObserver, detail);
    };
    ResizeObserverController.observe = function (resizeObserver, target, options) {
        var detail = observerMap.get(resizeObserver);
        var firstObservation = detail.observationTargets.length === 0;
        if (getObservationIndex(detail.observationTargets, target) < 0) {
            firstObservation && resizeObservers.push(detail);
            detail.observationTargets.push(new ResizeObservation(target, options && options.box));
            updateCount(1);
            scheduler.schedule();
        }
    };
    ResizeObserverController.unobserve = function (resizeObserver, target) {
        var detail = observerMap.get(resizeObserver);
        var index = getObservationIndex(detail.observationTargets, target);
        var lastObservation = detail.observationTargets.length === 1;
        if (index >= 0) {
            lastObservation && resizeObservers.splice(resizeObservers.indexOf(detail), 1);
            detail.observationTargets.splice(index, 1);
            updateCount(-1);
        }
    };
    ResizeObserverController.disconnect = function (resizeObserver) {
        var _this = this;
        var detail = observerMap.get(resizeObserver);
        detail.observationTargets.slice().forEach(function (ot) { return _this.unobserve(resizeObserver, ot.target); });
        detail.activeTargets.splice(0, detail.activeTargets.length);
    };
    return ResizeObserverController;
}());

var ResizeObserver = (function () {
    function ResizeObserver(callback) {
        if (arguments.length === 0) {
            throw new TypeError("Failed to construct 'ResizeObserver': 1 argument required, but only 0 present.");
        }
        if (typeof callback !== 'function') {
            throw new TypeError("Failed to construct 'ResizeObserver': The callback provided as parameter 1 is not a function.");
        }
        ResizeObserverController.connect(this, callback);
    }
    ResizeObserver.prototype.observe = function (target, options) {
        if (arguments.length === 0) {
            throw new TypeError("Failed to execute 'observe' on 'ResizeObserver': 1 argument required, but only 0 present.");
        }
        if (!isElement(target)) {
            throw new TypeError("Failed to execute 'observe' on 'ResizeObserver': parameter 1 is not of type 'Element");
        }
        ResizeObserverController.observe(this, target, options);
    };
    ResizeObserver.prototype.unobserve = function (target) {
        if (arguments.length === 0) {
            throw new TypeError("Failed to execute 'unobserve' on 'ResizeObserver': 1 argument required, but only 0 present.");
        }
        if (!isElement(target)) {
            throw new TypeError("Failed to execute 'unobserve' on 'ResizeObserver': parameter 1 is not of type 'Element");
        }
        ResizeObserverController.unobserve(this, target);
    };
    ResizeObserver.prototype.disconnect = function () {
        ResizeObserverController.disconnect(this);
    };
    ResizeObserver.toString = function () {
        return 'function ResizeObserver () { [polyfill code] }';
    };
    return ResizeObserver;
}());

var aCallable = aCallable$5;
var toObject$1 = toObject$6;
var IndexedObject = indexedObject;
var lengthOfArrayLike = lengthOfArrayLike$4;

var $TypeError$1 = TypeError;

// `Array.prototype.{ reduce, reduceRight }` methods implementation
var createMethod = function (IS_RIGHT) {
  return function (that, callbackfn, argumentsLength, memo) {
    var O = toObject$1(that);
    var self = IndexedObject(O);
    var length = lengthOfArrayLike(O);
    aCallable(callbackfn);
    var index = IS_RIGHT ? length - 1 : 0;
    var i = IS_RIGHT ? -1 : 1;
    if (argumentsLength < 2) while (true) {
      if (index in self) {
        memo = self[index];
        index += i;
        break;
      }
      index += i;
      if (IS_RIGHT ? index < 0 : length <= index) {
        throw new $TypeError$1('Reduce of empty array with no initial value');
      }
    }
    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
      memo = callbackfn(memo, self[index], index, O);
    }
    return memo;
  };
};

var arrayReduce = {
  // `Array.prototype.reduce` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduce
  left: createMethod(false),
  // `Array.prototype.reduceRight` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduceright
  right: createMethod(true)
};

var global$4 = global$l;
var classof$1 = classofRaw$2;

var engineIsNode = classof$1(global$4.process) === 'process';

var $$1 = _export;
var $reduce = arrayReduce.left;
var arrayMethodIsStrict = arrayMethodIsStrict$2;
var CHROME_VERSION = engineV8Version;
var IS_NODE = engineIsNode;

// Chrome 80-82 has a critical bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
var CHROME_BUG = !IS_NODE && CHROME_VERSION > 79 && CHROME_VERSION < 83;
var FORCED = CHROME_BUG || !arrayMethodIsStrict('reduce');

// `Array.prototype.reduce` method
// https://tc39.es/ecma262/#sec-array.prototype.reduce
$$1({ target: 'Array', proto: true, forced: FORCED }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var length = arguments.length;
    return $reduce(this, callbackfn, length, length > 1 ? arguments[1] : undefined);
  }
});

var anObject$3 = anObject$d;

// `RegExp.prototype.flags` getter implementation
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
var regexpFlags$1 = function () {
  var that = anObject$3(this);
  var result = '';
  if (that.hasIndices) result += 'd';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.dotAll) result += 's';
  if (that.unicode) result += 'u';
  if (that.unicodeSets) result += 'v';
  if (that.sticky) result += 'y';
  return result;
};

var fails$4 = fails$p;
var global$3 = global$l;

// babel-minify and Closure Compiler transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
var $RegExp$2 = global$3.RegExp;

var UNSUPPORTED_Y$1 = fails$4(function () {
  var re = $RegExp$2('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') !== null;
});

// UC Browser bug
// https://github.com/zloirock/core-js/issues/1008
var MISSED_STICKY = UNSUPPORTED_Y$1 || fails$4(function () {
  return !$RegExp$2('a', 'y').sticky;
});

var BROKEN_CARET = UNSUPPORTED_Y$1 || fails$4(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = $RegExp$2('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') !== null;
});

var regexpStickyHelpers = {
  BROKEN_CARET: BROKEN_CARET,
  MISSED_STICKY: MISSED_STICKY,
  UNSUPPORTED_Y: UNSUPPORTED_Y$1
};

var fails$3 = fails$p;
var global$2 = global$l;

// babel-minify and Closure Compiler transpiles RegExp('.', 's') -> /./s and it causes SyntaxError
var $RegExp$1 = global$2.RegExp;

var regexpUnsupportedDotAll = fails$3(function () {
  var re = $RegExp$1('.', 's');
  return !(re.dotAll && re.test('\n') && re.flags === 's');
});

var fails$2 = fails$p;
var global$1 = global$l;

// babel-minify and Closure Compiler transpiles RegExp('(?<a>b)', 'g') -> /(?<a>b)/g and it causes SyntaxError
var $RegExp = global$1.RegExp;

var regexpUnsupportedNcg = fails$2(function () {
  var re = $RegExp('(?<a>b)', 'g');
  return re.exec('b').groups.a !== 'b' ||
    'b'.replace(re, '$<a>c') !== 'bc';
});

/* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
/* eslint-disable regexp/no-useless-quantifier -- testing */
var call$4 = functionCall;
var uncurryThis$4 = functionUncurryThis;
var toString$2 = toString$7;
var regexpFlags = regexpFlags$1;
var stickyHelpers = regexpStickyHelpers;
var shared = sharedExports;
var create = objectCreate;
var getInternalState = internalState.get;
var UNSUPPORTED_DOT_ALL = regexpUnsupportedDotAll;
var UNSUPPORTED_NCG = regexpUnsupportedNcg;

var nativeReplace = shared('native-string-replace', String.prototype.replace);
var nativeExec = RegExp.prototype.exec;
var patchedExec = nativeExec;
var charAt$2 = uncurryThis$4(''.charAt);
var indexOf = uncurryThis$4(''.indexOf);
var replace$1 = uncurryThis$4(''.replace);
var stringSlice$2 = uncurryThis$4(''.slice);

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  call$4(nativeExec, re1, 'a');
  call$4(nativeExec, re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

var UNSUPPORTED_Y = stickyHelpers.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG;

if (PATCH) {
  patchedExec = function exec(string) {
    var re = this;
    var state = getInternalState(re);
    var str = toString$2(string);
    var raw = state.raw;
    var result, reCopy, lastIndex, match, i, object, group;

    if (raw) {
      raw.lastIndex = re.lastIndex;
      result = call$4(patchedExec, raw, str);
      re.lastIndex = raw.lastIndex;
      return result;
    }

    var groups = state.groups;
    var sticky = UNSUPPORTED_Y && re.sticky;
    var flags = call$4(regexpFlags, re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = replace$1(flags, 'y', '');
      if (indexOf(flags, 'g') === -1) {
        flags += 'g';
      }

      strCopy = stringSlice$2(str, re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt$2(str, re.lastIndex - 1) !== '\n')) {
        source = '(?: ' + source + ')';
        strCopy = ' ' + strCopy;
        charsAdded++;
      }
      // ^(? + rx + ) is needed, in combination with some str slicing, to
      // simulate the 'y' flag.
      reCopy = new RegExp('^(?:' + source + ')', flags);
    }

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

    match = call$4(nativeExec, sticky ? reCopy : re, strCopy);

    if (sticky) {
      if (match) {
        match.input = stringSlice$2(match.input, charsAdded);
        match[0] = stringSlice$2(match[0], charsAdded);
        match.index = re.lastIndex;
        re.lastIndex += match[0].length;
      } else re.lastIndex = 0;
    } else if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn't work for /(.?)?/
      call$4(nativeReplace, match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    if (match && groups) {
      match.groups = object = create(null);
      for (i = 0; i < groups.length; i++) {
        group = groups[i];
        object[group[0]] = match[group[1]];
      }
    }

    return match;
  };
}

var regexpExec$2 = patchedExec;

var $ = _export;
var exec = regexpExec$2;

// `RegExp.prototype.exec` method
// https://tc39.es/ecma262/#sec-regexp.prototype.exec
$({ target: 'RegExp', proto: true, forced: /./.exec !== exec }, {
  exec: exec
});

// TODO: Remove from `core-js@4` since it's moved to entry points

var uncurryThis$3 = functionUncurryThisClause;
var defineBuiltIn = defineBuiltIn$7;
var regexpExec$1 = regexpExec$2;
var fails$1 = fails$p;
var wellKnownSymbol$1 = wellKnownSymbol$f;
var createNonEnumerableProperty = createNonEnumerableProperty$6;

var SPECIES = wellKnownSymbol$1('species');
var RegExpPrototype = RegExp.prototype;

var fixRegexpWellKnownSymbolLogic = function (KEY, exec, FORCED, SHAM) {
  var SYMBOL = wellKnownSymbol$1(KEY);

  var DELEGATES_TO_SYMBOL = !fails$1(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) !== 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails$1(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;

    if (KEY === 'split') {
      // We can't use real regex here since it causes deoptimization
      // and serious performance degradation in V8
      // https://github.com/zloirock/core-js/issues/306
      re = {};
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES] = function () { return re; };
      re.flags = '';
      re[SYMBOL] = /./[SYMBOL];
    }

    re.exec = function () {
      execCalled = true;
      return null;
    };

    re[SYMBOL]('');
    return !execCalled;
  });

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    FORCED
  ) {
    var uncurriedNativeRegExpMethod = uncurryThis$3(/./[SYMBOL]);
    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
      var uncurriedNativeMethod = uncurryThis$3(nativeMethod);
      var $exec = regexp.exec;
      if ($exec === regexpExec$1 || $exec === RegExpPrototype.exec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: uncurriedNativeRegExpMethod(regexp, str, arg2) };
        }
        return { done: true, value: uncurriedNativeMethod(str, regexp, arg2) };
      }
      return { done: false };
    });

    defineBuiltIn(String.prototype, KEY, methods[0]);
    defineBuiltIn(RegExpPrototype, SYMBOL, methods[1]);
  }

  if (SHAM) createNonEnumerableProperty(RegExpPrototype[SYMBOL], 'sham', true);
};

var charAt$1 = stringMultibyte.charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.es/ecma262/#sec-advancestringindex
var advanceStringIndex$2 = function (S, index, unicode) {
  return index + (unicode ? charAt$1(S, index).length : 1);
};

var call$3 = functionCall;
var anObject$2 = anObject$d;
var isCallable$1 = isCallable$j;
var classof = classofRaw$2;
var regexpExec = regexpExec$2;

var $TypeError = TypeError;

// `RegExpExec` abstract operation
// https://tc39.es/ecma262/#sec-regexpexec
var regexpExecAbstract = function (R, S) {
  var exec = R.exec;
  if (isCallable$1(exec)) {
    var result = call$3(exec, R, S);
    if (result !== null) anObject$2(result);
    return result;
  }
  if (classof(R) === 'RegExp') return call$3(regexpExec, R, S);
  throw new $TypeError('RegExp#exec called on incompatible receiver');
};

var call$2 = functionCall;
var fixRegExpWellKnownSymbolLogic$1 = fixRegexpWellKnownSymbolLogic;
var anObject$1 = anObject$d;
var isNullOrUndefined$1 = isNullOrUndefined$7;
var toLength$1 = toLength$3;
var toString$1 = toString$7;
var requireObjectCoercible$1 = requireObjectCoercible$6;
var getMethod$1 = getMethod$5;
var advanceStringIndex$1 = advanceStringIndex$2;
var regExpExec$2 = regexpExecAbstract;

// @@match logic
fixRegExpWellKnownSymbolLogic$1('match', function (MATCH, nativeMatch, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.es/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = requireObjectCoercible$1(this);
      var matcher = isNullOrUndefined$1(regexp) ? undefined : getMethod$1(regexp, MATCH);
      return matcher ? call$2(matcher, regexp, O) : new RegExp(regexp)[MATCH](toString$1(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@match
    function (string) {
      var rx = anObject$1(this);
      var S = toString$1(string);
      var res = maybeCallNative(nativeMatch, rx, S);

      if (res.done) return res.value;

      if (!rx.global) return regExpExec$2(rx, S);

      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regExpExec$2(rx, S)) !== null) {
        var matchStr = toString$1(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex$1(S, toLength$1(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});

var makeBuiltIn = makeBuiltInExports;
var defineProperty = objectDefineProperty;

var defineBuiltInAccessor$1 = function (target, name, descriptor) {
  if (descriptor.get) makeBuiltIn(descriptor.get, name, { getter: true });
  if (descriptor.set) makeBuiltIn(descriptor.set, name, { setter: true });
  return defineProperty.f(target, name, descriptor);
};

var DESCRIPTORS = descriptors;
var FUNCTION_NAME_EXISTS = functionName.EXISTS;
var uncurryThis$2 = functionUncurryThis;
var defineBuiltInAccessor = defineBuiltInAccessor$1;

var FunctionPrototype$1 = Function.prototype;
var functionToString = uncurryThis$2(FunctionPrototype$1.toString);
var nameRE = /function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/;
var regExpExec$1 = uncurryThis$2(nameRE.exec);
var NAME = 'name';

// Function instances `.name` property
// https://tc39.es/ecma262/#sec-function-instances-name
if (DESCRIPTORS && !FUNCTION_NAME_EXISTS) {
  defineBuiltInAccessor(FunctionPrototype$1, NAME, {
    configurable: true,
    get: function () {
      try {
        return regExpExec$1(nameRE, functionToString(this))[1];
      } catch (error) {
        return '';
      }
    }
  });
}

var NATIVE_BIND = functionBindNative;

var FunctionPrototype = Function.prototype;
var apply$1 = FunctionPrototype.apply;
var call$1 = FunctionPrototype.call;

// eslint-disable-next-line es/no-reflect -- safe
var functionApply = typeof Reflect == 'object' && Reflect.apply || (NATIVE_BIND ? call$1.bind(apply$1) : function () {
  return call$1.apply(apply$1, arguments);
});

var uncurryThis$1 = functionUncurryThis;
var toObject = toObject$6;

var floor = Math.floor;
var charAt = uncurryThis$1(''.charAt);
var replace = uncurryThis$1(''.replace);
var stringSlice$1 = uncurryThis$1(''.slice);
// eslint-disable-next-line redos/no-vulnerable -- safe
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;

// `GetSubstitution` abstract operation
// https://tc39.es/ecma262/#sec-getsubstitution
var getSubstitution$1 = function (matched, str, position, captures, namedCaptures, replacement) {
  var tailPos = position + matched.length;
  var m = captures.length;
  var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
  if (namedCaptures !== undefined) {
    namedCaptures = toObject(namedCaptures);
    symbols = SUBSTITUTION_SYMBOLS;
  }
  return replace(replacement, symbols, function (match, ch) {
    var capture;
    switch (charAt(ch, 0)) {
      case '$': return '$';
      case '&': return matched;
      case '`': return stringSlice$1(str, 0, position);
      case "'": return stringSlice$1(str, tailPos);
      case '<':
        capture = namedCaptures[stringSlice$1(ch, 1, -1)];
        break;
      default: // \d\d?
        var n = +ch;
        if (n === 0) return match;
        if (n > m) {
          var f = floor(n / 10);
          if (f === 0) return match;
          if (f <= m) return captures[f - 1] === undefined ? charAt(ch, 1) : captures[f - 1] + charAt(ch, 1);
          return match;
        }
        capture = captures[n - 1];
    }
    return capture === undefined ? '' : capture;
  });
};

var apply = functionApply;
var call = functionCall;
var uncurryThis = functionUncurryThis;
var fixRegExpWellKnownSymbolLogic = fixRegexpWellKnownSymbolLogic;
var fails = fails$p;
var anObject = anObject$d;
var isCallable = isCallable$j;
var isNullOrUndefined = isNullOrUndefined$7;
var toIntegerOrInfinity = toIntegerOrInfinity$4;
var toLength = toLength$3;
var toString = toString$7;
var requireObjectCoercible = requireObjectCoercible$6;
var advanceStringIndex = advanceStringIndex$2;
var getMethod = getMethod$5;
var getSubstitution = getSubstitution$1;
var regExpExec = regexpExecAbstract;
var wellKnownSymbol = wellKnownSymbol$f;

var REPLACE = wellKnownSymbol('replace');
var max = Math.max;
var min = Math.min;
var concat$1 = uncurryThis([].concat);
var push = uncurryThis([].push);
var stringIndexOf = uncurryThis(''.indexOf);
var stringSlice = uncurryThis(''.slice);

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// IE <= 11 replaces $0 with the whole match, as if it was $&
// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
var REPLACE_KEEPS_$0 = (function () {
  // eslint-disable-next-line regexp/prefer-escape-replacement-dollar-char -- required for testing
  return 'a'.replace(/./, '$0') === '$0';
})();

// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
  if (/./[REPLACE]) {
    return /./[REPLACE]('a', '$0') === '';
  }
  return false;
})();

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  // eslint-disable-next-line regexp/no-useless-dollar-replacements -- false positive
  return ''.replace(re, '$<a>') !== '7';
});

// @@replace logic
fixRegExpWellKnownSymbolLogic('replace', function (_, nativeReplace, maybeCallNative) {
  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

  return [
    // `String.prototype.replace` method
    // https://tc39.es/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible(this);
      var replacer = isNullOrUndefined(searchValue) ? undefined : getMethod(searchValue, REPLACE);
      return replacer
        ? call(replacer, searchValue, O, replaceValue)
        : call(nativeReplace, toString(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
    function (string, replaceValue) {
      var rx = anObject(this);
      var S = toString(string);

      if (
        typeof replaceValue == 'string' &&
        stringIndexOf(replaceValue, UNSAFE_SUBSTITUTE) === -1 &&
        stringIndexOf(replaceValue, '$<') === -1
      ) {
        var res = maybeCallNative(nativeReplace, rx, S, replaceValue);
        if (res.done) return res.value;
      }

      var functionalReplace = isCallable(replaceValue);
      if (!functionalReplace) replaceValue = toString(replaceValue);

      var global = rx.global;
      var fullUnicode;
      if (global) {
        fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }

      var results = [];
      var result;
      while (true) {
        result = regExpExec(rx, S);
        if (result === null) break;

        push(results, result);
        if (!global) break;

        var matchStr = toString(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];

        var matched = toString(result[0]);
        var position = max(min(toIntegerOrInfinity(result.index), S.length), 0);
        var captures = [];
        var replacement;
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) push(captures, maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = concat$1([matched], captures, position, S);
          if (namedCaptures !== undefined) push(replacerArgs, namedCaptures);
          replacement = toString(apply(replaceValue, undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += stringSlice(S, nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }

      return accumulatedResult + stringSlice(S, nextSourcePosition);
    }
  ];
}, !REPLACE_SUPPORTS_NAMED_GROUPS || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);

/**
 * SimpleBar.js - v5.3.9
 * Scrollbars, simpler.
 * https://grsmto.github.io/simplebar/
 *
 * Made by Adrien Denat from a fork by Jonathan Nicol
 * Under MIT License
 */


// Helper function to retrieve options from element attributes
var getOptions = function getOptions(obj) {
  var options = Array.prototype.reduce.call(obj, function (acc, attribute) {
    var option = attribute.name.match(/data-simplebar-(.+)/);

    if (option) {
      var key = option[1].replace(/\W+(.)/g, function (x, chr) {
        return chr.toUpperCase();
      });

      switch (attribute.value) {
        case 'true':
          acc[key] = true;
          break;

        case 'false':
          acc[key] = false;
          break;

        case undefined:
          acc[key] = true;
          break;

        default:
          acc[key] = attribute.value;
      }
    }

    return acc;
  }, {});
  return options;
};
function getElementWindow(element) {
  if (!element || !element.ownerDocument || !element.ownerDocument.defaultView) {
    return window;
  }

  return element.ownerDocument.defaultView;
}
function getElementDocument(element) {
  if (!element || !element.ownerDocument) {
    return document;
  }

  return element.ownerDocument;
}

var cachedScrollbarWidth = null;
var cachedDevicePixelRatio = null;

if (canUseDOM$1) {
  window.addEventListener('resize', function () {
    if (cachedDevicePixelRatio !== window.devicePixelRatio) {
      cachedDevicePixelRatio = window.devicePixelRatio;
      cachedScrollbarWidth = null;
    }
  });
}

function scrollbarWidth(el) {
  if (cachedScrollbarWidth === null) {
    var document = getElementDocument(el);

    if (typeof document === 'undefined') {
      cachedScrollbarWidth = 0;
      return cachedScrollbarWidth;
    }

    var body = document.body;
    var box = document.createElement('div');
    box.classList.add('simplebar-hide-scrollbar');
    body.appendChild(box);
    var width = box.getBoundingClientRect().right;
    body.removeChild(box);
    cachedScrollbarWidth = width;
  }

  return cachedScrollbarWidth;
}

var SimpleBar = /*#__PURE__*/function () {
  function SimpleBar(element, options) {
    var _this = this;

    this.onScroll = function () {
      var elWindow = getElementWindow(_this.el);

      if (!_this.scrollXTicking) {
        elWindow.requestAnimationFrame(_this.scrollX);
        _this.scrollXTicking = true;
      }

      if (!_this.scrollYTicking) {
        elWindow.requestAnimationFrame(_this.scrollY);
        _this.scrollYTicking = true;
      }
    };

    this.scrollX = function () {
      if (_this.axis.x.isOverflowing) {
        _this.showScrollbar('x');

        _this.positionScrollbar('x');
      }

      _this.scrollXTicking = false;
    };

    this.scrollY = function () {
      if (_this.axis.y.isOverflowing) {
        _this.showScrollbar('y');

        _this.positionScrollbar('y');
      }

      _this.scrollYTicking = false;
    };

    this.onMouseEnter = function () {
      _this.showScrollbar('x');

      _this.showScrollbar('y');
    };

    this.onMouseMove = function (e) {
      _this.mouseX = e.clientX;
      _this.mouseY = e.clientY;

      if (_this.axis.x.isOverflowing || _this.axis.x.forceVisible) {
        _this.onMouseMoveForAxis('x');
      }

      if (_this.axis.y.isOverflowing || _this.axis.y.forceVisible) {
        _this.onMouseMoveForAxis('y');
      }
    };

    this.onMouseLeave = function () {
      _this.onMouseMove.cancel();

      if (_this.axis.x.isOverflowing || _this.axis.x.forceVisible) {
        _this.onMouseLeaveForAxis('x');
      }

      if (_this.axis.y.isOverflowing || _this.axis.y.forceVisible) {
        _this.onMouseLeaveForAxis('y');
      }

      _this.mouseX = -1;
      _this.mouseY = -1;
    };

    this.onWindowResize = function () {
      // Recalculate scrollbarWidth in case it's a zoom
      _this.scrollbarWidth = _this.getScrollbarWidth();

      _this.hideNativeScrollbar();
    };

    this.hideScrollbars = function () {
      _this.axis.x.track.rect = _this.axis.x.track.el.getBoundingClientRect();
      _this.axis.y.track.rect = _this.axis.y.track.el.getBoundingClientRect();

      if (!_this.isWithinBounds(_this.axis.y.track.rect)) {
        _this.axis.y.scrollbar.el.classList.remove(_this.classNames.visible);

        _this.axis.y.isVisible = false;
      }

      if (!_this.isWithinBounds(_this.axis.x.track.rect)) {
        _this.axis.x.scrollbar.el.classList.remove(_this.classNames.visible);

        _this.axis.x.isVisible = false;
      }
    };

    this.onPointerEvent = function (e) {
      var isWithinTrackXBounds, isWithinTrackYBounds;
      _this.axis.x.track.rect = _this.axis.x.track.el.getBoundingClientRect();
      _this.axis.y.track.rect = _this.axis.y.track.el.getBoundingClientRect();

      if (_this.axis.x.isOverflowing || _this.axis.x.forceVisible) {
        isWithinTrackXBounds = _this.isWithinBounds(_this.axis.x.track.rect);
      }

      if (_this.axis.y.isOverflowing || _this.axis.y.forceVisible) {
        isWithinTrackYBounds = _this.isWithinBounds(_this.axis.y.track.rect);
      } // If any pointer event is called on the scrollbar


      if (isWithinTrackXBounds || isWithinTrackYBounds) {
        // Preventing the event's default action stops text being
        // selectable during the drag.
        e.preventDefault(); // Prevent event leaking

        e.stopPropagation();

        if (e.type === 'mousedown') {
          if (isWithinTrackXBounds) {
            _this.axis.x.scrollbar.rect = _this.axis.x.scrollbar.el.getBoundingClientRect();

            if (_this.isWithinBounds(_this.axis.x.scrollbar.rect)) {
              _this.onDragStart(e, 'x');
            } else {
              _this.onTrackClick(e, 'x');
            }
          }

          if (isWithinTrackYBounds) {
            _this.axis.y.scrollbar.rect = _this.axis.y.scrollbar.el.getBoundingClientRect();

            if (_this.isWithinBounds(_this.axis.y.scrollbar.rect)) {
              _this.onDragStart(e, 'y');
            } else {
              _this.onTrackClick(e, 'y');
            }
          }
        }
      }
    };

    this.drag = function (e) {
      var eventOffset;
      var track = _this.axis[_this.draggedAxis].track;
      var trackSize = track.rect[_this.axis[_this.draggedAxis].sizeAttr];
      var scrollbar = _this.axis[_this.draggedAxis].scrollbar;
      var contentSize = _this.contentWrapperEl[_this.axis[_this.draggedAxis].scrollSizeAttr];
      var hostSize = parseInt(_this.elStyles[_this.axis[_this.draggedAxis].sizeAttr], 10);
      e.preventDefault();
      e.stopPropagation();

      if (_this.draggedAxis === 'y') {
        eventOffset = e.pageY;
      } else {
        eventOffset = e.pageX;
      } // Calculate how far the user's mouse is from the top/left of the scrollbar (minus the dragOffset).


      var dragPos = eventOffset - track.rect[_this.axis[_this.draggedAxis].offsetAttr] - _this.axis[_this.draggedAxis].dragOffset; // Convert the mouse position into a percentage of the scrollbar height/width.

      var dragPerc = dragPos / (trackSize - scrollbar.size); // Scroll the content by the same percentage.

      var scrollPos = dragPerc * (contentSize - hostSize); // Fix browsers inconsistency on RTL

      if (_this.draggedAxis === 'x') {
        scrollPos = _this.isRtl && SimpleBar.getRtlHelpers().isRtlScrollbarInverted ? scrollPos - (trackSize + scrollbar.size) : scrollPos;
        scrollPos = _this.isRtl && SimpleBar.getRtlHelpers().isRtlScrollingInverted ? -scrollPos : scrollPos;
      }

      _this.contentWrapperEl[_this.axis[_this.draggedAxis].scrollOffsetAttr] = scrollPos;
    };

    this.onEndDrag = function (e) {
      var elDocument = getElementDocument(_this.el);
      var elWindow = getElementWindow(_this.el);
      e.preventDefault();
      e.stopPropagation();

      _this.el.classList.remove(_this.classNames.dragging);

      elDocument.removeEventListener('mousemove', _this.drag, true);
      elDocument.removeEventListener('mouseup', _this.onEndDrag, true);
      _this.removePreventClickId = elWindow.setTimeout(function () {
        // Remove these asynchronously so we still suppress click events
        // generated simultaneously with mouseup.
        elDocument.removeEventListener('click', _this.preventClick, true);
        elDocument.removeEventListener('dblclick', _this.preventClick, true);
        _this.removePreventClickId = null;
      });
    };

    this.preventClick = function (e) {
      e.preventDefault();
      e.stopPropagation();
    };

    this.el = element;
    this.minScrollbarWidth = 20;
    this.options = Object.assign({}, SimpleBar.defaultOptions, options);
    this.classNames = Object.assign({}, SimpleBar.defaultOptions.classNames, this.options.classNames);
    this.axis = {
      x: {
        scrollOffsetAttr: 'scrollLeft',
        sizeAttr: 'width',
        scrollSizeAttr: 'scrollWidth',
        offsetSizeAttr: 'offsetWidth',
        offsetAttr: 'left',
        overflowAttr: 'overflowX',
        dragOffset: 0,
        isOverflowing: true,
        isVisible: false,
        forceVisible: false,
        track: {},
        scrollbar: {}
      },
      y: {
        scrollOffsetAttr: 'scrollTop',
        sizeAttr: 'height',
        scrollSizeAttr: 'scrollHeight',
        offsetSizeAttr: 'offsetHeight',
        offsetAttr: 'top',
        overflowAttr: 'overflowY',
        dragOffset: 0,
        isOverflowing: true,
        isVisible: false,
        forceVisible: false,
        track: {},
        scrollbar: {}
      }
    };
    this.removePreventClickId = null; // Don't re-instantiate over an existing one

    if (SimpleBar.instances.has(this.el)) {
      return;
    }

    this.recalculate = throttle$1(this.recalculate.bind(this), 64);
    this.onMouseMove = throttle$1(this.onMouseMove.bind(this), 64);
    this.hideScrollbars = debounce$1(this.hideScrollbars.bind(this), this.options.timeout);
    this.onWindowResize = debounce$1(this.onWindowResize.bind(this), 64, {
      leading: true
    });
    SimpleBar.getRtlHelpers = memoize$1(SimpleBar.getRtlHelpers);
    this.init();
  }
  /**
   * Static properties
   */

  /**
   * Helper to fix browsers inconsistency on RTL:
   *  - Firefox inverts the scrollbar initial position
   *  - IE11 inverts both scrollbar position and scrolling offset
   * Directly inspired by @KingSora's OverlayScrollbars https://github.com/KingSora/OverlayScrollbars/blob/master/js/OverlayScrollbars.js#L1634
   */


  SimpleBar.getRtlHelpers = function getRtlHelpers() {
    var dummyDiv = document.createElement('div');
    dummyDiv.innerHTML = '<div class="hs-dummy-scrollbar-size"><div style="height: 200%; width: 200%; margin: 10px 0;"></div></div>';
    var scrollbarDummyEl = dummyDiv.firstElementChild;
    document.body.appendChild(scrollbarDummyEl);
    var dummyContainerChild = scrollbarDummyEl.firstElementChild;
    scrollbarDummyEl.scrollLeft = 0;
    var dummyContainerOffset = SimpleBar.getOffset(scrollbarDummyEl);
    var dummyContainerChildOffset = SimpleBar.getOffset(dummyContainerChild);
    scrollbarDummyEl.scrollLeft = 999;
    var dummyContainerScrollOffsetAfterScroll = SimpleBar.getOffset(dummyContainerChild);
    return {
      // determines if the scrolling is responding with negative values
      isRtlScrollingInverted: dummyContainerOffset.left !== dummyContainerChildOffset.left && dummyContainerChildOffset.left - dummyContainerScrollOffsetAfterScroll.left !== 0,
      // determines if the origin scrollbar position is inverted or not (positioned on left or right)
      isRtlScrollbarInverted: dummyContainerOffset.left !== dummyContainerChildOffset.left
    };
  };

  SimpleBar.getOffset = function getOffset(el) {
    var rect = el.getBoundingClientRect();
    var elDocument = getElementDocument(el);
    var elWindow = getElementWindow(el);
    return {
      top: rect.top + (elWindow.pageYOffset || elDocument.documentElement.scrollTop),
      left: rect.left + (elWindow.pageXOffset || elDocument.documentElement.scrollLeft)
    };
  };

  var _proto = SimpleBar.prototype;

  _proto.init = function init() {
    // Save a reference to the instance, so we know this DOM node has already been instancied
    SimpleBar.instances.set(this.el, this); // We stop here on server-side

    if (canUseDOM$1) {
      this.initDOM();
      this.setAccessibilityAttributes();
      this.scrollbarWidth = this.getScrollbarWidth();
      this.recalculate();
      this.initListeners();
    }
  };

  _proto.initDOM = function initDOM() {
    var _this2 = this;

    // make sure this element doesn't have the elements yet
    if (Array.prototype.filter.call(this.el.children, function (child) {
      return child.classList.contains(_this2.classNames.wrapper);
    }).length) {
      // assume that element has his DOM already initiated
      this.wrapperEl = this.el.querySelector("." + this.classNames.wrapper);
      this.contentWrapperEl = this.options.scrollableNode || this.el.querySelector("." + this.classNames.contentWrapper);
      this.contentEl = this.options.contentNode || this.el.querySelector("." + this.classNames.contentEl);
      this.offsetEl = this.el.querySelector("." + this.classNames.offset);
      this.maskEl = this.el.querySelector("." + this.classNames.mask);
      this.placeholderEl = this.findChild(this.wrapperEl, "." + this.classNames.placeholder);
      this.heightAutoObserverWrapperEl = this.el.querySelector("." + this.classNames.heightAutoObserverWrapperEl);
      this.heightAutoObserverEl = this.el.querySelector("." + this.classNames.heightAutoObserverEl);
      this.axis.x.track.el = this.findChild(this.el, "." + this.classNames.track + "." + this.classNames.horizontal);
      this.axis.y.track.el = this.findChild(this.el, "." + this.classNames.track + "." + this.classNames.vertical);
    } else {
      // Prepare DOM
      this.wrapperEl = document.createElement('div');
      this.contentWrapperEl = document.createElement('div');
      this.offsetEl = document.createElement('div');
      this.maskEl = document.createElement('div');
      this.contentEl = document.createElement('div');
      this.placeholderEl = document.createElement('div');
      this.heightAutoObserverWrapperEl = document.createElement('div');
      this.heightAutoObserverEl = document.createElement('div');
      this.wrapperEl.classList.add(this.classNames.wrapper);
      this.contentWrapperEl.classList.add(this.classNames.contentWrapper);
      this.offsetEl.classList.add(this.classNames.offset);
      this.maskEl.classList.add(this.classNames.mask);
      this.contentEl.classList.add(this.classNames.contentEl);
      this.placeholderEl.classList.add(this.classNames.placeholder);
      this.heightAutoObserverWrapperEl.classList.add(this.classNames.heightAutoObserverWrapperEl);
      this.heightAutoObserverEl.classList.add(this.classNames.heightAutoObserverEl);

      while (this.el.firstChild) {
        this.contentEl.appendChild(this.el.firstChild);
      }

      this.contentWrapperEl.appendChild(this.contentEl);
      this.offsetEl.appendChild(this.contentWrapperEl);
      this.maskEl.appendChild(this.offsetEl);
      this.heightAutoObserverWrapperEl.appendChild(this.heightAutoObserverEl);
      this.wrapperEl.appendChild(this.heightAutoObserverWrapperEl);
      this.wrapperEl.appendChild(this.maskEl);
      this.wrapperEl.appendChild(this.placeholderEl);
      this.el.appendChild(this.wrapperEl);
    }

    if (!this.axis.x.track.el || !this.axis.y.track.el) {
      var track = document.createElement('div');
      var scrollbar = document.createElement('div');
      track.classList.add(this.classNames.track);
      scrollbar.classList.add(this.classNames.scrollbar);
      track.appendChild(scrollbar);
      this.axis.x.track.el = track.cloneNode(true);
      this.axis.x.track.el.classList.add(this.classNames.horizontal);
      this.axis.y.track.el = track.cloneNode(true);
      this.axis.y.track.el.classList.add(this.classNames.vertical);
      this.el.appendChild(this.axis.x.track.el);
      this.el.appendChild(this.axis.y.track.el);
    }

    this.axis.x.scrollbar.el = this.axis.x.track.el.querySelector("." + this.classNames.scrollbar);
    this.axis.y.scrollbar.el = this.axis.y.track.el.querySelector("." + this.classNames.scrollbar);

    if (!this.options.autoHide) {
      this.axis.x.scrollbar.el.classList.add(this.classNames.visible);
      this.axis.y.scrollbar.el.classList.add(this.classNames.visible);
    }

    this.el.setAttribute('data-simplebar', 'init');
  };

  _proto.setAccessibilityAttributes = function setAccessibilityAttributes() {
    var ariaLabel = this.options.ariaLabel || 'scrollable content';
    this.contentWrapperEl.setAttribute('tabindex', '0');
    this.contentWrapperEl.setAttribute('role', 'region');
    this.contentWrapperEl.setAttribute('aria-label', ariaLabel);
  };

  _proto.initListeners = function initListeners() {
    var _this3 = this;

    var elWindow = getElementWindow(this.el); // Event listeners

    if (this.options.autoHide) {
      this.el.addEventListener('mouseenter', this.onMouseEnter);
    }

    ['mousedown', 'click', 'dblclick'].forEach(function (e) {
      _this3.el.addEventListener(e, _this3.onPointerEvent, true);
    });
    ['touchstart', 'touchend', 'touchmove'].forEach(function (e) {
      _this3.el.addEventListener(e, _this3.onPointerEvent, {
        capture: true,
        passive: true
      });
    });
    this.el.addEventListener('mousemove', this.onMouseMove);
    this.el.addEventListener('mouseleave', this.onMouseLeave);
    this.contentWrapperEl.addEventListener('scroll', this.onScroll); // Browser zoom triggers a window resize

    elWindow.addEventListener('resize', this.onWindowResize); // Hack for https://github.com/WICG/ResizeObserver/issues/38

    var resizeObserverStarted = false;
    var resizeAnimationFrameId = null;
    var resizeObserver = elWindow.ResizeObserver || ResizeObserver;
    this.resizeObserver = new resizeObserver(function () {
      if (!resizeObserverStarted || resizeAnimationFrameId !== null) return;
      resizeAnimationFrameId = elWindow.requestAnimationFrame(function () {
        _this3.recalculate();

        resizeAnimationFrameId = null;
      });
    });
    this.resizeObserver.observe(this.el);
    this.resizeObserver.observe(this.contentEl);
    elWindow.requestAnimationFrame(function () {
      resizeObserverStarted = true;
    }); // This is required to detect horizontal scroll. Vertical scroll only needs the resizeObserver.

    this.mutationObserver = new elWindow.MutationObserver(this.recalculate);
    this.mutationObserver.observe(this.contentEl, {
      childList: true,
      subtree: true,
      characterData: true
    });
  };

  _proto.recalculate = function recalculate() {
    var elWindow = getElementWindow(this.el);
    this.elStyles = elWindow.getComputedStyle(this.el);
    this.isRtl = this.elStyles.direction === 'rtl';
    var isHeightAuto = this.heightAutoObserverEl.offsetHeight <= 1;
    var isWidthAuto = this.heightAutoObserverEl.offsetWidth <= 1;
    var contentElOffsetWidth = this.contentEl.offsetWidth;
    var contentWrapperElOffsetWidth = this.contentWrapperEl.offsetWidth;
    var elOverflowX = this.elStyles.overflowX;
    var elOverflowY = this.elStyles.overflowY;
    this.contentEl.style.padding = this.elStyles.paddingTop + " " + this.elStyles.paddingRight + " " + this.elStyles.paddingBottom + " " + this.elStyles.paddingLeft;
    this.wrapperEl.style.margin = "-" + this.elStyles.paddingTop + " -" + this.elStyles.paddingRight + " -" + this.elStyles.paddingBottom + " -" + this.elStyles.paddingLeft;
    var contentElScrollHeight = this.contentEl.scrollHeight;
    var contentElScrollWidth = this.contentEl.scrollWidth;
    this.contentWrapperEl.style.height = isHeightAuto ? 'auto' : '100%'; // Determine placeholder size

    this.placeholderEl.style.width = isWidthAuto ? contentElOffsetWidth + "px" : 'auto';
    this.placeholderEl.style.height = contentElScrollHeight + "px";
    var contentWrapperElOffsetHeight = this.contentWrapperEl.offsetHeight;
    this.axis.x.isOverflowing = contentElScrollWidth > contentElOffsetWidth;
    this.axis.y.isOverflowing = contentElScrollHeight > contentWrapperElOffsetHeight; // Set isOverflowing to false if user explicitely set hidden overflow

    this.axis.x.isOverflowing = elOverflowX === 'hidden' ? false : this.axis.x.isOverflowing;
    this.axis.y.isOverflowing = elOverflowY === 'hidden' ? false : this.axis.y.isOverflowing;
    this.axis.x.forceVisible = this.options.forceVisible === 'x' || this.options.forceVisible === true;
    this.axis.y.forceVisible = this.options.forceVisible === 'y' || this.options.forceVisible === true;
    this.hideNativeScrollbar(); // Set isOverflowing to false if scrollbar is not necessary (content is shorter than offset)

    var offsetForXScrollbar = this.axis.x.isOverflowing ? this.scrollbarWidth : 0;
    var offsetForYScrollbar = this.axis.y.isOverflowing ? this.scrollbarWidth : 0;
    this.axis.x.isOverflowing = this.axis.x.isOverflowing && contentElScrollWidth > contentWrapperElOffsetWidth - offsetForYScrollbar;
    this.axis.y.isOverflowing = this.axis.y.isOverflowing && contentElScrollHeight > contentWrapperElOffsetHeight - offsetForXScrollbar;
    this.axis.x.scrollbar.size = this.getScrollbarSize('x');
    this.axis.y.scrollbar.size = this.getScrollbarSize('y');
    this.axis.x.scrollbar.el.style.width = this.axis.x.scrollbar.size + "px";
    this.axis.y.scrollbar.el.style.height = this.axis.y.scrollbar.size + "px";
    this.positionScrollbar('x');
    this.positionScrollbar('y');
    this.toggleTrackVisibility('x');
    this.toggleTrackVisibility('y');
  }
  /**
   * Calculate scrollbar size
   */
  ;

  _proto.getScrollbarSize = function getScrollbarSize(axis) {
    if (axis === void 0) {
      axis = 'y';
    }

    if (!this.axis[axis].isOverflowing) {
      return 0;
    }

    var contentSize = this.contentEl[this.axis[axis].scrollSizeAttr];
    var trackSize = this.axis[axis].track.el[this.axis[axis].offsetSizeAttr];
    var scrollbarSize;
    var scrollbarRatio = trackSize / contentSize; // Calculate new height/position of drag handle.

    scrollbarSize = Math.max(~~(scrollbarRatio * trackSize), this.options.scrollbarMinSize);

    if (this.options.scrollbarMaxSize) {
      scrollbarSize = Math.min(scrollbarSize, this.options.scrollbarMaxSize);
    }

    return scrollbarSize;
  };

  _proto.positionScrollbar = function positionScrollbar(axis) {
    if (axis === void 0) {
      axis = 'y';
    }

    if (!this.axis[axis].isOverflowing) {
      return;
    }

    var contentSize = this.contentWrapperEl[this.axis[axis].scrollSizeAttr];
    var trackSize = this.axis[axis].track.el[this.axis[axis].offsetSizeAttr];
    var hostSize = parseInt(this.elStyles[this.axis[axis].sizeAttr], 10);
    var scrollbar = this.axis[axis].scrollbar;
    var scrollOffset = this.contentWrapperEl[this.axis[axis].scrollOffsetAttr];
    scrollOffset = axis === 'x' && this.isRtl && SimpleBar.getRtlHelpers().isRtlScrollingInverted ? -scrollOffset : scrollOffset;
    var scrollPourcent = scrollOffset / (contentSize - hostSize);
    var handleOffset = ~~((trackSize - scrollbar.size) * scrollPourcent);
    handleOffset = axis === 'x' && this.isRtl && SimpleBar.getRtlHelpers().isRtlScrollbarInverted ? handleOffset + (trackSize - scrollbar.size) : handleOffset;
    scrollbar.el.style.transform = axis === 'x' ? "translate3d(" + handleOffset + "px, 0, 0)" : "translate3d(0, " + handleOffset + "px, 0)";
  };

  _proto.toggleTrackVisibility = function toggleTrackVisibility(axis) {
    if (axis === void 0) {
      axis = 'y';
    }

    var track = this.axis[axis].track.el;
    var scrollbar = this.axis[axis].scrollbar.el;

    if (this.axis[axis].isOverflowing || this.axis[axis].forceVisible) {
      track.style.visibility = 'visible';
      this.contentWrapperEl.style[this.axis[axis].overflowAttr] = 'scroll';
    } else {
      track.style.visibility = 'hidden';
      this.contentWrapperEl.style[this.axis[axis].overflowAttr] = 'hidden';
    } // Even if forceVisible is enabled, scrollbar itself should be hidden


    if (this.axis[axis].isOverflowing) {
      scrollbar.style.display = 'block';
    } else {
      scrollbar.style.display = 'none';
    }
  };

  _proto.hideNativeScrollbar = function hideNativeScrollbar() {
    this.offsetEl.style[this.isRtl ? 'left' : 'right'] = this.axis.y.isOverflowing || this.axis.y.forceVisible ? "-" + this.scrollbarWidth + "px" : 0;
    this.offsetEl.style.bottom = this.axis.x.isOverflowing || this.axis.x.forceVisible ? "-" + this.scrollbarWidth + "px" : 0;
  }
  /**
   * On scroll event handling
   */
  ;

  _proto.onMouseMoveForAxis = function onMouseMoveForAxis(axis) {
    if (axis === void 0) {
      axis = 'y';
    }

    this.axis[axis].track.rect = this.axis[axis].track.el.getBoundingClientRect();
    this.axis[axis].scrollbar.rect = this.axis[axis].scrollbar.el.getBoundingClientRect();
    var isWithinScrollbarBoundsX = this.isWithinBounds(this.axis[axis].scrollbar.rect);

    if (isWithinScrollbarBoundsX) {
      this.axis[axis].scrollbar.el.classList.add(this.classNames.hover);
    } else {
      this.axis[axis].scrollbar.el.classList.remove(this.classNames.hover);
    }

    if (this.isWithinBounds(this.axis[axis].track.rect)) {
      this.showScrollbar(axis);
      this.axis[axis].track.el.classList.add(this.classNames.hover);
    } else {
      this.axis[axis].track.el.classList.remove(this.classNames.hover);
    }
  };

  _proto.onMouseLeaveForAxis = function onMouseLeaveForAxis(axis) {
    if (axis === void 0) {
      axis = 'y';
    }

    this.axis[axis].track.el.classList.remove(this.classNames.hover);
    this.axis[axis].scrollbar.el.classList.remove(this.classNames.hover);
  };

  /**
   * Show scrollbar
   */
  _proto.showScrollbar = function showScrollbar(axis) {
    if (axis === void 0) {
      axis = 'y';
    }

    var scrollbar = this.axis[axis].scrollbar.el;

    if (!this.axis[axis].isVisible) {
      scrollbar.classList.add(this.classNames.visible);
      this.axis[axis].isVisible = true;
    }

    if (this.options.autoHide) {
      this.hideScrollbars();
    }
  }
  /**
   * Hide Scrollbar
   */
  ;

  /**
   * on scrollbar handle drag movement starts
   */
  _proto.onDragStart = function onDragStart(e, axis) {
    if (axis === void 0) {
      axis = 'y';
    }

    var elDocument = getElementDocument(this.el);
    var elWindow = getElementWindow(this.el);
    var scrollbar = this.axis[axis].scrollbar; // Measure how far the user's mouse is from the top of the scrollbar drag handle.

    var eventOffset = axis === 'y' ? e.pageY : e.pageX;
    this.axis[axis].dragOffset = eventOffset - scrollbar.rect[this.axis[axis].offsetAttr];
    this.draggedAxis = axis;
    this.el.classList.add(this.classNames.dragging);
    elDocument.addEventListener('mousemove', this.drag, true);
    elDocument.addEventListener('mouseup', this.onEndDrag, true);

    if (this.removePreventClickId === null) {
      elDocument.addEventListener('click', this.preventClick, true);
      elDocument.addEventListener('dblclick', this.preventClick, true);
    } else {
      elWindow.clearTimeout(this.removePreventClickId);
      this.removePreventClickId = null;
    }
  }
  /**
   * Drag scrollbar handle
   */
  ;

  _proto.onTrackClick = function onTrackClick(e, axis) {
    var _this4 = this;

    if (axis === void 0) {
      axis = 'y';
    }

    if (!this.options.clickOnTrack) return;
    var elWindow = getElementWindow(this.el);
    this.axis[axis].scrollbar.rect = this.axis[axis].scrollbar.el.getBoundingClientRect();
    var scrollbar = this.axis[axis].scrollbar;
    var scrollbarOffset = scrollbar.rect[this.axis[axis].offsetAttr];
    var hostSize = parseInt(this.elStyles[this.axis[axis].sizeAttr], 10);
    var scrolled = this.contentWrapperEl[this.axis[axis].scrollOffsetAttr];
    var t = axis === 'y' ? this.mouseY - scrollbarOffset : this.mouseX - scrollbarOffset;
    var dir = t < 0 ? -1 : 1;
    var scrollSize = dir === -1 ? scrolled - hostSize : scrolled + hostSize;

    var scrollTo = function scrollTo() {
      if (dir === -1) {
        if (scrolled > scrollSize) {
          var _this4$contentWrapper;

          scrolled -= _this4.options.clickOnTrackSpeed;

          _this4.contentWrapperEl.scrollTo((_this4$contentWrapper = {}, _this4$contentWrapper[_this4.axis[axis].offsetAttr] = scrolled, _this4$contentWrapper));

          elWindow.requestAnimationFrame(scrollTo);
        }
      } else {
        if (scrolled < scrollSize) {
          var _this4$contentWrapper2;

          scrolled += _this4.options.clickOnTrackSpeed;

          _this4.contentWrapperEl.scrollTo((_this4$contentWrapper2 = {}, _this4$contentWrapper2[_this4.axis[axis].offsetAttr] = scrolled, _this4$contentWrapper2));

          elWindow.requestAnimationFrame(scrollTo);
        }
      }
    };

    scrollTo();
  }
  /**
   * Getter for content element
   */
  ;

  _proto.getContentElement = function getContentElement() {
    return this.contentEl;
  }
  /**
   * Getter for original scrolling element
   */
  ;

  _proto.getScrollElement = function getScrollElement() {
    return this.contentWrapperEl;
  };

  _proto.getScrollbarWidth = function getScrollbarWidth() {
    // Try/catch for FF 56 throwing on undefined computedStyles
    try {
      // Detect browsers supporting CSS scrollbar styling and do not calculate
      if (getComputedStyle(this.contentWrapperEl, '::-webkit-scrollbar').display === 'none' || 'scrollbarWidth' in document.documentElement.style || '-ms-overflow-style' in document.documentElement.style) {
        return 0;
      } else {
        return scrollbarWidth(this.el);
      }
    } catch (e) {
      return scrollbarWidth(this.el);
    }
  };

  _proto.removeListeners = function removeListeners() {
    var _this5 = this;

    var elWindow = getElementWindow(this.el); // Event listeners

    if (this.options.autoHide) {
      this.el.removeEventListener('mouseenter', this.onMouseEnter);
    }

    ['mousedown', 'click', 'dblclick'].forEach(function (e) {
      _this5.el.removeEventListener(e, _this5.onPointerEvent, true);
    });
    ['touchstart', 'touchend', 'touchmove'].forEach(function (e) {
      _this5.el.removeEventListener(e, _this5.onPointerEvent, {
        capture: true,
        passive: true
      });
    });
    this.el.removeEventListener('mousemove', this.onMouseMove);
    this.el.removeEventListener('mouseleave', this.onMouseLeave);

    if (this.contentWrapperEl) {
      this.contentWrapperEl.removeEventListener('scroll', this.onScroll);
    }

    elWindow.removeEventListener('resize', this.onWindowResize);

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    } // Cancel all debounced functions


    this.recalculate.cancel();
    this.onMouseMove.cancel();
    this.hideScrollbars.cancel();
    this.onWindowResize.cancel();
  }
  /**
   * UnMount mutation observer and delete SimpleBar instance from DOM element
   */
  ;

  _proto.unMount = function unMount() {
    this.removeListeners();
    SimpleBar.instances.delete(this.el);
  }
  /**
   * Check if mouse is within bounds
   */
  ;

  _proto.isWithinBounds = function isWithinBounds(bbox) {
    return this.mouseX >= bbox.left && this.mouseX <= bbox.left + bbox.width && this.mouseY >= bbox.top && this.mouseY <= bbox.top + bbox.height;
  }
  /**
   * Find element children matches query
   */
  ;

  _proto.findChild = function findChild(el, query) {
    var matches = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
    return Array.prototype.filter.call(el.children, function (child) {
      return matches.call(child, query);
    })[0];
  };

  return SimpleBar;
}();

SimpleBar.defaultOptions = {
  autoHide: true,
  forceVisible: false,
  clickOnTrack: true,
  clickOnTrackSpeed: 40,
  classNames: {
    contentEl: 'simplebar-content',
    contentWrapper: 'simplebar-content-wrapper',
    offset: 'simplebar-offset',
    mask: 'simplebar-mask',
    wrapper: 'simplebar-wrapper',
    placeholder: 'simplebar-placeholder',
    scrollbar: 'simplebar-scrollbar',
    track: 'simplebar-track',
    heightAutoObserverWrapperEl: 'simplebar-height-auto-observer-wrapper',
    heightAutoObserverEl: 'simplebar-height-auto-observer',
    visible: 'simplebar-visible',
    horizontal: 'simplebar-horizontal',
    vertical: 'simplebar-vertical',
    hover: 'simplebar-hover',
    dragging: 'simplebar-dragging'
  },
  scrollbarMinSize: 25,
  scrollbarMaxSize: 0,
  timeout: 1000
};
SimpleBar.instances = new WeakMap();

SimpleBar.initDOMLoadedElements = function () {
  document.removeEventListener('DOMContentLoaded', this.initDOMLoadedElements);
  window.removeEventListener('load', this.initDOMLoadedElements);
  Array.prototype.forEach.call(document.querySelectorAll('[data-simplebar]'), function (el) {
    if (el.getAttribute('data-simplebar') !== 'init' && !SimpleBar.instances.has(el)) new SimpleBar(el, getOptions(el.attributes));
  });
};

SimpleBar.removeObserver = function () {
  this.globalObserver.disconnect();
};

SimpleBar.initHtmlApi = function () {
  this.initDOMLoadedElements = this.initDOMLoadedElements.bind(this); // MutationObserver is IE11+

  if (typeof MutationObserver !== 'undefined') {
    // Mutation observer to observe dynamically added elements
    this.globalObserver = new MutationObserver(SimpleBar.handleMutations);
    this.globalObserver.observe(document, {
      childList: true,
      subtree: true
    });
  } // Taken from jQuery `ready` function
  // Instantiate elements already present on the page


  if (document.readyState === 'complete' || document.readyState !== 'loading' && !document.documentElement.doScroll) {
    // Handle it asynchronously to allow scripts the opportunity to delay init
    window.setTimeout(this.initDOMLoadedElements);
  } else {
    document.addEventListener('DOMContentLoaded', this.initDOMLoadedElements);
    window.addEventListener('load', this.initDOMLoadedElements);
  }
};

SimpleBar.handleMutations = function (mutations) {
  mutations.forEach(function (mutation) {
    Array.prototype.forEach.call(mutation.addedNodes, function (addedNode) {
      if (addedNode.nodeType === 1) {
        if (addedNode.hasAttribute('data-simplebar')) {
          !SimpleBar.instances.has(addedNode) && document.documentElement.contains(addedNode) && new SimpleBar(addedNode, getOptions(addedNode.attributes));
        } else {
          Array.prototype.forEach.call(addedNode.querySelectorAll('[data-simplebar]'), function (el) {
            if (el.getAttribute('data-simplebar') !== 'init' && !SimpleBar.instances.has(el) && document.documentElement.contains(el)) new SimpleBar(el, getOptions(el.attributes));
          });
        }
      }
    });
    Array.prototype.forEach.call(mutation.removedNodes, function (removedNode) {
      if (removedNode.nodeType === 1) {
        if (removedNode.getAttribute('data-simplebar') === 'init') {
          SimpleBar.instances.has(removedNode) && !document.documentElement.contains(removedNode) && SimpleBar.instances.get(removedNode).unMount();
        } else {
          Array.prototype.forEach.call(removedNode.querySelectorAll('[data-simplebar="init"]'), function (el) {
            SimpleBar.instances.has(el) && !document.documentElement.contains(el) && SimpleBar.instances.get(el).unMount();
          });
        }
      }
    });
  });
};

SimpleBar.getOptions = getOptions;
/**
 * HTML API
 * Called only in a browser env.
 */

if (canUseDOM$1) {
  SimpleBar.initHtmlApi();
}

/* eslint-disable no-multi-assign */

function deepFreeze(obj) {
  if (obj instanceof Map) {
    obj.clear =
      obj.delete =
      obj.set =
        function () {
          throw new Error('map is read-only');
        };
  } else if (obj instanceof Set) {
    obj.add =
      obj.clear =
      obj.delete =
        function () {
          throw new Error('set is read-only');
        };
  }

  // Freeze self
  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((name) => {
    const prop = obj[name];
    const type = typeof prop;

    // Freeze prop if it is an object or function and also not already frozen
    if ((type === 'object' || type === 'function') && !Object.isFrozen(prop)) {
      deepFreeze(prop);
    }
  });

  return obj;
}

/** @typedef {import('highlight.js').CallbackResponse} CallbackResponse */
/** @typedef {import('highlight.js').CompiledMode} CompiledMode */
/** @implements CallbackResponse */

class Response {
  /**
   * @param {CompiledMode} mode
   */
  constructor(mode) {
    // eslint-disable-next-line no-undefined
    if (mode.data === undefined) mode.data = {};

    this.data = mode.data;
    this.isMatchIgnored = false;
  }

  ignoreMatch() {
    this.isMatchIgnored = true;
  }
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeHTML(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * performs a shallow merge of multiple objects into one
 *
 * @template T
 * @param {T} original
 * @param {Record<string,any>[]} objects
 * @returns {T} a single new object
 */
function inherit$1(original, ...objects) {
  /** @type Record<string,any> */
  const result = Object.create(null);

  for (const key in original) {
    result[key] = original[key];
  }
  objects.forEach(function(obj) {
    for (const key in obj) {
      result[key] = obj[key];
    }
  });
  return /** @type {T} */ (result);
}

/**
 * @typedef {object} Renderer
 * @property {(text: string) => void} addText
 * @property {(node: Node) => void} openNode
 * @property {(node: Node) => void} closeNode
 * @property {() => string} value
 */

/** @typedef {{scope?: string, language?: string, sublanguage?: boolean}} Node */
/** @typedef {{walk: (r: Renderer) => void}} Tree */
/** */

const SPAN_CLOSE = '</span>';

/**
 * Determines if a node needs to be wrapped in <span>
 *
 * @param {Node} node */
const emitsWrappingTags = (node) => {
  // rarely we can have a sublanguage where language is undefined
  // TODO: track down why
  return !!node.scope;
};

/**
 *
 * @param {string} name
 * @param {{prefix:string}} options
 */
const scopeToCSSClass = (name, { prefix }) => {
  // sub-language
  if (name.startsWith("language:")) {
    return name.replace("language:", "language-");
  }
  // tiered scope: comment.line
  if (name.includes(".")) {
    const pieces = name.split(".");
    return [
      `${prefix}${pieces.shift()}`,
      ...(pieces.map((x, i) => `${x}${"_".repeat(i + 1)}`))
    ].join(" ");
  }
  // simple scope
  return `${prefix}${name}`;
};

/** @type {Renderer} */
class HTMLRenderer {
  /**
   * Creates a new HTMLRenderer
   *
   * @param {Tree} parseTree - the parse tree (must support `walk` API)
   * @param {{classPrefix: string}} options
   */
  constructor(parseTree, options) {
    this.buffer = "";
    this.classPrefix = options.classPrefix;
    parseTree.walk(this);
  }

  /**
   * Adds texts to the output stream
   *
   * @param {string} text */
  addText(text) {
    this.buffer += escapeHTML(text);
  }

  /**
   * Adds a node open to the output stream (if needed)
   *
   * @param {Node} node */
  openNode(node) {
    if (!emitsWrappingTags(node)) return;

    const className = scopeToCSSClass(node.scope,
      { prefix: this.classPrefix });
    this.span(className);
  }

  /**
   * Adds a node close to the output stream (if needed)
   *
   * @param {Node} node */
  closeNode(node) {
    if (!emitsWrappingTags(node)) return;

    this.buffer += SPAN_CLOSE;
  }

  /**
   * returns the accumulated buffer
  */
  value() {
    return this.buffer;
  }

  // helpers

  /**
   * Builds a span element
   *
   * @param {string} className */
  span(className) {
    this.buffer += `<span class="${className}">`;
  }
}

/** @typedef {{scope?: string, language?: string, children: Node[]} | string} Node */
/** @typedef {{scope?: string, language?: string, children: Node[]} } DataNode */
/** @typedef {import('highlight.js').Emitter} Emitter */
/**  */

/** @returns {DataNode} */
const newNode = (opts = {}) => {
  /** @type DataNode */
  const result = { children: [] };
  Object.assign(result, opts);
  return result;
};

class TokenTree {
  constructor() {
    /** @type DataNode */
    this.rootNode = newNode();
    this.stack = [this.rootNode];
  }

  get top() {
    return this.stack[this.stack.length - 1];
  }

  get root() { return this.rootNode; }

  /** @param {Node} node */
  add(node) {
    this.top.children.push(node);
  }

  /** @param {string} scope */
  openNode(scope) {
    /** @type Node */
    const node = newNode({ scope });
    this.add(node);
    this.stack.push(node);
  }

  closeNode() {
    if (this.stack.length > 1) {
      return this.stack.pop();
    }
    // eslint-disable-next-line no-undefined
    return undefined;
  }

  closeAllNodes() {
    while (this.closeNode());
  }

  toJSON() {
    return JSON.stringify(this.rootNode, null, 4);
  }

  /**
   * @typedef { import("./html_renderer").Renderer } Renderer
   * @param {Renderer} builder
   */
  walk(builder) {
    // this does not
    return this.constructor._walk(builder, this.rootNode);
    // this works
    // return TokenTree._walk(builder, this.rootNode);
  }

  /**
   * @param {Renderer} builder
   * @param {Node} node
   */
  static _walk(builder, node) {
    if (typeof node === "string") {
      builder.addText(node);
    } else if (node.children) {
      builder.openNode(node);
      node.children.forEach((child) => this._walk(builder, child));
      builder.closeNode(node);
    }
    return builder;
  }

  /**
   * @param {Node} node
   */
  static _collapse(node) {
    if (typeof node === "string") return;
    if (!node.children) return;

    if (node.children.every(el => typeof el === "string")) {
      // node.text = node.children.join("");
      // delete node.children;
      node.children = [node.children.join("")];
    } else {
      node.children.forEach((child) => {
        TokenTree._collapse(child);
      });
    }
  }
}

/**
  Currently this is all private API, but this is the minimal API necessary
  that an Emitter must implement to fully support the parser.

  Minimal interface:

  - addText(text)
  - __addSublanguage(emitter, subLanguageName)
  - startScope(scope)
  - endScope()
  - finalize()
  - toHTML()

*/

/**
 * @implements {Emitter}
 */
class TokenTreeEmitter extends TokenTree {
  /**
   * @param {*} options
   */
  constructor(options) {
    super();
    this.options = options;
  }

  /**
   * @param {string} text
   */
  addText(text) {
    if (text === "") { return; }

    this.add(text);
  }

  /** @param {string} scope */
  startScope(scope) {
    this.openNode(scope);
  }

  endScope() {
    this.closeNode();
  }

  /**
   * @param {Emitter & {root: DataNode}} emitter
   * @param {string} name
   */
  __addSublanguage(emitter, name) {
    /** @type DataNode */
    const node = emitter.root;
    if (name) node.scope = `language:${name}`;

    this.add(node);
  }

  toHTML() {
    const renderer = new HTMLRenderer(this, this.options);
    return renderer.value();
  }

  finalize() {
    this.closeAllNodes();
    return true;
  }
}

/**
 * @param {string} value
 * @returns {RegExp}
 * */

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function source(re) {
  if (!re) return null;
  if (typeof re === "string") return re;

  return re.source;
}

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function lookahead(re) {
  return concat('(?=', re, ')');
}

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function anyNumberOfTimes(re) {
  return concat('(?:', re, ')*');
}

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function optional(re) {
  return concat('(?:', re, ')?');
}

/**
 * @param {...(RegExp | string) } args
 * @returns {string}
 */
function concat(...args) {
  const joined = args.map((x) => source(x)).join("");
  return joined;
}

/**
 * @param { Array<string | RegExp | Object> } args
 * @returns {object}
 */
function stripOptionsFromArgs(args) {
  const opts = args[args.length - 1];

  if (typeof opts === 'object' && opts.constructor === Object) {
    args.splice(args.length - 1, 1);
    return opts;
  } else {
    return {};
  }
}

/** @typedef { {capture?: boolean} } RegexEitherOptions */

/**
 * Any of the passed expresssions may match
 *
 * Creates a huge this | this | that | that match
 * @param {(RegExp | string)[] | [...(RegExp | string)[], RegexEitherOptions]} args
 * @returns {string}
 */
function either(...args) {
  /** @type { object & {capture?: boolean} }  */
  const opts = stripOptionsFromArgs(args);
  const joined = '('
    + (opts.capture ? "" : "?:")
    + args.map((x) => source(x)).join("|") + ")";
  return joined;
}

/**
 * @param {RegExp | string} re
 * @returns {number}
 */
function countMatchGroups(re) {
  return (new RegExp(re.toString() + '|')).exec('').length - 1;
}

/**
 * Does lexeme start with a regular expression match at the beginning
 * @param {RegExp} re
 * @param {string} lexeme
 */
function startsWith(re, lexeme) {
  const match = re && re.exec(lexeme);
  return match && match.index === 0;
}

// BACKREF_RE matches an open parenthesis or backreference. To avoid
// an incorrect parse, it additionally matches the following:
// - [...] elements, where the meaning of parentheses and escapes change
// - other escape sequences, so we do not misparse escape sequences as
//   interesting elements
// - non-matching or lookahead parentheses, which do not capture. These
//   follow the '(' with a '?'.
const BACKREF_RE = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;

// **INTERNAL** Not intended for outside usage
// join logically computes regexps.join(separator), but fixes the
// backreferences so they continue to match.
// it also places each individual regular expression into it's own
// match group, keeping track of the sequencing of those match groups
// is currently an exercise for the caller. :-)
/**
 * @param {(string | RegExp)[]} regexps
 * @param {{joinWith: string}} opts
 * @returns {string}
 */
function _rewriteBackreferences(regexps, { joinWith }) {
  let numCaptures = 0;

  return regexps.map((regex) => {
    numCaptures += 1;
    const offset = numCaptures;
    let re = source(regex);
    let out = '';

    while (re.length > 0) {
      const match = BACKREF_RE.exec(re);
      if (!match) {
        out += re;
        break;
      }
      out += re.substring(0, match.index);
      re = re.substring(match.index + match[0].length);
      if (match[0][0] === '\\' && match[1]) {
        // Adjust the backreference.
        out += '\\' + String(Number(match[1]) + offset);
      } else {
        out += match[0];
        if (match[0] === '(') {
          numCaptures++;
        }
      }
    }
    return out;
  }).map(re => `(${re})`).join(joinWith);
}

/** @typedef {import('highlight.js').Mode} Mode */
/** @typedef {import('highlight.js').ModeCallback} ModeCallback */

// Common regexps
const MATCH_NOTHING_RE = /\b\B/;
const IDENT_RE = '[a-zA-Z]\\w*';
const UNDERSCORE_IDENT_RE = '[a-zA-Z_]\\w*';
const NUMBER_RE = '\\b\\d+(\\.\\d+)?';
const C_NUMBER_RE = '(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
const BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
const RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

/**
* @param { Partial<Mode> & {binary?: string | RegExp} } opts
*/
const SHEBANG = (opts = {}) => {
  const beginShebang = /^#![ ]*\//;
  if (opts.binary) {
    opts.begin = concat(
      beginShebang,
      /.*\b/,
      opts.binary,
      /\b.*/);
  }
  return inherit$1({
    scope: 'meta',
    begin: beginShebang,
    end: /$/,
    relevance: 0,
    /** @type {ModeCallback} */
    "on:begin": (m, resp) => {
      if (m.index !== 0) resp.ignoreMatch();
    }
  }, opts);
};

// Common modes
const BACKSLASH_ESCAPE = {
  begin: '\\\\[\\s\\S]', relevance: 0
};
const APOS_STRING_MODE = {
  scope: 'string',
  begin: '\'',
  end: '\'',
  illegal: '\\n',
  contains: [BACKSLASH_ESCAPE]
};
const QUOTE_STRING_MODE = {
  scope: 'string',
  begin: '"',
  end: '"',
  illegal: '\\n',
  contains: [BACKSLASH_ESCAPE]
};
const PHRASAL_WORDS_MODE = {
  begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
};
/**
 * Creates a comment mode
 *
 * @param {string | RegExp} begin
 * @param {string | RegExp} end
 * @param {Mode | {}} [modeOptions]
 * @returns {Partial<Mode>}
 */
const COMMENT = function(begin, end, modeOptions = {}) {
  const mode = inherit$1(
    {
      scope: 'comment',
      begin,
      end,
      contains: []
    },
    modeOptions
  );
  mode.contains.push({
    scope: 'doctag',
    // hack to avoid the space from being included. the space is necessary to
    // match here to prevent the plain text rule below from gobbling up doctags
    begin: '[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)',
    end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
    excludeBegin: true,
    relevance: 0
  });
  const ENGLISH_WORD = either(
    // list of common 1 and 2 letter words in English
    "I",
    "a",
    "is",
    "so",
    "us",
    "to",
    "at",
    "if",
    "in",
    "it",
    "on",
    // note: this is not an exhaustive list of contractions, just popular ones
    /[A-Za-z]+['](d|ve|re|ll|t|s|n)/, // contractions - can't we'd they're let's, etc
    /[A-Za-z]+[-][a-z]+/, // `no-way`, etc.
    /[A-Za-z][a-z]{2,}/ // allow capitalized words at beginning of sentences
  );
  // looking like plain text, more likely to be a comment
  mode.contains.push(
    {
      // TODO: how to include ", (, ) without breaking grammars that use these for
      // comment delimiters?
      // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
      // ---

      // this tries to find sequences of 3 english words in a row (without any
      // "programming" type syntax) this gives us a strong signal that we've
      // TRULY found a comment - vs perhaps scanning with the wrong language.
      // It's possible to find something that LOOKS like the start of the
      // comment - but then if there is no readable text - good chance it is a
      // false match and not a comment.
      //
      // for a visual example please see:
      // https://github.com/highlightjs/highlight.js/issues/2827

      begin: concat(
        /[ ]+/, // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
        '(',
        ENGLISH_WORD,
        /[.]?[:]?([.][ ]|[ ])/,
        '){3}') // look for 3 words in a row
    }
  );
  return mode;
};
const C_LINE_COMMENT_MODE = COMMENT('//', '$');
const C_BLOCK_COMMENT_MODE = COMMENT('/\\*', '\\*/');
const HASH_COMMENT_MODE = COMMENT('#', '$');
const NUMBER_MODE = {
  scope: 'number',
  begin: NUMBER_RE,
  relevance: 0
};
const C_NUMBER_MODE = {
  scope: 'number',
  begin: C_NUMBER_RE,
  relevance: 0
};
const BINARY_NUMBER_MODE = {
  scope: 'number',
  begin: BINARY_NUMBER_RE,
  relevance: 0
};
const REGEXP_MODE = {
  scope: "regexp",
  begin: /\/(?=[^/\n]*\/)/,
  end: /\/[gimuy]*/,
  contains: [
    BACKSLASH_ESCAPE,
    {
      begin: /\[/,
      end: /\]/,
      relevance: 0,
      contains: [BACKSLASH_ESCAPE]
    }
  ]
};
const TITLE_MODE = {
  scope: 'title',
  begin: IDENT_RE,
  relevance: 0
};
const UNDERSCORE_TITLE_MODE = {
  scope: 'title',
  begin: UNDERSCORE_IDENT_RE,
  relevance: 0
};
const METHOD_GUARD = {
  // excludes method names from keyword processing
  begin: '\\.\\s*' + UNDERSCORE_IDENT_RE,
  relevance: 0
};

/**
 * Adds end same as begin mechanics to a mode
 *
 * Your mode must include at least a single () match group as that first match
 * group is what is used for comparison
 * @param {Partial<Mode>} mode
 */
const END_SAME_AS_BEGIN = function(mode) {
  return Object.assign(mode,
    {
      /** @type {ModeCallback} */
      'on:begin': (m, resp) => { resp.data._beginMatch = m[1]; },
      /** @type {ModeCallback} */
      'on:end': (m, resp) => { if (resp.data._beginMatch !== m[1]) resp.ignoreMatch(); }
    });
};

var MODES = /*#__PURE__*/Object.freeze({
  __proto__: null,
  APOS_STRING_MODE: APOS_STRING_MODE,
  BACKSLASH_ESCAPE: BACKSLASH_ESCAPE,
  BINARY_NUMBER_MODE: BINARY_NUMBER_MODE,
  BINARY_NUMBER_RE: BINARY_NUMBER_RE,
  COMMENT: COMMENT,
  C_BLOCK_COMMENT_MODE: C_BLOCK_COMMENT_MODE,
  C_LINE_COMMENT_MODE: C_LINE_COMMENT_MODE,
  C_NUMBER_MODE: C_NUMBER_MODE,
  C_NUMBER_RE: C_NUMBER_RE,
  END_SAME_AS_BEGIN: END_SAME_AS_BEGIN,
  HASH_COMMENT_MODE: HASH_COMMENT_MODE,
  IDENT_RE: IDENT_RE,
  MATCH_NOTHING_RE: MATCH_NOTHING_RE,
  METHOD_GUARD: METHOD_GUARD,
  NUMBER_MODE: NUMBER_MODE,
  NUMBER_RE: NUMBER_RE,
  PHRASAL_WORDS_MODE: PHRASAL_WORDS_MODE,
  QUOTE_STRING_MODE: QUOTE_STRING_MODE,
  REGEXP_MODE: REGEXP_MODE,
  RE_STARTERS_RE: RE_STARTERS_RE,
  SHEBANG: SHEBANG,
  TITLE_MODE: TITLE_MODE,
  UNDERSCORE_IDENT_RE: UNDERSCORE_IDENT_RE,
  UNDERSCORE_TITLE_MODE: UNDERSCORE_TITLE_MODE
});

/**
@typedef {import('highlight.js').CallbackResponse} CallbackResponse
@typedef {import('highlight.js').CompilerExt} CompilerExt
*/

// Grammar extensions / plugins
// See: https://github.com/highlightjs/highlight.js/issues/2833

// Grammar extensions allow "syntactic sugar" to be added to the grammar modes
// without requiring any underlying changes to the compiler internals.

// `compileMatch` being the perfect small example of now allowing a grammar
// author to write `match` when they desire to match a single expression rather
// than being forced to use `begin`.  The extension then just moves `match` into
// `begin` when it runs.  Ie, no features have been added, but we've just made
// the experience of writing (and reading grammars) a little bit nicer.

// ------

// TODO: We need negative look-behind support to do this properly
/**
 * Skip a match if it has a preceding dot
 *
 * This is used for `beginKeywords` to prevent matching expressions such as
 * `bob.keyword.do()`. The mode compiler automatically wires this up as a
 * special _internal_ 'on:begin' callback for modes with `beginKeywords`
 * @param {RegExpMatchArray} match
 * @param {CallbackResponse} response
 */
function skipIfHasPrecedingDot(match, response) {
  const before = match.input[match.index - 1];
  if (before === ".") {
    response.ignoreMatch();
  }
}

/**
 *
 * @type {CompilerExt}
 */
function scopeClassName(mode, _parent) {
  // eslint-disable-next-line no-undefined
  if (mode.className !== undefined) {
    mode.scope = mode.className;
    delete mode.className;
  }
}

/**
 * `beginKeywords` syntactic sugar
 * @type {CompilerExt}
 */
function beginKeywords(mode, parent) {
  if (!parent) return;
  if (!mode.beginKeywords) return;

  // for languages with keywords that include non-word characters checking for
  // a word boundary is not sufficient, so instead we check for a word boundary
  // or whitespace - this does no harm in any case since our keyword engine
  // doesn't allow spaces in keywords anyways and we still check for the boundary
  // first
  mode.begin = '\\b(' + mode.beginKeywords.split(' ').join('|') + ')(?!\\.)(?=\\b|\\s)';
  mode.__beforeBegin = skipIfHasPrecedingDot;
  mode.keywords = mode.keywords || mode.beginKeywords;
  delete mode.beginKeywords;

  // prevents double relevance, the keywords themselves provide
  // relevance, the mode doesn't need to double it
  // eslint-disable-next-line no-undefined
  if (mode.relevance === undefined) mode.relevance = 0;
}

/**
 * Allow `illegal` to contain an array of illegal values
 * @type {CompilerExt}
 */
function compileIllegal(mode, _parent) {
  if (!Array.isArray(mode.illegal)) return;

  mode.illegal = either(...mode.illegal);
}

/**
 * `match` to match a single expression for readability
 * @type {CompilerExt}
 */
function compileMatch(mode, _parent) {
  if (!mode.match) return;
  if (mode.begin || mode.end) throw new Error("begin & end are not supported with match");

  mode.begin = mode.match;
  delete mode.match;
}

/**
 * provides the default 1 relevance to all modes
 * @type {CompilerExt}
 */
function compileRelevance(mode, _parent) {
  // eslint-disable-next-line no-undefined
  if (mode.relevance === undefined) mode.relevance = 1;
}

// allow beforeMatch to act as a "qualifier" for the match
// the full match begin must be [beforeMatch][begin]
const beforeMatchExt = (mode, parent) => {
  if (!mode.beforeMatch) return;
  // starts conflicts with endsParent which we need to make sure the child
  // rule is not matched multiple times
  if (mode.starts) throw new Error("beforeMatch cannot be used with starts");

  const originalMode = Object.assign({}, mode);
  Object.keys(mode).forEach((key) => { delete mode[key]; });

  mode.keywords = originalMode.keywords;
  mode.begin = concat(originalMode.beforeMatch, lookahead(originalMode.begin));
  mode.starts = {
    relevance: 0,
    contains: [
      Object.assign(originalMode, { endsParent: true })
    ]
  };
  mode.relevance = 0;

  delete originalMode.beforeMatch;
};

// keywords that should have no default relevance value
const COMMON_KEYWORDS = [
  'of',
  'and',
  'for',
  'in',
  'not',
  'or',
  'if',
  'then',
  'parent', // common variable name
  'list', // common variable name
  'value' // common variable name
];

const DEFAULT_KEYWORD_SCOPE = "keyword";

/**
 * Given raw keywords from a language definition, compile them.
 *
 * @param {string | Record<string,string|string[]> | Array<string>} rawKeywords
 * @param {boolean} caseInsensitive
 */
function compileKeywords(rawKeywords, caseInsensitive, scopeName = DEFAULT_KEYWORD_SCOPE) {
  /** @type {import("highlight.js/private").KeywordDict} */
  const compiledKeywords = Object.create(null);

  // input can be a string of keywords, an array of keywords, or a object with
  // named keys representing scopeName (which can then point to a string or array)
  if (typeof rawKeywords === 'string') {
    compileList(scopeName, rawKeywords.split(" "));
  } else if (Array.isArray(rawKeywords)) {
    compileList(scopeName, rawKeywords);
  } else {
    Object.keys(rawKeywords).forEach(function(scopeName) {
      // collapse all our objects back into the parent object
      Object.assign(
        compiledKeywords,
        compileKeywords(rawKeywords[scopeName], caseInsensitive, scopeName)
      );
    });
  }
  return compiledKeywords;

  // ---

  /**
   * Compiles an individual list of keywords
   *
   * Ex: "for if when while|5"
   *
   * @param {string} scopeName
   * @param {Array<string>} keywordList
   */
  function compileList(scopeName, keywordList) {
    if (caseInsensitive) {
      keywordList = keywordList.map(x => x.toLowerCase());
    }
    keywordList.forEach(function(keyword) {
      const pair = keyword.split('|');
      compiledKeywords[pair[0]] = [scopeName, scoreForKeyword(pair[0], pair[1])];
    });
  }
}

/**
 * Returns the proper score for a given keyword
 *
 * Also takes into account comment keywords, which will be scored 0 UNLESS
 * another score has been manually assigned.
 * @param {string} keyword
 * @param {string} [providedScore]
 */
function scoreForKeyword(keyword, providedScore) {
  // manual scores always win over common keywords
  // so you can force a score of 1 if you really insist
  if (providedScore) {
    return Number(providedScore);
  }

  return commonKeyword(keyword) ? 0 : 1;
}

/**
 * Determines if a given keyword is common or not
 *
 * @param {string} keyword */
function commonKeyword(keyword) {
  return COMMON_KEYWORDS.includes(keyword.toLowerCase());
}

/*

For the reasoning behind this please see:
https://github.com/highlightjs/highlight.js/issues/2880#issuecomment-747275419

*/

/**
 * @type {Record<string, boolean>}
 */
const seenDeprecations = {};

/**
 * @param {string} message
 */
const error = (message) => {
  console.error(message);
};

/**
 * @param {string} message
 * @param {any} args
 */
const warn = (message, ...args) => {
  console.log(`WARN: ${message}`, ...args);
};

/**
 * @param {string} version
 * @param {string} message
 */
const deprecated = (version, message) => {
  if (seenDeprecations[`${version}/${message}`]) return;

  console.log(`Deprecated as of ${version}. ${message}`);
  seenDeprecations[`${version}/${message}`] = true;
};

/* eslint-disable no-throw-literal */

/**
@typedef {import('highlight.js').CompiledMode} CompiledMode
*/

const MultiClassError = new Error();

/**
 * Renumbers labeled scope names to account for additional inner match
 * groups that otherwise would break everything.
 *
 * Lets say we 3 match scopes:
 *
 *   { 1 => ..., 2 => ..., 3 => ... }
 *
 * So what we need is a clean match like this:
 *
 *   (a)(b)(c) => [ "a", "b", "c" ]
 *
 * But this falls apart with inner match groups:
 *
 * (a)(((b)))(c) => ["a", "b", "b", "b", "c" ]
 *
 * Our scopes are now "out of alignment" and we're repeating `b` 3 times.
 * What needs to happen is the numbers are remapped:
 *
 *   { 1 => ..., 2 => ..., 5 => ... }
 *
 * We also need to know that the ONLY groups that should be output
 * are 1, 2, and 5.  This function handles this behavior.
 *
 * @param {CompiledMode} mode
 * @param {Array<RegExp | string>} regexes
 * @param {{key: "beginScope"|"endScope"}} opts
 */
function remapScopeNames(mode, regexes, { key }) {
  let offset = 0;
  const scopeNames = mode[key];
  /** @type Record<number,boolean> */
  const emit = {};
  /** @type Record<number,string> */
  const positions = {};

  for (let i = 1; i <= regexes.length; i++) {
    positions[i + offset] = scopeNames[i];
    emit[i + offset] = true;
    offset += countMatchGroups(regexes[i - 1]);
  }
  // we use _emit to keep track of which match groups are "top-level" to avoid double
  // output from inside match groups
  mode[key] = positions;
  mode[key]._emit = emit;
  mode[key]._multi = true;
}

/**
 * @param {CompiledMode} mode
 */
function beginMultiClass(mode) {
  if (!Array.isArray(mode.begin)) return;

  if (mode.skip || mode.excludeBegin || mode.returnBegin) {
    error("skip, excludeBegin, returnBegin not compatible with beginScope: {}");
    throw MultiClassError;
  }

  if (typeof mode.beginScope !== "object" || mode.beginScope === null) {
    error("beginScope must be object");
    throw MultiClassError;
  }

  remapScopeNames(mode, mode.begin, { key: "beginScope" });
  mode.begin = _rewriteBackreferences(mode.begin, { joinWith: "" });
}

/**
 * @param {CompiledMode} mode
 */
function endMultiClass(mode) {
  if (!Array.isArray(mode.end)) return;

  if (mode.skip || mode.excludeEnd || mode.returnEnd) {
    error("skip, excludeEnd, returnEnd not compatible with endScope: {}");
    throw MultiClassError;
  }

  if (typeof mode.endScope !== "object" || mode.endScope === null) {
    error("endScope must be object");
    throw MultiClassError;
  }

  remapScopeNames(mode, mode.end, { key: "endScope" });
  mode.end = _rewriteBackreferences(mode.end, { joinWith: "" });
}

/**
 * this exists only to allow `scope: {}` to be used beside `match:`
 * Otherwise `beginScope` would necessary and that would look weird

  {
    match: [ /def/, /\w+/ ]
    scope: { 1: "keyword" , 2: "title" }
  }

 * @param {CompiledMode} mode
 */
function scopeSugar(mode) {
  if (mode.scope && typeof mode.scope === "object" && mode.scope !== null) {
    mode.beginScope = mode.scope;
    delete mode.scope;
  }
}

/**
 * @param {CompiledMode} mode
 */
function MultiClass(mode) {
  scopeSugar(mode);

  if (typeof mode.beginScope === "string") {
    mode.beginScope = { _wrap: mode.beginScope };
  }
  if (typeof mode.endScope === "string") {
    mode.endScope = { _wrap: mode.endScope };
  }

  beginMultiClass(mode);
  endMultiClass(mode);
}

/**
@typedef {import('highlight.js').Mode} Mode
@typedef {import('highlight.js').CompiledMode} CompiledMode
@typedef {import('highlight.js').Language} Language
@typedef {import('highlight.js').HLJSPlugin} HLJSPlugin
@typedef {import('highlight.js').CompiledLanguage} CompiledLanguage
*/

// compilation

/**
 * Compiles a language definition result
 *
 * Given the raw result of a language definition (Language), compiles this so
 * that it is ready for highlighting code.
 * @param {Language} language
 * @returns {CompiledLanguage}
 */
function compileLanguage(language) {
  /**
   * Builds a regex with the case sensitivity of the current language
   *
   * @param {RegExp | string} value
   * @param {boolean} [global]
   */
  function langRe(value, global) {
    return new RegExp(
      source(value),
      'm'
      + (language.case_insensitive ? 'i' : '')
      + (language.unicodeRegex ? 'u' : '')
      + (global ? 'g' : '')
    );
  }

  /**
    Stores multiple regular expressions and allows you to quickly search for
    them all in a string simultaneously - returning the first match.  It does
    this by creating a huge (a|b|c) regex - each individual item wrapped with ()
    and joined by `|` - using match groups to track position.  When a match is
    found checking which position in the array has content allows us to figure
    out which of the original regexes / match groups triggered the match.

    The match object itself (the result of `Regex.exec`) is returned but also
    enhanced by merging in any meta-data that was registered with the regex.
    This is how we keep track of which mode matched, and what type of rule
    (`illegal`, `begin`, end, etc).
  */
  class MultiRegex {
    constructor() {
      this.matchIndexes = {};
      // @ts-ignore
      this.regexes = [];
      this.matchAt = 1;
      this.position = 0;
    }

    // @ts-ignore
    addRule(re, opts) {
      opts.position = this.position++;
      // @ts-ignore
      this.matchIndexes[this.matchAt] = opts;
      this.regexes.push([opts, re]);
      this.matchAt += countMatchGroups(re) + 1;
    }

    compile() {
      if (this.regexes.length === 0) {
        // avoids the need to check length every time exec is called
        // @ts-ignore
        this.exec = () => null;
      }
      const terminators = this.regexes.map(el => el[1]);
      this.matcherRe = langRe(_rewriteBackreferences(terminators, { joinWith: '|' }), true);
      this.lastIndex = 0;
    }

    /** @param {string} s */
    exec(s) {
      this.matcherRe.lastIndex = this.lastIndex;
      const match = this.matcherRe.exec(s);
      if (!match) { return null; }

      // eslint-disable-next-line no-undefined
      const i = match.findIndex((el, i) => i > 0 && el !== undefined);
      // @ts-ignore
      const matchData = this.matchIndexes[i];
      // trim off any earlier non-relevant match groups (ie, the other regex
      // match groups that make up the multi-matcher)
      match.splice(0, i);

      return Object.assign(match, matchData);
    }
  }

  /*
    Created to solve the key deficiently with MultiRegex - there is no way to
    test for multiple matches at a single location.  Why would we need to do
    that?  In the future a more dynamic engine will allow certain matches to be
    ignored.  An example: if we matched say the 3rd regex in a large group but
    decided to ignore it - we'd need to started testing again at the 4th
    regex... but MultiRegex itself gives us no real way to do that.

    So what this class creates MultiRegexs on the fly for whatever search
    position they are needed.

    NOTE: These additional MultiRegex objects are created dynamically.  For most
    grammars most of the time we will never actually need anything more than the
    first MultiRegex - so this shouldn't have too much overhead.

    Say this is our search group, and we match regex3, but wish to ignore it.

      regex1 | regex2 | regex3 | regex4 | regex5    ' ie, startAt = 0

    What we need is a new MultiRegex that only includes the remaining
    possibilities:

      regex4 | regex5                               ' ie, startAt = 3

    This class wraps all that complexity up in a simple API... `startAt` decides
    where in the array of expressions to start doing the matching. It
    auto-increments, so if a match is found at position 2, then startAt will be
    set to 3.  If the end is reached startAt will return to 0.

    MOST of the time the parser will be setting startAt manually to 0.
  */
  class ResumableMultiRegex {
    constructor() {
      // @ts-ignore
      this.rules = [];
      // @ts-ignore
      this.multiRegexes = [];
      this.count = 0;

      this.lastIndex = 0;
      this.regexIndex = 0;
    }

    // @ts-ignore
    getMatcher(index) {
      if (this.multiRegexes[index]) return this.multiRegexes[index];

      const matcher = new MultiRegex();
      this.rules.slice(index).forEach(([re, opts]) => matcher.addRule(re, opts));
      matcher.compile();
      this.multiRegexes[index] = matcher;
      return matcher;
    }

    resumingScanAtSamePosition() {
      return this.regexIndex !== 0;
    }

    considerAll() {
      this.regexIndex = 0;
    }

    // @ts-ignore
    addRule(re, opts) {
      this.rules.push([re, opts]);
      if (opts.type === "begin") this.count++;
    }

    /** @param {string} s */
    exec(s) {
      const m = this.getMatcher(this.regexIndex);
      m.lastIndex = this.lastIndex;
      let result = m.exec(s);

      // The following is because we have no easy way to say "resume scanning at the
      // existing position but also skip the current rule ONLY". What happens is
      // all prior rules are also skipped which can result in matching the wrong
      // thing. Example of matching "booger":

      // our matcher is [string, "booger", number]
      //
      // ....booger....

      // if "booger" is ignored then we'd really need a regex to scan from the
      // SAME position for only: [string, number] but ignoring "booger" (if it
      // was the first match), a simple resume would scan ahead who knows how
      // far looking only for "number", ignoring potential string matches (or
      // future "booger" matches that might be valid.)

      // So what we do: We execute two matchers, one resuming at the same
      // position, but the second full matcher starting at the position after:

      //     /--- resume first regex match here (for [number])
      //     |/---- full match here for [string, "booger", number]
      //     vv
      // ....booger....

      // Which ever results in a match first is then used. So this 3-4 step
      // process essentially allows us to say "match at this position, excluding
      // a prior rule that was ignored".
      //
      // 1. Match "booger" first, ignore. Also proves that [string] does non match.
      // 2. Resume matching for [number]
      // 3. Match at index + 1 for [string, "booger", number]
      // 4. If #2 and #3 result in matches, which came first?
      if (this.resumingScanAtSamePosition()) {
        if (result && result.index === this.lastIndex) ; else { // use the second matcher result
          const m2 = this.getMatcher(0);
          m2.lastIndex = this.lastIndex + 1;
          result = m2.exec(s);
        }
      }

      if (result) {
        this.regexIndex += result.position + 1;
        if (this.regexIndex === this.count) {
          // wrap-around to considering all matches again
          this.considerAll();
        }
      }

      return result;
    }
  }

  /**
   * Given a mode, builds a huge ResumableMultiRegex that can be used to walk
   * the content and find matches.
   *
   * @param {CompiledMode} mode
   * @returns {ResumableMultiRegex}
   */
  function buildModeRegex(mode) {
    const mm = new ResumableMultiRegex();

    mode.contains.forEach(term => mm.addRule(term.begin, { rule: term, type: "begin" }));

    if (mode.terminatorEnd) {
      mm.addRule(mode.terminatorEnd, { type: "end" });
    }
    if (mode.illegal) {
      mm.addRule(mode.illegal, { type: "illegal" });
    }

    return mm;
  }

  /** skip vs abort vs ignore
   *
   * @skip   - The mode is still entered and exited normally (and contains rules apply),
   *           but all content is held and added to the parent buffer rather than being
   *           output when the mode ends.  Mostly used with `sublanguage` to build up
   *           a single large buffer than can be parsed by sublanguage.
   *
   *             - The mode begin ands ends normally.
   *             - Content matched is added to the parent mode buffer.
   *             - The parser cursor is moved forward normally.
   *
   * @abort  - A hack placeholder until we have ignore.  Aborts the mode (as if it
   *           never matched) but DOES NOT continue to match subsequent `contains`
   *           modes.  Abort is bad/suboptimal because it can result in modes
   *           farther down not getting applied because an earlier rule eats the
   *           content but then aborts.
   *
   *             - The mode does not begin.
   *             - Content matched by `begin` is added to the mode buffer.
   *             - The parser cursor is moved forward accordingly.
   *
   * @ignore - Ignores the mode (as if it never matched) and continues to match any
   *           subsequent `contains` modes.  Ignore isn't technically possible with
   *           the current parser implementation.
   *
   *             - The mode does not begin.
   *             - Content matched by `begin` is ignored.
   *             - The parser cursor is not moved forward.
   */

  /**
   * Compiles an individual mode
   *
   * This can raise an error if the mode contains certain detectable known logic
   * issues.
   * @param {Mode} mode
   * @param {CompiledMode | null} [parent]
   * @returns {CompiledMode | never}
   */
  function compileMode(mode, parent) {
    const cmode = /** @type CompiledMode */ (mode);
    if (mode.isCompiled) return cmode;

    [
      scopeClassName,
      // do this early so compiler extensions generally don't have to worry about
      // the distinction between match/begin
      compileMatch,
      MultiClass,
      beforeMatchExt
    ].forEach(ext => ext(mode, parent));

    language.compilerExtensions.forEach(ext => ext(mode, parent));

    // __beforeBegin is considered private API, internal use only
    mode.__beforeBegin = null;

    [
      beginKeywords,
      // do this later so compiler extensions that come earlier have access to the
      // raw array if they wanted to perhaps manipulate it, etc.
      compileIllegal,
      // default to 1 relevance if not specified
      compileRelevance
    ].forEach(ext => ext(mode, parent));

    mode.isCompiled = true;

    let keywordPattern = null;
    if (typeof mode.keywords === "object" && mode.keywords.$pattern) {
      // we need a copy because keywords might be compiled multiple times
      // so we can't go deleting $pattern from the original on the first
      // pass
      mode.keywords = Object.assign({}, mode.keywords);
      keywordPattern = mode.keywords.$pattern;
      delete mode.keywords.$pattern;
    }
    keywordPattern = keywordPattern || /\w+/;

    if (mode.keywords) {
      mode.keywords = compileKeywords(mode.keywords, language.case_insensitive);
    }

    cmode.keywordPatternRe = langRe(keywordPattern, true);

    if (parent) {
      if (!mode.begin) mode.begin = /\B|\b/;
      cmode.beginRe = langRe(cmode.begin);
      if (!mode.end && !mode.endsWithParent) mode.end = /\B|\b/;
      if (mode.end) cmode.endRe = langRe(cmode.end);
      cmode.terminatorEnd = source(cmode.end) || '';
      if (mode.endsWithParent && parent.terminatorEnd) {
        cmode.terminatorEnd += (mode.end ? '|' : '') + parent.terminatorEnd;
      }
    }
    if (mode.illegal) cmode.illegalRe = langRe(/** @type {RegExp | string} */ (mode.illegal));
    if (!mode.contains) mode.contains = [];

    mode.contains = [].concat(...mode.contains.map(function(c) {
      return expandOrCloneMode(c === 'self' ? mode : c);
    }));
    mode.contains.forEach(function(c) { compileMode(/** @type Mode */ (c), cmode); });

    if (mode.starts) {
      compileMode(mode.starts, parent);
    }

    cmode.matcher = buildModeRegex(cmode);
    return cmode;
  }

  if (!language.compilerExtensions) language.compilerExtensions = [];

  // self is not valid at the top-level
  if (language.contains && language.contains.includes('self')) {
    throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
  }

  // we need a null object, which inherit will guarantee
  language.classNameAliases = inherit$1(language.classNameAliases || {});

  return compileMode(/** @type Mode */ (language));
}

/**
 * Determines if a mode has a dependency on it's parent or not
 *
 * If a mode does have a parent dependency then often we need to clone it if
 * it's used in multiple places so that each copy points to the correct parent,
 * where-as modes without a parent can often safely be re-used at the bottom of
 * a mode chain.
 *
 * @param {Mode | null} mode
 * @returns {boolean} - is there a dependency on the parent?
 * */
function dependencyOnParent(mode) {
  if (!mode) return false;

  return mode.endsWithParent || dependencyOnParent(mode.starts);
}

/**
 * Expands a mode or clones it if necessary
 *
 * This is necessary for modes with parental dependenceis (see notes on
 * `dependencyOnParent`) and for nodes that have `variants` - which must then be
 * exploded into their own individual modes at compile time.
 *
 * @param {Mode} mode
 * @returns {Mode | Mode[]}
 * */
function expandOrCloneMode(mode) {
  if (mode.variants && !mode.cachedVariants) {
    mode.cachedVariants = mode.variants.map(function(variant) {
      return inherit$1(mode, { variants: null }, variant);
    });
  }

  // EXPAND
  // if we have variants then essentially "replace" the mode with the variants
  // this happens in compileMode, where this function is called from
  if (mode.cachedVariants) {
    return mode.cachedVariants;
  }

  // CLONE
  // if we have dependencies on parents then we need a unique
  // instance of ourselves, so we can be reused with many
  // different parents without issue
  if (dependencyOnParent(mode)) {
    return inherit$1(mode, { starts: mode.starts ? inherit$1(mode.starts) : null });
  }

  if (Object.isFrozen(mode)) {
    return inherit$1(mode);
  }

  // no special dependency issues, just return ourselves
  return mode;
}

var version = "11.9.0";

class HTMLInjectionError extends Error {
  constructor(reason, html) {
    super(reason);
    this.name = "HTMLInjectionError";
    this.html = html;
  }
}

/*
Syntax highlighting with language autodetection.
https://highlightjs.org/
*/



/**
@typedef {import('highlight.js').Mode} Mode
@typedef {import('highlight.js').CompiledMode} CompiledMode
@typedef {import('highlight.js').CompiledScope} CompiledScope
@typedef {import('highlight.js').Language} Language
@typedef {import('highlight.js').HLJSApi} HLJSApi
@typedef {import('highlight.js').HLJSPlugin} HLJSPlugin
@typedef {import('highlight.js').PluginEvent} PluginEvent
@typedef {import('highlight.js').HLJSOptions} HLJSOptions
@typedef {import('highlight.js').LanguageFn} LanguageFn
@typedef {import('highlight.js').HighlightedHTMLElement} HighlightedHTMLElement
@typedef {import('highlight.js').BeforeHighlightContext} BeforeHighlightContext
@typedef {import('highlight.js/private').MatchType} MatchType
@typedef {import('highlight.js/private').KeywordData} KeywordData
@typedef {import('highlight.js/private').EnhancedMatch} EnhancedMatch
@typedef {import('highlight.js/private').AnnotatedError} AnnotatedError
@typedef {import('highlight.js').AutoHighlightResult} AutoHighlightResult
@typedef {import('highlight.js').HighlightOptions} HighlightOptions
@typedef {import('highlight.js').HighlightResult} HighlightResult
*/


const escape = escapeHTML;
const inherit = inherit$1;
const NO_MATCH = Symbol("nomatch");
const MAX_KEYWORD_HITS = 7;

/**
 * @param {any} hljs - object that is extended (legacy)
 * @returns {HLJSApi}
 */
const HLJS = function(hljs) {
  // Global internal variables used within the highlight.js library.
  /** @type {Record<string, Language>} */
  const languages = Object.create(null);
  /** @type {Record<string, string>} */
  const aliases = Object.create(null);
  /** @type {HLJSPlugin[]} */
  const plugins = [];

  // safe/production mode - swallows more errors, tries to keep running
  // even if a single syntax or parse hits a fatal error
  let SAFE_MODE = true;
  const LANGUAGE_NOT_FOUND = "Could not find the language '{}', did you forget to load/include a language module?";
  /** @type {Language} */
  const PLAINTEXT_LANGUAGE = { disableAutodetect: true, name: 'Plain text', contains: [] };

  // Global options used when within external APIs. This is modified when
  // calling the `hljs.configure` function.
  /** @type HLJSOptions */
  let options = {
    ignoreUnescapedHTML: false,
    throwUnescapedHTML: false,
    noHighlightRe: /^(no-?highlight)$/i,
    languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
    classPrefix: 'hljs-',
    cssSelector: 'pre code',
    languages: null,
    // beta configuration options, subject to change, welcome to discuss
    // https://github.com/highlightjs/highlight.js/issues/1086
    __emitter: TokenTreeEmitter
  };

  /* Utility functions */

  /**
   * Tests a language name to see if highlighting should be skipped
   * @param {string} languageName
   */
  function shouldNotHighlight(languageName) {
    return options.noHighlightRe.test(languageName);
  }

  /**
   * @param {HighlightedHTMLElement} block - the HTML element to determine language for
   */
  function blockLanguage(block) {
    let classes = block.className + ' ';

    classes += block.parentNode ? block.parentNode.className : '';

    // language-* takes precedence over non-prefixed class names.
    const match = options.languageDetectRe.exec(classes);
    if (match) {
      const language = getLanguage(match[1]);
      if (!language) {
        warn(LANGUAGE_NOT_FOUND.replace("{}", match[1]));
        warn("Falling back to no-highlight mode for this block.", block);
      }
      return language ? match[1] : 'no-highlight';
    }

    return classes
      .split(/\s+/)
      .find((_class) => shouldNotHighlight(_class) || getLanguage(_class));
  }

  /**
   * Core highlighting function.
   *
   * OLD API
   * highlight(lang, code, ignoreIllegals, continuation)
   *
   * NEW API
   * highlight(code, {lang, ignoreIllegals})
   *
   * @param {string} codeOrLanguageName - the language to use for highlighting
   * @param {string | HighlightOptions} optionsOrCode - the code to highlight
   * @param {boolean} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
   *
   * @returns {HighlightResult} Result - an object that represents the result
   * @property {string} language - the language name
   * @property {number} relevance - the relevance score
   * @property {string} value - the highlighted HTML code
   * @property {string} code - the original raw code
   * @property {CompiledMode} top - top of the current mode stack
   * @property {boolean} illegal - indicates whether any illegal matches were found
  */
  function highlight(codeOrLanguageName, optionsOrCode, ignoreIllegals) {
    let code = "";
    let languageName = "";
    if (typeof optionsOrCode === "object") {
      code = codeOrLanguageName;
      ignoreIllegals = optionsOrCode.ignoreIllegals;
      languageName = optionsOrCode.language;
    } else {
      // old API
      deprecated("10.7.0", "highlight(lang, code, ...args) has been deprecated.");
      deprecated("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277");
      languageName = codeOrLanguageName;
      code = optionsOrCode;
    }

    // https://github.com/highlightjs/highlight.js/issues/3149
    // eslint-disable-next-line no-undefined
    if (ignoreIllegals === undefined) { ignoreIllegals = true; }

    /** @type {BeforeHighlightContext} */
    const context = {
      code,
      language: languageName
    };
    // the plugin can change the desired language or the code to be highlighted
    // just be changing the object it was passed
    fire("before:highlight", context);

    // a before plugin can usurp the result completely by providing it's own
    // in which case we don't even need to call highlight
    const result = context.result
      ? context.result
      : _highlight(context.language, context.code, ignoreIllegals);

    result.code = context.code;
    // the plugin can change anything in result to suite it
    fire("after:highlight", result);

    return result;
  }

  /**
   * private highlight that's used internally and does not fire callbacks
   *
   * @param {string} languageName - the language to use for highlighting
   * @param {string} codeToHighlight - the code to highlight
   * @param {boolean?} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
   * @param {CompiledMode?} [continuation] - current continuation mode, if any
   * @returns {HighlightResult} - result of the highlight operation
  */
  function _highlight(languageName, codeToHighlight, ignoreIllegals, continuation) {
    const keywordHits = Object.create(null);

    /**
     * Return keyword data if a match is a keyword
     * @param {CompiledMode} mode - current mode
     * @param {string} matchText - the textual match
     * @returns {KeywordData | false}
     */
    function keywordData(mode, matchText) {
      return mode.keywords[matchText];
    }

    function processKeywords() {
      if (!top.keywords) {
        emitter.addText(modeBuffer);
        return;
      }

      let lastIndex = 0;
      top.keywordPatternRe.lastIndex = 0;
      let match = top.keywordPatternRe.exec(modeBuffer);
      let buf = "";

      while (match) {
        buf += modeBuffer.substring(lastIndex, match.index);
        const word = language.case_insensitive ? match[0].toLowerCase() : match[0];
        const data = keywordData(top, word);
        if (data) {
          const [kind, keywordRelevance] = data;
          emitter.addText(buf);
          buf = "";

          keywordHits[word] = (keywordHits[word] || 0) + 1;
          if (keywordHits[word] <= MAX_KEYWORD_HITS) relevance += keywordRelevance;
          if (kind.startsWith("_")) {
            // _ implied for relevance only, do not highlight
            // by applying a class name
            buf += match[0];
          } else {
            const cssClass = language.classNameAliases[kind] || kind;
            emitKeyword(match[0], cssClass);
          }
        } else {
          buf += match[0];
        }
        lastIndex = top.keywordPatternRe.lastIndex;
        match = top.keywordPatternRe.exec(modeBuffer);
      }
      buf += modeBuffer.substring(lastIndex);
      emitter.addText(buf);
    }

    function processSubLanguage() {
      if (modeBuffer === "") return;
      /** @type HighlightResult */
      let result = null;

      if (typeof top.subLanguage === 'string') {
        if (!languages[top.subLanguage]) {
          emitter.addText(modeBuffer);
          return;
        }
        result = _highlight(top.subLanguage, modeBuffer, true, continuations[top.subLanguage]);
        continuations[top.subLanguage] = /** @type {CompiledMode} */ (result._top);
      } else {
        result = highlightAuto(modeBuffer, top.subLanguage.length ? top.subLanguage : null);
      }

      // Counting embedded language score towards the host language may be disabled
      // with zeroing the containing mode relevance. Use case in point is Markdown that
      // allows XML everywhere and makes every XML snippet to have a much larger Markdown
      // score.
      if (top.relevance > 0) {
        relevance += result.relevance;
      }
      emitter.__addSublanguage(result._emitter, result.language);
    }

    function processBuffer() {
      if (top.subLanguage != null) {
        processSubLanguage();
      } else {
        processKeywords();
      }
      modeBuffer = '';
    }

    /**
     * @param {string} text
     * @param {string} scope
     */
    function emitKeyword(keyword, scope) {
      if (keyword === "") return;

      emitter.startScope(scope);
      emitter.addText(keyword);
      emitter.endScope();
    }

    /**
     * @param {CompiledScope} scope
     * @param {RegExpMatchArray} match
     */
    function emitMultiClass(scope, match) {
      let i = 1;
      const max = match.length - 1;
      while (i <= max) {
        if (!scope._emit[i]) { i++; continue; }
        const klass = language.classNameAliases[scope[i]] || scope[i];
        const text = match[i];
        if (klass) {
          emitKeyword(text, klass);
        } else {
          modeBuffer = text;
          processKeywords();
          modeBuffer = "";
        }
        i++;
      }
    }

    /**
     * @param {CompiledMode} mode - new mode to start
     * @param {RegExpMatchArray} match
     */
    function startNewMode(mode, match) {
      if (mode.scope && typeof mode.scope === "string") {
        emitter.openNode(language.classNameAliases[mode.scope] || mode.scope);
      }
      if (mode.beginScope) {
        // beginScope just wraps the begin match itself in a scope
        if (mode.beginScope._wrap) {
          emitKeyword(modeBuffer, language.classNameAliases[mode.beginScope._wrap] || mode.beginScope._wrap);
          modeBuffer = "";
        } else if (mode.beginScope._multi) {
          // at this point modeBuffer should just be the match
          emitMultiClass(mode.beginScope, match);
          modeBuffer = "";
        }
      }

      top = Object.create(mode, { parent: { value: top } });
      return top;
    }

    /**
     * @param {CompiledMode } mode - the mode to potentially end
     * @param {RegExpMatchArray} match - the latest match
     * @param {string} matchPlusRemainder - match plus remainder of content
     * @returns {CompiledMode | void} - the next mode, or if void continue on in current mode
     */
    function endOfMode(mode, match, matchPlusRemainder) {
      let matched = startsWith(mode.endRe, matchPlusRemainder);

      if (matched) {
        if (mode["on:end"]) {
          const resp = new Response(mode);
          mode["on:end"](match, resp);
          if (resp.isMatchIgnored) matched = false;
        }

        if (matched) {
          while (mode.endsParent && mode.parent) {
            mode = mode.parent;
          }
          return mode;
        }
      }
      // even if on:end fires an `ignore` it's still possible
      // that we might trigger the end node because of a parent mode
      if (mode.endsWithParent) {
        return endOfMode(mode.parent, match, matchPlusRemainder);
      }
    }

    /**
     * Handle matching but then ignoring a sequence of text
     *
     * @param {string} lexeme - string containing full match text
     */
    function doIgnore(lexeme) {
      if (top.matcher.regexIndex === 0) {
        // no more regexes to potentially match here, so we move the cursor forward one
        // space
        modeBuffer += lexeme[0];
        return 1;
      } else {
        // no need to move the cursor, we still have additional regexes to try and
        // match at this very spot
        resumeScanAtSamePosition = true;
        return 0;
      }
    }

    /**
     * Handle the start of a new potential mode match
     *
     * @param {EnhancedMatch} match - the current match
     * @returns {number} how far to advance the parse cursor
     */
    function doBeginMatch(match) {
      const lexeme = match[0];
      const newMode = match.rule;

      const resp = new Response(newMode);
      // first internal before callbacks, then the public ones
      const beforeCallbacks = [newMode.__beforeBegin, newMode["on:begin"]];
      for (const cb of beforeCallbacks) {
        if (!cb) continue;
        cb(match, resp);
        if (resp.isMatchIgnored) return doIgnore(lexeme);
      }

      if (newMode.skip) {
        modeBuffer += lexeme;
      } else {
        if (newMode.excludeBegin) {
          modeBuffer += lexeme;
        }
        processBuffer();
        if (!newMode.returnBegin && !newMode.excludeBegin) {
          modeBuffer = lexeme;
        }
      }
      startNewMode(newMode, match);
      return newMode.returnBegin ? 0 : lexeme.length;
    }

    /**
     * Handle the potential end of mode
     *
     * @param {RegExpMatchArray} match - the current match
     */
    function doEndMatch(match) {
      const lexeme = match[0];
      const matchPlusRemainder = codeToHighlight.substring(match.index);

      const endMode = endOfMode(top, match, matchPlusRemainder);
      if (!endMode) { return NO_MATCH; }

      const origin = top;
      if (top.endScope && top.endScope._wrap) {
        processBuffer();
        emitKeyword(lexeme, top.endScope._wrap);
      } else if (top.endScope && top.endScope._multi) {
        processBuffer();
        emitMultiClass(top.endScope, match);
      } else if (origin.skip) {
        modeBuffer += lexeme;
      } else {
        if (!(origin.returnEnd || origin.excludeEnd)) {
          modeBuffer += lexeme;
        }
        processBuffer();
        if (origin.excludeEnd) {
          modeBuffer = lexeme;
        }
      }
      do {
        if (top.scope) {
          emitter.closeNode();
        }
        if (!top.skip && !top.subLanguage) {
          relevance += top.relevance;
        }
        top = top.parent;
      } while (top !== endMode.parent);
      if (endMode.starts) {
        startNewMode(endMode.starts, match);
      }
      return origin.returnEnd ? 0 : lexeme.length;
    }

    function processContinuations() {
      const list = [];
      for (let current = top; current !== language; current = current.parent) {
        if (current.scope) {
          list.unshift(current.scope);
        }
      }
      list.forEach(item => emitter.openNode(item));
    }

    /** @type {{type?: MatchType, index?: number, rule?: Mode}}} */
    let lastMatch = {};

    /**
     *  Process an individual match
     *
     * @param {string} textBeforeMatch - text preceding the match (since the last match)
     * @param {EnhancedMatch} [match] - the match itself
     */
    function processLexeme(textBeforeMatch, match) {
      const lexeme = match && match[0];

      // add non-matched text to the current mode buffer
      modeBuffer += textBeforeMatch;

      if (lexeme == null) {
        processBuffer();
        return 0;
      }

      // we've found a 0 width match and we're stuck, so we need to advance
      // this happens when we have badly behaved rules that have optional matchers to the degree that
      // sometimes they can end up matching nothing at all
      // Ref: https://github.com/highlightjs/highlight.js/issues/2140
      if (lastMatch.type === "begin" && match.type === "end" && lastMatch.index === match.index && lexeme === "") {
        // spit the "skipped" character that our regex choked on back into the output sequence
        modeBuffer += codeToHighlight.slice(match.index, match.index + 1);
        if (!SAFE_MODE) {
          /** @type {AnnotatedError} */
          const err = new Error(`0 width match regex (${languageName})`);
          err.languageName = languageName;
          err.badRule = lastMatch.rule;
          throw err;
        }
        return 1;
      }
      lastMatch = match;

      if (match.type === "begin") {
        return doBeginMatch(match);
      } else if (match.type === "illegal" && !ignoreIllegals) {
        // illegal match, we do not continue processing
        /** @type {AnnotatedError} */
        const err = new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.scope || '<unnamed>') + '"');
        err.mode = top;
        throw err;
      } else if (match.type === "end") {
        const processed = doEndMatch(match);
        if (processed !== NO_MATCH) {
          return processed;
        }
      }

      // edge case for when illegal matches $ (end of line) which is technically
      // a 0 width match but not a begin/end match so it's not caught by the
      // first handler (when ignoreIllegals is true)
      if (match.type === "illegal" && lexeme === "") {
        // advance so we aren't stuck in an infinite loop
        return 1;
      }

      // infinite loops are BAD, this is a last ditch catch all. if we have a
      // decent number of iterations yet our index (cursor position in our
      // parsing) still 3x behind our index then something is very wrong
      // so we bail
      if (iterations > 100000 && iterations > match.index * 3) {
        const err = new Error('potential infinite loop, way more iterations than matches');
        throw err;
      }

      /*
      Why might be find ourselves here?  An potential end match that was
      triggered but could not be completed.  IE, `doEndMatch` returned NO_MATCH.
      (this could be because a callback requests the match be ignored, etc)

      This causes no real harm other than stopping a few times too many.
      */

      modeBuffer += lexeme;
      return lexeme.length;
    }

    const language = getLanguage(languageName);
    if (!language) {
      error(LANGUAGE_NOT_FOUND.replace("{}", languageName));
      throw new Error('Unknown language: "' + languageName + '"');
    }

    const md = compileLanguage(language);
    let result = '';
    /** @type {CompiledMode} */
    let top = continuation || md;
    /** @type Record<string,CompiledMode> */
    const continuations = {}; // keep continuations for sub-languages
    const emitter = new options.__emitter(options);
    processContinuations();
    let modeBuffer = '';
    let relevance = 0;
    let index = 0;
    let iterations = 0;
    let resumeScanAtSamePosition = false;

    try {
      if (!language.__emitTokens) {
        top.matcher.considerAll();

        for (;;) {
          iterations++;
          if (resumeScanAtSamePosition) {
            // only regexes not matched previously will now be
            // considered for a potential match
            resumeScanAtSamePosition = false;
          } else {
            top.matcher.considerAll();
          }
          top.matcher.lastIndex = index;

          const match = top.matcher.exec(codeToHighlight);
          // console.log("match", match[0], match.rule && match.rule.begin)

          if (!match) break;

          const beforeMatch = codeToHighlight.substring(index, match.index);
          const processedCount = processLexeme(beforeMatch, match);
          index = match.index + processedCount;
        }
        processLexeme(codeToHighlight.substring(index));
      } else {
        language.__emitTokens(codeToHighlight, emitter);
      }

      emitter.finalize();
      result = emitter.toHTML();

      return {
        language: languageName,
        value: result,
        relevance,
        illegal: false,
        _emitter: emitter,
        _top: top
      };
    } catch (err) {
      if (err.message && err.message.includes('Illegal')) {
        return {
          language: languageName,
          value: escape(codeToHighlight),
          illegal: true,
          relevance: 0,
          _illegalBy: {
            message: err.message,
            index,
            context: codeToHighlight.slice(index - 100, index + 100),
            mode: err.mode,
            resultSoFar: result
          },
          _emitter: emitter
        };
      } else if (SAFE_MODE) {
        return {
          language: languageName,
          value: escape(codeToHighlight),
          illegal: false,
          relevance: 0,
          errorRaised: err,
          _emitter: emitter,
          _top: top
        };
      } else {
        throw err;
      }
    }
  }

  /**
   * returns a valid highlight result, without actually doing any actual work,
   * auto highlight starts with this and it's possible for small snippets that
   * auto-detection may not find a better match
   * @param {string} code
   * @returns {HighlightResult}
   */
  function justTextHighlightResult(code) {
    const result = {
      value: escape(code),
      illegal: false,
      relevance: 0,
      _top: PLAINTEXT_LANGUAGE,
      _emitter: new options.__emitter(options)
    };
    result._emitter.addText(code);
    return result;
  }

  /**
  Highlighting with language detection. Accepts a string with the code to
  highlight. Returns an object with the following properties:

  - language (detected language)
  - relevance (int)
  - value (an HTML string with highlighting markup)
  - secondBest (object with the same structure for second-best heuristically
    detected language, may be absent)

    @param {string} code
    @param {Array<string>} [languageSubset]
    @returns {AutoHighlightResult}
  */
  function highlightAuto(code, languageSubset) {
    languageSubset = languageSubset || options.languages || Object.keys(languages);
    const plaintext = justTextHighlightResult(code);

    const results = languageSubset.filter(getLanguage).filter(autoDetection).map(name =>
      _highlight(name, code, false)
    );
    results.unshift(plaintext); // plaintext is always an option

    const sorted = results.sort((a, b) => {
      // sort base on relevance
      if (a.relevance !== b.relevance) return b.relevance - a.relevance;

      // always award the tie to the base language
      // ie if C++ and Arduino are tied, it's more likely to be C++
      if (a.language && b.language) {
        if (getLanguage(a.language).supersetOf === b.language) {
          return 1;
        } else if (getLanguage(b.language).supersetOf === a.language) {
          return -1;
        }
      }

      // otherwise say they are equal, which has the effect of sorting on
      // relevance while preserving the original ordering - which is how ties
      // have historically been settled, ie the language that comes first always
      // wins in the case of a tie
      return 0;
    });

    const [best, secondBest] = sorted;

    /** @type {AutoHighlightResult} */
    const result = best;
    result.secondBest = secondBest;

    return result;
  }

  /**
   * Builds new class name for block given the language name
   *
   * @param {HTMLElement} element
   * @param {string} [currentLang]
   * @param {string} [resultLang]
   */
  function updateClassName(element, currentLang, resultLang) {
    const language = (currentLang && aliases[currentLang]) || resultLang;

    element.classList.add("hljs");
    element.classList.add(`language-${language}`);
  }

  /**
   * Applies highlighting to a DOM node containing code.
   *
   * @param {HighlightedHTMLElement} element - the HTML element to highlight
  */
  function highlightElement(element) {
    /** @type HTMLElement */
    let node = null;
    const language = blockLanguage(element);

    if (shouldNotHighlight(language)) return;

    fire("before:highlightElement",
      { el: element, language });

    if (element.dataset.highlighted) {
      console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", element);
      return;
    }

    // we should be all text, no child nodes (unescaped HTML) - this is possibly
    // an HTML injection attack - it's likely too late if this is already in
    // production (the code has likely already done its damage by the time
    // we're seeing it)... but we yell loudly about this so that hopefully it's
    // more likely to be caught in development before making it to production
    if (element.children.length > 0) {
      if (!options.ignoreUnescapedHTML) {
        console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk.");
        console.warn("https://github.com/highlightjs/highlight.js/wiki/security");
        console.warn("The element with unescaped HTML:");
        console.warn(element);
      }
      if (options.throwUnescapedHTML) {
        const err = new HTMLInjectionError(
          "One of your code blocks includes unescaped HTML.",
          element.innerHTML
        );
        throw err;
      }
    }

    node = element;
    const text = node.textContent;
    const result = language ? highlight(text, { language, ignoreIllegals: true }) : highlightAuto(text);

    element.innerHTML = result.value;
    element.dataset.highlighted = "yes";
    updateClassName(element, language, result.language);
    element.result = {
      language: result.language,
      // TODO: remove with version 11.0
      re: result.relevance,
      relevance: result.relevance
    };
    if (result.secondBest) {
      element.secondBest = {
        language: result.secondBest.language,
        relevance: result.secondBest.relevance
      };
    }

    fire("after:highlightElement", { el: element, result, text });
  }

  /**
   * Updates highlight.js global options with the passed options
   *
   * @param {Partial<HLJSOptions>} userOptions
   */
  function configure(userOptions) {
    options = inherit(options, userOptions);
  }

  // TODO: remove v12, deprecated
  const initHighlighting = () => {
    highlightAll();
    deprecated("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
  };

  // TODO: remove v12, deprecated
  function initHighlightingOnLoad() {
    highlightAll();
    deprecated("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
  }

  let wantsHighlight = false;

  /**
   * auto-highlights all pre>code elements on the page
   */
  function highlightAll() {
    // if we are called too early in the loading process
    if (document.readyState === "loading") {
      wantsHighlight = true;
      return;
    }

    const blocks = document.querySelectorAll(options.cssSelector);
    blocks.forEach(highlightElement);
  }

  function boot() {
    // if a highlight was requested before DOM was loaded, do now
    if (wantsHighlight) highlightAll();
  }

  // make sure we are in the browser environment
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('DOMContentLoaded', boot, false);
  }

  /**
   * Register a language grammar module
   *
   * @param {string} languageName
   * @param {LanguageFn} languageDefinition
   */
  function registerLanguage(languageName, languageDefinition) {
    let lang = null;
    try {
      lang = languageDefinition(hljs);
    } catch (error$1) {
      error("Language definition for '{}' could not be registered.".replace("{}", languageName));
      // hard or soft error
      if (!SAFE_MODE) { throw error$1; } else { error(error$1); }
      // languages that have serious errors are replaced with essentially a
      // "plaintext" stand-in so that the code blocks will still get normal
      // css classes applied to them - and one bad language won't break the
      // entire highlighter
      lang = PLAINTEXT_LANGUAGE;
    }
    // give it a temporary name if it doesn't have one in the meta-data
    if (!lang.name) lang.name = languageName;
    languages[languageName] = lang;
    lang.rawDefinition = languageDefinition.bind(null, hljs);

    if (lang.aliases) {
      registerAliases(lang.aliases, { languageName });
    }
  }

  /**
   * Remove a language grammar module
   *
   * @param {string} languageName
   */
  function unregisterLanguage(languageName) {
    delete languages[languageName];
    for (const alias of Object.keys(aliases)) {
      if (aliases[alias] === languageName) {
        delete aliases[alias];
      }
    }
  }

  /**
   * @returns {string[]} List of language internal names
   */
  function listLanguages() {
    return Object.keys(languages);
  }

  /**
   * @param {string} name - name of the language to retrieve
   * @returns {Language | undefined}
   */
  function getLanguage(name) {
    name = (name || '').toLowerCase();
    return languages[name] || languages[aliases[name]];
  }

  /**
   *
   * @param {string|string[]} aliasList - single alias or list of aliases
   * @param {{languageName: string}} opts
   */
  function registerAliases(aliasList, { languageName }) {
    if (typeof aliasList === 'string') {
      aliasList = [aliasList];
    }
    aliasList.forEach(alias => { aliases[alias.toLowerCase()] = languageName; });
  }

  /**
   * Determines if a given language has auto-detection enabled
   * @param {string} name - name of the language
   */
  function autoDetection(name) {
    const lang = getLanguage(name);
    return lang && !lang.disableAutodetect;
  }

  /**
   * Upgrades the old highlightBlock plugins to the new
   * highlightElement API
   * @param {HLJSPlugin} plugin
   */
  function upgradePluginAPI(plugin) {
    // TODO: remove with v12
    if (plugin["before:highlightBlock"] && !plugin["before:highlightElement"]) {
      plugin["before:highlightElement"] = (data) => {
        plugin["before:highlightBlock"](
          Object.assign({ block: data.el }, data)
        );
      };
    }
    if (plugin["after:highlightBlock"] && !plugin["after:highlightElement"]) {
      plugin["after:highlightElement"] = (data) => {
        plugin["after:highlightBlock"](
          Object.assign({ block: data.el }, data)
        );
      };
    }
  }

  /**
   * @param {HLJSPlugin} plugin
   */
  function addPlugin(plugin) {
    upgradePluginAPI(plugin);
    plugins.push(plugin);
  }

  /**
   * @param {HLJSPlugin} plugin
   */
  function removePlugin(plugin) {
    const index = plugins.indexOf(plugin);
    if (index !== -1) {
      plugins.splice(index, 1);
    }
  }

  /**
   *
   * @param {PluginEvent} event
   * @param {any} args
   */
  function fire(event, args) {
    const cb = event;
    plugins.forEach(function(plugin) {
      if (plugin[cb]) {
        plugin[cb](args);
      }
    });
  }

  /**
   * DEPRECATED
   * @param {HighlightedHTMLElement} el
   */
  function deprecateHighlightBlock(el) {
    deprecated("10.7.0", "highlightBlock will be removed entirely in v12.0");
    deprecated("10.7.0", "Please use highlightElement now.");

    return highlightElement(el);
  }

  /* Interface definition */
  Object.assign(hljs, {
    highlight,
    highlightAuto,
    highlightAll,
    highlightElement,
    // TODO: Remove with v12 API
    highlightBlock: deprecateHighlightBlock,
    configure,
    initHighlighting,
    initHighlightingOnLoad,
    registerLanguage,
    unregisterLanguage,
    listLanguages,
    getLanguage,
    registerAliases,
    autoDetection,
    inherit,
    addPlugin,
    removePlugin
  });

  hljs.debugMode = function() { SAFE_MODE = false; };
  hljs.safeMode = function() { SAFE_MODE = true; };
  hljs.versionString = version;

  hljs.regex = {
    concat: concat,
    lookahead: lookahead,
    either: either,
    optional: optional,
    anyNumberOfTimes: anyNumberOfTimes
  };

  for (const key in MODES) {
    // @ts-ignore
    if (typeof MODES[key] === "object") {
      // @ts-ignore
      deepFreeze(MODES[key]);
    }
  }

  // merge all the modes/regexes into our main object
  Object.assign(hljs, MODES);

  return hljs;
};

// Other names for the variable may break build script
const highlight = HLJS({});

// returns a new instance of the highlighter to be used for extensions
// check https://github.com/wooorm/lowlight/issues/47
highlight.newInstance = () => HLJS({});

var core = highlight;
highlight.HighlightJS = highlight;
highlight.default = highlight;

/*
Language: HTML, XML
Website: https://www.w3.org/XML/
Category: common, web
Audit: 2020
*/

var xml_1;
var hasRequiredXml;

function requireXml () {
	if (hasRequiredXml) return xml_1;
	hasRequiredXml = 1;
	/** @type LanguageFn */
	function xml(hljs) {
	  const regex = hljs.regex;
	  // XML names can have the following additional letters: https://www.w3.org/TR/xml/#NT-NameChar
	  // OTHER_NAME_CHARS = /[:\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]/;
	  // Element names start with NAME_START_CHAR followed by optional other Unicode letters, ASCII digits, hyphens, underscores, and periods
	  // const TAG_NAME_RE = regex.concat(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, regex.optional(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*:/), /[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*/);;
	  // const XML_IDENT_RE = /[A-Z_a-z:\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]+/;
	  // const TAG_NAME_RE = regex.concat(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, regex.optional(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*:/), /[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*/);
	  // however, to cater for performance and more Unicode support rely simply on the Unicode letter class
	  const TAG_NAME_RE = regex.concat(/[\p{L}_]/u, regex.optional(/[\p{L}0-9_.-]*:/u), /[\p{L}0-9_.-]*/u);
	  const XML_IDENT_RE = /[\p{L}0-9._:-]+/u;
	  const XML_ENTITIES = {
	    className: 'symbol',
	    begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
	  };
	  const XML_META_KEYWORDS = {
	    begin: /\s/,
	    contains: [
	      {
	        className: 'keyword',
	        begin: /#?[a-z_][a-z1-9_-]+/,
	        illegal: /\n/
	      }
	    ]
	  };
	  const XML_META_PAR_KEYWORDS = hljs.inherit(XML_META_KEYWORDS, {
	    begin: /\(/,
	    end: /\)/
	  });
	  const APOS_META_STRING_MODE = hljs.inherit(hljs.APOS_STRING_MODE, { className: 'string' });
	  const QUOTE_META_STRING_MODE = hljs.inherit(hljs.QUOTE_STRING_MODE, { className: 'string' });
	  const TAG_INTERNALS = {
	    endsWithParent: true,
	    illegal: /</,
	    relevance: 0,
	    contains: [
	      {
	        className: 'attr',
	        begin: XML_IDENT_RE,
	        relevance: 0
	      },
	      {
	        begin: /=\s*/,
	        relevance: 0,
	        contains: [
	          {
	            className: 'string',
	            endsParent: true,
	            variants: [
	              {
	                begin: /"/,
	                end: /"/,
	                contains: [ XML_ENTITIES ]
	              },
	              {
	                begin: /'/,
	                end: /'/,
	                contains: [ XML_ENTITIES ]
	              },
	              { begin: /[^\s"'=<>`]+/ }
	            ]
	          }
	        ]
	      }
	    ]
	  };
	  return {
	    name: 'HTML, XML',
	    aliases: [
	      'html',
	      'xhtml',
	      'rss',
	      'atom',
	      'xjb',
	      'xsd',
	      'xsl',
	      'plist',
	      'wsf',
	      'svg'
	    ],
	    case_insensitive: true,
	    unicodeRegex: true,
	    contains: [
	      {
	        className: 'meta',
	        begin: /<![a-z]/,
	        end: />/,
	        relevance: 10,
	        contains: [
	          XML_META_KEYWORDS,
	          QUOTE_META_STRING_MODE,
	          APOS_META_STRING_MODE,
	          XML_META_PAR_KEYWORDS,
	          {
	            begin: /\[/,
	            end: /\]/,
	            contains: [
	              {
	                className: 'meta',
	                begin: /<![a-z]/,
	                end: />/,
	                contains: [
	                  XML_META_KEYWORDS,
	                  XML_META_PAR_KEYWORDS,
	                  QUOTE_META_STRING_MODE,
	                  APOS_META_STRING_MODE
	                ]
	              }
	            ]
	          }
	        ]
	      },
	      hljs.COMMENT(
	        /<!--/,
	        /-->/,
	        { relevance: 10 }
	      ),
	      {
	        begin: /<!\[CDATA\[/,
	        end: /\]\]>/,
	        relevance: 10
	      },
	      XML_ENTITIES,
	      // xml processing instructions
	      {
	        className: 'meta',
	        end: /\?>/,
	        variants: [
	          {
	            begin: /<\?xml/,
	            relevance: 10,
	            contains: [
	              QUOTE_META_STRING_MODE
	            ]
	          },
	          {
	            begin: /<\?[a-z][a-z0-9]+/,
	          }
	        ]

	      },
	      {
	        className: 'tag',
	        /*
	        The lookahead pattern (?=...) ensures that 'begin' only matches
	        '<style' as a single word, followed by a whitespace or an
	        ending bracket.
	        */
	        begin: /<style(?=\s|>)/,
	        end: />/,
	        keywords: { name: 'style' },
	        contains: [ TAG_INTERNALS ],
	        starts: {
	          end: /<\/style>/,
	          returnEnd: true,
	          subLanguage: [
	            'css',
	            'xml'
	          ]
	        }
	      },
	      {
	        className: 'tag',
	        // See the comment in the <style tag about the lookahead pattern
	        begin: /<script(?=\s|>)/,
	        end: />/,
	        keywords: { name: 'script' },
	        contains: [ TAG_INTERNALS ],
	        starts: {
	          end: /<\/script>/,
	          returnEnd: true,
	          subLanguage: [
	            'javascript',
	            'handlebars',
	            'xml'
	          ]
	        }
	      },
	      // we need this for now for jSX
	      {
	        className: 'tag',
	        begin: /<>|<\/>/
	      },
	      // open tag
	      {
	        className: 'tag',
	        begin: regex.concat(
	          /</,
	          regex.lookahead(regex.concat(
	            TAG_NAME_RE,
	            // <tag/>
	            // <tag>
	            // <tag ...
	            regex.either(/\/>/, />/, /\s/)
	          ))
	        ),
	        end: /\/?>/,
	        contains: [
	          {
	            className: 'name',
	            begin: TAG_NAME_RE,
	            relevance: 0,
	            starts: TAG_INTERNALS
	          }
	        ]
	      },
	      // close tag
	      {
	        className: 'tag',
	        begin: regex.concat(
	          /<\//,
	          regex.lookahead(regex.concat(
	            TAG_NAME_RE, />/
	          ))
	        ),
	        contains: [
	          {
	            className: 'name',
	            begin: TAG_NAME_RE,
	            relevance: 0
	          },
	          {
	            begin: />/,
	            relevance: 0,
	            endsParent: true
	          }
	        ]
	      }
	    ]
	  };
	}

	xml_1 = xml;
	return xml_1;
}

/*
Language: Bash
Author: vah <vahtenberg@gmail.com>
Contributrors: Benjamin Pannell <contact@sierrasoftworks.com>
Website: https://www.gnu.org/software/bash/
Category: common
*/

var bash_1;
var hasRequiredBash;

function requireBash () {
	if (hasRequiredBash) return bash_1;
	hasRequiredBash = 1;
	/** @type LanguageFn */
	function bash(hljs) {
	  const regex = hljs.regex;
	  const VAR = {};
	  const BRACED_VAR = {
	    begin: /\$\{/,
	    end: /\}/,
	    contains: [
	      "self",
	      {
	        begin: /:-/,
	        contains: [ VAR ]
	      } // default values
	    ]
	  };
	  Object.assign(VAR, {
	    className: 'variable',
	    variants: [
	      { begin: regex.concat(/\$[\w\d#@][\w\d_]*/,
	        // negative look-ahead tries to avoid matching patterns that are not
	        // Perl at all like $ident$, @ident@, etc.
	        `(?![\\w\\d])(?![$])`) },
	      BRACED_VAR
	    ]
	  });

	  const SUBST = {
	    className: 'subst',
	    begin: /\$\(/,
	    end: /\)/,
	    contains: [ hljs.BACKSLASH_ESCAPE ]
	  };
	  const HERE_DOC = {
	    begin: /<<-?\s*(?=\w+)/,
	    starts: { contains: [
	      hljs.END_SAME_AS_BEGIN({
	        begin: /(\w+)/,
	        end: /(\w+)/,
	        className: 'string'
	      })
	    ] }
	  };
	  const QUOTE_STRING = {
	    className: 'string',
	    begin: /"/,
	    end: /"/,
	    contains: [
	      hljs.BACKSLASH_ESCAPE,
	      VAR,
	      SUBST
	    ]
	  };
	  SUBST.contains.push(QUOTE_STRING);
	  const ESCAPED_QUOTE = {
	    match: /\\"/
	  };
	  const APOS_STRING = {
	    className: 'string',
	    begin: /'/,
	    end: /'/
	  };
	  const ESCAPED_APOS = {
	    match: /\\'/
	  };
	  const ARITHMETIC = {
	    begin: /\$?\(\(/,
	    end: /\)\)/,
	    contains: [
	      {
	        begin: /\d+#[0-9a-f]+/,
	        className: "number"
	      },
	      hljs.NUMBER_MODE,
	      VAR
	    ]
	  };
	  const SH_LIKE_SHELLS = [
	    "fish",
	    "bash",
	    "zsh",
	    "sh",
	    "csh",
	    "ksh",
	    "tcsh",
	    "dash",
	    "scsh",
	  ];
	  const KNOWN_SHEBANG = hljs.SHEBANG({
	    binary: `(${SH_LIKE_SHELLS.join("|")})`,
	    relevance: 10
	  });
	  const FUNCTION = {
	    className: 'function',
	    begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
	    returnBegin: true,
	    contains: [ hljs.inherit(hljs.TITLE_MODE, { begin: /\w[\w\d_]*/ }) ],
	    relevance: 0
	  };

	  const KEYWORDS = [
	    "if",
	    "then",
	    "else",
	    "elif",
	    "fi",
	    "for",
	    "while",
	    "until",
	    "in",
	    "do",
	    "done",
	    "case",
	    "esac",
	    "function",
	    "select"
	  ];

	  const LITERALS = [
	    "true",
	    "false"
	  ];

	  // to consume paths to prevent keyword matches inside them
	  const PATH_MODE = { match: /(\/[a-z._-]+)+/ };

	  // http://www.gnu.org/software/bash/manual/html_node/Shell-Builtin-Commands.html
	  const SHELL_BUILT_INS = [
	    "break",
	    "cd",
	    "continue",
	    "eval",
	    "exec",
	    "exit",
	    "export",
	    "getopts",
	    "hash",
	    "pwd",
	    "readonly",
	    "return",
	    "shift",
	    "test",
	    "times",
	    "trap",
	    "umask",
	    "unset"
	  ];

	  const BASH_BUILT_INS = [
	    "alias",
	    "bind",
	    "builtin",
	    "caller",
	    "command",
	    "declare",
	    "echo",
	    "enable",
	    "help",
	    "let",
	    "local",
	    "logout",
	    "mapfile",
	    "printf",
	    "read",
	    "readarray",
	    "source",
	    "type",
	    "typeset",
	    "ulimit",
	    "unalias"
	  ];

	  const ZSH_BUILT_INS = [
	    "autoload",
	    "bg",
	    "bindkey",
	    "bye",
	    "cap",
	    "chdir",
	    "clone",
	    "comparguments",
	    "compcall",
	    "compctl",
	    "compdescribe",
	    "compfiles",
	    "compgroups",
	    "compquote",
	    "comptags",
	    "comptry",
	    "compvalues",
	    "dirs",
	    "disable",
	    "disown",
	    "echotc",
	    "echoti",
	    "emulate",
	    "fc",
	    "fg",
	    "float",
	    "functions",
	    "getcap",
	    "getln",
	    "history",
	    "integer",
	    "jobs",
	    "kill",
	    "limit",
	    "log",
	    "noglob",
	    "popd",
	    "print",
	    "pushd",
	    "pushln",
	    "rehash",
	    "sched",
	    "setcap",
	    "setopt",
	    "stat",
	    "suspend",
	    "ttyctl",
	    "unfunction",
	    "unhash",
	    "unlimit",
	    "unsetopt",
	    "vared",
	    "wait",
	    "whence",
	    "where",
	    "which",
	    "zcompile",
	    "zformat",
	    "zftp",
	    "zle",
	    "zmodload",
	    "zparseopts",
	    "zprof",
	    "zpty",
	    "zregexparse",
	    "zsocket",
	    "zstyle",
	    "ztcp"
	  ];

	  const GNU_CORE_UTILS = [
	    "chcon",
	    "chgrp",
	    "chown",
	    "chmod",
	    "cp",
	    "dd",
	    "df",
	    "dir",
	    "dircolors",
	    "ln",
	    "ls",
	    "mkdir",
	    "mkfifo",
	    "mknod",
	    "mktemp",
	    "mv",
	    "realpath",
	    "rm",
	    "rmdir",
	    "shred",
	    "sync",
	    "touch",
	    "truncate",
	    "vdir",
	    "b2sum",
	    "base32",
	    "base64",
	    "cat",
	    "cksum",
	    "comm",
	    "csplit",
	    "cut",
	    "expand",
	    "fmt",
	    "fold",
	    "head",
	    "join",
	    "md5sum",
	    "nl",
	    "numfmt",
	    "od",
	    "paste",
	    "ptx",
	    "pr",
	    "sha1sum",
	    "sha224sum",
	    "sha256sum",
	    "sha384sum",
	    "sha512sum",
	    "shuf",
	    "sort",
	    "split",
	    "sum",
	    "tac",
	    "tail",
	    "tr",
	    "tsort",
	    "unexpand",
	    "uniq",
	    "wc",
	    "arch",
	    "basename",
	    "chroot",
	    "date",
	    "dirname",
	    "du",
	    "echo",
	    "env",
	    "expr",
	    "factor",
	    // "false", // keyword literal already
	    "groups",
	    "hostid",
	    "id",
	    "link",
	    "logname",
	    "nice",
	    "nohup",
	    "nproc",
	    "pathchk",
	    "pinky",
	    "printenv",
	    "printf",
	    "pwd",
	    "readlink",
	    "runcon",
	    "seq",
	    "sleep",
	    "stat",
	    "stdbuf",
	    "stty",
	    "tee",
	    "test",
	    "timeout",
	    // "true", // keyword literal already
	    "tty",
	    "uname",
	    "unlink",
	    "uptime",
	    "users",
	    "who",
	    "whoami",
	    "yes"
	  ];

	  return {
	    name: 'Bash',
	    aliases: [ 'sh' ],
	    keywords: {
	      $pattern: /\b[a-z][a-z0-9._-]+\b/,
	      keyword: KEYWORDS,
	      literal: LITERALS,
	      built_in: [
	        ...SHELL_BUILT_INS,
	        ...BASH_BUILT_INS,
	        // Shell modifiers
	        "set",
	        "shopt",
	        ...ZSH_BUILT_INS,
	        ...GNU_CORE_UTILS
	      ]
	    },
	    contains: [
	      KNOWN_SHEBANG, // to catch known shells and boost relevancy
	      hljs.SHEBANG(), // to catch unknown shells but still highlight the shebang
	      FUNCTION,
	      ARITHMETIC,
	      hljs.HASH_COMMENT_MODE,
	      HERE_DOC,
	      PATH_MODE,
	      QUOTE_STRING,
	      ESCAPED_QUOTE,
	      APOS_STRING,
	      ESCAPED_APOS,
	      VAR
	    ]
	  };
	}

	bash_1 = bash;
	return bash_1;
}

/*
Language: C
Category: common, system
Website: https://en.wikipedia.org/wiki/C_(programming_language)
*/

var c_1;
var hasRequiredC;

function requireC () {
	if (hasRequiredC) return c_1;
	hasRequiredC = 1;
	/** @type LanguageFn */
	function c(hljs) {
	  const regex = hljs.regex;
	  // added for historic reasons because `hljs.C_LINE_COMMENT_MODE` does
	  // not include such support nor can we be sure all the grammars depending
	  // on it would desire this behavior
	  const C_LINE_COMMENT_MODE = hljs.COMMENT('//', '$', { contains: [ { begin: /\\\n/ } ] });
	  const DECLTYPE_AUTO_RE = 'decltype\\(auto\\)';
	  const NAMESPACE_RE = '[a-zA-Z_]\\w*::';
	  const TEMPLATE_ARGUMENT_RE = '<[^<>]+>';
	  const FUNCTION_TYPE_RE = '('
	    + DECLTYPE_AUTO_RE + '|'
	    + regex.optional(NAMESPACE_RE)
	    + '[a-zA-Z_]\\w*' + regex.optional(TEMPLATE_ARGUMENT_RE)
	  + ')';


	  const TYPES = {
	    className: 'type',
	    variants: [
	      { begin: '\\b[a-z\\d_]*_t\\b' },
	      { match: /\batomic_[a-z]{3,6}\b/ }
	    ]

	  };

	  // https://en.cppreference.com/w/cpp/language/escape
	  // \\ \x \xFF \u2837 \u00323747 \374
	  const CHARACTER_ESCAPES = '\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)';
	  const STRINGS = {
	    className: 'string',
	    variants: [
	      {
	        begin: '(u8?|U|L)?"',
	        end: '"',
	        illegal: '\\n',
	        contains: [ hljs.BACKSLASH_ESCAPE ]
	      },
	      {
	        begin: '(u8?|U|L)?\'(' + CHARACTER_ESCAPES + "|.)",
	        end: '\'',
	        illegal: '.'
	      },
	      hljs.END_SAME_AS_BEGIN({
	        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
	        end: /\)([^()\\ ]{0,16})"/
	      })
	    ]
	  };

	  const NUMBERS = {
	    className: 'number',
	    variants: [
	      { begin: '\\b(0b[01\']+)' },
	      { begin: '(-?)\\b([\\d\']+(\\.[\\d\']*)?|\\.[\\d\']+)((ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L)?|f|F|b|B)' },
	      { begin: '(-?)(\\b0[xX][a-fA-F0-9\']+|(\\b[\\d\']+(\\.[\\d\']*)?|\\.[\\d\']+)([eE][-+]?[\\d\']+)?)' }
	    ],
	    relevance: 0
	  };

	  const PREPROCESSOR = {
	    className: 'meta',
	    begin: /#\s*[a-z]+\b/,
	    end: /$/,
	    keywords: { keyword:
	        'if else elif endif define undef warning error line '
	        + 'pragma _Pragma ifdef ifndef include' },
	    contains: [
	      {
	        begin: /\\\n/,
	        relevance: 0
	      },
	      hljs.inherit(STRINGS, { className: 'string' }),
	      {
	        className: 'string',
	        begin: /<.*?>/
	      },
	      C_LINE_COMMENT_MODE,
	      hljs.C_BLOCK_COMMENT_MODE
	    ]
	  };

	  const TITLE_MODE = {
	    className: 'title',
	    begin: regex.optional(NAMESPACE_RE) + hljs.IDENT_RE,
	    relevance: 0
	  };

	  const FUNCTION_TITLE = regex.optional(NAMESPACE_RE) + hljs.IDENT_RE + '\\s*\\(';

	  const C_KEYWORDS = [
	    "asm",
	    "auto",
	    "break",
	    "case",
	    "continue",
	    "default",
	    "do",
	    "else",
	    "enum",
	    "extern",
	    "for",
	    "fortran",
	    "goto",
	    "if",
	    "inline",
	    "register",
	    "restrict",
	    "return",
	    "sizeof",
	    "struct",
	    "switch",
	    "typedef",
	    "union",
	    "volatile",
	    "while",
	    "_Alignas",
	    "_Alignof",
	    "_Atomic",
	    "_Generic",
	    "_Noreturn",
	    "_Static_assert",
	    "_Thread_local",
	    // aliases
	    "alignas",
	    "alignof",
	    "noreturn",
	    "static_assert",
	    "thread_local",
	    // not a C keyword but is, for all intents and purposes, treated exactly like one.
	    "_Pragma"
	  ];

	  const C_TYPES = [
	    "float",
	    "double",
	    "signed",
	    "unsigned",
	    "int",
	    "short",
	    "long",
	    "char",
	    "void",
	    "_Bool",
	    "_Complex",
	    "_Imaginary",
	    "_Decimal32",
	    "_Decimal64",
	    "_Decimal128",
	    // modifiers
	    "const",
	    "static",
	    // aliases
	    "complex",
	    "bool",
	    "imaginary"
	  ];

	  const KEYWORDS = {
	    keyword: C_KEYWORDS,
	    type: C_TYPES,
	    literal: 'true false NULL',
	    // TODO: apply hinting work similar to what was done in cpp.js
	    built_in: 'std string wstring cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream '
	      + 'auto_ptr deque list queue stack vector map set pair bitset multiset multimap unordered_set '
	      + 'unordered_map unordered_multiset unordered_multimap priority_queue make_pair array shared_ptr abort terminate abs acos '
	      + 'asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp '
	      + 'fscanf future isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper '
	      + 'isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow '
	      + 'printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp '
	      + 'strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan '
	      + 'vfprintf vprintf vsprintf endl initializer_list unique_ptr',
	  };

	  const EXPRESSION_CONTAINS = [
	    PREPROCESSOR,
	    TYPES,
	    C_LINE_COMMENT_MODE,
	    hljs.C_BLOCK_COMMENT_MODE,
	    NUMBERS,
	    STRINGS
	  ];

	  const EXPRESSION_CONTEXT = {
	    // This mode covers expression context where we can't expect a function
	    // definition and shouldn't highlight anything that looks like one:
	    // `return some()`, `else if()`, `(x*sum(1, 2))`
	    variants: [
	      {
	        begin: /=/,
	        end: /;/
	      },
	      {
	        begin: /\(/,
	        end: /\)/
	      },
	      {
	        beginKeywords: 'new throw return else',
	        end: /;/
	      }
	    ],
	    keywords: KEYWORDS,
	    contains: EXPRESSION_CONTAINS.concat([
	      {
	        begin: /\(/,
	        end: /\)/,
	        keywords: KEYWORDS,
	        contains: EXPRESSION_CONTAINS.concat([ 'self' ]),
	        relevance: 0
	      }
	    ]),
	    relevance: 0
	  };

	  const FUNCTION_DECLARATION = {
	    begin: '(' + FUNCTION_TYPE_RE + '[\\*&\\s]+)+' + FUNCTION_TITLE,
	    returnBegin: true,
	    end: /[{;=]/,
	    excludeEnd: true,
	    keywords: KEYWORDS,
	    illegal: /[^\w\s\*&:<>.]/,
	    contains: [
	      { // to prevent it from being confused as the function title
	        begin: DECLTYPE_AUTO_RE,
	        keywords: KEYWORDS,
	        relevance: 0
	      },
	      {
	        begin: FUNCTION_TITLE,
	        returnBegin: true,
	        contains: [ hljs.inherit(TITLE_MODE, { className: "title.function" }) ],
	        relevance: 0
	      },
	      // allow for multiple declarations, e.g.:
	      // extern void f(int), g(char);
	      {
	        relevance: 0,
	        match: /,/
	      },
	      {
	        className: 'params',
	        begin: /\(/,
	        end: /\)/,
	        keywords: KEYWORDS,
	        relevance: 0,
	        contains: [
	          C_LINE_COMMENT_MODE,
	          hljs.C_BLOCK_COMMENT_MODE,
	          STRINGS,
	          NUMBERS,
	          TYPES,
	          // Count matching parentheses.
	          {
	            begin: /\(/,
	            end: /\)/,
	            keywords: KEYWORDS,
	            relevance: 0,
	            contains: [
	              'self',
	              C_LINE_COMMENT_MODE,
	              hljs.C_BLOCK_COMMENT_MODE,
	              STRINGS,
	              NUMBERS,
	              TYPES
	            ]
	          }
	        ]
	      },
	      TYPES,
	      C_LINE_COMMENT_MODE,
	      hljs.C_BLOCK_COMMENT_MODE,
	      PREPROCESSOR
	    ]
	  };

	  return {
	    name: "C",
	    aliases: [ 'h' ],
	    keywords: KEYWORDS,
	    // Until differentiations are added between `c` and `cpp`, `c` will
	    // not be auto-detected to avoid auto-detect conflicts between C and C++
	    disableAutodetect: true,
	    illegal: '</',
	    contains: [].concat(
	      EXPRESSION_CONTEXT,
	      FUNCTION_DECLARATION,
	      EXPRESSION_CONTAINS,
	      [
	        PREPROCESSOR,
	        {
	          begin: hljs.IDENT_RE + '::',
	          keywords: KEYWORDS
	        },
	        {
	          className: 'class',
	          beginKeywords: 'enum class struct union',
	          end: /[{;:<>=]/,
	          contains: [
	            { beginKeywords: "final class struct" },
	            hljs.TITLE_MODE
	          ]
	        }
	      ]),
	    exports: {
	      preprocessor: PREPROCESSOR,
	      strings: STRINGS,
	      keywords: KEYWORDS
	    }
	  };
	}

	c_1 = c;
	return c_1;
}

/*
Language: C++
Category: common, system
Website: https://isocpp.org
*/

var cpp_1;
var hasRequiredCpp;

function requireCpp () {
	if (hasRequiredCpp) return cpp_1;
	hasRequiredCpp = 1;
	/** @type LanguageFn */
	function cpp(hljs) {
	  const regex = hljs.regex;
	  // added for historic reasons because `hljs.C_LINE_COMMENT_MODE` does
	  // not include such support nor can we be sure all the grammars depending
	  // on it would desire this behavior
	  const C_LINE_COMMENT_MODE = hljs.COMMENT('//', '$', { contains: [ { begin: /\\\n/ } ] });
	  const DECLTYPE_AUTO_RE = 'decltype\\(auto\\)';
	  const NAMESPACE_RE = '[a-zA-Z_]\\w*::';
	  const TEMPLATE_ARGUMENT_RE = '<[^<>]+>';
	  const FUNCTION_TYPE_RE = '(?!struct)('
	    + DECLTYPE_AUTO_RE + '|'
	    + regex.optional(NAMESPACE_RE)
	    + '[a-zA-Z_]\\w*' + regex.optional(TEMPLATE_ARGUMENT_RE)
	  + ')';

	  const CPP_PRIMITIVE_TYPES = {
	    className: 'type',
	    begin: '\\b[a-z\\d_]*_t\\b'
	  };

	  // https://en.cppreference.com/w/cpp/language/escape
	  // \\ \x \xFF \u2837 \u00323747 \374
	  const CHARACTER_ESCAPES = '\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)';
	  const STRINGS = {
	    className: 'string',
	    variants: [
	      {
	        begin: '(u8?|U|L)?"',
	        end: '"',
	        illegal: '\\n',
	        contains: [ hljs.BACKSLASH_ESCAPE ]
	      },
	      {
	        begin: '(u8?|U|L)?\'(' + CHARACTER_ESCAPES + '|.)',
	        end: '\'',
	        illegal: '.'
	      },
	      hljs.END_SAME_AS_BEGIN({
	        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
	        end: /\)([^()\\ ]{0,16})"/
	      })
	    ]
	  };

	  const NUMBERS = {
	    className: 'number',
	    variants: [
	      { begin: '\\b(0b[01\']+)' },
	      { begin: '(-?)\\b([\\d\']+(\\.[\\d\']*)?|\\.[\\d\']+)((ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L)?|f|F|b|B)' },
	      { begin: '(-?)(\\b0[xX][a-fA-F0-9\']+|(\\b[\\d\']+(\\.[\\d\']*)?|\\.[\\d\']+)([eE][-+]?[\\d\']+)?)' }
	    ],
	    relevance: 0
	  };

	  const PREPROCESSOR = {
	    className: 'meta',
	    begin: /#\s*[a-z]+\b/,
	    end: /$/,
	    keywords: { keyword:
	        'if else elif endif define undef warning error line '
	        + 'pragma _Pragma ifdef ifndef include' },
	    contains: [
	      {
	        begin: /\\\n/,
	        relevance: 0
	      },
	      hljs.inherit(STRINGS, { className: 'string' }),
	      {
	        className: 'string',
	        begin: /<.*?>/
	      },
	      C_LINE_COMMENT_MODE,
	      hljs.C_BLOCK_COMMENT_MODE
	    ]
	  };

	  const TITLE_MODE = {
	    className: 'title',
	    begin: regex.optional(NAMESPACE_RE) + hljs.IDENT_RE,
	    relevance: 0
	  };

	  const FUNCTION_TITLE = regex.optional(NAMESPACE_RE) + hljs.IDENT_RE + '\\s*\\(';

	  // https://en.cppreference.com/w/cpp/keyword
	  const RESERVED_KEYWORDS = [
	    'alignas',
	    'alignof',
	    'and',
	    'and_eq',
	    'asm',
	    'atomic_cancel',
	    'atomic_commit',
	    'atomic_noexcept',
	    'auto',
	    'bitand',
	    'bitor',
	    'break',
	    'case',
	    'catch',
	    'class',
	    'co_await',
	    'co_return',
	    'co_yield',
	    'compl',
	    'concept',
	    'const_cast|10',
	    'consteval',
	    'constexpr',
	    'constinit',
	    'continue',
	    'decltype',
	    'default',
	    'delete',
	    'do',
	    'dynamic_cast|10',
	    'else',
	    'enum',
	    'explicit',
	    'export',
	    'extern',
	    'false',
	    'final',
	    'for',
	    'friend',
	    'goto',
	    'if',
	    'import',
	    'inline',
	    'module',
	    'mutable',
	    'namespace',
	    'new',
	    'noexcept',
	    'not',
	    'not_eq',
	    'nullptr',
	    'operator',
	    'or',
	    'or_eq',
	    'override',
	    'private',
	    'protected',
	    'public',
	    'reflexpr',
	    'register',
	    'reinterpret_cast|10',
	    'requires',
	    'return',
	    'sizeof',
	    'static_assert',
	    'static_cast|10',
	    'struct',
	    'switch',
	    'synchronized',
	    'template',
	    'this',
	    'thread_local',
	    'throw',
	    'transaction_safe',
	    'transaction_safe_dynamic',
	    'true',
	    'try',
	    'typedef',
	    'typeid',
	    'typename',
	    'union',
	    'using',
	    'virtual',
	    'volatile',
	    'while',
	    'xor',
	    'xor_eq'
	  ];

	  // https://en.cppreference.com/w/cpp/keyword
	  const RESERVED_TYPES = [
	    'bool',
	    'char',
	    'char16_t',
	    'char32_t',
	    'char8_t',
	    'double',
	    'float',
	    'int',
	    'long',
	    'short',
	    'void',
	    'wchar_t',
	    'unsigned',
	    'signed',
	    'const',
	    'static'
	  ];

	  const TYPE_HINTS = [
	    'any',
	    'auto_ptr',
	    'barrier',
	    'binary_semaphore',
	    'bitset',
	    'complex',
	    'condition_variable',
	    'condition_variable_any',
	    'counting_semaphore',
	    'deque',
	    'false_type',
	    'future',
	    'imaginary',
	    'initializer_list',
	    'istringstream',
	    'jthread',
	    'latch',
	    'lock_guard',
	    'multimap',
	    'multiset',
	    'mutex',
	    'optional',
	    'ostringstream',
	    'packaged_task',
	    'pair',
	    'promise',
	    'priority_queue',
	    'queue',
	    'recursive_mutex',
	    'recursive_timed_mutex',
	    'scoped_lock',
	    'set',
	    'shared_future',
	    'shared_lock',
	    'shared_mutex',
	    'shared_timed_mutex',
	    'shared_ptr',
	    'stack',
	    'string_view',
	    'stringstream',
	    'timed_mutex',
	    'thread',
	    'true_type',
	    'tuple',
	    'unique_lock',
	    'unique_ptr',
	    'unordered_map',
	    'unordered_multimap',
	    'unordered_multiset',
	    'unordered_set',
	    'variant',
	    'vector',
	    'weak_ptr',
	    'wstring',
	    'wstring_view'
	  ];

	  const FUNCTION_HINTS = [
	    'abort',
	    'abs',
	    'acos',
	    'apply',
	    'as_const',
	    'asin',
	    'atan',
	    'atan2',
	    'calloc',
	    'ceil',
	    'cerr',
	    'cin',
	    'clog',
	    'cos',
	    'cosh',
	    'cout',
	    'declval',
	    'endl',
	    'exchange',
	    'exit',
	    'exp',
	    'fabs',
	    'floor',
	    'fmod',
	    'forward',
	    'fprintf',
	    'fputs',
	    'free',
	    'frexp',
	    'fscanf',
	    'future',
	    'invoke',
	    'isalnum',
	    'isalpha',
	    'iscntrl',
	    'isdigit',
	    'isgraph',
	    'islower',
	    'isprint',
	    'ispunct',
	    'isspace',
	    'isupper',
	    'isxdigit',
	    'labs',
	    'launder',
	    'ldexp',
	    'log',
	    'log10',
	    'make_pair',
	    'make_shared',
	    'make_shared_for_overwrite',
	    'make_tuple',
	    'make_unique',
	    'malloc',
	    'memchr',
	    'memcmp',
	    'memcpy',
	    'memset',
	    'modf',
	    'move',
	    'pow',
	    'printf',
	    'putchar',
	    'puts',
	    'realloc',
	    'scanf',
	    'sin',
	    'sinh',
	    'snprintf',
	    'sprintf',
	    'sqrt',
	    'sscanf',
	    'std',
	    'stderr',
	    'stdin',
	    'stdout',
	    'strcat',
	    'strchr',
	    'strcmp',
	    'strcpy',
	    'strcspn',
	    'strlen',
	    'strncat',
	    'strncmp',
	    'strncpy',
	    'strpbrk',
	    'strrchr',
	    'strspn',
	    'strstr',
	    'swap',
	    'tan',
	    'tanh',
	    'terminate',
	    'to_underlying',
	    'tolower',
	    'toupper',
	    'vfprintf',
	    'visit',
	    'vprintf',
	    'vsprintf'
	  ];

	  const LITERALS = [
	    'NULL',
	    'false',
	    'nullopt',
	    'nullptr',
	    'true'
	  ];

	  // https://en.cppreference.com/w/cpp/keyword
	  const BUILT_IN = [ '_Pragma' ];

	  const CPP_KEYWORDS = {
	    type: RESERVED_TYPES,
	    keyword: RESERVED_KEYWORDS,
	    literal: LITERALS,
	    built_in: BUILT_IN,
	    _type_hints: TYPE_HINTS
	  };

	  const FUNCTION_DISPATCH = {
	    className: 'function.dispatch',
	    relevance: 0,
	    keywords: {
	      // Only for relevance, not highlighting.
	      _hint: FUNCTION_HINTS },
	    begin: regex.concat(
	      /\b/,
	      /(?!decltype)/,
	      /(?!if)/,
	      /(?!for)/,
	      /(?!switch)/,
	      /(?!while)/,
	      hljs.IDENT_RE,
	      regex.lookahead(/(<[^<>]+>|)\s*\(/))
	  };

	  const EXPRESSION_CONTAINS = [
	    FUNCTION_DISPATCH,
	    PREPROCESSOR,
	    CPP_PRIMITIVE_TYPES,
	    C_LINE_COMMENT_MODE,
	    hljs.C_BLOCK_COMMENT_MODE,
	    NUMBERS,
	    STRINGS
	  ];

	  const EXPRESSION_CONTEXT = {
	    // This mode covers expression context where we can't expect a function
	    // definition and shouldn't highlight anything that looks like one:
	    // `return some()`, `else if()`, `(x*sum(1, 2))`
	    variants: [
	      {
	        begin: /=/,
	        end: /;/
	      },
	      {
	        begin: /\(/,
	        end: /\)/
	      },
	      {
	        beginKeywords: 'new throw return else',
	        end: /;/
	      }
	    ],
	    keywords: CPP_KEYWORDS,
	    contains: EXPRESSION_CONTAINS.concat([
	      {
	        begin: /\(/,
	        end: /\)/,
	        keywords: CPP_KEYWORDS,
	        contains: EXPRESSION_CONTAINS.concat([ 'self' ]),
	        relevance: 0
	      }
	    ]),
	    relevance: 0
	  };

	  const FUNCTION_DECLARATION = {
	    className: 'function',
	    begin: '(' + FUNCTION_TYPE_RE + '[\\*&\\s]+)+' + FUNCTION_TITLE,
	    returnBegin: true,
	    end: /[{;=]/,
	    excludeEnd: true,
	    keywords: CPP_KEYWORDS,
	    illegal: /[^\w\s\*&:<>.]/,
	    contains: [
	      { // to prevent it from being confused as the function title
	        begin: DECLTYPE_AUTO_RE,
	        keywords: CPP_KEYWORDS,
	        relevance: 0
	      },
	      {
	        begin: FUNCTION_TITLE,
	        returnBegin: true,
	        contains: [ TITLE_MODE ],
	        relevance: 0
	      },
	      // needed because we do not have look-behind on the below rule
	      // to prevent it from grabbing the final : in a :: pair
	      {
	        begin: /::/,
	        relevance: 0
	      },
	      // initializers
	      {
	        begin: /:/,
	        endsWithParent: true,
	        contains: [
	          STRINGS,
	          NUMBERS
	        ]
	      },
	      // allow for multiple declarations, e.g.:
	      // extern void f(int), g(char);
	      {
	        relevance: 0,
	        match: /,/
	      },
	      {
	        className: 'params',
	        begin: /\(/,
	        end: /\)/,
	        keywords: CPP_KEYWORDS,
	        relevance: 0,
	        contains: [
	          C_LINE_COMMENT_MODE,
	          hljs.C_BLOCK_COMMENT_MODE,
	          STRINGS,
	          NUMBERS,
	          CPP_PRIMITIVE_TYPES,
	          // Count matching parentheses.
	          {
	            begin: /\(/,
	            end: /\)/,
	            keywords: CPP_KEYWORDS,
	            relevance: 0,
	            contains: [
	              'self',
	              C_LINE_COMMENT_MODE,
	              hljs.C_BLOCK_COMMENT_MODE,
	              STRINGS,
	              NUMBERS,
	              CPP_PRIMITIVE_TYPES
	            ]
	          }
	        ]
	      },
	      CPP_PRIMITIVE_TYPES,
	      C_LINE_COMMENT_MODE,
	      hljs.C_BLOCK_COMMENT_MODE,
	      PREPROCESSOR
	    ]
	  };

	  return {
	    name: 'C++',
	    aliases: [
	      'cc',
	      'c++',
	      'h++',
	      'hpp',
	      'hh',
	      'hxx',
	      'cxx'
	    ],
	    keywords: CPP_KEYWORDS,
	    illegal: '</',
	    classNameAliases: { 'function.dispatch': 'built_in' },
	    contains: [].concat(
	      EXPRESSION_CONTEXT,
	      FUNCTION_DECLARATION,
	      FUNCTION_DISPATCH,
	      EXPRESSION_CONTAINS,
	      [
	        PREPROCESSOR,
	        { // containers: ie, `vector <int> rooms (9);`
	          begin: '\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array|tuple|optional|variant|function)\\s*<(?!<)',
	          end: '>',
	          keywords: CPP_KEYWORDS,
	          contains: [
	            'self',
	            CPP_PRIMITIVE_TYPES
	          ]
	        },
	        {
	          begin: hljs.IDENT_RE + '::',
	          keywords: CPP_KEYWORDS
	        },
	        {
	          match: [
	            // extra complexity to deal with `enum class` and `enum struct`
	            /\b(?:enum(?:\s+(?:class|struct))?|class|struct|union)/,
	            /\s+/,
	            /\w+/
	          ],
	          className: {
	            1: 'keyword',
	            3: 'title.class'
	          }
	        }
	      ])
	  };
	}

	cpp_1 = cpp;
	return cpp_1;
}

/*
Language: C#
Author: Jason Diamond <jason@diamond.name>
Contributor: Nicolas LLOBERA <nllobera@gmail.com>, Pieter Vantorre <pietervantorre@gmail.com>, David Pine <david.pine@microsoft.com>
Website: https://docs.microsoft.com/dotnet/csharp/
Category: common
*/

var csharp_1;
var hasRequiredCsharp;

function requireCsharp () {
	if (hasRequiredCsharp) return csharp_1;
	hasRequiredCsharp = 1;
	/** @type LanguageFn */
	function csharp(hljs) {
	  const BUILT_IN_KEYWORDS = [
	    'bool',
	    'byte',
	    'char',
	    'decimal',
	    'delegate',
	    'double',
	    'dynamic',
	    'enum',
	    'float',
	    'int',
	    'long',
	    'nint',
	    'nuint',
	    'object',
	    'sbyte',
	    'short',
	    'string',
	    'ulong',
	    'uint',
	    'ushort'
	  ];
	  const FUNCTION_MODIFIERS = [
	    'public',
	    'private',
	    'protected',
	    'static',
	    'internal',
	    'protected',
	    'abstract',
	    'async',
	    'extern',
	    'override',
	    'unsafe',
	    'virtual',
	    'new',
	    'sealed',
	    'partial'
	  ];
	  const LITERAL_KEYWORDS = [
	    'default',
	    'false',
	    'null',
	    'true'
	  ];
	  const NORMAL_KEYWORDS = [
	    'abstract',
	    'as',
	    'base',
	    'break',
	    'case',
	    'catch',
	    'class',
	    'const',
	    'continue',
	    'do',
	    'else',
	    'event',
	    'explicit',
	    'extern',
	    'finally',
	    'fixed',
	    'for',
	    'foreach',
	    'goto',
	    'if',
	    'implicit',
	    'in',
	    'interface',
	    'internal',
	    'is',
	    'lock',
	    'namespace',
	    'new',
	    'operator',
	    'out',
	    'override',
	    'params',
	    'private',
	    'protected',
	    'public',
	    'readonly',
	    'record',
	    'ref',
	    'return',
	    'scoped',
	    'sealed',
	    'sizeof',
	    'stackalloc',
	    'static',
	    'struct',
	    'switch',
	    'this',
	    'throw',
	    'try',
	    'typeof',
	    'unchecked',
	    'unsafe',
	    'using',
	    'virtual',
	    'void',
	    'volatile',
	    'while'
	  ];
	  const CONTEXTUAL_KEYWORDS = [
	    'add',
	    'alias',
	    'and',
	    'ascending',
	    'async',
	    'await',
	    'by',
	    'descending',
	    'equals',
	    'from',
	    'get',
	    'global',
	    'group',
	    'init',
	    'into',
	    'join',
	    'let',
	    'nameof',
	    'not',
	    'notnull',
	    'on',
	    'or',
	    'orderby',
	    'partial',
	    'remove',
	    'select',
	    'set',
	    'unmanaged',
	    'value|0',
	    'var',
	    'when',
	    'where',
	    'with',
	    'yield'
	  ];

	  const KEYWORDS = {
	    keyword: NORMAL_KEYWORDS.concat(CONTEXTUAL_KEYWORDS),
	    built_in: BUILT_IN_KEYWORDS,
	    literal: LITERAL_KEYWORDS
	  };
	  const TITLE_MODE = hljs.inherit(hljs.TITLE_MODE, { begin: '[a-zA-Z](\\.?\\w)*' });
	  const NUMBERS = {
	    className: 'number',
	    variants: [
	      { begin: '\\b(0b[01\']+)' },
	      { begin: '(-?)\\b([\\d\']+(\\.[\\d\']*)?|\\.[\\d\']+)(u|U|l|L|ul|UL|f|F|b|B)' },
	      { begin: '(-?)(\\b0[xX][a-fA-F0-9\']+|(\\b[\\d\']+(\\.[\\d\']*)?|\\.[\\d\']+)([eE][-+]?[\\d\']+)?)' }
	    ],
	    relevance: 0
	  };
	  const VERBATIM_STRING = {
	    className: 'string',
	    begin: '@"',
	    end: '"',
	    contains: [ { begin: '""' } ]
	  };
	  const VERBATIM_STRING_NO_LF = hljs.inherit(VERBATIM_STRING, { illegal: /\n/ });
	  const SUBST = {
	    className: 'subst',
	    begin: /\{/,
	    end: /\}/,
	    keywords: KEYWORDS
	  };
	  const SUBST_NO_LF = hljs.inherit(SUBST, { illegal: /\n/ });
	  const INTERPOLATED_STRING = {
	    className: 'string',
	    begin: /\$"/,
	    end: '"',
	    illegal: /\n/,
	    contains: [
	      { begin: /\{\{/ },
	      { begin: /\}\}/ },
	      hljs.BACKSLASH_ESCAPE,
	      SUBST_NO_LF
	    ]
	  };
	  const INTERPOLATED_VERBATIM_STRING = {
	    className: 'string',
	    begin: /\$@"/,
	    end: '"',
	    contains: [
	      { begin: /\{\{/ },
	      { begin: /\}\}/ },
	      { begin: '""' },
	      SUBST
	    ]
	  };
	  const INTERPOLATED_VERBATIM_STRING_NO_LF = hljs.inherit(INTERPOLATED_VERBATIM_STRING, {
	    illegal: /\n/,
	    contains: [
	      { begin: /\{\{/ },
	      { begin: /\}\}/ },
	      { begin: '""' },
	      SUBST_NO_LF
	    ]
	  });
	  SUBST.contains = [
	    INTERPOLATED_VERBATIM_STRING,
	    INTERPOLATED_STRING,
	    VERBATIM_STRING,
	    hljs.APOS_STRING_MODE,
	    hljs.QUOTE_STRING_MODE,
	    NUMBERS,
	    hljs.C_BLOCK_COMMENT_MODE
	  ];
	  SUBST_NO_LF.contains = [
	    INTERPOLATED_VERBATIM_STRING_NO_LF,
	    INTERPOLATED_STRING,
	    VERBATIM_STRING_NO_LF,
	    hljs.APOS_STRING_MODE,
	    hljs.QUOTE_STRING_MODE,
	    NUMBERS,
	    hljs.inherit(hljs.C_BLOCK_COMMENT_MODE, { illegal: /\n/ })
	  ];
	  const STRING = { variants: [
	    INTERPOLATED_VERBATIM_STRING,
	    INTERPOLATED_STRING,
	    VERBATIM_STRING,
	    hljs.APOS_STRING_MODE,
	    hljs.QUOTE_STRING_MODE
	  ] };

	  const GENERIC_MODIFIER = {
	    begin: "<",
	    end: ">",
	    contains: [
	      { beginKeywords: "in out" },
	      TITLE_MODE
	    ]
	  };
	  const TYPE_IDENT_RE = hljs.IDENT_RE + '(<' + hljs.IDENT_RE + '(\\s*,\\s*' + hljs.IDENT_RE + ')*>)?(\\[\\])?';
	  const AT_IDENTIFIER = {
	    // prevents expressions like `@class` from incorrect flagging
	    // `class` as a keyword
	    begin: "@" + hljs.IDENT_RE,
	    relevance: 0
	  };

	  return {
	    name: 'C#',
	    aliases: [
	      'cs',
	      'c#'
	    ],
	    keywords: KEYWORDS,
	    illegal: /::/,
	    contains: [
	      hljs.COMMENT(
	        '///',
	        '$',
	        {
	          returnBegin: true,
	          contains: [
	            {
	              className: 'doctag',
	              variants: [
	                {
	                  begin: '///',
	                  relevance: 0
	                },
	                { begin: '<!--|-->' },
	                {
	                  begin: '</?',
	                  end: '>'
	                }
	              ]
	            }
	          ]
	        }
	      ),
	      hljs.C_LINE_COMMENT_MODE,
	      hljs.C_BLOCK_COMMENT_MODE,
	      {
	        className: 'meta',
	        begin: '#',
	        end: '$',
	        keywords: { keyword: 'if else elif endif define undef warning error line region endregion pragma checksum' }
	      },
	      STRING,
	      NUMBERS,
	      {
	        beginKeywords: 'class interface',
	        relevance: 0,
	        end: /[{;=]/,
	        illegal: /[^\s:,]/,
	        contains: [
	          { beginKeywords: "where class" },
	          TITLE_MODE,
	          GENERIC_MODIFIER,
	          hljs.C_LINE_COMMENT_MODE,
	          hljs.C_BLOCK_COMMENT_MODE
	        ]
	      },
	      {
	        beginKeywords: 'namespace',
	        relevance: 0,
	        end: /[{;=]/,
	        illegal: /[^\s:]/,
	        contains: [
	          TITLE_MODE,
	          hljs.C_LINE_COMMENT_MODE,
	          hljs.C_BLOCK_COMMENT_MODE
	        ]
	      },
	      {
	        beginKeywords: 'record',
	        relevance: 0,
	        end: /[{;=]/,
	        illegal: /[^\s:]/,
	        contains: [
	          TITLE_MODE,
	          GENERIC_MODIFIER,
	          hljs.C_LINE_COMMENT_MODE,
	          hljs.C_BLOCK_COMMENT_MODE
	        ]
	      },
	      {
	        // [Attributes("")]
	        className: 'meta',
	        begin: '^\\s*\\[(?=[\\w])',
	        excludeBegin: true,
	        end: '\\]',
	        excludeEnd: true,
	        contains: [
	          {
	            className: 'string',
	            begin: /"/,
	            end: /"/
	          }
	        ]
	      },
	      {
	        // Expression keywords prevent 'keyword Name(...)' from being
	        // recognized as a function definition
	        beginKeywords: 'new return throw await else',
	        relevance: 0
	      },
	      {
	        className: 'function',
	        begin: '(' + TYPE_IDENT_RE + '\\s+)+' + hljs.IDENT_RE + '\\s*(<[^=]+>\\s*)?\\(',
	        returnBegin: true,
	        end: /\s*[{;=]/,
	        excludeEnd: true,
	        keywords: KEYWORDS,
	        contains: [
	          // prevents these from being highlighted `title`
	          {
	            beginKeywords: FUNCTION_MODIFIERS.join(" "),
	            relevance: 0
	          },
	          {
	            begin: hljs.IDENT_RE + '\\s*(<[^=]+>\\s*)?\\(',
	            returnBegin: true,
	            contains: [
	              hljs.TITLE_MODE,
	              GENERIC_MODIFIER
	            ],
	            relevance: 0
	          },
	          { match: /\(\)/ },
	          {
	            className: 'params',
	            begin: /\(/,
	            end: /\)/,
	            excludeBegin: true,
	            excludeEnd: true,
	            keywords: KEYWORDS,
	            relevance: 0,
	            contains: [
	              STRING,
	              NUMBERS,
	              hljs.C_BLOCK_COMMENT_MODE
	            ]
	          },
	          hljs.C_LINE_COMMENT_MODE,
	          hljs.C_BLOCK_COMMENT_MODE
	        ]
	      },
	      AT_IDENTIFIER
	    ]
	  };
	}

	csharp_1 = csharp;
	return csharp_1;
}

var css_1;
var hasRequiredCss;

function requireCss () {
	if (hasRequiredCss) return css_1;
	hasRequiredCss = 1;
	const MODES = (hljs) => {
	  return {
	    IMPORTANT: {
	      scope: 'meta',
	      begin: '!important'
	    },
	    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
	    HEXCOLOR: {
	      scope: 'number',
	      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
	    },
	    FUNCTION_DISPATCH: {
	      className: "built_in",
	      begin: /[\w-]+(?=\()/
	    },
	    ATTRIBUTE_SELECTOR_MODE: {
	      scope: 'selector-attr',
	      begin: /\[/,
	      end: /\]/,
	      illegal: '$',
	      contains: [
	        hljs.APOS_STRING_MODE,
	        hljs.QUOTE_STRING_MODE
	      ]
	    },
	    CSS_NUMBER_MODE: {
	      scope: 'number',
	      begin: hljs.NUMBER_RE + '(' +
	        '%|em|ex|ch|rem' +
	        '|vw|vh|vmin|vmax' +
	        '|cm|mm|in|pt|pc|px' +
	        '|deg|grad|rad|turn' +
	        '|s|ms' +
	        '|Hz|kHz' +
	        '|dpi|dpcm|dppx' +
	        ')?',
	      relevance: 0
	    },
	    CSS_VARIABLE: {
	      className: "attr",
	      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
	    }
	  };
	};

	const TAGS = [
	  'a',
	  'abbr',
	  'address',
	  'article',
	  'aside',
	  'audio',
	  'b',
	  'blockquote',
	  'body',
	  'button',
	  'canvas',
	  'caption',
	  'cite',
	  'code',
	  'dd',
	  'del',
	  'details',
	  'dfn',
	  'div',
	  'dl',
	  'dt',
	  'em',
	  'fieldset',
	  'figcaption',
	  'figure',
	  'footer',
	  'form',
	  'h1',
	  'h2',
	  'h3',
	  'h4',
	  'h5',
	  'h6',
	  'header',
	  'hgroup',
	  'html',
	  'i',
	  'iframe',
	  'img',
	  'input',
	  'ins',
	  'kbd',
	  'label',
	  'legend',
	  'li',
	  'main',
	  'mark',
	  'menu',
	  'nav',
	  'object',
	  'ol',
	  'p',
	  'q',
	  'quote',
	  'samp',
	  'section',
	  'span',
	  'strong',
	  'summary',
	  'sup',
	  'table',
	  'tbody',
	  'td',
	  'textarea',
	  'tfoot',
	  'th',
	  'thead',
	  'time',
	  'tr',
	  'ul',
	  'var',
	  'video'
	];

	const MEDIA_FEATURES = [
	  'any-hover',
	  'any-pointer',
	  'aspect-ratio',
	  'color',
	  'color-gamut',
	  'color-index',
	  'device-aspect-ratio',
	  'device-height',
	  'device-width',
	  'display-mode',
	  'forced-colors',
	  'grid',
	  'height',
	  'hover',
	  'inverted-colors',
	  'monochrome',
	  'orientation',
	  'overflow-block',
	  'overflow-inline',
	  'pointer',
	  'prefers-color-scheme',
	  'prefers-contrast',
	  'prefers-reduced-motion',
	  'prefers-reduced-transparency',
	  'resolution',
	  'scan',
	  'scripting',
	  'update',
	  'width',
	  // TODO: find a better solution?
	  'min-width',
	  'max-width',
	  'min-height',
	  'max-height'
	];

	// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
	const PSEUDO_CLASSES = [
	  'active',
	  'any-link',
	  'blank',
	  'checked',
	  'current',
	  'default',
	  'defined',
	  'dir', // dir()
	  'disabled',
	  'drop',
	  'empty',
	  'enabled',
	  'first',
	  'first-child',
	  'first-of-type',
	  'fullscreen',
	  'future',
	  'focus',
	  'focus-visible',
	  'focus-within',
	  'has', // has()
	  'host', // host or host()
	  'host-context', // host-context()
	  'hover',
	  'indeterminate',
	  'in-range',
	  'invalid',
	  'is', // is()
	  'lang', // lang()
	  'last-child',
	  'last-of-type',
	  'left',
	  'link',
	  'local-link',
	  'not', // not()
	  'nth-child', // nth-child()
	  'nth-col', // nth-col()
	  'nth-last-child', // nth-last-child()
	  'nth-last-col', // nth-last-col()
	  'nth-last-of-type', //nth-last-of-type()
	  'nth-of-type', //nth-of-type()
	  'only-child',
	  'only-of-type',
	  'optional',
	  'out-of-range',
	  'past',
	  'placeholder-shown',
	  'read-only',
	  'read-write',
	  'required',
	  'right',
	  'root',
	  'scope',
	  'target',
	  'target-within',
	  'user-invalid',
	  'valid',
	  'visited',
	  'where' // where()
	];

	// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
	const PSEUDO_ELEMENTS = [
	  'after',
	  'backdrop',
	  'before',
	  'cue',
	  'cue-region',
	  'first-letter',
	  'first-line',
	  'grammar-error',
	  'marker',
	  'part',
	  'placeholder',
	  'selection',
	  'slotted',
	  'spelling-error'
	];

	const ATTRIBUTES = [
	  'align-content',
	  'align-items',
	  'align-self',
	  'all',
	  'animation',
	  'animation-delay',
	  'animation-direction',
	  'animation-duration',
	  'animation-fill-mode',
	  'animation-iteration-count',
	  'animation-name',
	  'animation-play-state',
	  'animation-timing-function',
	  'backface-visibility',
	  'background',
	  'background-attachment',
	  'background-blend-mode',
	  'background-clip',
	  'background-color',
	  'background-image',
	  'background-origin',
	  'background-position',
	  'background-repeat',
	  'background-size',
	  'block-size',
	  'border',
	  'border-block',
	  'border-block-color',
	  'border-block-end',
	  'border-block-end-color',
	  'border-block-end-style',
	  'border-block-end-width',
	  'border-block-start',
	  'border-block-start-color',
	  'border-block-start-style',
	  'border-block-start-width',
	  'border-block-style',
	  'border-block-width',
	  'border-bottom',
	  'border-bottom-color',
	  'border-bottom-left-radius',
	  'border-bottom-right-radius',
	  'border-bottom-style',
	  'border-bottom-width',
	  'border-collapse',
	  'border-color',
	  'border-image',
	  'border-image-outset',
	  'border-image-repeat',
	  'border-image-slice',
	  'border-image-source',
	  'border-image-width',
	  'border-inline',
	  'border-inline-color',
	  'border-inline-end',
	  'border-inline-end-color',
	  'border-inline-end-style',
	  'border-inline-end-width',
	  'border-inline-start',
	  'border-inline-start-color',
	  'border-inline-start-style',
	  'border-inline-start-width',
	  'border-inline-style',
	  'border-inline-width',
	  'border-left',
	  'border-left-color',
	  'border-left-style',
	  'border-left-width',
	  'border-radius',
	  'border-right',
	  'border-right-color',
	  'border-right-style',
	  'border-right-width',
	  'border-spacing',
	  'border-style',
	  'border-top',
	  'border-top-color',
	  'border-top-left-radius',
	  'border-top-right-radius',
	  'border-top-style',
	  'border-top-width',
	  'border-width',
	  'bottom',
	  'box-decoration-break',
	  'box-shadow',
	  'box-sizing',
	  'break-after',
	  'break-before',
	  'break-inside',
	  'caption-side',
	  'caret-color',
	  'clear',
	  'clip',
	  'clip-path',
	  'clip-rule',
	  'color',
	  'column-count',
	  'column-fill',
	  'column-gap',
	  'column-rule',
	  'column-rule-color',
	  'column-rule-style',
	  'column-rule-width',
	  'column-span',
	  'column-width',
	  'columns',
	  'contain',
	  'content',
	  'content-visibility',
	  'counter-increment',
	  'counter-reset',
	  'cue',
	  'cue-after',
	  'cue-before',
	  'cursor',
	  'direction',
	  'display',
	  'empty-cells',
	  'filter',
	  'flex',
	  'flex-basis',
	  'flex-direction',
	  'flex-flow',
	  'flex-grow',
	  'flex-shrink',
	  'flex-wrap',
	  'float',
	  'flow',
	  'font',
	  'font-display',
	  'font-family',
	  'font-feature-settings',
	  'font-kerning',
	  'font-language-override',
	  'font-size',
	  'font-size-adjust',
	  'font-smoothing',
	  'font-stretch',
	  'font-style',
	  'font-synthesis',
	  'font-variant',
	  'font-variant-caps',
	  'font-variant-east-asian',
	  'font-variant-ligatures',
	  'font-variant-numeric',
	  'font-variant-position',
	  'font-variation-settings',
	  'font-weight',
	  'gap',
	  'glyph-orientation-vertical',
	  'grid',
	  'grid-area',
	  'grid-auto-columns',
	  'grid-auto-flow',
	  'grid-auto-rows',
	  'grid-column',
	  'grid-column-end',
	  'grid-column-start',
	  'grid-gap',
	  'grid-row',
	  'grid-row-end',
	  'grid-row-start',
	  'grid-template',
	  'grid-template-areas',
	  'grid-template-columns',
	  'grid-template-rows',
	  'hanging-punctuation',
	  'height',
	  'hyphens',
	  'icon',
	  'image-orientation',
	  'image-rendering',
	  'image-resolution',
	  'ime-mode',
	  'inline-size',
	  'isolation',
	  'justify-content',
	  'left',
	  'letter-spacing',
	  'line-break',
	  'line-height',
	  'list-style',
	  'list-style-image',
	  'list-style-position',
	  'list-style-type',
	  'margin',
	  'margin-block',
	  'margin-block-end',
	  'margin-block-start',
	  'margin-bottom',
	  'margin-inline',
	  'margin-inline-end',
	  'margin-inline-start',
	  'margin-left',
	  'margin-right',
	  'margin-top',
	  'marks',
	  'mask',
	  'mask-border',
	  'mask-border-mode',
	  'mask-border-outset',
	  'mask-border-repeat',
	  'mask-border-slice',
	  'mask-border-source',
	  'mask-border-width',
	  'mask-clip',
	  'mask-composite',
	  'mask-image',
	  'mask-mode',
	  'mask-origin',
	  'mask-position',
	  'mask-repeat',
	  'mask-size',
	  'mask-type',
	  'max-block-size',
	  'max-height',
	  'max-inline-size',
	  'max-width',
	  'min-block-size',
	  'min-height',
	  'min-inline-size',
	  'min-width',
	  'mix-blend-mode',
	  'nav-down',
	  'nav-index',
	  'nav-left',
	  'nav-right',
	  'nav-up',
	  'none',
	  'normal',
	  'object-fit',
	  'object-position',
	  'opacity',
	  'order',
	  'orphans',
	  'outline',
	  'outline-color',
	  'outline-offset',
	  'outline-style',
	  'outline-width',
	  'overflow',
	  'overflow-wrap',
	  'overflow-x',
	  'overflow-y',
	  'padding',
	  'padding-block',
	  'padding-block-end',
	  'padding-block-start',
	  'padding-bottom',
	  'padding-inline',
	  'padding-inline-end',
	  'padding-inline-start',
	  'padding-left',
	  'padding-right',
	  'padding-top',
	  'page-break-after',
	  'page-break-before',
	  'page-break-inside',
	  'pause',
	  'pause-after',
	  'pause-before',
	  'perspective',
	  'perspective-origin',
	  'pointer-events',
	  'position',
	  'quotes',
	  'resize',
	  'rest',
	  'rest-after',
	  'rest-before',
	  'right',
	  'row-gap',
	  'scroll-margin',
	  'scroll-margin-block',
	  'scroll-margin-block-end',
	  'scroll-margin-block-start',
	  'scroll-margin-bottom',
	  'scroll-margin-inline',
	  'scroll-margin-inline-end',
	  'scroll-margin-inline-start',
	  'scroll-margin-left',
	  'scroll-margin-right',
	  'scroll-margin-top',
	  'scroll-padding',
	  'scroll-padding-block',
	  'scroll-padding-block-end',
	  'scroll-padding-block-start',
	  'scroll-padding-bottom',
	  'scroll-padding-inline',
	  'scroll-padding-inline-end',
	  'scroll-padding-inline-start',
	  'scroll-padding-left',
	  'scroll-padding-right',
	  'scroll-padding-top',
	  'scroll-snap-align',
	  'scroll-snap-stop',
	  'scroll-snap-type',
	  'scrollbar-color',
	  'scrollbar-gutter',
	  'scrollbar-width',
	  'shape-image-threshold',
	  'shape-margin',
	  'shape-outside',
	  'speak',
	  'speak-as',
	  'src', // @font-face
	  'tab-size',
	  'table-layout',
	  'text-align',
	  'text-align-all',
	  'text-align-last',
	  'text-combine-upright',
	  'text-decoration',
	  'text-decoration-color',
	  'text-decoration-line',
	  'text-decoration-style',
	  'text-emphasis',
	  'text-emphasis-color',
	  'text-emphasis-position',
	  'text-emphasis-style',
	  'text-indent',
	  'text-justify',
	  'text-orientation',
	  'text-overflow',
	  'text-rendering',
	  'text-shadow',
	  'text-transform',
	  'text-underline-position',
	  'top',
	  'transform',
	  'transform-box',
	  'transform-origin',
	  'transform-style',
	  'transition',
	  'transition-delay',
	  'transition-duration',
	  'transition-property',
	  'transition-timing-function',
	  'unicode-bidi',
	  'vertical-align',
	  'visibility',
	  'voice-balance',
	  'voice-duration',
	  'voice-family',
	  'voice-pitch',
	  'voice-range',
	  'voice-rate',
	  'voice-stress',
	  'voice-volume',
	  'white-space',
	  'widows',
	  'width',
	  'will-change',
	  'word-break',
	  'word-spacing',
	  'word-wrap',
	  'writing-mode',
	  'z-index'
	  // reverse makes sure longer attributes `font-weight` are matched fully
	  // instead of getting false positives on say `font`
	].reverse();

	/*
	Language: CSS
	Category: common, css, web
	Website: https://developer.mozilla.org/en-US/docs/Web/CSS
	*/


	/** @type LanguageFn */
	function css(hljs) {
	  const regex = hljs.regex;
	  const modes = MODES(hljs);
	  const VENDOR_PREFIX = { begin: /-(webkit|moz|ms|o)-(?=[a-z])/ };
	  const AT_MODIFIERS = "and or not only";
	  const AT_PROPERTY_RE = /@-?\w[\w]*(-\w+)*/; // @-webkit-keyframes
	  const IDENT_RE = '[a-zA-Z-][a-zA-Z0-9_-]*';
	  const STRINGS = [
	    hljs.APOS_STRING_MODE,
	    hljs.QUOTE_STRING_MODE
	  ];

	  return {
	    name: 'CSS',
	    case_insensitive: true,
	    illegal: /[=|'\$]/,
	    keywords: { keyframePosition: "from to" },
	    classNameAliases: {
	      // for visual continuity with `tag {}` and because we
	      // don't have a great class for this?
	      keyframePosition: "selector-tag" },
	    contains: [
	      modes.BLOCK_COMMENT,
	      VENDOR_PREFIX,
	      // to recognize keyframe 40% etc which are outside the scope of our
	      // attribute value mode
	      modes.CSS_NUMBER_MODE,
	      {
	        className: 'selector-id',
	        begin: /#[A-Za-z0-9_-]+/,
	        relevance: 0
	      },
	      {
	        className: 'selector-class',
	        begin: '\\.' + IDENT_RE,
	        relevance: 0
	      },
	      modes.ATTRIBUTE_SELECTOR_MODE,
	      {
	        className: 'selector-pseudo',
	        variants: [
	          { begin: ':(' + PSEUDO_CLASSES.join('|') + ')' },
	          { begin: ':(:)?(' + PSEUDO_ELEMENTS.join('|') + ')' }
	        ]
	      },
	      // we may actually need this (12/2020)
	      // { // pseudo-selector params
	      //   begin: /\(/,
	      //   end: /\)/,
	      //   contains: [ hljs.CSS_NUMBER_MODE ]
	      // },
	      modes.CSS_VARIABLE,
	      {
	        className: 'attribute',
	        begin: '\\b(' + ATTRIBUTES.join('|') + ')\\b'
	      },
	      // attribute values
	      {
	        begin: /:/,
	        end: /[;}{]/,
	        contains: [
	          modes.BLOCK_COMMENT,
	          modes.HEXCOLOR,
	          modes.IMPORTANT,
	          modes.CSS_NUMBER_MODE,
	          ...STRINGS,
	          // needed to highlight these as strings and to avoid issues with
	          // illegal characters that might be inside urls that would tigger the
	          // languages illegal stack
	          {
	            begin: /(url|data-uri)\(/,
	            end: /\)/,
	            relevance: 0, // from keywords
	            keywords: { built_in: "url data-uri" },
	            contains: [
	              ...STRINGS,
	              {
	                className: "string",
	                // any character other than `)` as in `url()` will be the start
	                // of a string, which ends with `)` (from the parent mode)
	                begin: /[^)]/,
	                endsWithParent: true,
	                excludeEnd: true
	              }
	            ]
	          },
	          modes.FUNCTION_DISPATCH
	        ]
	      },
	      {
	        begin: regex.lookahead(/@/),
	        end: '[{;]',
	        relevance: 0,
	        illegal: /:/, // break on Less variables @var: ...
	        contains: [
	          {
	            className: 'keyword',
	            begin: AT_PROPERTY_RE
	          },
	          {
	            begin: /\s/,
	            endsWithParent: true,
	            excludeEnd: true,
	            relevance: 0,
	            keywords: {
	              $pattern: /[a-z-]+/,
	              keyword: AT_MODIFIERS,
	              attribute: MEDIA_FEATURES.join(" ")
	            },
	            contains: [
	              {
	                begin: /[a-z-]+(?=:)/,
	                className: "attribute"
	              },
	              ...STRINGS,
	              modes.CSS_NUMBER_MODE
	            ]
	          }
	        ]
	      },
	      {
	        className: 'selector-tag',
	        begin: '\\b(' + TAGS.join('|') + ')\\b'
	      }
	    ]
	  };
	}

	css_1 = css;
	return css_1;
}

/*
Language: Markdown
Requires: xml.js
Author: John Crepezzi <john.crepezzi@gmail.com>
Website: https://daringfireball.net/projects/markdown/
Category: common, markup
*/

var markdown_1;
var hasRequiredMarkdown;

function requireMarkdown () {
	if (hasRequiredMarkdown) return markdown_1;
	hasRequiredMarkdown = 1;
	function markdown(hljs) {
	  const regex = hljs.regex;
	  const INLINE_HTML = {
	    begin: /<\/?[A-Za-z_]/,
	    end: '>',
	    subLanguage: 'xml',
	    relevance: 0
	  };
	  const HORIZONTAL_RULE = {
	    begin: '^[-\\*]{3,}',
	    end: '$'
	  };
	  const CODE = {
	    className: 'code',
	    variants: [
	      // TODO: fix to allow these to work with sublanguage also
	      { begin: '(`{3,})[^`](.|\\n)*?\\1`*[ ]*' },
	      { begin: '(~{3,})[^~](.|\\n)*?\\1~*[ ]*' },
	      // needed to allow markdown as a sublanguage to work
	      {
	        begin: '```',
	        end: '```+[ ]*$'
	      },
	      {
	        begin: '~~~',
	        end: '~~~+[ ]*$'
	      },
	      { begin: '`.+?`' },
	      {
	        begin: '(?=^( {4}|\\t))',
	        // use contains to gobble up multiple lines to allow the block to be whatever size
	        // but only have a single open/close tag vs one per line
	        contains: [
	          {
	            begin: '^( {4}|\\t)',
	            end: '(\\n)$'
	          }
	        ],
	        relevance: 0
	      }
	    ]
	  };
	  const LIST = {
	    className: 'bullet',
	    begin: '^[ \t]*([*+-]|(\\d+\\.))(?=\\s+)',
	    end: '\\s+',
	    excludeEnd: true
	  };
	  const LINK_REFERENCE = {
	    begin: /^\[[^\n]+\]:/,
	    returnBegin: true,
	    contains: [
	      {
	        className: 'symbol',
	        begin: /\[/,
	        end: /\]/,
	        excludeBegin: true,
	        excludeEnd: true
	      },
	      {
	        className: 'link',
	        begin: /:\s*/,
	        end: /$/,
	        excludeBegin: true
	      }
	    ]
	  };
	  const URL_SCHEME = /[A-Za-z][A-Za-z0-9+.-]*/;
	  const LINK = {
	    variants: [
	      // too much like nested array access in so many languages
	      // to have any real relevance
	      {
	        begin: /\[.+?\]\[.*?\]/,
	        relevance: 0
	      },
	      // popular internet URLs
	      {
	        begin: /\[.+?\]\(((data|javascript|mailto):|(?:http|ftp)s?:\/\/).*?\)/,
	        relevance: 2
	      },
	      {
	        begin: regex.concat(/\[.+?\]\(/, URL_SCHEME, /:\/\/.*?\)/),
	        relevance: 2
	      },
	      // relative urls
	      {
	        begin: /\[.+?\]\([./?&#].*?\)/,
	        relevance: 1
	      },
	      // whatever else, lower relevance (might not be a link at all)
	      {
	        begin: /\[.*?\]\(.*?\)/,
	        relevance: 0
	      }
	    ],
	    returnBegin: true,
	    contains: [
	      {
	        // empty strings for alt or link text
	        match: /\[(?=\])/ },
	      {
	        className: 'string',
	        relevance: 0,
	        begin: '\\[',
	        end: '\\]',
	        excludeBegin: true,
	        returnEnd: true
	      },
	      {
	        className: 'link',
	        relevance: 0,
	        begin: '\\]\\(',
	        end: '\\)',
	        excludeBegin: true,
	        excludeEnd: true
	      },
	      {
	        className: 'symbol',
	        relevance: 0,
	        begin: '\\]\\[',
	        end: '\\]',
	        excludeBegin: true,
	        excludeEnd: true
	      }
	    ]
	  };
	  const BOLD = {
	    className: 'strong',
	    contains: [], // defined later
	    variants: [
	      {
	        begin: /_{2}(?!\s)/,
	        end: /_{2}/
	      },
	      {
	        begin: /\*{2}(?!\s)/,
	        end: /\*{2}/
	      }
	    ]
	  };
	  const ITALIC = {
	    className: 'emphasis',
	    contains: [], // defined later
	    variants: [
	      {
	        begin: /\*(?![*\s])/,
	        end: /\*/
	      },
	      {
	        begin: /_(?![_\s])/,
	        end: /_/,
	        relevance: 0
	      }
	    ]
	  };

	  // 3 level deep nesting is not allowed because it would create confusion
	  // in cases like `***testing***` because where we don't know if the last
	  // `***` is starting a new bold/italic or finishing the last one
	  const BOLD_WITHOUT_ITALIC = hljs.inherit(BOLD, { contains: [] });
	  const ITALIC_WITHOUT_BOLD = hljs.inherit(ITALIC, { contains: [] });
	  BOLD.contains.push(ITALIC_WITHOUT_BOLD);
	  ITALIC.contains.push(BOLD_WITHOUT_ITALIC);

	  let CONTAINABLE = [
	    INLINE_HTML,
	    LINK
	  ];

	  [
	    BOLD,
	    ITALIC,
	    BOLD_WITHOUT_ITALIC,
	    ITALIC_WITHOUT_BOLD
	  ].forEach(m => {
	    m.contains = m.contains.concat(CONTAINABLE);
	  });

	  CONTAINABLE = CONTAINABLE.concat(BOLD, ITALIC);

	  const HEADER = {
	    className: 'section',
	    variants: [
	      {
	        begin: '^#{1,6}',
	        end: '$',
	        contains: CONTAINABLE
	      },
	      {
	        begin: '(?=^.+?\\n[=-]{2,}$)',
	        contains: [
	          { begin: '^[=-]*$' },
	          {
	            begin: '^',
	            end: "\\n",
	            contains: CONTAINABLE
	          }
	        ]
	      }
	    ]
	  };

	  const BLOCKQUOTE = {
	    className: 'quote',
	    begin: '^>\\s+',
	    contains: CONTAINABLE,
	    end: '$'
	  };

	  return {
	    name: 'Markdown',
	    aliases: [
	      'md',
	      'mkdown',
	      'mkd'
	    ],
	    contains: [
	      HEADER,
	      INLINE_HTML,
	      LIST,
	      BOLD,
	      ITALIC,
	      BLOCKQUOTE,
	      CODE,
	      HORIZONTAL_RULE,
	      LINK,
	      LINK_REFERENCE
	    ]
	  };
	}

	markdown_1 = markdown;
	return markdown_1;
}

/*
Language: Diff
Description: Unified and context diff
Author: Vasily Polovnyov <vast@whiteants.net>
Website: https://www.gnu.org/software/diffutils/
Category: common
*/

var diff_1;
var hasRequiredDiff;

function requireDiff () {
	if (hasRequiredDiff) return diff_1;
	hasRequiredDiff = 1;
	/** @type LanguageFn */
	function diff(hljs) {
	  const regex = hljs.regex;
	  return {
	    name: 'Diff',
	    aliases: [ 'patch' ],
	    contains: [
	      {
	        className: 'meta',
	        relevance: 10,
	        match: regex.either(
	          /^@@ +-\d+,\d+ +\+\d+,\d+ +@@/,
	          /^\*\*\* +\d+,\d+ +\*\*\*\*$/,
	          /^--- +\d+,\d+ +----$/
	        )
	      },
	      {
	        className: 'comment',
	        variants: [
	          {
	            begin: regex.either(
	              /Index: /,
	              /^index/,
	              /={3,}/,
	              /^-{3}/,
	              /^\*{3} /,
	              /^\+{3}/,
	              /^diff --git/
	            ),
	            end: /$/
	          },
	          { match: /^\*{15}$/ }
	        ]
	      },
	      {
	        className: 'addition',
	        begin: /^\+/,
	        end: /$/
	      },
	      {
	        className: 'deletion',
	        begin: /^-/,
	        end: /$/
	      },
	      {
	        className: 'addition',
	        begin: /^!/,
	        end: /$/
	      }
	    ]
	  };
	}

	diff_1 = diff;
	return diff_1;
}

/*
Language: Ruby
Description: Ruby is a dynamic, open source programming language with a focus on simplicity and productivity.
Website: https://www.ruby-lang.org/
Author: Anton Kovalyov <anton@kovalyov.net>
Contributors: Peter Leonov <gojpeg@yandex.ru>, Vasily Polovnyov <vast@whiteants.net>, Loren Segal <lsegal@soen.ca>, Pascal Hurni <phi@ruby-reactive.org>, Cedric Sohrauer <sohrauer@googlemail.com>
Category: common
*/

var ruby_1;
var hasRequiredRuby;

function requireRuby () {
	if (hasRequiredRuby) return ruby_1;
	hasRequiredRuby = 1;
	function ruby(hljs) {
	  const regex = hljs.regex;
	  const RUBY_METHOD_RE = '([a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?)';
	  // TODO: move concepts like CAMEL_CASE into `modes.js`
	  const CLASS_NAME_RE = regex.either(
	    /\b([A-Z]+[a-z0-9]+)+/,
	    // ends in caps
	    /\b([A-Z]+[a-z0-9]+)+[A-Z]+/,
	  )
	  ;
	  const CLASS_NAME_WITH_NAMESPACE_RE = regex.concat(CLASS_NAME_RE, /(::\w+)*/);
	  // very popular ruby built-ins that one might even assume
	  // are actual keywords (despite that not being the case)
	  const PSEUDO_KWS = [
	    "include",
	    "extend",
	    "prepend",
	    "public",
	    "private",
	    "protected",
	    "raise",
	    "throw"
	  ];
	  const RUBY_KEYWORDS = {
	    "variable.constant": [
	      "__FILE__",
	      "__LINE__",
	      "__ENCODING__"
	    ],
	    "variable.language": [
	      "self",
	      "super",
	    ],
	    keyword: [
	      "alias",
	      "and",
	      "begin",
	      "BEGIN",
	      "break",
	      "case",
	      "class",
	      "defined",
	      "do",
	      "else",
	      "elsif",
	      "end",
	      "END",
	      "ensure",
	      "for",
	      "if",
	      "in",
	      "module",
	      "next",
	      "not",
	      "or",
	      "redo",
	      "require",
	      "rescue",
	      "retry",
	      "return",
	      "then",
	      "undef",
	      "unless",
	      "until",
	      "when",
	      "while",
	      "yield",
	      ...PSEUDO_KWS
	    ],
	    built_in: [
	      "proc",
	      "lambda",
	      "attr_accessor",
	      "attr_reader",
	      "attr_writer",
	      "define_method",
	      "private_constant",
	      "module_function"
	    ],
	    literal: [
	      "true",
	      "false",
	      "nil"
	    ]
	  };
	  const YARDOCTAG = {
	    className: 'doctag',
	    begin: '@[A-Za-z]+'
	  };
	  const IRB_OBJECT = {
	    begin: '#<',
	    end: '>'
	  };
	  const COMMENT_MODES = [
	    hljs.COMMENT(
	      '#',
	      '$',
	      { contains: [ YARDOCTAG ] }
	    ),
	    hljs.COMMENT(
	      '^=begin',
	      '^=end',
	      {
	        contains: [ YARDOCTAG ],
	        relevance: 10
	      }
	    ),
	    hljs.COMMENT('^__END__', hljs.MATCH_NOTHING_RE)
	  ];
	  const SUBST = {
	    className: 'subst',
	    begin: /#\{/,
	    end: /\}/,
	    keywords: RUBY_KEYWORDS
	  };
	  const STRING = {
	    className: 'string',
	    contains: [
	      hljs.BACKSLASH_ESCAPE,
	      SUBST
	    ],
	    variants: [
	      {
	        begin: /'/,
	        end: /'/
	      },
	      {
	        begin: /"/,
	        end: /"/
	      },
	      {
	        begin: /`/,
	        end: /`/
	      },
	      {
	        begin: /%[qQwWx]?\(/,
	        end: /\)/
	      },
	      {
	        begin: /%[qQwWx]?\[/,
	        end: /\]/
	      },
	      {
	        begin: /%[qQwWx]?\{/,
	        end: /\}/
	      },
	      {
	        begin: /%[qQwWx]?</,
	        end: />/
	      },
	      {
	        begin: /%[qQwWx]?\//,
	        end: /\//
	      },
	      {
	        begin: /%[qQwWx]?%/,
	        end: /%/
	      },
	      {
	        begin: /%[qQwWx]?-/,
	        end: /-/
	      },
	      {
	        begin: /%[qQwWx]?\|/,
	        end: /\|/
	      },
	      // in the following expressions, \B in the beginning suppresses recognition of ?-sequences
	      // where ? is the last character of a preceding identifier, as in: `func?4`
	      { begin: /\B\?(\\\d{1,3})/ },
	      { begin: /\B\?(\\x[A-Fa-f0-9]{1,2})/ },
	      { begin: /\B\?(\\u\{?[A-Fa-f0-9]{1,6}\}?)/ },
	      { begin: /\B\?(\\M-\\C-|\\M-\\c|\\c\\M-|\\M-|\\C-\\M-)[\x20-\x7e]/ },
	      { begin: /\B\?\\(c|C-)[\x20-\x7e]/ },
	      { begin: /\B\?\\?\S/ },
	      // heredocs
	      {
	        // this guard makes sure that we have an entire heredoc and not a false
	        // positive (auto-detect, etc.)
	        begin: regex.concat(
	          /<<[-~]?'?/,
	          regex.lookahead(/(\w+)(?=\W)[^\n]*\n(?:[^\n]*\n)*?\s*\1\b/)
	        ),
	        contains: [
	          hljs.END_SAME_AS_BEGIN({
	            begin: /(\w+)/,
	            end: /(\w+)/,
	            contains: [
	              hljs.BACKSLASH_ESCAPE,
	              SUBST
	            ]
	          })
	        ]
	      }
	    ]
	  };

	  // Ruby syntax is underdocumented, but this grammar seems to be accurate
	  // as of version 2.7.2 (confirmed with (irb and `Ripper.sexp(...)`)
	  // https://docs.ruby-lang.org/en/2.7.0/doc/syntax/literals_rdoc.html#label-Numbers
	  const decimal = '[1-9](_?[0-9])*|0';
	  const digits = '[0-9](_?[0-9])*';
	  const NUMBER = {
	    className: 'number',
	    relevance: 0,
	    variants: [
	      // decimal integer/float, optionally exponential or rational, optionally imaginary
	      { begin: `\\b(${decimal})(\\.(${digits}))?([eE][+-]?(${digits})|r)?i?\\b` },

	      // explicit decimal/binary/octal/hexadecimal integer,
	      // optionally rational and/or imaginary
	      { begin: "\\b0[dD][0-9](_?[0-9])*r?i?\\b" },
	      { begin: "\\b0[bB][0-1](_?[0-1])*r?i?\\b" },
	      { begin: "\\b0[oO][0-7](_?[0-7])*r?i?\\b" },
	      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*r?i?\\b" },

	      // 0-prefixed implicit octal integer, optionally rational and/or imaginary
	      { begin: "\\b0(_?[0-7])+r?i?\\b" }
	    ]
	  };

	  const PARAMS = {
	    variants: [
	      {
	        match: /\(\)/,
	      },
	      {
	        className: 'params',
	        begin: /\(/,
	        end: /(?=\))/,
	        excludeBegin: true,
	        endsParent: true,
	        keywords: RUBY_KEYWORDS,
	      }
	    ]
	  };

	  const INCLUDE_EXTEND = {
	    match: [
	      /(include|extend)\s+/,
	      CLASS_NAME_WITH_NAMESPACE_RE
	    ],
	    scope: {
	      2: "title.class"
	    },
	    keywords: RUBY_KEYWORDS
	  };

	  const CLASS_DEFINITION = {
	    variants: [
	      {
	        match: [
	          /class\s+/,
	          CLASS_NAME_WITH_NAMESPACE_RE,
	          /\s+<\s+/,
	          CLASS_NAME_WITH_NAMESPACE_RE
	        ]
	      },
	      {
	        match: [
	          /\b(class|module)\s+/,
	          CLASS_NAME_WITH_NAMESPACE_RE
	        ]
	      }
	    ],
	    scope: {
	      2: "title.class",
	      4: "title.class.inherited"
	    },
	    keywords: RUBY_KEYWORDS
	  };

	  const UPPER_CASE_CONSTANT = {
	    relevance: 0,
	    match: /\b[A-Z][A-Z_0-9]+\b/,
	    className: "variable.constant"
	  };

	  const METHOD_DEFINITION = {
	    match: [
	      /def/, /\s+/,
	      RUBY_METHOD_RE
	    ],
	    scope: {
	      1: "keyword",
	      3: "title.function"
	    },
	    contains: [
	      PARAMS
	    ]
	  };

	  const OBJECT_CREATION = {
	    relevance: 0,
	    match: [
	      CLASS_NAME_WITH_NAMESPACE_RE,
	      /\.new[. (]/
	    ],
	    scope: {
	      1: "title.class"
	    }
	  };

	  // CamelCase
	  const CLASS_REFERENCE = {
	    relevance: 0,
	    match: CLASS_NAME_RE,
	    scope: "title.class"
	  };

	  const RUBY_DEFAULT_CONTAINS = [
	    STRING,
	    CLASS_DEFINITION,
	    INCLUDE_EXTEND,
	    OBJECT_CREATION,
	    UPPER_CASE_CONSTANT,
	    CLASS_REFERENCE,
	    METHOD_DEFINITION,
	    {
	      // swallow namespace qualifiers before symbols
	      begin: hljs.IDENT_RE + '::' },
	    {
	      className: 'symbol',
	      begin: hljs.UNDERSCORE_IDENT_RE + '(!|\\?)?:',
	      relevance: 0
	    },
	    {
	      className: 'symbol',
	      begin: ':(?!\\s)',
	      contains: [
	        STRING,
	        { begin: RUBY_METHOD_RE }
	      ],
	      relevance: 0
	    },
	    NUMBER,
	    {
	      // negative-look forward attempts to prevent false matches like:
	      // @ident@ or $ident$ that might indicate this is not ruby at all
	      className: "variable",
	      begin: '(\\$\\W)|((\\$|@@?)(\\w+))(?=[^@$?])' + `(?![A-Za-z])(?![@$?'])`
	    },
	    {
	      className: 'params',
	      begin: /\|/,
	      end: /\|/,
	      excludeBegin: true,
	      excludeEnd: true,
	      relevance: 0, // this could be a lot of things (in other languages) other than params
	      keywords: RUBY_KEYWORDS
	    },
	    { // regexp container
	      begin: '(' + hljs.RE_STARTERS_RE + '|unless)\\s*',
	      keywords: 'unless',
	      contains: [
	        {
	          className: 'regexp',
	          contains: [
	            hljs.BACKSLASH_ESCAPE,
	            SUBST
	          ],
	          illegal: /\n/,
	          variants: [
	            {
	              begin: '/',
	              end: '/[a-z]*'
	            },
	            {
	              begin: /%r\{/,
	              end: /\}[a-z]*/
	            },
	            {
	              begin: '%r\\(',
	              end: '\\)[a-z]*'
	            },
	            {
	              begin: '%r!',
	              end: '![a-z]*'
	            },
	            {
	              begin: '%r\\[',
	              end: '\\][a-z]*'
	            }
	          ]
	        }
	      ].concat(IRB_OBJECT, COMMENT_MODES),
	      relevance: 0
	    }
	  ].concat(IRB_OBJECT, COMMENT_MODES);

	  SUBST.contains = RUBY_DEFAULT_CONTAINS;
	  PARAMS.contains = RUBY_DEFAULT_CONTAINS;

	  // >>
	  // ?>
	  const SIMPLE_PROMPT = "[>?]>";
	  // irb(main):001:0>
	  const DEFAULT_PROMPT = "[\\w#]+\\(\\w+\\):\\d+:\\d+[>*]";
	  const RVM_PROMPT = "(\\w+-)?\\d+\\.\\d+\\.\\d+(p\\d+)?[^\\d][^>]+>";

	  const IRB_DEFAULT = [
	    {
	      begin: /^\s*=>/,
	      starts: {
	        end: '$',
	        contains: RUBY_DEFAULT_CONTAINS
	      }
	    },
	    {
	      className: 'meta.prompt',
	      begin: '^(' + SIMPLE_PROMPT + "|" + DEFAULT_PROMPT + '|' + RVM_PROMPT + ')(?=[ ])',
	      starts: {
	        end: '$',
	        keywords: RUBY_KEYWORDS,
	        contains: RUBY_DEFAULT_CONTAINS
	      }
	    }
	  ];

	  COMMENT_MODES.unshift(IRB_OBJECT);

	  return {
	    name: 'Ruby',
	    aliases: [
	      'rb',
	      'gemspec',
	      'podspec',
	      'thor',
	      'irb'
	    ],
	    keywords: RUBY_KEYWORDS,
	    illegal: /\/\*/,
	    contains: [ hljs.SHEBANG({ binary: "ruby" }) ]
	      .concat(IRB_DEFAULT)
	      .concat(COMMENT_MODES)
	      .concat(RUBY_DEFAULT_CONTAINS)
	  };
	}

	ruby_1 = ruby;
	return ruby_1;
}

/*
Language: Go
Author: Stephan Kountso aka StepLg <steplg@gmail.com>
Contributors: Evgeny Stepanischev <imbolk@gmail.com>
Description: Google go language (golang). For info about language
Website: http://golang.org/
Category: common, system
*/

var go_1;
var hasRequiredGo;

function requireGo () {
	if (hasRequiredGo) return go_1;
	hasRequiredGo = 1;
	function go(hljs) {
	  const LITERALS = [
	    "true",
	    "false",
	    "iota",
	    "nil"
	  ];
	  const BUILT_INS = [
	    "append",
	    "cap",
	    "close",
	    "complex",
	    "copy",
	    "imag",
	    "len",
	    "make",
	    "new",
	    "panic",
	    "print",
	    "println",
	    "real",
	    "recover",
	    "delete"
	  ];
	  const TYPES = [
	    "bool",
	    "byte",
	    "complex64",
	    "complex128",
	    "error",
	    "float32",
	    "float64",
	    "int8",
	    "int16",
	    "int32",
	    "int64",
	    "string",
	    "uint8",
	    "uint16",
	    "uint32",
	    "uint64",
	    "int",
	    "uint",
	    "uintptr",
	    "rune"
	  ];
	  const KWS = [
	    "break",
	    "case",
	    "chan",
	    "const",
	    "continue",
	    "default",
	    "defer",
	    "else",
	    "fallthrough",
	    "for",
	    "func",
	    "go",
	    "goto",
	    "if",
	    "import",
	    "interface",
	    "map",
	    "package",
	    "range",
	    "return",
	    "select",
	    "struct",
	    "switch",
	    "type",
	    "var",
	  ];
	  const KEYWORDS = {
	    keyword: KWS,
	    type: TYPES,
	    literal: LITERALS,
	    built_in: BUILT_INS
	  };
	  return {
	    name: 'Go',
	    aliases: [ 'golang' ],
	    keywords: KEYWORDS,
	    illegal: '</',
	    contains: [
	      hljs.C_LINE_COMMENT_MODE,
	      hljs.C_BLOCK_COMMENT_MODE,
	      {
	        className: 'string',
	        variants: [
	          hljs.QUOTE_STRING_MODE,
	          hljs.APOS_STRING_MODE,
	          {
	            begin: '`',
	            end: '`'
	          }
	        ]
	      },
	      {
	        className: 'number',
	        variants: [
	          {
	            begin: hljs.C_NUMBER_RE + '[i]',
	            relevance: 1
	          },
	          hljs.C_NUMBER_MODE
	        ]
	      },
	      { begin: /:=/ // relevance booster
	      },
	      {
	        className: 'function',
	        beginKeywords: 'func',
	        end: '\\s*(\\{|$)',
	        excludeEnd: true,
	        contains: [
	          hljs.TITLE_MODE,
	          {
	            className: 'params',
	            begin: /\(/,
	            end: /\)/,
	            endsParent: true,
	            keywords: KEYWORDS,
	            illegal: /["']/
	          }
	        ]
	      }
	    ]
	  };
	}

	go_1 = go;
	return go_1;
}

/*
 Language: GraphQL
 Author: John Foster (GH jf990), and others
 Description: GraphQL is a query language for APIs
 Category: web, common
*/

var graphql_1;
var hasRequiredGraphql;

function requireGraphql () {
	if (hasRequiredGraphql) return graphql_1;
	hasRequiredGraphql = 1;
	/** @type LanguageFn */
	function graphql(hljs) {
	  const regex = hljs.regex;
	  const GQL_NAME = /[_A-Za-z][_0-9A-Za-z]*/;
	  return {
	    name: "GraphQL",
	    aliases: [ "gql" ],
	    case_insensitive: true,
	    disableAutodetect: false,
	    keywords: {
	      keyword: [
	        "query",
	        "mutation",
	        "subscription",
	        "type",
	        "input",
	        "schema",
	        "directive",
	        "interface",
	        "union",
	        "scalar",
	        "fragment",
	        "enum",
	        "on"
	      ],
	      literal: [
	        "true",
	        "false",
	        "null"
	      ]
	    },
	    contains: [
	      hljs.HASH_COMMENT_MODE,
	      hljs.QUOTE_STRING_MODE,
	      hljs.NUMBER_MODE,
	      {
	        scope: "punctuation",
	        match: /[.]{3}/,
	        relevance: 0
	      },
	      {
	        scope: "punctuation",
	        begin: /[\!\(\)\:\=\[\]\{\|\}]{1}/,
	        relevance: 0
	      },
	      {
	        scope: "variable",
	        begin: /\$/,
	        end: /\W/,
	        excludeEnd: true,
	        relevance: 0
	      },
	      {
	        scope: "meta",
	        match: /@\w+/,
	        excludeEnd: true
	      },
	      {
	        scope: "symbol",
	        begin: regex.concat(GQL_NAME, regex.lookahead(/\s*:/)),
	        relevance: 0
	      }
	    ],
	    illegal: [
	      /[;<']/,
	      /BEGIN/
	    ]
	  };
	}

	graphql_1 = graphql;
	return graphql_1;
}

/*
Language: TOML, also INI
Description: TOML aims to be a minimal configuration file format that's easy to read due to obvious semantics.
Contributors: Guillaume Gomez <guillaume1.gomez@gmail.com>
Category: common, config
Website: https://github.com/toml-lang/toml
*/

var ini_1;
var hasRequiredIni;

function requireIni () {
	if (hasRequiredIni) return ini_1;
	hasRequiredIni = 1;
	function ini(hljs) {
	  const regex = hljs.regex;
	  const NUMBERS = {
	    className: 'number',
	    relevance: 0,
	    variants: [
	      { begin: /([+-]+)?[\d]+_[\d_]+/ },
	      { begin: hljs.NUMBER_RE }
	    ]
	  };
	  const COMMENTS = hljs.COMMENT();
	  COMMENTS.variants = [
	    {
	      begin: /;/,
	      end: /$/
	    },
	    {
	      begin: /#/,
	      end: /$/
	    }
	  ];
	  const VARIABLES = {
	    className: 'variable',
	    variants: [
	      { begin: /\$[\w\d"][\w\d_]*/ },
	      { begin: /\$\{(.*?)\}/ }
	    ]
	  };
	  const LITERALS = {
	    className: 'literal',
	    begin: /\bon|off|true|false|yes|no\b/
	  };
	  const STRINGS = {
	    className: "string",
	    contains: [ hljs.BACKSLASH_ESCAPE ],
	    variants: [
	      {
	        begin: "'''",
	        end: "'''",
	        relevance: 10
	      },
	      {
	        begin: '"""',
	        end: '"""',
	        relevance: 10
	      },
	      {
	        begin: '"',
	        end: '"'
	      },
	      {
	        begin: "'",
	        end: "'"
	      }
	    ]
	  };
	  const ARRAY = {
	    begin: /\[/,
	    end: /\]/,
	    contains: [
	      COMMENTS,
	      LITERALS,
	      VARIABLES,
	      STRINGS,
	      NUMBERS,
	      'self'
	    ],
	    relevance: 0
	  };

	  const BARE_KEY = /[A-Za-z0-9_-]+/;
	  const QUOTED_KEY_DOUBLE_QUOTE = /"(\\"|[^"])*"/;
	  const QUOTED_KEY_SINGLE_QUOTE = /'[^']*'/;
	  const ANY_KEY = regex.either(
	    BARE_KEY, QUOTED_KEY_DOUBLE_QUOTE, QUOTED_KEY_SINGLE_QUOTE
	  );
	  const DOTTED_KEY = regex.concat(
	    ANY_KEY, '(\\s*\\.\\s*', ANY_KEY, ')*',
	    regex.lookahead(/\s*=\s*[^#\s]/)
	  );

	  return {
	    name: 'TOML, also INI',
	    aliases: [ 'toml' ],
	    case_insensitive: true,
	    illegal: /\S/,
	    contains: [
	      COMMENTS,
	      {
	        className: 'section',
	        begin: /\[+/,
	        end: /\]+/
	      },
	      {
	        begin: DOTTED_KEY,
	        className: 'attr',
	        starts: {
	          end: /$/,
	          contains: [
	            COMMENTS,
	            ARRAY,
	            LITERALS,
	            VARIABLES,
	            STRINGS,
	            NUMBERS
	          ]
	        }
	      }
	    ]
	  };
	}

	ini_1 = ini;
	return ini_1;
}

var java_1;
var hasRequiredJava;

function requireJava () {
	if (hasRequiredJava) return java_1;
	hasRequiredJava = 1;
	// https://docs.oracle.com/javase/specs/jls/se15/html/jls-3.html#jls-3.10
	var decimalDigits = '[0-9](_*[0-9])*';
	var frac = `\\.(${decimalDigits})`;
	var hexDigits = '[0-9a-fA-F](_*[0-9a-fA-F])*';
	var NUMERIC = {
	  className: 'number',
	  variants: [
	    // DecimalFloatingPointLiteral
	    // including ExponentPart
	    { begin: `(\\b(${decimalDigits})((${frac})|\\.)?|(${frac}))` +
	      `[eE][+-]?(${decimalDigits})[fFdD]?\\b` },
	    // excluding ExponentPart
	    { begin: `\\b(${decimalDigits})((${frac})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
	    { begin: `(${frac})[fFdD]?\\b` },
	    { begin: `\\b(${decimalDigits})[fFdD]\\b` },

	    // HexadecimalFloatingPointLiteral
	    { begin: `\\b0[xX]((${hexDigits})\\.?|(${hexDigits})?\\.(${hexDigits}))` +
	      `[pP][+-]?(${decimalDigits})[fFdD]?\\b` },

	    // DecimalIntegerLiteral
	    { begin: '\\b(0|[1-9](_*[0-9])*)[lL]?\\b' },

	    // HexIntegerLiteral
	    { begin: `\\b0[xX](${hexDigits})[lL]?\\b` },

	    // OctalIntegerLiteral
	    { begin: '\\b0(_*[0-7])*[lL]?\\b' },

	    // BinaryIntegerLiteral
	    { begin: '\\b0[bB][01](_*[01])*[lL]?\\b' },
	  ],
	  relevance: 0
	};

	/*
	Language: Java
	Author: Vsevolod Solovyov <vsevolod.solovyov@gmail.com>
	Category: common, enterprise
	Website: https://www.java.com/
	*/


	/**
	 * Allows recursive regex expressions to a given depth
	 *
	 * ie: recurRegex("(abc~~~)", /~~~/g, 2) becomes:
	 * (abc(abc(abc)))
	 *
	 * @param {string} re
	 * @param {RegExp} substitution (should be a g mode regex)
	 * @param {number} depth
	 * @returns {string}``
	 */
	function recurRegex(re, substitution, depth) {
	  if (depth === -1) return "";

	  return re.replace(substitution, _ => {
	    return recurRegex(re, substitution, depth - 1);
	  });
	}

	/** @type LanguageFn */
	function java(hljs) {
	  const regex = hljs.regex;
	  const JAVA_IDENT_RE = '[\u00C0-\u02B8a-zA-Z_$][\u00C0-\u02B8a-zA-Z_$0-9]*';
	  const GENERIC_IDENT_RE = JAVA_IDENT_RE
	    + recurRegex('(?:<' + JAVA_IDENT_RE + '~~~(?:\\s*,\\s*' + JAVA_IDENT_RE + '~~~)*>)?', /~~~/g, 2);
	  const MAIN_KEYWORDS = [
	    'synchronized',
	    'abstract',
	    'private',
	    'var',
	    'static',
	    'if',
	    'const ',
	    'for',
	    'while',
	    'strictfp',
	    'finally',
	    'protected',
	    'import',
	    'native',
	    'final',
	    'void',
	    'enum',
	    'else',
	    'break',
	    'transient',
	    'catch',
	    'instanceof',
	    'volatile',
	    'case',
	    'assert',
	    'package',
	    'default',
	    'public',
	    'try',
	    'switch',
	    'continue',
	    'throws',
	    'protected',
	    'public',
	    'private',
	    'module',
	    'requires',
	    'exports',
	    'do',
	    'sealed',
	    'yield',
	    'permits'
	  ];

	  const BUILT_INS = [
	    'super',
	    'this'
	  ];

	  const LITERALS = [
	    'false',
	    'true',
	    'null'
	  ];

	  const TYPES = [
	    'char',
	    'boolean',
	    'long',
	    'float',
	    'int',
	    'byte',
	    'short',
	    'double'
	  ];

	  const KEYWORDS = {
	    keyword: MAIN_KEYWORDS,
	    literal: LITERALS,
	    type: TYPES,
	    built_in: BUILT_INS
	  };

	  const ANNOTATION = {
	    className: 'meta',
	    begin: '@' + JAVA_IDENT_RE,
	    contains: [
	      {
	        begin: /\(/,
	        end: /\)/,
	        contains: [ "self" ] // allow nested () inside our annotation
	      }
	    ]
	  };
	  const PARAMS = {
	    className: 'params',
	    begin: /\(/,
	    end: /\)/,
	    keywords: KEYWORDS,
	    relevance: 0,
	    contains: [ hljs.C_BLOCK_COMMENT_MODE ],
	    endsParent: true
	  };

	  return {
	    name: 'Java',
	    aliases: [ 'jsp' ],
	    keywords: KEYWORDS,
	    illegal: /<\/|#/,
	    contains: [
	      hljs.COMMENT(
	        '/\\*\\*',
	        '\\*/',
	        {
	          relevance: 0,
	          contains: [
	            {
	              // eat up @'s in emails to prevent them to be recognized as doctags
	              begin: /\w+@/,
	              relevance: 0
	            },
	            {
	              className: 'doctag',
	              begin: '@[A-Za-z]+'
	            }
	          ]
	        }
	      ),
	      // relevance boost
	      {
	        begin: /import java\.[a-z]+\./,
	        keywords: "import",
	        relevance: 2
	      },
	      hljs.C_LINE_COMMENT_MODE,
	      hljs.C_BLOCK_COMMENT_MODE,
	      {
	        begin: /"""/,
	        end: /"""/,
	        className: "string",
	        contains: [ hljs.BACKSLASH_ESCAPE ]
	      },
	      hljs.APOS_STRING_MODE,
	      hljs.QUOTE_STRING_MODE,
	      {
	        match: [
	          /\b(?:class|interface|enum|extends|implements|new)/,
	          /\s+/,
	          JAVA_IDENT_RE
	        ],
	        className: {
	          1: "keyword",
	          3: "title.class"
	        }
	      },
	      {
	        // Exceptions for hyphenated keywords
	        match: /non-sealed/,
	        scope: "keyword"
	      },
	      {
	        begin: [
	          regex.concat(/(?!else)/, JAVA_IDENT_RE),
	          /\s+/,
	          JAVA_IDENT_RE,
	          /\s+/,
	          /=(?!=)/
	        ],
	        className: {
	          1: "type",
	          3: "variable",
	          5: "operator"
	        }
	      },
	      {
	        begin: [
	          /record/,
	          /\s+/,
	          JAVA_IDENT_RE
	        ],
	        className: {
	          1: "keyword",
	          3: "title.class"
	        },
	        contains: [
	          PARAMS,
	          hljs.C_LINE_COMMENT_MODE,
	          hljs.C_BLOCK_COMMENT_MODE
	        ]
	      },
	      {
	        // Expression keywords prevent 'keyword Name(...)' from being
	        // recognized as a function definition
	        beginKeywords: 'new throw return else',
	        relevance: 0
	      },
	      {
	        begin: [
	          '(?:' + GENERIC_IDENT_RE + '\\s+)',
	          hljs.UNDERSCORE_IDENT_RE,
	          /\s*(?=\()/
	        ],
	        className: { 2: "title.function" },
	        keywords: KEYWORDS,
	        contains: [
	          {
	            className: 'params',
	            begin: /\(/,
	            end: /\)/,
	            keywords: KEYWORDS,
	            relevance: 0,
	            contains: [
	              ANNOTATION,
	              hljs.APOS_STRING_MODE,
	              hljs.QUOTE_STRING_MODE,
	              NUMERIC,
	              hljs.C_BLOCK_COMMENT_MODE
	            ]
	          },
	          hljs.C_LINE_COMMENT_MODE,
	          hljs.C_BLOCK_COMMENT_MODE
	        ]
	      },
	      NUMERIC,
	      ANNOTATION
	    ]
	  };
	}

	java_1 = java;
	return java_1;
}

var javascript_1;
var hasRequiredJavascript;

function requireJavascript () {
	if (hasRequiredJavascript) return javascript_1;
	hasRequiredJavascript = 1;
	const IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';
	const KEYWORDS = [
	  "as", // for exports
	  "in",
	  "of",
	  "if",
	  "for",
	  "while",
	  "finally",
	  "var",
	  "new",
	  "function",
	  "do",
	  "return",
	  "void",
	  "else",
	  "break",
	  "catch",
	  "instanceof",
	  "with",
	  "throw",
	  "case",
	  "default",
	  "try",
	  "switch",
	  "continue",
	  "typeof",
	  "delete",
	  "let",
	  "yield",
	  "const",
	  "class",
	  // JS handles these with a special rule
	  // "get",
	  // "set",
	  "debugger",
	  "async",
	  "await",
	  "static",
	  "import",
	  "from",
	  "export",
	  "extends"
	];
	const LITERALS = [
	  "true",
	  "false",
	  "null",
	  "undefined",
	  "NaN",
	  "Infinity"
	];

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
	const TYPES = [
	  // Fundamental objects
	  "Object",
	  "Function",
	  "Boolean",
	  "Symbol",
	  // numbers and dates
	  "Math",
	  "Date",
	  "Number",
	  "BigInt",
	  // text
	  "String",
	  "RegExp",
	  // Indexed collections
	  "Array",
	  "Float32Array",
	  "Float64Array",
	  "Int8Array",
	  "Uint8Array",
	  "Uint8ClampedArray",
	  "Int16Array",
	  "Int32Array",
	  "Uint16Array",
	  "Uint32Array",
	  "BigInt64Array",
	  "BigUint64Array",
	  // Keyed collections
	  "Set",
	  "Map",
	  "WeakSet",
	  "WeakMap",
	  // Structured data
	  "ArrayBuffer",
	  "SharedArrayBuffer",
	  "Atomics",
	  "DataView",
	  "JSON",
	  // Control abstraction objects
	  "Promise",
	  "Generator",
	  "GeneratorFunction",
	  "AsyncFunction",
	  // Reflection
	  "Reflect",
	  "Proxy",
	  // Internationalization
	  "Intl",
	  // WebAssembly
	  "WebAssembly"
	];

	const ERROR_TYPES = [
	  "Error",
	  "EvalError",
	  "InternalError",
	  "RangeError",
	  "ReferenceError",
	  "SyntaxError",
	  "TypeError",
	  "URIError"
	];

	const BUILT_IN_GLOBALS = [
	  "setInterval",
	  "setTimeout",
	  "clearInterval",
	  "clearTimeout",

	  "require",
	  "exports",

	  "eval",
	  "isFinite",
	  "isNaN",
	  "parseFloat",
	  "parseInt",
	  "decodeURI",
	  "decodeURIComponent",
	  "encodeURI",
	  "encodeURIComponent",
	  "escape",
	  "unescape"
	];

	const BUILT_IN_VARIABLES = [
	  "arguments",
	  "this",
	  "super",
	  "console",
	  "window",
	  "document",
	  "localStorage",
	  "sessionStorage",
	  "module",
	  "global" // Node.js
	];

	const BUILT_INS = [].concat(
	  BUILT_IN_GLOBALS,
	  TYPES,
	  ERROR_TYPES
	);

	/*
	Language: JavaScript
	Description: JavaScript (JS) is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions.
	Category: common, scripting, web
	Website: https://developer.mozilla.org/en-US/docs/Web/JavaScript
	*/


	/** @type LanguageFn */
	function javascript(hljs) {
	  const regex = hljs.regex;
	  /**
	   * Takes a string like "<Booger" and checks to see
	   * if we can find a matching "</Booger" later in the
	   * content.
	   * @param {RegExpMatchArray} match
	   * @param {{after:number}} param1
	   */
	  const hasClosingTag = (match, { after }) => {
	    const tag = "</" + match[0].slice(1);
	    const pos = match.input.indexOf(tag, after);
	    return pos !== -1;
	  };

	  const IDENT_RE$1 = IDENT_RE;
	  const FRAGMENT = {
	    begin: '<>',
	    end: '</>'
	  };
	  // to avoid some special cases inside isTrulyOpeningTag
	  const XML_SELF_CLOSING = /<[A-Za-z0-9\\._:-]+\s*\/>/;
	  const XML_TAG = {
	    begin: /<[A-Za-z0-9\\._:-]+/,
	    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
	    /**
	     * @param {RegExpMatchArray} match
	     * @param {CallbackResponse} response
	     */
	    isTrulyOpeningTag: (match, response) => {
	      const afterMatchIndex = match[0].length + match.index;
	      const nextChar = match.input[afterMatchIndex];
	      if (
	        // HTML should not include another raw `<` inside a tag
	        // nested type?
	        // `<Array<Array<number>>`, etc.
	        nextChar === "<" ||
	        // the , gives away that this is not HTML
	        // `<T, A extends keyof T, V>`
	        nextChar === ","
	        ) {
	        response.ignoreMatch();
	        return;
	      }

	      // `<something>`
	      // Quite possibly a tag, lets look for a matching closing tag...
	      if (nextChar === ">") {
	        // if we cannot find a matching closing tag, then we
	        // will ignore it
	        if (!hasClosingTag(match, { after: afterMatchIndex })) {
	          response.ignoreMatch();
	        }
	      }

	      // `<blah />` (self-closing)
	      // handled by simpleSelfClosing rule

	      let m;
	      const afterMatch = match.input.substring(afterMatchIndex);

	      // some more template typing stuff
	      //  <T = any>(key?: string) => Modify<
	      if ((m = afterMatch.match(/^\s*=/))) {
	        response.ignoreMatch();
	        return;
	      }

	      // `<From extends string>`
	      // technically this could be HTML, but it smells like a type
	      // NOTE: This is ugh, but added specifically for https://github.com/highlightjs/highlight.js/issues/3276
	      if ((m = afterMatch.match(/^\s+extends\s+/))) {
	        if (m.index === 0) {
	          response.ignoreMatch();
	          // eslint-disable-next-line no-useless-return
	          return;
	        }
	      }
	    }
	  };
	  const KEYWORDS$1 = {
	    $pattern: IDENT_RE,
	    keyword: KEYWORDS,
	    literal: LITERALS,
	    built_in: BUILT_INS,
	    "variable.language": BUILT_IN_VARIABLES
	  };

	  // https://tc39.es/ecma262/#sec-literals-numeric-literals
	  const decimalDigits = '[0-9](_?[0-9])*';
	  const frac = `\\.(${decimalDigits})`;
	  // DecimalIntegerLiteral, including Annex B NonOctalDecimalIntegerLiteral
	  // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
	  const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
	  const NUMBER = {
	    className: 'number',
	    variants: [
	      // DecimalLiteral
	      { begin: `(\\b(${decimalInteger})((${frac})|\\.)?|(${frac}))` +
	        `[eE][+-]?(${decimalDigits})\\b` },
	      { begin: `\\b(${decimalInteger})\\b((${frac})\\b|\\.)?|(${frac})\\b` },

	      // DecimalBigIntegerLiteral
	      { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },

	      // NonDecimalIntegerLiteral
	      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
	      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
	      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },

	      // LegacyOctalIntegerLiteral (does not include underscore separators)
	      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
	      { begin: "\\b0[0-7]+n?\\b" },
	    ],
	    relevance: 0
	  };

	  const SUBST = {
	    className: 'subst',
	    begin: '\\$\\{',
	    end: '\\}',
	    keywords: KEYWORDS$1,
	    contains: [] // defined later
	  };
	  const HTML_TEMPLATE = {
	    begin: 'html`',
	    end: '',
	    starts: {
	      end: '`',
	      returnEnd: false,
	      contains: [
	        hljs.BACKSLASH_ESCAPE,
	        SUBST
	      ],
	      subLanguage: 'xml'
	    }
	  };
	  const CSS_TEMPLATE = {
	    begin: 'css`',
	    end: '',
	    starts: {
	      end: '`',
	      returnEnd: false,
	      contains: [
	        hljs.BACKSLASH_ESCAPE,
	        SUBST
	      ],
	      subLanguage: 'css'
	    }
	  };
	  const GRAPHQL_TEMPLATE = {
	    begin: 'gql`',
	    end: '',
	    starts: {
	      end: '`',
	      returnEnd: false,
	      contains: [
	        hljs.BACKSLASH_ESCAPE,
	        SUBST
	      ],
	      subLanguage: 'graphql'
	    }
	  };
	  const TEMPLATE_STRING = {
	    className: 'string',
	    begin: '`',
	    end: '`',
	    contains: [
	      hljs.BACKSLASH_ESCAPE,
	      SUBST
	    ]
	  };
	  const JSDOC_COMMENT = hljs.COMMENT(
	    /\/\*\*(?!\/)/,
	    '\\*/',
	    {
	      relevance: 0,
	      contains: [
	        {
	          begin: '(?=@[A-Za-z]+)',
	          relevance: 0,
	          contains: [
	            {
	              className: 'doctag',
	              begin: '@[A-Za-z]+'
	            },
	            {
	              className: 'type',
	              begin: '\\{',
	              end: '\\}',
	              excludeEnd: true,
	              excludeBegin: true,
	              relevance: 0
	            },
	            {
	              className: 'variable',
	              begin: IDENT_RE$1 + '(?=\\s*(-)|$)',
	              endsParent: true,
	              relevance: 0
	            },
	            // eat spaces (not newlines) so we can find
	            // types or variables
	            {
	              begin: /(?=[^\n])\s/,
	              relevance: 0
	            }
	          ]
	        }
	      ]
	    }
	  );
	  const COMMENT = {
	    className: "comment",
	    variants: [
	      JSDOC_COMMENT,
	      hljs.C_BLOCK_COMMENT_MODE,
	      hljs.C_LINE_COMMENT_MODE
	    ]
	  };
	  const SUBST_INTERNALS = [
	    hljs.APOS_STRING_MODE,
	    hljs.QUOTE_STRING_MODE,
	    HTML_TEMPLATE,
	    CSS_TEMPLATE,
	    GRAPHQL_TEMPLATE,
	    TEMPLATE_STRING,
	    // Skip numbers when they are part of a variable name
	    { match: /\$\d+/ },
	    NUMBER,
	    // This is intentional:
	    // See https://github.com/highlightjs/highlight.js/issues/3288
	    // hljs.REGEXP_MODE
	  ];
	  SUBST.contains = SUBST_INTERNALS
	    .concat({
	      // we need to pair up {} inside our subst to prevent
	      // it from ending too early by matching another }
	      begin: /\{/,
	      end: /\}/,
	      keywords: KEYWORDS$1,
	      contains: [
	        "self"
	      ].concat(SUBST_INTERNALS)
	    });
	  const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
	  const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
	    // eat recursive parens in sub expressions
	    {
	      begin: /\(/,
	      end: /\)/,
	      keywords: KEYWORDS$1,
	      contains: ["self"].concat(SUBST_AND_COMMENTS)
	    }
	  ]);
	  const PARAMS = {
	    className: 'params',
	    begin: /\(/,
	    end: /\)/,
	    excludeBegin: true,
	    excludeEnd: true,
	    keywords: KEYWORDS$1,
	    contains: PARAMS_CONTAINS
	  };

	  // ES6 classes
	  const CLASS_OR_EXTENDS = {
	    variants: [
	      // class Car extends vehicle
	      {
	        match: [
	          /class/,
	          /\s+/,
	          IDENT_RE$1,
	          /\s+/,
	          /extends/,
	          /\s+/,
	          regex.concat(IDENT_RE$1, "(", regex.concat(/\./, IDENT_RE$1), ")*")
	        ],
	        scope: {
	          1: "keyword",
	          3: "title.class",
	          5: "keyword",
	          7: "title.class.inherited"
	        }
	      },
	      // class Car
	      {
	        match: [
	          /class/,
	          /\s+/,
	          IDENT_RE$1
	        ],
	        scope: {
	          1: "keyword",
	          3: "title.class"
	        }
	      },

	    ]
	  };

	  const CLASS_REFERENCE = {
	    relevance: 0,
	    match:
	    regex.either(
	      // Hard coded exceptions
	      /\bJSON/,
	      // Float32Array, OutT
	      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
	      // CSSFactory, CSSFactoryT
	      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
	      // FPs, FPsT
	      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/,
	      // P
	      // single letters are not highlighted
	      // BLAH
	      // this will be flagged as a UPPER_CASE_CONSTANT instead
	    ),
	    className: "title.class",
	    keywords: {
	      _: [
	        // se we still get relevance credit for JS library classes
	        ...TYPES,
	        ...ERROR_TYPES
	      ]
	    }
	  };

	  const USE_STRICT = {
	    label: "use_strict",
	    className: 'meta',
	    relevance: 10,
	    begin: /^\s*['"]use (strict|asm)['"]/
	  };

	  const FUNCTION_DEFINITION = {
	    variants: [
	      {
	        match: [
	          /function/,
	          /\s+/,
	          IDENT_RE$1,
	          /(?=\s*\()/
	        ]
	      },
	      // anonymous function
	      {
	        match: [
	          /function/,
	          /\s*(?=\()/
	        ]
	      }
	    ],
	    className: {
	      1: "keyword",
	      3: "title.function"
	    },
	    label: "func.def",
	    contains: [ PARAMS ],
	    illegal: /%/
	  };

	  const UPPER_CASE_CONSTANT = {
	    relevance: 0,
	    match: /\b[A-Z][A-Z_0-9]+\b/,
	    className: "variable.constant"
	  };

	  function noneOf(list) {
	    return regex.concat("(?!", list.join("|"), ")");
	  }

	  const FUNCTION_CALL = {
	    match: regex.concat(
	      /\b/,
	      noneOf([
	        ...BUILT_IN_GLOBALS,
	        "super",
	        "import"
	      ]),
	      IDENT_RE$1, regex.lookahead(/\(/)),
	    className: "title.function",
	    relevance: 0
	  };

	  const PROPERTY_ACCESS = {
	    begin: regex.concat(/\./, regex.lookahead(
	      regex.concat(IDENT_RE$1, /(?![0-9A-Za-z$_(])/)
	    )),
	    end: IDENT_RE$1,
	    excludeBegin: true,
	    keywords: "prototype",
	    className: "property",
	    relevance: 0
	  };

	  const GETTER_OR_SETTER = {
	    match: [
	      /get|set/,
	      /\s+/,
	      IDENT_RE$1,
	      /(?=\()/
	    ],
	    className: {
	      1: "keyword",
	      3: "title.function"
	    },
	    contains: [
	      { // eat to avoid empty params
	        begin: /\(\)/
	      },
	      PARAMS
	    ]
	  };

	  const FUNC_LEAD_IN_RE = '(\\(' +
	    '[^()]*(\\(' +
	    '[^()]*(\\(' +
	    '[^()]*' +
	    '\\)[^()]*)*' +
	    '\\)[^()]*)*' +
	    '\\)|' + hljs.UNDERSCORE_IDENT_RE + ')\\s*=>';

	  const FUNCTION_VARIABLE = {
	    match: [
	      /const|var|let/, /\s+/,
	      IDENT_RE$1, /\s*/,
	      /=\s*/,
	      /(async\s*)?/, // async is optional
	      regex.lookahead(FUNC_LEAD_IN_RE)
	    ],
	    keywords: "async",
	    className: {
	      1: "keyword",
	      3: "title.function"
	    },
	    contains: [
	      PARAMS
	    ]
	  };

	  return {
	    name: 'JavaScript',
	    aliases: ['js', 'jsx', 'mjs', 'cjs'],
	    keywords: KEYWORDS$1,
	    // this will be extended by TypeScript
	    exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
	    illegal: /#(?![$_A-z])/,
	    contains: [
	      hljs.SHEBANG({
	        label: "shebang",
	        binary: "node",
	        relevance: 5
	      }),
	      USE_STRICT,
	      hljs.APOS_STRING_MODE,
	      hljs.QUOTE_STRING_MODE,
	      HTML_TEMPLATE,
	      CSS_TEMPLATE,
	      GRAPHQL_TEMPLATE,
	      TEMPLATE_STRING,
	      COMMENT,
	      // Skip numbers when they are part of a variable name
	      { match: /\$\d+/ },
	      NUMBER,
	      CLASS_REFERENCE,
	      {
	        className: 'attr',
	        begin: IDENT_RE$1 + regex.lookahead(':'),
	        relevance: 0
	      },
	      FUNCTION_VARIABLE,
	      { // "value" container
	        begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
	        keywords: 'return throw case',
	        relevance: 0,
	        contains: [
	          COMMENT,
	          hljs.REGEXP_MODE,
	          {
	            className: 'function',
	            // we have to count the parens to make sure we actually have the
	            // correct bounding ( ) before the =>.  There could be any number of
	            // sub-expressions inside also surrounded by parens.
	            begin: FUNC_LEAD_IN_RE,
	            returnBegin: true,
	            end: '\\s*=>',
	            contains: [
	              {
	                className: 'params',
	                variants: [
	                  {
	                    begin: hljs.UNDERSCORE_IDENT_RE,
	                    relevance: 0
	                  },
	                  {
	                    className: null,
	                    begin: /\(\s*\)/,
	                    skip: true
	                  },
	                  {
	                    begin: /\(/,
	                    end: /\)/,
	                    excludeBegin: true,
	                    excludeEnd: true,
	                    keywords: KEYWORDS$1,
	                    contains: PARAMS_CONTAINS
	                  }
	                ]
	              }
	            ]
	          },
	          { // could be a comma delimited list of params to a function call
	            begin: /,/,
	            relevance: 0
	          },
	          {
	            match: /\s+/,
	            relevance: 0
	          },
	          { // JSX
	            variants: [
	              { begin: FRAGMENT.begin, end: FRAGMENT.end },
	              { match: XML_SELF_CLOSING },
	              {
	                begin: XML_TAG.begin,
	                // we carefully check the opening tag to see if it truly
	                // is a tag and not a false positive
	                'on:begin': XML_TAG.isTrulyOpeningTag,
	                end: XML_TAG.end
	              }
	            ],
	            subLanguage: 'xml',
	            contains: [
	              {
	                begin: XML_TAG.begin,
	                end: XML_TAG.end,
	                skip: true,
	                contains: ['self']
	              }
	            ]
	          }
	        ],
	      },
	      FUNCTION_DEFINITION,
	      {
	        // prevent this from getting swallowed up by function
	        // since they appear "function like"
	        beginKeywords: "while if switch catch for"
	      },
	      {
	        // we have to count the parens to make sure we actually have the correct
	        // bounding ( ).  There could be any number of sub-expressions inside
	        // also surrounded by parens.
	        begin: '\\b(?!function)' + hljs.UNDERSCORE_IDENT_RE +
	          '\\(' + // first parens
	          '[^()]*(\\(' +
	            '[^()]*(\\(' +
	              '[^()]*' +
	            '\\)[^()]*)*' +
	          '\\)[^()]*)*' +
	          '\\)\\s*\\{', // end parens
	        returnBegin:true,
	        label: "func.def",
	        contains: [
	          PARAMS,
	          hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1, className: "title.function" })
	        ]
	      },
	      // catch ... so it won't trigger the property rule below
	      {
	        match: /\.\.\./,
	        relevance: 0
	      },
	      PROPERTY_ACCESS,
	      // hack: prevents detection of keywords in some circumstances
	      // .keyword()
	      // $keyword = x
	      {
	        match: '\\$' + IDENT_RE$1,
	        relevance: 0
	      },
	      {
	        match: [ /\bconstructor(?=\s*\()/ ],
	        className: { 1: "title.function" },
	        contains: [ PARAMS ]
	      },
	      FUNCTION_CALL,
	      UPPER_CASE_CONSTANT,
	      CLASS_OR_EXTENDS,
	      GETTER_OR_SETTER,
	      {
	        match: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
	      }
	    ]
	  };
	}

	javascript_1 = javascript;
	return javascript_1;
}

/*
Language: JSON
Description: JSON (JavaScript Object Notation) is a lightweight data-interchange format.
Author: Ivan Sagalaev <maniac@softwaremaniacs.org>
Website: http://www.json.org
Category: common, protocols, web
*/

var json_1;
var hasRequiredJson;

function requireJson () {
	if (hasRequiredJson) return json_1;
	hasRequiredJson = 1;
	function json(hljs) {
	  const ATTRIBUTE = {
	    className: 'attr',
	    begin: /"(\\.|[^\\"\r\n])*"(?=\s*:)/,
	    relevance: 1.01
	  };
	  const PUNCTUATION = {
	    match: /[{}[\],:]/,
	    className: "punctuation",
	    relevance: 0
	  };
	  const LITERALS = [
	    "true",
	    "false",
	    "null"
	  ];
	  // NOTE: normally we would rely on `keywords` for this but using a mode here allows us
	  // - to use the very tight `illegal: \S` rule later to flag any other character
	  // - as illegal indicating that despite looking like JSON we do not truly have
	  // - JSON and thus improve false-positively greatly since JSON will try and claim
	  // - all sorts of JSON looking stuff
	  const LITERALS_MODE = {
	    scope: "literal",
	    beginKeywords: LITERALS.join(" "),
	  };

	  return {
	    name: 'JSON',
	    keywords:{
	      literal: LITERALS,
	    },
	    contains: [
	      ATTRIBUTE,
	      PUNCTUATION,
	      hljs.QUOTE_STRING_MODE,
	      LITERALS_MODE,
	      hljs.C_NUMBER_MODE,
	      hljs.C_LINE_COMMENT_MODE,
	      hljs.C_BLOCK_COMMENT_MODE
	    ],
	    illegal: '\\S'
	  };
	}

	json_1 = json;
	return json_1;
}

var kotlin_1;
var hasRequiredKotlin;

function requireKotlin () {
	if (hasRequiredKotlin) return kotlin_1;
	hasRequiredKotlin = 1;
	// https://docs.oracle.com/javase/specs/jls/se15/html/jls-3.html#jls-3.10
	var decimalDigits = '[0-9](_*[0-9])*';
	var frac = `\\.(${decimalDigits})`;
	var hexDigits = '[0-9a-fA-F](_*[0-9a-fA-F])*';
	var NUMERIC = {
	  className: 'number',
	  variants: [
	    // DecimalFloatingPointLiteral
	    // including ExponentPart
	    { begin: `(\\b(${decimalDigits})((${frac})|\\.)?|(${frac}))` +
	      `[eE][+-]?(${decimalDigits})[fFdD]?\\b` },
	    // excluding ExponentPart
	    { begin: `\\b(${decimalDigits})((${frac})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
	    { begin: `(${frac})[fFdD]?\\b` },
	    { begin: `\\b(${decimalDigits})[fFdD]\\b` },

	    // HexadecimalFloatingPointLiteral
	    { begin: `\\b0[xX]((${hexDigits})\\.?|(${hexDigits})?\\.(${hexDigits}))` +
	      `[pP][+-]?(${decimalDigits})[fFdD]?\\b` },

	    // DecimalIntegerLiteral
	    { begin: '\\b(0|[1-9](_*[0-9])*)[lL]?\\b' },

	    // HexIntegerLiteral
	    { begin: `\\b0[xX](${hexDigits})[lL]?\\b` },

	    // OctalIntegerLiteral
	    { begin: '\\b0(_*[0-7])*[lL]?\\b' },

	    // BinaryIntegerLiteral
	    { begin: '\\b0[bB][01](_*[01])*[lL]?\\b' },
	  ],
	  relevance: 0
	};

	/*
	 Language: Kotlin
	 Description: Kotlin is an OSS statically typed programming language that targets the JVM, Android, JavaScript and Native.
	 Author: Sergey Mashkov <cy6erGn0m@gmail.com>
	 Website: https://kotlinlang.org
	 Category: common
	 */


	function kotlin(hljs) {
	  const KEYWORDS = {
	    keyword:
	      'abstract as val var vararg get set class object open private protected public noinline '
	      + 'crossinline dynamic final enum if else do while for when throw try catch finally '
	      + 'import package is in fun override companion reified inline lateinit init '
	      + 'interface annotation data sealed internal infix operator out by constructor super '
	      + 'tailrec where const inner suspend typealias external expect actual',
	    built_in:
	      'Byte Short Char Int Long Boolean Float Double Void Unit Nothing',
	    literal:
	      'true false null'
	  };
	  const KEYWORDS_WITH_LABEL = {
	    className: 'keyword',
	    begin: /\b(break|continue|return|this)\b/,
	    starts: { contains: [
	      {
	        className: 'symbol',
	        begin: /@\w+/
	      }
	    ] }
	  };
	  const LABEL = {
	    className: 'symbol',
	    begin: hljs.UNDERSCORE_IDENT_RE + '@'
	  };

	  // for string templates
	  const SUBST = {
	    className: 'subst',
	    begin: /\$\{/,
	    end: /\}/,
	    contains: [ hljs.C_NUMBER_MODE ]
	  };
	  const VARIABLE = {
	    className: 'variable',
	    begin: '\\$' + hljs.UNDERSCORE_IDENT_RE
	  };
	  const STRING = {
	    className: 'string',
	    variants: [
	      {
	        begin: '"""',
	        end: '"""(?=[^"])',
	        contains: [
	          VARIABLE,
	          SUBST
	        ]
	      },
	      // Can't use built-in modes easily, as we want to use STRING in the meta
	      // context as 'meta-string' and there's no syntax to remove explicitly set
	      // classNames in built-in modes.
	      {
	        begin: '\'',
	        end: '\'',
	        illegal: /\n/,
	        contains: [ hljs.BACKSLASH_ESCAPE ]
	      },
	      {
	        begin: '"',
	        end: '"',
	        illegal: /\n/,
	        contains: [
	          hljs.BACKSLASH_ESCAPE,
	          VARIABLE,
	          SUBST
	        ]
	      }
	    ]
	  };
	  SUBST.contains.push(STRING);

	  const ANNOTATION_USE_SITE = {
	    className: 'meta',
	    begin: '@(?:file|property|field|get|set|receiver|param|setparam|delegate)\\s*:(?:\\s*' + hljs.UNDERSCORE_IDENT_RE + ')?'
	  };
	  const ANNOTATION = {
	    className: 'meta',
	    begin: '@' + hljs.UNDERSCORE_IDENT_RE,
	    contains: [
	      {
	        begin: /\(/,
	        end: /\)/,
	        contains: [
	          hljs.inherit(STRING, { className: 'string' }),
	          "self"
	        ]
	      }
	    ]
	  };

	  // https://kotlinlang.org/docs/reference/whatsnew11.html#underscores-in-numeric-literals
	  // According to the doc above, the number mode of kotlin is the same as java 8,
	  // so the code below is copied from java.js
	  const KOTLIN_NUMBER_MODE = NUMERIC;
	  const KOTLIN_NESTED_COMMENT = hljs.COMMENT(
	    '/\\*', '\\*/',
	    { contains: [ hljs.C_BLOCK_COMMENT_MODE ] }
	  );
	  const KOTLIN_PAREN_TYPE = { variants: [
	    {
	      className: 'type',
	      begin: hljs.UNDERSCORE_IDENT_RE
	    },
	    {
	      begin: /\(/,
	      end: /\)/,
	      contains: [] // defined later
	    }
	  ] };
	  const KOTLIN_PAREN_TYPE2 = KOTLIN_PAREN_TYPE;
	  KOTLIN_PAREN_TYPE2.variants[1].contains = [ KOTLIN_PAREN_TYPE ];
	  KOTLIN_PAREN_TYPE.variants[1].contains = [ KOTLIN_PAREN_TYPE2 ];

	  return {
	    name: 'Kotlin',
	    aliases: [
	      'kt',
	      'kts'
	    ],
	    keywords: KEYWORDS,
	    contains: [
	      hljs.COMMENT(
	        '/\\*\\*',
	        '\\*/',
	        {
	          relevance: 0,
	          contains: [
	            {
	              className: 'doctag',
	              begin: '@[A-Za-z]+'
	            }
	          ]
	        }
	      ),
	      hljs.C_LINE_COMMENT_MODE,
	      KOTLIN_NESTED_COMMENT,
	      KEYWORDS_WITH_LABEL,
	      LABEL,
	      ANNOTATION_USE_SITE,
	      ANNOTATION,
	      {
	        className: 'function',
	        beginKeywords: 'fun',
	        end: '[(]|$',
	        returnBegin: true,
	        excludeEnd: true,
	        keywords: KEYWORDS,
	        relevance: 5,
	        contains: [
	          {
	            begin: hljs.UNDERSCORE_IDENT_RE + '\\s*\\(',
	            returnBegin: true,
	            relevance: 0,
	            contains: [ hljs.UNDERSCORE_TITLE_MODE ]
	          },
	          {
	            className: 'type',
	            begin: /</,
	            end: />/,
	            keywords: 'reified',
	            relevance: 0
	          },
	          {
	            className: 'params',
	            begin: /\(/,
	            end: /\)/,
	            endsParent: true,
	            keywords: KEYWORDS,
	            relevance: 0,
	            contains: [
	              {
	                begin: /:/,
	                end: /[=,\/]/,
	                endsWithParent: true,
	                contains: [
	                  KOTLIN_PAREN_TYPE,
	                  hljs.C_LINE_COMMENT_MODE,
	                  KOTLIN_NESTED_COMMENT
	                ],
	                relevance: 0
	              },
	              hljs.C_LINE_COMMENT_MODE,
	              KOTLIN_NESTED_COMMENT,
	              ANNOTATION_USE_SITE,
	              ANNOTATION,
	              STRING,
	              hljs.C_NUMBER_MODE
	            ]
	          },
	          KOTLIN_NESTED_COMMENT
	        ]
	      },
	      {
	        begin: [
	          /class|interface|trait/,
	          /\s+/,
	          hljs.UNDERSCORE_IDENT_RE
	        ],
	        beginScope: {
	          3: "title.class"
	        },
	        keywords: 'class interface trait',
	        end: /[:\{(]|$/,
	        excludeEnd: true,
	        illegal: 'extends implements',
	        contains: [
	          { beginKeywords: 'public protected internal private constructor' },
	          hljs.UNDERSCORE_TITLE_MODE,
	          {
	            className: 'type',
	            begin: /</,
	            end: />/,
	            excludeBegin: true,
	            excludeEnd: true,
	            relevance: 0
	          },
	          {
	            className: 'type',
	            begin: /[,:]\s*/,
	            end: /[<\(,){\s]|$/,
	            excludeBegin: true,
	            returnEnd: true
	          },
	          ANNOTATION_USE_SITE,
	          ANNOTATION
	        ]
	      },
	      STRING,
	      {
	        className: 'meta',
	        begin: "^#!/usr/bin/env",
	        end: '$',
	        illegal: '\n'
	      },
	      KOTLIN_NUMBER_MODE
	    ]
	  };
	}

	kotlin_1 = kotlin;
	return kotlin_1;
}

var less_1;
var hasRequiredLess;

function requireLess () {
	if (hasRequiredLess) return less_1;
	hasRequiredLess = 1;
	const MODES = (hljs) => {
	  return {
	    IMPORTANT: {
	      scope: 'meta',
	      begin: '!important'
	    },
	    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
	    HEXCOLOR: {
	      scope: 'number',
	      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
	    },
	    FUNCTION_DISPATCH: {
	      className: "built_in",
	      begin: /[\w-]+(?=\()/
	    },
	    ATTRIBUTE_SELECTOR_MODE: {
	      scope: 'selector-attr',
	      begin: /\[/,
	      end: /\]/,
	      illegal: '$',
	      contains: [
	        hljs.APOS_STRING_MODE,
	        hljs.QUOTE_STRING_MODE
	      ]
	    },
	    CSS_NUMBER_MODE: {
	      scope: 'number',
	      begin: hljs.NUMBER_RE + '(' +
	        '%|em|ex|ch|rem' +
	        '|vw|vh|vmin|vmax' +
	        '|cm|mm|in|pt|pc|px' +
	        '|deg|grad|rad|turn' +
	        '|s|ms' +
	        '|Hz|kHz' +
	        '|dpi|dpcm|dppx' +
	        ')?',
	      relevance: 0
	    },
	    CSS_VARIABLE: {
	      className: "attr",
	      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
	    }
	  };
	};

	const TAGS = [
	  'a',
	  'abbr',
	  'address',
	  'article',
	  'aside',
	  'audio',
	  'b',
	  'blockquote',
	  'body',
	  'button',
	  'canvas',
	  'caption',
	  'cite',
	  'code',
	  'dd',
	  'del',
	  'details',
	  'dfn',
	  'div',
	  'dl',
	  'dt',
	  'em',
	  'fieldset',
	  'figcaption',
	  'figure',
	  'footer',
	  'form',
	  'h1',
	  'h2',
	  'h3',
	  'h4',
	  'h5',
	  'h6',
	  'header',
	  'hgroup',
	  'html',
	  'i',
	  'iframe',
	  'img',
	  'input',
	  'ins',
	  'kbd',
	  'label',
	  'legend',
	  'li',
	  'main',
	  'mark',
	  'menu',
	  'nav',
	  'object',
	  'ol',
	  'p',
	  'q',
	  'quote',
	  'samp',
	  'section',
	  'span',
	  'strong',
	  'summary',
	  'sup',
	  'table',
	  'tbody',
	  'td',
	  'textarea',
	  'tfoot',
	  'th',
	  'thead',
	  'time',
	  'tr',
	  'ul',
	  'var',
	  'video'
	];

	const MEDIA_FEATURES = [
	  'any-hover',
	  'any-pointer',
	  'aspect-ratio',
	  'color',
	  'color-gamut',
	  'color-index',
	  'device-aspect-ratio',
	  'device-height',
	  'device-width',
	  'display-mode',
	  'forced-colors',
	  'grid',
	  'height',
	  'hover',
	  'inverted-colors',
	  'monochrome',
	  'orientation',
	  'overflow-block',
	  'overflow-inline',
	  'pointer',
	  'prefers-color-scheme',
	  'prefers-contrast',
	  'prefers-reduced-motion',
	  'prefers-reduced-transparency',
	  'resolution',
	  'scan',
	  'scripting',
	  'update',
	  'width',
	  // TODO: find a better solution?
	  'min-width',
	  'max-width',
	  'min-height',
	  'max-height'
	];

	// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
	const PSEUDO_CLASSES = [
	  'active',
	  'any-link',
	  'blank',
	  'checked',
	  'current',
	  'default',
	  'defined',
	  'dir', // dir()
	  'disabled',
	  'drop',
	  'empty',
	  'enabled',
	  'first',
	  'first-child',
	  'first-of-type',
	  'fullscreen',
	  'future',
	  'focus',
	  'focus-visible',
	  'focus-within',
	  'has', // has()
	  'host', // host or host()
	  'host-context', // host-context()
	  'hover',
	  'indeterminate',
	  'in-range',
	  'invalid',
	  'is', // is()
	  'lang', // lang()
	  'last-child',
	  'last-of-type',
	  'left',
	  'link',
	  'local-link',
	  'not', // not()
	  'nth-child', // nth-child()
	  'nth-col', // nth-col()
	  'nth-last-child', // nth-last-child()
	  'nth-last-col', // nth-last-col()
	  'nth-last-of-type', //nth-last-of-type()
	  'nth-of-type', //nth-of-type()
	  'only-child',
	  'only-of-type',
	  'optional',
	  'out-of-range',
	  'past',
	  'placeholder-shown',
	  'read-only',
	  'read-write',
	  'required',
	  'right',
	  'root',
	  'scope',
	  'target',
	  'target-within',
	  'user-invalid',
	  'valid',
	  'visited',
	  'where' // where()
	];

	// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
	const PSEUDO_ELEMENTS = [
	  'after',
	  'backdrop',
	  'before',
	  'cue',
	  'cue-region',
	  'first-letter',
	  'first-line',
	  'grammar-error',
	  'marker',
	  'part',
	  'placeholder',
	  'selection',
	  'slotted',
	  'spelling-error'
	];

	const ATTRIBUTES = [
	  'align-content',
	  'align-items',
	  'align-self',
	  'all',
	  'animation',
	  'animation-delay',
	  'animation-direction',
	  'animation-duration',
	  'animation-fill-mode',
	  'animation-iteration-count',
	  'animation-name',
	  'animation-play-state',
	  'animation-timing-function',
	  'backface-visibility',
	  'background',
	  'background-attachment',
	  'background-blend-mode',
	  'background-clip',
	  'background-color',
	  'background-image',
	  'background-origin',
	  'background-position',
	  'background-repeat',
	  'background-size',
	  'block-size',
	  'border',
	  'border-block',
	  'border-block-color',
	  'border-block-end',
	  'border-block-end-color',
	  'border-block-end-style',
	  'border-block-end-width',
	  'border-block-start',
	  'border-block-start-color',
	  'border-block-start-style',
	  'border-block-start-width',
	  'border-block-style',
	  'border-block-width',
	  'border-bottom',
	  'border-bottom-color',
	  'border-bottom-left-radius',
	  'border-bottom-right-radius',
	  'border-bottom-style',
	  'border-bottom-width',
	  'border-collapse',
	  'border-color',
	  'border-image',
	  'border-image-outset',
	  'border-image-repeat',
	  'border-image-slice',
	  'border-image-source',
	  'border-image-width',
	  'border-inline',
	  'border-inline-color',
	  'border-inline-end',
	  'border-inline-end-color',
	  'border-inline-end-style',
	  'border-inline-end-width',
	  'border-inline-start',
	  'border-inline-start-color',
	  'border-inline-start-style',
	  'border-inline-start-width',
	  'border-inline-style',
	  'border-inline-width',
	  'border-left',
	  'border-left-color',
	  'border-left-style',
	  'border-left-width',
	  'border-radius',
	  'border-right',
	  'border-right-color',
	  'border-right-style',
	  'border-right-width',
	  'border-spacing',
	  'border-style',
	  'border-top',
	  'border-top-color',
	  'border-top-left-radius',
	  'border-top-right-radius',
	  'border-top-style',
	  'border-top-width',
	  'border-width',
	  'bottom',
	  'box-decoration-break',
	  'box-shadow',
	  'box-sizing',
	  'break-after',
	  'break-before',
	  'break-inside',
	  'caption-side',
	  'caret-color',
	  'clear',
	  'clip',
	  'clip-path',
	  'clip-rule',
	  'color',
	  'column-count',
	  'column-fill',
	  'column-gap',
	  'column-rule',
	  'column-rule-color',
	  'column-rule-style',
	  'column-rule-width',
	  'column-span',
	  'column-width',
	  'columns',
	  'contain',
	  'content',
	  'content-visibility',
	  'counter-increment',
	  'counter-reset',
	  'cue',
	  'cue-after',
	  'cue-before',
	  'cursor',
	  'direction',
	  'display',
	  'empty-cells',
	  'filter',
	  'flex',
	  'flex-basis',
	  'flex-direction',
	  'flex-flow',
	  'flex-grow',
	  'flex-shrink',
	  'flex-wrap',
	  'float',
	  'flow',
	  'font',
	  'font-display',
	  'font-family',
	  'font-feature-settings',
	  'font-kerning',
	  'font-language-override',
	  'font-size',
	  'font-size-adjust',
	  'font-smoothing',
	  'font-stretch',
	  'font-style',
	  'font-synthesis',
	  'font-variant',
	  'font-variant-caps',
	  'font-variant-east-asian',
	  'font-variant-ligatures',
	  'font-variant-numeric',
	  'font-variant-position',
	  'font-variation-settings',
	  'font-weight',
	  'gap',
	  'glyph-orientation-vertical',
	  'grid',
	  'grid-area',
	  'grid-auto-columns',
	  'grid-auto-flow',
	  'grid-auto-rows',
	  'grid-column',
	  'grid-column-end',
	  'grid-column-start',
	  'grid-gap',
	  'grid-row',
	  'grid-row-end',
	  'grid-row-start',
	  'grid-template',
	  'grid-template-areas',
	  'grid-template-columns',
	  'grid-template-rows',
	  'hanging-punctuation',
	  'height',
	  'hyphens',
	  'icon',
	  'image-orientation',
	  'image-rendering',
	  'image-resolution',
	  'ime-mode',
	  'inline-size',
	  'isolation',
	  'justify-content',
	  'left',
	  'letter-spacing',
	  'line-break',
	  'line-height',
	  'list-style',
	  'list-style-image',
	  'list-style-position',
	  'list-style-type',
	  'margin',
	  'margin-block',
	  'margin-block-end',
	  'margin-block-start',
	  'margin-bottom',
	  'margin-inline',
	  'margin-inline-end',
	  'margin-inline-start',
	  'margin-left',
	  'margin-right',
	  'margin-top',
	  'marks',
	  'mask',
	  'mask-border',
	  'mask-border-mode',
	  'mask-border-outset',
	  'mask-border-repeat',
	  'mask-border-slice',
	  'mask-border-source',
	  'mask-border-width',
	  'mask-clip',
	  'mask-composite',
	  'mask-image',
	  'mask-mode',
	  'mask-origin',
	  'mask-position',
	  'mask-repeat',
	  'mask-size',
	  'mask-type',
	  'max-block-size',
	  'max-height',
	  'max-inline-size',
	  'max-width',
	  'min-block-size',
	  'min-height',
	  'min-inline-size',
	  'min-width',
	  'mix-blend-mode',
	  'nav-down',
	  'nav-index',
	  'nav-left',
	  'nav-right',
	  'nav-up',
	  'none',
	  'normal',
	  'object-fit',
	  'object-position',
	  'opacity',
	  'order',
	  'orphans',
	  'outline',
	  'outline-color',
	  'outline-offset',
	  'outline-style',
	  'outline-width',
	  'overflow',
	  'overflow-wrap',
	  'overflow-x',
	  'overflow-y',
	  'padding',
	  'padding-block',
	  'padding-block-end',
	  'padding-block-start',
	  'padding-bottom',
	  'padding-inline',
	  'padding-inline-end',
	  'padding-inline-start',
	  'padding-left',
	  'padding-right',
	  'padding-top',
	  'page-break-after',
	  'page-break-before',
	  'page-break-inside',
	  'pause',
	  'pause-after',
	  'pause-before',
	  'perspective',
	  'perspective-origin',
	  'pointer-events',
	  'position',
	  'quotes',
	  'resize',
	  'rest',
	  'rest-after',
	  'rest-before',
	  'right',
	  'row-gap',
	  'scroll-margin',
	  'scroll-margin-block',
	  'scroll-margin-block-end',
	  'scroll-margin-block-start',
	  'scroll-margin-bottom',
	  'scroll-margin-inline',
	  'scroll-margin-inline-end',
	  'scroll-margin-inline-start',
	  'scroll-margin-left',
	  'scroll-margin-right',
	  'scroll-margin-top',
	  'scroll-padding',
	  'scroll-padding-block',
	  'scroll-padding-block-end',
	  'scroll-padding-block-start',
	  'scroll-padding-bottom',
	  'scroll-padding-inline',
	  'scroll-padding-inline-end',
	  'scroll-padding-inline-start',
	  'scroll-padding-left',
	  'scroll-padding-right',
	  'scroll-padding-top',
	  'scroll-snap-align',
	  'scroll-snap-stop',
	  'scroll-snap-type',
	  'scrollbar-color',
	  'scrollbar-gutter',
	  'scrollbar-width',
	  'shape-image-threshold',
	  'shape-margin',
	  'shape-outside',
	  'speak',
	  'speak-as',
	  'src', // @font-face
	  'tab-size',
	  'table-layout',
	  'text-align',
	  'text-align-all',
	  'text-align-last',
	  'text-combine-upright',
	  'text-decoration',
	  'text-decoration-color',
	  'text-decoration-line',
	  'text-decoration-style',
	  'text-emphasis',
	  'text-emphasis-color',
	  'text-emphasis-position',
	  'text-emphasis-style',
	  'text-indent',
	  'text-justify',
	  'text-orientation',
	  'text-overflow',
	  'text-rendering',
	  'text-shadow',
	  'text-transform',
	  'text-underline-position',
	  'top',
	  'transform',
	  'transform-box',
	  'transform-origin',
	  'transform-style',
	  'transition',
	  'transition-delay',
	  'transition-duration',
	  'transition-property',
	  'transition-timing-function',
	  'unicode-bidi',
	  'vertical-align',
	  'visibility',
	  'voice-balance',
	  'voice-duration',
	  'voice-family',
	  'voice-pitch',
	  'voice-range',
	  'voice-rate',
	  'voice-stress',
	  'voice-volume',
	  'white-space',
	  'widows',
	  'width',
	  'will-change',
	  'word-break',
	  'word-spacing',
	  'word-wrap',
	  'writing-mode',
	  'z-index'
	  // reverse makes sure longer attributes `font-weight` are matched fully
	  // instead of getting false positives on say `font`
	].reverse();

	// some grammars use them all as a single group
	const PSEUDO_SELECTORS = PSEUDO_CLASSES.concat(PSEUDO_ELEMENTS);

	/*
	Language: Less
	Description: It's CSS, with just a little more.
	Author:   Max Mikhailov <seven.phases.max@gmail.com>
	Website: http://lesscss.org
	Category: common, css, web
	*/


	/** @type LanguageFn */
	function less(hljs) {
	  const modes = MODES(hljs);
	  const PSEUDO_SELECTORS$1 = PSEUDO_SELECTORS;

	  const AT_MODIFIERS = "and or not only";
	  const IDENT_RE = '[\\w-]+'; // yes, Less identifiers may begin with a digit
	  const INTERP_IDENT_RE = '(' + IDENT_RE + '|@\\{' + IDENT_RE + '\\})';

	  /* Generic Modes */

	  const RULES = []; const VALUE_MODES = []; // forward def. for recursive modes

	  const STRING_MODE = function(c) {
	    return {
	    // Less strings are not multiline (also include '~' for more consistent coloring of "escaped" strings)
	      className: 'string',
	      begin: '~?' + c + '.*?' + c
	    };
	  };

	  const IDENT_MODE = function(name, begin, relevance) {
	    return {
	      className: name,
	      begin: begin,
	      relevance: relevance
	    };
	  };

	  const AT_KEYWORDS = {
	    $pattern: /[a-z-]+/,
	    keyword: AT_MODIFIERS,
	    attribute: MEDIA_FEATURES.join(" ")
	  };

	  const PARENS_MODE = {
	    // used only to properly balance nested parens inside mixin call, def. arg list
	    begin: '\\(',
	    end: '\\)',
	    contains: VALUE_MODES,
	    keywords: AT_KEYWORDS,
	    relevance: 0
	  };

	  // generic Less highlighter (used almost everywhere except selectors):
	  VALUE_MODES.push(
	    hljs.C_LINE_COMMENT_MODE,
	    hljs.C_BLOCK_COMMENT_MODE,
	    STRING_MODE("'"),
	    STRING_MODE('"'),
	    modes.CSS_NUMBER_MODE, // fixme: it does not include dot for numbers like .5em :(
	    {
	      begin: '(url|data-uri)\\(',
	      starts: {
	        className: 'string',
	        end: '[\\)\\n]',
	        excludeEnd: true
	      }
	    },
	    modes.HEXCOLOR,
	    PARENS_MODE,
	    IDENT_MODE('variable', '@@?' + IDENT_RE, 10),
	    IDENT_MODE('variable', '@\\{' + IDENT_RE + '\\}'),
	    IDENT_MODE('built_in', '~?`[^`]*?`'), // inline javascript (or whatever host language) *multiline* string
	    { // @media features (it’s here to not duplicate things in AT_RULE_MODE with extra PARENS_MODE overriding):
	      className: 'attribute',
	      begin: IDENT_RE + '\\s*:',
	      end: ':',
	      returnBegin: true,
	      excludeEnd: true
	    },
	    modes.IMPORTANT,
	    { beginKeywords: 'and not' },
	    modes.FUNCTION_DISPATCH
	  );

	  const VALUE_WITH_RULESETS = VALUE_MODES.concat({
	    begin: /\{/,
	    end: /\}/,
	    contains: RULES
	  });

	  const MIXIN_GUARD_MODE = {
	    beginKeywords: 'when',
	    endsWithParent: true,
	    contains: [ { beginKeywords: 'and not' } ].concat(VALUE_MODES) // using this form to override VALUE’s 'function' match
	  };

	  /* Rule-Level Modes */

	  const RULE_MODE = {
	    begin: INTERP_IDENT_RE + '\\s*:',
	    returnBegin: true,
	    end: /[;}]/,
	    relevance: 0,
	    contains: [
	      { begin: /-(webkit|moz|ms|o)-/ },
	      modes.CSS_VARIABLE,
	      {
	        className: 'attribute',
	        begin: '\\b(' + ATTRIBUTES.join('|') + ')\\b',
	        end: /(?=:)/,
	        starts: {
	          endsWithParent: true,
	          illegal: '[<=$]',
	          relevance: 0,
	          contains: VALUE_MODES
	        }
	      }
	    ]
	  };

	  const AT_RULE_MODE = {
	    className: 'keyword',
	    begin: '@(import|media|charset|font-face|(-[a-z]+-)?keyframes|supports|document|namespace|page|viewport|host)\\b',
	    starts: {
	      end: '[;{}]',
	      keywords: AT_KEYWORDS,
	      returnEnd: true,
	      contains: VALUE_MODES,
	      relevance: 0
	    }
	  };

	  // variable definitions and calls
	  const VAR_RULE_MODE = {
	    className: 'variable',
	    variants: [
	      // using more strict pattern for higher relevance to increase chances of Less detection.
	      // this is *the only* Less specific statement used in most of the sources, so...
	      // (we’ll still often loose to the css-parser unless there's '//' comment,
	      // simply because 1 variable just can't beat 99 properties :)
	      {
	        begin: '@' + IDENT_RE + '\\s*:',
	        relevance: 15
	      },
	      { begin: '@' + IDENT_RE }
	    ],
	    starts: {
	      end: '[;}]',
	      returnEnd: true,
	      contains: VALUE_WITH_RULESETS
	    }
	  };

	  const SELECTOR_MODE = {
	    // first parse unambiguous selectors (i.e. those not starting with tag)
	    // then fall into the scary lookahead-discriminator variant.
	    // this mode also handles mixin definitions and calls
	    variants: [
	      {
	        begin: '[\\.#:&\\[>]',
	        end: '[;{}]' // mixin calls end with ';'
	      },
	      {
	        begin: INTERP_IDENT_RE,
	        end: /\{/
	      }
	    ],
	    returnBegin: true,
	    returnEnd: true,
	    illegal: '[<=\'$"]',
	    relevance: 0,
	    contains: [
	      hljs.C_LINE_COMMENT_MODE,
	      hljs.C_BLOCK_COMMENT_MODE,
	      MIXIN_GUARD_MODE,
	      IDENT_MODE('keyword', 'all\\b'),
	      IDENT_MODE('variable', '@\\{' + IDENT_RE + '\\}'), // otherwise it’s identified as tag
	      
	      {
	        begin: '\\b(' + TAGS.join('|') + ')\\b',
	        className: 'selector-tag'
	      },
	      modes.CSS_NUMBER_MODE,
	      IDENT_MODE('selector-tag', INTERP_IDENT_RE, 0),
	      IDENT_MODE('selector-id', '#' + INTERP_IDENT_RE),
	      IDENT_MODE('selector-class', '\\.' + INTERP_IDENT_RE, 0),
	      IDENT_MODE('selector-tag', '&', 0),
	      modes.ATTRIBUTE_SELECTOR_MODE,
	      {
	        className: 'selector-pseudo',
	        begin: ':(' + PSEUDO_CLASSES.join('|') + ')'
	      },
	      {
	        className: 'selector-pseudo',
	        begin: ':(:)?(' + PSEUDO_ELEMENTS.join('|') + ')'
	      },
	      {
	        begin: /\(/,
	        end: /\)/,
	        relevance: 0,
	        contains: VALUE_WITH_RULESETS
	      }, // argument list of parametric mixins
	      { begin: '!important' }, // eat !important after mixin call or it will be colored as tag
	      modes.FUNCTION_DISPATCH
	    ]
	  };

	  const PSEUDO_SELECTOR_MODE = {
	    begin: IDENT_RE + ':(:)?' + `(${PSEUDO_SELECTORS$1.join('|')})`,
	    returnBegin: true,
	    contains: [ SELECTOR_MODE ]
	  };

	  RULES.push(
	    hljs.C_LINE_COMMENT_MODE,
	    hljs.C_BLOCK_COMMENT_MODE,
	    AT_RULE_MODE,
	    VAR_RULE_MODE,
	    PSEUDO_SELECTOR_MODE,
	    RULE_MODE,
	    SELECTOR_MODE,
	    MIXIN_GUARD_MODE,
	    modes.FUNCTION_DISPATCH
	  );

	  return {
	    name: 'Less',
	    case_insensitive: true,
	    illegal: '[=>\'/<($"]',
	    contains: RULES
	  };
	}

	less_1 = less;
	return less_1;
}

/*
Language: Lua
Description: Lua is a powerful, efficient, lightweight, embeddable scripting language.
Author: Andrew Fedorov <dmmdrs@mail.ru>
Category: common, scripting
Website: https://www.lua.org
*/

var lua_1;
var hasRequiredLua;

function requireLua () {
	if (hasRequiredLua) return lua_1;
	hasRequiredLua = 1;
	function lua(hljs) {
	  const OPENING_LONG_BRACKET = '\\[=*\\[';
	  const CLOSING_LONG_BRACKET = '\\]=*\\]';
	  const LONG_BRACKETS = {
	    begin: OPENING_LONG_BRACKET,
	    end: CLOSING_LONG_BRACKET,
	    contains: [ 'self' ]
	  };
	  const COMMENTS = [
	    hljs.COMMENT('--(?!' + OPENING_LONG_BRACKET + ')', '$'),
	    hljs.COMMENT(
	      '--' + OPENING_LONG_BRACKET,
	      CLOSING_LONG_BRACKET,
	      {
	        contains: [ LONG_BRACKETS ],
	        relevance: 10
	      }
	    )
	  ];
	  return {
	    name: 'Lua',
	    keywords: {
	      $pattern: hljs.UNDERSCORE_IDENT_RE,
	      literal: "true false nil",
	      keyword: "and break do else elseif end for goto if in local not or repeat return then until while",
	      built_in:
	        // Metatags and globals:
	        '_G _ENV _VERSION __index __newindex __mode __call __metatable __tostring __len '
	        + '__gc __add __sub __mul __div __mod __pow __concat __unm __eq __lt __le assert '
	        // Standard methods and properties:
	        + 'collectgarbage dofile error getfenv getmetatable ipairs load loadfile loadstring '
	        + 'module next pairs pcall print rawequal rawget rawset require select setfenv '
	        + 'setmetatable tonumber tostring type unpack xpcall arg self '
	        // Library methods and properties (one line per library):
	        + 'coroutine resume yield status wrap create running debug getupvalue '
	        + 'debug sethook getmetatable gethook setmetatable setlocal traceback setfenv getinfo setupvalue getlocal getregistry getfenv '
	        + 'io lines write close flush open output type read stderr stdin input stdout popen tmpfile '
	        + 'math log max acos huge ldexp pi cos tanh pow deg tan cosh sinh random randomseed frexp ceil floor rad abs sqrt modf asin min mod fmod log10 atan2 exp sin atan '
	        + 'os exit setlocale date getenv difftime remove time clock tmpname rename execute package preload loadlib loaded loaders cpath config path seeall '
	        + 'string sub upper len gfind rep find match char dump gmatch reverse byte format gsub lower '
	        + 'table setn insert getn foreachi maxn foreach concat sort remove'
	    },
	    contains: COMMENTS.concat([
	      {
	        className: 'function',
	        beginKeywords: 'function',
	        end: '\\)',
	        contains: [
	          hljs.inherit(hljs.TITLE_MODE, { begin: '([_a-zA-Z]\\w*\\.)*([_a-zA-Z]\\w*:)?[_a-zA-Z]\\w*' }),
	          {
	            className: 'params',
	            begin: '\\(',
	            endsWithParent: true,
	            contains: COMMENTS
	          }
	        ].concat(COMMENTS)
	      },
	      hljs.C_NUMBER_MODE,
	      hljs.APOS_STRING_MODE,
	      hljs.QUOTE_STRING_MODE,
	      {
	        className: 'string',
	        begin: OPENING_LONG_BRACKET,
	        end: CLOSING_LONG_BRACKET,
	        contains: [ LONG_BRACKETS ],
	        relevance: 5
	      }
	    ])
	  };
	}

	lua_1 = lua;
	return lua_1;
}

/*
Language: Makefile
Author: Ivan Sagalaev <maniac@softwaremaniacs.org>
Contributors: Joël Porquet <joel@porquet.org>
Website: https://www.gnu.org/software/make/manual/html_node/Introduction.html
Category: common
*/

var makefile_1;
var hasRequiredMakefile;

function requireMakefile () {
	if (hasRequiredMakefile) return makefile_1;
	hasRequiredMakefile = 1;
	function makefile(hljs) {
	  /* Variables: simple (eg $(var)) and special (eg $@) */
	  const VARIABLE = {
	    className: 'variable',
	    variants: [
	      {
	        begin: '\\$\\(' + hljs.UNDERSCORE_IDENT_RE + '\\)',
	        contains: [ hljs.BACKSLASH_ESCAPE ]
	      },
	      { begin: /\$[@%<?\^\+\*]/ }
	    ]
	  };
	  /* Quoted string with variables inside */
	  const QUOTE_STRING = {
	    className: 'string',
	    begin: /"/,
	    end: /"/,
	    contains: [
	      hljs.BACKSLASH_ESCAPE,
	      VARIABLE
	    ]
	  };
	  /* Function: $(func arg,...) */
	  const FUNC = {
	    className: 'variable',
	    begin: /\$\([\w-]+\s/,
	    end: /\)/,
	    keywords: { built_in:
	        'subst patsubst strip findstring filter filter-out sort '
	        + 'word wordlist firstword lastword dir notdir suffix basename '
	        + 'addsuffix addprefix join wildcard realpath abspath error warning '
	        + 'shell origin flavor foreach if or and call eval file value' },
	    contains: [ VARIABLE ]
	  };
	  /* Variable assignment */
	  const ASSIGNMENT = { begin: '^' + hljs.UNDERSCORE_IDENT_RE + '\\s*(?=[:+?]?=)' };
	  /* Meta targets (.PHONY) */
	  const META = {
	    className: 'meta',
	    begin: /^\.PHONY:/,
	    end: /$/,
	    keywords: {
	      $pattern: /[\.\w]+/,
	      keyword: '.PHONY'
	    }
	  };
	  /* Targets */
	  const TARGET = {
	    className: 'section',
	    begin: /^[^\s]+:/,
	    end: /$/,
	    contains: [ VARIABLE ]
	  };
	  return {
	    name: 'Makefile',
	    aliases: [
	      'mk',
	      'mak',
	      'make',
	    ],
	    keywords: {
	      $pattern: /[\w-]+/,
	      keyword: 'define endef undefine ifdef ifndef ifeq ifneq else endif '
	      + 'include -include sinclude override export unexport private vpath'
	    },
	    contains: [
	      hljs.HASH_COMMENT_MODE,
	      VARIABLE,
	      QUOTE_STRING,
	      FUNC,
	      ASSIGNMENT,
	      META,
	      TARGET
	    ]
	  };
	}

	makefile_1 = makefile;
	return makefile_1;
}

/*
Language: Perl
Author: Peter Leonov <gojpeg@yandex.ru>
Website: https://www.perl.org
Category: common
*/

var perl_1;
var hasRequiredPerl;

function requirePerl () {
	if (hasRequiredPerl) return perl_1;
	hasRequiredPerl = 1;
	/** @type LanguageFn */
	function perl(hljs) {
	  const regex = hljs.regex;
	  const KEYWORDS = [
	    'abs',
	    'accept',
	    'alarm',
	    'and',
	    'atan2',
	    'bind',
	    'binmode',
	    'bless',
	    'break',
	    'caller',
	    'chdir',
	    'chmod',
	    'chomp',
	    'chop',
	    'chown',
	    'chr',
	    'chroot',
	    'close',
	    'closedir',
	    'connect',
	    'continue',
	    'cos',
	    'crypt',
	    'dbmclose',
	    'dbmopen',
	    'defined',
	    'delete',
	    'die',
	    'do',
	    'dump',
	    'each',
	    'else',
	    'elsif',
	    'endgrent',
	    'endhostent',
	    'endnetent',
	    'endprotoent',
	    'endpwent',
	    'endservent',
	    'eof',
	    'eval',
	    'exec',
	    'exists',
	    'exit',
	    'exp',
	    'fcntl',
	    'fileno',
	    'flock',
	    'for',
	    'foreach',
	    'fork',
	    'format',
	    'formline',
	    'getc',
	    'getgrent',
	    'getgrgid',
	    'getgrnam',
	    'gethostbyaddr',
	    'gethostbyname',
	    'gethostent',
	    'getlogin',
	    'getnetbyaddr',
	    'getnetbyname',
	    'getnetent',
	    'getpeername',
	    'getpgrp',
	    'getpriority',
	    'getprotobyname',
	    'getprotobynumber',
	    'getprotoent',
	    'getpwent',
	    'getpwnam',
	    'getpwuid',
	    'getservbyname',
	    'getservbyport',
	    'getservent',
	    'getsockname',
	    'getsockopt',
	    'given',
	    'glob',
	    'gmtime',
	    'goto',
	    'grep',
	    'gt',
	    'hex',
	    'if',
	    'index',
	    'int',
	    'ioctl',
	    'join',
	    'keys',
	    'kill',
	    'last',
	    'lc',
	    'lcfirst',
	    'length',
	    'link',
	    'listen',
	    'local',
	    'localtime',
	    'log',
	    'lstat',
	    'lt',
	    'ma',
	    'map',
	    'mkdir',
	    'msgctl',
	    'msgget',
	    'msgrcv',
	    'msgsnd',
	    'my',
	    'ne',
	    'next',
	    'no',
	    'not',
	    'oct',
	    'open',
	    'opendir',
	    'or',
	    'ord',
	    'our',
	    'pack',
	    'package',
	    'pipe',
	    'pop',
	    'pos',
	    'print',
	    'printf',
	    'prototype',
	    'push',
	    'q|0',
	    'qq',
	    'quotemeta',
	    'qw',
	    'qx',
	    'rand',
	    'read',
	    'readdir',
	    'readline',
	    'readlink',
	    'readpipe',
	    'recv',
	    'redo',
	    'ref',
	    'rename',
	    'require',
	    'reset',
	    'return',
	    'reverse',
	    'rewinddir',
	    'rindex',
	    'rmdir',
	    'say',
	    'scalar',
	    'seek',
	    'seekdir',
	    'select',
	    'semctl',
	    'semget',
	    'semop',
	    'send',
	    'setgrent',
	    'sethostent',
	    'setnetent',
	    'setpgrp',
	    'setpriority',
	    'setprotoent',
	    'setpwent',
	    'setservent',
	    'setsockopt',
	    'shift',
	    'shmctl',
	    'shmget',
	    'shmread',
	    'shmwrite',
	    'shutdown',
	    'sin',
	    'sleep',
	    'socket',
	    'socketpair',
	    'sort',
	    'splice',
	    'split',
	    'sprintf',
	    'sqrt',
	    'srand',
	    'stat',
	    'state',
	    'study',
	    'sub',
	    'substr',
	    'symlink',
	    'syscall',
	    'sysopen',
	    'sysread',
	    'sysseek',
	    'system',
	    'syswrite',
	    'tell',
	    'telldir',
	    'tie',
	    'tied',
	    'time',
	    'times',
	    'tr',
	    'truncate',
	    'uc',
	    'ucfirst',
	    'umask',
	    'undef',
	    'unless',
	    'unlink',
	    'unpack',
	    'unshift',
	    'untie',
	    'until',
	    'use',
	    'utime',
	    'values',
	    'vec',
	    'wait',
	    'waitpid',
	    'wantarray',
	    'warn',
	    'when',
	    'while',
	    'write',
	    'x|0',
	    'xor',
	    'y|0'
	  ];

	  // https://perldoc.perl.org/perlre#Modifiers
	  const REGEX_MODIFIERS = /[dualxmsipngr]{0,12}/; // aa and xx are valid, making max length 12
	  const PERL_KEYWORDS = {
	    $pattern: /[\w.]+/,
	    keyword: KEYWORDS.join(" ")
	  };
	  const SUBST = {
	    className: 'subst',
	    begin: '[$@]\\{',
	    end: '\\}',
	    keywords: PERL_KEYWORDS
	  };
	  const METHOD = {
	    begin: /->\{/,
	    end: /\}/
	    // contains defined later
	  };
	  const VAR = { variants: [
	    { begin: /\$\d/ },
	    { begin: regex.concat(
	      /[$%@](\^\w\b|#\w+(::\w+)*|\{\w+\}|\w+(::\w*)*)/,
	      // negative look-ahead tries to avoid matching patterns that are not
	      // Perl at all like $ident$, @ident@, etc.
	      `(?![A-Za-z])(?![@$%])`
	    ) },
	    {
	      begin: /[$%@][^\s\w{]/,
	      relevance: 0
	    }
	  ] };
	  const STRING_CONTAINS = [
	    hljs.BACKSLASH_ESCAPE,
	    SUBST,
	    VAR
	  ];
	  const REGEX_DELIMS = [
	    /!/,
	    /\//,
	    /\|/,
	    /\?/,
	    /'/,
	    /"/, // valid but infrequent and weird
	    /#/ // valid but infrequent and weird
	  ];
	  /**
	   * @param {string|RegExp} prefix
	   * @param {string|RegExp} open
	   * @param {string|RegExp} close
	   */
	  const PAIRED_DOUBLE_RE = (prefix, open, close = '\\1') => {
	    const middle = (close === '\\1')
	      ? close
	      : regex.concat(close, open);
	    return regex.concat(
	      regex.concat("(?:", prefix, ")"),
	      open,
	      /(?:\\.|[^\\\/])*?/,
	      middle,
	      /(?:\\.|[^\\\/])*?/,
	      close,
	      REGEX_MODIFIERS
	    );
	  };
	  /**
	   * @param {string|RegExp} prefix
	   * @param {string|RegExp} open
	   * @param {string|RegExp} close
	   */
	  const PAIRED_RE = (prefix, open, close) => {
	    return regex.concat(
	      regex.concat("(?:", prefix, ")"),
	      open,
	      /(?:\\.|[^\\\/])*?/,
	      close,
	      REGEX_MODIFIERS
	    );
	  };
	  const PERL_DEFAULT_CONTAINS = [
	    VAR,
	    hljs.HASH_COMMENT_MODE,
	    hljs.COMMENT(
	      /^=\w/,
	      /=cut/,
	      { endsWithParent: true }
	    ),
	    METHOD,
	    {
	      className: 'string',
	      contains: STRING_CONTAINS,
	      variants: [
	        {
	          begin: 'q[qwxr]?\\s*\\(',
	          end: '\\)',
	          relevance: 5
	        },
	        {
	          begin: 'q[qwxr]?\\s*\\[',
	          end: '\\]',
	          relevance: 5
	        },
	        {
	          begin: 'q[qwxr]?\\s*\\{',
	          end: '\\}',
	          relevance: 5
	        },
	        {
	          begin: 'q[qwxr]?\\s*\\|',
	          end: '\\|',
	          relevance: 5
	        },
	        {
	          begin: 'q[qwxr]?\\s*<',
	          end: '>',
	          relevance: 5
	        },
	        {
	          begin: 'qw\\s+q',
	          end: 'q',
	          relevance: 5
	        },
	        {
	          begin: '\'',
	          end: '\'',
	          contains: [ hljs.BACKSLASH_ESCAPE ]
	        },
	        {
	          begin: '"',
	          end: '"'
	        },
	        {
	          begin: '`',
	          end: '`',
	          contains: [ hljs.BACKSLASH_ESCAPE ]
	        },
	        {
	          begin: /\{\w+\}/,
	          relevance: 0
	        },
	        {
	          begin: '-?\\w+\\s*=>',
	          relevance: 0
	        }
	      ]
	    },
	    {
	      className: 'number',
	      begin: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
	      relevance: 0
	    },
	    { // regexp container
	      begin: '(\\/\\/|' + hljs.RE_STARTERS_RE + '|\\b(split|return|print|reverse|grep)\\b)\\s*',
	      keywords: 'split return print reverse grep',
	      relevance: 0,
	      contains: [
	        hljs.HASH_COMMENT_MODE,
	        {
	          className: 'regexp',
	          variants: [
	            // allow matching common delimiters
	            { begin: PAIRED_DOUBLE_RE("s|tr|y", regex.either(...REGEX_DELIMS, { capture: true })) },
	            // and then paired delmis
	            { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\(", "\\)") },
	            { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\[", "\\]") },
	            { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\{", "\\}") }
	          ],
	          relevance: 2
	        },
	        {
	          className: 'regexp',
	          variants: [
	            {
	              // could be a comment in many languages so do not count
	              // as relevant
	              begin: /(m|qr)\/\//,
	              relevance: 0
	            },
	            // prefix is optional with /regex/
	            { begin: PAIRED_RE("(?:m|qr)?", /\//, /\//) },
	            // allow matching common delimiters
	            { begin: PAIRED_RE("m|qr", regex.either(...REGEX_DELIMS, { capture: true }), /\1/) },
	            // allow common paired delmins
	            { begin: PAIRED_RE("m|qr", /\(/, /\)/) },
	            { begin: PAIRED_RE("m|qr", /\[/, /\]/) },
	            { begin: PAIRED_RE("m|qr", /\{/, /\}/) }
	          ]
	        }
	      ]
	    },
	    {
	      className: 'function',
	      beginKeywords: 'sub',
	      end: '(\\s*\\(.*?\\))?[;{]',
	      excludeEnd: true,
	      relevance: 5,
	      contains: [ hljs.TITLE_MODE ]
	    },
	    {
	      begin: '-\\w\\b',
	      relevance: 0
	    },
	    {
	      begin: "^__DATA__$",
	      end: "^__END__$",
	      subLanguage: 'mojolicious',
	      contains: [
	        {
	          begin: "^@@.*",
	          end: "$",
	          className: "comment"
	        }
	      ]
	    }
	  ];
	  SUBST.contains = PERL_DEFAULT_CONTAINS;
	  METHOD.contains = PERL_DEFAULT_CONTAINS;

	  return {
	    name: 'Perl',
	    aliases: [
	      'pl',
	      'pm'
	    ],
	    keywords: PERL_KEYWORDS,
	    contains: PERL_DEFAULT_CONTAINS
	  };
	}

	perl_1 = perl;
	return perl_1;
}

/*
Language: Objective-C
Author: Valerii Hiora <valerii.hiora@gmail.com>
Contributors: Angel G. Olloqui <angelgarcia.mail@gmail.com>, Matt Diephouse <matt@diephouse.com>, Andrew Farmer <ahfarmer@gmail.com>, Minh Nguyễn <mxn@1ec5.org>
Website: https://developer.apple.com/documentation/objectivec
Category: common
*/

var objectivec_1;
var hasRequiredObjectivec;

function requireObjectivec () {
	if (hasRequiredObjectivec) return objectivec_1;
	hasRequiredObjectivec = 1;
	function objectivec(hljs) {
	  const API_CLASS = {
	    className: 'built_in',
	    begin: '\\b(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)\\w+'
	  };
	  const IDENTIFIER_RE = /[a-zA-Z@][a-zA-Z0-9_]*/;
	  const TYPES = [
	    "int",
	    "float",
	    "char",
	    "unsigned",
	    "signed",
	    "short",
	    "long",
	    "double",
	    "wchar_t",
	    "unichar",
	    "void",
	    "bool",
	    "BOOL",
	    "id|0",
	    "_Bool"
	  ];
	  const KWS = [
	    "while",
	    "export",
	    "sizeof",
	    "typedef",
	    "const",
	    "struct",
	    "for",
	    "union",
	    "volatile",
	    "static",
	    "mutable",
	    "if",
	    "do",
	    "return",
	    "goto",
	    "enum",
	    "else",
	    "break",
	    "extern",
	    "asm",
	    "case",
	    "default",
	    "register",
	    "explicit",
	    "typename",
	    "switch",
	    "continue",
	    "inline",
	    "readonly",
	    "assign",
	    "readwrite",
	    "self",
	    "@synchronized",
	    "id",
	    "typeof",
	    "nonatomic",
	    "IBOutlet",
	    "IBAction",
	    "strong",
	    "weak",
	    "copy",
	    "in",
	    "out",
	    "inout",
	    "bycopy",
	    "byref",
	    "oneway",
	    "__strong",
	    "__weak",
	    "__block",
	    "__autoreleasing",
	    "@private",
	    "@protected",
	    "@public",
	    "@try",
	    "@property",
	    "@end",
	    "@throw",
	    "@catch",
	    "@finally",
	    "@autoreleasepool",
	    "@synthesize",
	    "@dynamic",
	    "@selector",
	    "@optional",
	    "@required",
	    "@encode",
	    "@package",
	    "@import",
	    "@defs",
	    "@compatibility_alias",
	    "__bridge",
	    "__bridge_transfer",
	    "__bridge_retained",
	    "__bridge_retain",
	    "__covariant",
	    "__contravariant",
	    "__kindof",
	    "_Nonnull",
	    "_Nullable",
	    "_Null_unspecified",
	    "__FUNCTION__",
	    "__PRETTY_FUNCTION__",
	    "__attribute__",
	    "getter",
	    "setter",
	    "retain",
	    "unsafe_unretained",
	    "nonnull",
	    "nullable",
	    "null_unspecified",
	    "null_resettable",
	    "class",
	    "instancetype",
	    "NS_DESIGNATED_INITIALIZER",
	    "NS_UNAVAILABLE",
	    "NS_REQUIRES_SUPER",
	    "NS_RETURNS_INNER_POINTER",
	    "NS_INLINE",
	    "NS_AVAILABLE",
	    "NS_DEPRECATED",
	    "NS_ENUM",
	    "NS_OPTIONS",
	    "NS_SWIFT_UNAVAILABLE",
	    "NS_ASSUME_NONNULL_BEGIN",
	    "NS_ASSUME_NONNULL_END",
	    "NS_REFINED_FOR_SWIFT",
	    "NS_SWIFT_NAME",
	    "NS_SWIFT_NOTHROW",
	    "NS_DURING",
	    "NS_HANDLER",
	    "NS_ENDHANDLER",
	    "NS_VALUERETURN",
	    "NS_VOIDRETURN"
	  ];
	  const LITERALS = [
	    "false",
	    "true",
	    "FALSE",
	    "TRUE",
	    "nil",
	    "YES",
	    "NO",
	    "NULL"
	  ];
	  const BUILT_INS = [
	    "dispatch_once_t",
	    "dispatch_queue_t",
	    "dispatch_sync",
	    "dispatch_async",
	    "dispatch_once"
	  ];
	  const KEYWORDS = {
	    "variable.language": [
	      "this",
	      "super"
	    ],
	    $pattern: IDENTIFIER_RE,
	    keyword: KWS,
	    literal: LITERALS,
	    built_in: BUILT_INS,
	    type: TYPES
	  };
	  const CLASS_KEYWORDS = {
	    $pattern: IDENTIFIER_RE,
	    keyword: [
	      "@interface",
	      "@class",
	      "@protocol",
	      "@implementation"
	    ]
	  };
	  return {
	    name: 'Objective-C',
	    aliases: [
	      'mm',
	      'objc',
	      'obj-c',
	      'obj-c++',
	      'objective-c++'
	    ],
	    keywords: KEYWORDS,
	    illegal: '</',
	    contains: [
	      API_CLASS,
	      hljs.C_LINE_COMMENT_MODE,
	      hljs.C_BLOCK_COMMENT_MODE,
	      hljs.C_NUMBER_MODE,
	      hljs.QUOTE_STRING_MODE,
	      hljs.APOS_STRING_MODE,
	      {
	        className: 'string',
	        variants: [
	          {
	            begin: '@"',
	            end: '"',
	            illegal: '\\n',
	            contains: [ hljs.BACKSLASH_ESCAPE ]
	          }
	        ]
	      },
	      {
	        className: 'meta',
	        begin: /#\s*[a-z]+\b/,
	        end: /$/,
	        keywords: { keyword:
	            'if else elif endif define undef warning error line '
	            + 'pragma ifdef ifndef include' },
	        contains: [
	          {
	            begin: /\\\n/,
	            relevance: 0
	          },
	          hljs.inherit(hljs.QUOTE_STRING_MODE, { className: 'string' }),
	          {
	            className: 'string',
	            begin: /<.*?>/,
	            end: /$/,
	            illegal: '\\n'
	          },
	          hljs.C_LINE_COMMENT_MODE,
	          hljs.C_BLOCK_COMMENT_MODE
	        ]
	      },
	      {
	        className: 'class',
	        begin: '(' + CLASS_KEYWORDS.keyword.join('|') + ')\\b',
	        end: /(\{|$)/,
	        excludeEnd: true,
	        keywords: CLASS_KEYWORDS,
	        contains: [ hljs.UNDERSCORE_TITLE_MODE ]
	      },
	      {
	        begin: '\\.' + hljs.UNDERSCORE_IDENT_RE,
	        relevance: 0
	      }
	    ]
	  };
	}

	objectivec_1 = objectivec;
	return objectivec_1;
}

/*
Language: PHP
Author: Victor Karamzin <Victor.Karamzin@enterra-inc.com>
Contributors: Evgeny Stepanischev <imbolk@gmail.com>, Ivan Sagalaev <maniac@softwaremaniacs.org>
Website: https://www.php.net
Category: common
*/

var php_1;
var hasRequiredPhp;

function requirePhp () {
	if (hasRequiredPhp) return php_1;
	hasRequiredPhp = 1;
	/**
	 * @param {HLJSApi} hljs
	 * @returns {LanguageDetail}
	 * */
	function php(hljs) {
	  const regex = hljs.regex;
	  // negative look-ahead tries to avoid matching patterns that are not
	  // Perl at all like $ident$, @ident@, etc.
	  const NOT_PERL_ETC = /(?![A-Za-z0-9])(?![$])/;
	  const IDENT_RE = regex.concat(
	    /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
	    NOT_PERL_ETC);
	  // Will not detect camelCase classes
	  const PASCAL_CASE_CLASS_NAME_RE = regex.concat(
	    /(\\?[A-Z][a-z0-9_\x7f-\xff]+|\\?[A-Z]+(?=[A-Z][a-z0-9_\x7f-\xff])){1,}/,
	    NOT_PERL_ETC);
	  const VARIABLE = {
	    scope: 'variable',
	    match: '\\$+' + IDENT_RE,
	  };
	  const PREPROCESSOR = {
	    scope: 'meta',
	    variants: [
	      { begin: /<\?php/, relevance: 10 }, // boost for obvious PHP
	      { begin: /<\?=/ },
	      // less relevant per PSR-1 which says not to use short-tags
	      { begin: /<\?/, relevance: 0.1 },
	      { begin: /\?>/ } // end php tag
	    ]
	  };
	  const SUBST = {
	    scope: 'subst',
	    variants: [
	      { begin: /\$\w+/ },
	      {
	        begin: /\{\$/,
	        end: /\}/
	      }
	    ]
	  };
	  const SINGLE_QUOTED = hljs.inherit(hljs.APOS_STRING_MODE, { illegal: null, });
	  const DOUBLE_QUOTED = hljs.inherit(hljs.QUOTE_STRING_MODE, {
	    illegal: null,
	    contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST),
	  });

	  const HEREDOC = {
	    begin: /<<<[ \t]*(?:(\w+)|"(\w+)")\n/,
	    end: /[ \t]*(\w+)\b/,
	    contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST),
	    'on:begin': (m, resp) => { resp.data._beginMatch = m[1] || m[2]; },
	    'on:end': (m, resp) => { if (resp.data._beginMatch !== m[1]) resp.ignoreMatch(); },
	  };

	  const NOWDOC = hljs.END_SAME_AS_BEGIN({
	    begin: /<<<[ \t]*'(\w+)'\n/,
	    end: /[ \t]*(\w+)\b/,
	  });
	  // list of valid whitespaces because non-breaking space might be part of a IDENT_RE
	  const WHITESPACE = '[ \t\n]';
	  const STRING = {
	    scope: 'string',
	    variants: [
	      DOUBLE_QUOTED,
	      SINGLE_QUOTED,
	      HEREDOC,
	      NOWDOC
	    ]
	  };
	  const NUMBER = {
	    scope: 'number',
	    variants: [
	      { begin: `\\b0[bB][01]+(?:_[01]+)*\\b` }, // Binary w/ underscore support
	      { begin: `\\b0[oO][0-7]+(?:_[0-7]+)*\\b` }, // Octals w/ underscore support
	      { begin: `\\b0[xX][\\da-fA-F]+(?:_[\\da-fA-F]+)*\\b` }, // Hex w/ underscore support
	      // Decimals w/ underscore support, with optional fragments and scientific exponent (e) suffix.
	      { begin: `(?:\\b\\d+(?:_\\d+)*(\\.(?:\\d+(?:_\\d+)*))?|\\B\\.\\d+)(?:[eE][+-]?\\d+)?` }
	    ],
	    relevance: 0
	  };
	  const LITERALS = [
	    "false",
	    "null",
	    "true"
	  ];
	  const KWS = [
	    // Magic constants:
	    // <https://www.php.net/manual/en/language.constants.predefined.php>
	    "__CLASS__",
	    "__DIR__",
	    "__FILE__",
	    "__FUNCTION__",
	    "__COMPILER_HALT_OFFSET__",
	    "__LINE__",
	    "__METHOD__",
	    "__NAMESPACE__",
	    "__TRAIT__",
	    // Function that look like language construct or language construct that look like function:
	    // List of keywords that may not require parenthesis
	    "die",
	    "echo",
	    "exit",
	    "include",
	    "include_once",
	    "print",
	    "require",
	    "require_once",
	    // These are not language construct (function) but operate on the currently-executing function and can access the current symbol table
	    // 'compact extract func_get_arg func_get_args func_num_args get_called_class get_parent_class ' +
	    // Other keywords:
	    // <https://www.php.net/manual/en/reserved.php>
	    // <https://www.php.net/manual/en/language.types.type-juggling.php>
	    "array",
	    "abstract",
	    "and",
	    "as",
	    "binary",
	    "bool",
	    "boolean",
	    "break",
	    "callable",
	    "case",
	    "catch",
	    "class",
	    "clone",
	    "const",
	    "continue",
	    "declare",
	    "default",
	    "do",
	    "double",
	    "else",
	    "elseif",
	    "empty",
	    "enddeclare",
	    "endfor",
	    "endforeach",
	    "endif",
	    "endswitch",
	    "endwhile",
	    "enum",
	    "eval",
	    "extends",
	    "final",
	    "finally",
	    "float",
	    "for",
	    "foreach",
	    "from",
	    "global",
	    "goto",
	    "if",
	    "implements",
	    "instanceof",
	    "insteadof",
	    "int",
	    "integer",
	    "interface",
	    "isset",
	    "iterable",
	    "list",
	    "match|0",
	    "mixed",
	    "new",
	    "never",
	    "object",
	    "or",
	    "private",
	    "protected",
	    "public",
	    "readonly",
	    "real",
	    "return",
	    "string",
	    "switch",
	    "throw",
	    "trait",
	    "try",
	    "unset",
	    "use",
	    "var",
	    "void",
	    "while",
	    "xor",
	    "yield"
	  ];

	  const BUILT_INS = [
	    // Standard PHP library:
	    // <https://www.php.net/manual/en/book.spl.php>
	    "Error|0",
	    "AppendIterator",
	    "ArgumentCountError",
	    "ArithmeticError",
	    "ArrayIterator",
	    "ArrayObject",
	    "AssertionError",
	    "BadFunctionCallException",
	    "BadMethodCallException",
	    "CachingIterator",
	    "CallbackFilterIterator",
	    "CompileError",
	    "Countable",
	    "DirectoryIterator",
	    "DivisionByZeroError",
	    "DomainException",
	    "EmptyIterator",
	    "ErrorException",
	    "Exception",
	    "FilesystemIterator",
	    "FilterIterator",
	    "GlobIterator",
	    "InfiniteIterator",
	    "InvalidArgumentException",
	    "IteratorIterator",
	    "LengthException",
	    "LimitIterator",
	    "LogicException",
	    "MultipleIterator",
	    "NoRewindIterator",
	    "OutOfBoundsException",
	    "OutOfRangeException",
	    "OuterIterator",
	    "OverflowException",
	    "ParentIterator",
	    "ParseError",
	    "RangeException",
	    "RecursiveArrayIterator",
	    "RecursiveCachingIterator",
	    "RecursiveCallbackFilterIterator",
	    "RecursiveDirectoryIterator",
	    "RecursiveFilterIterator",
	    "RecursiveIterator",
	    "RecursiveIteratorIterator",
	    "RecursiveRegexIterator",
	    "RecursiveTreeIterator",
	    "RegexIterator",
	    "RuntimeException",
	    "SeekableIterator",
	    "SplDoublyLinkedList",
	    "SplFileInfo",
	    "SplFileObject",
	    "SplFixedArray",
	    "SplHeap",
	    "SplMaxHeap",
	    "SplMinHeap",
	    "SplObjectStorage",
	    "SplObserver",
	    "SplPriorityQueue",
	    "SplQueue",
	    "SplStack",
	    "SplSubject",
	    "SplTempFileObject",
	    "TypeError",
	    "UnderflowException",
	    "UnexpectedValueException",
	    "UnhandledMatchError",
	    // Reserved interfaces:
	    // <https://www.php.net/manual/en/reserved.interfaces.php>
	    "ArrayAccess",
	    "BackedEnum",
	    "Closure",
	    "Fiber",
	    "Generator",
	    "Iterator",
	    "IteratorAggregate",
	    "Serializable",
	    "Stringable",
	    "Throwable",
	    "Traversable",
	    "UnitEnum",
	    "WeakReference",
	    "WeakMap",
	    // Reserved classes:
	    // <https://www.php.net/manual/en/reserved.classes.php>
	    "Directory",
	    "__PHP_Incomplete_Class",
	    "parent",
	    "php_user_filter",
	    "self",
	    "static",
	    "stdClass"
	  ];

	  /** Dual-case keywords
	   *
	   * ["then","FILE"] =>
	   *     ["then", "THEN", "FILE", "file"]
	   *
	   * @param {string[]} items */
	  const dualCase = (items) => {
	    /** @type string[] */
	    const result = [];
	    items.forEach(item => {
	      result.push(item);
	      if (item.toLowerCase() === item) {
	        result.push(item.toUpperCase());
	      } else {
	        result.push(item.toLowerCase());
	      }
	    });
	    return result;
	  };

	  const KEYWORDS = {
	    keyword: KWS,
	    literal: dualCase(LITERALS),
	    built_in: BUILT_INS,
	  };

	  /**
	   * @param {string[]} items */
	  const normalizeKeywords = (items) => {
	    return items.map(item => {
	      return item.replace(/\|\d+$/, "");
	    });
	  };

	  const CONSTRUCTOR_CALL = { variants: [
	    {
	      match: [
	        /new/,
	        regex.concat(WHITESPACE, "+"),
	        // to prevent built ins from being confused as the class constructor call
	        regex.concat("(?!", normalizeKeywords(BUILT_INS).join("\\b|"), "\\b)"),
	        PASCAL_CASE_CLASS_NAME_RE,
	      ],
	      scope: {
	        1: "keyword",
	        4: "title.class",
	      },
	    }
	  ] };

	  const CONSTANT_REFERENCE = regex.concat(IDENT_RE, "\\b(?!\\()");

	  const LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON = { variants: [
	    {
	      match: [
	        regex.concat(
	          /::/,
	          regex.lookahead(/(?!class\b)/)
	        ),
	        CONSTANT_REFERENCE,
	      ],
	      scope: { 2: "variable.constant", },
	    },
	    {
	      match: [
	        /::/,
	        /class/,
	      ],
	      scope: { 2: "variable.language", },
	    },
	    {
	      match: [
	        PASCAL_CASE_CLASS_NAME_RE,
	        regex.concat(
	          /::/,
	          regex.lookahead(/(?!class\b)/)
	        ),
	        CONSTANT_REFERENCE,
	      ],
	      scope: {
	        1: "title.class",
	        3: "variable.constant",
	      },
	    },
	    {
	      match: [
	        PASCAL_CASE_CLASS_NAME_RE,
	        regex.concat(
	          "::",
	          regex.lookahead(/(?!class\b)/)
	        ),
	      ],
	      scope: { 1: "title.class", },
	    },
	    {
	      match: [
	        PASCAL_CASE_CLASS_NAME_RE,
	        /::/,
	        /class/,
	      ],
	      scope: {
	        1: "title.class",
	        3: "variable.language",
	      },
	    }
	  ] };

	  const NAMED_ARGUMENT = {
	    scope: 'attr',
	    match: regex.concat(IDENT_RE, regex.lookahead(':'), regex.lookahead(/(?!::)/)),
	  };
	  const PARAMS_MODE = {
	    relevance: 0,
	    begin: /\(/,
	    end: /\)/,
	    keywords: KEYWORDS,
	    contains: [
	      NAMED_ARGUMENT,
	      VARIABLE,
	      LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
	      hljs.C_BLOCK_COMMENT_MODE,
	      STRING,
	      NUMBER,
	      CONSTRUCTOR_CALL,
	    ],
	  };
	  const FUNCTION_INVOKE = {
	    relevance: 0,
	    match: [
	      /\b/,
	      // to prevent keywords from being confused as the function title
	      regex.concat("(?!fn\\b|function\\b|", normalizeKeywords(KWS).join("\\b|"), "|", normalizeKeywords(BUILT_INS).join("\\b|"), "\\b)"),
	      IDENT_RE,
	      regex.concat(WHITESPACE, "*"),
	      regex.lookahead(/(?=\()/)
	    ],
	    scope: { 3: "title.function.invoke", },
	    contains: [ PARAMS_MODE ]
	  };
	  PARAMS_MODE.contains.push(FUNCTION_INVOKE);

	  const ATTRIBUTE_CONTAINS = [
	    NAMED_ARGUMENT,
	    LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
	    hljs.C_BLOCK_COMMENT_MODE,
	    STRING,
	    NUMBER,
	    CONSTRUCTOR_CALL,
	  ];

	  const ATTRIBUTES = {
	    begin: regex.concat(/#\[\s*/, PASCAL_CASE_CLASS_NAME_RE),
	    beginScope: "meta",
	    end: /]/,
	    endScope: "meta",
	    keywords: {
	      literal: LITERALS,
	      keyword: [
	        'new',
	        'array',
	      ]
	    },
	    contains: [
	      {
	        begin: /\[/,
	        end: /]/,
	        keywords: {
	          literal: LITERALS,
	          keyword: [
	            'new',
	            'array',
	          ]
	        },
	        contains: [
	          'self',
	          ...ATTRIBUTE_CONTAINS,
	        ]
	      },
	      ...ATTRIBUTE_CONTAINS,
	      {
	        scope: 'meta',
	        match: PASCAL_CASE_CLASS_NAME_RE
	      }
	    ]
	  };

	  return {
	    case_insensitive: false,
	    keywords: KEYWORDS,
	    contains: [
	      ATTRIBUTES,
	      hljs.HASH_COMMENT_MODE,
	      hljs.COMMENT('//', '$'),
	      hljs.COMMENT(
	        '/\\*',
	        '\\*/',
	        { contains: [
	          {
	            scope: 'doctag',
	            match: '@[A-Za-z]+'
	          }
	        ] }
	      ),
	      {
	        match: /__halt_compiler\(\);/,
	        keywords: '__halt_compiler',
	        starts: {
	          scope: "comment",
	          end: hljs.MATCH_NOTHING_RE,
	          contains: [
	            {
	              match: /\?>/,
	              scope: "meta",
	              endsParent: true
	            }
	          ]
	        }
	      },
	      PREPROCESSOR,
	      {
	        scope: 'variable.language',
	        match: /\$this\b/
	      },
	      VARIABLE,
	      FUNCTION_INVOKE,
	      LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
	      {
	        match: [
	          /const/,
	          /\s/,
	          IDENT_RE,
	        ],
	        scope: {
	          1: "keyword",
	          3: "variable.constant",
	        },
	      },
	      CONSTRUCTOR_CALL,
	      {
	        scope: 'function',
	        relevance: 0,
	        beginKeywords: 'fn function',
	        end: /[;{]/,
	        excludeEnd: true,
	        illegal: '[$%\\[]',
	        contains: [
	          { beginKeywords: 'use', },
	          hljs.UNDERSCORE_TITLE_MODE,
	          {
	            begin: '=>', // No markup, just a relevance booster
	            endsParent: true
	          },
	          {
	            scope: 'params',
	            begin: '\\(',
	            end: '\\)',
	            excludeBegin: true,
	            excludeEnd: true,
	            keywords: KEYWORDS,
	            contains: [
	              'self',
	              VARIABLE,
	              LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
	              hljs.C_BLOCK_COMMENT_MODE,
	              STRING,
	              NUMBER
	            ]
	          },
	        ]
	      },
	      {
	        scope: 'class',
	        variants: [
	          {
	            beginKeywords: "enum",
	            illegal: /[($"]/
	          },
	          {
	            beginKeywords: "class interface trait",
	            illegal: /[:($"]/
	          }
	        ],
	        relevance: 0,
	        end: /\{/,
	        excludeEnd: true,
	        contains: [
	          { beginKeywords: 'extends implements' },
	          hljs.UNDERSCORE_TITLE_MODE
	        ]
	      },
	      // both use and namespace still use "old style" rules (vs multi-match)
	      // because the namespace name can include `\` and we still want each
	      // element to be treated as its own *individual* title
	      {
	        beginKeywords: 'namespace',
	        relevance: 0,
	        end: ';',
	        illegal: /[.']/,
	        contains: [ hljs.inherit(hljs.UNDERSCORE_TITLE_MODE, { scope: "title.class" }) ]
	      },
	      {
	        beginKeywords: 'use',
	        relevance: 0,
	        end: ';',
	        contains: [
	          // TODO: title.function vs title.class
	          {
	            match: /\b(as|const|function)\b/,
	            scope: "keyword"
	          },
	          // TODO: could be title.class or title.function
	          hljs.UNDERSCORE_TITLE_MODE
	        ]
	      },
	      STRING,
	      NUMBER,
	    ]
	  };
	}

	php_1 = php;
	return php_1;
}

/*
Language: PHP Template
Requires: xml.js, php.js
Author: Josh Goebel <hello@joshgoebel.com>
Website: https://www.php.net
Category: common
*/

var phpTemplate_1;
var hasRequiredPhpTemplate;

function requirePhpTemplate () {
	if (hasRequiredPhpTemplate) return phpTemplate_1;
	hasRequiredPhpTemplate = 1;
	function phpTemplate(hljs) {
	  return {
	    name: "PHP template",
	    subLanguage: 'xml',
	    contains: [
	      {
	        begin: /<\?(php|=)?/,
	        end: /\?>/,
	        subLanguage: 'php',
	        contains: [
	          // We don't want the php closing tag ?> to close the PHP block when
	          // inside any of the following blocks:
	          {
	            begin: '/\\*',
	            end: '\\*/',
	            skip: true
	          },
	          {
	            begin: 'b"',
	            end: '"',
	            skip: true
	          },
	          {
	            begin: 'b\'',
	            end: '\'',
	            skip: true
	          },
	          hljs.inherit(hljs.APOS_STRING_MODE, {
	            illegal: null,
	            className: null,
	            contains: null,
	            skip: true
	          }),
	          hljs.inherit(hljs.QUOTE_STRING_MODE, {
	            illegal: null,
	            className: null,
	            contains: null,
	            skip: true
	          })
	        ]
	      }
	    ]
	  };
	}

	phpTemplate_1 = phpTemplate;
	return phpTemplate_1;
}

/*
Language: Plain text
Author: Egor Rogov (e.rogov@postgrespro.ru)
Description: Plain text without any highlighting.
Category: common
*/

var plaintext_1;
var hasRequiredPlaintext;

function requirePlaintext () {
	if (hasRequiredPlaintext) return plaintext_1;
	hasRequiredPlaintext = 1;
	function plaintext(hljs) {
	  return {
	    name: 'Plain text',
	    aliases: [
	      'text',
	      'txt'
	    ],
	    disableAutodetect: true
	  };
	}

	plaintext_1 = plaintext;
	return plaintext_1;
}

/*
Language: Python
Description: Python is an interpreted, object-oriented, high-level programming language with dynamic semantics.
Website: https://www.python.org
Category: common
*/

var python_1;
var hasRequiredPython;

function requirePython () {
	if (hasRequiredPython) return python_1;
	hasRequiredPython = 1;
	function python(hljs) {
	  const regex = hljs.regex;
	  const IDENT_RE = /[\p{XID_Start}_]\p{XID_Continue}*/u;
	  const RESERVED_WORDS = [
	    'and',
	    'as',
	    'assert',
	    'async',
	    'await',
	    'break',
	    'case',
	    'class',
	    'continue',
	    'def',
	    'del',
	    'elif',
	    'else',
	    'except',
	    'finally',
	    'for',
	    'from',
	    'global',
	    'if',
	    'import',
	    'in',
	    'is',
	    'lambda',
	    'match',
	    'nonlocal|10',
	    'not',
	    'or',
	    'pass',
	    'raise',
	    'return',
	    'try',
	    'while',
	    'with',
	    'yield'
	  ];

	  const BUILT_INS = [
	    '__import__',
	    'abs',
	    'all',
	    'any',
	    'ascii',
	    'bin',
	    'bool',
	    'breakpoint',
	    'bytearray',
	    'bytes',
	    'callable',
	    'chr',
	    'classmethod',
	    'compile',
	    'complex',
	    'delattr',
	    'dict',
	    'dir',
	    'divmod',
	    'enumerate',
	    'eval',
	    'exec',
	    'filter',
	    'float',
	    'format',
	    'frozenset',
	    'getattr',
	    'globals',
	    'hasattr',
	    'hash',
	    'help',
	    'hex',
	    'id',
	    'input',
	    'int',
	    'isinstance',
	    'issubclass',
	    'iter',
	    'len',
	    'list',
	    'locals',
	    'map',
	    'max',
	    'memoryview',
	    'min',
	    'next',
	    'object',
	    'oct',
	    'open',
	    'ord',
	    'pow',
	    'print',
	    'property',
	    'range',
	    'repr',
	    'reversed',
	    'round',
	    'set',
	    'setattr',
	    'slice',
	    'sorted',
	    'staticmethod',
	    'str',
	    'sum',
	    'super',
	    'tuple',
	    'type',
	    'vars',
	    'zip'
	  ];

	  const LITERALS = [
	    '__debug__',
	    'Ellipsis',
	    'False',
	    'None',
	    'NotImplemented',
	    'True'
	  ];

	  // https://docs.python.org/3/library/typing.html
	  // TODO: Could these be supplemented by a CamelCase matcher in certain
	  // contexts, leaving these remaining only for relevance hinting?
	  const TYPES = [
	    "Any",
	    "Callable",
	    "Coroutine",
	    "Dict",
	    "List",
	    "Literal",
	    "Generic",
	    "Optional",
	    "Sequence",
	    "Set",
	    "Tuple",
	    "Type",
	    "Union"
	  ];

	  const KEYWORDS = {
	    $pattern: /[A-Za-z]\w+|__\w+__/,
	    keyword: RESERVED_WORDS,
	    built_in: BUILT_INS,
	    literal: LITERALS,
	    type: TYPES
	  };

	  const PROMPT = {
	    className: 'meta',
	    begin: /^(>>>|\.\.\.) /
	  };

	  const SUBST = {
	    className: 'subst',
	    begin: /\{/,
	    end: /\}/,
	    keywords: KEYWORDS,
	    illegal: /#/
	  };

	  const LITERAL_BRACKET = {
	    begin: /\{\{/,
	    relevance: 0
	  };

	  const STRING = {
	    className: 'string',
	    contains: [ hljs.BACKSLASH_ESCAPE ],
	    variants: [
	      {
	        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
	        end: /'''/,
	        contains: [
	          hljs.BACKSLASH_ESCAPE,
	          PROMPT
	        ],
	        relevance: 10
	      },
	      {
	        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
	        end: /"""/,
	        contains: [
	          hljs.BACKSLASH_ESCAPE,
	          PROMPT
	        ],
	        relevance: 10
	      },
	      {
	        begin: /([fF][rR]|[rR][fF]|[fF])'''/,
	        end: /'''/,
	        contains: [
	          hljs.BACKSLASH_ESCAPE,
	          PROMPT,
	          LITERAL_BRACKET,
	          SUBST
	        ]
	      },
	      {
	        begin: /([fF][rR]|[rR][fF]|[fF])"""/,
	        end: /"""/,
	        contains: [
	          hljs.BACKSLASH_ESCAPE,
	          PROMPT,
	          LITERAL_BRACKET,
	          SUBST
	        ]
	      },
	      {
	        begin: /([uU]|[rR])'/,
	        end: /'/,
	        relevance: 10
	      },
	      {
	        begin: /([uU]|[rR])"/,
	        end: /"/,
	        relevance: 10
	      },
	      {
	        begin: /([bB]|[bB][rR]|[rR][bB])'/,
	        end: /'/
	      },
	      {
	        begin: /([bB]|[bB][rR]|[rR][bB])"/,
	        end: /"/
	      },
	      {
	        begin: /([fF][rR]|[rR][fF]|[fF])'/,
	        end: /'/,
	        contains: [
	          hljs.BACKSLASH_ESCAPE,
	          LITERAL_BRACKET,
	          SUBST
	        ]
	      },
	      {
	        begin: /([fF][rR]|[rR][fF]|[fF])"/,
	        end: /"/,
	        contains: [
	          hljs.BACKSLASH_ESCAPE,
	          LITERAL_BRACKET,
	          SUBST
	        ]
	      },
	      hljs.APOS_STRING_MODE,
	      hljs.QUOTE_STRING_MODE
	    ]
	  };

	  // https://docs.python.org/3.9/reference/lexical_analysis.html#numeric-literals
	  const digitpart = '[0-9](_?[0-9])*';
	  const pointfloat = `(\\b(${digitpart}))?\\.(${digitpart})|\\b(${digitpart})\\.`;
	  // Whitespace after a number (or any lexical token) is needed only if its absence
	  // would change the tokenization
	  // https://docs.python.org/3.9/reference/lexical_analysis.html#whitespace-between-tokens
	  // We deviate slightly, requiring a word boundary or a keyword
	  // to avoid accidentally recognizing *prefixes* (e.g., `0` in `0x41` or `08` or `0__1`)
	  const lookahead = `\\b|${RESERVED_WORDS.join('|')}`;
	  const NUMBER = {
	    className: 'number',
	    relevance: 0,
	    variants: [
	      // exponentfloat, pointfloat
	      // https://docs.python.org/3.9/reference/lexical_analysis.html#floating-point-literals
	      // optionally imaginary
	      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
	      // Note: no leading \b because floats can start with a decimal point
	      // and we don't want to mishandle e.g. `fn(.5)`,
	      // no trailing \b for pointfloat because it can end with a decimal point
	      // and we don't want to mishandle e.g. `0..hex()`; this should be safe
	      // because both MUST contain a decimal point and so cannot be confused with
	      // the interior part of an identifier
	      {
	        begin: `(\\b(${digitpart})|(${pointfloat}))[eE][+-]?(${digitpart})[jJ]?(?=${lookahead})`
	      },
	      {
	        begin: `(${pointfloat})[jJ]?`
	      },

	      // decinteger, bininteger, octinteger, hexinteger
	      // https://docs.python.org/3.9/reference/lexical_analysis.html#integer-literals
	      // optionally "long" in Python 2
	      // https://docs.python.org/2.7/reference/lexical_analysis.html#integer-and-long-integer-literals
	      // decinteger is optionally imaginary
	      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
	      {
	        begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${lookahead})`
	      },
	      {
	        begin: `\\b0[bB](_?[01])+[lL]?(?=${lookahead})`
	      },
	      {
	        begin: `\\b0[oO](_?[0-7])+[lL]?(?=${lookahead})`
	      },
	      {
	        begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${lookahead})`
	      },

	      // imagnumber (digitpart-based)
	      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
	      {
	        begin: `\\b(${digitpart})[jJ](?=${lookahead})`
	      }
	    ]
	  };
	  const COMMENT_TYPE = {
	    className: "comment",
	    begin: regex.lookahead(/# type:/),
	    end: /$/,
	    keywords: KEYWORDS,
	    contains: [
	      { // prevent keywords from coloring `type`
	        begin: /# type:/
	      },
	      // comment within a datatype comment includes no keywords
	      {
	        begin: /#/,
	        end: /\b\B/,
	        endsWithParent: true
	      }
	    ]
	  };
	  const PARAMS = {
	    className: 'params',
	    variants: [
	      // Exclude params in functions without params
	      {
	        className: "",
	        begin: /\(\s*\)/,
	        skip: true
	      },
	      {
	        begin: /\(/,
	        end: /\)/,
	        excludeBegin: true,
	        excludeEnd: true,
	        keywords: KEYWORDS,
	        contains: [
	          'self',
	          PROMPT,
	          NUMBER,
	          STRING,
	          hljs.HASH_COMMENT_MODE
	        ]
	      }
	    ]
	  };
	  SUBST.contains = [
	    STRING,
	    NUMBER,
	    PROMPT
	  ];

	  return {
	    name: 'Python',
	    aliases: [
	      'py',
	      'gyp',
	      'ipython'
	    ],
	    unicodeRegex: true,
	    keywords: KEYWORDS,
	    illegal: /(<\/|\?)|=>/,
	    contains: [
	      PROMPT,
	      NUMBER,
	      {
	        // very common convention
	        begin: /\bself\b/
	      },
	      {
	        // eat "if" prior to string so that it won't accidentally be
	        // labeled as an f-string
	        beginKeywords: "if",
	        relevance: 0
	      },
	      STRING,
	      COMMENT_TYPE,
	      hljs.HASH_COMMENT_MODE,
	      {
	        match: [
	          /\bdef/, /\s+/,
	          IDENT_RE,
	        ],
	        scope: {
	          1: "keyword",
	          3: "title.function"
	        },
	        contains: [ PARAMS ]
	      },
	      {
	        variants: [
	          {
	            match: [
	              /\bclass/, /\s+/,
	              IDENT_RE, /\s*/,
	              /\(\s*/, IDENT_RE,/\s*\)/
	            ],
	          },
	          {
	            match: [
	              /\bclass/, /\s+/,
	              IDENT_RE
	            ],
	          }
	        ],
	        scope: {
	          1: "keyword",
	          3: "title.class",
	          6: "title.class.inherited",
	        }
	      },
	      {
	        className: 'meta',
	        begin: /^[\t ]*@/,
	        end: /(?=#)|$/,
	        contains: [
	          NUMBER,
	          PARAMS,
	          STRING
	        ]
	      }
	    ]
	  };
	}

	python_1 = python;
	return python_1;
}

/*
Language: Python REPL
Requires: python.js
Author: Josh Goebel <hello@joshgoebel.com>
Category: common
*/

var pythonRepl_1;
var hasRequiredPythonRepl;

function requirePythonRepl () {
	if (hasRequiredPythonRepl) return pythonRepl_1;
	hasRequiredPythonRepl = 1;
	function pythonRepl(hljs) {
	  return {
	    aliases: [ 'pycon' ],
	    contains: [
	      {
	        className: 'meta.prompt',
	        starts: {
	          // a space separates the REPL prefix from the actual code
	          // this is purely for cleaner HTML output
	          end: / |$/,
	          starts: {
	            end: '$',
	            subLanguage: 'python'
	          }
	        },
	        variants: [
	          { begin: /^>>>(?=[ ]|$)/ },
	          { begin: /^\.\.\.(?=[ ]|$)/ }
	        ]
	      }
	    ]
	  };
	}

	pythonRepl_1 = pythonRepl;
	return pythonRepl_1;
}

/*
Language: R
Description: R is a free software environment for statistical computing and graphics.
Author: Joe Cheng <joe@rstudio.org>
Contributors: Konrad Rudolph <konrad.rudolph@gmail.com>
Website: https://www.r-project.org
Category: common,scientific
*/

var r_1;
var hasRequiredR;

function requireR () {
	if (hasRequiredR) return r_1;
	hasRequiredR = 1;
	/** @type LanguageFn */
	function r(hljs) {
	  const regex = hljs.regex;
	  // Identifiers in R cannot start with `_`, but they can start with `.` if it
	  // is not immediately followed by a digit.
	  // R also supports quoted identifiers, which are near-arbitrary sequences
	  // delimited by backticks (`…`), which may contain escape sequences. These are
	  // handled in a separate mode. See `test/markup/r/names.txt` for examples.
	  // FIXME: Support Unicode identifiers.
	  const IDENT_RE = /(?:(?:[a-zA-Z]|\.[._a-zA-Z])[._a-zA-Z0-9]*)|\.(?!\d)/;
	  const NUMBER_TYPES_RE = regex.either(
	    // Special case: only hexadecimal binary powers can contain fractions
	    /0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*[pP][+-]?\d+i?/,
	    // Hexadecimal numbers without fraction and optional binary power
	    /0[xX][0-9a-fA-F]+(?:[pP][+-]?\d+)?[Li]?/,
	    // Decimal numbers
	    /(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?[Li]?/
	  );
	  const OPERATORS_RE = /[=!<>:]=|\|\||&&|:::?|<-|<<-|->>|->|\|>|[-+*\/?!$&|:<=>@^~]|\*\*/;
	  const PUNCTUATION_RE = regex.either(
	    /[()]/,
	    /[{}]/,
	    /\[\[/,
	    /[[\]]/,
	    /\\/,
	    /,/
	  );

	  return {
	    name: 'R',

	    keywords: {
	      $pattern: IDENT_RE,
	      keyword:
	        'function if in break next repeat else for while',
	      literal:
	        'NULL NA TRUE FALSE Inf NaN NA_integer_|10 NA_real_|10 '
	        + 'NA_character_|10 NA_complex_|10',
	      built_in:
	        // Builtin constants
	        'LETTERS letters month.abb month.name pi T F '
	        // Primitive functions
	        // These are all the functions in `base` that are implemented as a
	        // `.Primitive`, minus those functions that are also keywords.
	        + 'abs acos acosh all any anyNA Arg as.call as.character '
	        + 'as.complex as.double as.environment as.integer as.logical '
	        + 'as.null.default as.numeric as.raw asin asinh atan atanh attr '
	        + 'attributes baseenv browser c call ceiling class Conj cos cosh '
	        + 'cospi cummax cummin cumprod cumsum digamma dim dimnames '
	        + 'emptyenv exp expression floor forceAndCall gamma gc.time '
	        + 'globalenv Im interactive invisible is.array is.atomic is.call '
	        + 'is.character is.complex is.double is.environment is.expression '
	        + 'is.finite is.function is.infinite is.integer is.language '
	        + 'is.list is.logical is.matrix is.na is.name is.nan is.null '
	        + 'is.numeric is.object is.pairlist is.raw is.recursive is.single '
	        + 'is.symbol lazyLoadDBfetch length lgamma list log max min '
	        + 'missing Mod names nargs nzchar oldClass on.exit pos.to.env '
	        + 'proc.time prod quote range Re rep retracemem return round '
	        + 'seq_along seq_len seq.int sign signif sin sinh sinpi sqrt '
	        + 'standardGeneric substitute sum switch tan tanh tanpi tracemem '
	        + 'trigamma trunc unclass untracemem UseMethod xtfrm',
	    },

	    contains: [
	      // Roxygen comments
	      hljs.COMMENT(
	        /#'/,
	        /$/,
	        { contains: [
	          {
	            // Handle `@examples` separately to cause all subsequent code
	            // until the next `@`-tag on its own line to be kept as-is,
	            // preventing highlighting. This code is example R code, so nested
	            // doctags shouldn’t be treated as such. See
	            // `test/markup/r/roxygen.txt` for an example.
	            scope: 'doctag',
	            match: /@examples/,
	            starts: {
	              end: regex.lookahead(regex.either(
	                // end if another doc comment
	                /\n^#'\s*(?=@[a-zA-Z]+)/,
	                // or a line with no comment
	                /\n^(?!#')/
	              )),
	              endsParent: true
	            }
	          },
	          {
	            // Handle `@param` to highlight the parameter name following
	            // after.
	            scope: 'doctag',
	            begin: '@param',
	            end: /$/,
	            contains: [
	              {
	                scope: 'variable',
	                variants: [
	                  { match: IDENT_RE },
	                  { match: /`(?:\\.|[^`\\])+`/ }
	                ],
	                endsParent: true
	              }
	            ]
	          },
	          {
	            scope: 'doctag',
	            match: /@[a-zA-Z]+/
	          },
	          {
	            scope: 'keyword',
	            match: /\\[a-zA-Z]+/
	          }
	        ] }
	      ),

	      hljs.HASH_COMMENT_MODE,

	      {
	        scope: 'string',
	        contains: [ hljs.BACKSLASH_ESCAPE ],
	        variants: [
	          hljs.END_SAME_AS_BEGIN({
	            begin: /[rR]"(-*)\(/,
	            end: /\)(-*)"/
	          }),
	          hljs.END_SAME_AS_BEGIN({
	            begin: /[rR]"(-*)\{/,
	            end: /\}(-*)"/
	          }),
	          hljs.END_SAME_AS_BEGIN({
	            begin: /[rR]"(-*)\[/,
	            end: /\](-*)"/
	          }),
	          hljs.END_SAME_AS_BEGIN({
	            begin: /[rR]'(-*)\(/,
	            end: /\)(-*)'/
	          }),
	          hljs.END_SAME_AS_BEGIN({
	            begin: /[rR]'(-*)\{/,
	            end: /\}(-*)'/
	          }),
	          hljs.END_SAME_AS_BEGIN({
	            begin: /[rR]'(-*)\[/,
	            end: /\](-*)'/
	          }),
	          {
	            begin: '"',
	            end: '"',
	            relevance: 0
	          },
	          {
	            begin: "'",
	            end: "'",
	            relevance: 0
	          }
	        ],
	      },

	      // Matching numbers immediately following punctuation and operators is
	      // tricky since we need to look at the character ahead of a number to
	      // ensure the number is not part of an identifier, and we cannot use
	      // negative look-behind assertions. So instead we explicitly handle all
	      // possible combinations of (operator|punctuation), number.
	      // TODO: replace with negative look-behind when available
	      // { begin: /(?<![a-zA-Z0-9._])0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*[pP][+-]?\d+i?/ },
	      // { begin: /(?<![a-zA-Z0-9._])0[xX][0-9a-fA-F]+([pP][+-]?\d+)?[Li]?/ },
	      // { begin: /(?<![a-zA-Z0-9._])(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?[Li]?/ }
	      {
	        relevance: 0,
	        variants: [
	          {
	            scope: {
	              1: 'operator',
	              2: 'number'
	            },
	            match: [
	              OPERATORS_RE,
	              NUMBER_TYPES_RE
	            ]
	          },
	          {
	            scope: {
	              1: 'operator',
	              2: 'number'
	            },
	            match: [
	              /%[^%]*%/,
	              NUMBER_TYPES_RE
	            ]
	          },
	          {
	            scope: {
	              1: 'punctuation',
	              2: 'number'
	            },
	            match: [
	              PUNCTUATION_RE,
	              NUMBER_TYPES_RE
	            ]
	          },
	          {
	            scope: { 2: 'number' },
	            match: [
	              /[^a-zA-Z0-9._]|^/, // not part of an identifier, or start of document
	              NUMBER_TYPES_RE
	            ]
	          }
	        ]
	      },

	      // Operators/punctuation when they're not directly followed by numbers
	      {
	        // Relevance boost for the most common assignment form.
	        scope: { 3: 'operator' },
	        match: [
	          IDENT_RE,
	          /\s+/,
	          /<-/,
	          /\s+/
	        ]
	      },

	      {
	        scope: 'operator',
	        relevance: 0,
	        variants: [
	          { match: OPERATORS_RE },
	          { match: /%[^%]*%/ }
	        ]
	      },

	      {
	        scope: 'punctuation',
	        relevance: 0,
	        match: PUNCTUATION_RE
	      },

	      {
	        // Escaped identifier
	        begin: '`',
	        end: '`',
	        contains: [ { begin: /\\./ } ]
	      }
	    ]
	  };
	}

	r_1 = r;
	return r_1;
}

/*
Language: Rust
Author: Andrey Vlasovskikh <andrey.vlasovskikh@gmail.com>
Contributors: Roman Shmatov <romanshmatov@gmail.com>, Kasper Andersen <kma_untrusted@protonmail.com>
Website: https://www.rust-lang.org
Category: common, system
*/

var rust_1;
var hasRequiredRust;

function requireRust () {
	if (hasRequiredRust) return rust_1;
	hasRequiredRust = 1;
	/** @type LanguageFn */
	function rust(hljs) {
	  const regex = hljs.regex;
	  const FUNCTION_INVOKE = {
	    className: "title.function.invoke",
	    relevance: 0,
	    begin: regex.concat(
	      /\b/,
	      /(?!let|for|while|if|else|match\b)/,
	      hljs.IDENT_RE,
	      regex.lookahead(/\s*\(/))
	  };
	  const NUMBER_SUFFIX = '([ui](8|16|32|64|128|size)|f(32|64))\?';
	  const KEYWORDS = [
	    "abstract",
	    "as",
	    "async",
	    "await",
	    "become",
	    "box",
	    "break",
	    "const",
	    "continue",
	    "crate",
	    "do",
	    "dyn",
	    "else",
	    "enum",
	    "extern",
	    "false",
	    "final",
	    "fn",
	    "for",
	    "if",
	    "impl",
	    "in",
	    "let",
	    "loop",
	    "macro",
	    "match",
	    "mod",
	    "move",
	    "mut",
	    "override",
	    "priv",
	    "pub",
	    "ref",
	    "return",
	    "self",
	    "Self",
	    "static",
	    "struct",
	    "super",
	    "trait",
	    "true",
	    "try",
	    "type",
	    "typeof",
	    "unsafe",
	    "unsized",
	    "use",
	    "virtual",
	    "where",
	    "while",
	    "yield"
	  ];
	  const LITERALS = [
	    "true",
	    "false",
	    "Some",
	    "None",
	    "Ok",
	    "Err"
	  ];
	  const BUILTINS = [
	    // functions
	    'drop ',
	    // traits
	    "Copy",
	    "Send",
	    "Sized",
	    "Sync",
	    "Drop",
	    "Fn",
	    "FnMut",
	    "FnOnce",
	    "ToOwned",
	    "Clone",
	    "Debug",
	    "PartialEq",
	    "PartialOrd",
	    "Eq",
	    "Ord",
	    "AsRef",
	    "AsMut",
	    "Into",
	    "From",
	    "Default",
	    "Iterator",
	    "Extend",
	    "IntoIterator",
	    "DoubleEndedIterator",
	    "ExactSizeIterator",
	    "SliceConcatExt",
	    "ToString",
	    // macros
	    "assert!",
	    "assert_eq!",
	    "bitflags!",
	    "bytes!",
	    "cfg!",
	    "col!",
	    "concat!",
	    "concat_idents!",
	    "debug_assert!",
	    "debug_assert_eq!",
	    "env!",
	    "eprintln!",
	    "panic!",
	    "file!",
	    "format!",
	    "format_args!",
	    "include_bytes!",
	    "include_str!",
	    "line!",
	    "local_data_key!",
	    "module_path!",
	    "option_env!",
	    "print!",
	    "println!",
	    "select!",
	    "stringify!",
	    "try!",
	    "unimplemented!",
	    "unreachable!",
	    "vec!",
	    "write!",
	    "writeln!",
	    "macro_rules!",
	    "assert_ne!",
	    "debug_assert_ne!"
	  ];
	  const TYPES = [
	    "i8",
	    "i16",
	    "i32",
	    "i64",
	    "i128",
	    "isize",
	    "u8",
	    "u16",
	    "u32",
	    "u64",
	    "u128",
	    "usize",
	    "f32",
	    "f64",
	    "str",
	    "char",
	    "bool",
	    "Box",
	    "Option",
	    "Result",
	    "String",
	    "Vec"
	  ];
	  return {
	    name: 'Rust',
	    aliases: [ 'rs' ],
	    keywords: {
	      $pattern: hljs.IDENT_RE + '!?',
	      type: TYPES,
	      keyword: KEYWORDS,
	      literal: LITERALS,
	      built_in: BUILTINS
	    },
	    illegal: '</',
	    contains: [
	      hljs.C_LINE_COMMENT_MODE,
	      hljs.COMMENT('/\\*', '\\*/', { contains: [ 'self' ] }),
	      hljs.inherit(hljs.QUOTE_STRING_MODE, {
	        begin: /b?"/,
	        illegal: null
	      }),
	      {
	        className: 'string',
	        variants: [
	          { begin: /b?r(#*)"(.|\n)*?"\1(?!#)/ },
	          { begin: /b?'\\?(x\w{2}|u\w{4}|U\w{8}|.)'/ }
	        ]
	      },
	      {
	        className: 'symbol',
	        begin: /'[a-zA-Z_][a-zA-Z0-9_]*/
	      },
	      {
	        className: 'number',
	        variants: [
	          { begin: '\\b0b([01_]+)' + NUMBER_SUFFIX },
	          { begin: '\\b0o([0-7_]+)' + NUMBER_SUFFIX },
	          { begin: '\\b0x([A-Fa-f0-9_]+)' + NUMBER_SUFFIX },
	          { begin: '\\b(\\d[\\d_]*(\\.[0-9_]+)?([eE][+-]?[0-9_]+)?)'
	                   + NUMBER_SUFFIX }
	        ],
	        relevance: 0
	      },
	      {
	        begin: [
	          /fn/,
	          /\s+/,
	          hljs.UNDERSCORE_IDENT_RE
	        ],
	        className: {
	          1: "keyword",
	          3: "title.function"
	        }
	      },
	      {
	        className: 'meta',
	        begin: '#!?\\[',
	        end: '\\]',
	        contains: [
	          {
	            className: 'string',
	            begin: /"/,
	            end: /"/
	          }
	        ]
	      },
	      {
	        begin: [
	          /let/,
	          /\s+/,
	          /(?:mut\s+)?/,
	          hljs.UNDERSCORE_IDENT_RE
	        ],
	        className: {
	          1: "keyword",
	          3: "keyword",
	          4: "variable"
	        }
	      },
	      // must come before impl/for rule later
	      {
	        begin: [
	          /for/,
	          /\s+/,
	          hljs.UNDERSCORE_IDENT_RE,
	          /\s+/,
	          /in/
	        ],
	        className: {
	          1: "keyword",
	          3: "variable",
	          5: "keyword"
	        }
	      },
	      {
	        begin: [
	          /type/,
	          /\s+/,
	          hljs.UNDERSCORE_IDENT_RE
	        ],
	        className: {
	          1: "keyword",
	          3: "title.class"
	        }
	      },
	      {
	        begin: [
	          /(?:trait|enum|struct|union|impl|for)/,
	          /\s+/,
	          hljs.UNDERSCORE_IDENT_RE
	        ],
	        className: {
	          1: "keyword",
	          3: "title.class"
	        }
	      },
	      {
	        begin: hljs.IDENT_RE + '::',
	        keywords: {
	          keyword: "Self",
	          built_in: BUILTINS,
	          type: TYPES
	        }
	      },
	      {
	        className: "punctuation",
	        begin: '->'
	      },
	      FUNCTION_INVOKE
	    ]
	  };
	}

	rust_1 = rust;
	return rust_1;
}

var scss_1;
var hasRequiredScss;

function requireScss () {
	if (hasRequiredScss) return scss_1;
	hasRequiredScss = 1;
	const MODES = (hljs) => {
	  return {
	    IMPORTANT: {
	      scope: 'meta',
	      begin: '!important'
	    },
	    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
	    HEXCOLOR: {
	      scope: 'number',
	      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
	    },
	    FUNCTION_DISPATCH: {
	      className: "built_in",
	      begin: /[\w-]+(?=\()/
	    },
	    ATTRIBUTE_SELECTOR_MODE: {
	      scope: 'selector-attr',
	      begin: /\[/,
	      end: /\]/,
	      illegal: '$',
	      contains: [
	        hljs.APOS_STRING_MODE,
	        hljs.QUOTE_STRING_MODE
	      ]
	    },
	    CSS_NUMBER_MODE: {
	      scope: 'number',
	      begin: hljs.NUMBER_RE + '(' +
	        '%|em|ex|ch|rem' +
	        '|vw|vh|vmin|vmax' +
	        '|cm|mm|in|pt|pc|px' +
	        '|deg|grad|rad|turn' +
	        '|s|ms' +
	        '|Hz|kHz' +
	        '|dpi|dpcm|dppx' +
	        ')?',
	      relevance: 0
	    },
	    CSS_VARIABLE: {
	      className: "attr",
	      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
	    }
	  };
	};

	const TAGS = [
	  'a',
	  'abbr',
	  'address',
	  'article',
	  'aside',
	  'audio',
	  'b',
	  'blockquote',
	  'body',
	  'button',
	  'canvas',
	  'caption',
	  'cite',
	  'code',
	  'dd',
	  'del',
	  'details',
	  'dfn',
	  'div',
	  'dl',
	  'dt',
	  'em',
	  'fieldset',
	  'figcaption',
	  'figure',
	  'footer',
	  'form',
	  'h1',
	  'h2',
	  'h3',
	  'h4',
	  'h5',
	  'h6',
	  'header',
	  'hgroup',
	  'html',
	  'i',
	  'iframe',
	  'img',
	  'input',
	  'ins',
	  'kbd',
	  'label',
	  'legend',
	  'li',
	  'main',
	  'mark',
	  'menu',
	  'nav',
	  'object',
	  'ol',
	  'p',
	  'q',
	  'quote',
	  'samp',
	  'section',
	  'span',
	  'strong',
	  'summary',
	  'sup',
	  'table',
	  'tbody',
	  'td',
	  'textarea',
	  'tfoot',
	  'th',
	  'thead',
	  'time',
	  'tr',
	  'ul',
	  'var',
	  'video'
	];

	const MEDIA_FEATURES = [
	  'any-hover',
	  'any-pointer',
	  'aspect-ratio',
	  'color',
	  'color-gamut',
	  'color-index',
	  'device-aspect-ratio',
	  'device-height',
	  'device-width',
	  'display-mode',
	  'forced-colors',
	  'grid',
	  'height',
	  'hover',
	  'inverted-colors',
	  'monochrome',
	  'orientation',
	  'overflow-block',
	  'overflow-inline',
	  'pointer',
	  'prefers-color-scheme',
	  'prefers-contrast',
	  'prefers-reduced-motion',
	  'prefers-reduced-transparency',
	  'resolution',
	  'scan',
	  'scripting',
	  'update',
	  'width',
	  // TODO: find a better solution?
	  'min-width',
	  'max-width',
	  'min-height',
	  'max-height'
	];

	// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
	const PSEUDO_CLASSES = [
	  'active',
	  'any-link',
	  'blank',
	  'checked',
	  'current',
	  'default',
	  'defined',
	  'dir', // dir()
	  'disabled',
	  'drop',
	  'empty',
	  'enabled',
	  'first',
	  'first-child',
	  'first-of-type',
	  'fullscreen',
	  'future',
	  'focus',
	  'focus-visible',
	  'focus-within',
	  'has', // has()
	  'host', // host or host()
	  'host-context', // host-context()
	  'hover',
	  'indeterminate',
	  'in-range',
	  'invalid',
	  'is', // is()
	  'lang', // lang()
	  'last-child',
	  'last-of-type',
	  'left',
	  'link',
	  'local-link',
	  'not', // not()
	  'nth-child', // nth-child()
	  'nth-col', // nth-col()
	  'nth-last-child', // nth-last-child()
	  'nth-last-col', // nth-last-col()
	  'nth-last-of-type', //nth-last-of-type()
	  'nth-of-type', //nth-of-type()
	  'only-child',
	  'only-of-type',
	  'optional',
	  'out-of-range',
	  'past',
	  'placeholder-shown',
	  'read-only',
	  'read-write',
	  'required',
	  'right',
	  'root',
	  'scope',
	  'target',
	  'target-within',
	  'user-invalid',
	  'valid',
	  'visited',
	  'where' // where()
	];

	// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
	const PSEUDO_ELEMENTS = [
	  'after',
	  'backdrop',
	  'before',
	  'cue',
	  'cue-region',
	  'first-letter',
	  'first-line',
	  'grammar-error',
	  'marker',
	  'part',
	  'placeholder',
	  'selection',
	  'slotted',
	  'spelling-error'
	];

	const ATTRIBUTES = [
	  'align-content',
	  'align-items',
	  'align-self',
	  'all',
	  'animation',
	  'animation-delay',
	  'animation-direction',
	  'animation-duration',
	  'animation-fill-mode',
	  'animation-iteration-count',
	  'animation-name',
	  'animation-play-state',
	  'animation-timing-function',
	  'backface-visibility',
	  'background',
	  'background-attachment',
	  'background-blend-mode',
	  'background-clip',
	  'background-color',
	  'background-image',
	  'background-origin',
	  'background-position',
	  'background-repeat',
	  'background-size',
	  'block-size',
	  'border',
	  'border-block',
	  'border-block-color',
	  'border-block-end',
	  'border-block-end-color',
	  'border-block-end-style',
	  'border-block-end-width',
	  'border-block-start',
	  'border-block-start-color',
	  'border-block-start-style',
	  'border-block-start-width',
	  'border-block-style',
	  'border-block-width',
	  'border-bottom',
	  'border-bottom-color',
	  'border-bottom-left-radius',
	  'border-bottom-right-radius',
	  'border-bottom-style',
	  'border-bottom-width',
	  'border-collapse',
	  'border-color',
	  'border-image',
	  'border-image-outset',
	  'border-image-repeat',
	  'border-image-slice',
	  'border-image-source',
	  'border-image-width',
	  'border-inline',
	  'border-inline-color',
	  'border-inline-end',
	  'border-inline-end-color',
	  'border-inline-end-style',
	  'border-inline-end-width',
	  'border-inline-start',
	  'border-inline-start-color',
	  'border-inline-start-style',
	  'border-inline-start-width',
	  'border-inline-style',
	  'border-inline-width',
	  'border-left',
	  'border-left-color',
	  'border-left-style',
	  'border-left-width',
	  'border-radius',
	  'border-right',
	  'border-right-color',
	  'border-right-style',
	  'border-right-width',
	  'border-spacing',
	  'border-style',
	  'border-top',
	  'border-top-color',
	  'border-top-left-radius',
	  'border-top-right-radius',
	  'border-top-style',
	  'border-top-width',
	  'border-width',
	  'bottom',
	  'box-decoration-break',
	  'box-shadow',
	  'box-sizing',
	  'break-after',
	  'break-before',
	  'break-inside',
	  'caption-side',
	  'caret-color',
	  'clear',
	  'clip',
	  'clip-path',
	  'clip-rule',
	  'color',
	  'column-count',
	  'column-fill',
	  'column-gap',
	  'column-rule',
	  'column-rule-color',
	  'column-rule-style',
	  'column-rule-width',
	  'column-span',
	  'column-width',
	  'columns',
	  'contain',
	  'content',
	  'content-visibility',
	  'counter-increment',
	  'counter-reset',
	  'cue',
	  'cue-after',
	  'cue-before',
	  'cursor',
	  'direction',
	  'display',
	  'empty-cells',
	  'filter',
	  'flex',
	  'flex-basis',
	  'flex-direction',
	  'flex-flow',
	  'flex-grow',
	  'flex-shrink',
	  'flex-wrap',
	  'float',
	  'flow',
	  'font',
	  'font-display',
	  'font-family',
	  'font-feature-settings',
	  'font-kerning',
	  'font-language-override',
	  'font-size',
	  'font-size-adjust',
	  'font-smoothing',
	  'font-stretch',
	  'font-style',
	  'font-synthesis',
	  'font-variant',
	  'font-variant-caps',
	  'font-variant-east-asian',
	  'font-variant-ligatures',
	  'font-variant-numeric',
	  'font-variant-position',
	  'font-variation-settings',
	  'font-weight',
	  'gap',
	  'glyph-orientation-vertical',
	  'grid',
	  'grid-area',
	  'grid-auto-columns',
	  'grid-auto-flow',
	  'grid-auto-rows',
	  'grid-column',
	  'grid-column-end',
	  'grid-column-start',
	  'grid-gap',
	  'grid-row',
	  'grid-row-end',
	  'grid-row-start',
	  'grid-template',
	  'grid-template-areas',
	  'grid-template-columns',
	  'grid-template-rows',
	  'hanging-punctuation',
	  'height',
	  'hyphens',
	  'icon',
	  'image-orientation',
	  'image-rendering',
	  'image-resolution',
	  'ime-mode',
	  'inline-size',
	  'isolation',
	  'justify-content',
	  'left',
	  'letter-spacing',
	  'line-break',
	  'line-height',
	  'list-style',
	  'list-style-image',
	  'list-style-position',
	  'list-style-type',
	  'margin',
	  'margin-block',
	  'margin-block-end',
	  'margin-block-start',
	  'margin-bottom',
	  'margin-inline',
	  'margin-inline-end',
	  'margin-inline-start',
	  'margin-left',
	  'margin-right',
	  'margin-top',
	  'marks',
	  'mask',
	  'mask-border',
	  'mask-border-mode',
	  'mask-border-outset',
	  'mask-border-repeat',
	  'mask-border-slice',
	  'mask-border-source',
	  'mask-border-width',
	  'mask-clip',
	  'mask-composite',
	  'mask-image',
	  'mask-mode',
	  'mask-origin',
	  'mask-position',
	  'mask-repeat',
	  'mask-size',
	  'mask-type',
	  'max-block-size',
	  'max-height',
	  'max-inline-size',
	  'max-width',
	  'min-block-size',
	  'min-height',
	  'min-inline-size',
	  'min-width',
	  'mix-blend-mode',
	  'nav-down',
	  'nav-index',
	  'nav-left',
	  'nav-right',
	  'nav-up',
	  'none',
	  'normal',
	  'object-fit',
	  'object-position',
	  'opacity',
	  'order',
	  'orphans',
	  'outline',
	  'outline-color',
	  'outline-offset',
	  'outline-style',
	  'outline-width',
	  'overflow',
	  'overflow-wrap',
	  'overflow-x',
	  'overflow-y',
	  'padding',
	  'padding-block',
	  'padding-block-end',
	  'padding-block-start',
	  'padding-bottom',
	  'padding-inline',
	  'padding-inline-end',
	  'padding-inline-start',
	  'padding-left',
	  'padding-right',
	  'padding-top',
	  'page-break-after',
	  'page-break-before',
	  'page-break-inside',
	  'pause',
	  'pause-after',
	  'pause-before',
	  'perspective',
	  'perspective-origin',
	  'pointer-events',
	  'position',
	  'quotes',
	  'resize',
	  'rest',
	  'rest-after',
	  'rest-before',
	  'right',
	  'row-gap',
	  'scroll-margin',
	  'scroll-margin-block',
	  'scroll-margin-block-end',
	  'scroll-margin-block-start',
	  'scroll-margin-bottom',
	  'scroll-margin-inline',
	  'scroll-margin-inline-end',
	  'scroll-margin-inline-start',
	  'scroll-margin-left',
	  'scroll-margin-right',
	  'scroll-margin-top',
	  'scroll-padding',
	  'scroll-padding-block',
	  'scroll-padding-block-end',
	  'scroll-padding-block-start',
	  'scroll-padding-bottom',
	  'scroll-padding-inline',
	  'scroll-padding-inline-end',
	  'scroll-padding-inline-start',
	  'scroll-padding-left',
	  'scroll-padding-right',
	  'scroll-padding-top',
	  'scroll-snap-align',
	  'scroll-snap-stop',
	  'scroll-snap-type',
	  'scrollbar-color',
	  'scrollbar-gutter',
	  'scrollbar-width',
	  'shape-image-threshold',
	  'shape-margin',
	  'shape-outside',
	  'speak',
	  'speak-as',
	  'src', // @font-face
	  'tab-size',
	  'table-layout',
	  'text-align',
	  'text-align-all',
	  'text-align-last',
	  'text-combine-upright',
	  'text-decoration',
	  'text-decoration-color',
	  'text-decoration-line',
	  'text-decoration-style',
	  'text-emphasis',
	  'text-emphasis-color',
	  'text-emphasis-position',
	  'text-emphasis-style',
	  'text-indent',
	  'text-justify',
	  'text-orientation',
	  'text-overflow',
	  'text-rendering',
	  'text-shadow',
	  'text-transform',
	  'text-underline-position',
	  'top',
	  'transform',
	  'transform-box',
	  'transform-origin',
	  'transform-style',
	  'transition',
	  'transition-delay',
	  'transition-duration',
	  'transition-property',
	  'transition-timing-function',
	  'unicode-bidi',
	  'vertical-align',
	  'visibility',
	  'voice-balance',
	  'voice-duration',
	  'voice-family',
	  'voice-pitch',
	  'voice-range',
	  'voice-rate',
	  'voice-stress',
	  'voice-volume',
	  'white-space',
	  'widows',
	  'width',
	  'will-change',
	  'word-break',
	  'word-spacing',
	  'word-wrap',
	  'writing-mode',
	  'z-index'
	  // reverse makes sure longer attributes `font-weight` are matched fully
	  // instead of getting false positives on say `font`
	].reverse();

	/*
	Language: SCSS
	Description: Scss is an extension of the syntax of CSS.
	Author: Kurt Emch <kurt@kurtemch.com>
	Website: https://sass-lang.com
	Category: common, css, web
	*/


	/** @type LanguageFn */
	function scss(hljs) {
	  const modes = MODES(hljs);
	  const PSEUDO_ELEMENTS$1 = PSEUDO_ELEMENTS;
	  const PSEUDO_CLASSES$1 = PSEUDO_CLASSES;

	  const AT_IDENTIFIER = '@[a-z-]+'; // @font-face
	  const AT_MODIFIERS = "and or not only";
	  const IDENT_RE = '[a-zA-Z-][a-zA-Z0-9_-]*';
	  const VARIABLE = {
	    className: 'variable',
	    begin: '(\\$' + IDENT_RE + ')\\b',
	    relevance: 0
	  };

	  return {
	    name: 'SCSS',
	    case_insensitive: true,
	    illegal: '[=/|\']',
	    contains: [
	      hljs.C_LINE_COMMENT_MODE,
	      hljs.C_BLOCK_COMMENT_MODE,
	      // to recognize keyframe 40% etc which are outside the scope of our
	      // attribute value mode
	      modes.CSS_NUMBER_MODE,
	      {
	        className: 'selector-id',
	        begin: '#[A-Za-z0-9_-]+',
	        relevance: 0
	      },
	      {
	        className: 'selector-class',
	        begin: '\\.[A-Za-z0-9_-]+',
	        relevance: 0
	      },
	      modes.ATTRIBUTE_SELECTOR_MODE,
	      {
	        className: 'selector-tag',
	        begin: '\\b(' + TAGS.join('|') + ')\\b',
	        // was there, before, but why?
	        relevance: 0
	      },
	      {
	        className: 'selector-pseudo',
	        begin: ':(' + PSEUDO_CLASSES$1.join('|') + ')'
	      },
	      {
	        className: 'selector-pseudo',
	        begin: ':(:)?(' + PSEUDO_ELEMENTS$1.join('|') + ')'
	      },
	      VARIABLE,
	      { // pseudo-selector params
	        begin: /\(/,
	        end: /\)/,
	        contains: [ modes.CSS_NUMBER_MODE ]
	      },
	      modes.CSS_VARIABLE,
	      {
	        className: 'attribute',
	        begin: '\\b(' + ATTRIBUTES.join('|') + ')\\b'
	      },
	      { begin: '\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b' },
	      {
	        begin: /:/,
	        end: /[;}{]/,
	        relevance: 0,
	        contains: [
	          modes.BLOCK_COMMENT,
	          VARIABLE,
	          modes.HEXCOLOR,
	          modes.CSS_NUMBER_MODE,
	          hljs.QUOTE_STRING_MODE,
	          hljs.APOS_STRING_MODE,
	          modes.IMPORTANT,
	          modes.FUNCTION_DISPATCH
	        ]
	      },
	      // matching these here allows us to treat them more like regular CSS
	      // rules so everything between the {} gets regular rule highlighting,
	      // which is what we want for page and font-face
	      {
	        begin: '@(page|font-face)',
	        keywords: {
	          $pattern: AT_IDENTIFIER,
	          keyword: '@page @font-face'
	        }
	      },
	      {
	        begin: '@',
	        end: '[{;]',
	        returnBegin: true,
	        keywords: {
	          $pattern: /[a-z-]+/,
	          keyword: AT_MODIFIERS,
	          attribute: MEDIA_FEATURES.join(" ")
	        },
	        contains: [
	          {
	            begin: AT_IDENTIFIER,
	            className: "keyword"
	          },
	          {
	            begin: /[a-z-]+(?=:)/,
	            className: "attribute"
	          },
	          VARIABLE,
	          hljs.QUOTE_STRING_MODE,
	          hljs.APOS_STRING_MODE,
	          modes.HEXCOLOR,
	          modes.CSS_NUMBER_MODE
	        ]
	      },
	      modes.FUNCTION_DISPATCH
	    ]
	  };
	}

	scss_1 = scss;
	return scss_1;
}

/*
Language: Shell Session
Requires: bash.js
Author: TSUYUSATO Kitsune <make.just.on@gmail.com>
Category: common
Audit: 2020
*/

var shell_1;
var hasRequiredShell;

function requireShell () {
	if (hasRequiredShell) return shell_1;
	hasRequiredShell = 1;
	/** @type LanguageFn */
	function shell(hljs) {
	  return {
	    name: 'Shell Session',
	    aliases: [
	      'console',
	      'shellsession'
	    ],
	    contains: [
	      {
	        className: 'meta.prompt',
	        // We cannot add \s (spaces) in the regular expression otherwise it will be too broad and produce unexpected result.
	        // For instance, in the following example, it would match "echo /path/to/home >" as a prompt:
	        // echo /path/to/home > t.exe
	        begin: /^\s{0,3}[/~\w\d[\]()@-]*[>%$#][ ]?/,
	        starts: {
	          end: /[^\\](?=\s*$)/,
	          subLanguage: 'bash'
	        }
	      }
	    ]
	  };
	}

	shell_1 = shell;
	return shell_1;
}

/*
 Language: SQL
 Website: https://en.wikipedia.org/wiki/SQL
 Category: common, database
 */

var sql_1;
var hasRequiredSql;

function requireSql () {
	if (hasRequiredSql) return sql_1;
	hasRequiredSql = 1;
	/*

	Goals:

	SQL is intended to highlight basic/common SQL keywords and expressions

	- If pretty much every single SQL server includes supports, then it's a canidate.
	- It is NOT intended to include tons of vendor specific keywords (Oracle, MySQL,
	  PostgreSQL) although the list of data types is purposely a bit more expansive.
	- For more specific SQL grammars please see:
	  - PostgreSQL and PL/pgSQL - core
	  - T-SQL - https://github.com/highlightjs/highlightjs-tsql
	  - sql_more (core)

	 */

	function sql(hljs) {
	  const regex = hljs.regex;
	  const COMMENT_MODE = hljs.COMMENT('--', '$');
	  const STRING = {
	    className: 'string',
	    variants: [
	      {
	        begin: /'/,
	        end: /'/,
	        contains: [ { begin: /''/ } ]
	      }
	    ]
	  };
	  const QUOTED_IDENTIFIER = {
	    begin: /"/,
	    end: /"/,
	    contains: [ { begin: /""/ } ]
	  };

	  const LITERALS = [
	    "true",
	    "false",
	    // Not sure it's correct to call NULL literal, and clauses like IS [NOT] NULL look strange that way.
	    // "null",
	    "unknown"
	  ];

	  const MULTI_WORD_TYPES = [
	    "double precision",
	    "large object",
	    "with timezone",
	    "without timezone"
	  ];

	  const TYPES = [
	    'bigint',
	    'binary',
	    'blob',
	    'boolean',
	    'char',
	    'character',
	    'clob',
	    'date',
	    'dec',
	    'decfloat',
	    'decimal',
	    'float',
	    'int',
	    'integer',
	    'interval',
	    'nchar',
	    'nclob',
	    'national',
	    'numeric',
	    'real',
	    'row',
	    'smallint',
	    'time',
	    'timestamp',
	    'varchar',
	    'varying', // modifier (character varying)
	    'varbinary'
	  ];

	  const NON_RESERVED_WORDS = [
	    "add",
	    "asc",
	    "collation",
	    "desc",
	    "final",
	    "first",
	    "last",
	    "view"
	  ];

	  // https://jakewheat.github.io/sql-overview/sql-2016-foundation-grammar.html#reserved-word
	  const RESERVED_WORDS = [
	    "abs",
	    "acos",
	    "all",
	    "allocate",
	    "alter",
	    "and",
	    "any",
	    "are",
	    "array",
	    "array_agg",
	    "array_max_cardinality",
	    "as",
	    "asensitive",
	    "asin",
	    "asymmetric",
	    "at",
	    "atan",
	    "atomic",
	    "authorization",
	    "avg",
	    "begin",
	    "begin_frame",
	    "begin_partition",
	    "between",
	    "bigint",
	    "binary",
	    "blob",
	    "boolean",
	    "both",
	    "by",
	    "call",
	    "called",
	    "cardinality",
	    "cascaded",
	    "case",
	    "cast",
	    "ceil",
	    "ceiling",
	    "char",
	    "char_length",
	    "character",
	    "character_length",
	    "check",
	    "classifier",
	    "clob",
	    "close",
	    "coalesce",
	    "collate",
	    "collect",
	    "column",
	    "commit",
	    "condition",
	    "connect",
	    "constraint",
	    "contains",
	    "convert",
	    "copy",
	    "corr",
	    "corresponding",
	    "cos",
	    "cosh",
	    "count",
	    "covar_pop",
	    "covar_samp",
	    "create",
	    "cross",
	    "cube",
	    "cume_dist",
	    "current",
	    "current_catalog",
	    "current_date",
	    "current_default_transform_group",
	    "current_path",
	    "current_role",
	    "current_row",
	    "current_schema",
	    "current_time",
	    "current_timestamp",
	    "current_path",
	    "current_role",
	    "current_transform_group_for_type",
	    "current_user",
	    "cursor",
	    "cycle",
	    "date",
	    "day",
	    "deallocate",
	    "dec",
	    "decimal",
	    "decfloat",
	    "declare",
	    "default",
	    "define",
	    "delete",
	    "dense_rank",
	    "deref",
	    "describe",
	    "deterministic",
	    "disconnect",
	    "distinct",
	    "double",
	    "drop",
	    "dynamic",
	    "each",
	    "element",
	    "else",
	    "empty",
	    "end",
	    "end_frame",
	    "end_partition",
	    "end-exec",
	    "equals",
	    "escape",
	    "every",
	    "except",
	    "exec",
	    "execute",
	    "exists",
	    "exp",
	    "external",
	    "extract",
	    "false",
	    "fetch",
	    "filter",
	    "first_value",
	    "float",
	    "floor",
	    "for",
	    "foreign",
	    "frame_row",
	    "free",
	    "from",
	    "full",
	    "function",
	    "fusion",
	    "get",
	    "global",
	    "grant",
	    "group",
	    "grouping",
	    "groups",
	    "having",
	    "hold",
	    "hour",
	    "identity",
	    "in",
	    "indicator",
	    "initial",
	    "inner",
	    "inout",
	    "insensitive",
	    "insert",
	    "int",
	    "integer",
	    "intersect",
	    "intersection",
	    "interval",
	    "into",
	    "is",
	    "join",
	    "json_array",
	    "json_arrayagg",
	    "json_exists",
	    "json_object",
	    "json_objectagg",
	    "json_query",
	    "json_table",
	    "json_table_primitive",
	    "json_value",
	    "lag",
	    "language",
	    "large",
	    "last_value",
	    "lateral",
	    "lead",
	    "leading",
	    "left",
	    "like",
	    "like_regex",
	    "listagg",
	    "ln",
	    "local",
	    "localtime",
	    "localtimestamp",
	    "log",
	    "log10",
	    "lower",
	    "match",
	    "match_number",
	    "match_recognize",
	    "matches",
	    "max",
	    "member",
	    "merge",
	    "method",
	    "min",
	    "minute",
	    "mod",
	    "modifies",
	    "module",
	    "month",
	    "multiset",
	    "national",
	    "natural",
	    "nchar",
	    "nclob",
	    "new",
	    "no",
	    "none",
	    "normalize",
	    "not",
	    "nth_value",
	    "ntile",
	    "null",
	    "nullif",
	    "numeric",
	    "octet_length",
	    "occurrences_regex",
	    "of",
	    "offset",
	    "old",
	    "omit",
	    "on",
	    "one",
	    "only",
	    "open",
	    "or",
	    "order",
	    "out",
	    "outer",
	    "over",
	    "overlaps",
	    "overlay",
	    "parameter",
	    "partition",
	    "pattern",
	    "per",
	    "percent",
	    "percent_rank",
	    "percentile_cont",
	    "percentile_disc",
	    "period",
	    "portion",
	    "position",
	    "position_regex",
	    "power",
	    "precedes",
	    "precision",
	    "prepare",
	    "primary",
	    "procedure",
	    "ptf",
	    "range",
	    "rank",
	    "reads",
	    "real",
	    "recursive",
	    "ref",
	    "references",
	    "referencing",
	    "regr_avgx",
	    "regr_avgy",
	    "regr_count",
	    "regr_intercept",
	    "regr_r2",
	    "regr_slope",
	    "regr_sxx",
	    "regr_sxy",
	    "regr_syy",
	    "release",
	    "result",
	    "return",
	    "returns",
	    "revoke",
	    "right",
	    "rollback",
	    "rollup",
	    "row",
	    "row_number",
	    "rows",
	    "running",
	    "savepoint",
	    "scope",
	    "scroll",
	    "search",
	    "second",
	    "seek",
	    "select",
	    "sensitive",
	    "session_user",
	    "set",
	    "show",
	    "similar",
	    "sin",
	    "sinh",
	    "skip",
	    "smallint",
	    "some",
	    "specific",
	    "specifictype",
	    "sql",
	    "sqlexception",
	    "sqlstate",
	    "sqlwarning",
	    "sqrt",
	    "start",
	    "static",
	    "stddev_pop",
	    "stddev_samp",
	    "submultiset",
	    "subset",
	    "substring",
	    "substring_regex",
	    "succeeds",
	    "sum",
	    "symmetric",
	    "system",
	    "system_time",
	    "system_user",
	    "table",
	    "tablesample",
	    "tan",
	    "tanh",
	    "then",
	    "time",
	    "timestamp",
	    "timezone_hour",
	    "timezone_minute",
	    "to",
	    "trailing",
	    "translate",
	    "translate_regex",
	    "translation",
	    "treat",
	    "trigger",
	    "trim",
	    "trim_array",
	    "true",
	    "truncate",
	    "uescape",
	    "union",
	    "unique",
	    "unknown",
	    "unnest",
	    "update",
	    "upper",
	    "user",
	    "using",
	    "value",
	    "values",
	    "value_of",
	    "var_pop",
	    "var_samp",
	    "varbinary",
	    "varchar",
	    "varying",
	    "versioning",
	    "when",
	    "whenever",
	    "where",
	    "width_bucket",
	    "window",
	    "with",
	    "within",
	    "without",
	    "year",
	  ];

	  // these are reserved words we have identified to be functions
	  // and should only be highlighted in a dispatch-like context
	  // ie, array_agg(...), etc.
	  const RESERVED_FUNCTIONS = [
	    "abs",
	    "acos",
	    "array_agg",
	    "asin",
	    "atan",
	    "avg",
	    "cast",
	    "ceil",
	    "ceiling",
	    "coalesce",
	    "corr",
	    "cos",
	    "cosh",
	    "count",
	    "covar_pop",
	    "covar_samp",
	    "cume_dist",
	    "dense_rank",
	    "deref",
	    "element",
	    "exp",
	    "extract",
	    "first_value",
	    "floor",
	    "json_array",
	    "json_arrayagg",
	    "json_exists",
	    "json_object",
	    "json_objectagg",
	    "json_query",
	    "json_table",
	    "json_table_primitive",
	    "json_value",
	    "lag",
	    "last_value",
	    "lead",
	    "listagg",
	    "ln",
	    "log",
	    "log10",
	    "lower",
	    "max",
	    "min",
	    "mod",
	    "nth_value",
	    "ntile",
	    "nullif",
	    "percent_rank",
	    "percentile_cont",
	    "percentile_disc",
	    "position",
	    "position_regex",
	    "power",
	    "rank",
	    "regr_avgx",
	    "regr_avgy",
	    "regr_count",
	    "regr_intercept",
	    "regr_r2",
	    "regr_slope",
	    "regr_sxx",
	    "regr_sxy",
	    "regr_syy",
	    "row_number",
	    "sin",
	    "sinh",
	    "sqrt",
	    "stddev_pop",
	    "stddev_samp",
	    "substring",
	    "substring_regex",
	    "sum",
	    "tan",
	    "tanh",
	    "translate",
	    "translate_regex",
	    "treat",
	    "trim",
	    "trim_array",
	    "unnest",
	    "upper",
	    "value_of",
	    "var_pop",
	    "var_samp",
	    "width_bucket",
	  ];

	  // these functions can
	  const POSSIBLE_WITHOUT_PARENS = [
	    "current_catalog",
	    "current_date",
	    "current_default_transform_group",
	    "current_path",
	    "current_role",
	    "current_schema",
	    "current_transform_group_for_type",
	    "current_user",
	    "session_user",
	    "system_time",
	    "system_user",
	    "current_time",
	    "localtime",
	    "current_timestamp",
	    "localtimestamp"
	  ];

	  // those exist to boost relevance making these very
	  // "SQL like" keyword combos worth +1 extra relevance
	  const COMBOS = [
	    "create table",
	    "insert into",
	    "primary key",
	    "foreign key",
	    "not null",
	    "alter table",
	    "add constraint",
	    "grouping sets",
	    "on overflow",
	    "character set",
	    "respect nulls",
	    "ignore nulls",
	    "nulls first",
	    "nulls last",
	    "depth first",
	    "breadth first"
	  ];

	  const FUNCTIONS = RESERVED_FUNCTIONS;

	  const KEYWORDS = [
	    ...RESERVED_WORDS,
	    ...NON_RESERVED_WORDS
	  ].filter((keyword) => {
	    return !RESERVED_FUNCTIONS.includes(keyword);
	  });

	  const VARIABLE = {
	    className: "variable",
	    begin: /@[a-z0-9][a-z0-9_]*/,
	  };

	  const OPERATOR = {
	    className: "operator",
	    begin: /[-+*/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?/,
	    relevance: 0,
	  };

	  const FUNCTION_CALL = {
	    begin: regex.concat(/\b/, regex.either(...FUNCTIONS), /\s*\(/),
	    relevance: 0,
	    keywords: { built_in: FUNCTIONS }
	  };

	  // keywords with less than 3 letters are reduced in relevancy
	  function reduceRelevancy(list, {
	    exceptions, when
	  } = {}) {
	    const qualifyFn = when;
	    exceptions = exceptions || [];
	    return list.map((item) => {
	      if (item.match(/\|\d+$/) || exceptions.includes(item)) {
	        return item;
	      } else if (qualifyFn(item)) {
	        return `${item}|0`;
	      } else {
	        return item;
	      }
	    });
	  }

	  return {
	    name: 'SQL',
	    case_insensitive: true,
	    // does not include {} or HTML tags `</`
	    illegal: /[{}]|<\//,
	    keywords: {
	      $pattern: /\b[\w\.]+/,
	      keyword:
	        reduceRelevancy(KEYWORDS, { when: (x) => x.length < 3 }),
	      literal: LITERALS,
	      type: TYPES,
	      built_in: POSSIBLE_WITHOUT_PARENS
	    },
	    contains: [
	      {
	        begin: regex.either(...COMBOS),
	        relevance: 0,
	        keywords: {
	          $pattern: /[\w\.]+/,
	          keyword: KEYWORDS.concat(COMBOS),
	          literal: LITERALS,
	          type: TYPES
	        },
	      },
	      {
	        className: "type",
	        begin: regex.either(...MULTI_WORD_TYPES)
	      },
	      FUNCTION_CALL,
	      VARIABLE,
	      STRING,
	      QUOTED_IDENTIFIER,
	      hljs.C_NUMBER_MODE,
	      hljs.C_BLOCK_COMMENT_MODE,
	      COMMENT_MODE,
	      OPERATOR
	    ]
	  };
	}

	sql_1 = sql;
	return sql_1;
}

/**
 * @param {string} value
 * @returns {RegExp}
 * */

var swift_1;
var hasRequiredSwift;

function requireSwift () {
	if (hasRequiredSwift) return swift_1;
	hasRequiredSwift = 1;
	/**
	 * @param {RegExp | string } re
	 * @returns {string}
	 */
	function source(re) {
	  if (!re) return null;
	  if (typeof re === "string") return re;

	  return re.source;
	}

	/**
	 * @param {RegExp | string } re
	 * @returns {string}
	 */
	function lookahead(re) {
	  return concat('(?=', re, ')');
	}

	/**
	 * @param {...(RegExp | string) } args
	 * @returns {string}
	 */
	function concat(...args) {
	  const joined = args.map((x) => source(x)).join("");
	  return joined;
	}

	/**
	 * @param { Array<string | RegExp | Object> } args
	 * @returns {object}
	 */
	function stripOptionsFromArgs(args) {
	  const opts = args[args.length - 1];

	  if (typeof opts === 'object' && opts.constructor === Object) {
	    args.splice(args.length - 1, 1);
	    return opts;
	  } else {
	    return {};
	  }
	}

	/** @typedef { {capture?: boolean} } RegexEitherOptions */

	/**
	 * Any of the passed expresssions may match
	 *
	 * Creates a huge this | this | that | that match
	 * @param {(RegExp | string)[] | [...(RegExp | string)[], RegexEitherOptions]} args
	 * @returns {string}
	 */
	function either(...args) {
	  /** @type { object & {capture?: boolean} }  */
	  const opts = stripOptionsFromArgs(args);
	  const joined = '('
	    + (opts.capture ? "" : "?:")
	    + args.map((x) => source(x)).join("|") + ")";
	  return joined;
	}

	const keywordWrapper = keyword => concat(
	  /\b/,
	  keyword,
	  /\w$/.test(keyword) ? /\b/ : /\B/
	);

	// Keywords that require a leading dot.
	const dotKeywords = [
	  'Protocol', // contextual
	  'Type' // contextual
	].map(keywordWrapper);

	// Keywords that may have a leading dot.
	const optionalDotKeywords = [
	  'init',
	  'self'
	].map(keywordWrapper);

	// should register as keyword, not type
	const keywordTypes = [
	  'Any',
	  'Self'
	];

	// Regular keywords and literals.
	const keywords = [
	  // strings below will be fed into the regular `keywords` engine while regex
	  // will result in additional modes being created to scan for those keywords to
	  // avoid conflicts with other rules
	  'actor',
	  'any', // contextual
	  'associatedtype',
	  'async',
	  'await',
	  /as\?/, // operator
	  /as!/, // operator
	  'as', // operator
	  'borrowing', // contextual
	  'break',
	  'case',
	  'catch',
	  'class',
	  'consume', // contextual
	  'consuming', // contextual
	  'continue',
	  'convenience', // contextual
	  'copy', // contextual
	  'default',
	  'defer',
	  'deinit',
	  'didSet', // contextual
	  'distributed',
	  'do',
	  'dynamic', // contextual
	  'each',
	  'else',
	  'enum',
	  'extension',
	  'fallthrough',
	  /fileprivate\(set\)/,
	  'fileprivate',
	  'final', // contextual
	  'for',
	  'func',
	  'get', // contextual
	  'guard',
	  'if',
	  'import',
	  'indirect', // contextual
	  'infix', // contextual
	  /init\?/,
	  /init!/,
	  'inout',
	  /internal\(set\)/,
	  'internal',
	  'in',
	  'is', // operator
	  'isolated', // contextual
	  'nonisolated', // contextual
	  'lazy', // contextual
	  'let',
	  'macro',
	  'mutating', // contextual
	  'nonmutating', // contextual
	  /open\(set\)/, // contextual
	  'open', // contextual
	  'operator',
	  'optional', // contextual
	  'override', // contextual
	  'postfix', // contextual
	  'precedencegroup',
	  'prefix', // contextual
	  /private\(set\)/,
	  'private',
	  'protocol',
	  /public\(set\)/,
	  'public',
	  'repeat',
	  'required', // contextual
	  'rethrows',
	  'return',
	  'set', // contextual
	  'some', // contextual
	  'static',
	  'struct',
	  'subscript',
	  'super',
	  'switch',
	  'throws',
	  'throw',
	  /try\?/, // operator
	  /try!/, // operator
	  'try', // operator
	  'typealias',
	  /unowned\(safe\)/, // contextual
	  /unowned\(unsafe\)/, // contextual
	  'unowned', // contextual
	  'var',
	  'weak', // contextual
	  'where',
	  'while',
	  'willSet' // contextual
	];

	// NOTE: Contextual keywords are reserved only in specific contexts.
	// Ideally, these should be matched using modes to avoid false positives.

	// Literals.
	const literals = [
	  'false',
	  'nil',
	  'true'
	];

	// Keywords used in precedence groups.
	const precedencegroupKeywords = [
	  'assignment',
	  'associativity',
	  'higherThan',
	  'left',
	  'lowerThan',
	  'none',
	  'right'
	];

	// Keywords that start with a number sign (#).
	// #(un)available is handled separately.
	const numberSignKeywords = [
	  '#colorLiteral',
	  '#column',
	  '#dsohandle',
	  '#else',
	  '#elseif',
	  '#endif',
	  '#error',
	  '#file',
	  '#fileID',
	  '#fileLiteral',
	  '#filePath',
	  '#function',
	  '#if',
	  '#imageLiteral',
	  '#keyPath',
	  '#line',
	  '#selector',
	  '#sourceLocation',
	  '#warning'
	];

	// Global functions in the Standard Library.
	const builtIns = [
	  'abs',
	  'all',
	  'any',
	  'assert',
	  'assertionFailure',
	  'debugPrint',
	  'dump',
	  'fatalError',
	  'getVaList',
	  'isKnownUniquelyReferenced',
	  'max',
	  'min',
	  'numericCast',
	  'pointwiseMax',
	  'pointwiseMin',
	  'precondition',
	  'preconditionFailure',
	  'print',
	  'readLine',
	  'repeatElement',
	  'sequence',
	  'stride',
	  'swap',
	  'swift_unboxFromSwiftValueWithType',
	  'transcode',
	  'type',
	  'unsafeBitCast',
	  'unsafeDowncast',
	  'withExtendedLifetime',
	  'withUnsafeMutablePointer',
	  'withUnsafePointer',
	  'withVaList',
	  'withoutActuallyEscaping',
	  'zip'
	];

	// Valid first characters for operators.
	const operatorHead = either(
	  /[/=\-+!*%<>&|^~?]/,
	  /[\u00A1-\u00A7]/,
	  /[\u00A9\u00AB]/,
	  /[\u00AC\u00AE]/,
	  /[\u00B0\u00B1]/,
	  /[\u00B6\u00BB\u00BF\u00D7\u00F7]/,
	  /[\u2016-\u2017]/,
	  /[\u2020-\u2027]/,
	  /[\u2030-\u203E]/,
	  /[\u2041-\u2053]/,
	  /[\u2055-\u205E]/,
	  /[\u2190-\u23FF]/,
	  /[\u2500-\u2775]/,
	  /[\u2794-\u2BFF]/,
	  /[\u2E00-\u2E7F]/,
	  /[\u3001-\u3003]/,
	  /[\u3008-\u3020]/,
	  /[\u3030]/
	);

	// Valid characters for operators.
	const operatorCharacter = either(
	  operatorHead,
	  /[\u0300-\u036F]/,
	  /[\u1DC0-\u1DFF]/,
	  /[\u20D0-\u20FF]/,
	  /[\uFE00-\uFE0F]/,
	  /[\uFE20-\uFE2F]/
	  // TODO: The following characters are also allowed, but the regex isn't supported yet.
	  // /[\u{E0100}-\u{E01EF}]/u
	);

	// Valid operator.
	const operator = concat(operatorHead, operatorCharacter, '*');

	// Valid first characters for identifiers.
	const identifierHead = either(
	  /[a-zA-Z_]/,
	  /[\u00A8\u00AA\u00AD\u00AF\u00B2-\u00B5\u00B7-\u00BA]/,
	  /[\u00BC-\u00BE\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/,
	  /[\u0100-\u02FF\u0370-\u167F\u1681-\u180D\u180F-\u1DBF]/,
	  /[\u1E00-\u1FFF]/,
	  /[\u200B-\u200D\u202A-\u202E\u203F-\u2040\u2054\u2060-\u206F]/,
	  /[\u2070-\u20CF\u2100-\u218F\u2460-\u24FF\u2776-\u2793]/,
	  /[\u2C00-\u2DFF\u2E80-\u2FFF]/,
	  /[\u3004-\u3007\u3021-\u302F\u3031-\u303F\u3040-\uD7FF]/,
	  /[\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE1F\uFE30-\uFE44]/,
	  /[\uFE47-\uFEFE\uFF00-\uFFFD]/ // Should be /[\uFE47-\uFFFD]/, but we have to exclude FEFF.
	  // The following characters are also allowed, but the regexes aren't supported yet.
	  // /[\u{10000}-\u{1FFFD}\u{20000-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}]/u,
	  // /[\u{50000}-\u{5FFFD}\u{60000-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}]/u,
	  // /[\u{90000}-\u{9FFFD}\u{A0000-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}]/u,
	  // /[\u{D0000}-\u{DFFFD}\u{E0000-\u{EFFFD}]/u
	);

	// Valid characters for identifiers.
	const identifierCharacter = either(
	  identifierHead,
	  /\d/,
	  /[\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/
	);

	// Valid identifier.
	const identifier = concat(identifierHead, identifierCharacter, '*');

	// Valid type identifier.
	const typeIdentifier = concat(/[A-Z]/, identifierCharacter, '*');

	// Built-in attributes, which are highlighted as keywords.
	// @available is handled separately.
	// https://docs.swift.org/swift-book/documentation/the-swift-programming-language/attributes
	const keywordAttributes = [
	  'attached',
	  'autoclosure',
	  concat(/convention\(/, either('swift', 'block', 'c'), /\)/),
	  'discardableResult',
	  'dynamicCallable',
	  'dynamicMemberLookup',
	  'escaping',
	  'freestanding',
	  'frozen',
	  'GKInspectable',
	  'IBAction',
	  'IBDesignable',
	  'IBInspectable',
	  'IBOutlet',
	  'IBSegueAction',
	  'inlinable',
	  'main',
	  'nonobjc',
	  'NSApplicationMain',
	  'NSCopying',
	  'NSManaged',
	  concat(/objc\(/, identifier, /\)/),
	  'objc',
	  'objcMembers',
	  'propertyWrapper',
	  'requires_stored_property_inits',
	  'resultBuilder',
	  'Sendable',
	  'testable',
	  'UIApplicationMain',
	  'unchecked',
	  'unknown',
	  'usableFromInline',
	  'warn_unqualified_access'
	];

	// Contextual keywords used in @available and #(un)available.
	const availabilityKeywords = [
	  'iOS',
	  'iOSApplicationExtension',
	  'macOS',
	  'macOSApplicationExtension',
	  'macCatalyst',
	  'macCatalystApplicationExtension',
	  'watchOS',
	  'watchOSApplicationExtension',
	  'tvOS',
	  'tvOSApplicationExtension',
	  'swift'
	];

	/*
	Language: Swift
	Description: Swift is a general-purpose programming language built using a modern approach to safety, performance, and software design patterns.
	Author: Steven Van Impe <steven.vanimpe@icloud.com>
	Contributors: Chris Eidhof <chris@eidhof.nl>, Nate Cook <natecook@gmail.com>, Alexander Lichter <manniL@gmx.net>, Richard Gibson <gibson042@github>
	Website: https://swift.org
	Category: common, system
	*/


	/** @type LanguageFn */
	function swift(hljs) {
	  const WHITESPACE = {
	    match: /\s+/,
	    relevance: 0
	  };
	  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#ID411
	  const BLOCK_COMMENT = hljs.COMMENT(
	    '/\\*',
	    '\\*/',
	    { contains: [ 'self' ] }
	  );
	  const COMMENTS = [
	    hljs.C_LINE_COMMENT_MODE,
	    BLOCK_COMMENT
	  ];

	  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#ID413
	  // https://docs.swift.org/swift-book/ReferenceManual/zzSummaryOfTheGrammar.html
	  const DOT_KEYWORD = {
	    match: [
	      /\./,
	      either(...dotKeywords, ...optionalDotKeywords)
	    ],
	    className: { 2: "keyword" }
	  };
	  const KEYWORD_GUARD = {
	    // Consume .keyword to prevent highlighting properties and methods as keywords.
	    match: concat(/\./, either(...keywords)),
	    relevance: 0
	  };
	  const PLAIN_KEYWORDS = keywords
	    .filter(kw => typeof kw === 'string')
	    .concat([ "_|0" ]); // seems common, so 0 relevance
	  const REGEX_KEYWORDS = keywords
	    .filter(kw => typeof kw !== 'string') // find regex
	    .concat(keywordTypes)
	    .map(keywordWrapper);
	  const KEYWORD = { variants: [
	    {
	      className: 'keyword',
	      match: either(...REGEX_KEYWORDS, ...optionalDotKeywords)
	    }
	  ] };
	  // find all the regular keywords
	  const KEYWORDS = {
	    $pattern: either(
	      /\b\w+/, // regular keywords
	      /#\w+/ // number keywords
	    ),
	    keyword: PLAIN_KEYWORDS
	      .concat(numberSignKeywords),
	    literal: literals
	  };
	  const KEYWORD_MODES = [
	    DOT_KEYWORD,
	    KEYWORD_GUARD,
	    KEYWORD
	  ];

	  // https://github.com/apple/swift/tree/main/stdlib/public/core
	  const BUILT_IN_GUARD = {
	    // Consume .built_in to prevent highlighting properties and methods.
	    match: concat(/\./, either(...builtIns)),
	    relevance: 0
	  };
	  const BUILT_IN = {
	    className: 'built_in',
	    match: concat(/\b/, either(...builtIns), /(?=\()/)
	  };
	  const BUILT_INS = [
	    BUILT_IN_GUARD,
	    BUILT_IN
	  ];

	  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#ID418
	  const OPERATOR_GUARD = {
	    // Prevent -> from being highlighting as an operator.
	    match: /->/,
	    relevance: 0
	  };
	  const OPERATOR = {
	    className: 'operator',
	    relevance: 0,
	    variants: [
	      { match: operator },
	      {
	        // dot-operator: only operators that start with a dot are allowed to use dots as
	        // characters (..., ...<, .*, etc). So there rule here is: a dot followed by one or more
	        // characters that may also include dots.
	        match: `\\.(\\.|${operatorCharacter})+` }
	    ]
	  };
	  const OPERATORS = [
	    OPERATOR_GUARD,
	    OPERATOR
	  ];

	  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#grammar_numeric-literal
	  // TODO: Update for leading `-` after lookbehind is supported everywhere
	  const decimalDigits = '([0-9]_*)+';
	  const hexDigits = '([0-9a-fA-F]_*)+';
	  const NUMBER = {
	    className: 'number',
	    relevance: 0,
	    variants: [
	      // decimal floating-point-literal (subsumes decimal-literal)
	      { match: `\\b(${decimalDigits})(\\.(${decimalDigits}))?` + `([eE][+-]?(${decimalDigits}))?\\b` },
	      // hexadecimal floating-point-literal (subsumes hexadecimal-literal)
	      { match: `\\b0x(${hexDigits})(\\.(${hexDigits}))?` + `([pP][+-]?(${decimalDigits}))?\\b` },
	      // octal-literal
	      { match: /\b0o([0-7]_*)+\b/ },
	      // binary-literal
	      { match: /\b0b([01]_*)+\b/ }
	    ]
	  };

	  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#grammar_string-literal
	  const ESCAPED_CHARACTER = (rawDelimiter = "") => ({
	    className: 'subst',
	    variants: [
	      { match: concat(/\\/, rawDelimiter, /[0\\tnr"']/) },
	      { match: concat(/\\/, rawDelimiter, /u\{[0-9a-fA-F]{1,8}\}/) }
	    ]
	  });
	  const ESCAPED_NEWLINE = (rawDelimiter = "") => ({
	    className: 'subst',
	    match: concat(/\\/, rawDelimiter, /[\t ]*(?:[\r\n]|\r\n)/)
	  });
	  const INTERPOLATION = (rawDelimiter = "") => ({
	    className: 'subst',
	    label: "interpol",
	    begin: concat(/\\/, rawDelimiter, /\(/),
	    end: /\)/
	  });
	  const MULTILINE_STRING = (rawDelimiter = "") => ({
	    begin: concat(rawDelimiter, /"""/),
	    end: concat(/"""/, rawDelimiter),
	    contains: [
	      ESCAPED_CHARACTER(rawDelimiter),
	      ESCAPED_NEWLINE(rawDelimiter),
	      INTERPOLATION(rawDelimiter)
	    ]
	  });
	  const SINGLE_LINE_STRING = (rawDelimiter = "") => ({
	    begin: concat(rawDelimiter, /"/),
	    end: concat(/"/, rawDelimiter),
	    contains: [
	      ESCAPED_CHARACTER(rawDelimiter),
	      INTERPOLATION(rawDelimiter)
	    ]
	  });
	  const STRING = {
	    className: 'string',
	    variants: [
	      MULTILINE_STRING(),
	      MULTILINE_STRING("#"),
	      MULTILINE_STRING("##"),
	      MULTILINE_STRING("###"),
	      SINGLE_LINE_STRING(),
	      SINGLE_LINE_STRING("#"),
	      SINGLE_LINE_STRING("##"),
	      SINGLE_LINE_STRING("###")
	    ]
	  };

	  const REGEXP_CONTENTS = [
	    hljs.BACKSLASH_ESCAPE,
	    {
	      begin: /\[/,
	      end: /\]/,
	      relevance: 0,
	      contains: [ hljs.BACKSLASH_ESCAPE ]
	    }
	  ];

	  const BARE_REGEXP_LITERAL = {
	    begin: /\/[^\s](?=[^/\n]*\/)/,
	    end: /\//,
	    contains: REGEXP_CONTENTS
	  };

	  const EXTENDED_REGEXP_LITERAL = (rawDelimiter) => {
	    const begin = concat(rawDelimiter, /\//);
	    const end = concat(/\//, rawDelimiter);
	    return {
	      begin,
	      end,
	      contains: [
	        ...REGEXP_CONTENTS,
	        {
	          scope: "comment",
	          begin: `#(?!.*${end})`,
	          end: /$/,
	        },
	      ],
	    };
	  };

	  // https://docs.swift.org/swift-book/documentation/the-swift-programming-language/lexicalstructure/#Regular-Expression-Literals
	  const REGEXP = {
	    scope: "regexp",
	    variants: [
	      EXTENDED_REGEXP_LITERAL('###'),
	      EXTENDED_REGEXP_LITERAL('##'),
	      EXTENDED_REGEXP_LITERAL('#'),
	      BARE_REGEXP_LITERAL
	    ]
	  };

	  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#ID412
	  const QUOTED_IDENTIFIER = { match: concat(/`/, identifier, /`/) };
	  const IMPLICIT_PARAMETER = {
	    className: 'variable',
	    match: /\$\d+/
	  };
	  const PROPERTY_WRAPPER_PROJECTION = {
	    className: 'variable',
	    match: `\\$${identifierCharacter}+`
	  };
	  const IDENTIFIERS = [
	    QUOTED_IDENTIFIER,
	    IMPLICIT_PARAMETER,
	    PROPERTY_WRAPPER_PROJECTION
	  ];

	  // https://docs.swift.org/swift-book/ReferenceManual/Attributes.html
	  const AVAILABLE_ATTRIBUTE = {
	    match: /(@|#(un)?)available/,
	    scope: 'keyword',
	    starts: { contains: [
	      {
	        begin: /\(/,
	        end: /\)/,
	        keywords: availabilityKeywords,
	        contains: [
	          ...OPERATORS,
	          NUMBER,
	          STRING
	        ]
	      }
	    ] }
	  };
	  const KEYWORD_ATTRIBUTE = {
	    scope: 'keyword',
	    match: concat(/@/, either(...keywordAttributes))
	  };
	  const USER_DEFINED_ATTRIBUTE = {
	    scope: 'meta',
	    match: concat(/@/, identifier)
	  };
	  const ATTRIBUTES = [
	    AVAILABLE_ATTRIBUTE,
	    KEYWORD_ATTRIBUTE,
	    USER_DEFINED_ATTRIBUTE
	  ];

	  // https://docs.swift.org/swift-book/ReferenceManual/Types.html
	  const TYPE = {
	    match: lookahead(/\b[A-Z]/),
	    relevance: 0,
	    contains: [
	      { // Common Apple frameworks, for relevance boost
	        className: 'type',
	        match: concat(/(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)/, identifierCharacter, '+')
	      },
	      { // Type identifier
	        className: 'type',
	        match: typeIdentifier,
	        relevance: 0
	      },
	      { // Optional type
	        match: /[?!]+/,
	        relevance: 0
	      },
	      { // Variadic parameter
	        match: /\.\.\./,
	        relevance: 0
	      },
	      { // Protocol composition
	        match: concat(/\s+&\s+/, lookahead(typeIdentifier)),
	        relevance: 0
	      }
	    ]
	  };
	  const GENERIC_ARGUMENTS = {
	    begin: /</,
	    end: />/,
	    keywords: KEYWORDS,
	    contains: [
	      ...COMMENTS,
	      ...KEYWORD_MODES,
	      ...ATTRIBUTES,
	      OPERATOR_GUARD,
	      TYPE
	    ]
	  };
	  TYPE.contains.push(GENERIC_ARGUMENTS);

	  // https://docs.swift.org/swift-book/ReferenceManual/Expressions.html#ID552
	  // Prevents element names from being highlighted as keywords.
	  const TUPLE_ELEMENT_NAME = {
	    match: concat(identifier, /\s*:/),
	    keywords: "_|0",
	    relevance: 0
	  };
	  // Matches tuples as well as the parameter list of a function type.
	  const TUPLE = {
	    begin: /\(/,
	    end: /\)/,
	    relevance: 0,
	    keywords: KEYWORDS,
	    contains: [
	      'self',
	      TUPLE_ELEMENT_NAME,
	      ...COMMENTS,
	      REGEXP,
	      ...KEYWORD_MODES,
	      ...BUILT_INS,
	      ...OPERATORS,
	      NUMBER,
	      STRING,
	      ...IDENTIFIERS,
	      ...ATTRIBUTES,
	      TYPE
	    ]
	  };

	  const GENERIC_PARAMETERS = {
	    begin: /</,
	    end: />/,
	    keywords: 'repeat each',
	    contains: [
	      ...COMMENTS,
	      TYPE
	    ]
	  };
	  const FUNCTION_PARAMETER_NAME = {
	    begin: either(
	      lookahead(concat(identifier, /\s*:/)),
	      lookahead(concat(identifier, /\s+/, identifier, /\s*:/))
	    ),
	    end: /:/,
	    relevance: 0,
	    contains: [
	      {
	        className: 'keyword',
	        match: /\b_\b/
	      },
	      {
	        className: 'params',
	        match: identifier
	      }
	    ]
	  };
	  const FUNCTION_PARAMETERS = {
	    begin: /\(/,
	    end: /\)/,
	    keywords: KEYWORDS,
	    contains: [
	      FUNCTION_PARAMETER_NAME,
	      ...COMMENTS,
	      ...KEYWORD_MODES,
	      ...OPERATORS,
	      NUMBER,
	      STRING,
	      ...ATTRIBUTES,
	      TYPE,
	      TUPLE
	    ],
	    endsParent: true,
	    illegal: /["']/
	  };
	  // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID362
	  // https://docs.swift.org/swift-book/documentation/the-swift-programming-language/declarations/#Macro-Declaration
	  const FUNCTION_OR_MACRO = {
	    match: [
	      /(func|macro)/,
	      /\s+/,
	      either(QUOTED_IDENTIFIER.match, identifier, operator)
	    ],
	    className: {
	      1: "keyword",
	      3: "title.function"
	    },
	    contains: [
	      GENERIC_PARAMETERS,
	      FUNCTION_PARAMETERS,
	      WHITESPACE
	    ],
	    illegal: [
	      /\[/,
	      /%/
	    ]
	  };

	  // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID375
	  // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID379
	  const INIT_SUBSCRIPT = {
	    match: [
	      /\b(?:subscript|init[?!]?)/,
	      /\s*(?=[<(])/,
	    ],
	    className: { 1: "keyword" },
	    contains: [
	      GENERIC_PARAMETERS,
	      FUNCTION_PARAMETERS,
	      WHITESPACE
	    ],
	    illegal: /\[|%/
	  };
	  // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID380
	  const OPERATOR_DECLARATION = {
	    match: [
	      /operator/,
	      /\s+/,
	      operator
	    ],
	    className: {
	      1: "keyword",
	      3: "title"
	    }
	  };

	  // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID550
	  const PRECEDENCEGROUP = {
	    begin: [
	      /precedencegroup/,
	      /\s+/,
	      typeIdentifier
	    ],
	    className: {
	      1: "keyword",
	      3: "title"
	    },
	    contains: [ TYPE ],
	    keywords: [
	      ...precedencegroupKeywords,
	      ...literals
	    ],
	    end: /}/
	  };

	  // Add supported submodes to string interpolation.
	  for (const variant of STRING.variants) {
	    const interpolation = variant.contains.find(mode => mode.label === "interpol");
	    // TODO: Interpolation can contain any expression, so there's room for improvement here.
	    interpolation.keywords = KEYWORDS;
	    const submodes = [
	      ...KEYWORD_MODES,
	      ...BUILT_INS,
	      ...OPERATORS,
	      NUMBER,
	      STRING,
	      ...IDENTIFIERS
	    ];
	    interpolation.contains = [
	      ...submodes,
	      {
	        begin: /\(/,
	        end: /\)/,
	        contains: [
	          'self',
	          ...submodes
	        ]
	      }
	    ];
	  }

	  return {
	    name: 'Swift',
	    keywords: KEYWORDS,
	    contains: [
	      ...COMMENTS,
	      FUNCTION_OR_MACRO,
	      INIT_SUBSCRIPT,
	      {
	        beginKeywords: 'struct protocol class extension enum actor',
	        end: '\\{',
	        excludeEnd: true,
	        keywords: KEYWORDS,
	        contains: [
	          hljs.inherit(hljs.TITLE_MODE, {
	            className: "title.class",
	            begin: /[A-Za-z$_][\u00C0-\u02B80-9A-Za-z$_]*/
	          }),
	          ...KEYWORD_MODES
	        ]
	      },
	      OPERATOR_DECLARATION,
	      PRECEDENCEGROUP,
	      {
	        beginKeywords: 'import',
	        end: /$/,
	        contains: [ ...COMMENTS ],
	        relevance: 0
	      },
	      REGEXP,
	      ...KEYWORD_MODES,
	      ...BUILT_INS,
	      ...OPERATORS,
	      NUMBER,
	      STRING,
	      ...IDENTIFIERS,
	      ...ATTRIBUTES,
	      TYPE,
	      TUPLE
	    ]
	  };
	}

	swift_1 = swift;
	return swift_1;
}

/*
Language: YAML
Description: Yet Another Markdown Language
Author: Stefan Wienert <stwienert@gmail.com>
Contributors: Carl Baxter <carl@cbax.tech>
Requires: ruby.js
Website: https://yaml.org
Category: common, config
*/

var yaml_1;
var hasRequiredYaml;

function requireYaml () {
	if (hasRequiredYaml) return yaml_1;
	hasRequiredYaml = 1;
	function yaml(hljs) {
	  const LITERALS = 'true false yes no null';

	  // YAML spec allows non-reserved URI characters in tags.
	  const URI_CHARACTERS = '[\\w#;/?:@&=+$,.~*\'()[\\]]+';

	  // Define keys as starting with a word character
	  // ...containing word chars, spaces, colons, forward-slashes, hyphens and periods
	  // ...and ending with a colon followed immediately by a space, tab or newline.
	  // The YAML spec allows for much more than this, but this covers most use-cases.
	  const KEY = {
	    className: 'attr',
	    variants: [
	      { begin: '\\w[\\w :\\/.-]*:(?=[ \t]|$)' },
	      { // double quoted keys
	        begin: '"\\w[\\w :\\/.-]*":(?=[ \t]|$)' },
	      { // single quoted keys
	        begin: '\'\\w[\\w :\\/.-]*\':(?=[ \t]|$)' }
	    ]
	  };

	  const TEMPLATE_VARIABLES = {
	    className: 'template-variable',
	    variants: [
	      { // jinja templates Ansible
	        begin: /\{\{/,
	        end: /\}\}/
	      },
	      { // Ruby i18n
	        begin: /%\{/,
	        end: /\}/
	      }
	    ]
	  };
	  const STRING = {
	    className: 'string',
	    relevance: 0,
	    variants: [
	      {
	        begin: /'/,
	        end: /'/
	      },
	      {
	        begin: /"/,
	        end: /"/
	      },
	      { begin: /\S+/ }
	    ],
	    contains: [
	      hljs.BACKSLASH_ESCAPE,
	      TEMPLATE_VARIABLES
	    ]
	  };

	  // Strings inside of value containers (objects) can't contain braces,
	  // brackets, or commas
	  const CONTAINER_STRING = hljs.inherit(STRING, { variants: [
	    {
	      begin: /'/,
	      end: /'/
	    },
	    {
	      begin: /"/,
	      end: /"/
	    },
	    { begin: /[^\s,{}[\]]+/ }
	  ] });

	  const DATE_RE = '[0-9]{4}(-[0-9][0-9]){0,2}';
	  const TIME_RE = '([Tt \\t][0-9][0-9]?(:[0-9][0-9]){2})?';
	  const FRACTION_RE = '(\\.[0-9]*)?';
	  const ZONE_RE = '([ \\t])*(Z|[-+][0-9][0-9]?(:[0-9][0-9])?)?';
	  const TIMESTAMP = {
	    className: 'number',
	    begin: '\\b' + DATE_RE + TIME_RE + FRACTION_RE + ZONE_RE + '\\b'
	  };

	  const VALUE_CONTAINER = {
	    end: ',',
	    endsWithParent: true,
	    excludeEnd: true,
	    keywords: LITERALS,
	    relevance: 0
	  };
	  const OBJECT = {
	    begin: /\{/,
	    end: /\}/,
	    contains: [ VALUE_CONTAINER ],
	    illegal: '\\n',
	    relevance: 0
	  };
	  const ARRAY = {
	    begin: '\\[',
	    end: '\\]',
	    contains: [ VALUE_CONTAINER ],
	    illegal: '\\n',
	    relevance: 0
	  };

	  const MODES = [
	    KEY,
	    {
	      className: 'meta',
	      begin: '^---\\s*$',
	      relevance: 10
	    },
	    { // multi line string
	      // Blocks start with a | or > followed by a newline
	      //
	      // Indentation of subsequent lines must be the same to
	      // be considered part of the block
	      className: 'string',
	      begin: '[\\|>]([1-9]?[+-])?[ ]*\\n( +)[^ ][^\\n]*\\n(\\2[^\\n]+\\n?)*'
	    },
	    { // Ruby/Rails erb
	      begin: '<%[%=-]?',
	      end: '[%-]?%>',
	      subLanguage: 'ruby',
	      excludeBegin: true,
	      excludeEnd: true,
	      relevance: 0
	    },
	    { // named tags
	      className: 'type',
	      begin: '!\\w+!' + URI_CHARACTERS
	    },
	    // https://yaml.org/spec/1.2/spec.html#id2784064
	    { // verbatim tags
	      className: 'type',
	      begin: '!<' + URI_CHARACTERS + ">"
	    },
	    { // primary tags
	      className: 'type',
	      begin: '!' + URI_CHARACTERS
	    },
	    { // secondary tags
	      className: 'type',
	      begin: '!!' + URI_CHARACTERS
	    },
	    { // fragment id &ref
	      className: 'meta',
	      begin: '&' + hljs.UNDERSCORE_IDENT_RE + '$'
	    },
	    { // fragment reference *ref
	      className: 'meta',
	      begin: '\\*' + hljs.UNDERSCORE_IDENT_RE + '$'
	    },
	    { // array listing
	      className: 'bullet',
	      // TODO: remove |$ hack when we have proper look-ahead support
	      begin: '-(?=[ ]|$)',
	      relevance: 0
	    },
	    hljs.HASH_COMMENT_MODE,
	    {
	      beginKeywords: LITERALS,
	      keywords: { literal: LITERALS }
	    },
	    TIMESTAMP,
	    // numbers are any valid C-style number that
	    // sit isolated from other words
	    {
	      className: 'number',
	      begin: hljs.C_NUMBER_RE + '\\b',
	      relevance: 0
	    },
	    OBJECT,
	    ARRAY,
	    STRING
	  ];

	  const VALUE_MODES = [ ...MODES ];
	  VALUE_MODES.pop();
	  VALUE_MODES.push(CONTAINER_STRING);
	  VALUE_CONTAINER.contains = VALUE_MODES;

	  return {
	    name: 'YAML',
	    case_insensitive: true,
	    aliases: [ 'yml' ],
	    contains: MODES
	  };
	}

	yaml_1 = yaml;
	return yaml_1;
}

var typescript_1;
var hasRequiredTypescript;

function requireTypescript () {
	if (hasRequiredTypescript) return typescript_1;
	hasRequiredTypescript = 1;
	const IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';
	const KEYWORDS = [
	  "as", // for exports
	  "in",
	  "of",
	  "if",
	  "for",
	  "while",
	  "finally",
	  "var",
	  "new",
	  "function",
	  "do",
	  "return",
	  "void",
	  "else",
	  "break",
	  "catch",
	  "instanceof",
	  "with",
	  "throw",
	  "case",
	  "default",
	  "try",
	  "switch",
	  "continue",
	  "typeof",
	  "delete",
	  "let",
	  "yield",
	  "const",
	  "class",
	  // JS handles these with a special rule
	  // "get",
	  // "set",
	  "debugger",
	  "async",
	  "await",
	  "static",
	  "import",
	  "from",
	  "export",
	  "extends"
	];
	const LITERALS = [
	  "true",
	  "false",
	  "null",
	  "undefined",
	  "NaN",
	  "Infinity"
	];

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
	const TYPES = [
	  // Fundamental objects
	  "Object",
	  "Function",
	  "Boolean",
	  "Symbol",
	  // numbers and dates
	  "Math",
	  "Date",
	  "Number",
	  "BigInt",
	  // text
	  "String",
	  "RegExp",
	  // Indexed collections
	  "Array",
	  "Float32Array",
	  "Float64Array",
	  "Int8Array",
	  "Uint8Array",
	  "Uint8ClampedArray",
	  "Int16Array",
	  "Int32Array",
	  "Uint16Array",
	  "Uint32Array",
	  "BigInt64Array",
	  "BigUint64Array",
	  // Keyed collections
	  "Set",
	  "Map",
	  "WeakSet",
	  "WeakMap",
	  // Structured data
	  "ArrayBuffer",
	  "SharedArrayBuffer",
	  "Atomics",
	  "DataView",
	  "JSON",
	  // Control abstraction objects
	  "Promise",
	  "Generator",
	  "GeneratorFunction",
	  "AsyncFunction",
	  // Reflection
	  "Reflect",
	  "Proxy",
	  // Internationalization
	  "Intl",
	  // WebAssembly
	  "WebAssembly"
	];

	const ERROR_TYPES = [
	  "Error",
	  "EvalError",
	  "InternalError",
	  "RangeError",
	  "ReferenceError",
	  "SyntaxError",
	  "TypeError",
	  "URIError"
	];

	const BUILT_IN_GLOBALS = [
	  "setInterval",
	  "setTimeout",
	  "clearInterval",
	  "clearTimeout",

	  "require",
	  "exports",

	  "eval",
	  "isFinite",
	  "isNaN",
	  "parseFloat",
	  "parseInt",
	  "decodeURI",
	  "decodeURIComponent",
	  "encodeURI",
	  "encodeURIComponent",
	  "escape",
	  "unescape"
	];

	const BUILT_IN_VARIABLES = [
	  "arguments",
	  "this",
	  "super",
	  "console",
	  "window",
	  "document",
	  "localStorage",
	  "sessionStorage",
	  "module",
	  "global" // Node.js
	];

	const BUILT_INS = [].concat(
	  BUILT_IN_GLOBALS,
	  TYPES,
	  ERROR_TYPES
	);

	/*
	Language: JavaScript
	Description: JavaScript (JS) is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions.
	Category: common, scripting, web
	Website: https://developer.mozilla.org/en-US/docs/Web/JavaScript
	*/


	/** @type LanguageFn */
	function javascript(hljs) {
	  const regex = hljs.regex;
	  /**
	   * Takes a string like "<Booger" and checks to see
	   * if we can find a matching "</Booger" later in the
	   * content.
	   * @param {RegExpMatchArray} match
	   * @param {{after:number}} param1
	   */
	  const hasClosingTag = (match, { after }) => {
	    const tag = "</" + match[0].slice(1);
	    const pos = match.input.indexOf(tag, after);
	    return pos !== -1;
	  };

	  const IDENT_RE$1 = IDENT_RE;
	  const FRAGMENT = {
	    begin: '<>',
	    end: '</>'
	  };
	  // to avoid some special cases inside isTrulyOpeningTag
	  const XML_SELF_CLOSING = /<[A-Za-z0-9\\._:-]+\s*\/>/;
	  const XML_TAG = {
	    begin: /<[A-Za-z0-9\\._:-]+/,
	    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
	    /**
	     * @param {RegExpMatchArray} match
	     * @param {CallbackResponse} response
	     */
	    isTrulyOpeningTag: (match, response) => {
	      const afterMatchIndex = match[0].length + match.index;
	      const nextChar = match.input[afterMatchIndex];
	      if (
	        // HTML should not include another raw `<` inside a tag
	        // nested type?
	        // `<Array<Array<number>>`, etc.
	        nextChar === "<" ||
	        // the , gives away that this is not HTML
	        // `<T, A extends keyof T, V>`
	        nextChar === ","
	        ) {
	        response.ignoreMatch();
	        return;
	      }

	      // `<something>`
	      // Quite possibly a tag, lets look for a matching closing tag...
	      if (nextChar === ">") {
	        // if we cannot find a matching closing tag, then we
	        // will ignore it
	        if (!hasClosingTag(match, { after: afterMatchIndex })) {
	          response.ignoreMatch();
	        }
	      }

	      // `<blah />` (self-closing)
	      // handled by simpleSelfClosing rule

	      let m;
	      const afterMatch = match.input.substring(afterMatchIndex);

	      // some more template typing stuff
	      //  <T = any>(key?: string) => Modify<
	      if ((m = afterMatch.match(/^\s*=/))) {
	        response.ignoreMatch();
	        return;
	      }

	      // `<From extends string>`
	      // technically this could be HTML, but it smells like a type
	      // NOTE: This is ugh, but added specifically for https://github.com/highlightjs/highlight.js/issues/3276
	      if ((m = afterMatch.match(/^\s+extends\s+/))) {
	        if (m.index === 0) {
	          response.ignoreMatch();
	          // eslint-disable-next-line no-useless-return
	          return;
	        }
	      }
	    }
	  };
	  const KEYWORDS$1 = {
	    $pattern: IDENT_RE,
	    keyword: KEYWORDS,
	    literal: LITERALS,
	    built_in: BUILT_INS,
	    "variable.language": BUILT_IN_VARIABLES
	  };

	  // https://tc39.es/ecma262/#sec-literals-numeric-literals
	  const decimalDigits = '[0-9](_?[0-9])*';
	  const frac = `\\.(${decimalDigits})`;
	  // DecimalIntegerLiteral, including Annex B NonOctalDecimalIntegerLiteral
	  // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
	  const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
	  const NUMBER = {
	    className: 'number',
	    variants: [
	      // DecimalLiteral
	      { begin: `(\\b(${decimalInteger})((${frac})|\\.)?|(${frac}))` +
	        `[eE][+-]?(${decimalDigits})\\b` },
	      { begin: `\\b(${decimalInteger})\\b((${frac})\\b|\\.)?|(${frac})\\b` },

	      // DecimalBigIntegerLiteral
	      { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },

	      // NonDecimalIntegerLiteral
	      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
	      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
	      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },

	      // LegacyOctalIntegerLiteral (does not include underscore separators)
	      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
	      { begin: "\\b0[0-7]+n?\\b" },
	    ],
	    relevance: 0
	  };

	  const SUBST = {
	    className: 'subst',
	    begin: '\\$\\{',
	    end: '\\}',
	    keywords: KEYWORDS$1,
	    contains: [] // defined later
	  };
	  const HTML_TEMPLATE = {
	    begin: 'html`',
	    end: '',
	    starts: {
	      end: '`',
	      returnEnd: false,
	      contains: [
	        hljs.BACKSLASH_ESCAPE,
	        SUBST
	      ],
	      subLanguage: 'xml'
	    }
	  };
	  const CSS_TEMPLATE = {
	    begin: 'css`',
	    end: '',
	    starts: {
	      end: '`',
	      returnEnd: false,
	      contains: [
	        hljs.BACKSLASH_ESCAPE,
	        SUBST
	      ],
	      subLanguage: 'css'
	    }
	  };
	  const GRAPHQL_TEMPLATE = {
	    begin: 'gql`',
	    end: '',
	    starts: {
	      end: '`',
	      returnEnd: false,
	      contains: [
	        hljs.BACKSLASH_ESCAPE,
	        SUBST
	      ],
	      subLanguage: 'graphql'
	    }
	  };
	  const TEMPLATE_STRING = {
	    className: 'string',
	    begin: '`',
	    end: '`',
	    contains: [
	      hljs.BACKSLASH_ESCAPE,
	      SUBST
	    ]
	  };
	  const JSDOC_COMMENT = hljs.COMMENT(
	    /\/\*\*(?!\/)/,
	    '\\*/',
	    {
	      relevance: 0,
	      contains: [
	        {
	          begin: '(?=@[A-Za-z]+)',
	          relevance: 0,
	          contains: [
	            {
	              className: 'doctag',
	              begin: '@[A-Za-z]+'
	            },
	            {
	              className: 'type',
	              begin: '\\{',
	              end: '\\}',
	              excludeEnd: true,
	              excludeBegin: true,
	              relevance: 0
	            },
	            {
	              className: 'variable',
	              begin: IDENT_RE$1 + '(?=\\s*(-)|$)',
	              endsParent: true,
	              relevance: 0
	            },
	            // eat spaces (not newlines) so we can find
	            // types or variables
	            {
	              begin: /(?=[^\n])\s/,
	              relevance: 0
	            }
	          ]
	        }
	      ]
	    }
	  );
	  const COMMENT = {
	    className: "comment",
	    variants: [
	      JSDOC_COMMENT,
	      hljs.C_BLOCK_COMMENT_MODE,
	      hljs.C_LINE_COMMENT_MODE
	    ]
	  };
	  const SUBST_INTERNALS = [
	    hljs.APOS_STRING_MODE,
	    hljs.QUOTE_STRING_MODE,
	    HTML_TEMPLATE,
	    CSS_TEMPLATE,
	    GRAPHQL_TEMPLATE,
	    TEMPLATE_STRING,
	    // Skip numbers when they are part of a variable name
	    { match: /\$\d+/ },
	    NUMBER,
	    // This is intentional:
	    // See https://github.com/highlightjs/highlight.js/issues/3288
	    // hljs.REGEXP_MODE
	  ];
	  SUBST.contains = SUBST_INTERNALS
	    .concat({
	      // we need to pair up {} inside our subst to prevent
	      // it from ending too early by matching another }
	      begin: /\{/,
	      end: /\}/,
	      keywords: KEYWORDS$1,
	      contains: [
	        "self"
	      ].concat(SUBST_INTERNALS)
	    });
	  const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
	  const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
	    // eat recursive parens in sub expressions
	    {
	      begin: /\(/,
	      end: /\)/,
	      keywords: KEYWORDS$1,
	      contains: ["self"].concat(SUBST_AND_COMMENTS)
	    }
	  ]);
	  const PARAMS = {
	    className: 'params',
	    begin: /\(/,
	    end: /\)/,
	    excludeBegin: true,
	    excludeEnd: true,
	    keywords: KEYWORDS$1,
	    contains: PARAMS_CONTAINS
	  };

	  // ES6 classes
	  const CLASS_OR_EXTENDS = {
	    variants: [
	      // class Car extends vehicle
	      {
	        match: [
	          /class/,
	          /\s+/,
	          IDENT_RE$1,
	          /\s+/,
	          /extends/,
	          /\s+/,
	          regex.concat(IDENT_RE$1, "(", regex.concat(/\./, IDENT_RE$1), ")*")
	        ],
	        scope: {
	          1: "keyword",
	          3: "title.class",
	          5: "keyword",
	          7: "title.class.inherited"
	        }
	      },
	      // class Car
	      {
	        match: [
	          /class/,
	          /\s+/,
	          IDENT_RE$1
	        ],
	        scope: {
	          1: "keyword",
	          3: "title.class"
	        }
	      },

	    ]
	  };

	  const CLASS_REFERENCE = {
	    relevance: 0,
	    match:
	    regex.either(
	      // Hard coded exceptions
	      /\bJSON/,
	      // Float32Array, OutT
	      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
	      // CSSFactory, CSSFactoryT
	      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
	      // FPs, FPsT
	      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/,
	      // P
	      // single letters are not highlighted
	      // BLAH
	      // this will be flagged as a UPPER_CASE_CONSTANT instead
	    ),
	    className: "title.class",
	    keywords: {
	      _: [
	        // se we still get relevance credit for JS library classes
	        ...TYPES,
	        ...ERROR_TYPES
	      ]
	    }
	  };

	  const USE_STRICT = {
	    label: "use_strict",
	    className: 'meta',
	    relevance: 10,
	    begin: /^\s*['"]use (strict|asm)['"]/
	  };

	  const FUNCTION_DEFINITION = {
	    variants: [
	      {
	        match: [
	          /function/,
	          /\s+/,
	          IDENT_RE$1,
	          /(?=\s*\()/
	        ]
	      },
	      // anonymous function
	      {
	        match: [
	          /function/,
	          /\s*(?=\()/
	        ]
	      }
	    ],
	    className: {
	      1: "keyword",
	      3: "title.function"
	    },
	    label: "func.def",
	    contains: [ PARAMS ],
	    illegal: /%/
	  };

	  const UPPER_CASE_CONSTANT = {
	    relevance: 0,
	    match: /\b[A-Z][A-Z_0-9]+\b/,
	    className: "variable.constant"
	  };

	  function noneOf(list) {
	    return regex.concat("(?!", list.join("|"), ")");
	  }

	  const FUNCTION_CALL = {
	    match: regex.concat(
	      /\b/,
	      noneOf([
	        ...BUILT_IN_GLOBALS,
	        "super",
	        "import"
	      ]),
	      IDENT_RE$1, regex.lookahead(/\(/)),
	    className: "title.function",
	    relevance: 0
	  };

	  const PROPERTY_ACCESS = {
	    begin: regex.concat(/\./, regex.lookahead(
	      regex.concat(IDENT_RE$1, /(?![0-9A-Za-z$_(])/)
	    )),
	    end: IDENT_RE$1,
	    excludeBegin: true,
	    keywords: "prototype",
	    className: "property",
	    relevance: 0
	  };

	  const GETTER_OR_SETTER = {
	    match: [
	      /get|set/,
	      /\s+/,
	      IDENT_RE$1,
	      /(?=\()/
	    ],
	    className: {
	      1: "keyword",
	      3: "title.function"
	    },
	    contains: [
	      { // eat to avoid empty params
	        begin: /\(\)/
	      },
	      PARAMS
	    ]
	  };

	  const FUNC_LEAD_IN_RE = '(\\(' +
	    '[^()]*(\\(' +
	    '[^()]*(\\(' +
	    '[^()]*' +
	    '\\)[^()]*)*' +
	    '\\)[^()]*)*' +
	    '\\)|' + hljs.UNDERSCORE_IDENT_RE + ')\\s*=>';

	  const FUNCTION_VARIABLE = {
	    match: [
	      /const|var|let/, /\s+/,
	      IDENT_RE$1, /\s*/,
	      /=\s*/,
	      /(async\s*)?/, // async is optional
	      regex.lookahead(FUNC_LEAD_IN_RE)
	    ],
	    keywords: "async",
	    className: {
	      1: "keyword",
	      3: "title.function"
	    },
	    contains: [
	      PARAMS
	    ]
	  };

	  return {
	    name: 'JavaScript',
	    aliases: ['js', 'jsx', 'mjs', 'cjs'],
	    keywords: KEYWORDS$1,
	    // this will be extended by TypeScript
	    exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
	    illegal: /#(?![$_A-z])/,
	    contains: [
	      hljs.SHEBANG({
	        label: "shebang",
	        binary: "node",
	        relevance: 5
	      }),
	      USE_STRICT,
	      hljs.APOS_STRING_MODE,
	      hljs.QUOTE_STRING_MODE,
	      HTML_TEMPLATE,
	      CSS_TEMPLATE,
	      GRAPHQL_TEMPLATE,
	      TEMPLATE_STRING,
	      COMMENT,
	      // Skip numbers when they are part of a variable name
	      { match: /\$\d+/ },
	      NUMBER,
	      CLASS_REFERENCE,
	      {
	        className: 'attr',
	        begin: IDENT_RE$1 + regex.lookahead(':'),
	        relevance: 0
	      },
	      FUNCTION_VARIABLE,
	      { // "value" container
	        begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
	        keywords: 'return throw case',
	        relevance: 0,
	        contains: [
	          COMMENT,
	          hljs.REGEXP_MODE,
	          {
	            className: 'function',
	            // we have to count the parens to make sure we actually have the
	            // correct bounding ( ) before the =>.  There could be any number of
	            // sub-expressions inside also surrounded by parens.
	            begin: FUNC_LEAD_IN_RE,
	            returnBegin: true,
	            end: '\\s*=>',
	            contains: [
	              {
	                className: 'params',
	                variants: [
	                  {
	                    begin: hljs.UNDERSCORE_IDENT_RE,
	                    relevance: 0
	                  },
	                  {
	                    className: null,
	                    begin: /\(\s*\)/,
	                    skip: true
	                  },
	                  {
	                    begin: /\(/,
	                    end: /\)/,
	                    excludeBegin: true,
	                    excludeEnd: true,
	                    keywords: KEYWORDS$1,
	                    contains: PARAMS_CONTAINS
	                  }
	                ]
	              }
	            ]
	          },
	          { // could be a comma delimited list of params to a function call
	            begin: /,/,
	            relevance: 0
	          },
	          {
	            match: /\s+/,
	            relevance: 0
	          },
	          { // JSX
	            variants: [
	              { begin: FRAGMENT.begin, end: FRAGMENT.end },
	              { match: XML_SELF_CLOSING },
	              {
	                begin: XML_TAG.begin,
	                // we carefully check the opening tag to see if it truly
	                // is a tag and not a false positive
	                'on:begin': XML_TAG.isTrulyOpeningTag,
	                end: XML_TAG.end
	              }
	            ],
	            subLanguage: 'xml',
	            contains: [
	              {
	                begin: XML_TAG.begin,
	                end: XML_TAG.end,
	                skip: true,
	                contains: ['self']
	              }
	            ]
	          }
	        ],
	      },
	      FUNCTION_DEFINITION,
	      {
	        // prevent this from getting swallowed up by function
	        // since they appear "function like"
	        beginKeywords: "while if switch catch for"
	      },
	      {
	        // we have to count the parens to make sure we actually have the correct
	        // bounding ( ).  There could be any number of sub-expressions inside
	        // also surrounded by parens.
	        begin: '\\b(?!function)' + hljs.UNDERSCORE_IDENT_RE +
	          '\\(' + // first parens
	          '[^()]*(\\(' +
	            '[^()]*(\\(' +
	              '[^()]*' +
	            '\\)[^()]*)*' +
	          '\\)[^()]*)*' +
	          '\\)\\s*\\{', // end parens
	        returnBegin:true,
	        label: "func.def",
	        contains: [
	          PARAMS,
	          hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1, className: "title.function" })
	        ]
	      },
	      // catch ... so it won't trigger the property rule below
	      {
	        match: /\.\.\./,
	        relevance: 0
	      },
	      PROPERTY_ACCESS,
	      // hack: prevents detection of keywords in some circumstances
	      // .keyword()
	      // $keyword = x
	      {
	        match: '\\$' + IDENT_RE$1,
	        relevance: 0
	      },
	      {
	        match: [ /\bconstructor(?=\s*\()/ ],
	        className: { 1: "title.function" },
	        contains: [ PARAMS ]
	      },
	      FUNCTION_CALL,
	      UPPER_CASE_CONSTANT,
	      CLASS_OR_EXTENDS,
	      GETTER_OR_SETTER,
	      {
	        match: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
	      }
	    ]
	  };
	}

	/*
	Language: TypeScript
	Author: Panu Horsmalahti <panu.horsmalahti@iki.fi>
	Contributors: Ike Ku <dempfi@yahoo.com>
	Description: TypeScript is a strict superset of JavaScript
	Website: https://www.typescriptlang.org
	Category: common, scripting
	*/


	/** @type LanguageFn */
	function typescript(hljs) {
	  const tsLanguage = javascript(hljs);

	  const IDENT_RE$1 = IDENT_RE;
	  const TYPES = [
	    "any",
	    "void",
	    "number",
	    "boolean",
	    "string",
	    "object",
	    "never",
	    "symbol",
	    "bigint",
	    "unknown"
	  ];
	  const NAMESPACE = {
	    beginKeywords: 'namespace',
	    end: /\{/,
	    excludeEnd: true,
	    contains: [ tsLanguage.exports.CLASS_REFERENCE ]
	  };
	  const INTERFACE = {
	    beginKeywords: 'interface',
	    end: /\{/,
	    excludeEnd: true,
	    keywords: {
	      keyword: 'interface extends',
	      built_in: TYPES
	    },
	    contains: [ tsLanguage.exports.CLASS_REFERENCE ]
	  };
	  const USE_STRICT = {
	    className: 'meta',
	    relevance: 10,
	    begin: /^\s*['"]use strict['"]/
	  };
	  const TS_SPECIFIC_KEYWORDS = [
	    "type",
	    "namespace",
	    "interface",
	    "public",
	    "private",
	    "protected",
	    "implements",
	    "declare",
	    "abstract",
	    "readonly",
	    "enum",
	    "override"
	  ];
	  const KEYWORDS$1 = {
	    $pattern: IDENT_RE,
	    keyword: KEYWORDS.concat(TS_SPECIFIC_KEYWORDS),
	    literal: LITERALS,
	    built_in: BUILT_INS.concat(TYPES),
	    "variable.language": BUILT_IN_VARIABLES
	  };
	  const DECORATOR = {
	    className: 'meta',
	    begin: '@' + IDENT_RE$1,
	  };

	  const swapMode = (mode, label, replacement) => {
	    const indx = mode.contains.findIndex(m => m.label === label);
	    if (indx === -1) { throw new Error("can not find mode to replace"); }

	    mode.contains.splice(indx, 1, replacement);
	  };


	  // this should update anywhere keywords is used since
	  // it will be the same actual JS object
	  Object.assign(tsLanguage.keywords, KEYWORDS$1);

	  tsLanguage.exports.PARAMS_CONTAINS.push(DECORATOR);
	  tsLanguage.contains = tsLanguage.contains.concat([
	    DECORATOR,
	    NAMESPACE,
	    INTERFACE,
	  ]);

	  // TS gets a simpler shebang rule than JS
	  swapMode(tsLanguage, "shebang", hljs.SHEBANG());
	  // JS use strict rule purposely excludes `asm` which makes no sense
	  swapMode(tsLanguage, "use_strict", USE_STRICT);

	  const functionDeclaration = tsLanguage.contains.find(m => m.label === "func.def");
	  functionDeclaration.relevance = 0; // () => {} is more typical in TypeScript

	  Object.assign(tsLanguage, {
	    name: 'TypeScript',
	    aliases: [
	      'ts',
	      'tsx',
	      'mts',
	      'cts'
	    ]
	  });

	  return tsLanguage;
	}

	typescript_1 = typescript;
	return typescript_1;
}

/*
Language: Visual Basic .NET
Description: Visual Basic .NET (VB.NET) is a multi-paradigm, object-oriented programming language, implemented on the .NET Framework.
Authors: Poren Chiang <ren.chiang@gmail.com>, Jan Pilzer
Website: https://docs.microsoft.com/dotnet/visual-basic/getting-started
Category: common
*/

var vbnet_1;
var hasRequiredVbnet;

function requireVbnet () {
	if (hasRequiredVbnet) return vbnet_1;
	hasRequiredVbnet = 1;
	/** @type LanguageFn */
	function vbnet(hljs) {
	  const regex = hljs.regex;
	  /**
	   * Character Literal
	   * Either a single character ("a"C) or an escaped double quote (""""C).
	   */
	  const CHARACTER = {
	    className: 'string',
	    begin: /"(""|[^/n])"C\b/
	  };

	  const STRING = {
	    className: 'string',
	    begin: /"/,
	    end: /"/,
	    illegal: /\n/,
	    contains: [
	      {
	        // double quote escape
	        begin: /""/ }
	    ]
	  };

	  /** Date Literals consist of a date, a time, or both separated by whitespace, surrounded by # */
	  const MM_DD_YYYY = /\d{1,2}\/\d{1,2}\/\d{4}/;
	  const YYYY_MM_DD = /\d{4}-\d{1,2}-\d{1,2}/;
	  const TIME_12H = /(\d|1[012])(:\d+){0,2} *(AM|PM)/;
	  const TIME_24H = /\d{1,2}(:\d{1,2}){1,2}/;
	  const DATE = {
	    className: 'literal',
	    variants: [
	      {
	        // #YYYY-MM-DD# (ISO-Date) or #M/D/YYYY# (US-Date)
	        begin: regex.concat(/# */, regex.either(YYYY_MM_DD, MM_DD_YYYY), / *#/) },
	      {
	        // #H:mm[:ss]# (24h Time)
	        begin: regex.concat(/# */, TIME_24H, / *#/) },
	      {
	        // #h[:mm[:ss]] A# (12h Time)
	        begin: regex.concat(/# */, TIME_12H, / *#/) },
	      {
	        // date plus time
	        begin: regex.concat(
	          /# */,
	          regex.either(YYYY_MM_DD, MM_DD_YYYY),
	          / +/,
	          regex.either(TIME_12H, TIME_24H),
	          / *#/
	        ) }
	    ]
	  };

	  const NUMBER = {
	    className: 'number',
	    relevance: 0,
	    variants: [
	      {
	        // Float
	        begin: /\b\d[\d_]*((\.[\d_]+(E[+-]?[\d_]+)?)|(E[+-]?[\d_]+))[RFD@!#]?/ },
	      {
	        // Integer (base 10)
	        begin: /\b\d[\d_]*((U?[SIL])|[%&])?/ },
	      {
	        // Integer (base 16)
	        begin: /&H[\dA-F_]+((U?[SIL])|[%&])?/ },
	      {
	        // Integer (base 8)
	        begin: /&O[0-7_]+((U?[SIL])|[%&])?/ },
	      {
	        // Integer (base 2)
	        begin: /&B[01_]+((U?[SIL])|[%&])?/ }
	    ]
	  };

	  const LABEL = {
	    className: 'label',
	    begin: /^\w+:/
	  };

	  const DOC_COMMENT = hljs.COMMENT(/'''/, /$/, { contains: [
	    {
	      className: 'doctag',
	      begin: /<\/?/,
	      end: />/
	    }
	  ] });

	  const COMMENT = hljs.COMMENT(null, /$/, { variants: [
	    { begin: /'/ },
	    {
	      // TODO: Use multi-class for leading spaces
	      begin: /([\t ]|^)REM(?=\s)/ }
	  ] });

	  const DIRECTIVES = {
	    className: 'meta',
	    // TODO: Use multi-class for indentation once available
	    begin: /[\t ]*#(const|disable|else|elseif|enable|end|externalsource|if|region)\b/,
	    end: /$/,
	    keywords: { keyword:
	        'const disable else elseif enable end externalsource if region then' },
	    contains: [ COMMENT ]
	  };

	  return {
	    name: 'Visual Basic .NET',
	    aliases: [ 'vb' ],
	    case_insensitive: true,
	    classNameAliases: { label: 'symbol' },
	    keywords: {
	      keyword:
	        'addhandler alias aggregate ansi as async assembly auto binary by byref byval ' /* a-b */
	        + 'call case catch class compare const continue custom declare default delegate dim distinct do ' /* c-d */
	        + 'each equals else elseif end enum erase error event exit explicit finally for friend from function ' /* e-f */
	        + 'get global goto group handles if implements imports in inherits interface into iterator ' /* g-i */
	        + 'join key let lib loop me mid module mustinherit mustoverride mybase myclass ' /* j-m */
	        + 'namespace narrowing new next notinheritable notoverridable ' /* n */
	        + 'of off on operator option optional order overloads overridable overrides ' /* o */
	        + 'paramarray partial preserve private property protected public ' /* p */
	        + 'raiseevent readonly redim removehandler resume return ' /* r */
	        + 'select set shadows shared skip static step stop structure strict sub synclock ' /* s */
	        + 'take text then throw to try unicode until using when where while widening with withevents writeonly yield' /* t-y */,
	      built_in:
	        // Operators https://docs.microsoft.com/dotnet/visual-basic/language-reference/operators
	        'addressof and andalso await directcast gettype getxmlnamespace is isfalse isnot istrue like mod nameof new not or orelse trycast typeof xor '
	        // Type Conversion Functions https://docs.microsoft.com/dotnet/visual-basic/language-reference/functions/type-conversion-functions
	        + 'cbool cbyte cchar cdate cdbl cdec cint clng cobj csbyte cshort csng cstr cuint culng cushort',
	      type:
	        // Data types https://docs.microsoft.com/dotnet/visual-basic/language-reference/data-types
	        'boolean byte char date decimal double integer long object sbyte short single string uinteger ulong ushort',
	      literal: 'true false nothing'
	    },
	    illegal:
	      '//|\\{|\\}|endif|gosub|variant|wend|^\\$ ' /* reserved deprecated keywords */,
	    contains: [
	      CHARACTER,
	      STRING,
	      DATE,
	      NUMBER,
	      LABEL,
	      DOC_COMMENT,
	      COMMENT,
	      DIRECTIVES
	    ]
	  };
	}

	vbnet_1 = vbnet;
	return vbnet_1;
}

/*
Language: WebAssembly
Website: https://webassembly.org
Description:  Wasm is designed as a portable compilation target for programming languages, enabling deployment on the web for client and server applications.
Category: web, common
Audit: 2020
*/

var wasm_1;
var hasRequiredWasm;

function requireWasm () {
	if (hasRequiredWasm) return wasm_1;
	hasRequiredWasm = 1;
	/** @type LanguageFn */
	function wasm(hljs) {
	  hljs.regex;
	  const BLOCK_COMMENT = hljs.COMMENT(/\(;/, /;\)/);
	  BLOCK_COMMENT.contains.push("self");
	  const LINE_COMMENT = hljs.COMMENT(/;;/, /$/);

	  const KWS = [
	    "anyfunc",
	    "block",
	    "br",
	    "br_if",
	    "br_table",
	    "call",
	    "call_indirect",
	    "data",
	    "drop",
	    "elem",
	    "else",
	    "end",
	    "export",
	    "func",
	    "global.get",
	    "global.set",
	    "local.get",
	    "local.set",
	    "local.tee",
	    "get_global",
	    "get_local",
	    "global",
	    "if",
	    "import",
	    "local",
	    "loop",
	    "memory",
	    "memory.grow",
	    "memory.size",
	    "module",
	    "mut",
	    "nop",
	    "offset",
	    "param",
	    "result",
	    "return",
	    "select",
	    "set_global",
	    "set_local",
	    "start",
	    "table",
	    "tee_local",
	    "then",
	    "type",
	    "unreachable"
	  ];

	  const FUNCTION_REFERENCE = {
	    begin: [
	      /(?:func|call|call_indirect)/,
	      /\s+/,
	      /\$[^\s)]+/
	    ],
	    className: {
	      1: "keyword",
	      3: "title.function"
	    }
	  };

	  const ARGUMENT = {
	    className: "variable",
	    begin: /\$[\w_]+/
	  };

	  const PARENS = {
	    match: /(\((?!;)|\))+/,
	    className: "punctuation",
	    relevance: 0
	  };

	  const NUMBER = {
	    className: "number",
	    relevance: 0,
	    // borrowed from Prism, TODO: split out into variants
	    match: /[+-]?\b(?:\d(?:_?\d)*(?:\.\d(?:_?\d)*)?(?:[eE][+-]?\d(?:_?\d)*)?|0x[\da-fA-F](?:_?[\da-fA-F])*(?:\.[\da-fA-F](?:_?[\da-fA-D])*)?(?:[pP][+-]?\d(?:_?\d)*)?)\b|\binf\b|\bnan(?::0x[\da-fA-F](?:_?[\da-fA-D])*)?\b/
	  };

	  const TYPE = {
	    // look-ahead prevents us from gobbling up opcodes
	    match: /(i32|i64|f32|f64)(?!\.)/,
	    className: "type"
	  };

	  const MATH_OPERATIONS = {
	    className: "keyword",
	    // borrowed from Prism, TODO: split out into variants
	    match: /\b(f32|f64|i32|i64)(?:\.(?:abs|add|and|ceil|clz|const|convert_[su]\/i(?:32|64)|copysign|ctz|demote\/f64|div(?:_[su])?|eqz?|extend_[su]\/i32|floor|ge(?:_[su])?|gt(?:_[su])?|le(?:_[su])?|load(?:(?:8|16|32)_[su])?|lt(?:_[su])?|max|min|mul|nearest|neg?|or|popcnt|promote\/f32|reinterpret\/[fi](?:32|64)|rem_[su]|rot[lr]|shl|shr_[su]|store(?:8|16|32)?|sqrt|sub|trunc(?:_[su]\/f(?:32|64))?|wrap\/i64|xor))\b/
	  };

	  const OFFSET_ALIGN = {
	    match: [
	      /(?:offset|align)/,
	      /\s*/,
	      /=/
	    ],
	    className: {
	      1: "keyword",
	      3: "operator"
	    }
	  };

	  return {
	    name: 'WebAssembly',
	    keywords: {
	      $pattern: /[\w.]+/,
	      keyword: KWS
	    },
	    contains: [
	      LINE_COMMENT,
	      BLOCK_COMMENT,
	      OFFSET_ALIGN,
	      ARGUMENT,
	      PARENS,
	      FUNCTION_REFERENCE,
	      hljs.QUOTE_STRING_MODE,
	      TYPE,
	      MATH_OPERATIONS,
	      NUMBER
	    ]
	  };
	}

	wasm_1 = wasm;
	return wasm_1;
}

var hljs = core;

hljs.registerLanguage('xml', requireXml());
hljs.registerLanguage('bash', requireBash());
hljs.registerLanguage('c', requireC());
hljs.registerLanguage('cpp', requireCpp());
hljs.registerLanguage('csharp', requireCsharp());
hljs.registerLanguage('css', requireCss());
hljs.registerLanguage('markdown', requireMarkdown());
hljs.registerLanguage('diff', requireDiff());
hljs.registerLanguage('ruby', requireRuby());
hljs.registerLanguage('go', requireGo());
hljs.registerLanguage('graphql', requireGraphql());
hljs.registerLanguage('ini', requireIni());
hljs.registerLanguage('java', requireJava());
hljs.registerLanguage('javascript', requireJavascript());
hljs.registerLanguage('json', requireJson());
hljs.registerLanguage('kotlin', requireKotlin());
hljs.registerLanguage('less', requireLess());
hljs.registerLanguage('lua', requireLua());
hljs.registerLanguage('makefile', requireMakefile());
hljs.registerLanguage('perl', requirePerl());
hljs.registerLanguage('objectivec', requireObjectivec());
hljs.registerLanguage('php', requirePhp());
hljs.registerLanguage('php-template', requirePhpTemplate());
hljs.registerLanguage('plaintext', requirePlaintext());
hljs.registerLanguage('python', requirePython());
hljs.registerLanguage('python-repl', requirePythonRepl());
hljs.registerLanguage('r', requireR());
hljs.registerLanguage('rust', requireRust());
hljs.registerLanguage('scss', requireScss());
hljs.registerLanguage('shell', requireShell());
hljs.registerLanguage('sql', requireSql());
hljs.registerLanguage('swift', requireSwift());
hljs.registerLanguage('yaml', requireYaml());
hljs.registerLanguage('typescript', requireTypescript());
hljs.registerLanguage('vbnet', requireVbnet());
hljs.registerLanguage('wasm', requireWasm());

hljs.HighlightJS = hljs;
hljs.default = hljs;
var common = hljs;

var HighlightJS = /*@__PURE__*/getDefaultExportFromCjs(common);

/**
 * Scroll event watcher for smooth animation.
 * @author Satoshi Soma (amekusa.com)
 * @license Apache-2.0
 * Copyright 2020 Satoshi Soma
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ScrollWatcher {
	/**
	 * @param {Element} [target=window] - Element to watch
	 */
	constructor(target = window) {
		this.target = target;
		this.tasks = {
			init: [],
			scroll: [],
			resize: [],
			scrollend: [],
		};
	}
	/**
	 * Registers a callback.
	 * @param {string|string[]} ev - Event name(s). Pass `any` to register to all the available events
	 * @param {function} fn - Callback
	 * @example
	 * let sw.on('scroll', ev => {
	 *   console.log('Scroll Detected');
	 * });
	 */
	on(ev, fn) {
		if (Array.isArray(ev)) {
			for (let i = 0; i < ev.length; i++) this.on(ev[i], fn);
		} else if (ev == 'any') {
			for (let key in this.tasks) this.on(key, fn);
		} else this.tasks[ev].push(fn);
	}
	/**
	 * Starts watching scroll related events.
	 * @param {string|string[]} ev - Event name(s) to watch. `any` to watch all the available events
	 */
	watch(ev = 'any') {
		if (ev == 'any') ev = Object.keys(this.tasks);
		else if (!Array.isArray(ev)) ev = [ev];

		// context
		let c = new Stats({ x: 0, y: 0, mx: 0, my: 0, time: 0 });
		c.isFirst = true;
		c.event = null;

		let request = false; // animation frame request id
		let tick = time => {
			c.set('time', time);
			let tasks = this.tasks[c.event.type];
			for (let i = 0; i < tasks.length; i++) tasks[i](c);
			if (c.isFirst) c.isFirst = false;
			request = false;
		};
		let propX, propY, propMX, propMY;
		if (this.target === window) {
			propX = 'scrollX';
			propY = 'scrollY';
			propMX = 'scrollMaxX';
			propMY = 'scrollMaxY';
		} else {
			propX = 'scrollLeft';
			propY = 'scrollTop';
			propMX = 'scrollLeftMax';
			propMY = 'scrollTopMax';
		}
		let handler = ev => {
			if (request) { // previous request is still in the queue
				window.cancelAnimationFrame(request); // cancel the previous request
			}			c.event = ev;
			c.set('x', this.target[propX]);
			c.set('y', this.target[propY]);
			c.set('mx', this.target[propMX]);
			c.set('my', this.target[propMY]);
			request = window.requestAnimationFrame(tick);
		};
		for (let i = 0; i < ev.length; i++) {
			switch (ev[i]) {
				case   'init': handler({ type: 'init' }); break; // fake event
				case 'resize': window.addEventListener('resize', handler); break;
				default: this.target.addEventListener(ev[i], handler);
			}
		}
	}
}

class Stats {
	constructor(data) {
		this.curr = {};
		this.prev = {};
		this.diff = {};
		for (let key in data) {
			this.curr[key] = data[key];
			this.prev[key] = undefined;
			this.diff[key] = undefined;
		}
	}
	get(key) {
		return this.curr[key];
	}
	set(key, value) {
		this.prev[key] = this.curr[key];
		this.curr[key] = value;
		this.diff[key] = this.curr[key] - this.prev[key];
		return this;
	}
}

/**
 * An array wrapper that has a pointer to one of its items.
 * @author Satoshi Soma (amekusa.com)
 * @license Apache-2.0
 * Copyright 2020 Satoshi Soma
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class SelectList {
	/**
	 * @param {any[]} items - Array of items
	 * @param {number} [initial] - Initial position
	 * @example
	 * let difficulty = new SelectList([
	 *   'easy',
	 *   'normal', // default
	 *   'hard'
	 * ], 1);
	 */
	constructor(items, initial = 0) {
		this.items = items;
		this.initialPos = this.pos = initial;
		this.fn;
	}
	/**
	 * A number of items.
	 * @type {number}
	 */
	get length() {
		return this.items.length;
	}
	/**
	 * The current item.
	 * @type {any}
	 */
	get curr() {
		return this.items[this.pos];
	}
	_checkIndex(index, or = 0) {
		if (index < 0 || index >= this.items.length) {
			console.error(`[SelectList] index out of bounds`);
			return or;
		}
		return index;
	}
	/**
	 * Returns an item by the given index.
	 * @param {number} index - Item index
	 */
	item(index) {
		return this.items[this._checkIndex(index)];
	}
	/**
	 * Registers a callback that is invoked on every pointer movement.
	 * @param {function} fn
	 */
	onSelect(fn) {
		this.fn = fn;
	}
	/**
	 * Returns the index of the given item.
	 * @param {any} item - Item to find
	 * @return {number} Index, or negative number if not found
	 */
	indexOf(item) {
		return this.items.indexOf(item);
	}
	/**
	 * Whether the given item is in the list.
	 * @param {any} item - Item to find
	 * @return {boolean}
	 */
	has(item) {
		return this.indexOf(item) >= 0;
	}
	/**
	 * Moves the pointer to the given item.
	 * @param {any} item - Item to find
	 * @return {any} Selected item
	 */
	select(item) {
		let pos = this.indexOf(item);
		return pos < 0 ? undefined : this.to(pos);
	}
	/**
	 * Moves the pointer to the given index.
	 * @param {number} pos - Index to move to
	 * @return {any} Selected item
	 */
	to(pos) {
		this.pos = this._checkIndex(pos);
		if (this.fn) this.fn(this.items[this.pos], this.pos, this);
		return this.items[this.pos];
	}
	/**
	 * Decrements the pointer.
	 * @param {boolean} [wrap]
	 * @return {any} Selected item
	 */
	prev(wrap = true) {
		this.pos = this.pos > 0 ? this.pos - 1 : (wrap ? this.items.length - 1 : 0);
		if (this.fn) this.fn(this.items[this.pos], this.pos, this);
		return this.items[this.pos];
	}
	/**
	 * Increments the pointer.
	 * @param {boolean} [wrap]
	 * @return {any} Selected item
	 */
	next(wrap = true) {
		let last = this.items.length - 1;
		this.pos = this.pos < last ? this.pos + 1 : (wrap ? 0 : last);
		if (this.fn) this.fn(this.items[this.pos], this.pos, this);
		return this.items[this.pos];
	}
}

/**
 * Exception thrower.
 * @author Satoshi Soma (amekusa.com)
 * @license Apache-2.0
 * Copyright 2020 Satoshi Soma
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Exception {
	/**
	 * @param {string} label - Log label
	 */
	constructor(label) {
		this.label = label;
	}
	/**
	 * Generates a new exception instance.
	 * @param {string} msg - Message
	 * @param {any} [info] - Additional info
	 */
	new(msg, info = null) {
		return new ExceptionInfo(this.label, msg, info);
	}
	/**
	 * Throws an exception.
	 * @param {...any} args - Same as {@link Exception#new}
	 */
	throw(...args) {
		throw this.new(...args);
	}
	/**
	 * Logs an exception to console as an error.
	 * @param {...any} args - Same as {@link Exception#new}
	 */
	error(...args) {
		console.error(this.new(...args));
	}
	/**
	 * Logs an exception to console as an error, and returns the given value.
	 * @param {any} x - Return value
	 * @param {...any} args - Same as {@link Exception#new}
	 * @return {any} `x`
	 */
	withError(x, ...args) {
		this.error(...args);
		return x;
	}
	/**
	 * Logs an exception to console as a warning.
	 * @param {...any} args - Same as {@link Exception#new}
	 */
	warn(...args) {
		console.warn(this.new(...args));
	}
	/**
	 * Logs an exception to console as a warning, and returns the given value.
	 * @param {any} x - Return value
	 * @param {...any} args - Same as {@link Exception#new}
	 * @return {any} `x`
	 */
	withWarn(x, ...args) {
		this.warn(...args);
		return x;
	}
}

class ExceptionInfo extends Error {
	constructor(label, msg, info = undefined) {
		super(`${label} ${msg}` + (info === undefined ? '' : `\n:: info: ${info}`));
		this.info = info;
	}
}

const E = new Exception('[LightSwitch]');

/**
 * Color scheme switcher.
 * @author Satoshi Soma (amekusa.com)
 * @license Apache-2.0
 * Copyright 2020 Satoshi Soma
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class LightSwitch {
	/**
	 * @param {string[]} [states] - All possible states. Default: `['auto', 'light', 'dark]`
	 * @param {number} [initial] - Initial state index
	 */
	constructor(states, initial = 0) {
		this.switch = null;
		this.room = null;
		this.storage = null;
		this.states = new SelectList(states || ['auto', 'light', 'dark'], initial);
		this.states.onSelect(() => { this.sync(); });
		this._pref;
	}
	/**
	 * The current state.
	 * @type {string}
	 * @readonly
	 */
	get state() {
		return this.states.curr;
	}
	/**
	 * The current state of the room.
	 * @type {string}
	 * @readonly
	 */
	get roomState() {
		return this.state == 'auto' ? this.getPreference() : this.state;
	}
	/**
	 * Fetch user's system preference.
	 * @param {boolean} [update] - Force update
	 * @return {string} preferred state
	 */
	getPreference(update = false) {
		if (this._pref === undefined || update) {
			let states = this.states.items;
			for (let i = 0; i < states.length; i++) {
				let state = states[i];
				if (state == 'auto') continue;
				if (matchMedia(`(prefers-color-scheme: ${state})`).matches) {
					this._pref = i;
					return state;
				}
			}
			E.warn(`cannot find user preference`);
			return this.states.item(this.states.initialPos);
		}
		return this.states.item(this._pref);
	}
	/**
	 * Sets a storage object to store state.
	 * @param {Storage} obj
	 * @param {string} key
	 * @example
	 * ls.setStorage(localStorage, 'lightSwitch');
	 */
	setStorage(obj, key) {
		this.storage = { obj, key };
	}
	/**
	 * Connects a "switch" element to sync state.
	 * @param {Element} elem - Element
	 * @param {string} attr - Attribute to sync state
	 */
	setSwitch(elem, attr) {
		this.switch = { elem, attr };
		elem.addEventListener('click', ev => {
			ev.preventDefault();
			this.nextState();
			this.save();
		});
	}
	/**
	 * Connects a "room" element to sync state.
	 * @param {Element} elem - Element
	 * @param {string} attr - Attribute to sync state
	 */
	setRoom(elem, attr) {
		this.room = { elem, attr };
	}
	/**
	 * Sets the current state.
	 * @param {number|string} state - State name or index
	 * @example
	 * ls.setState('dark');
	 */
	setState(state) {
		let pos = typeof state == 'number' ? state : this.states.indexOf(state);
		if (pos < 0) return E.error(`invalid state`, { state });
		this.states.to(pos);
	}
	/**
	 * Switches to the previous state.
	 */
	prevState() {
		this.states.prev();
	}
	/**
	 * Switches to the next state.
	 */
	nextState() {
		this.states.next();
	}
	/**
	 * Syncs the "switch" and the "room" elements with the current state of this LightSwitch.
	 */
	sync() {
		this.syncSwitch();
		this.syncRoom();
	}
	/**
	 * Syncs the "switch" element with the current state of this LightSwitch.
	 */
	syncSwitch() {
		if (this.switch) {
			this.switch.elem.setAttribute(this.switch.attr, this.state);
		}
	}
	/**
	 * Syncs the "room" element with the current state of this LightSwitch.
	 */
	syncRoom() {
		if (this.room) {
			this.room.elem.setAttribute(this.room.attr, this.roomState);
		}
	}
	/**
	 * Initializes the state by loading it from the browser storage,
	 * or reading the attribute values of "switch" or "room" element.
	 */
	load() {
		// load saved state stored in the browser storage, if it exists
		if (this.storage) {
			let loaded = this.storage.obj.getItem(this.storage.key);
			if (loaded) {
				this.states.to(parseInt(loaded));
				return;
			}
		}
		// if saved state was not found, use DOM attribute instead
		let { elem, attr } = this.switch || this.room;
		let state = elem.getAttribute(attr);
		if (!state) return E.error(`load(): cannot find state`);
		let pos = this.states.indexOf(state);
		if (pos < 0) return E.error(`load(): invalid state`, { state });
		this.states.to(pos);
	}
	/**
	 * Saves the current state to the browser storage.
	 */
	save() {
		if (this.storage) {
			this.storage.obj.setItem(this.storage.key, this.states.pos);
		}
	}
}

/*!
 * The main script for Docolatte
 * @author Satoshi Soma (amekusa.com)
 * @license Apache-2.0
 * Copyright 2020 Satoshi Soma
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(() => {

	// global namespace
	const global = window.$docolatte = {};


	// ---- Functions -------- *

	/**
	 * @param {string} query
	 * @param {int} index
	 * @return {NodeList|Element|null}
	 */
	function q(query, index = null) {
		return find(document, query, index);
	}

	/**
	 * @param {Element} scope
	 * @param {string} query
	 * @param {int} index
	 * @return {NodeList|Element|null}
	 */
	function find(scope, query, index = null) {
		let items = scope.querySelectorAll(query);
		if (index == null) return items;
		if ((index+1) > items.length) return null;
		return items[index];
	}

	/**
	 * @param {Element} elem
	 * @param {string[]} queries
	 * @return {Element}
	 */
	function closest(elem, queries) {
		let r = elem;
		for (let i = 0; i < queries.length; i++) {
			let _r = r.closest(queries[i]);
			if (!_r) return r;
			r = _r;
		}
		return r;
	}

	/**
	 * @param {string} tag
	 * @param {object} attribs
	 * @param {string|array|Element} child
	 * @return {Element}
	 */
	function elem(tag, attribs = null, child = null) {
		let r = document.createElement(tag);
		if (attribs) {
			for (let i in attribs) r.setAttribute(i, attribs[i]);
		}
		if (child) {
			if (!Array.isArray(child)) child = [child];
			for (let item of child) {
				switch (typeof item) {
				case 'string':
				case 'number':
					r.innerHTML += item;
					break;
				default:
					r.appendChild(item);
				}
			}
		}
		return r;
	}

	/**
	 * Gets the offset position of an element from the specific ascendent node
	 * @param {Element} elem Node to get offset
	 * @param {Element} from Offset parent
	 * @param {number} recurse Recursion limit
	 * @return {number} offset.top
	 * @return {number} offset.left
	 */
	function getOffset(elem, from, recurse = 8) {
		let r = { top: 0, left: 0 };
		let child = elem;
		while (true) {
			if ('offsetTop'  in child) r.top  += child.offsetTop;
			if ('offsetLeft' in child) r.left += child.offsetLeft;
			let parent = child.offsetParent;
			if (!parent) return r;
			if (parent.isSameNode(from)) break;
			if (recurse < 1) break;
			recurse--;
			child = parent;
		}
		return r;
	}

	/**
	 * Returns the least amount of camera movement required for showing the given target boundary
	 * @param {number} viewStart
	 * @param {number} viewEnd
	 * @param {number} targetStart
	 * @param {number} targetEnd
	 * @param {number} [align] 0: align to start, 1: align to end
	 * @return {number}
	 */
	function pan(viewStart, viewEnd, targetStart, targetEnd, align = 0) {
		// console.debug('  viewStart:', viewStart);
		// console.debug('    viewEnd:', viewEnd);
		// console.debug('targetStart:', targetStart);
		// console.debug('  targetEnd:', targetEnd);
		// console.debug('------------');
		let viewLength = viewEnd - viewStart;
		let targetLength = targetEnd - targetStart;
		if (viewLength < targetLength) {
			switch (align) {
				case 1: return targetEnd - viewEnd;
				default: return targetStart - viewStart;
			}
		}
		if (viewStart > targetStart) return targetStart - viewStart;
		if (viewEnd < targetEnd) return targetEnd - viewEnd;
		return 0;
	}


	// ---- Tasks -------- *

	// initialize light switch
	const ls = global.lightSwitch = new LightSwitch();
	ls.setStorage(localStorage, 'lightSwitch');
	ls.setRoom(document.documentElement, 'data-color-scheme');
	ls.load(); // apply color scheme to <html> *BEFORE* DOM loaded

	// DOM setup
	document.addEventListener('DOMContentLoaded', () => {

		// docolatte config
		const config = global.config;

		// current page path
		const currentPage = location.pathname.substring(location.pathname.lastIndexOf('/')+1);

		// browser storage
		const storage = sessionStorage;

		// window scroll watcher
		const sw = new ScrollWatcher(window);

		// sidebar & TOC
		const sidebar = q('.sidebar .wrap', 0);
		const sidebarScr = new SimpleBar(sidebar).getScrollElement();
		const toc = find(sidebar, '.toc', 0);

		// restore sidebar scroll position
		sidebarScr.scrollTo({
			left: parseInt(storage.getItem('scrollX') || 0),
			top:  parseInt(storage.getItem('scrollY') || 0),
			behavior: 'instant'
		});
		sidebar.setAttribute('data-ready', 1);

		// save sidebar scroll position
		onbeforeunload = () => {
			storage.setItem('scrollX', sidebarScr.scrollLeft);
			storage.setItem('scrollY', sidebarScr.scrollTop);
		};

		// highlight TOC item that is pointing at the current page
		find(toc, `a[href="${currentPage}"]`).forEach(a => {
			a.setAttribute('data-current', 1);
		});

		// toggle switch for sidebar
		const sidebarToggle = q('input#docolatte-sidebar-toggle', 0);

		// close sidebar when user clicked one of the menu items
		find(sidebar, 'a').forEach(a => {
			a.addEventListener('click', ev => {
				sidebarToggle.checked = false;
			});
		});

		// close sidebar with Escape key
		document.addEventListener('keydown', ev => {
			if (ev.key == 'Escape') sidebarToggle.checked = false;
		});

		{ // light switch
			let btn = q('.light-switch', 0);
			if (btn) {
				ls.setSwitch(btn, 'data-state');
				ls.sync();
			}
		}

		{ // initialize search box
			let fuse = new Fuse(
				JSON.parse(q('#docolatte-search-items', 0).innerHTML), // records to search
				JSON.parse(q('#docolatte-search-options', 0).innerHTML), // options (including keys)
				Fuse.parseIndex(JSON.parse(q('#docolatte-search-index', 0).innerHTML)) // search index
			);
			let base = find(sidebar, '.search-box', 0);
			let input = find(base, 'input[type=text]', 0);
			let dropdown = find(base, '.dropdown', 0);
			let hint = find(base, '.hint', 0); // can be not present
			let lastQuery = '';

			// search as you type
			input.addEventListener('input', ev => {
				let query = ev.target.value;
				if (query == lastQuery) return;
				lastQuery = query;

				dropdown.innerHTML = ''; // clear
				dropdown.setAttribute('data-select', 0); // reset the state

				if (!query.length) return;
				let results = fuse.search(query, { limit: config.searchLimit || 8 });
				if (!results.length) return;
				// console.debug('RESULTS:', results);

				if (hint) hint.classList.add('hidden'); // hide hint

				// show the results
				let symbols = /([\/.#$:~-])/g;
				for (let i = 0; i < results.length; i++) {
					let item = results[i].item;
					let url   = item.$[0];
					let label = item.$[1].replaceAll(symbols, '<i class="symbol">$1</i><wbr>'); // insert <WBR> at every symbol chars
					let li = elem('li', null, elem('a', { href: url }, label));
					if (i == 0) li.classList.add('selected'); // select the 1st item
					dropdown.appendChild(li);
				}
			});

			// navigate through dropdown-list with key presses
			input.addEventListener('keydown', ev => {
				if (ev.key == 'Escape') return ev.target.blur(); // ESC to unfocus
				if (!dropdown.children.length) return;

				let select = Number.parseInt(dropdown.getAttribute('data-select') || 0);
				let selectNew = select;

				// navigation
				switch (ev.key) {
				case 'ArrowDown':
					selectNew++;
					break;
				case 'ArrowUp':
					selectNew--;
					break;
				case 'Tab':
					selectNew += (ev.shiftKey ? -1 : 1);
					break;
				case 'Enter':
					find(dropdown.children[select], 'a', 0).click();
					break;
				default:
					return; // do nothing
				}
				if (selectNew < 0) selectNew = dropdown.children.length - 1;   // jump to bottom from top
				else if (selectNew >= dropdown.children.length) selectNew = 0; // jump to top from bottom
				dropdown.children[select].classList.remove('selected'); // unselect the previous
				dropdown.children[selectNew].classList.add('selected'); // select the new
				dropdown.setAttribute('data-select', selectNew);
				ev.preventDefault();
			});

			// hint
			if (hint) {
				input.addEventListener('click', ev => {
					if (ev.target.value) return;
					hint.classList.remove('hidden');
				});
				input.addEventListener('blur', ev => {
					hint.classList.add('hidden');
				});
			}

			// on focus searchbox
			input.addEventListener('focus', ev => {
				// force sidebar to show when searchbox gets focused
				sidebarToggle.checked = true;

				// scroll sidebar to top
				sidebarScr.scrollTo({
					left: 0,
					top: 0,
					behavior: 'instant'
				});
			});

			// type any "printable" key to start a search
			document.addEventListener('keydown', ev => {
				// console.debug('KEYDOWN:', ev);
				if (ev.key.length != 1) return; // ignore non-printable keys
				if (ev.key == ' ') return;      // ignore SPACE key
				if (ev.metaKey || ev.ctrlKey || ev.altKey) return; // ignore keys with modifiers
				if (ev.target.tagName == 'INPUT' || ev.target.tagName == 'TEXTAREA') return;
				input.value = '';
				input.focus();
			});
		}

		{ // mark a TOC item as "current" on scroll
			let headings = q('article.doc h4.name[id]');
			let curr = {
				i: -1,
				link: null,
				wrap: null,
				hash: document.location.hash,
			};
			let idleTimer = null;
			let onIdle = config.syncHash == 'scrollend' ? () => {
				if (curr.hash == document.location.hash) return;
				history.replaceState(null, null, curr.hash);
			} : null;

			sw.on(['init', 'scroll'], c => {

				if (onIdle) { // refresh idle timer
					clearTimeout(idleTimer);
					idleTimer = setTimeout(onIdle, 250);
				}
				for (let i = 0; i < headings.length; i++) {
					if (headings[i].offsetTop < c.curr.y) continue;
					if (i == curr.i) break;
					curr.hash = '#' + headings[i].id;

					// update location hash
					if (!onIdle && curr.hash != document.location.hash) {
						history.replaceState(null, null, curr.hash);
					}
					// update "current" state of TOC
					let flag = 'data-current';
					if (curr.i >= 0 && curr.link.length) curr.link.forEach(a => { a.removeAttribute(flag); });
					curr.i = i;
					curr.link = find(toc, `a[href="${currentPage + curr.hash}"]`);
					if (!curr.link.length) break;
					curr.link.forEach(link => { link.setAttribute(flag, 1); });

					// scroll sidebar if necessary
					let link = curr.link[curr.link.length - 1];
					if (!curr.wrap) curr.wrap = closest(link, ['ul', 'li']);
					let view = sidebarScr;
					let panning = pan(
						view.scrollTop,
						view.scrollTop + view.offsetHeight,
						getOffset(curr.wrap, sidebar).top,
						getOffset(link, sidebar).top + link.getBoundingClientRect().height,
						1
					);
					if (panning || view.scrollLeft) {
						view.scrollBy({
							left: -view.scrollLeft,
							top: panning,
							behavior: 'smooth'
						});
					}
					break;
				}
			});
		}

		{ // code highlight
			const linenums = [];

			const linenumify = (pre) => {
				let code = find(pre, 'code', 0);
				let lines = (code.innerHTML.trimEnd().match(/\n/g) || '').length + 1;
				let digits = lines.toString().length;
				let charWidth = find(pre, '._char', 0).getBoundingClientRect().width;
				let width = charWidth * (digits + 2); // px
				code.style.paddingLeft = width + charWidth + 'px';

				let r = elem('div', { class: 'linenums' });
				for (let i = 1; i <= lines; i++) {
					let id = 'line' + i;

					let btn = elem('a', { href: '#' + id }, i);
					btn.style.paddingRight = charWidth - 1 + 'px';
					btn.addEventListener('click', onClick);

					let linenum = elem('div', { id, class: 'linenum hljs' }, btn);
					linenum.style.width = width + 'px';
					linenums.push(linenum);
					r.appendChild(linenum);
				}
				pre.appendChild(r);
			};

			const onClick = function (ev) {
				ev.preventDefault();
				document.location = this.href;
				selectLine();
			};

			const selectLine = () => {
				let hash = document.location.hash;
				if (!hash) return;
				for (let i = 0; i < linenums.length; i++) {
					let linenum = linenums[i];
					if (linenum.id == hash.substring(1)) linenum.setAttribute('data-selected', 1);
					else linenum.removeAttribute('data-selected');
				}
			};

			q('.prettyprint code').forEach(HighlightJS.highlightElement);
			q('.prettyprint.linenums').forEach(linenumify);

			selectLine();
		}

		// start window scroll watcher
		sw.watch(['init', 'scroll']);

	}); // DOM setup

})(); // END

})();
