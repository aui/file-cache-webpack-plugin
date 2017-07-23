import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const mkdirs = (dirname, callback) => {
  fs.access(dirname, (errors) => {
    if (errors) {
      mkdirs(path.dirname(dirname), () => {
        fs.mkdir(dirname, callback);
      });
    } else {
      callback();
    }
  });
};

const readFile = promisify(fs.readFile);
const writeFile = (...params) => {
  const [file] = params;
  const dirname = path.dirname(file);
  return promisify(mkdirs)(dirname).then(() => promisify(fs.writeFile)(...params));
};


export const get = (cacheFile, identifier) => (readFile(cacheFile, 'utf8')
  .then(string => JSON.parse(string))
  .then(({ data, metadata }) => {
    if (metadata.identifier !== identifier) {
      return Promise.reject(new Error('The cache has expired'));
    }
    return data;
  }));

export const put = (cacheFile, data, identifier) => (writeFile(cacheFile, JSON.stringify({
  data,
  metadata: {
    identifier,
  },
}), 'utf8'));
