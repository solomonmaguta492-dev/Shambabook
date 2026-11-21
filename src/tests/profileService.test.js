import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { saveProfile, subscribeToProfile } from '../services/profileService.js';

/* Fake Firestore: doc just returns the path, so we can check it */
vi.mock('../services/firebase.js', () => ({ db: 'fake-db' }));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((db, ...segments) => ({ path: segments.join('/') })),
  onSnapshot: vi.fn(),
  setDoc: vi.fn(),
}));

const nakuru = { name: 'Nakuru', region: 'Nakuru County', latitude: -0.28, longitude: 36.07 };

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saveProfile merges the data into users/{uid}', () => {
    saveProfile('user1', { location: nakuru });

    expect(doc).toHaveBeenCalledWith('fake-db', 'users', 'user1');
    expect(setDoc).toHaveBeenCalledWith({ path: 'users/user1' }, { location: nakuru }, { merge: true });
  });

  it('subscribeToProfile listens to users/{uid} and passes the profile', () => {
    const unsubscribe = vi.fn();
    vi.mocked(onSnapshot).mockReturnValue(unsubscribe);
    const onData = vi.fn();
    const onError = vi.fn();

    const result = subscribeToProfile('user1', onData, onError);

    expect(result).toBe(unsubscribe);
    const [ref, handleSnapshot, handleError] = vi.mocked(onSnapshot).mock.calls[0];
    expect(ref).toEqual({ path: 'users/user1' });
    expect(handleError).toBe(onError);

    /* Pretend Firestore sent the saved profile */
    handleSnapshot({ exists: () => true, data: () => ({ location: nakuru }) });
    expect(onData).toHaveBeenCalledWith({ location: nakuru });
  });

  it('subscribeToProfile passes null when no profile has been saved yet', () => {
    const onData = vi.fn();
    subscribeToProfile('user1', onData, vi.fn());

    const [, handleSnapshot] = vi.mocked(onSnapshot).mock.calls[0];
    handleSnapshot({ exists: () => false, data: () => undefined });

    expect(onData).toHaveBeenCalledWith(null);
  });
});
