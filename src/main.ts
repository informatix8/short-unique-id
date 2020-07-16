import seedrandom from 'seedrandom';

/**
 * {
 *   dictionary: ['z', 'a', 'p', 'h', 'o', 'd', ...],
 *   shuffle: false,
 *   debug: false,
 *   length: 6,
 * }
 */
export class Options {
  /** User-defined character dictionary */
  dictionary: string[];

  /** If true, sequentialUUID use the dictionary in the given order */
  shuffle: boolean;

  /** If true the instance will console.log useful info */
  debug: boolean;

  /** From 1 to infinity, the length you wish your UUID to be */
  length: number;

  constructor() {
    this.dictionary = [];
    this.shuffle = false;
    this.debug = false;
    this.length = DEFAULT_UUID_LENGTH;
  }

}

export const DEFAULT_OPTIONS: Options = new Options();

const DEFAULT_UUID_LENGTH = 6;

const DIGIT_FIRST_ASCII = 48;
const DIGIT_LAST_ASCII = 58;
const ALPHA_LOWER_FIRST_ASCII = 97;
const ALPHA_LOWER_LAST_ASCII = 123;
const ALPHA_UPPER_FIRST_ASCII = 65;
const ALPHA_UPPER_LAST_ASCII = 91;

export class ShortUniqueId {
  counter: number;
  debug: boolean;
  dict = [];
  dictIndex: number = 0;
  dictRange: number[] = [];
  lowerBound: number = 0;
  upperBound: number = 0;
  dictLength: number = 0;
  uuidLength: number;

  DICT_RANGES: number[][] = [
    [ DIGIT_FIRST_ASCII, DIGIT_LAST_ASCII ], // digits
    [ ALPHA_LOWER_FIRST_ASCII, ALPHA_LOWER_LAST_ASCII ], // lowerCase
    [ ALPHA_UPPER_FIRST_ASCII, ALPHA_UPPER_LAST_ASCII ], // upperCase
  ];

  constructor(options: Options = DEFAULT_OPTIONS) {
    this.counter = 0;
    this.debug = false;
    this.dict = [];

    const userDict: string[] = options.dictionary;
    const shuffle: boolean = options.shuffle;
    const length: number = options.length;

    this.uuidLength = length;

    if (userDict.length > 1) {
      this.setDictionary(userDict);
    } else {
      let i;

      this.dictIndex = i = 0;

      for (const dictRange of this.DICT_RANGES) {
        this.dictRange = dictRange;

        this.lowerBound = this.dictRange[0];
        this.upperBound = this.dictRange[1];

        for (
          this.dictIndex = i = this.lowerBound;
          this.lowerBound <= this.upperBound ? i < this.upperBound : i > this.upperBound;
        ) {
         this.dict.push(String.fromCharCode(this.dictIndex));
          if (this.lowerBound <= this.upperBound) {
            this.dictIndex = i += 1;
          } else {
            this.dictIndex = i -= 1;
          }
        }
      }
    }

    if (shuffle) {
      // Shuffle Dictionary for removing selection bias.
      const PROBABILITY = 0.5;
      this.dict.sort((a: string, b: string) => (Math.random() - PROBABILITY));
      this.setDictionary(this.dict);
    } else {
      this.setDictionary(this.dict);
    }
  }

  /** Change the dictionary after initialization. */
  setDictionary(dictionary: string[]) {
    this.dict = dictionary;

    // Cache Dictionary Length for future usage.
    this.dictLength = this.dict.length; // Resets internal counter.
    this.counter = 0;
  }

  /**
   * Generates UUID based on internal counter that's incremented after each ID generation.
   */
  public sequentialUUID(): string {
    let counterDiv: number;
    let counterRem: number;
    let id: string = '';

    counterDiv = this.counter;

    while (true) {
      counterRem = counterDiv % this.dictLength;
      counterDiv = Math.floor(counterDiv / this.dictLength);
      id += (this.dict[counterRem]);
      if (counterDiv == 0) {
        break;
      }
    }
    this.counter += 1;

    return id;
  }

  public hash(val: string, uuidLength: number): string {
    if (!uuidLength) {
      uuidLength = this.uuidLength ? this.uuidLength : DEFAULT_UUID_LENGTH;
    }

    const generator = seedrandom.xor128(val);

    let id: string = '';
    let randomPartIdx: number;

    if (uuidLength < 1) {
      throw new Error('Invalid UUID Length Provided');
    }

    //console.log('val ' + val);
    // Generate random ID parts from Dictionary.
    for (let j = 0; j < uuidLength; j += 1) {
      let randVal = Math.abs(generator.int32() % 100000) / 100000;
      //console.log('j ' + randVal);
      // randVal = randVal - Math.floor(randVal);

      //console.log('fffff ' + Math.floor(randVal * this.dictLength), this.dictLength);
      randomPartIdx = Math.floor(randVal * this.dictLength) % this.dictLength;
      //console.log('randomPartIdx ' + randomPartIdx);
      id += this.dict[randomPartIdx];
    }

    return id;
  }

  /**
   * Generates UUID by creating each part randomly.
   * @alias `const uid = new ShortUniqueId(); uid(uuidLength: number);`
   */
  public randomUUID(uuidLength: number): string {
    if (!uuidLength) {
      uuidLength = this.uuidLength ? this.uuidLength : DEFAULT_UUID_LENGTH;
    }

    let id: string = '';
    let randomPartIdx: number;
    let j: number;

    if (uuidLength < 1) {
      throw new Error('Invalid UUID Length Provided');
    }

    // Generate random ID parts from Dictionary.
    for (
      j = 0;
      0 <= uuidLength ? j < uuidLength : j > uuidLength;
    ) {
      randomPartIdx = Math.floor(Math.random() * this.dictLength) % this.dictLength;
      id += this.dict[randomPartIdx];
      if (0 <= uuidLength) {
        j += 1;
      } else {
        j -= 1;
      }
    }

    return id.toString();
  }

  /**
   * Calculates total number of possible UUIDs.
   *
   * Given that:
   *
   * - `H` is the total number of possible UUIDs
   * - `n` is the number of unique characters in the dictionary
   * - `l` is the UUID length
   *
   * Then `H` is defined as `n` to the power of `l`:
   *
   * ![](https://render.githubusercontent.com/render/math?math=%5CHuge%20H=n%5El)
   *
   * This function returns `H`.
   */
  availableUUIDs(uuidLength: number): number {
    if (!uuidLength) {
      uuidLength = this.uuidLength ? this.uuidLength : DEFAULT_UUID_LENGTH;
    }

    return Math.pow(new Set(...this.dict).size, uuidLength);
  }

  /**
   * Calculates approximate number of hashes before first collision.
   *
   * Given that:
   *
   * - `H` is the total number of possible UUIDs, or in terms of this library,
   * the result of running `availableUUIDs()`
   * - the expected number of values we have to choose before finding the
   * first collision can be expressed as the quantity `Q(H)`
   *
   * Then `Q(H)` can be approximated as the square root of the of the product
   * of half of pi times `H`:
   *
   * ![](https://render.githubusercontent.com/render/math?math=%5CHuge%20Q(H)%5Capprox%5Csqrt%7B%5Cfrac%7B%5Cpi%7D%7B2%7DH%7D)
   *
   * This function returns `Q(H)`.
   * @return
   */
  approxMaxBeforeCollision(rounds: number = this.availableUUIDs(this.uuidLength)): number {
      return Math.sqrt((Math.PI / 2) * rounds); // .toFixed(20)
  }

  /**
   * Calculates probability of generating duplicate UUIDs (a collision) in a
   * given number of UUID generation rounds.
   *
   * Given that:
   *
   * - `r` is the maximum number of times that `randomUUID()` will be called,
   * or better said the number of _rounds_
   * - `H` is the total number of possible UUIDs, or in terms of this library,
   * the result of running `availableUUIDs()`
   *
   * Then the probability of collision `p(r; H)` can be approximated as the result
   * of dividing the square root of the of the product of half of pi times `H` by `H`:
   *
   * ![](https://render.githubusercontent.com/render/math?math=%5CHuge%20p(r%3B%20H)%5Capprox%5Cfrac%7B%5Csqrt%7B%5Cfrac%7B%5Cpi%7D%7B2%7Dr%7D%7D%7BH%7D)
   *
   * This function returns `p(r; H)`.
   *
   * (Useful if you are wondering _"If I use this lib and expect to perform at most
   * `r` rounds of UUID generations, what is the probability that I will hit a duplicate UUID?"_.)
   */
  collisionProbability(rounds: number = this.availableUUIDs(this.uuidLength), uuidLength: number = this.uuidLength): number {
    return this.approxMaxBeforeCollision(rounds) / this.availableUUIDs(uuidLength); // .toFixed(20)
  }

  /**
   * Calculate a "uniqueness" score (from 0 to 1) of UUIDs based on size of
   * dictionary and chosen UUID length.
   *
   * Given that:
   *
   * - `H` is the total number of possible UUIDs, or in terms of this library,
   * the result of running `availableUUIDs()`
   * - `Q(H)` is the approximate number of hashes before first collision,
   * or in terms of this library, the result of running `approxMaxBeforeCollision()`
   *
   * Then `uniqueness` can be expressed as the additive inverse of the probability of
   * generating a "word" I had previously generated (a duplicate) at any given iteration
   * up to the the total number of possible UUIDs expressed as the quotiend of `Q(H)` and `H`:
   *
   * ![](https://render.githubusercontent.com/render/math?math=%5CHuge%201-%5Cfrac%7BQ(H)%7D%7BH%7D)
   *
   * (Useful if you need a value to rate the "quality" of the combination of given dictionary
   * and UUID length. The closer to 1, higher the uniqueness and thus better the quality.)
   */
  uniqueness(rounds: number = this.availableUUIDs(this.uuidLength)): number {
    const score: number = (1 - (this.approxMaxBeforeCollision(rounds) / rounds)); // .toFixed(20)

    return (score > 1) ? (1) : ((score < 0) ? 0 : score);
  }

}
