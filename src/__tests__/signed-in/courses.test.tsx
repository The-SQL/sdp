import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Courses from '@/app/(signed-in)/courses/page'; // Update with actual path
import { useAuth } from '@clerk/nextjs';
import {
  getAllCourses,
  getRecommendedCourses,
  addToFavorites,
  removeFromFavorites,
  getUserFavoriteCourseIds,
} from '@/utils/db/client';

// Mock external dependencies
jest.mock('@/components/loading', () => {
  return function MockLoading() {
    return <div data-testid="loading">Loading...</div>;
  };
});

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ 
    children, 
    variant, 
    disabled, 
    className, 
    onClick,
    size,
    asChild
  }: { 
    children: React.ReactNode;
    variant?: string;
    disabled?: boolean;
    className?: string;
    onClick?: () => void;
    size?: string;
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
        data-size={size}
        className={className}
        onClick={onClick}
      >
        {children}
      </button>
    );
  },
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange, className }: { 
    placeholder?: string; 
    value?: string; 
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
  }) => (
    <input 
      data-testid="input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
    />
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: { children: React.ReactNode; value?: string; onValueChange?: (value: string) => void }) => (
    <div data-testid="select" data-value={value}>
      {React.Children.map(children, child => 
        React.isValidElement(child) 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? React.cloneElement(child, { onValueChange } as any)
          : child
      )}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectTrigger: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="select-trigger" className={className}>{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <div data-testid="select-value" data-placeholder={placeholder}>Select Value</div>
  ),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid="select-item" data-value={value}>{children}</div>
  ),
}));

jest.mock('@/utils/db/client', () => ({
  getAllCourses: jest.fn(),
  getRecommendedCourses: jest.fn(),
  addToFavorites: jest.fn(),
  removeFromFavorites: jest.fn(),
  getUserFavoriteCourseIds: jest.fn(),
}));

jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a data-testid="link" href={href}>{children}</a>;
  };
});

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  Filter: () => <div data-testid="filter-icon">Filter</div>,
  Star: () => <div data-testid="star-icon">Star</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  Heart: () => <div data-testid="heart-icon">Heart</div>,
}));

// Mock console.error
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock implementations
const mockUseAuth = jest.mocked(useAuth);
jest.mock('@/utils/db/client');

// 3. Create typed mock variables from the imported functions
const mockGetAllCourses = jest.mocked(getAllCourses);
const mockGetRecommendedCourses = jest.mocked(getRecommendedCourses);
const mockAddToFavorites = jest.mocked(addToFavorites);
const mockRemoveFromFavorites = jest.mocked(removeFromFavorites);
const mockGetUserFavoriteCourseIds = jest.mocked(getUserFavoriteCourseIds);

describe('Courses', () => {
  const mockCourses = [
    {
      id: 'course-1',
      title: 'React Fundamentals',
      level: 'Beginner',
      language: 'English',
      image: '/react-course.jpg',
      duration: '10 hours',
      students: 1500,
      rating: 4.8,
      reviews: 200,
      author: 'John Doe',
      description: 'Learn React from scratch with this comprehensive course',
      tags: ['React', 'JavaScript', 'Frontend'],
      isRecommended: true,
      price: 'Free',
      isPublic: true,
      isPublished: true,
    },
    {
      id: 'course-2',
      title: 'Advanced Python',
      level: 'Advanced',
      language: 'Spanish',
      image: '/python-course.jpg',
      duration: '20 hours',
      students: 800,
      rating: 4.6,
      reviews: 120,
      author: 'Jane Smith',
      description: 'Master advanced Python concepts and patterns',
      tags: ['Python', 'Backend', 'Programming'],
      isRecommended: false,
      price: 'Free',
      isPublic: true,
      isPublished: true,
    },
    {
      id: 'course-3',
      title: 'JavaScript Basics',
      level: 'Beginner',
      language: 'French',
      image: '/js-course.jpg',
      duration: '8 hours',
      students: 2000,
      rating: 4.5,
      reviews: 300,
      author: 'Bob Wilson',
      description: 'Start your journey with JavaScript programming',
      tags: ['JavaScript', 'Web Development'],
      isRecommended: true,
      price: 'Free',
      isPublic: true,
      isPublished: true,
    },
  ];

  const mockRecommendedCourses = [mockCourses[0], mockCourses[2]];
  const mockFavoriteIds = ['course-1'];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      userId: 'user-123',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('Loading State', () => {
    it('shows loading state initially', () => {
      mockGetAllCourses.mockImplementation(() => new Promise(() => {}));

      render(<Courses />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  describe('Course Data Loading', () => {
    it('loads courses, recommendations, and favorites on mount', async () => {
      mockGetAllCourses.mockResolvedValue(mockCourses);
      mockGetRecommendedCourses.mockResolvedValue(mockRecommendedCourses);
      mockGetUserFavoriteCourseIds.mockResolvedValue(mockFavoriteIds);

      render(<Courses />);

      await waitFor(() => {
        expect(mockGetAllCourses).toHaveBeenCalled();
        expect(mockGetRecommendedCourses).toHaveBeenCalled();
        expect(mockGetUserFavoriteCourseIds).toHaveBeenCalledWith('user-123');
      });

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
        expect(screen.getByText('Advanced Python')).toBeInTheDocument();
        expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
      });
    });

    it('handles empty courses array', async () => {
      mockGetAllCourses.mockResolvedValue([]);
      mockGetRecommendedCourses.mockResolvedValue([]);
      mockGetUserFavoriteCourseIds.mockResolvedValue([]);

      render(<Courses />);

      await waitFor(() => {
        expect(screen.getByText('No courses found matching your criteria.')).toBeInTheDocument();
      });
    });

    it('handles data loading error', async () => {
      mockGetAllCourses.mockRejectedValue(new Error('Failed to load'));

      render(<Courses />);

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          'Error fetching courses:',
          expect.any(Error)
        );
      });

      expect(screen.getByText('No courses found matching your criteria.')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      mockGetAllCourses.mockResolvedValue(mockCourses);
      mockGetRecommendedCourses.mockResolvedValue(mockRecommendedCourses);
      mockGetUserFavoriteCourseIds.mockResolvedValue(mockFavoriteIds);
    });

    it('filters courses by search query in title', async () => {
      render(<Courses />);

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search courses, languages, or topics...');
      fireEvent.change(searchInput, { target: { value: 'React' } });

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
        expect(screen.queryByText('Advanced Python')).not.toBeInTheDocument();
        expect(screen.queryByText('JavaScript Basics')).not.toBeInTheDocument();
      });
    });

    it('filters courses by search query in language', async () => {
      render(<Courses />);

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search courses, languages, or topics...');
      fireEvent.change(searchInput, { target: { value: 'Spanish' } });

      await waitFor(() => {
        expect(screen.getByText('Advanced Python')).toBeInTheDocument();
        expect(screen.queryByText('React Fundamentals')).not.toBeInTheDocument();
        expect(screen.queryByText('JavaScript Basics')).not.toBeInTheDocument();
      });
    });

    it('filters courses by search query in tags', async () => {
      render(<Courses />);

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search courses, languages, or topics...');
      fireEvent.change(searchInput, { target: { value: 'JavaScript' } });

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
        expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
        expect(screen.queryByText('Advanced Python')).not.toBeInTheDocument();
      });
    });

    it('shows empty state when no search results', async () => {
      render(<Courses />);

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search courses, languages, or topics...');
      fireEvent.change(searchInput, { target: { value: 'Nonexistent Course' } });

      await waitFor(() => {
        expect(screen.getByText('No courses found matching your criteria.')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      mockGetAllCourses.mockResolvedValue(mockCourses);
      mockGetRecommendedCourses.mockResolvedValue(mockRecommendedCourses);
      mockGetUserFavoriteCourseIds.mockResolvedValue(mockFavoriteIds);
    });

    it('only shows public and published courses', async () => {
      const mixedCourses = [
        ...mockCourses,
        {
          id: 'course-4',
          title: 'Private Course',
          level: 'Intermediate',
          language: 'English',
          image: '/private-course.jpg',
          duration: '15 hours',
          students: 100,
          rating: 4.7,
          reviews: 50,
          author: 'Private Author',
          description: 'This is a private course',
          tags: ['Private'],
          isRecommended: false,
          price: 'Free',
          isPublic: false, // Not public
          isPublished: true,
        },
        {
          id: 'course-5',
          title: 'Unpublished Course',
          level: 'Intermediate',
          language: 'English',
          image: '/unpublished-course.jpg',
          duration: '12 hours',
          students: 50,
          rating: 4.3,
          reviews: 20,
          author: 'Unpublished Author',
          description: 'This course is not published',
          tags: ['Unpublished'],
          isRecommended: false,
          price: 'Free',
          isPublic: true,
          isPublished: false, // Not published
        },
      ];

      mockGetAllCourses.mockResolvedValue(mixedCourses);

      render(<Courses />);

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
        expect(screen.getByText('Advanced Python')).toBeInTheDocument();
        expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
      });

      // Private and unpublished courses should not be visible
      expect(screen.queryByText('Private Course')).not.toBeInTheDocument();
      expect(screen.queryByText('Unpublished Course')).not.toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      mockGetAllCourses.mockResolvedValue(mockCourses);
      mockGetRecommendedCourses.mockResolvedValue(mockRecommendedCourses);
      mockGetUserFavoriteCourseIds.mockResolvedValue(mockFavoriteIds);
    });

    it('sorts courses by rating by default', async () => {
      render(<Courses />);

      await waitFor(() => {
        const courseTitles = screen.getAllByText(/React Fundamentals|Advanced Python|JavaScript Basics/);
        // React Fundamentals has highest rating (4.8), should be first
        expect(courseTitles[0]).toHaveTextContent('React Fundamentals');
      });
    });

    it('prioritizes recommended courses', async () => {
      render(<Courses />);

      await waitFor(() => {
        const courseTitles = screen.getAllByText(/React Fundamentals|Advanced Python|JavaScript Basics/);
        // Recommended courses should come first regardless of rating
        expect(courseTitles[0]).toHaveTextContent('React Fundamentals'); // Recommended
        expect(courseTitles[1]).toHaveTextContent('JavaScript Basics'); // Recommended
        expect(courseTitles[2]).toHaveTextContent('Advanced Python'); // Not recommended
      });
    });
  });

  describe('Favorite Functionality', () => {
    beforeEach(() => {
      mockGetAllCourses.mockResolvedValue(mockCourses);
      mockGetRecommendedCourses.mockResolvedValue(mockRecommendedCourses);
      mockGetUserFavoriteCourseIds.mockResolvedValue(mockFavoriteIds);
    });

    it('shows favorite status correctly', async () => {
      render(<Courses />);

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      // Course 1 should be favorited
      const favoriteButtons = screen.getAllByTestId('button');
      const favoriteButton = favoriteButtons.find(button => 
        button.innerHTML.includes('heart-icon')
      );
      expect(favoriteButton).toBeInTheDocument();
    });

    it('toggles favorite status when clicked', async () => {
      mockAddToFavorites.mockResolvedValue(undefined);

      render(<Courses />);

      await waitFor(() => {
        expect(screen.getByText('Advanced Python')).toBeInTheDocument();
      });

      // Find and click favorite button for Advanced Python (not currently favorited)
      const favoriteButtons = screen.getAllByTestId('button');
      const unfavoritedButton = favoriteButtons.find(button => 
        button.closest('[data-testid="card"]')?.textContent?.includes('Advanced Python') &&
        button.innerHTML.includes('heart-icon')
      );

      if (unfavoritedButton) {
        fireEvent.click(unfavoritedButton);
      }

      await waitFor(() => {
        expect(mockAddToFavorites).toHaveBeenCalledWith('course-2', 'user-123');
      });
    });

    it('removes from favorites when clicking favorited course', async () => {
      mockRemoveFromFavorites.mockResolvedValue(undefined);

      render(<Courses />);

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      // Find and click favorite button for React Fundamentals (currently favorited)
      const favoriteButtons = screen.getAllByTestId('button');
      const favoritedButton = favoriteButtons.find(button => 
        button.closest('[data-testid="card"]')?.textContent?.includes('React Fundamentals') &&
        button.innerHTML.includes('heart-icon')
      );

      if (favoritedButton) {
        fireEvent.click(favoritedButton);
      }

      await waitFor(() => {
        expect(mockRemoveFromFavorites).toHaveBeenCalledWith('course-1', 'user-123');
      });
    });

    it('handles favorite toggle error', async () => {
      mockAddToFavorites.mockRejectedValue(new Error('Favorite failed'));

      render(<Courses />);

      await waitFor(() => {
        expect(screen.getByText('Advanced Python')).toBeInTheDocument();
      });

      const favoriteButtons = screen.getAllByTestId('button');
      const unfavoritedButton = favoriteButtons.find(button => 
        button.closest('[data-testid="card"]')?.textContent?.includes('Advanced Python') &&
        button.innerHTML.includes('heart-icon')
      );

      if (unfavoritedButton) {
        fireEvent.click(unfavoritedButton);
      }

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          'Error toggling favorite:',
          expect.any(Error)
        );
      });
    });

  });

  describe('Course Card Display', () => {
    beforeEach(() => {
      mockGetAllCourses.mockResolvedValue(mockCourses);
      mockGetRecommendedCourses.mockResolvedValue(mockRecommendedCourses);
      mockGetUserFavoriteCourseIds.mockResolvedValue(mockFavoriteIds);
    });

    it('navigates to course detail page when clicked', async () => {
      render(<Courses />);

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      const courseLink = screen.getByText('React Fundamentals').closest('[data-testid="link"]');
      expect(courseLink).toHaveAttribute('href', '/course/course-1');
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no courses match filters', async () => {
      mockGetAllCourses.mockResolvedValue(mockCourses);
      mockGetRecommendedCourses.mockResolvedValue(mockRecommendedCourses);
      mockGetUserFavoriteCourseIds.mockResolvedValue(mockFavoriteIds);

      render(<Courses />);

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search courses, languages, or topics...');
      fireEvent.change(searchInput, { target: { value: 'Nonexistent Course' } });

      await waitFor(() => {
        expect(screen.getByText('No courses found matching your criteria.')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your filters or search terms.')).toBeInTheDocument();
      });
    });
  });

  describe('Header and Controls', () => {
    beforeEach(() => {
      mockGetAllCourses.mockResolvedValue(mockCourses);
      mockGetRecommendedCourses.mockResolvedValue(mockRecommendedCourses);
      mockGetUserFavoriteCourseIds.mockResolvedValue(mockFavoriteIds);
    });

    it('displays page header correctly', async () => {
      render(<Courses />);

      await waitFor(() => {
        expect(screen.getByText('3 courses found')).toBeInTheDocument();
        
      expect(screen.getByText('Explore Courses')).toBeInTheDocument();
      expect(screen.getByText('Discover language learning courses from our global community')).toBeInTheDocument();
      });
    });

    it('shows result count', async () => {
      render(<Courses />);

      await waitFor(() => {
        expect(screen.getByText('3 courses found')).toBeInTheDocument();
      });
    });

    it('updates result count when filtering', async () => {
      render(<Courses />);

      await waitFor(() => {
        expect(screen.getByText('3 courses found')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search courses, languages, or topics...');
      fireEvent.change(searchInput, { target: { value: 'React' } });

      await waitFor(() => {
        expect(screen.getByText('1 courses found')).toBeInTheDocument();
      });
    });
  });
});