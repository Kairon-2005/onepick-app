/**
 * 候选人配置 - 应援色版本
 * 编号仅用于系统内部，不对用户显示
 */
export interface Candidate {
  id: string;
  name: string;
  avatar?: string;
  colors: {
    primary: string;
    secondary?: string;
    tertiary?: string;
    gradient: string;
  };
}

export const CANDIDATES: Candidate[] = [
  { 
    id: '1', 
    name: '张桂源',
    avatar: '/avatars/1.jpg',
    colors: {
      primary: '#F9E511',
      secondary: '#FFFFF9',
      gradient: 'linear-gradient(135deg, #FFFFF9 15%, #F9E511 85%)'
    }
  },
  { 
    id: '2', 
    name: '张函瑞',
    avatar: '/avatars/2.jpg',
    colors: {
      primary: '#779649',
      secondary: '#8AAEA2',
      gradient: 'linear-gradient(135deg, #779649 0%, #8AAEA2 100%)'
    }
  },
  { 
    id: '3', 
    name: '王橹杰',
    avatar: '/avatars/3.jpg',
    colors: {
      primary: '#4ab7cc',
      secondary: '#76d2e7',
      tertiary: '#a4d2f6',
      gradient: 'linear-gradient(135deg, #4ab7cc 0%, #76d2e7 50%, #a4d2f6 100%)'
    }
  },
  { 
    id: '4', 
    name: '左奇函',
    avatar: '/avatars/4.jpg',
    colors: {
      primary: '#10319f',
      secondary: '#319fff',
      gradient: 'linear-gradient(135deg, #10319f 0%, #319fff 100%)'
    }
  },
  { 
    id: '5', 
    name: '陈奕恒',
    avatar: '/avatars/5.jpg',
    colors: {
      primary: '#C1A1CA',
      secondary: '#FBEEDD',
      gradient: 'linear-gradient(135deg, #C1A1CA 0%, #FBEEDD 100%)'
    }
  },
  { 
    id: '6', 
    name: '杨博文',
    avatar: '/avatars/6.jpg',
    colors: {
      primary: '#F4A9AA',
      secondary: '#F6F9E4',
      gradient: 'linear-gradient(135deg, #F4A9AA 0%, #F6F9E4 100%)'
    }
  },
  { 
    id: '7', 
    name: '陈思罕',
    avatar: '/avatars/7.jpg',
    colors: {
      primary: '#AD9C84',
      secondary: '#4CE8CC',
      tertiary: '#EAFEF0',
      gradient: 'linear-gradient(135deg, #AD9C84 0%, #4CE8CC 50%, #EAFEF0 100%)'
    }
  },
  { 
    id: '8', 
    name: '陈浚铭',
    avatar: '/avatars/8.jpg',
    colors: {
      primary: '#E60012',
      gradient: 'linear-gradient(135deg, #E60012 0%, #FF4444 100%)'
    }
  },
];

export function getCandidateById(id: string): Candidate | undefined {
  return CANDIDATES.find(c => c.id === id);
}

export function isValidCandidateId(id: string): boolean {
  return CANDIDATES.some(c => c.id === id);
}
