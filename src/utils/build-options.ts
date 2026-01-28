/**
 * @file Contains a generic function for building a configuration object in a functional way.
 */

/**
 * Constructs a configuration object by iteratively applying a series of modifier functions to a default value.
 * This function implements a functional builder pattern, where each function in `opts` receives the current
 * options object and returns a new object with modifications.
 *
 * @template TOpts The type of the options object being built.
 * @template TWith The type of the modifier function. It takes an options object and returns a full or partial options object.
 * @param {TOpts} defaultValue The initial options object.
 * @param {TWith[]} opts An array of modifier functions. Falsy values in the array are skipped.
 * @returns {TOpts} The final, constructed options object after all modifier functions have been applied.
 *
 * @example
 * const defaultOptions = { host: 'localhost', port: 8080 };
 * const withPort = (opts) => ({ port: opts.port + 1 });
 * const withHttps = () => ({ https: true });
 *
 * const finalOptions = buildOptions(defaultOptions, [withPort, withHttps]);
 * // finalOptions will be { host: 'localhost', port: 8081, https: true }
 */
export const buildOptions = <TWith extends (opts: TOpts) => TOpts | Partial<TOpts>, TOpts extends object>(
  defaultValue: TOpts, opts: TWith[]
): TOpts => {
  let buildedOpts: TOpts = defaultValue;
  for (const opt of opts) {
    if (!opt) continue;
    buildedOpts = { ...buildedOpts, ...opt(buildedOpts) };
  }

  return buildedOpts;
};
