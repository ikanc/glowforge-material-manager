import React from 'react';
import PropTypes from 'prop-types';
import MaterialEditor from './MaterialEditor';
import MaterialList from './MaterialList';
import MaterialViewer from './MaterialViewer';
import Message from './Message';
import SyncStatus from './SyncStatus';
import {
  createMaterial,
  removeCloudMaterial,
  removeMaterial,
  removeRawMaterial,
  sendCloudMaterial,
} from './lib/material';
import { IconPlus } from './Icons';
import {
  clearTempMaterial,
  forceSync,
  getBytesInUse,
  getShouldUpdate,
  reload,
  storeMaterials,
  storeRawMaterials,
} from './lib/chromeWrappers';
import {
  STATE_ADD,
  STATE_DISPLAY,
  STATE_EDIT,
  STATE_SELECTED,
 } from './state';
 import {
  EMPTY_BITMAP_ENGRAVE,
  EMPTY_MATERIAL,
  EMPTY_SCORE,
  EMPTY_VECTOR_ENGRAVE,
 } from './lib/constants';
 import './App.css';
 import logo from './logo.svg';

class App extends React.Component {
  state = {
    action: STATE_DISPLAY,
    cloudStorageBytesUsed: 0,
    message: '',
    messageColor: null,
    material: {
      ...EMPTY_MATERIAL,
    },
    materials: [],
    rawMaterials: [],
    synchronized: true,
  };

  componentDidMount() {
    const additionalState = {};
    if (this.props.tempMaterial) {
      additionalState.action = STATE_ADD;
      additionalState.material = this.props.tempMaterial;
      additionalState.message = 'Custom material settings have been resotred from a previous session.';
      additionalState.messageColor = null;
    }

    this.setState({
      cloudStorageBytesUsed: this.props.cloudStorageBytesUsed,
      materials: this.props.materials,
      rawMaterials: this.props.rawMaterials,
      synchronized: !this.props.shouldUpdate,
      ...additionalState,
    });

    setInterval(async () => {
      const cloudStorageBytesUsed = await getBytesInUse();
      const shouldUpdate = await getShouldUpdate();
      if (this.state.synchronized === shouldUpdate) {
        this.setState({
          cloudStorageBytesUsed,
          synchronized: !shouldUpdate,
        });
      } else {
        this.setState({
          cloudStorageBytesUsed,
        });
      }
    }, 5000);
  }

  updateMaterial(key, value) {
    this.setState({
      material: {
        ...this.state.material,
        [key]: value,
      },
    });
  }

  updateCut(cut) {
    this.setState({
      material: {
        ...this.state.material,
        cut,
      },
    });
  }

  addScore() {
    this.setState({
      material: {
        ...this.state.material,
        scores: [ ...this.state.material.scores, EMPTY_SCORE ],
      },
    });
  }

  updateScore(index, score) {
    const scores = this.state.material.scores;
    scores[index] = score;
    this.setState({
      material: {
        ...this.state.material,
        scores: [...scores],
      }
    });
  }

  addVectorEngrave() {
    this.setState({
      material: {
        ...this.state.material,
        vectors: [ ...this.state.material.vectors, EMPTY_VECTOR_ENGRAVE ],
      },
    });
  }

  updateVectorEngrave(index, vector) {
    const vectors = this.state.material.vectors;
    vectors[index] = vector;
    this.setState({
      material: {
        ...this.state.material,
        vectors: [...vectors],
      }
    });
  }

  addBitmapEngrave() {
    this.setState({
      material: {
        ...this.state.material,
        bitmaps: [ ...this.state.material.bitmaps, EMPTY_BITMAP_ENGRAVE ],
      },
    });
  }

  updateBitmapEngrave(index, bitmap) {
    const bitmaps = this.state.material.bitmaps;
    bitmaps[index] = bitmap;
    this.setState({
      material: {
        ...this.state.material,
        bitmaps: [...bitmaps],
      }
    });
  }

  async addMaterial() {
    const newMaterial = createMaterial(this.state.material, this.state.materials.length);
    const duplicate = this.state.materials.find(material => {
      return material.id === newMaterial.id || material.title === newMaterial.title;
    });

    if (duplicate) {
      this.setState({
        message: 'A material with the same name already exists.',
        messageColor: '#CC3A4B',
      });
      return;
    }

    // Create and store.
    const newMaterials = [...this.state.materials, newMaterial];
    const newRawMaterials = [...this.state.rawMaterials, this.state.material];
    await storeMaterials(newMaterials)
    await storeRawMaterials(newRawMaterials);
    await clearTempMaterial();

    // Send materials to the cloud
    await sendCloudMaterial(this.state.material);

    this.setState({
      action: STATE_DISPLAY,
      material: { ...EMPTY_MATERIAL },
      materials: newMaterials,
      message: '',
      messageColor: null,
      rawMaterials: newRawMaterials,
      synchronized: false,
    });
  }

  async editMaterial(title) {

    const duplicates = this.state.materials.filter(material => {
      return material.title === `${title}`;
    });

    if (duplicates.length !== 1) {
      this.setState({
        message: 'Could not update. A material with the same name already exists.',
        messageColor: '#CC3A4B',
      });
      return;
    }

    // Update
    const materialId = duplicates[0].id.split(':')[1];
    const newMaterial = createMaterial(this.state.material, materialId)

    // Store
    const newMaterials = this.state.materials.filter(material => {
      return material.title !== `${title}`;
    });
    newMaterials.push(newMaterial)
    const newRawMaterials = this.state.rawMaterials.filter(material => {
      return `${material.thickName} ${material.name}` !== `${title}`;
    });
    newRawMaterials.push(this.state.material);

    await storeMaterials(newMaterials)
    await storeRawMaterials(newRawMaterials);

    // Send updated materials to the cloud
    await removeCloudMaterial(this.state.materials.find(material => {
      return material.title === `${title}`;
    }));
    await sendCloudMaterial(this.state.material);

    this.setState({
      action: STATE_DISPLAY,
      material: { ...EMPTY_MATERIAL },
      materials: newMaterials,
      message: '',
      messageColor: null,
      rawMaterials: newRawMaterials,
      synchronized: false,
    });
  }

  async remove(id, title) {
    console.log(title)
    await removeCloudMaterial(this.state.rawMaterials.find(material => {
      return `${material.thickName} ${material.name}` === `${title}`;
    }));
    const materials = await removeMaterial(id);
    const rawMaterials = await removeRawMaterial(title);
    this.setState({
      materials,
      rawMaterials,
      synchronized: false,
    });
    await reload();
  }

  async forceSyncronize() {
    await forceSync();
    this.setState({
      synchronized: false,
    });
  }

  /**
   * Switches to `add material` mode and resets the current material state to
   * a blank material.
   */
  async modeAdd() {
    await clearTempMaterial();
    this.setState({
      action: STATE_ADD,
      material: {
        ...EMPTY_MATERIAL,
      },
    });
  }

  /**
   * Cancels the current input mode, resetting the materiall state and clearing
   * any system messages.
   */
  async modeCancel() {
    await clearTempMaterial();
    this.setState({
      action: STATE_DISPLAY,
      material: {
        ...EMPTY_MATERIAL,
      },
      message: '',
      messageColor: null,
    });
  }

  /**
   * Switches to `edit material` mode and opens up an existing material for
   * alterations.
   *
   * @param {string} title The material tile.
   */
  async modeEdit(title) {
    await clearTempMaterial();
    const material = this.state.rawMaterials.find(material => {
      return `${material.thickName} ${material.name}` === title;
    });
    this.setState({
      action: STATE_EDIT,
      material: {
        ...material,
      },
    });
  }

  /**
   * Switches to `selected mode` opens up a material for viewing its current
   * settings.
   *
   * @param {string} title The material title.
   */
  async modeSelect(title) {
    await clearTempMaterial();
    const material = this.state.rawMaterials.find(material => {
      return `${material.thickName} ${material.name}` === title;
    });
    this.setState({
      action: STATE_SELECTED,
      material: {
        ...material,
      },
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Glowforge Material Manager</h1>
          <SyncStatus
            connected={this.props.connected}
            forceSync={this.forceSyncronize.bind(this)}
            synchronized={this.state.synchronized}
          />
          <span>{`Cloud Storage Used ${this.state.cloudStorageBytesUsed} / 102,400`}</span>
        </header>
        <Message message={this.state.message} color={this.state.messageColor} />
        <div className="App-grid">
          <div className="col-materials">
            <div className="App-materials">
              <MaterialList
                editMaterial={this.modeEdit.bind(this)}
                materials={this.state.materials}
                removeMaterial={this.remove.bind(this)}
                selectMaterial={this.modeSelect.bind(this)}
              />
            </div>
          </div>
          <div className="col-contents">
            <div className="App-intro">
              <p style={{float: 'left', width: '250px'}}>
                Add your own custom material settings here.
              </p>
              <div style={{float: 'right', margin: '14px 14px 14px 0'}}>
                <IconPlus click={this.modeAdd.bind(this)} />
              </div>
            </div>
            <MaterialViewer
              action={this.state.action}
              cancelMaterial={this.modeCancel.bind(this)}
              material={this.state.material}
            />
            <MaterialEditor
              action={this.state.action}
              addBitmapEngrave={this.addBitmapEngrave.bind(this)}
              addMaterial={this.addMaterial.bind(this)}
              addScore={this.addScore.bind(this)}
              addVectorEngrave={this.addVectorEngrave.bind(this)}
              cancelMaterial={this.modeCancel.bind(this)}
              editMaterial={this.editMaterial.bind(this)}
              material={this.state.material}
              updateBitmapEngrave={this.updateBitmapEngrave.bind(this)}
              updateCut={this.updateCut.bind(this)}
              updateMaterial={this.updateMaterial.bind(this)}
              updateScore={this.updateScore.bind(this)}
              updateVectorEngrave={this.updateVectorEngrave.bind(this)}
            />
          </div>
        </div>
      </div>
    );
  }
}

App.propTypes = {
  connected: PropTypes.bool.isRequired,
  cloudStorageBytesUsed: PropTypes.number.isRequired,
  materials: PropTypes.array.isRequired,
  tempMaterial: PropTypes.object,
};

export default App;
