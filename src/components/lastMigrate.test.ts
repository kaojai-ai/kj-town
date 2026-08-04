import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatLastMigrateContent } from "./lastMigrate";

describe("LAST_MIGRATE content", () => {
  it("shows a human-readable date above the epoch", () => {
    const content = formatLastMigrateContent(
      "1785821543\n- Latest change",
      (date) => {
        assert.equal(date.toISOString(), "2026-08-04T05:32:23.000Z");
        return "Tuesday, August 4, 2026 at 12:32:23 PM GMT+7";
      },
    );

    assert.equal(
      content,
      "Tuesday, August 4, 2026 at 12:32:23 PM GMT+7\n1785821543\n- Latest change",
    );
  });

  it("rejects a LAST_MIGRATE file without an epoch first line", () => {
    assert.throws(
      () => formatLastMigrateContent("not-an-epoch\n- Latest change"),
      /must start with an epoch timestamp/,
    );
  });
});
