// 동 단위 Mock 데이터
// code: 7자리 동 코드

export const MOCK_DONG_SQUARES = {
  '1114066': {
    dongCode: '1114066',
    name: '서교동',
    ownerName: '홍대 클럽 FF',
    imageUrl: 'https://picsum.photos/seed/hongdae/200/200',
    description: '홍대 최고의 클럽',
    message: '매주 금/토 라이브 공연\n입장료 20% 할인 이벤트',
    link: 'https://example.com',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  '1123064': {
    dongCode: '1123064',
    name: '역삼1동',
    ownerName: '카페 드롭탑',
    imageUrl: 'https://picsum.photos/seed/gangnam/200/200',
    description: '강남 1위 프리미엄 카페',
    message: '강남점 오픈 이벤트!\n아메리카노 1+1 쿠폰 증정',
    link: 'https://example.com',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  '1104065': {
    dongCode: '1104065',
    name: '성수1가1동',
    ownerName: '대림창고 갤러리',
    imageUrl: 'https://picsum.photos/seed/seongsu/200/200',
    description: '성수동 대표 복합문화공간',
    message: '5월 아트페어 진행 중\n무료 입장 가능!',
    link: 'https://example.com',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  '1124071': {
    dongCode: '1124071',
    name: '잠실본동',
    ownerName: '롯데월드',
    imageUrl: 'https://picsum.photos/seed/jamsil/200/200',
    description: '꿈과 마법의 나라',
    message: '2026 여름 시즌 대개막\n신규 어트랙션 4종 오픈!',
    link: 'https://example.com',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  '1103065': {
    dongCode: '1103065',
    name: '이태원1동',
    ownerName: 'Mixer Seoul',
    imageUrl: 'https://picsum.photos/seed/itaewon/200/200',
    description: '이태원 루프탑 바',
    message: '금/토 해피아워 6-9PM\n칵테일 전 메뉴 30% OFF',
    link: 'https://example.com',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

// 프리미엄 스팟 동 코드 목록
export const PREMIUM_DONG_CODES = new Set([
  '1114066', // 서교동 (홍대)
  '1114068', // 합정동
  '1114069', // 망원1동
  '1123064', // 역삼1동 (강남역)
  '1123077', // 압구정동
  '1123078', // 청담동
  '1103065', // 이태원1동
  '1103074', // 한남동
  '1104065', // 성수1가1동
  '1101060', // 가회동 (북촌)
  '1101061', // 종로1·2·3·4가동 (인사동)
  '1113075', // 신촌동
  '1105053', // 화양동 (건대입구)
  '1124071', // 잠실본동
]);

// 프리미엄 스팟 표시 이름
export const PREMIUM_DONG_LABELS = {
  '1114066': '홍대',
  '1114068': '합정',
  '1114069': '망원',
  '1123064': '강남역',
  '1123077': '압구정',
  '1123078': '청담',
  '1103065': '이태원',
  '1103074': '한남',
  '1104065': '성수',
  '1101060': '북촌',
  '1101061': '인사동',
  '1113075': '신촌',
  '1105053': '건대',
  '1124071': '잠실',
};
