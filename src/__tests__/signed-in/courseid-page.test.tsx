import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CourseOverview from '@/app/(signed-in)/course/[id]/page'; // Update with actual path
import { useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import {
  getCourseById,
  checkIfFavorited,
  checkIfEnrolled,
  enrollInCourse,
  addToFavorites,
  removeFromFavorites,
} from '@/utils/db/client';

// Mock external dependencies
jest.mock('@/components/loading', () => {
  return function MockLoading() {
    return <div data-testid="loading">Loading...</div>;
  };
});

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar">{children}</div>
  ),
  AvatarImage: ({ src }: { src: string }) => (
    <img data-testid="avatar-image" src={src} alt="avatar" />
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar-fallback">{children}</div>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ 
    children, 
    variant, 
    disabled, 
    className, 
    onClick,
    asChild
  }: { 
    children: React.ReactNode;
    variant?: string;
    disabled?: boolean;
    className?: string;
    onClick?: () => void;
    asChild?: boolean;
  }) => {
    if (asChild) {
      return <div data-testid="button-as-child">{children}</div>;
    }
    return (
      <button 
        data-testid="button"
        data-variant={variant}
        data-disabled={disabled}
        className={className}
        onClick={onClick}
      >
        {children}
      </button>
    );
  },
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 data-testid="card-title" className={className}>{children}</h3>
  ),
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: { children: React.ReactNode; defaultValue?: string }) => (
    <div data-testid="tabs" data-default-value={defaultValue}>{children}</div>
  ),
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid="tabs-content" data-value={value}>{children}</div>
  ),
  TabsList: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="tabs-list" className={className}>{children}</div>
  ),
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button data-testid="tabs-trigger" data-value={value}>{children}</button>
  ),
}));

jest.mock('@/utils/db/client', () => ({
  addToFavorites: jest.fn(),
  removeFromFavorites: jest.fn(),
  checkIfEnrolled: jest.fn(),
  checkIfFavorited: jest.fn(),
  enrollInCourse: jest.fn(),
  getCourseById: jest.fn(),
}));

jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('next/image', () => {
  return function MockImage({ src, alt, fill, className }: { src: string; alt: string; fill?: boolean; className?: string }) {
    return <img data-testid="image" src={src} alt={alt} className={className} />;
  };
});

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a data-testid="link" href={href}>{children}</a>;
  };
});

jest.mock('@/app/(signed-in)/course/[id]/collaborate-button', () => {
  return function MockCollaborateButton({ 
    courseId, 
    authorId, 
    openToCollab 
  }: { 
    courseId: string;
    authorId: string;
    openToCollab: boolean;
  }) {
    return (
      <div data-testid="collaborate-button" data-course-id={courseId} data-author-id={authorId} data-open={openToCollab}>
        Collaborate Button
      </div>
    );
  };
});

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  BookOpen: () => <div data-testid="book-open">BookOpen</div>,
  ChevronRight: () => <div data-testid="chevron-right">ChevronRight</div>,
  Clock: () => <div data-testid="clock">Clock</div>,
  Ear: () => <div data-testid="ear">Ear</div>,
  Heart: () => <div data-testid="heart">Heart</div>,
  MessageSquare: () => <div data-testid="message-square">MessageSquare</div>,
  Play: () => <div data-testid="play">Play</div>,
  Share2: () => <div data-testid="share">Share</div>,
  Star: () => <div data-testid="star">Star</div>,
  Users: () => <div data-testid="users">Users</div>,
}));

// Mock alert and clipboard
const mockAlert = jest.fn();
global.alert = mockAlert;

const mockClipboard = {
  writeText: jest.fn(),
};
Object.defineProperty(global, 'navigator', {
  value: {
    clipboard: mockClipboard,
  },
});

// Mock console.error
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock implementations
const mockUseUser = jest.mocked(useUser);
const mockUseParams = jest.mocked(useParams);
const mockUseRouter = jest.mocked(useRouter);
jest.mock('@/utils/db/client');

// 3. Create typed mock variables from the imported functions
const mockGetCourseById = jest.mocked(getCourseById);
const mockCheckIfFavorited = jest.mocked(checkIfFavorited);
const mockCheckIfEnrolled = jest.mocked(checkIfEnrolled);
const mockEnrollInCourse = jest.mocked(enrollInCourse);
const mockAddToFavorites = jest.mocked(addToFavorites);
const mockRemoveFromFavorites = jest.mocked(removeFromFavorites);

describe('CourseOverview', () => {
  const mockPush = jest.fn();
 const mockCourse = {
  id: 'course-123',
  title: 'Test Course',
  isPublic: true,
  isPublished: false,
  subtitle: 'Learn something new',
  description: 'This is a test course description',
  image: '/test-image.jpg',
  author: {
    name: 'Test Author',
    avatar: '/author-avatar.jpg',
    bio: 'Test author bio',
    rating: 4.5,
    students: 1000,
    courses_count: 5,
  },
  level: 'Beginner',
  language: 'English',
  duration: '10 hours',
  totalLessons: 50,
  students: 1000,
  rating: 4.5,
  reviews: 25,
  lastUpdated: '2024-01-01',
  tags: ['React', 'JavaScript', 'Web Development'],
  price: 'Free',
  open_to_collab: true,
  author_id: 'author-123',
  whatYouWillLearn: [
    'Learn React fundamentals',
    'Build real projects',
    'Master modern JavaScript',
  ],
  requirements: [
    'Basic HTML knowledge',
    'JavaScript fundamentals',
  ],
  chapters: [
    {
      id: 'chapter-1',
      title: 'Introduction to React',
      lessons: 5,
      duration: '2 hours',
      completed: false,
      lessons_detail: [
        {
          title: 'What is React?',
          duration: '15 min',
          type: 'video',
        },
        {
          title: 'Setting up Environment',
          duration: '30 min',
          type: 'exercise',
        },
      ],
    },
  ],
  reviews_list: [
    {
      id: 'review-1',
      user: 'John Doe',
      avatar: '/user-avatar.jpg',
      rating: 5,
      date: '2024-01-15',
      comment: 'Excellent course!',
    },
  ],
};

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: 'course-123' });
    mockUseRouter.mockReturnValue({
      push: mockPush,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    mockUseUser.mockReturnValue({
      user: {
        id: 'user-123',
      },
      isLoaded: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it('shows loading state initially', () => {
    mockGetCourseById.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<CourseOverview />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('redirects to sign-in if user is not loaded and no user', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<CourseOverview />);

    expect(mockPush).toHaveBeenCalledWith('/sign-in');
  });

  it('renders course data when loaded', async () => {
    mockGetCourseById.mockResolvedValue(mockCourse);
    mockCheckIfFavorited.mockResolvedValue(false);
    mockCheckIfEnrolled.mockResolvedValue(false);

    render(<CourseOverview />);

    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    expect(screen.getByText('Learn something new')).toBeInTheDocument();
    expect(screen.getByText('This is a test course description')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('handles enrollment when not enrolled', async () => {
    mockGetCourseById.mockResolvedValue(mockCourse);
    mockCheckIfFavorited.mockResolvedValue(false);
    mockCheckIfEnrolled.mockResolvedValue(false);
    mockEnrollInCourse.mockResolvedValue(undefined);

    render(<CourseOverview />);

    await waitFor(() => {
      expect(screen.getByText('Enrol Now')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Enrol Now'));

    await waitFor(() => {
      expect(mockEnrollInCourse).toHaveBeenCalledWith('course-123', 'user-123');
    });
  });

  it('shows continue learning when enrolled', async () => {
    mockGetCourseById.mockResolvedValue(mockCourse);
    mockCheckIfFavorited.mockResolvedValue(false);
    mockCheckIfEnrolled.mockResolvedValue(true);

    render(<CourseOverview />);

    await waitFor(() => {
      expect(screen.getByText('Continue Learning')).toBeInTheDocument();
    });
  });

  it('toggles favorite state', async () => {
    mockGetCourseById.mockResolvedValue(mockCourse);
    mockCheckIfFavorited.mockResolvedValue(false);
    mockCheckIfEnrolled.mockResolvedValue(false);
    mockAddToFavorites.mockResolvedValue(undefined);

    render(<CourseOverview />);

    await waitFor(() => {
      expect(screen.getByText('Add to Favorites')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add to Favorites'));

    await waitFor(() => {
      expect(mockAddToFavorites).toHaveBeenCalledWith('course-123', 'user-123');
    });
  });

  it('removes from favorites when already favorited', async () => {
    mockGetCourseById.mockResolvedValue(mockCourse);
    mockCheckIfFavorited.mockResolvedValue(true);
    mockCheckIfEnrolled.mockResolvedValue(false);
    mockRemoveFromFavorites.mockResolvedValue(undefined);

    render(<CourseOverview />);

    await waitFor(() => {
      expect(screen.getByText('Added to Favorites')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Added to Favorites'));

    await waitFor(() => {
      expect(mockRemoveFromFavorites).toHaveBeenCalledWith('course-123', 'user-123');
    });
  });


  it('renders collaborate button with correct props', async () => {
    mockGetCourseById.mockResolvedValue(mockCourse);
    mockCheckIfFavorited.mockResolvedValue(false);
    mockCheckIfEnrolled.mockResolvedValue(false);

    render(<CourseOverview />);

    await waitFor(() => {
      expect(screen.getByTestId('collaborate-button')).toBeInTheDocument();
    });

    const collaborateButton = screen.getByTestId('collaborate-button');
    expect(collaborateButton).toHaveAttribute('data-course-id', 'course-123');
    expect(collaborateButton).toHaveAttribute('data-author-id', 'author-123');
    expect(collaborateButton).toHaveAttribute('data-open', 'true');
  });

  it('renders curriculum tab content', async () => {
    mockGetCourseById.mockResolvedValue(mockCourse);
    mockCheckIfFavorited.mockResolvedValue(false);
    mockCheckIfEnrolled.mockResolvedValue(false);

    render(<CourseOverview />);

    await waitFor(() => {
      expect(screen.getByText('Course Curriculum')).toBeInTheDocument();
    });

    expect(screen.getByText('Introduction to React')).toBeInTheDocument();
    expect(screen.getByText('What is React?')).toBeInTheDocument();
  });

  it('renders about tab content with learning objectives', async () => {
    mockGetCourseById.mockResolvedValue(mockCourse);
    mockCheckIfFavorited.mockResolvedValue(false);
    mockCheckIfEnrolled.mockResolvedValue(false);

    render(<CourseOverview />);

    await waitFor(() => {
      expect(screen.getByText("What you'll learn")).toBeInTheDocument();
    });

    expect(screen.getByText('Learn React fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Build real projects')).toBeInTheDocument();
  });

  it('renders reviews tab content', async () => {
    mockGetCourseById.mockResolvedValue(mockCourse);
    mockCheckIfFavorited.mockResolvedValue(false);
    mockCheckIfEnrolled.mockResolvedValue(false);

    render(<CourseOverview />);

    await waitFor(() => {
      expect(screen.getByText('Student Reviews')).toBeInTheDocument();
    });

    expect(screen.getByText('Excellent course!')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders discussions tab content', async () => {
    mockGetCourseById.mockResolvedValue(mockCourse);
    mockCheckIfFavorited.mockResolvedValue(false);
    mockCheckIfEnrolled.mockResolvedValue(false);

    render(<CourseOverview />);

    await waitFor(() => {
      expect(screen.getByText('Course Discussions')).toBeInTheDocument();
    });

    expect(screen.getByText('Join the Discussion')).toBeInTheDocument();
  });

  it('handles course fetch error', async () => {
    mockGetCourseById.mockRejectedValue(new Error('Fetch failed'));
    
    render(<CourseOverview />);

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error fetching course:',
        expect.any(Error)
      );
    });
  });

  it('handles enrollment error', async () => {
    mockGetCourseById.mockResolvedValue(mockCourse);
    mockCheckIfFavorited.mockResolvedValue(false);
    mockCheckIfEnrolled.mockResolvedValue(false);
    mockEnrollInCourse.mockRejectedValue(new Error('Enrollment failed'));

    render(<CourseOverview />);

    await waitFor(() => {
      expect(screen.getByText('Enrol Now')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Enrol Now'));

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error enrolling in course:',
        expect.any(Error)
      );
    });
  });

  it('handles favorite toggle error', async () => {
    mockGetCourseById.mockResolvedValue(mockCourse);
    mockCheckIfFavorited.mockResolvedValue(false);
    mockCheckIfEnrolled.mockResolvedValue(false);
    mockAddToFavorites.mockRejectedValue(new Error('Favorite failed'));

    render(<CourseOverview />);

    await waitFor(() => {
      expect(screen.getByText('Add to Favorites')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add to Favorites'));

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error toggling favorite:',
        expect.any(Error)
      );
    });
  });

  

  it('displays course tags', async () => {
    mockGetCourseById.mockResolvedValue(mockCourse);
    mockCheckIfFavorited.mockResolvedValue(false);
    mockCheckIfEnrolled.mockResolvedValue(false);

    render(<CourseOverview />);

    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Web Development')).toBeInTheDocument();
  });

  describe('accessibility', () => {
    it('has proper image alt text', async () => {
      mockGetCourseById.mockResolvedValue(mockCourse);
      mockCheckIfFavorited.mockResolvedValue(false);
      mockCheckIfEnrolled.mockResolvedValue(false);

      render(<CourseOverview />);

      await waitFor(() => {
        const images = screen.getAllByTestId('image');
        expect(images[0]).toHaveAttribute('alt', 'Test Course');
      });
    });

    it('has proper link structure', async () => {
      mockGetCourseById.mockResolvedValue(mockCourse);
      mockCheckIfFavorited.mockResolvedValue(false);
      mockCheckIfEnrolled.mockResolvedValue(false);

      render(<CourseOverview />);

      await waitFor(() => {
        const links = screen.getAllByTestId('link');
        expect(links[0]).toHaveAttribute('href', '/course/course-123/learn?unit=chapter-1');
      });
    });
  });
});