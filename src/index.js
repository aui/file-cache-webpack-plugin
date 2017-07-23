/* eslint-disable no-shadow */
import path from 'path';
import findCacheDir from 'find-cache-dir';
import { get, put } from './fs-cache';
import Serialization from './serialization';
import versions from './versions';
import whitelist from './whitelist';

class FileCacheWebpackPlugin {
  constructor({
    cacheDirectory = findCacheDir({ name: 'fs-cache-webpack-plugin' }),
    cacheName = 'cache.json',
    cacheVersion = `${versions.webpack}|${versions.plugin}`,
    // TODO cacheMax
  } = {}) {
    this.cacheDirectory = cacheDirectory;
    this.cacheName = cacheName;
    this.cacheFile = path.resolve(cacheName, cacheName);
    this.serialization = new Serialization(whitelist);
    this.cacheVersion = cacheVersion;
  }
  apply(compiler) {
    if (Array.isArray(compiler.compilers)) {
      compiler.compilers.forEach((c, idx) => {
        c.apply(new FileCacheWebpackPlugin({
          cacheName: `${idx}.${this.cacheName}`,
        }));
      });
    } else {
      compiler.plugin('watch-run', (...args) => this.loadCache(...args));
      compiler.plugin('run', (...args) => this.loadCache(...args));
      compiler.plugin('make', (...args) => this.applyCache(...args));
      compiler.plugin('after-compile', (...args) => this.saveCache(...args));
    }
  }
  applyCache(compilation, callback) {
    if (!compilation.notCacheable && this.cacheStorage) {
      compilation.cache = compilation.cache || {}; // eslint-disable-line no-param-reassign
      Object.assign(compilation.cache, this.cacheStorage);
    }
    callback();
  }
  loadCache(compiler, callback) {
    if (this.cacheFile) {
      get(this.cacheFile, this.cacheVersion).then(data => this.serialization.parse(data)).then((cache) => {
        this.cacheStorage = cache;
        callback();
      }, () => {
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
      const data = this.serialization.stringify(compilation.cache);
      put(this.cacheFile, data, this.cacheVersion).then(done, done);
    } else {
      callback();
    }
  }
}

export default FileCacheWebpackPlugin;
