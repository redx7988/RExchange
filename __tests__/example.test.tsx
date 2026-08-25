import { render, screen } from '@testing-library/react';
import LandingPage from '../src/app/page';

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: () => null,
    };
  },
  usePathname() {
    return '';
  }
}));

jest.mock('@/context/AppContext', () => ({
  useApp: () => ({
    currentUser: null,
    allProjects: [],
    allUsers: [],
    isAuthenticated: false,
    loginWithGoogle: jest.fn(),
    authLoading: false
  })
}));

jest.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
  storage: {}
}));

describe('LandingPage', () => {
  it('renders without crashing', () => {
    render(<LandingPage />);
    expect(screen.getAllByText(/SkillSync/i).length).toBeGreaterThan(0);
  });
});
