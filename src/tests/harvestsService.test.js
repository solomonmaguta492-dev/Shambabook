import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import {
  addHarvest,
  deleteHarvest,
  subscribeToHarvests,
  updateHarvest,
} from '../services/harvestsService.js';

/* Fake Firestore: collection and doc just return the path, so we can check it */
vi.mock('../services/firebase.js', () => ({ db: 'fake-db' }));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((db, ...segments) => ({ path: segments.join('/') })),
  doc: vi.fn((db, ...segments) => ({ path: segments.join('/') })),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn((ref, order) => ({ ref, order })),
  orderBy: vi.fn((field, direction) => ({ field, direction })),
  serverTimestamp: vi.fn(() => 'server-time'),
}));

const maizeHarvest = { cropId: 'crop1', quantity: 20, unit: 'bags', pricePerUnit: 3500, date: '2026-03-01' };

describe('harvestsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addHarvest saves the harvest with a createdAt time in the user\'s harvests', () => {
    addHarvest('user1', maizeHarvest);

    expect(collection).toHaveBeenCalledWith('fake-db', 'users', 'user1', 'harvests');
    expect(addDoc).toHaveBeenCalledWith(
      { path: 'users/user1/harvests' },
      { ...maizeHarvest, createdAt: 'server-time' }
    );
  });

  it('updateHarvest changes the right harvest', () => {
    updateHarvest('user1', 'harv1', { quantity: 25 });

    expect(doc).toHaveBeenCalledWith('fake-db', 'users', 'user1', 'harvests', 'harv1');
    expect(updateDoc).toHaveBeenCalledWith({ path: 'users/user1/harvests/harv1' }, { quantity: 25 });
  });

  it('deleteHarvest deletes the right harvest', () => {
    deleteHarvest('user1', 'harv1');

    expect(deleteDoc).toHaveBeenCalledWith({ path: 'users/user1/harvests/harv1' });
  });

  it('subscribeToHarvests listens newest date first and passes the harvests with their ids', () => {
    const unsubscribe = vi.fn();
    vi.mocked(onSnapshot).mockReturnValue(unsubscribe);
    const onData = vi.fn();
    const onError = vi.fn();

    const result = subscribeToHarvests('user1', onData, onError);

    expect(orderBy).toHaveBeenCalledWith('date', 'desc');
    expect(query).toHaveBeenCalledWith({ path: 'users/user1/harvests' }, { field: 'date', direction: 'desc' });
    expect(result).toBe(unsubscribe);

    /* Pretend Firestore sent a snapshot with one harvest */
    const [, handleSnapshot, handleError] = vi.mocked(onSnapshot).mock.calls[0];
    handleSnapshot({ docs: [{ id: 'harv1', data: () => maizeHarvest }] });

    expect(onData).toHaveBeenCalledWith([{ id: 'harv1', ...maizeHarvest }]);
    expect(handleError).toBe(onError);
  });
});
