import { Modal } from "./Modal";

interface InfoPanelProps {
  showAxisLine: boolean;
  onShowAxisLineChange: (show: boolean) => void;
  showPlanetLabels: boolean;
  onShowPlanetLabelsChange: (show: boolean) => void;
  aboutOpen: boolean;
  onAboutOpenChange: (open: boolean) => void;
}

export function InfoPanel({
  showAxisLine,
  onShowAxisLineChange,
  showPlanetLabels,
  onShowPlanetLabelsChange,
  aboutOpen,
  onAboutOpenChange,
}: InfoPanelProps) {
  return (
    <>
      {aboutOpen && (
        <Modal title="About The Orrery" onClose={() => onAboutOpenChange(false)}>
          <h3 className="modal__subtitle">How its setup:</h3>
          <p className="modal__paragraph">
            The Orrery is a scaled model of the solar system. Please note that while the
            proportions of the sun and the planets is correct, the <strong>distance</strong>{" "}
            between them has been greatly reduced in order to make them more visually appealing
            in this interface. This is an intentional fiction, the goal of which is to allow the
            user to view the relationships between the planets on a more human scale. But please
            note - the actual distances are vastly greater, so please understand this is a
            fictional visualization.
          </p>

          <h3 className="modal__subtitle">What you can control:</h3>
          <p className="modal__paragraph">
            You can spin the entire solar system around by clicking and moving your mouse. You
            can zoom in and out of the scene, by using the middle mouse button. You can click on
            a planet to zoom into it and learn more details about that planet. To get back to the
            normal starting orientation, just click on the background (stars).
          </p>

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
        </Modal>
      )}
    </>
  );
}
