import { Modal } from "./Modal";
import { ORBIT_DISPLAY_OPTIONS, type OrbitDisplayMode } from "../scene/orbitDisplay";
import { PLANETS } from "../data/planets";

// Earth has no meaningful sign relative to itself (see PlanetZodiacRay), so
// it's left out of the per-planet ray list.
const RAY_ELIGIBLE_PLANETS = PLANETS.filter((planet) => planet.name !== "Earth");

interface SettingsModalProps {
  showAxisLine: boolean;
  onShowAxisLineChange: (show: boolean) => void;
  showPlanetLabels: boolean;
  onShowPlanetLabelsChange: (show: boolean) => void;
  showZodiac: boolean;
  onShowZodiacChange: (show: boolean) => void;
  planetaryZodiacPlanets: string[];
  onTogglePlanetaryZodiacPlanet: (planetName: string, show: boolean) => void;
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
  planetaryZodiacPlanets,
  onTogglePlanetaryZodiacPlanet,
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
          Show zodiac layer (Earth)
        </label>

        {/* Only one zodiac ring can be shown at once, so checking any planet
            here automatically turns the Earth layer above off (see App.tsx) --
            these checkboxes ARE the "other planet zodiac layer" control, with
            no separate master switch to keep in sync. */}
        <div className="modal__sublist">
          <span className="modal__sublist-label">Other planet zodiac signs:</span>
          {RAY_ELIGIBLE_PLANETS.map((planet) => (
            <label className="modal__toggle modal__toggle--sub" key={planet.name}>
              <input
                type="checkbox"
                checked={planetaryZodiacPlanets.includes(planet.name)}
                onChange={(event) =>
                  onTogglePlanetaryZodiacPlanet(planet.name, event.target.checked)
                }
              />
              {planet.name}
            </label>
          ))}
        </div>

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
