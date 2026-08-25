import { render, screen } from '@testing-library/react';
import Navbar from '../src/components/Navbar';

jest.mock('next/navigation', () => ({
  useRouter() { return { prefetch: () => null, push: () => null }; },
  usePathname() { return ''; }
}));

jest.mock('@/context/AppContext', () => ({
  useApp: () => ({
    currentUser: { id: 'test-user', statusText: 'Available' },
    allProjects: [],
    allUsers: [],
    isAuthenticated: true,
    loginWithGoogle: jest.fn(),
    authLoading: false,
    theme: 'dark',
    highContrast: false,
    fontSize: 'normal',
    requests: []
  })
}));

describe('Navbar', () => {
  it('renders logo text', () => {
    render(<Navbar />);
    expect(screen.getByText(/SkillSync/i)).toBeInTheDocument();
  });
});
