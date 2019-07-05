import React from 'react';
import {
  storeTempMaterial,
} from './lib/chromeWrappers';
import {
  AddBitmapEngrave,
  AddScore,
  AddVectorEngrave,
  EditorMode,
  RemoveBitmapEngrave,
  RemoveScore,
  RemoveVectorEngrave,
  UpdateBitmapEngrave,
  UpdateCut,
  UpdateMaterial,
  UpdateScore,
  UpdateVectorEngrave,
} from './App';
import {
  PluginMaterial,
} from './lib/materialRaw';
import BitmapEngraveSettings from './editor/BitmapEngraveSettings';
import CutSettings from './editor/CutSettings';
import MaterialSettings from './editor/MaterialSettings';
import ScoreSettings from './editor/ScoreSettings';
import VectorEngraveSettings from './editor/VectorEngraveSettings';
import './MaterialEditor.css';

interface MaterialEditorProps {
  action: EditorMode;
  addBitmapEngrave: AddBitmapEngrave;
  addScore: AddScore;
  addVectorEngrave: AddVectorEngrave;
  material: PluginMaterial;
  removeScore: RemoveScore;
  removeBitmapEngrave: RemoveBitmapEngrave;
  removeVectorEngrave: RemoveVectorEngrave;
  updateBitmapEngrave: UpdateBitmapEngrave;
  updateCut: UpdateCut;
  updateMaterial: UpdateMaterial;
  updateScore: UpdateScore;
  updateVectorEngrave: UpdateVectorEngrave;
}

class MaterialEditor extends React.Component<MaterialEditorProps> {
  constructor(props: MaterialEditorProps) {
    super(props);
    this.storeLocalMaterial = this.storeLocalMaterial.bind(this);
  }

  storeLocalMaterial(event: React.FocusEvent<any>) {
    if (this.props.action === 'ADD') {
      storeTempMaterial(this.props.material);
    }
  }

  render() {
    const {
      action,
      material,
    } = this.props;

    if (action !== 'ADD' && action !== 'EDIT') {
      return null;
    }

    return (
      <>
        <MaterialSettings
          action={this.props.action}
          material={this.props.material}
          storeLocalMaterial={this.storeLocalMaterial}
          updateMaterial={this.props.updateMaterial}
        />
        <CutSettings
          cut={material.cut}
          storeLocalMaterial={this.storeLocalMaterial}
          updateCut={this.props.updateCut}
        />
        <ScoreSettings
          addScore={this.props.addScore}
          removeScore={this.props.removeScore}
          scores={this.props.material.scores}
          storeLocalMaterial={this.storeLocalMaterial}
          updateScore={this.props.updateScore}
        />
        <VectorEngraveSettings
          addVectorEngrave={this.props.addVectorEngrave}
          removeVectorEngrave={this.props.removeVectorEngrave}
          storeLocalMaterial={this.storeLocalMaterial}
          updateVectorEngrave={this.props.updateVectorEngrave}
          vectors={this.props.material.vectors}
        />
        <BitmapEngraveSettings
          addBitmapEngrave={this.props.addBitmapEngrave}
          bitmaps={this.props.material.bitmaps}
          removeBitmapEngrave={this.props.removeBitmapEngrave}
          storeLocalMaterial={this.storeLocalMaterial}
          updateBitmapEngrave={this.props.updateBitmapEngrave}
        />
      </>
    );
  }
}

export default MaterialEditor;
