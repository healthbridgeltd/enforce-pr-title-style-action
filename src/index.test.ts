import { beforeEach, describe, jest, test } from "@jest/globals";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const mockContext = { payload: {} as Record<string, unknown> };

jest.unstable_mockModule("@actions/core", () => ({
  debug: jest.fn(),
  info: jest.fn(),
  setFailed: jest.fn(),
}));

jest.unstable_mockModule("@actions/github", () => ({
  context: mockContext,
}));

const { run, OUTCOMES } = await import("./index.js");
const core = await import("@actions/core");
const { context } = await import("@actions/github");

describe("index", () => {
  beforeEach(() => {
    delete process.env["GITHUB_EVENT_PATH"];
    context.payload = {};
    jest.mocked(core.info).mockClear();
    jest.mocked(core.setFailed).mockClear();
  });

  test("valid ticket in title", () => {
    process.env["GITHUB_EVENT_PATH"] = join(
      __dirname,
      "..",
      "fixtures",
      "valid-context.json",
    );
    context.payload = JSON.parse(
      readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" }),
    );

    run();

    expect(core.info).toHaveBeenCalledWith(OUTCOMES.passed);
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  test("valid ticket in revert title", () => {
    process.env["GITHUB_EVENT_PATH"] = join(
      __dirname,
      "..",
      "fixtures",
      "valid-context-revert.json",
    );
    context.payload = JSON.parse(
      readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" }),
    );

    run();

    expect(core.info).toHaveBeenCalledWith(OUTCOMES.passed);
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  test("guild ticket in title", () => {
    process.env["GITHUB_EVENT_PATH"] = join(
      __dirname,
      "..",
      "fixtures",
      "guild-ticket-context.json",
    );
    context.payload = JSON.parse(
      readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" }),
    );

    run();

    expect(core.setFailed).toHaveBeenCalledWith(OUTCOMES.failedGuildTicket);
    expect(core.info).not.toHaveBeenCalled();
  });

  test("no ticket in tile", () => {
    process.env["GITHUB_EVENT_PATH"] = join(
      __dirname,
      "..",
      "fixtures",
      "no-ticket-context.json",
    );
    context.payload = JSON.parse(
      readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" }),
    );

    run();

    expect(core.setFailed).toHaveBeenCalledWith(OUTCOMES.failedNoJiraIssueId);
    expect(core.info).not.toHaveBeenCalled();
  });

  test("incorrect event type", () => {
    process.env["GITHUB_EVENT_PATH"] = join(
      __dirname,
      "..",
      "fixtures",
      "wrong-event-type-context.json",
    );
    context.payload = JSON.parse(
      readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" }),
    );

    run();

    expect(core.setFailed).toHaveBeenCalledWith(
      OUTCOMES.failedUnsupportedEventType,
    );
    expect(core.info).not.toHaveBeenCalled();
  });
});
