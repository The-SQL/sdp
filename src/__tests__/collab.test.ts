import {
  getCourseCollaborators,
  updateCollaborationStatus,
  updateCollaboratorStatus, // This is the by-id one
  addCollaborator,
  removeCollaborator,
  getCourseCollaborator,
  cancelCollaboration,
  CollaboratorWithUser,
} from "@/utils/db/collaboration";
import { createClient } from "@/utils/supabase/client";
import {
  Collaborators,
  CollaboratorStatus,
} from "@/utils/types";

// Mock the supabase client module
jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock data
const mockUserData = {
  clerk_id: "clerk_123",
  name: "Test User",
  profile_url: "http://example.com/img.png",
  bio: "A test user.",
};

const mockCollaborator: Collaborators = {
  id: "collab_1",
  course_id: "course_1",
  user_id: "user_1",
  status: "pending" as CollaboratorStatus,
  created_at: new Date().toISOString(),
};

const mockCollaboratorWithUser: CollaboratorWithUser = {
  ...mockCollaborator,
  users: mockUserData,
};

describe("collaborator db functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getCourseCollaborators returns collaborators with user data", async () => {
    // Arrange
    const mockClient = {
      from: () => ({
        select: () => ({
          eq: async () => ({ data: [mockCollaboratorWithUser], error: null }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);
    const result = await getCourseCollaborators("course_1");
    expect(result).toEqual([mockCollaboratorWithUser]);
  });

  it("updateCollaborationStatus (by course/user) does not throw on success", async () => {
    // Arrange
    const mockClient = {
      from: () => ({
        update: () => ({
          eq: () => ({
            eq: async () => ({ error: null }),
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);
    await expect(
      updateCollaborationStatus("course_1", "user_1", "pending")
    ).resolves.toBeUndefined();
  });

  it("addCollaborator inserts a new collaborator", async () => {
    // Arrange
    const mockClient = {
      from: () => ({
        insert: async () => ({ error: null }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);
    await expect(
      addCollaborator("course_1", "user_1", "pending")
    ).resolves.toBeUndefined();
  });

  it("addCollaborator updates collaborator if insert fails with duplicate code", async () => {
    // Arrange
    const mockUpdate = jest.fn(async () => ({ error: null }));
    const mockClient = {
      from: () => ({
        insert: async () => ({ error: { code: "23505", message: "duplicate" } }),
        update: () => ({
          eq: () => ({
            eq: mockUpdate,
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);
    await expect(
      addCollaborator("course_1", "user_1", "pending")
    ).resolves.toBeUndefined();
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("removeCollaborator does not throw on success", async () => {
    // Arrange
    const mockClient = {
      from: () => ({
        delete: () => ({
          eq: () => ({
            eq: async () => ({ error: null }),
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);
    await expect(
      removeCollaborator("course_1", "user_1")
    ).resolves.toBeUndefined();
  });

  it("updateCollaboratorStatus (by id) does not throw on success", async () => {
    // Arrange
    const mockClient = {
      from: () => ({
        update: () => ({
          eq: async () => ({ error: null }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);
    await expect(
      updateCollaboratorStatus("collab_1", "pending")
    ).resolves.toBeUndefined();
  });

  it("getCourseCollaborator returns a single collaborator", async () => {
    // Arrange
    const mockClient = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: async () => ({ data: [mockCollaborator], error: null }),
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);
    const result = await getCourseCollaborator("course_1", "user_1");
    expect(result).toEqual(mockCollaborator);
  });

  it("cancelCollaboration does not throw on success", async () => {
    // Arrange
    const mockClient = {
      from: () => ({
        update: () => ({
          eq: () => ({
            eq: async () => ({ error: null }),
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);
    await expect(
      cancelCollaboration("course_1", "user_1")
    ).resolves.toBeUndefined();
  });
});

describe("collaborator db error handling", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("getCourseCollaborators returns null on error", async () => {
    // Arrange
    const mockError = { message: "fail" };
    const mockClient = {
      from: () => ({
        select: () => ({
          eq: async () => ({ data: null, error: mockError }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    // Act
    const result = await getCourseCollaborators("course_1");

    // Assert
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching course collaborators:",
      mockError.message
    );
  });

  it("updateCollaborationStatus (by course/user) throws on error", async () => {
    // Arrange
    const mockError = { message: "fail" };
    const mockClient = {
      from: () => ({
        update: () => ({
          eq: () => ({
            eq: async () => ({ error: mockError }),
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    // Act & Assert
    await expect(
      updateCollaborationStatus("course_1", "user_1", "pending")
    ).rejects.toEqual(mockError);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error updating collaboration status:",
      mockError
    );
  });

  it("addCollaborator throws on non-duplicate error", async () => {
    // Arrange
    const mockError = { code: "99999", message: "fail" };
    const mockClient = {
      from: () => ({
        insert: async () => ({ error: mockError }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    // Act & Assert
    await expect(
      addCollaborator("course_1", "user_1", "pending")
    ).rejects.toEqual(mockError);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error adding collaborator:",
      mockError
    );
  });

  it("removeCollaborator throws on error", async () => {
    // Arrange
    const mockError = { message: "fail" };
    const mockClient = {
      from: () => ({
        delete: () => ({
          eq: () => ({
            eq: async () => ({ error: mockError }),
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    // Act & Assert
    await expect(
      removeCollaborator("course_1", "user_1")
    ).rejects.toEqual(mockError);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error removing collaborator:",
      mockError
    );
  });

  it("updateCollaboratorStatus (by id) throws on error", async () => {
    // Arrange
    const mockError = { message: "fail" };
    const mockClient = {
      from: () => ({
        update: () => ({
          eq: async () => ({ error: mockError }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    // Act & Assert
    await expect(
      updateCollaboratorStatus("collab_1", "pending")
    ).rejects.toEqual(mockError);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error updating collaborator status:",
      mockError
    );
  });

  it("getCourseCollaborator returns null on error", async () => {
    // Arrange
    const mockError = { message: "fail" };
    const mockClient = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: async () => ({ data: null, error: mockError }),
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    // Act
    const result = await getCourseCollaborator("course_1", "user_1");

    // Assert
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching course collaborator:",
      mockError.message
    );
  });

  it("cancelCollaboration throws on error", async () => {
    // Arrange
    const mockError = { message: "fail" };
    const mockClient = {
      from: () => ({
        update: () => ({
          eq: () => ({
            eq: async () => ({ error: mockError }),
          }),
        }),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    // Act & Assert
    await expect(
      cancelCollaboration("course_1", "user_1")
    ).rejects.toEqual(mockError);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error cancelling collaboration:",
      mockError
    );
  });
});