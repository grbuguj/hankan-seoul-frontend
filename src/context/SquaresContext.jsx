import { createContext, useContext, useState } from 'react';
import { MOCK_DONG_SQUARES } from '../data/mockData';

const SquaresContext = createContext(null);

export function SquaresProvider({ children }) {
  const [dongSquares, setDongSquares] = useState(MOCK_DONG_SQUARES);

  function purchaseDong(dongCode, data) {
    // 신청만 접수 - 지도에는 반영 안 함
    // 관리자 confirmed 후에만 지도에 표시됨
  }

  return (
    <SquaresContext.Provider value={{ dongSquares, purchaseDong }}>
      {children}
    </SquaresContext.Provider>
  );
}

export function useSquares() {
  return useContext(SquaresContext);
}
