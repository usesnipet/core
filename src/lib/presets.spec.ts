import { readdir, readFile } from "fs/promises";
import { getPresets, _resetCache } from "./presets";

jest.mock("fs/promises", () => ({
  readdir: jest.fn(),
  readFile: jest.fn(),
}));

const mockedReaddir = readdir as jest.Mock;
const mockedReadFile = readFile as jest.Mock;

const mockPreset1 = {
  key: "preset1",
  name: "Preset 1",
  description: "Description 1",
  iconPath: "path/to/icon1.png",
  fields: { apiKey: "secret-string" },
  defaults: { model: "model-1" },
  required: ["apiKey"],
  adapter: "adapter1",
  ignoreFields: false,
  config: { type: "TEXT" },
};

const mockPreset2 = {
  key: "preset2",
  name: "Preset 2",
  description: "Description 2",
  iconPath: "path/to/icon2.png",
  fields: { model: "string" },
  defaults: { temperature: 0.5 },
  required: ["model"],
  adapter: "adapter2",
  ignoreFields: true,
  config: { type: "EMBEDDING" },
};

describe("getPresets", () => {
  beforeEach(() => {
    _resetCache();
    mockedReaddir.mockClear();
    mockedReadFile.mockClear();
  });

  it("should read and parse preset files correctly", async () => {
    mockedReaddir.mockResolvedValue(["preset1.json", "preset2.json", "not-a-preset.txt"]);
    mockedReadFile
      .mockResolvedValueOnce(JSON.stringify([mockPreset1]))
      .mockResolvedValueOnce(JSON.stringify([mockPreset2]));

    const presets = await getPresets();

    expect(presets).toHaveLength(2);
    expect(presets[0]).toEqual(expect.objectContaining(mockPreset1));
    expect(presets[1]).toEqual(expect.objectContaining(mockPreset2));
    expect(mockedReaddir).toHaveBeenCalledTimes(1);
    expect(mockedReadFile).toHaveBeenCalledTimes(2);
  });

  it("should use cache on subsequent calls", async () => {
    mockedReaddir.mockResolvedValue(["preset1.json"]);
    mockedReadFile.mockResolvedValueOnce(JSON.stringify([mockPreset1]));

    const presets1 = await getPresets();
    const presets2 = await getPresets();

    expect(presets1).toBe(presets2);
    expect(mockedReaddir).toHaveBeenCalledTimes(1);
    expect(mockedReadFile).toHaveBeenCalledTimes(1);
  });

  it("should handle readdir errors gracefully", async () => {
    mockedReaddir.mockRejectedValue(new Error("Cannot read directory"));
    const presets = await getPresets();
    expect(presets).toEqual([]);
  });

  it("should handle readFile errors gracefully for a single file", async () => {
    mockedReaddir.mockResolvedValue(["preset1.json", "preset2.json"]);
    mockedReadFile
      .mockRejectedValueOnce(new Error("Cannot read file"))
      .mockResolvedValueOnce(JSON.stringify([mockPreset2]));

    const presets = await getPresets();

    expect(presets).toHaveLength(1);
    expect(presets[0]).toEqual(expect.objectContaining(mockPreset2));
  });

  it("should handle empty directory", async () => {
    mockedReaddir.mockResolvedValue([]);
    const presets = await getPresets();
    expect(presets).toEqual([]);
  });

  it("should handle invalid JSON gracefully", async () => {
    mockedReaddir.mockResolvedValue(["invalid.json", "preset1.json"]);
    mockedReadFile
      .mockResolvedValueOnce("this is not json")
      .mockResolvedValueOnce(JSON.stringify([mockPreset1]));

    const presets = await getPresets();
    expect(presets).toHaveLength(1);
    expect(presets[0]).toEqual(expect.objectContaining(mockPreset1));
  });
});
