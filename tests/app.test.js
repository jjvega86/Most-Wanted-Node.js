const { chars } = require("../app");

describe("All app.js functions", () => {
  test("Chars returns true", () => {
    expect(chars("some input")).toEqual("some other input");
  });
});
