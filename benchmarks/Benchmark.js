const microtime = require('microtime');

const SECONDS = Math.pow(10, 6);
const MILLISECONDS = 1000;
const MIN_BENCHMARK_TIME = 2 * SECONDS;
const MAX_BENCHMARK_TIME = 60 * SECONDS;
const MIN_ITERATIONS = 8;
const TAB_SIZE = 2;
const TAB = ' '.repeat(TAB_SIZE);
const VOID_FN = () => 0;

let depth = 0;

let print = function(msg) {
    console.log(TAB.repeat(depth) + msg);
};

let formatRate = function(total, iterations) {
    let itPerSecond = iterations / (total / SECONDS);
    return `x ${itPerSecond.toFixed(2)} executions/second`;
};

let shouldUseMilliseconds = function(microseconds) {
    return microseconds < 2 * Math.pow(10, 4);
};

let formatTime = function(microseconds) {
    return shouldUseMilliseconds(microseconds)
        ? `${(microseconds / MILLISECONDS).toFixed(2)} milliseconds`
        : `${(microseconds / SECONDS).toFixed(2)} seconds`;
};

let formatTotals = function(total, iterations) {
    return `(${iterations} runs sampled over ${formatTime(total)})`;
};

let printBenchmarkStats = function(total, iterations) {
    let rateStr = formatRate(total, iterations),
        totalsStr = formatTotals(total, iterations);
    print(TAB + `${rateStr} - ${totalsStr}`);
};

let printFirstRunStats = function(firstRun) {
    print(TAB + `First run completed in ${formatTime(firstRun)}`);
};

let bail = function(totalTime, iterations) {
    return totalTime >= MAX_BENCHMARK_TIME ||
        (iterations >= MIN_ITERATIONS &&
         totalTime >= MIN_BENCHMARK_TIME)
};

let Benchmark = function(name, fn, options = {}) {
    print(name);
    let total = 0,
        iterations = 0,
        firstRun = 0,
        getSeed = options.seed ? options.seed : VOID_FN;
    while (!bail(total, iterations++)) {
        let seed = getSeed(),
            start = microtime.now();
        fn(seed);
        total += microtime.now() - start;
        if (iterations === 1) firstRun = total;
    }
    if (options.speedsUp) printFirstRunStats(firstRun);
    printBenchmarkStats(total, iterations);
};

Benchmark.Suite = function(name, fn) {
    print(name);
    depth++;
    try {
        fn();
    } catch (error) {
        console.error(error);
    }
    depth--;
};

module.exports = Benchmark;
