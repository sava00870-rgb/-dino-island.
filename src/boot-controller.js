export function createBootController({ initialize = () => true, onState = () => {} } = {}) {
  let state = 'loading';
  let error = null;
  let loopStarted = false;
  const emit = next => { state = next; onState(state, error); };

  function fail(reason) {
    error = reason instanceof Error ? reason : new Error(String(reason || 'Unknown startup error'));
    loopStarted = false;
    emit('error');
  }

  return {
    get state() { return state; },
    get error() { return error; },
    initialize() {
      emit('loading');
      try {
        const result = initialize();
        if (result === false || result == null) throw new Error('Scene initialization returned no result');
        error = null;
        emit('ready');
        return result;
      } catch (reason) {
        fail(reason);
        return false;
      }
    },
    fail,
    start() {
      if (state !== 'ready' || loopStarted) return false;
      loopStarted = true;
      emit('playing');
      return true;
    },
    stop() {
      if (!loopStarted) return false;
      loopStarted = false;
      emit('ready');
      return true;
    }
  };
}
