import {
  Source,
  RawSource,
  OriginalSource,
  SourceMapSource,
  LineToLineMappedSource,
  CachedSource,
  ConcatSource,
  ReplaceSource,
  PrefixSource,
} from 'webpack-sources';
import { SourceLocation } from 'acorn';
import ContextModule from 'webpack/lib/ContextModule';
import DelegatedModule from 'webpack/lib/DelegatedModule';
import DllModule from 'webpack/lib/DllModule';
import ExternalModule from 'webpack/lib/ExternalModule';
import Module from 'webpack/lib/Module';
import MultiModule from 'webpack/lib/MultiModule';
import NodeStuffPlugin from 'webpack/lib/NodeStuffPlugin';
import NormalModule from 'webpack/lib/NormalModule';
import RawModule from 'webpack/lib/RawModule';
import HarmonyCompatibilityDependency from 'webpack/lib/dependencies/HarmonyCompatibilityDependency';
import HarmonyImportDependency from 'webpack/lib/dependencies/HarmonyImportDependency';
import HarmonyExportHeaderDependency from 'webpack/lib/dependencies/HarmonyExportHeaderDependency';
import HarmonyExportExpressionDependency from 'webpack/lib/dependencies/HarmonyExportExpressionDependency';
import ModuleReason from 'webpack/lib/ModuleReason';
import Chunk from 'webpack/lib/Chunk';
import Entrypoint from 'webpack/lib/Entrypoint';
import Parser from 'webpack/lib/Parser';
import { decode } from './serialization';


const modules = {
  SourceLocation,
  Source,
  RawSource,
  OriginalSource,
  SourceMapSource,
  LineToLineMappedSource,
  CachedSource,
  ConcatSource,
  ReplaceSource,
  PrefixSource,
  ContextModule,
  DelegatedModule,
  DllModule,
  ExternalModule,
  Module,
  MultiModule,
  NodeStuffPlugin,
  NormalModule,
  RawModule,
  HarmonyCompatibilityDependency,
  HarmonyImportDependency,
  HarmonyExportHeaderDependency,
  HarmonyExportExpressionDependency,
  ModuleReason,
  Chunk,
  Entrypoint,
  Parser,
};

export default Object.keys(modules).reduce((map, name) => {
  map[name] = (value) => { // eslint-disable-line no-param-reassign
    Object.setPrototypeOf(value, modules[name].prototype);
    return value;
  };
  return map;
}, decode.rules);
