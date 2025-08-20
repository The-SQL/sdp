import { cn } from "@/lib/utils";

describe("cn helper", () => {
  it("merges single class", () => {
    expect(cn("p-4")).toBe("p-4");
  });

  it("merges multiple classes", () => {
    expect(cn("p-4", "text-center")).toBe("p-4 text-center");
  });

  it("merges conditional classes with clsx syntax", () => {
    expect(cn("p-4", { "text-center": true, "text-red-500": false })).toBe(
      "p-4 text-center"
    );
  });

  it("merges conflicting Tailwind classes and resolves with twMerge", () => {
    expect(cn("p-4 p-2")).toBe("p-2"); // last one wins
  });

  it("handles arrays and undefined/null values", () => {
    expect(cn("p-4", ["text-center", undefined], null)).toBe(
      "p-4 text-center"
    );
  });
});
