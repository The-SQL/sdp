import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CollaborateButton from '@/app/(signed-in)/course/[id]/collaborate-button'; // Update with actual path
import { useUser } from '@clerk/nextjs';
import {
  addCollaborator,
  cancelCollaboration,
  getCourseCollaborator,
} from '@/utils/db/client';

// Mock external dependencies
jest.mock('@/components/ui/button', () => {
  return {
    Button: ({ 
      children, 
      variant, 
      disabled, 
      className, 
      onClick 
    }: { 
      children: React.ReactNode;
      variant?: string;
      disabled?: boolean;
      className?: string;
      onClick?: () => void;
    }) => (
      <button 
        data-testid="button"
        data-variant={variant}
        data-disabled={disabled}
        className={className}
        onClick={onClick}
      >
        {children}
      </button>
    ),
  };
});

jest.mock('@/utils/db/client', () => ({
  addCollaborator: jest.fn(),
  cancelCollaboration: jest.fn(),
  getCourseCollaborator: jest.fn(),
}));

jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

jest.mock('clsx', () => jest.fn((...args) => args.join(' ')));

jest.mock('lucide-react', () => ({
  Loader2: ({ className }: { className?: string }) => (
    <div data-testid="loader" className={className}>Loader</div>
  ),
}));

// Mock alert
const mockAlert = jest.fn();
global.alert = mockAlert;

// Mock console.error
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

jest.mock('@/utils/db/client');

// 3. Create typed mock variables from the imported functions
const mockAddCollaborator = jest.mocked(addCollaborator);
const mockCancelCollaboration = jest.mocked(cancelCollaboration);
const mockGetCourseCollaborator = jest.mocked(getCourseCollaborator);
const mockUseUser = jest.mocked(useUser);

describe('CollaborateButton', () => {
  const defaultProps = {
    courseId: 'course-123',
    authorId: 'author-123',
    openToCollab: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({
      user: {
        id: 'user-123',
      },
      isSignedIn: true,
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it('renders collaborate button when visible and no collaboration exists', async () => {
    mockGetCourseCollaborator.mockResolvedValue(null);

    render(<CollaborateButton {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('button')).toBeInTheDocument();
    });

    expect(screen.getByText('Collaborate')).toBeInTheDocument();
  });


  it('shows active collaboration button when user is an active collaborator', async () => {
    mockGetCourseCollaborator.mockResolvedValue({
      status: 'active',
      user_id: 'user-123',
      course_id: 'course-123',
    });

    render(<CollaborateButton {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Stop Collaboration')).toBeInTheDocument();
    });

    expect(screen.getByTestId('button')).toHaveAttribute('data-variant', 'destructive');
  });


  describe('Collaborate action', () => {
    it('sends collaboration request when clicked', async () => {
      mockGetCourseCollaborator.mockResolvedValue(null);
      mockAddCollaborator.mockResolvedValue(undefined);

      render(<CollaborateButton {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Collaborate')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('button'));

      await waitFor(() => {
        expect(mockAddCollaborator).toHaveBeenCalledWith('course-123', 'user-123', 'pending');
      });

      expect(mockAlert).toHaveBeenCalledWith('Collaboration request sent!');
    });


    it('handles collaboration request error', async () => {
      mockGetCourseCollaborator.mockResolvedValue(null);
      mockAddCollaborator.mockRejectedValue(new Error('API error'));

      render(<CollaborateButton {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Collaborate')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('button'));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error sending collaboration request.');
      });
    });
  });

  describe('Stop collaboration action', () => {
    it('cancels collaboration when stop button is clicked', async () => {
      mockGetCourseCollaborator.mockResolvedValue({
        status: 'active',
        user_id: 'user-123',
        course_id: 'course-123',
      });
      mockCancelCollaboration.mockResolvedValue(undefined);

      render(<CollaborateButton {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Stop Collaboration')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('button'));

      await waitFor(() => {
        expect(mockCancelCollaboration).toHaveBeenCalledWith('course-123', 'user-123');
      });

      expect(mockAlert).toHaveBeenCalledWith('Collaboration cancelled.');
    });

    it('handles cancellation error', async () => {
      mockGetCourseCollaborator.mockResolvedValue({
        status: 'active',
        user_id: 'user-123',
        course_id: 'course-123',
      });
      mockCancelCollaboration.mockRejectedValue(new Error('Cancellation failed'));

      render(<CollaborateButton {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Stop Collaboration')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('button'));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error cancelling collaboration.');
      });
    });
  });

  describe('User states', () => {

    it('fetches collaboration status on mount', async () => {
      mockGetCourseCollaborator.mockResolvedValue({
        status: 'pending',
        user_id: 'user-123',
        course_id: 'course-123',
      });

      render(<CollaborateButton {...defaultProps} />);

      await waitFor(() => {
        expect(mockGetCourseCollaborator).toHaveBeenCalledWith('course-123', 'user-123');
      });

      expect(screen.getByText('Waiting for Response')).toBeInTheDocument();
    });

    it('handles collaboration status fetch error', async () => {
      mockGetCourseCollaborator.mockRejectedValue(new Error('Fetch failed'));

      render(<CollaborateButton {...defaultProps} />);

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          'Error fetching collaboration status:',
          expect.any(Error)
        );
      });

      // Should still render the collaborate button since status defaults to "none"
      expect(screen.getByText('Collaborate')).toBeInTheDocument();
    });
  });

  describe('Visibility logic', () => {
    it('becomes visible when conditions are met', async () => {
      mockGetCourseCollaborator.mockResolvedValue(null);
      
      render(<CollaborateButton {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('button')).toBeInTheDocument();
      });
    });
  });
});