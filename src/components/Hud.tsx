import { useState } from "react";
import type { TownEntity } from "../town/townData";
import { getInitialChangelogOpenState } from "./changelogState";
import lastMigrateRaw from "../../migrations/LAST_MIGRATE.md?raw";

interface HudProps {
  selectedEntity: TownEntity | null;
  nearestEntity: TownEntity | null;
  onClose: () => void;
  onSelect: (entityId: string) => void;
}

const tierLabels: Record<TownEntity["tier"], string> = {
  foundation: "Foundation",
  critical: "Critical",
  business: "Business",
  edge: "Edge",
};

const lastMigrateContent = lastMigrateRaw.trim();

export function Hud({
  selectedEntity,
  nearestEntity,
  onClose,
  onSelect,
}: HudProps) {
  const [isChangelogOpen, setIsChangelogOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return getInitialChangelogOpenState(window.matchMedia);
  });

  return (
    <div className={selectedEntity ? "hud hud-panel-open" : "hud"}>
      <div className="top-left-overlay">
        <section className="objective-chip" aria-label="Objective">
          <strong>KJ Town</strong>
          <span>Drag to rotate. Right-drag to pan. Scroll to zoom.</span>
          <span>
            Open source, from{" "}
            <a href="https://KaoJai.ai" target="_blank" rel="noreferrer">
              KaoJai.ai
            </a>
          </span>
          <span>
            Founder:{" "}
            <a href="https://chaintng.com" target="_blank" rel="noreferrer">
              chaintng.com
            </a>
          </span>
        </section>

        <div className="top-link-row">
          <a
            className="github-link"
            href="https://github.com/kaojai-ai/kj-town"
            target="_blank"
            rel="noreferrer"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.66 0 8.18c0 3.61 2.29 6.67 5.47 7.75.4.08.55-.18.55-.39 0-.2-.01-.84-.01-1.52-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.97-.82-1.16-.28-.16-.68-.55-.01-.56.63-.01 1.08.59 1.23.84.72 1.25 1.87.9 2.33.69.07-.53.28-.9.51-1.11-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.21-.36-1.05.08-2.16 0 0 .67-.22 2.2.84A7.42 7.42 0 0 1 8 3.94c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.11.16 1.95.08 2.16.51.57.82 1.3.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.26.54.75.54 1.52 0 1.1-.01 1.98-.01 2.25 0 .21.15.47.55.39A8.1 8.1 0 0 0 16 8.18C16 3.66 12.42 0 8 0Z" />
            </svg>
            <span>kaojai-ai/kj-town</span>
          </a>

          {!isChangelogOpen ? (
            <button
              className="github-link changelog-button"
              type="button"
              onClick={() => setIsChangelogOpen(true)}
            >
              <span>Changelog</span>
            </button>
          ) : null}
        </div>
      </div>

      <section className="health-strip" aria-label="System status">
        <div>
          <span className="status-dot" style={{ marginRight: '10px' }} />
          <strong>🚀 Affordable</strong>
        </div>
        <div>
          <strong>🛡️ Resilient</strong>
        </div>
        <div>
          <strong>💪 Built to last</strong>
        </div>
      </section>

      {!selectedEntity && nearestEntity ? (
        <button
          className="interaction-prompt"
          type="button"
          onClick={() => onSelect(nearestEntity.id)}
        >
          Enter {nearestEntity.name}
          <kbd>E</kbd>
        </button>
      ) : !selectedEntity ? (
        <div className="movement-hint">
          Mouse controls the map. W/S moves the visitor. A/D turns.
        </div>
      ) : null}

      {isChangelogOpen ? (
        <section
          className="changelog-dialog"
          role="dialog"
          aria-modal="false"
          aria-labelledby="changelog-dialog-title"
        >
          <div className="changelog-dialog-header">
            <div>
              <span>LAST_MIGRATE</span>
              <h2 id="changelog-dialog-title">Latest town changelog</h2>
            </div>
            <button
              type="button"
              className="icon-button"
              aria-label="Close changelog"
              onClick={() => setIsChangelogOpen(false)}
            >
              x
            </button>
          </div>
          <pre>{lastMigrateContent}</pre>
        </section>
      ) : null}

      {selectedEntity ? (
        <aside
          className="detail-panel"
          aria-label={`${selectedEntity.name} details`}
        >
          <div className="panel-header">
            <div>
              <span className={`tier-badge tier-${selectedEntity.tier}`}>
                {tierLabels[selectedEntity.tier]}
              </span>
              <h1>{selectedEntity.name}</h1>
              <p>{selectedEntity.summary}</p>
              {selectedEntity.id === "kaojai-core" ? (
                <div className="core-inline-links">
                  <p>
                    Built from the ground up by{" "}
                    <a href="https://KaoJai.ai" target="_blank" rel="noreferrer">
                      KaoJai.ai
                    </a>
                    .
                  </p>
                  <p>
                    Founder:{" "}
                    <a href="https://chaintng.com" target="_blank" rel="noreferrer">
                      chaintng.com
                    </a>
                  </p>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="icon-button"
              aria-label="Close details"
              onClick={onClose}
            >
              x
            </button>
          </div>

          <dl className="detail-list">
            <div>
              <dt>Purpose</dt>
              <dd>{selectedEntity.details.purpose}</dd>
            </div>
            <div>
              <dt>System role</dt>
              <dd>{selectedEntity.details.systemRole}</dd>
            </div>
          </dl>
{/*
          <PanelList
            title="Important flows"
            items={selectedEntity.details.flows}
          />
          <PanelList
            title="Built to last"
            items={selectedEntity.details.reliability}
          />*/}
          <PanelList
            title="Nearby systems"
            items={selectedEntity.details.related}
          />
        </aside>
      ) : null}
    </div>
  );
}

interface PanelListProps {
  title: string;
  items: readonly string[];
}

function PanelList({ title, items }: PanelListProps) {
  return (
    <section className="panel-section">
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
