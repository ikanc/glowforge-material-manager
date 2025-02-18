import React from 'react';
import {
  toDisplayCutSpeed,
  toDisplayPowerWords,
} from '../lib/glowforgeUnits';
import { PluginMaterial } from '../material/materialPlugin';
import { precisionRound } from '../lib/utils';
import './MaterialViewer.css';

export type MaterialScoresViewerProps = {
  scores: PluginMaterial['scores'];
}

export default function MaterialScoresViewer(props: MaterialScoresViewerProps) {
  if (props.scores.length === 0) {
    return null;
  }

  return (
    <>
      <div className="viewer__headerRow">
        <p>Score Settings</p>
      </div>
      {
        props.scores.map((score, index) => {
          return (
            <>
              <div className="viewer__row" style={(index !== 0) ? { marginTop: '10px' } : undefined}>
                <p className="viewer__label">Name</p>
                <p className="viewer__value">{score.name}</p>
              </div>
              <div className="viewer__row">
                <p className="viewer__label">Speed</p>
                <p className="viewer__value">{toDisplayCutSpeed(score.speed)}</p>
                <p className="viewer__glowforge">{precisionRound(score.speed, 2)}</p>
              </div>
              <div className="viewer__row">
                <p className="viewer__label">Power</p>
                <p className="viewer__value">{toDisplayPowerWords(score.power)}</p>
                <p className="viewer__glowforge">{precisionRound(score.power, 2)}</p>
              </div>
              <div className="viewer__row">
                <p className="viewer__label">Passes</p>
                <p className="viewer__value">{score.passes}</p>
              </div>
              <div className="viewer__row" style={{marginBottom: '10px'}}>
                <p className="viewer__label">Focal Offset (mm)</p>
                <p className="viewer__value">{score.focalOffset}</p>
              </div>
              {(props.scores.length > 1 && index !== props.scores.length - 1) ? <hr /> : null}
            </>
          );
        })
      }
    </>
  );
}
