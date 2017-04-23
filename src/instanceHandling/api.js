import { toCamelCase } from './helpers.js';

let importer;

/**
 * The api for all stores
 * The api is autogenerated once the module importer has been set
 * ```
 *   api.aStore.get.something => vuex magic string for vuex getter
 * ```
 */
export const api = {};

/**
 * Set the importer that can read all stores via require.context
 */
export const generateAPI = (newImporter) => {
  importer = newImporter;

  const modules = importer.getModules();
  Object.keys(modules).forEach((module) => {
    const camelCasedName = toCamelCase(modules[module].name);
    api[camelCasedName] = modules[module].api;
  });
};
