// __tests__/app/notifications/page.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationsPage from '@/app/(signed-in)/notifications/page';
import { useUser } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';

// Mock dependencies
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(),
}));

jest.mock('@/utils/db/forum', () => ({
  getUserNotifications: jest.fn(),
  markNotificationAsRead: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent<HTMLDivElement>) => void }) => (
    <div
      className={className}
      onClick={e => {
        if (onClick) onClick(e);
        // Simulate navigation if window.location.href is set in onClick
        // (the real component sets window.location.href in the handler)
      }}
      role="button"
      tabIndex={0}
      data-testid="card-mock"
    >
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => <h3 className={className}>{children}</h3>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, variant }: { children: React.ReactNode; onClick?: React.MouseEventHandler<HTMLButtonElement>; disabled?: boolean; className?: string; variant?: string }) => {
    // Always set disabled attribute if disabled is true
    return (
      <button
        onClick={onClick}
        className={className}
        data-variant={variant}
        data-testid={
          className?.includes('bg-blue-600') ? 'mark-all-read-button' :
          variant === 'outline' ? 'load-more-button' : undefined
        }
        {...(disabled ? { disabled: true } : {})}
      >
        {children}
      </button>
    );
  },
}));

jest.mock('lucide-react', () => ({
  Check: () => <span data-testid="check-icon">Check</span>,
  Bell: () => <span data-testid="bell-icon">Bell</span>,
}));

jest.mock('next/link', () => ({ children }: { children: React.ReactNode }) => children);

const originalLocation = window.location;
beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).location;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).location = { href: '' };
});

afterAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).location = originalLocation;
});

// Types
const mockNotifications = [
  {
    id: 'notif-1',
    user_id: 'user-1',
    type: 'reply',
    message: 'User1 replied to your post',
    is_read: false,
    created_at: '2023-01-01T10:00:00Z',
    metadata: {
      post_id: 'post-1',
      reply_excerpt: 'This is a great post, thanks for sharing',
    },
  },
  {
    id: 'notif-2',
    user_id: 'user-1',
    type: 'like',
    message: 'User2 liked your comment',
    is_read: true,
    created_at: '2023-01-01T09:00:00Z',
    metadata: {
      post_id: 'post-2',
    },
  },
  {
    id: 'notif-3',
    user_id: 'user-1',
    type: 'mention',
    message: 'User3 mentioned you in a comment',
    is_read: false,
    created_at: '2023-01-01T08:00:00Z',
    metadata: {
      post_id: 'post-3',
      reply_excerpt: 'Hey @user-1, what do you think about this?',
    },
  },
];

// Mock implementations
import * as forumDb from '@/utils/db/forum';
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockFormatDistanceToNow = formatDistanceToNow as jest.MockedFunction<typeof formatDistanceToNow>;
const { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } = forumDb;

describe('NotificationsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window as unknown as { location: { href: string } }).location.href = '';
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      user: { id: 'user-1' },
    } as ReturnType<typeof useUser>);
    mockFormatDistanceToNow.mockReturnValue('2 hours ago');
    (getUserNotifications as jest.Mock).mockResolvedValue({
      notifications: mockNotifications,
      pagination: { currentPage: 1, hasMore: false },
    } as { notifications: typeof mockNotifications; pagination: { currentPage: number; hasMore: boolean } });
    (markNotificationAsRead as jest.Mock).mockResolvedValue({} as Record<string, never>);
    (markAllNotificationsAsRead as jest.Mock).mockResolvedValue({} as Record<string, never>);
  });

  it('renders loading state initially', async () => {
    // Delay the response to test loading state
    (getUserNotifications as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        notifications: mockNotifications,
        pagination: { currentPage: 1, hasMore: false }
      }), 100))
    );

    render(<NotificationsPage />);
    
    // Should show loading spinner initially
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('renders empty state when no notifications', async () => {
    (getUserNotifications as jest.Mock).mockResolvedValue({
      notifications: [],
      pagination: { currentPage: 1, hasMore: false },
    });

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
      expect(screen.getByText(/when you get notifications, they'll appear here/i)).toBeInTheDocument();
      expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    });
  });

  it('renders notifications list correctly', async () => {
    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    // Check that all notifications are rendered
    expect(screen.getByText('User1 replied to your post')).toBeInTheDocument();
    expect(screen.getByText('User2 liked your comment')).toBeInTheDocument();
    expect(screen.getByText('User3 mentioned you in a comment')).toBeInTheDocument();
    
    // Check reply excerpts
    expect(screen.getByText(/this is a great post, thanks for sharing/i)).toBeInTheDocument();
    expect(screen.getByText(/hey @user-1, what do you think about this\?/i)).toBeInTheDocument();
    
    // Check timestamps
    expect(screen.getAllByText('2 hours ago')).toHaveLength(3);
  });

  it('shows "Mark all as read" button when there are unread notifications', async () => {
    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mark all as read')).toBeInTheDocument();
    });
  });

  it('hides "Mark all as read" button when all notifications are read', async () => {
    const allReadNotifications = mockNotifications.map(notif => ({
      ...notif,
      is_read: true,
    }));

    (getUserNotifications as jest.Mock).mockResolvedValue({
      notifications: allReadNotifications,
      pagination: { currentPage: 1, hasMore: false },
    });

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    expect(screen.queryByText('Mark all as read')).not.toBeInTheDocument();
  });


  it('marks all notifications as read when button is clicked', async () => {
    const user = userEvent.setup();
    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mark all as read')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Mark all as read'));

    expect(markAllNotificationsAsRead).toHaveBeenCalledWith('user-1');
  });

  it('shows load more button when there are more notifications', async () => {
    (getUserNotifications as jest.Mock).mockResolvedValue({
      notifications: mockNotifications,
      pagination: {
        currentPage: 1,
        hasMore: true,
      },
    });

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Load More')).toBeInTheDocument();
    });
  });

  it('loads more notifications when load more button is clicked', async () => {
    const user = userEvent.setup();
    
    (getUserNotifications as jest.Mock)
      .mockResolvedValueOnce({
        notifications: mockNotifications.slice(0, 2),
        pagination: { currentPage: 1, hasMore: true },
      })
      .mockResolvedValueOnce({
        notifications: mockNotifications.slice(2),
        pagination: { currentPage: 2, hasMore: false },
      });

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Load More')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Load More'));

    expect(getUserNotifications).toHaveBeenCalledWith('user-1', 20, 2);
  });

  it('handles notification click without post_id metadata gracefully', async () => {
    const user = userEvent.setup();
    const notificationWithoutPostId = {
      ...mockNotifications[0],
      metadata: { reply_excerpt: 'Test excerpt' },
    };
    (getUserNotifications as jest.Mock).mockResolvedValue({
      notifications: [notificationWithoutPostId],
      pagination: { currentPage: 1, hasMore: false },
    });
    render(<NotificationsPage />);
    const notificationCard = await screen.findByText('User1 replied to your post');
    await user.click(notificationCard.closest('.cursor-pointer')!);
    await waitFor(() => {
      expect(markNotificationAsRead).toHaveBeenCalledWith('notif-1');
      // jsdom default for empty href is 'http://localhost/'
      expect(window.location.href).toBe('http://localhost/');
    });
  });

  it('handles errors when loading notifications', async () => {
    console.error = jest.fn(); // Suppress console error output
    (getUserNotifications as jest.Mock).mockRejectedValue(new Error('Failed to load'));

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error loading notifications:', expect.any(Error));
    });
  });

  it('handles errors when marking notification as read', async () => {
    const user = userEvent.setup();
    console.error = jest.fn();
    (markNotificationAsRead as jest.Mock).mockRejectedValue(new Error('Failed to mark as read'));

    render(<NotificationsPage />);

    const notificationCard = await screen.findByText('User1 replied to your post');
    await user.click(notificationCard.closest('.cursor-pointer')!);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error marking notification as read:', expect.any(Error));
    });
  });

  it('handles errors when marking all notifications as read', async () => {
    const user = userEvent.setup();
    console.error = jest.fn();
    
    (markAllNotificationsAsRead as jest.Mock).mockRejectedValue(new Error('Failed to mark all as read'));

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mark all as read')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Mark all as read'));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error marking all notifications as read:', expect.any(Error));
    });
  });

  it('does not load notifications when user is not available', async () => {
    mockUseUser.mockReturnValue({
      isSignedIn: false,
      user: null,
    } as unknown as ReturnType<typeof useUser>);

    render(<NotificationsPage />);

    // Should not call getUserNotifications when user is null
    expect(getUserNotifications).not.toHaveBeenCalled();
  });

  it('formats timestamps correctly', async () => {
    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    // Verify that formatDistanceToNow was called for each notification
    expect(mockFormatDistanceToNow).toHaveBeenCalledTimes(3);
    expect(mockFormatDistanceToNow).toHaveBeenCalledWith(new Date('2023-01-01T10:00:00Z'), { addSuffix: true });
  });

});