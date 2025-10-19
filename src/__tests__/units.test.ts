import { insertUnit, insertUnits, updateUnit } from "@/utils/db/units"; // Adjust path as needed
import { createClient } from "@/utils/supabase/client";
import { Unit } from "@/utils/types"; // Adjust path as needed

// Mock the Supabase client
jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock Data
const mockUnit: Unit = {
  id: "unit1",
  course_id: "course1",
  title: "Test Unit",
  order_index: 1,
  created_at: new Date().toISOString(),
};

describe("Unit DB Functions", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on console.error to check logging in error cases
    consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // --- insertUnit ---
  describe("insertUnit", () => {
    it("should insert a unit and return the data on success", async () => {
      // Arrange
      const mockClient = {
        from: () => ({
          insert: () => ({
            select: async () => ({ data: [mockUnit], error: null }), // Return data in an array
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act
      const result = await insertUnit("course1", "Test Unit", 1);

      // Assert
      expect(result).toEqual(mockUnit);
    });

    it("should throw an error and log if insertion fails", async () => {
      // Arrange
      const mockError = new Error("Insert failed");
      const mockClient = {
        from: () => ({
          insert: () => ({
            select: async () => ({ data: null, error: mockError }),
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act & Assert
      await expect(insertUnit("course1", "Test Unit", 1)).rejects.toThrow(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error inserting unit:", mockError);
    });
  });

  // --- insertUnits ---
  describe("insertUnits", () => {
    it("should insert multiple units successfully", async () => {
      // Arrange
      const mockClient = {
        from: () => ({
          insert: async () => ({ error: null }), // insert doesn't need select here
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);
      const unitsToInsert: Unit[] = [
        { ...mockUnit, id: "unit1", order_index: 1 },
        { ...mockUnit, id: "unit2", title: "Unit 2", order_index: 2 },
      ];

      // Act & Assert
      await expect(insertUnits("course1", unitsToInsert)).resolves.toBeUndefined();
    });

    it("should throw an error if bulk insertion fails", async () => {
      // Arrange
      const mockError = new Error("Bulk insert failed");
      const mockClient = {
        from: () => ({
          insert: async () => ({ error: mockError }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);
      const unitsToInsert: Unit[] = [mockUnit];

      // Act & Assert
      await expect(insertUnits("course1", unitsToInsert)).rejects.toThrow(mockError);
      // No console.error expected as the function just throws
    });
  });

  // --- updateUnit ---
  describe("updateUnit", () => {
    it("should update a unit and return the updated data on success", async () => {
      // Arrange
      const updates: Partial<Unit> = { title: "Updated Title" };
      const updatedUnit = { ...mockUnit, title: "Updated Title" };
      const mockClient = {
        from: () => ({
          update: () => ({
            eq: () => ({
              select: async () => ({ data: [updatedUnit], error: null }), // Return data in array
            }),
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act
      const result = await updateUnit("unit1", updates);

      // Assert
      expect(result).toEqual(updatedUnit);
    });

    it("should throw an error and log if update fails", async () => {
      // Arrange
      const updates: Partial<Unit> = { title: "Updated Title" };
      const mockError = new Error("Update failed");
      const mockClient = {
        from: () => ({
          update: () => ({
            eq: () => ({
              select: async () => ({ data: null, error: mockError }),
            }),
          }),
        }),
      };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Act & Assert
      await expect(updateUnit("unit1", updates)).rejects.toThrow(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error updating unit:", mockError);
    });
  });
});