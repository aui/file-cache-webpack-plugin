/* eslint-disable no-shadow */
import path from 'path';
import findCacheDir from 'find-cache-dir';
import { get, put } from './fs-cache';
import { encode, decode } from './serialization';
import { encodeRules, decodeRules } from './serialization-rules';
import versions from './versions';

let idx = 0;

export default class FileCacheWebpackPlugin {
  constructor({
    cacheDirectory = findCacheDir({ name: 'fs-cache-webpack-plugin' }),
    cacheVersion = `${versions.webpack}|${versions.plugin}`,
    cacheId = idx,
    // TODO cacheMaxsize
  } = {}) {
    this.cacheDirectory = cacheDirectory;
    this.cacheVersion = cacheVersion;
    this.cacheFile = path.resolve(cacheDirectory, `${cacheId}.json`);
    this.cache = {};
    idx += 1;
  }
  apply(compiler) {
    if (Array.isArray(compiler.compilers)) {
      compiler.compilers.forEach((c) => {
        c.apply(new FileCacheWebpackPlugin({
          cacheDirectory: this.cacheDirectory,
          cacheVersion: this.cacheVersion,
        }));
      });
    } else {
      compiler.options.cache = this.cache; // eslint-disable-line no-param-reassign
      compiler.plugin('watch-run', (...args) => this.loadCache(...args));
      compiler.plugin('run', (...args) => this.loadCache(...args));
      compiler.plugin('done', (...args) => this.saveCache(...args));
    }
  }
  loadCache(compiler, callback) {
    if (this.cacheFile) {
      get(this.cacheFile, this.cacheVersion)
        .then((cache) => {
          try {
            return decode(cache, decodeRules);
          } catch (error) {
            error.message = `FileCacheWebpackPlugin - Serialization failed: ${error.message}`;
            return Promise.reject(error);
          }
        })
        .then((cache) => {
          Object.assign(this.cache, cache);
          callback();
        })
        .catch(() => {
          callback();
        });
    } else {
      callback();
    }
  }
  saveCache() {
    if (this.cacheFile) {
      put(this.cacheFile, encode(this.cache, encodeRules), this.cacheVersion).catch((error) => {
        error.message = `FileCacheWebpackPlugin - Update cache failed: ${error.message}`; // eslint-disable-line no-param-reassign
        return Promise.reject(error);
      });
    }
  }
}
