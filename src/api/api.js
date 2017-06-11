/**
 * The api for all stores
 * The api is autogenerated once the module importer has been set
 * ```
 *   api.someStore.get.something => vuex magic string for vuex getter
 * ```
 */
export const api = {};
/**
 * Set api
 * @param {Object} newApi The new api
 */
export const setApi = (newApi) => {
  Object.keys(newApi).forEach((key) => {
    api[key] = newApi[key];
  });
};

/**
 * Match array of results strings and return the ones matching parent instances
 */
/**
 * Match array of results strings and return the ones matching parent instances
 * @param  {array} allResults    All unmatched results
 * @param  {array} pathInstances All the instances found in the instance branch
 * @return {array}               An array with results matched the the instance branch
 */
export const matchToInstances = (allResults, pathInstances) => {
  const results = [];
  allResults
    .forEach((path) => {
      let workingPath = path;
      let pathMatchesInstances;

      if (pathInstances.length === 0) {
        pathMatchesInstances = path.indexOf('$') === -1;
      } else {
        pathMatchesInstances = pathInstances.reduce((acc, curr) => {
          const $idx = workingPath.indexOf('$');
          const result = workingPath.indexOf(curr + '/') === $idx;
          workingPath = workingPath.slice($idx + curr.length + 1);
          return acc && result;
        }, true);
      }

      if (pathMatchesInstances) {
        results.push(path);
      }
    });

  return results;
};


function expandPath(self, path) {
  if (self['$vuex+']) {
    const instance = self.instance ? '$' + self.instance : '';
    if (self['$vuex+'].moduleName && self['$vuex+'].moduleName === self['$vuex+'].baseStoreName) {
      return self['$vuex+'].moduleName + instance + '/' + path;
    }

    const moduleName = self['$vuex+'].moduleName ? self['$vuex+'].moduleName + instance + '/' : '';
    return expandPath(self.$parent, moduleName + path);
  }

  return path;
}

/**
 * Input subpath and figure out full path
 * @param  {string} subpath The subpath to start from
 * @param  {Object} self    Vue component `.this`
 * @return {string}         Full path
 */
export const getFullPath = (subpath, self) => {
  if (!subpath || subpath.indexOf('/') < 0) {
    console.error('[Vuex+]: Cant calculate path', subpath, 'for', self);
    return undefined;
  }

  const proposedModuleName = subpath.slice(0, subpath.indexOf('/'));
  let moduleName = self['$vuex+'].moduleName;
  if (!moduleName) {
    moduleName = proposedModuleName;
  }

  if (proposedModuleName !== moduleName) {
    console.error('[Vuex+]: Trying to find path', subpath, 'outside module ', moduleName);
    return undefined;
  }

  const instance = self.instance ? '$' + self.instance : '';
  let path = moduleName + instance + subpath.slice(subpath.indexOf('/'));

  if (moduleName !== self['$vuex+'].baseStoreName) {
    path = expandPath(self.$parent, path);
  }

  return path;
};

/**
 * Set instance to all toplevel stores in `storeApi` paths
 * @param  {Object} storeApi      The store api
 * @param  {string} baseStoreName Base store name
 * @param  {string} newStoreName  New store name
 * @return {Object}               Store api remapped with toplevel instance names
 */
export function remapBaseStore(storeApi, baseStoreName, newStoreName) {
  newStoreName = newStoreName || baseStoreName;
  const result = {};
  Object.keys(storeApi).forEach((type) => {
    if (type === 'get' || type === 'act' || type === 'mutate') {
      result[type] = {};
      Object.keys(storeApi[type]).forEach((pathName) => {
        result[type][pathName] = storeApi[type][pathName].replace(baseStoreName, newStoreName);
      });
    } else {
      result[type] = remapBaseStore(storeApi[type], baseStoreName, newStoreName);
    }
  });

  return result;
}
