import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import CollaborationTab from "@/app/(signed-in)/create-course/collaboration-tab"; // Update with actual path
import { useUser } from "@clerk/nextjs";
import { Course } from "@/utils/types";
import {
  getCourseCollaborators,
  updateCollaboratorStatus,
} from '@/utils/db/client';

// Mock external dependencies
jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar">{children}</div>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <span data-testid="badge" className={className}>
      {children}
    </span>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    variant,
    disabled,
    className,
    onClick,
    size,
    type,
  }: {
    children: React.ReactNode;
    variant?: string;
    disabled?: boolean;
    className?: string;
    onClick?: () => void;
    size?: string;
    type?: "button" | "submit" | "reset";
  }) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-disabled={disabled}
      data-size={size}
      data-type={type}
      className={className}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    placeholder,
    value,
    onChange,
    className,
    type,
  }: {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    type?: string;
  }) => (
    <input
      data-testid="input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      type={type}
    />
  ),
}));

jest.mock("@/components/ui/switch", () => ({
  Switch: ({
    checked,
    onCheckedChange,
  }: {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }) => (
    <button
      data-testid="switch"
      data-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
    >
      Switch
    </button>
  ),
}));

jest.mock("@/utils/db/client", () => ({
  getCourseCollaborators: jest.fn(),
  updateCollaboratorStatus: jest.fn(),
}));

jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
}));

jest.mock("date-fns", () => ({
  format: jest.fn(() => "01 Jan 2024"),
}));

// Mock Lucide icons
jest.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader-icon">Loader2</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
}));

// Mock fetch
global.fetch = jest.fn();

// Mock console.error
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

// Mock implementations
const mockUseUser = jest.mocked(useUser);
jest.mock('@/utils/db/client');

// 3. Create typed mock variables from the imported functions
const mockGetCourseCollaborators = jest.mocked(getCourseCollaborators);
const mockUpdateCollaboratorStatus = jest.mocked(updateCollaboratorStatus);

describe("CollaborationTab", () => {
  // Custom query functions for multiple elements
  const getCardByTitle = (title: string) => {
    const cards = screen.getAllByTestId("card");
    return cards.find((card) => within(card).queryByText(title));
  };

  const getCollaboratorItem = (userName: string) => {
    const cards = screen.getAllByTestId("card");
    const collaboratorsCard = cards.find((card) =>
      within(card).queryByText("Current Collaborators")
    );

    if (!collaboratorsCard) return null;

    return within(collaboratorsCard)
      .queryByText(userName)
      ?.closest('[class*="border-gray-200"]');
  };

  const getRequestItem = (userName: string) => {
    const cards = screen.getAllByTestId("card");
    const requestsCard = cards.find((card) =>
      within(card).queryByText("Collaboration Requests")
    );

    if (!requestsCard) return null;

    return within(requestsCard)
      .queryByText(userName)
      ?.closest('[class*="border-gray-200"]');
  };

  const getAcceptButton = (requestElement: HTMLElement) =>
    within(requestElement)
      .getAllByTestId("button")
      .find((button) => button.textContent?.includes("Accept"));

  const getDeclineButton = (requestElement: HTMLElement) =>
    within(requestElement)
      .getAllByTestId("button")
      .find((button) => button.textContent?.includes("Decline"));

  const getRemoveButton = (collaboratorElement: HTMLElement) =>
    within(collaboratorElement)
      .getAllByTestId("button")
      .find((button) => button.textContent?.includes("Remove"));

  // Mock data
  const mockCourseData: Course = {
    id: "course-123",
    author_id: "author-1",
    language_id: "lang-1",
    title: "Test Course",
    description: "This is a test course",
    difficulty: "Beginner",
    estimated_duration: "3 hours",
    learning_objectives: "Learn basics of testing",
    profile_url: "",
    is_public: true,
    is_published: false,
    open_to_collab: true,
  };

  
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockCollaborators: any[] = [
    {
      id: "collab-1",
      status: "active",
      created_at: "2024-01-01T00:00:00Z",
      users: {
        name: "Active Collaborator",
        email: "active@example.com",
      },
    },
    {
      id: "collab-2",
      status: "pending",
      created_at: "2024-01-02T00:00:00Z",
      users: {
        name: "Pending Collaborator",
        email: "pending@example.com",
      },
    },
    {
      id: "collab-3",
      status: "rejected",
      created_at: "2024-01-03T00:00:00Z",
      users: {
        name: "Rejected Collaborator",
        email: "rejected@example.com",
      },
    },
  ];

  const mockSetCourseData = jest.fn();

  const defaultProps = {
    courseData: mockCourseData,
    setCourseData: mockSetCourseData,
    isEditing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({
      user: {
        fullName: "Test User",
      },
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    mockGetCourseCollaborators.mockResolvedValue(mockCollaborators);
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("Non-Editing Mode", () => {
    it("renders only collaboration settings in non-editing mode", () => {
      render(<CollaborationTab {...defaultProps} />);

      expect(screen.getByText("Collaboration Settings")).toBeInTheDocument();
      expect(
        screen.queryByText("Invite Collaborators")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Current Collaborators")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Collaboration Requests")
      ).not.toBeInTheDocument();
    });

    it("toggles collaboration switch", () => {
      render(<CollaborationTab {...defaultProps} />);

      const switchButton = screen.getByTestId("switch");
      expect(switchButton).toHaveAttribute("data-checked", "true");

      fireEvent.click(switchButton);

      expect(mockSetCourseData).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("Editing Mode", () => {
    const editingProps = {
      ...defaultProps,
      isEditing: true,
    };

    beforeEach(() => {
      mockGetCourseCollaborators.mockResolvedValue(mockCollaborators);
    });

    it("renders all sections in editing mode", async () => {
      render(<CollaborationTab {...editingProps} />);

      await waitFor(() => {
        expect(screen.getByText("Collaboration Settings")).toBeInTheDocument();
        expect(screen.getByText("Invite Collaborators")).toBeInTheDocument();
        expect(screen.getByText("Current Collaborators")).toBeInTheDocument();
        expect(screen.getByText("Collaboration Requests")).toBeInTheDocument();
      });
    });

    it("fetches collaborators on mount", async () => {
      render(<CollaborationTab {...editingProps} />);

      await waitFor(() => {
        expect(mockGetCourseCollaborators).toHaveBeenCalledWith("course-123");
      });
    });

    it("displays course owner in current collaborators", async () => {
      render(<CollaborationTab {...editingProps} />);

      await waitFor(() => {
        expect(screen.getByText("Test User")).toBeInTheDocument();
        expect(screen.getByText("Course Creator")).toBeInTheDocument();
        expect(screen.getByText("Owner")).toBeInTheDocument();
      });
    });

    it("displays active collaborators", async () => {
      render(<CollaborationTab {...editingProps} />);

      await waitFor(() => {
        expect(screen.getByText("Active Collaborator")).toBeInTheDocument();
      });
    });

    it("displays pending collaboration requests", async () => {
      render(<CollaborationTab {...editingProps} />);

      await waitFor(() => {
        expect(screen.getByText("Pending Collaborator")).toBeInTheDocument();
        expect(screen.getByText("1 pending requests")).toBeInTheDocument();
      });
    });

    it("does not display rejected collaborators", async () => {
      render(<CollaborationTab {...editingProps} />);

      await waitFor(() => {
        expect(
          screen.queryByText("Rejected Collaborator")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Collaboration Requests Management", () => {
    const editingProps = {
      ...defaultProps,
      isEditing: true,
    };

    beforeEach(() => {
      mockGetCourseCollaborators.mockResolvedValue(mockCollaborators);
      mockUpdateCollaboratorStatus.mockResolvedValue(undefined);
    });

    it("accepts collaboration request", async () => {
      render(<CollaborationTab {...editingProps} />);

      await waitFor(() => {
        expect(screen.getByText("Pending Collaborator")).toBeInTheDocument();
      });

      const requestItem = getRequestItem("Pending Collaborator") as HTMLElement;
      expect(requestItem).toBeInTheDocument();

      const acceptButton = getAcceptButton(requestItem);
      fireEvent.click(acceptButton!);

      await waitFor(() => {
        expect(mockUpdateCollaboratorStatus).toHaveBeenCalledWith(
          "collab-2",
          "active"
        );
      });
    });

    it("declines collaboration request", async () => {
      render(<CollaborationTab {...editingProps} />);

      await waitFor(() => {
        expect(screen.getByText("Pending Collaborator")).toBeInTheDocument();
      });

      const requestItem = getRequestItem("Pending Collaborator") as HTMLElement;
      const declineButton = getDeclineButton(requestItem!);
      fireEvent.click(declineButton!);

      await waitFor(() => {
        expect(mockUpdateCollaboratorStatus).toHaveBeenCalledWith(
          "collab-2",
          "rejected"
        );
      });
    });

    it("removes active collaborator", async () => {
      render(<CollaborationTab {...editingProps} />);

      await waitFor(() => {
        expect(screen.getByText("Active Collaborator")).toBeInTheDocument();
      });

      const collaboratorItem = getCollaboratorItem(
        "Active Collaborator"
      ) as HTMLElement;
      const removeButton = getRemoveButton(collaboratorItem!);
      fireEvent.click(removeButton!);

      await waitFor(() => {
        expect(mockUpdateCollaboratorStatus).toHaveBeenCalledWith(
          "collab-1",
          "cancelled"
        );
      });
    });

  });

  describe("Invite Collaborators", () => {
    const editingProps = {
      ...defaultProps,
      isEditing: true,
    };

    beforeEach(() => {
      mockGetCourseCollaborators.mockResolvedValue([]);
    });

    it("sends invitation when form is submitted", async () => {
      render(<CollaborationTab {...editingProps} />);

      const emailInput = screen.getByPlaceholderText("Enter username or email");
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      const inviteButton = screen.getByText("Invite");
      fireEvent.click(inviteButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              to: "test@example.com",
              senderName: "Test User",
              courseTitle: "Test Course",
              courseUrl: "http://localhost/courses/course-123",
            },
          }),
        });
      });
    });

    it("disables invite button when email is empty", () => {
      render(<CollaborationTab {...editingProps} />);

      const inviteButton = screen.getByText("Invite");
      expect(inviteButton).toBeDisabled();
    });

    it("shows loading state during invitation", async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<CollaborationTab {...editingProps} />);

      const emailInput = screen.getByPlaceholderText("Enter username or email");
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      const inviteButton = screen.getByText("Invite");
      fireEvent.click(inviteButton);

      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    });

    it("resets form after successful invitation", async () => {
      render(<CollaborationTab {...editingProps} />);

      const emailInput = screen.getByPlaceholderText("Enter username or email");
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      const inviteButton = screen.getByText("Invite");
      fireEvent.click(inviteButton);

      await waitFor(() => {
        expect(emailInput).toHaveValue("");
      });
    });
  });

  describe("Empty States", () => {
    const editingProps = {
      ...defaultProps,
      isEditing: true,
    };

    it("shows empty state when no collaboration requests", async () => {
      mockGetCourseCollaborators.mockResolvedValue([]);

      render(<CollaborationTab {...editingProps} />);

      await waitFor(() => {
        expect(
          screen.getByText("No collaboration requests yet")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Share your course to attract contributors")
        ).toBeInTheDocument();
        expect(screen.getByTestId("users-icon")).toBeInTheDocument();
      });
    });

    it("shows 0 pending requests when no pending collaborators", async () => {
      const collaboratorsWithoutPending = mockCollaborators.filter(
        (c) => c.status !== "pending"
      );
      mockGetCourseCollaborators.mockResolvedValue(collaboratorsWithoutPending);

      render(<CollaborationTab {...editingProps} />);

      await waitFor(() => {
        expect(screen.getByText("0 pending requests")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    const editingProps = {
      ...defaultProps,
      isEditing: true,
    };

    it("handles missing user data gracefully", () => {
      mockUseUser.mockReturnValue({
        user: null,
        
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      render(<CollaborationTab {...editingProps} />);

      // Should still render without crashing
      expect(screen.getByText("Collaboration Settings")).toBeInTheDocument();
    });
  });

  describe("Multiple Elements Handling", () => {
    const editingProps = {
      ...defaultProps,
      isEditing: true,
    };

    it("finds correct elements among multiple cards", async () => {
      render(<CollaborationTab {...editingProps} />);

      await waitFor(() => {
        const settingsCard = getCardByTitle("Collaboration Settings");
        const inviteCard = getCardByTitle("Invite Collaborators");
        const collaboratorsCard = getCardByTitle("Current Collaborators");
        const requestsCard = getCardByTitle("Collaboration Requests");

        expect(settingsCard).toBeInTheDocument();
        expect(inviteCard).toBeInTheDocument();
        expect(collaboratorsCard).toBeInTheDocument();
        expect(requestsCard).toBeInTheDocument();

        // Verify each card has the correct content
        expect(
          within(settingsCard!).getByText("Accept Collaboration Requests")
        ).toBeInTheDocument();
        expect(
          within(inviteCard!).getByPlaceholderText("Enter username or email")
        ).toBeInTheDocument();
        expect(
          within(collaboratorsCard!).getByText("Test User")
        ).toBeInTheDocument();
        expect(
          within(requestsCard!).getByText("Pending Collaborator")
        ).toBeInTheDocument();
      });
    });
  });
});
