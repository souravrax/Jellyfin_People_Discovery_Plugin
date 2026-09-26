import React, { useState } from "react";
import { personHref, personImageUrl, type PersonItem } from "../api.js";

/** Native Jellyfin portraitCard for one person (link-based navigation). */
export function PersonCard({ person }: { person: PersonItem }) {
  const name = person.Name || "Unknown";
  const url = person.Id ? personImageUrl(person) : "";
  const initial = String(name).trim().charAt(0).toUpperCase() || "?";
  const href = person.Id ? personHref(person) : "#/people";
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className="card portraitCard card-hoverable" data-id={person.Id || ""} data-type="Person">
      <div className="cardBox cardBox-bottompadded">
        <div className="cardScalable">
          <div className="cardPadder cardPadder-portrait"></div>
          <div className="cardContent">
            <div className="cardImageContainer coveredImage">
              {url && imgOk ? (
                <img
                  src={url}
                  alt=""
                  loading="lazy"
                  onError={() => setImgOk(false)}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="cardImageIcon"
                  style={{
                    position: "absolute", inset: 0, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "3rem", opacity: 0.35,
                  }}
                >
                  {initial}
                </div>
              )}
            </div>
          </div>
          <div className="cardOverlayContainer itemAction MuiBox-root css-0" data-action="link">
            <a href={href} aria-label={name} className="cardImageContainer"></a>
          </div>
        </div>
        <div className="cardText cardTextCentered cardText-first MuiBox-root css-0">
          <a className="itemAction textActionButton" href={href} title={name}>
            {name}
          </a>
        </div>
        {person.PersonType ? (
          <div className="cardText cardTextCentered cardText-secondary MuiBox-root css-0">
            {person.PersonType}
          </div>
        ) : null}
      </div>
    </div>
  );
}
