/* eslint-disable no-shadow */
import path from 'path';
import findCacheDir from 'find-cache-dir';
import { get, put } from './fs-cache';
import { encode, decode } from './serialization';
import { encodeRules, decodeRules } from './serialization-rules';
import versions from './versions';

class FileCacheWebpackPlugin {
  constructor({
    cacheDirectory = findCacheDir({ name: 'fs-cache-webpack-plugin' }),
    cacheName = 'cache.json',
    cacheVersion = `${versions.webpack}|${versions.plugin}`,
    // TODO cacheMax
  } = {}) {
    this.cacheDirectory = cacheDirectory;
    this.cacheName = cacheName;
    this.cacheFile = path.resolve(cacheDirectory, cacheName);
    this.cacheVersion = cacheVersion;
    this.cache = {
      'fs-cache-webpack-plugin': versions.plugin,
    };
  }
  apply(compiler) {
    if (Array.isArray(compiler.compilers)) {
      compiler.compilers.forEach((c, idx) => {
        c.apply(new FileCacheWebpackPlugin({
          cacheName: `${idx}.${this.cacheName}`,
        }));
      });
    } else {
      compiler.options.cache = this.cache; // eslint-disable-line no-param-reassign
      compiler.plugin('watch-run', (...args) => this.loadCache(...args));
      compiler.plugin('run', (...args) => this.loadCache(...args));
      compiler.plugin('after-compile', (...args) => this.saveCache(...args));
    }
  }
  loadCache(compiler, callback) {
    if (this.cacheFile) {
      get(this.cacheFile, this.cacheVersion).then((cache) => {
        Object.assign(this.cache, decode(cache, decodeRules));
        callback();
      }).catch(() => {
        callback();
      });
    } else {
      callback();
    }
  }
  saveCache(compilation, callback) {
    if (this.cacheFile) {
      const done = () => {
        callback();
      };
      put(this.cacheFile, encode(compilation.cache, encodeRules), this.cacheVersion).then(done, done);
    } else {
      callback();
    }
  }
}

export default FileCacheWebpackPlugin;
