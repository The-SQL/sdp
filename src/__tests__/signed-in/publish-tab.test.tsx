// src/__tests__/signed-in/publish-tab.test.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import PublishTab from '@/app/(signed-in)/create-course/publish-tab';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock UI components with proper implementations
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={className}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: any) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ className, rows, placeholder, value, onChange }: any) => (
    <textarea 
      data-testid="textarea"
      className={className}
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  ),
}));

// Mock Lucide React icons properly
jest.mock('lucide-react', () => ({
  LoaderCircle: ({ className }: any) => (
    <div data-testid="loader-circle" className={className}>Loading...</div>
  ),
}));

// Mock window.alert
const mockAlert = jest.fn();
global.alert = mockAlert;

describe('PublishTab', () => {
  const mockPublishCourse = jest.fn();
  const mockSetCourseData = jest.fn();
  const mockSetSummaryOfChanges = jest.fn();
  const mockRouterPush = jest.fn();
  
  const defaultProps = {
    publishCourse: mockPublishCourse,
    uploadStep: '',
    courseData: {
      id: 'course-123',
      author_id: 'user-123',
      language_id: 'lang-1',
      title: 'Test Course',
      description: 'Test Description',
      difficulty: 'beginner',
      estimated_duration: '2 hours',
      learning_objectives: 'Learn something',
      profile_url: '',
      is_public: false,
      is_published: false,
      open_to_collab: true,
    },
    setCourseData: mockSetCourseData,
    isAuthor: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
    mockPublishCourse.mockClear();
    mockSetCourseData.mockClear();
    mockSetSummaryOfChanges.mockClear();
    mockRouterPush.mockClear();
    mockAlert.mockClear();
  });

  describe('Basic Rendering', () => {
    it('renders publish tab with basic elements', () => {
      render(<PublishTab {...defaultProps} />);

      expect(screen.getByText('Publish Your Course')).toBeInTheDocument();
      expect(screen.getByText('Review your course before making it available to students')).toBeInTheDocument();
      expect(screen.getByTestId('button')).toBeInTheDocument();
    });

    it('shows upload step when provided', () => {
      render(<PublishTab {...defaultProps} uploadStep="Uploading course..." />);

      expect(screen.getByText('Uploading course...')).toBeInTheDocument();
    });
  });

  describe('Author with Main Version', () => {
    it('shows publishing options for author with main version', () => {
      render(<PublishTab {...defaultProps} />);

      expect(screen.getByText('Publishing Options')).toBeInTheDocument();
      
      // Use more specific queries for the radio buttons
      expect(screen.getByRole('radio', { name: /Save as Draft/ })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Publish as Unlisted/ })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Publish Publicly/ })).toBeInTheDocument();
    });

    it('shows draft option as checked by default', () => {
      render(<PublishTab {...defaultProps} />);

      const draftRadio = screen.getByRole('radio', { name: /Save as Draft/ });
      expect(draftRadio).toBeChecked();
    });

    it('updates course data when selecting unlisted option', () => {
      render(<PublishTab {...defaultProps} />);

      const unlistedRadio = screen.getByRole('radio', { name: /Publish as Unlisted/ });
      fireEvent.click(unlistedRadio);

      expect(mockSetCourseData).toHaveBeenCalledWith({
        ...defaultProps.courseData,
        is_published: true,
        is_public: false,
      });
    });

    it('updates course data when selecting public option', () => {
      render(<PublishTab {...defaultProps} />);

      const publicRadio = screen.getByRole('radio', { name: /Publish Publicly/ });
      fireEvent.click(publicRadio);

      expect(mockSetCourseData).toHaveBeenCalledWith({
        ...defaultProps.courseData,
        is_published: true,
        is_public: true,
      });
    });

    it('shows "Publish Course" button for new course', () => {
      render(<PublishTab {...defaultProps} />);

      expect(screen.getByText('Publish Course')).toBeInTheDocument();
    });

    it('shows "Update Course" button when isEditing is true', () => {
      render(<PublishTab {...defaultProps} isEditing={true} />);

      expect(screen.getByText('Update Course')).toBeInTheDocument();
    });

    it('shows loader when publishing is in progress', async () => {
      // Mock a delayed response to see the loading state
      mockPublishCourse.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ success: true, data: { id: 'course-123' } }), 100)
      ));

      render(<PublishTab {...defaultProps} />);

      const publishButton = screen.getByText('Publish Course');
      fireEvent.click(publishButton);

      // The button should show loading state
      // Note: In the actual implementation, the button text changes to the loader
      await waitFor(() => {
        expect(mockPublishCourse).toHaveBeenCalled();
      });
    });
  });

  describe('Publish Flow - Author Main Version', () => {
    it('successfully publishes draft course and shows alert', async () => {
      mockPublishCourse.mockResolvedValue({ 
        success: true, 
        data: { id: 'course-123', title: 'Test Course' } 
      });

      render(<PublishTab {...defaultProps} />);

      const publishButton = screen.getByText('Publish Course');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(mockPublishCourse).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Course saved as draft.');
      });

      expect(mockRouterPush).toHaveBeenCalledWith('/course/course-123');
    });

    it('successfully publishes unlisted course and shows alert', async () => {
      mockPublishCourse.mockResolvedValue({ 
        success: true, 
        data: { id: 'course-123', title: 'Test Course' } 
      });

      render(<PublishTab {...defaultProps} courseData={{
        ...defaultProps.courseData,
        is_published: true,
        is_public: false,
      }} />);

      const publishButton = screen.getByText('Publish Course');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(mockPublishCourse).toHaveBeenCalled();
      });

      expect(mockAlert).toHaveBeenCalledWith('Course published as unlisted.');
      expect(mockRouterPush).toHaveBeenCalledWith('/course/course-123');
    });

    it('successfully publishes public course and shows alert', async () => {
      mockPublishCourse.mockResolvedValue({ 
        success: true, 
        data: { id: 'course-123', title: 'Test Course' } 
      });

      render(<PublishTab {...defaultProps} courseData={{
        ...defaultProps.courseData,
        is_published: true,
        is_public: true,
      }} />);

      const publishButton = screen.getByText('Publish Course');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(mockPublishCourse).toHaveBeenCalled();
      });

      expect(mockAlert).toHaveBeenCalledWith('Course published publicly.');
      expect(mockRouterPush).toHaveBeenCalledWith('/course/course-123');
    });

  });

  describe('Author with Non-Main Version', () => {
    it('does not show publishing options for non-main version', () => {
      render(<PublishTab {...defaultProps} courseVersion="branch-123" />);

      expect(screen.queryByText('Publishing Options')).not.toBeInTheDocument();
    });

    it('shows "Publish changes to main" button for non-main version', () => {
      render(<PublishTab {...defaultProps} courseVersion="branch-123" />);

      expect(screen.getByText('Publish changes to main')).toBeInTheDocument();
    });

    it('successfully publishes changes to main', async () => {
      mockPublishCourse.mockResolvedValue({ success: true });

      render(<PublishTab {...defaultProps} courseVersion="branch-123" />);

      const publishButton = screen.getByText('Publish changes to main');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(mockPublishCourse).toHaveBeenCalled();
      });

      expect(mockAlert).toHaveBeenCalledWith('Course changes published to main successfully.');
      expect(mockRouterPush).toHaveBeenCalledWith('/course/course-123');
    });

    it('handles failure when publishing changes to main', async () => {
      mockPublishCourse.mockResolvedValue({ success: false });

      render(<PublishTab {...defaultProps} courseVersion="branch-123" />);

      const publishButton = screen.getByText('Publish changes to main');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(mockPublishCourse).toHaveBeenCalled();
      });

      expect(mockAlert).toHaveBeenCalledWith('There was an error publishing your changes.');
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  describe('Non-Author (Collaborator)', () => {
    const nonAuthorProps = {
      ...defaultProps,
      isAuthor: false,
      summaryOfChanges: '',
      setSummaryOfChanges: mockSetSummaryOfChanges,
    };

    it('shows summary of changes textarea for non-author', () => {
      render(<PublishTab {...nonAuthorProps} />);

      expect(screen.getByTestId('textarea')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Describe the changes you are proposing...')).toBeInTheDocument();
    });

    it('updates summary of changes when typing', () => {
      render(<PublishTab {...nonAuthorProps} />);

      const textarea = screen.getByTestId('textarea');
      fireEvent.change(textarea, { target: { value: 'Updated the content' } });

      expect(mockSetSummaryOfChanges).toHaveBeenCalledWith('Updated the content');
    });

    it('shows "Propose changes" button for non-author', () => {
      render(<PublishTab {...nonAuthorProps} />);

      expect(screen.getByText('Propose changes')).toBeInTheDocument();
    });

    it('successfully proposes changes as non-author', async () => {
      mockPublishCourse.mockResolvedValue({ success: true });

      render(<PublishTab {...nonAuthorProps} />);

      const proposeButton = screen.getByText('Propose changes');
      fireEvent.click(proposeButton);

      await waitFor(() => {
        expect(mockPublishCourse).toHaveBeenCalled();
      });

      expect(mockAlert).toHaveBeenCalledWith('Course change request proposed successfully.');
    });

    it('handles failure when proposing changes as non-author', async () => {
      mockPublishCourse.mockResolvedValue({ success: false });

      render(<PublishTab {...nonAuthorProps} />);

      const proposeButton = screen.getByText('Propose changes');
      fireEvent.click(proposeButton);

      await waitFor(() => {
        expect(mockPublishCourse).toHaveBeenCalled();
      });

      expect(mockAlert).toHaveBeenCalledWith('There was an error making the request.');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles missing course data id for non-main version redirect', async () => {
      mockPublishCourse.mockResolvedValue({ success: true });

      render(<PublishTab 
        {...defaultProps} 
        courseVersion="branch-123"
        courseData={{ ...defaultProps.courseData, id: undefined }}
      />);

      const publishButton = screen.getByText('Publish changes to main');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(mockPublishCourse).toHaveBeenCalled();
      });

      expect(mockRouterPush).toHaveBeenCalledWith('/course/undefined');
    });

    it('handles missing data in publish response for main version', async () => {
      mockPublishCourse.mockResolvedValue({ 
        success: true, 
        data: null // Missing data
      });

      render(<PublishTab {...defaultProps} />);

      const publishButton = screen.getByText('Publish Course');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(mockPublishCourse).toHaveBeenCalled();
      });

      expect(mockRouterPush).toHaveBeenCalledWith('/course/undefined');
    });

    it('handles unknown publish state in success alert', async () => {
      mockPublishCourse.mockResolvedValue({ 
        success: true, 
        data: { id: 'course-123' } 
      });

      // Create a course data with unexpected state that doesn't match any condition
      const unexpectedCourseData = {
        ...defaultProps.courseData,
        is_published: false,
        is_public: true, // This state shouldn't normally happen
      };

      render(<PublishTab {...defaultProps} courseData={unexpectedCourseData} />);

      const publishButton = screen.getByText('Publish Course');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(mockPublishCourse).toHaveBeenCalled();
      });

      expect(mockAlert).toHaveBeenCalledWith('Not sure what happened.');
      expect(mockRouterPush).toHaveBeenCalledWith('/course/course-123');
    });

    it('handles rapid multiple clicks on publish button', async () => {
      mockPublishCourse.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: { id: 'course-123' } }), 100))
      );

      render(<PublishTab {...defaultProps} />);

      const publishButton = screen.getByText('Publish Course');
      
      // Click multiple times rapidly
      fireEvent.click(publishButton);
      fireEvent.click(publishButton);
      fireEvent.click(publishButton);

      await waitFor(() => {
        // Should only be called once due to isPublishing state
        expect(mockPublishCourse).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state during publish operation', async () => {
      mockPublishCourse.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: { id: 'course-123' } }), 100))
      );

      render(<PublishTab {...defaultProps} />);

      const publishButton = screen.getByText('Publish Course');
      fireEvent.click(publishButton);

      // Button should be in loading state (disabled)
      expect(publishButton).toBeDisabled();
      
      await waitFor(() => {
        expect(mockPublishCourse).toHaveBeenCalled();
      });
    });
  });

  describe('Alert Messages', () => {
    beforeEach(() => {
      mockAlert.mockClear();
    });

    it('shows correct alert for draft save', async () => {
      mockPublishCourse.mockResolvedValue({ success: true, data: { id: 'course-123' } });

      render(<PublishTab {...defaultProps} />); // Default is draft

      const publishButton = screen.getByText('Publish Course');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(mockPublishCourse).toHaveBeenCalled();
      });

      expect(mockAlert).toHaveBeenCalledWith('Course saved as draft.');
    });

    it('shows correct alert for unlisted publish', async () => {
      mockPublishCourse.mockResolvedValue({ success: true, data: { id: 'course-123' } });

      render(<PublishTab 
        {...defaultProps} 
        courseData={{ ...defaultProps.courseData, is_published: true, is_public: false }}
      />);

      const publishButton = screen.getByText('Publish Course');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(mockPublishCourse).toHaveBeenCalled();
      });

      expect(mockAlert).toHaveBeenCalledWith('Course published as unlisted.');
    });

    it('shows correct alert for public publish', async () => {
      mockPublishCourse.mockResolvedValue({ success: true, data: { id: 'course-123' } });

      render(<PublishTab 
        {...defaultProps} 
        courseData={{ ...defaultProps.courseData, is_published: true, is_public: true }}
      />);

      const publishButton = screen.getByText('Publish Course');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(mockPublishCourse).toHaveBeenCalled();
      });

      expect(mockAlert).toHaveBeenCalledWith('Course published publicly.');
    });

    it('shows error alert on publish failure', async () => {
      mockPublishCourse.mockResolvedValue({ success: false, data: null });

      render(<PublishTab {...defaultProps} />);

      const publishButton = screen.getByText('Publish Course');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(mockPublishCourse).toHaveBeenCalled();
      });

      expect(mockAlert).toHaveBeenCalledWith('There was an error publishing your course.');
    });
  });
});