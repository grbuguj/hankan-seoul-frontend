import { createContext, useContext, useState, useEffect } from 'react';
import { fetchDongSquares } from '../api/index';
import { MOCK_DONG_SQUARES } from '../data/mockData';

const SquaresContext = createContext(null);

export function SquaresProvider({ children }) {
  const [dongSquares, setDongSquares] = useState(MOCK_DONG_SQUARES);

  useEffect(() => {
    fetchDongSquares().then(data => {
      if (data && Object.keys(data).length > 0) {
        setDongSquares(data);
      }
    });
  }, []);

  function purchaseDong() {
    // 신청은 PurchaseModal에서 직접 API 호출
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
