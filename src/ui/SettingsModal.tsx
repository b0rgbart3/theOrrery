import { Modal } from "./Modal";
import { ORBIT_DISPLAY_OPTIONS, type OrbitDisplayMode } from "../scene/orbitDisplay";

interface SettingsModalProps {
  showAxisLine: boolean;
  onShowAxisLineChange: (show: boolean) => void;
  showPlanetLabels: boolean;
  onShowPlanetLabelsChange: (show: boolean) => void;
  showZodiac: boolean;
  onShowZodiacChange: (show: boolean) => void;
  orbitMode: OrbitDisplayMode;
  onOrbitModeChange: (mode: OrbitDisplayMode) => void;
  onClose: () => void;
}

export function SettingsModal({
  showAxisLine,
  onShowAxisLineChange,
  showPlanetLabels,
  onShowPlanetLabelsChange,
  showZodiac,
  onShowZodiacChange,
  orbitMode,
  onOrbitModeChange,
  onClose,
}: SettingsModalProps) {
  return (
    <Modal title="Settings" onClose={onClose} className="modal--compact">
      <div className="modal__controls">
        <label className="modal__toggle">
          <input
            type="checkbox"
            checked={showAxisLine}
            onChange={(event) => onShowAxisLineChange(event.target.checked)}
          />
          Show planet axis line
        </label>

        <label className="modal__toggle">
          <input
            type="checkbox"
            checked={showPlanetLabels}
            onChange={(event) => onShowPlanetLabelsChange(event.target.checked)}
          />
          Show planet labels
        </label>

        <label className="modal__toggle">
          <input
            type="checkbox"
            checked={showZodiac}
            onChange={(event) => onShowZodiacChange(event.target.checked)}
          />
          Show zodiac layer
        </label>

        <label className="modal__toggle">
          Orbits:
          <select
            value={orbitMode}
            onChange={(event) => onOrbitModeChange(event.target.value as OrbitDisplayMode)}
            aria-label="Orbit path display"
          >
            {ORBIT_DISPLAY_OPTIONS.map((option) => (
              <option key={option.mode} value={option.mode}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Modal>
  );
}
