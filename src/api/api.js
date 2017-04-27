/**
 * The api for all stores
 * The api is autogenerated once the module importer has been set
 * ```
 *   api.aStore.get.something => vuex magic string for vuex getter
 * ```
 */
export const api = {};

/**
 * Get subtree from map matching key
 * TODO -- verify --
 */
export function extractSubstoreApi(map, key) {
  const submodules = Object.keys(map).filter(k => k !== 'get' && k !== 'act' && k !== 'mutate');
  const keyIsInMap = submodules.indexOf(key) >= 0;

  if (keyIsInMap) {
    return map[key];
  }

  // TODO Speed up with some nice algorithm
  let result;
  submodules.forEach((submodule) => {
    const searchResult = extractSubstoreApi(map[submodule], key);
    if (searchResult) {
      result = searchResult;
    }
  });

  return result;
}


export const getFullPath = (config) => {
  const suffix = config.instance ? '$' + config.instance : '';
  const getterKey = config.subpath.match(/[a-zA-Z]*/)[0];
  let localApi = api[config.vuexPlus.baseStoreName];
  if (getterKey !== config.vuexPlus.baseStoreName) {
    localApi = extractSubstoreApi(api[config.vuexPlus.baseStoreName], getterKey + suffix);
  }

  if (!localApi) {
    const instance = config.subpath.split('/')[0] + '$' + config.instance;
    console.error('[Vuex+ warn]: Cant find substore instance "' + instance + '" in "' + config.container + '"');
    return undefined;
  }

  const fullPath = localApi[config.method][config.key]
                     .replace(config.vuexPlus.baseStoreName, config.vuexPlus.storeInstanceName);

  return fullPath;
};

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
