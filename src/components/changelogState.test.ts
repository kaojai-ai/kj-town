import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MOBILE_CHANGELOG_QUERY,
  getInitialChangelogOpenState,
  shouldOpenChangelogByDefault,
} from "./changelogState";

describe("changelog state", () => {
  it("opens the changelog by default on desktop", () => {
    assert.equal(shouldOpenChangelogByDefault(false), true);
  });

  it("keeps the changelog hidden by default on mobile", () => {
    assert.equal(shouldOpenChangelogByDefault(true), false);
  });

  it("uses the same mobile breakpoint as the HUD CSS", () => {
    const queriedBreakpoints: string[] = [];
    const isOpen = getInitialChangelogOpenState((query) => {
      queriedBreakpoints.push(query);

      return { matches: true } as MediaQueryList;
    });

    assert.equal(isOpen, false);
    assert.deepEqual(queriedBreakpoints, [MOBILE_CHANGELOG_QUERY]);
  });
});
