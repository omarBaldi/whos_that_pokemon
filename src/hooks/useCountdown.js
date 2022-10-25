import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * @param {number} initialValue
 * @param {number} timerSeconds
 * @param {Array} deps
 */
export const useCountdown = ({ initialValue = 0, timerSeconds = 1, deps }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialValue);
  const timerInterval = useRef();

  const stopCountdown = useCallback(
    () => clearInterval(timerInterval.current),
    []
  );

  useEffect(() => {
    const decreaseSecondsAmount = () => {
      setSecondsLeft((prevSeconds) => prevSeconds - 1);
    };

    timerInterval.current = setInterval(
      decreaseSecondsAmount,
      timerSeconds * 1000
    );

    return () => {
      stopCountdown();
      setSecondsLeft(initialValue);
    };
  }, [initialValue, timerSeconds, deps, stopCountdown]);

  return {
    secondsLeft,
    stopCountdown,
  };
};
