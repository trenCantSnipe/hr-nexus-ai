
import { Candidate, Employee, Interview, Task, DailyReport } from './types';

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    role: 'Senior Frontend Engineer',
    department: 'Engineering',
    joinDate: '2021-03-15',
    performanceLog: [
      'Successfully led the migration to React 18.',
      'Mentored two junior developers.',
      'Missed deadline for the Q3 internal dashboard project.'
    ]
  },
  {
    id: '2',
    name: 'Bob Smith',
    role: 'Product Manager',
    department: 'Product',
    joinDate: '2022-06-01',
    performanceLog: [
      'Launched the new mobile app feature set on time.',
      'Received high praise from client stakeholders.',
      'Needs to improve documentation details.'
    ]
  },
  {
    id: '3',
    name: 'Charlie Davis',
    role: 'UX Designer',
    department: 'Design',
    joinDate: '2023-01-10',
    performanceLog: [
      'Redesigned the entire marketing site.',
      'Consistent output and high quality assets.',
      'Collaborates well with engineering team.'
    ]
  }
];

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    name: 'David Lee',
    role: 'Backend Engineer',
    status: 'Interview',
    experience: '5 years Node.js, Python',
    email: 'david.lee@example.com',
    appliedDate: '2023-10-20',
    notes: 'Strong technical skills in system design. Cultural fit seems promising. Needs to clarify availability for start date.'
  },
  {
    id: 'c2',
    name: 'Eva Green',
    role: 'Marketing Specialist',
    status: 'Applied',
    experience: '3 years SEO, Content Marketing',
    email: 'eva.green@example.com',
    appliedDate: '2023-10-24',
    notes: 'Portfolio looks impressive. Good experience with B2B SaaS.'
  },
  {
    id: 'c3',
    name: 'Frank White',
    role: 'Data Scientist',
    status: 'Screening',
    experience: 'PhD in Statistics, 2 years industry',
    email: 'frank.white@example.com',
    appliedDate: '2023-10-15',
    notes: ''
  }
];

export const MOCK_INTERVIEWS: Interview[] = [
  {
    id: 'i1',
    candidateId: 'c1',
    date: '2023-10-25',
    time: '14:00',
    interviewer: 'Alice Johnson',
    type: 'Technical'
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Complete Component Migration',
    description: 'Finish migrating the sidebar to use Tailwind CSS completely.',
    period: 'Day',
    status: 'In Progress'
  },
  {
    id: 't2',
    title: 'Code Review for PR #342',
    description: 'Review the new authentication flow logic.',
    period: 'Day',
    status: 'Completed'
  },
  {
    id: 't3',
    title: 'Update Documentation',
    description: 'Ensure the API docs reflect the latest v2 changes.',
    period: 'Week',
    status: 'Not Started'
  },
  {
    id: 't4',
    title: 'Performance Optimization',
    description: 'Reduce bundle size by 15%.',
    period: 'Month',
    status: 'Not Started'
  }
];

export const MOCK_REPORTS: DailyReport[] = [
  {
    id: 'r1',
    employeeName: 'Alice Johnson',
    date: '2023-10-26',
    content: 'Completed the migration of the auth module. Started working on the new dashboard widgets. Faced some issues with the legacy API but resolved them.',
    targetsMet: true,
    timestamp: new Date('2023-10-26T17:30:00')
  },
  {
    id: 'r2',
    employeeName: 'Bob Smith',
    date: '2023-10-26',
    content: 'Meeting with stakeholders regarding Q4 roadmap. Updated JIRA tickets. Could not finish the PRD review due to time constraints.',
    targetsMet: false,
    timestamp: new Date('2023-10-26T16:45:00')
  }
];