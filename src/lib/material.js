import {
  getMaterials,
  storeMaterials,
  storeRawMaterials,
  getRawMaterials
} from './chromeWrappers';

async function removeMaterial(materialId) {
  console.log(`Removing material ${materialId}`);
  const materials = await getMaterials();
  const newMaterials = await storeMaterials(
    materials.filter(material => material.id !== materialId)
  );
  console.log(`Material removed ${materialId}`);
  return newMaterials;
}

async function removeRawMaterial(thickName, name) {
  console.log(`Removing raw material ${thickName} ${name}`);
  const rawMaterials = await getRawMaterials();
  const newRawMaterials = await storeRawMaterials(
    rawMaterials.filter(material => material.thickName + material.name !== thickName + name )
  );
  console.log(`Raw material removed ${thickName} ${name}`);
  return newRawMaterials;
}

/**
 * Creates a brand new custom material.
 */
function createMaterial(params, id) {
  console.log(params)
  let material = {
    id: `Custom:${id}`,
    title: `${params.thickName} ${params.name}`,
    sku: '',
    nominal_thickness: params.thickness,
    thickness_name: params.thickName,
    variety: {
      name: `${params.thickName.toLowerCase().replace(/[ ]/g, '-')}-${params.name.toLowerCase().replace(/[ ]/g, '-')}`,
      common_name: `${params.thickName} ${params.name}`,
      type_name: params.name,
      thumbnails: [
        "//images.ctfassets.net/ljtyf78xujn2/LPH1C4ibUkQimYKuA6iAq/c5abd83cffd111e8366daa2c137e6f19/Leather-1.png"
      ],
      display_options: null
    },
    settings: [
      createSettings(params, 'basic'),
      createSettings(params, 'pro')
    ]
  };

  return material;
}

/**
 * Creates the settings for a given tube type.
 */
function createSettings(params, tubeType) {
  let settings = {
    description: `${params.thickName} ${params.name} Settings`,
    active_date: "2017-04-06T00:00-07:00",
    environment: [
      "production"
    ],
    tube_type: tubeType,
    cut_setting: createCutSettings(params),
    score_settings: [
      createScoreSettings('High Quality', params),
      createScoreSettings('Shallow', params)
    ],
    vector_engrave_settings: [

    ],
    bitmap_engrave_settings: [

    ]
  }
  return settings;
}

/**
 * Creates a new set of cut settings.
 */
function createCutSettings(params) {
  return {
    power: params.cut.power,
    speed: params.cut.speed,
    passes: params.cut.passes,
    focal_offset: params.cut.focalOffset
  };
}

/**
 * Creates a new set of score settings.
 */
function createScoreSettings(name, params) {
  return {
    power: params.score.power,
    speed: params.score.speed,
    passes: params.score.passes,
    focal_offset: params.score.focalOffset,
    uses: [
      "default"
    ],
    display_color_mask: null,
    outcome: {
      name: name,
      dev_id: name.toLowerCase().replace(/[ ]/g, '-')
    }
  };
}

export {
  createMaterial,
  removeMaterial,
  removeRawMaterial,
};
