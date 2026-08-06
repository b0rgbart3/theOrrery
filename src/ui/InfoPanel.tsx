import { Modal } from "./Modal";

interface InfoPanelProps {
  aboutOpen: boolean;
  onAboutOpenChange: (open: boolean) => void;
}

export function InfoPanel({ aboutOpen, onAboutOpenChange }: InfoPanelProps) {
  return (
    <>
      {aboutOpen && (
        <Modal
          title="About The Orrery"
          onClose={() => onAboutOpenChange(false)}
        >
          <div className="modal__intro">
            <div className="modal__intro-block">
              <h3 className="modal__subtitle">What is an Orrery:</h3>
              <p className="modal__paragraph">
                An orrery is a mechanical model of the solar system that
                represents the relative positions and motions of the planets as
                they orbit the sun. Historically built as clockwork devices,
                orreries have long been used to visualize and teach the scale
                and movement of our solar system in a way that is easy to
                observe and understand.
              </p>
            </div>

            <img
              className="modal__intro-image"
              src="/orrery_example.jpg"
              alt="An antique mechanical orrery model"
            />

            <div className="modal__intro-block">
              <h3 className="modal__subtitle">
                How{" "}
                <strong>
                  <em>this Orrery</em>
                </strong>{" "}
                is setup.
              </h3>
              <p className="modal__paragraph">
                While the proportions of the sun and the planets are correct,
                the <strong>distance</strong> between them has been greatly
                reduced so they fit comfortably within this interface. This is
                an intentional fiction - in reality the distances between
                planets are vastly greater than shown here.
              </p>
            </div>

            <div className="modal__intro-block">
              <h3 className="modal__subtitle">What you can control:</h3>
              <p className="modal__paragraph">
                You can spin the entire solar system around by clicking and
                moving your mouse. You can zoom in and out of the scene, by
                using the middle mouse button. You can click on a planet to zoom
                into it and learn more details about that planet. To get back to
                the normal starting orientation, just click on the background
                (stars).
              </p>
              <p>
                You can also control the speed of time, and even reverse it, by
                using the timeline at the bottom of the screen. You can also
                toggle on and off various features of the Orrery, such as the
                zodiac ring, planetary zodiac rays, and more, by clicking on the
                settings button in the top right corner.
              </p>
            </div>
          </div>

          <div className="modal__section">
            <h3 className="modal__subtitle">
              Two kinds of zodiac in this Orrery
            </h3>
            <p className="modal__paragraph">
              The <strong>Zodiac Layer</strong>'s ring is centered on the Sun,
              and it plots each planet's <strong>heliocentric</strong> position
              — its direction as seen from the Sun. That happens to work out for
              Earth: your own zodiac sign is really about where the Sun appears
              from Earth, and Earth's position around the Sun always sits
              exactly opposite that direction, so the math lines up by
              coincidence. It's a coincidence that applies only to Earth, though
              — no other planet's heliocentric position matches its true sign,
              which is why Mercury or Venus's position on this ring wouldn't
              match what an astrologer would actually tell you.
            </p>

            <img
              className="modal__section-image"
              src="/textures/heliocentric.png"
              alt="Side-by-side diagram comparing the heliocentric model, where Earth and the planets orbit the Sun, with the geocentric model, where the Sun and planets orbit Earth"
            />

            <p className="modal__paragraph">
              That's what the <strong>other planet zodiac signs</strong> layer
              is for: a second ring, centered on Earth instead of the Sun, with
              a ray from Earth through each selected planet showing its real (
              <strong>geocentric</strong>) sign — the one that actually matches
              a horoscope. This Orrery also compresses every planet's distance
              from the Sun so the whole solar system fits on screen, so a
              planet's true distance from Earth doesn't usually match its
              compressed distance from the Sun. A short connecting line bridges
              that gap — linking the planet's own position to the ray's distance
              marker — so the sign stays exact while still visually tying back
              to where the planet is actually drawn.
            </p>
            <h3 className="modal__subtitle">
              {" "}
              Why do we use a Geocentric Zodiac Model, and why are horoscopes
              almost exclusively geocentric?
            </h3>
            <p className="modal__paragraph">
              Because astrology interprets planetary movements and celestial
              events based on how they are experienced from{" "}
              <b>
                <i>Earth</i>
              </b>
              , so astrological charts are calculated using Earth as the fixed
              central point.
            </p>

            <h4 className="modal__subtitle">
              Geocentric vs. Heliocentric Astrology
            </h4>

            <h5 className="modal__subheading">Geocentric (Earth-Centered):</h5>
            <p className="modal__paragraph modal__paragraph--indented">
              Standard astrological horoscopes map the positions of the Sun,
              Moon, and planets against the backdrop of the zodiac from an
              Earth-bound perspective. Concepts central to traditional
              astrology—such as apparent planetary retrograde motion, the
              Horizon (Ascendant/Descendant), and the House system—rely on an
              Earth-centered point of view.
            </p>

            <h5 className="modal__subheading">Heliocentric (Sun-Centered):</h5>
            <p className="modal__paragraph modal__paragraph--indented">
              While rare, heliocentric horoscopes{" "}
              <i>
                do exist within niche branches of modern astrology and financial
                astrology
              </i>
              . In a heliocentric chart, the Sun is placed at the center, Earth
              is plotted as a planet opposite the Sun, and retrograde motion
              disappears since all planets orbit the Sun in the same direction.
              If you want to chart that, you can use the "Heliocentric Zodiac"
              layer in this Orrery to see the planets' positions from the Sun's
              perspective.
            </p>
          </div>

          <div className="modal__section">
            <h3 className="modal__subtitle">Why is this a useful fiction?</h3>
            <p className="modal__paragraph">
              This Orrery, like any orrery, is a fiction — a simplified model,
              not a literal picture of the solar system or of astrology's
              underlying celestial mechanics. But the relationships between the
              two zodiac systems shown here are genuinely complex, and hard to
              hold in your head from description alone. The goal of this Orrery
              is to make those relationships <strong>visible</strong> and
              animated over time, as a way of seeing and understanding those
              movements rather than just reading about them. That's especially
              useful for something like retrograde motion — watching it play
              out visually makes it much easier to understand why a planet
              would appear to go retrograde in the first place. And why, for
              example, Mercury appears to go retrograde more often than the
              other planets do.
            </p>
          </div>

          <p className="modal__credit">
            the Orrery — a solar system visualization was designed and built by{" "}
            <strong>Bart Dority</strong> — developer, designer, and independent
            researcher at the intersection of design, engineering, and data
            visualization systems. See more at{" "}
            <a
              href="https://moon-math.online"
              target="_blank"
              rel="noopener noreferrer"
            >
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
