import { POST } from "@/app/api/webhooks/clerk/route";
import { insertUser } from "@/utils/db/server";

// Mock insertUser so no DB calls
jest.mock("@/utils/db/server", () => ({
  insertUser: jest.fn(),
}));

// Mock NextResponse to return a simple object
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      json: () => Promise.resolve(body),
      status: init?.status || 200,
    })),
  },
}));

describe("POST /api/webhooks/clerk", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("inserts a user when valid data is provided", async () => {
    const mockReq = {
      json: jest.fn().mockResolvedValue({
        data: {
          id: "c1",
          first_name: "John",
          email_addresses: [{ email_address: "john@example.com" }],
        },
      }),
    };

    const response = await POST(mockReq as any);
    const body = await response.json();

    // Check insertUser called correctly
    expect(insertUser).toHaveBeenCalledWith(
      "c1",
      "John",
      "john@example.com"
    );

    // Check response
    expect(response.status).toBe(200);
    expect(body.message).toBe("User inserted successfully");
  });

  it("uses empty string for first_name when not provided", async () => {
    const mockReq = {
      json: jest.fn().mockResolvedValue({
        data: {
          id: "c3",
          // Note: first_name is not provided
          email_addresses: [{ email_address: "test@example.com" }],
        },
      }),
    };

    const response = await POST(mockReq as any);
    const body = await response.json();

    // Check insertUser called with empty string for first_name
    expect(insertUser).toHaveBeenCalledWith(
      "c3",
      "",
      "test@example.com"
    );

    // Check response
    expect(response.status).toBe(200);
    expect(body.message).toBe("User inserted successfully");
  });

  it("does not call insertUser when required data is missing", async () => {
    const mockReq = { 
      json: jest.fn().mockResolvedValue({ data: {} }) 
    };

    const response = await POST(mockReq as any);
    const body = await response.json();

    expect(insertUser).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(body.message).toBe("User inserted successfully");
  });

  it("returns 500 when insertUser throws", async () => {
    (insertUser as jest.Mock).mockRejectedValueOnce(new Error("DB failed"));

    const mockReq = {
      json: jest.fn().mockResolvedValue({
        data: {
          id: "c2",
          first_name: "Alice",
          email_addresses: [{ email_address: "alice@example.com" }],
        },
      }),
    };

    const response = await POST(mockReq as any);
    const body = await response.json();

    expect(insertUser).toHaveBeenCalled();
    expect(response.status).toBe(500);
    expect(body.error).toContain("Failed to insert user: Error: DB failed");
  });
});