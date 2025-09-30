// __tests__/pages/discussion/[id].test.tsx
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiscussionPage from '@/app/(signed-in)/forums/[id]/page';
import { useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/toast';

// Mock all external dependencies
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(),
}));

jest.mock('@/components/ui/toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/utils/db/forum', () => ({
  getPost: jest.fn(),
  getPostReplies: jest.fn(),
  createReply: jest.fn(),
  likePost: jest.fn(),
  unlikePost: jest.fn(),
  likeReply: jest.fn(),
  unlikeReply: jest.fn(),
  getUserPostLikes: jest.fn(),
  getUserReplyLikes: jest.fn(),
}));

jest.mock('@/utils/moderation', () => ({
  checkProfanity: jest.fn(),
}));

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => <h3 className={className}>{children}</h3>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, className, variant, size }: React.PropsWithChildren<{
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    variant?: string;
    size?: string;
  }>) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={className}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ placeholder, rows, value, onChange, required, ref }: {
    placeholder?: string;
    rows?: number;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    required?: boolean;
    ref?: React.Ref<HTMLTextAreaElement>;
  }) => (
    <textarea
      placeholder={placeholder}
      rows={rows}
      value={value}
      onChange={onChange}
      required={required}
      ref={ref}
      data-testid="reply-textarea"
    />
  ),
}));

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => <div className={className}>{children}</div>,
  AvatarFallback: ({ children }: React.PropsWithChildren<object>) => <div>{children}</div>,
  // eslint-disable-next-line @next/next/no-img-element
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => <img src={src} alt={alt} />,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: React.PropsWithChildren<{ variant?: string; className?: string }>) => (
    <span data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  MessageSquare: () => 'MessageSquare',
  Heart: () => 'Heart',
  Reply: () => 'Reply',
  Share2: () => 'Share2',
  Bookmark: () => 'Bookmark',
  ChevronRight: () => 'ChevronRight',
  Send: () => 'Send',
  Calendar: () => 'Calendar',
  Tag: () => 'Tag',
  Loader2: () => 'Loader2',
}));

// Mock Next.js Link using a function declaration to avoid temporal dead zone
jest.mock('next/link', () => {
  return function Link({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Types for mock data
const mockPost = {
  id: 'post-1',
  title: 'Test Discussion Post',
  content: 'This is a test post content.\nIt has multiple lines.',
  author_id: 'user-1',
  category: 'javascript',
  language: 'JavaScript',
  like_count: 5,
  created_at: '2023-01-01T00:00:00Z',
  tags: ['react', 'nextjs'],
  author: {
    id: 'user-1',
    name: 'Test User',
    profile_url: '/test-user.jpg',
  },
};

const mockReplies = [
  {
    id: 'reply-1',
    post_id: 'post-1',
    author_id: 'user-2',
    content: 'This is a test reply',
    like_count: 2,
    created_at: '2023-01-01T01:00:00Z',
    author: {
      id: 'user-2',
      name: 'Reply User',
      profile_url: '/reply-user.jpg',
    },
  },
  {
    id: 'reply-2',
    post_id: 'post-1',
    author_id: 'user-1',
    content: 'This is a reply from the post author',
    like_count: 1,
    created_at: '2023-01-01T02:00:00Z',
    author: {
      id: 'user-1',
      name: 'Test User',
      profile_url: '/test-user.jpg',
    },
  },
];

// Mock implementations
const mockUseUser: jest.MockedFunction<typeof useUser> = useUser as jest.MockedFunction<typeof useUser>;
const mockUseParams: jest.MockedFunction<typeof useParams> = useParams as jest.MockedFunction<typeof useParams>;
const mockUseToast: jest.MockedFunction<typeof useToast> = useToast as jest.MockedFunction<typeof useToast>;
const mockFormatDistanceToNow: jest.MockedFunction<typeof formatDistanceToNow> = formatDistanceToNow as jest.MockedFunction<typeof formatDistanceToNow>;

import {
  getPost,
  getPostReplies,
  createReply,
  likePost,
  unlikePost,
  likeReply,
  unlikeReply,
  getUserPostLikes,
  getUserReplyLikes,
} from '@/utils/db/forum';

import { checkProfanity } from '@/utils/moderation';

describe('DiscussionPage', () => {
  const mockToast = jest.fn();
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Default mocks
    mockUseParams.mockReturnValue({ id: 'post-1' });
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      user: {
        id: 'user-1',
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        imageUrl: '/test-user.jpg',
      },
    } as unknown as ReturnType<typeof useUser>);
    
    mockUseToast.mockReturnValue(mockToast);
    mockFormatDistanceToNow.mockReturnValue('2 days ago');
    
    // Mock forum functions
    (getPost as jest.Mock).mockResolvedValue(mockPost);
    (getPostReplies as jest.Mock).mockResolvedValue({ replies: mockReplies });
    (getUserPostLikes as jest.Mock).mockResolvedValue(['post-1']);
    (getUserReplyLikes as jest.Mock).mockResolvedValue(['reply-1']);
    (createReply as jest.Mock).mockResolvedValue({ id: 'reply-3' });
    (checkProfanity as jest.Mock).mockResolvedValue({ contains_profanity: false });

    // Mock router
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });



  it('renders post not found when post does not exist', async () => {
    (getPost as jest.Mock).mockResolvedValue(null);

    render(<DiscussionPage />);

    await waitFor(() => {
      expect(screen.getByText('Discussion Not Found')).toBeInTheDocument();
      expect(screen.getByText(/the discussion you're looking for doesn't exist/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back to forums/i })).toBeInTheDocument();
    });
  });



  it('renders replies correctly', async () => {
    render(<DiscussionPage />);

    await waitFor(() => {
      expect(screen.getByText('2 Replies')).toBeInTheDocument();
    });

    expect(screen.getByText('This is a test reply')).toBeInTheDocument();
    expect(screen.getByText('This is a reply from the post author')).toBeInTheDocument();
    expect(screen.getByText('Reply User')).toBeInTheDocument();
    expect(screen.getAllByText('Test User')).toHaveLength(2); // Post author and reply author
  });

  it('shows admin badge for post author replies', async () => {
    render(<DiscussionPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  it('handles post like functionality', async () => {
    render(<DiscussionPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: (name) => name.includes('5') && name.includes('Likes'),
        })
      ).toBeInTheDocument();
    });

    const likeButton = screen.getByRole('button', {
      name: (name) => name.includes('5') && name.includes('Likes'),
    });
    await userEvent.click(likeButton);

    expect(unlikePost).toHaveBeenCalledWith('post-1', 'user-1');
  });

  it('handles reply like functionality', async () => {
    render(<DiscussionPage />);

    await waitFor(() => {
      expect(screen.getByText('2 Replies')).toBeInTheDocument();
    });

    // Find the reply card for 'This is a test reply'
    const replyCardDiv = screen.getByText('This is a test reply').closest('div');
    expect(replyCardDiv).not.toBeNull();
    const replyCard = replyCardDiv as HTMLElement;
    // Like button for like_count: 2
    const likeButton = within(replyCard).getByRole('button', { name: (name) => name.includes('2') });
    await userEvent.click(likeButton);

    expect(unlikeReply).toHaveBeenCalledWith('reply-1', 'user-1');
  });

  it('allows submitting a reply when user is logged in', async () => {
    render(<DiscussionPage />);

    await waitFor(() => {
      expect(screen.getByText('Leave a Reply')).toBeInTheDocument();
    });

    const textarea = screen.getByTestId('reply-textarea');
    const submitButton = screen.getByRole('button', { name: /post reply/i });

    await userEvent.type(textarea, 'This is a new reply');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(createReply).toHaveBeenCalledWith({
        post_id: 'post-1',
        author_id: 'user-1',
        content: 'This is a new reply',
        parent_reply_id: undefined,
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Reply Posted',
      description: 'Your reply has been successfully posted!',
      duration: 3000,
    });
  });

  it('shows sign in prompt when user is not logged in', async () => {
    mockUseUser.mockReturnValue({
      isSignedIn: false,
      user: null,
    } as unknown as ReturnType<typeof useUser>);

    (getUserPostLikes as jest.Mock).mockResolvedValue([]);
    (getUserReplyLikes as jest.Mock).mockResolvedValue([]);

    render(<DiscussionPage />);

    await waitFor(() => {
      expect(screen.getByText(/you need to be logged in to reply/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  it('handles replying to a specific user', async () => {
    render(<DiscussionPage />);

    await waitFor(() => {
      expect(screen.getByText('2 Replies')).toBeInTheDocument();
    });

    const replyButtons = screen.getAllByRole('button', { name: /reply/i });
    await userEvent.click(replyButtons[0]); // Click reply on first reply

    await waitFor(() => {
      expect(screen.getByText(/replying to @Reply User/i)).toBeInTheDocument();
    });

    const textarea = screen.getByTestId('reply-textarea');
    const submitButton = screen.getByRole('button', { name: /post reply/i });

    await userEvent.type(textarea, 'This is a reply to specific user');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(createReply).toHaveBeenCalledWith({
        post_id: 'post-1',
        author_id: 'user-1',
        content: '@Reply User This is a reply to specific user',
        parent_reply_id: 'reply-1',
      });
    });
  });

  it('shows profanity warning when content contains profanity', async () => {
    (checkProfanity as jest.Mock).mockResolvedValue({ contains_profanity: true });

    render(<DiscussionPage />);

    await waitFor(() => {
      expect(screen.getByText('Leave a Reply')).toBeInTheDocument();
    });

    const textarea = screen.getByTestId('reply-textarea');
    const submitButton = screen.getByRole('button', { name: /post reply/i });

    await userEvent.type(textarea, 'This contains bad words');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(checkProfanity).toHaveBeenCalledWith('This contains bad words');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Profanity Detected',
        description: 'Your reply contains inappropriate language. Please revise it before posting.',
        duration: 5000,
      });
    });

    // Should not call createReply when profanity is detected
    expect(createReply).not.toHaveBeenCalled();
  });

  it('handles reply submission error', async () => {
    (createReply as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<DiscussionPage />);

    await waitFor(() => {
      expect(screen.getByText('Leave a Reply')).toBeInTheDocument();
    });

    const textarea = screen.getByTestId('reply-textarea');
    const submitButton = screen.getByRole('button', { name: /post reply/i });

    await userEvent.type(textarea, 'This will cause an error');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        duration: 3000,
      });
    });
  });

  it('disables submit button when reply is empty', async () => {
    render(<DiscussionPage />);

    await waitFor(() => {
      expect(screen.getByText('Leave a Reply')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /post reply/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state during reply submission', async () => {
    (createReply as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<DiscussionPage />);

    await waitFor(() => {
      expect(screen.getByText('Leave a Reply')).toBeInTheDocument();
    });

    const textarea = screen.getByTestId('reply-textarea');
    const submitButton = screen.getByRole('button', { name: /post reply/i });

    await userEvent.type(textarea, 'This is a test reply');
    await userEvent.click(submitButton);

    await waitFor(() => {
      // 'Posting...' may be split, so use function matcher
      expect(screen.getByText((content) => content.includes('Posting'))).toBeInTheDocument();
    });
  });

  it('renders breadcrumb navigation correctly', async () => {
    render(<DiscussionPage />);

    await waitFor(() => {
      expect(screen.getByText('Forums')).toBeInTheDocument();
    });

    expect(screen.getByText('javascript')).toBeInTheDocument();
    // Multiple elements may have this text, so check at least one exists
    expect(screen.getAllByText('Test Discussion Post').length).toBeGreaterThan(0);
  });


  it('cancels reply to specific user', async () => {
    render(<DiscussionPage />);

    await waitFor(() => {
      expect(screen.getByText('2 Replies')).toBeInTheDocument();
    });

    const replyButtons = screen.getAllByRole('button', { name: /reply/i });
    await userEvent.click(replyButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/replying to @Reply User/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(screen.queryByText(/replying to @Reply User/i)).not.toBeInTheDocument();
  });

  it('handles like post when user has not liked it yet', async () => {
    (getUserPostLikes as jest.Mock).mockResolvedValue([]);

    render(<DiscussionPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: (name) => name.includes('5') && name.includes('Likes'),
        })
      ).toBeInTheDocument();
    });

    const likeButton = screen.getByRole('button', {
      name: (name) => name.includes('5') && name.includes('Likes'),
    });
    await userEvent.click(likeButton);

    expect(likePost).toHaveBeenCalledWith('post-1', 'user-1');
  });

  it('handles like reply when user has not liked it yet', async () => {
    (getUserReplyLikes as jest.Mock).mockResolvedValue([]);

    render(<DiscussionPage />);

    await waitFor(() => {
      expect(screen.getByText('2 Replies')).toBeInTheDocument();
    });

    // Find the reply card for 'This is a reply from the post author'
    const replyCardDiv = screen.getByText('This is a reply from the post author').closest('div');
    expect(replyCardDiv).not.toBeNull();
    const replyCard = replyCardDiv as HTMLElement;
    const likeButton = within(replyCard).getByRole('button', { name: /1/ });
    await userEvent.click(likeButton);

    expect(likeReply).toHaveBeenCalledWith('reply-2', 'user-1');
  });

  it('handles data fetching errors gracefully', async () => {
    (getPost as jest.Mock).mockRejectedValue(new Error('Failed to fetch post'));
    console.error = jest.fn(); // Suppress console.error in test output

    render(<DiscussionPage />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching discussion data:', expect.any(Error));
    });
  });
});