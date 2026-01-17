type LogArgs = Parameters<typeof console.log>;

const isDebugEnabled =
  import.meta.env?.VITE_DEBUG_LOGS === 'true' ||
  import.meta.env?.MODE === 'development';

const emit = (fn: (...args: LogArgs) => void, args: LogArgs) => {
  fn(...args);
};

export const logger = {
  debug: (...args: LogArgs) => {
    if (isDebugEnabled) {
      emit(console.debug ?? console.log, args);
    }
  },
  info: (...args: LogArgs) => {
    if (isDebugEnabled) {
      emit(console.log, args);
    }
  },
  warn: (...args: LogArgs) => {
    if (isDebugEnabled) {
      emit(console.warn, args);
    }
  },
  error: (...args: LogArgs) => {
    emit(console.error, args);
  }
};
