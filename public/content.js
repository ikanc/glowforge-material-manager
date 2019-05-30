// Develop:
// Automatically set using your the runtime.
//
// Webstore Test:
// const extensionId = 'oehpknagabkobfeijndckpapicmfoknn';
//
// Webstore Prod:
// const extensionId = 'adabmafjmdcjnihkmggljljeopjfghii';
const { extensionId } = window;

function log(message) {
  if (window.extensionDevMode) {
    console.log(message);
  }
}

/**
 * Sets the units in the GF UI
 *
 * @param unitType Either `METRIC` or `IMPERIAL`
 */
function setUnits(unitType) {
  window.store.dispatch({
    type: 'SET_UNITS',
    unitType,
  });
}

/**
 * Sets the selected material.
 *
 * @param materialId The material id.
 */
function setMaterial(materialId) {
  window.store.dispatch({
    type: 'SET_MATERIAL',
    id: materialId,
  });
}

/**
 * Adds a single material to the UI.
 *
 * @param material The material to add.
 */
function addMaterial(material) {
  window.store.dispatch({
    type: 'ADD_MATERIAL',
    material,
  });
}

/**
 * Add many materials to the UI.
 *
 * @param materials An array of materials to add.
 */
function addMaterials(materials) {
  window.store.dispatch({
    type: 'ADD_MATERIALS',
    materials,
  });
}

/**
 * Leverage the redux actions to inject custom materials.
 */
function handleMaterialCheck(response) {
  if (!response.messages) {
    log('bad message');
    return;
  }

  for (let i = 0; i < response.messages.length; i += 1) {
    const message = response.messages[i];

    log('material check response');
    if (!message) {
      return;
    }

    if (message.type === 'setMaterials') {
      log('updating materials');
      addMaterials(message.materials);
    } else if (message.type === 'setMaterial') {
      log('updating material');
      addMaterial(message.material);
    } else if (message.type === 'clone') {
      log('clonding design');
    } else if (message.type === 'toggleUnits') {
      log('toggle units');
      setUnits(message.unitType);
    } else if (message.type === 'selectMaterial') {
      log('select material');
      setMaterial(message.materialId);
    }
  }

  // Clone Design
}

/**
 * Additional tasks to execute after the first refresh.
 */
function handleForceRefresh() {
  log('force refresh response');
}

/**
 * Checks and displays any runtime errors.
 */
function checkLastRuntimeError() {
  if (chrome.runtime.lastError) {
    log(`Last seen error: ${chrome.runtime.lastError.message}`);
    chrome.runtime.lastError = null;
  }
}

/**
 * Request the materials created by the user in the extension.
 */
setInterval(() => {
  chrome.runtime.sendMessage(
    extensionId, {
      materialCheck: true,
    },
    (response) => {
      handleMaterialCheck(response);
      checkLastRuntimeError();
    },
  );
}, 5000);

/**
 * Set a one-time refresh on content injection. New tabs, refreshes.
 *
 * Sets shouldUpdate to true.
 */
setTimeout(() => {
  chrome.runtime.sendMessage(
    extensionId, {
      forceRefresh: true,
    },
    (response) => {
      handleForceRefresh(response);
      checkLastRuntimeError();
    },
  );
}, 0);



window.store.subscribe(() => {
  // const state = window.store.getState();

  // state.get('machines').get('machineMap').get([...state.get('machines').get('machineMap').keys()][0]).get('preloadedLidImage');

  // Send image to plugin.

  // Check for qr code

  // Send set material command back.

  // console.log('State changed.');
});
