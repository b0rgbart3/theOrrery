import { Modal } from "./Modal";
import {
  ORBIT_DISPLAY_OPTIONS,
  type OrbitDisplayMode,
} from "../scene/orbitDisplay";
import {
  ZODIAC_IMAGE_OPTIONS,
  type ZodiacImageStyle,
} from "../scene/zodiacDisplay";
import { PLANETS } from "../data/planets";

// Earth has no meaningful sign relative to itself (see PlanetZodiacRay), so
// it's left out of the per-planet ray list.
const RAY_ELIGIBLE_PLANETS = PLANETS.filter(
  (planet) => planet.name !== "Earth",
);

interface SettingsModalProps {
  showAxisLine: boolean;
  onShowAxisLineChange: (show: boolean) => void;
  showPlanetLabels: boolean;
  onShowPlanetLabelsChange: (show: boolean) => void;
  showZodiac: boolean;
  onShowZodiacChange: (show: boolean) => void;
  planetaryZodiacPlanets: string[];
  onTogglePlanetaryZodiacPlanet: (planetName: string, show: boolean) => void;
  showZodiacRainbow: boolean;
  onShowZodiacRainbowChange: (show: boolean) => void;
  zodiacImageStyle: ZodiacImageStyle;
  onZodiacImageStyleChange: (style: ZodiacImageStyle) => void;
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
  showZodiacRainbow,
  onShowZodiacRainbowChange,
  zodiacImageStyle,
  onZodiacImageStyleChange,
  orbitMode,
  onOrbitModeChange,
  onClose,
}: SettingsModalProps) {
  const zodiacActive = showZodiac || planetaryZodiacPlanets.length > 0;

  return (
    <Modal title="Settings" onClose={onClose} className="modal--compact">
      <div className="modal__controls">
        <label className="modal__toggle">
          <input
            type="checkbox"
            checked={showAxisLine}
            onChange={(event) => onShowAxisLineChange(event.target.checked)}
          />
          Show planet axis lines
        </label>

        <label className="modal__toggle">
          <input
            type="checkbox"
            checked={showPlanetLabels}
            onChange={(event) => onShowPlanetLabelsChange(event.target.checked)}
          />
          Show planet name labels
        </label>

        <label className="modal__toggle">
          <input
            type="checkbox"
            checked={showZodiac}
            onChange={(event) => onShowZodiacChange(event.target.checked)}
          />
          Show Heliocentric Zodiac layer
        </label>

        {/* Only one zodiac ring can be shown at once, so checking any planet
            here automatically turns the Earth layer above off (see App.tsx) --
            these checkboxes ARE the "other planet zodiac layer" control, with
            no separate master switch to keep in sync. */}
        <div className="modal__sublist">
          <span className="modal__sublist-label">
            Other planet zodiac signs:
          </span>
          {RAY_ELIGIBLE_PLANETS.map((planet) => (
            <label
              className="modal__toggle modal__toggle--sub"
              key={planet.name}
            >
              <input
                type="checkbox"
                checked={planetaryZodiacPlanets.includes(planet.name)}
                onChange={(event) =>
                  onTogglePlanetaryZodiacPlanet(
                    planet.name,
                    event.target.checked,
                  )
                }
              />
              {planet.name}
            </label>
          ))}
        </div>

        {zodiacActive && (
          <div className="modal__sublist">
            <span className="modal__sublist-label">Zodiac display:</span>
            <label className="modal__toggle modal__toggle--sub">
              <input
                type="checkbox"
                checked={showZodiacRainbow}
                onChange={(event) =>
                  onShowZodiacRainbowChange(event.target.checked)
                }
              />
              Show rainbow ring layer
            </label>
            <label className="modal__toggle modal__toggle--sub">
              Zodiac image:
              <select
                value={zodiacImageStyle}
                onChange={(event) =>
                  onZodiacImageStyleChange(
                    event.target.value as ZodiacImageStyle,
                  )
                }
                aria-label="Zodiac image style"
              >
                {ZODIAC_IMAGE_OPTIONS.map((option) => (
                  <option key={option.style} value={option.style}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <label className="modal__toggle">
          Orbits:
          <select
            value={orbitMode}
            onChange={(event) =>
              onOrbitModeChange(event.target.value as OrbitDisplayMode)
            }
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
