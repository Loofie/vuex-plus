/**
 * Finds a modules name by looking at its parent
 * @param  {object} state Vuex modules state
 * @return {String}       Module name
 */
function findModuleNameFromParent(state) {
  for (const prop in state.$parent) {
    if (state.$parent[prop] === state) {
      return prop;
    }
  }
}

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
 * Combines info from ['vuex+'] property to root store name with instance
 * @param  {object} state Vuex modules state
 * @return {String}       Root store name
 */
function getRootStoreName(state) {
  let moduleName = state['vuex+'].storeName;
  if (state['vuex+'].rootInstance) {
    moduleName += '$' + state['vuex+'].rootInstance;
  }
  return moduleName;
}

/**
 * Traverses state upwards and returns the path with instances
 * @param  {Object} state     Vuex modules state
 * @param  {String} [path=''] Start path
 * @return {String}           The full path
 */
function findPath(state, path = '') {
  if (state.$parent) {
    let moduleName = findModuleNameFromParent(state.$parent);
    if (moduleName) {
      moduleName += '/';
    } else {
      moduleName = '';
    }
    return findPath(state.$parent, moduleName + path);
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

  if (subpath.slice(0, 6) === '$root/') {
    return subpath.replace(/^\$root/, self['$vuex+'].storeInstanceName);
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
 * Get store instance name
 * @param  {string} storeName Store name
 * @param  {string} instance  Instance name
 * @return {string}           Store instance name
 */
export const getStoreInstanceName = (storeName, instance) => {
  if (instance) {
    return storeName + '$' + instance;
  }
  return storeName;
};

/**
 * Convert kebab and snake case to camelCase
 * @param  {string} str The string to Convert
 * @return {string}     Camel cased string
 */
export const toCamelCase = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.replace(/(-|_)([\w])/g, s => s[1].toUpperCase());
};

/**
 * Return the local path of the instance branch
 * @param  {string} path  The global path
 * @param  {Object} state The vuex context state
 * @return {string}       The local path with all instances
 */
export const getLocalPath = (path, state) => {
  if (path.match(/^\$parent\//)) {
    path = path.replace('$parent/', findPath(state));
  }

  if (path.match(/^\$root\//)) {
    path = path.replace('$root', getRootStoreName(state));
  }

  if (path.includes('$parent')) {
    path = path.replace('$parent', findModuleNameFromParent(state.$parent));
  }

  return path;
};

/**
 * Returns subInstances from local path
 * @param  {string} path Path to explore
 * @return {array}       Subinstances as ordered array
 */
export const getSubInstances = (path) => {
  if (path) {
    const subInstances = path.match(/\$\w*/g);
    return subInstances;
  }

  return [];
};
