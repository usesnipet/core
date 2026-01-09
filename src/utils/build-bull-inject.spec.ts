import { buildBullInject } from "./build-bull-inject";

describe("buildBullInject", () => {
  it("should create a Bull injection token for a given job name", () => {
    const jobName = "my-job";
    const expected = "BullQueue_my-job";
    expect(buildBullInject(jobName)).toBe(expected);
  });

  it("should handle job names with numbers", () => {
    const jobName = "job-123";
    const expected = "BullQueue_job-123";
    expect(buildBullInject(jobName)).toBe(expected);
  });

  it("should handle empty string as a job name", () => {
    const jobName = "";
    const expected = "BullQueue_";
    expect(buildBullInject(jobName)).toBe(expected);
  });

  it("should handle job names with special characters", () => {
    const jobName = "job_with_special-chars@#$";
    const expected = "BullQueue_job_with_special-chars@#$";
    expect(buildBullInject(jobName)).toBe(expected);
  });
});
