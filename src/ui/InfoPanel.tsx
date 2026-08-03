import { Modal } from "./Modal";
import { ORBIT_DISPLAY_OPTIONS, type OrbitDisplayMode } from "../scene/orbitDisplay";

interface InfoPanelProps {
  showAxisLine: boolean;
  onShowAxisLineChange: (show: boolean) => void;
  showPlanetLabels: boolean;
  onShowPlanetLabelsChange: (show: boolean) => void;
  orbitMode: OrbitDisplayMode;
  onOrbitModeChange: (mode: OrbitDisplayMode) => void;
  aboutOpen: boolean;
  onAboutOpenChange: (open: boolean) => void;
}

export function InfoPanel({
  showAxisLine,
  onShowAxisLineChange,
  showPlanetLabels,
  onShowPlanetLabelsChange,
  orbitMode,
  onOrbitModeChange,
  aboutOpen,
  onAboutOpenChange,
}: InfoPanelProps) {
  return (
    <>
      {aboutOpen && (
        <Modal title="About The Orrery" onClose={() => onAboutOpenChange(false)}>
          <h3 className="modal__subtitle">What is an Orrery:</h3>
          <p className="modal__paragraph">
            An orrery is a mechanical model of the solar system that represents the relative
            positions and motions of the planets as they orbit the sun. Historically built as
            clockwork devices, orreries have long been used to visualize and teach the scale and
            movement of our solar system in a way that is easy to observe and understand.
          </p>

          <h3 className="modal__subtitle">How its setup:</h3>
          <p className="modal__paragraph">
            While the proportions of the sun and the planets are correct, the{" "}
            <strong>distance</strong> between them has been greatly reduced so they fit
            comfortably within this interface. This is an intentional fiction - in reality the
            distances between planets are vastly greater than shown here.
          </p>

          <h3 className="modal__subtitle">What you can control:</h3>
          <p className="modal__paragraph">
            You can spin the entire solar system around by clicking and moving your mouse. You
            can zoom in and out of the scene, by using the middle mouse button. You can click on
            a planet to zoom into it and learn more details about that planet. To get back to the
            normal starting orientation, just click on the background (stars).
          </p>

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

          <p className="modal__credit">
            the Orrery — a solar system visualization was designed and built by{" "}
            <strong>Bart Dority</strong> — developer, designer, and independent researcher at the
            intersection of design, engineering, and data visualization systems. See more at{" "}
            <a href="https://moon-math.online" target="_blank" rel="noopener noreferrer">
              moon-math.online
            </a>{" "}
            or visit my{" "}
            <a
              href="https://bartdorityportfolio.online/"
              target="_blank"
              rel="noopener noreferrer"
            >
              portfolio
            </a>
            .
          </p>
        </Modal>
      )}
    </>
  );
}
