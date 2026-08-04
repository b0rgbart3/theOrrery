import { Modal } from "./Modal";

interface InfoPanelProps {
  aboutOpen: boolean;
  onAboutOpenChange: (open: boolean) => void;
}

export function InfoPanel({ aboutOpen, onAboutOpenChange }: InfoPanelProps) {
  return (
    <>
      {aboutOpen && (
        <Modal title="About The Orrery" onClose={() => onAboutOpenChange(false)}>
          <div className="modal__intro">
            <div className="modal__intro-block">
              <h3 className="modal__subtitle">What is an Orrery:</h3>
              <p className="modal__paragraph">
                An orrery is a mechanical model of the solar system that represents the relative
                positions and motions of the planets as they orbit the sun. Historically built as
                clockwork devices, orreries have long been used to visualize and teach the scale
                and movement of our solar system in a way that is easy to observe and understand.
              </p>
            </div>

            <img
              className="modal__intro-image"
              src="/orrery_example.jpg"
              alt="An antique mechanical orrery model"
            />

            <div className="modal__intro-block">
              <h3 className="modal__subtitle">
                How <strong><em>this Orrery</em></strong> is setup.
              </h3>
              <p className="modal__paragraph">
                While the proportions of the sun and the planets are correct, the{" "}
                <strong>distance</strong> between them has been greatly reduced so they fit
                comfortably within this interface. This is an intentional fiction - in reality the
                distances between planets are vastly greater than shown here.
              </p>
            </div>

            <div className="modal__intro-block">
              <h3 className="modal__subtitle">What you can control:</h3>
              <p className="modal__paragraph">
                You can spin the entire solar system around by clicking and moving your mouse. You
                can zoom in and out of the scene, by using the middle mouse button. You can click
                on a planet to zoom into it and learn more details about that planet. To get back
                to the normal starting orientation, just click on the background (stars).
              </p>
            </div>
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
