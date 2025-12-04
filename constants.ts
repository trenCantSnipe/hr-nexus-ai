import { Candidate, Employee, Interview } from './types';

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
    email: 'david.lee@example.com'
  },
  {
    id: 'c2',
    name: 'Eva Green',
    role: 'Marketing Specialist',
    status: 'Applied',
    experience: '3 years SEO, Content Marketing',
    email: 'eva.green@example.com'
  },
  {
    id: 'c3',
    name: 'Frank White',
    role: 'Data Scientist',
    status: 'Screening',
    experience: 'PhD in Statistics, 2 years industry',
    email: 'frank.white@example.com'
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
