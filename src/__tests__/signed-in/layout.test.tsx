import React from 'react';
import { render, screen } from '@testing-library/react';
import RootLayout, { metadata } from '@/app/(signed-in)/layout'; // Import metadata directly

// Mock the components and hooks
jest.mock('@/components/app-sidebar', () => {
  return function MockAppSidebar() {
    return <div data-testid="app-sidebar">Mock App Sidebar</div>;
  };
});

jest.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
  SidebarTrigger: () => (
    <button data-testid="sidebar-trigger">Toggle Sidebar</button>
  ),
}));

jest.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="signed-in">{children}</div>
  ),
  UserButton: () => (
    <div data-testid="user-button">Mock User Button</div>
  ),
}));

// Remove the problematic next and next/head mocks as they're not needed
// The metadata is exported separately and can be imported directly

describe('RootLayout', () => {
  const mockChildren = <div data-testid="test-children">Test Content</div>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    
    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
  });

  it('renders all main layout components', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);

    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('user-button')).toBeInTheDocument();
    expect(screen.getByTestId('test-children')).toBeInTheDocument();
  });

  it('wraps content in SidebarProvider', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);

    const sidebarProvider = screen.getByTestId('sidebar-provider');
    expect(sidebarProvider).toBeInTheDocument();
    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('test-children')).toBeInTheDocument();
  });

  it('has correct header structure', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('border-b', 'border-border', 'px-6', 'py-4', 'bg-background/95');
    
    // Check header content structure
    expect(header).toContainElement(screen.getByTestId('sidebar-trigger'));
    expect(header).toContainElement(screen.getByTestId('user-button'));
  });

  it('renders UserButton within SignedIn component', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);

    const signedIn = screen.getByTestId('signed-in');
    const userButton = screen.getByTestId('user-button');
    
    expect(signedIn).toContainElement(userButton);
  });

  it('renders children in main content area', () => {
    const customChildren = <div data-testid="custom-content">Custom Child Content</div>;
    
    render(<RootLayout>{customChildren}</RootLayout>);

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom Child Content')).toBeInTheDocument();
  });

  it('applies correct CSS classes to layout elements', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);

    const mainContainer = screen.getByTestId('test-children').closest('div.w-full');
    expect(mainContainer).toHaveClass('w-full', 'h-[100vh]', 'overflow-y-auto');

    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('flex-1');
  });

  it('has sticky header with correct z-index', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky', 'top-0', 'z-50');
  });

  describe('metadata', () => {
  it('has correct metadata title', () => {
    expect(metadata.title).toBe('OSLearn');
  });

  it('has correct metadata description', () => {
    expect(metadata.description).toBe('The New Way To Master Any Language');
  });

  it('has correct favicon', () => {
    // Simple stringification check - if the icons configuration contains our expected path
    const iconsString = JSON.stringify(metadata.icons);
    expect(iconsString).toContain('/globe.svg');
  });
});

  describe('accessibility', () => {
    it('has proper banner role on header', () => {
      render(<RootLayout>{mockChildren}</RootLayout>);
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('has proper main role on main content', () => {
      render(<RootLayout>{mockChildren}</RootLayout>);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('sidebar trigger is a button for accessibility', () => {
      render(<RootLayout>{mockChildren}</RootLayout>);
      
      const trigger = screen.getByTestId('sidebar-trigger');
      expect(trigger.tagName).toBe('BUTTON');
    });
  });

  describe('responsive design', () => {
    it('header has responsive backdrop filter classes', () => {
      render(<RootLayout>{mockChildren}</RootLayout>);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('backdrop-blur', 'supports-[backdrop-filter]:bg-background/60');
    });
  });
});