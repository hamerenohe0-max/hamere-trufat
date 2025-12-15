export type DrawerRoute = 'MainDrawer';

export type TabRoute =
  | 'DashboardTab'
  | 'AssignmentsTab'
  | 'ContentTab'
  | 'ProfileTab';

export type StackRoute =
  | 'Onboarding'
  | 'Auth'
  | 'Login'
  | 'Register'
  | 'Otp'
  | 'ForgotPassword'
  | 'MainTabs'
  | 'AssignmentDetails'
  | 'SubmissionForm'
  | 'NewsDetails'
  | 'EventDetails'
  | 'FeastDetails'
  | 'Settings';

export interface RouteConfig {
  name: StackRoute | TabRoute | DrawerRoute;
  path: string;
  children?: RouteConfig[];
  guards?: Array<'auth' | 'role:admin' | 'role:publisher'>;
  options?: Record<string, unknown>;
}

export const navigationStructure: RouteConfig[] = [
  {
    name: 'Onboarding',
    path: '/onboarding',
  },
  {
    name: 'Auth',
    path: '/auth',
    children: [
      { name: 'Login', path: '/auth/login' },
      { name: 'Register', path: '/auth/register' },
      { name: 'Otp', path: '/auth/otp' },
      { name: 'ForgotPassword', path: '/auth/forgot-password' },
    ],
  },
  {
    name: 'MainTabs',
    path: '/',
    children: [
      {
        name: 'DashboardTab',
        path: '/dashboard',
      },
      {
        name: 'AssignmentsTab',
        path: '/assignments',
        children: [
          { name: 'AssignmentDetails', path: '/assignments/[id]' },
          { name: 'SubmissionForm', path: '/assignments/[id]/submit' },
        ],
      },
      {
        name: 'ContentTab',
        path: '/content',
        children: [
          { name: 'NewsDetails', path: '/content/news/[id]' },
          { name: 'EventDetails', path: '/content/events/[id]' },
          { name: 'FeastDetails', path: '/content/feasts/[id]' },
        ],
      },
      {
        name: 'ProfileTab',
        path: '/profile',
        children: [{ name: 'Settings', path: '/profile/settings' }],
      },
    ],
  },
];


