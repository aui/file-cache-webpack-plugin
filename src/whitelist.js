import { SourceLocation } from 'acorn';
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
// import ConcatenatedModule from 'webpack/lib/ConcatenatedModule';
import ContextModule from 'webpack/lib/ContextModule';
import DelegatedModule from 'webpack/lib/DelegatedModule';
import DllModule from 'webpack/lib/DllModule';
import ExternalModule from 'webpack/lib/ExternalModule';
// import LocalModule from 'webpack/lib/LocalModule';
import Module from 'webpack/lib/Module';
import MultiModule from 'webpack/lib/MultiModule';
import NodeStuffPlugin from 'webpack/lib/NodeStuffPlugin';
import NormalModule from 'webpack/lib/NormalModule';
import RawModule from 'webpack/lib/RawModule';
// import WebpackMissingModule from 'webpack/lib/WebpackMissingModule';
import HarmonyCompatibilityDependency from 'webpack/lib/dependencies/HarmonyCompatibilityDependency';
import HarmonyImportDependency from 'webpack/lib/dependencies/HarmonyImportDependency';
import HarmonyExportHeaderDependency from 'webpack/lib/dependencies/HarmonyExportHeaderDependency';
import HarmonyExportExpressionDependency from 'webpack/lib/dependencies/HarmonyExportExpressionDependency';
import ModuleReason from 'webpack/lib/ModuleReason';

export default {
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
};
