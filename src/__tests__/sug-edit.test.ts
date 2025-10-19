
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  insertSuggestedEdit,
  getCourseSuggestedEdits,
  updateSuggestedEditStatus,
} from "@/utils/db/suggested-edits";
import { createClient } from "@/utils/supabase/client";
import { SuggestedChange, SuggestedChangeStatus } from "@/utils/types";

// Mock the supabase client module
jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock data
const mockEdit: SuggestedChange = {
  id: "edit1",
  collaborator_id: "collab1",
  course_id: "course1",
  summary: "Fixed a typo in unit 1",
  payload: {
    course: {} as any, // Mock payload as per type
    units: [] as any,
    lessons: [] as any,
  },
  status: "pending",
  created_at: new Date().toISOString(),
};

describe("suggested edits db functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("insertSuggestedEdit does not throw on success", async () => {
    // Arrange
    const mockClient = {
      from: () => ({
        insert: async () => ({ error: null }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient); // Act & Assert

    await expect(insertSuggestedEdit(mockEdit)).resolves.toBeUndefined();
  });

  it("getCourseSuggestedEdits returns suggested edits", async () => {
    // Arrange
    const mockClient = {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: async () => ({ data: [mockEdit], error: null }),
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient); // Act

    const result = await getCourseSuggestedEdits("course1"); // Assert

    expect(result).toEqual([mockEdit]);
  });

  it("updateSuggestedEditStatus does not throw on success", async () => {
    // Arrange
    const mockClient = {
      from: () => ({
        update: () => ({
          eq: async () => ({ error: null }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient); // Act & Assert

    await expect(
      updateSuggestedEditStatus("edit1", "approved", "admin1")
    ).resolves.toBeUndefined();
  });
});

describe("suggested edits db error handling", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks(); // Spy on console.error to check for logging
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore the spy
    consoleErrorSpy.mockRestore();
  });

  it("insertSuggestedEdit throws on error", async () => {
    // Arrange
    const mockError = { message: "insert fail" };
    const mockClient = {
      from: () => ({
        insert: async () => ({ error: mockError }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient); // Act & Assert

    await expect(insertSuggestedEdit(mockEdit)).rejects.toEqual(mockError);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error inserting suggested edit:",
      mockError
    );
  });

  it("getCourseSuggestedEdits returns null on error", async () => {
    // Arrange
    const mockError = { message: "select fail" };
    const mockClient = {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: async () => ({ data: null, error: mockError }),
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient); // Act

    const result = await getCourseSuggestedEdits("course1"); // Assert

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching suggested edits:",
      mockError.message
    );
  });

  it("updateSuggestedEditStatus throws on error", async () => {
    // Arrange
    const mockError = { message: "update fail" };
    const mockClient = {
      from: () => ({
        update: () => ({
          eq: async () => ({ error: mockError }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient); // Act & Assert

    await expect(
      updateSuggestedEditStatus("edit1", "approved", "admin1")
    ).rejects.toEqual(mockError);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error updating suggested edit status:",
      mockError
    );
  });
});
