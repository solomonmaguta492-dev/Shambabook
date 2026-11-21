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
import { addCrop, deleteCrop, subscribeToCrops, updateCrop } from '../services/cropsService.js';

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

const maize = { name: 'Maize', plotSize: 2, status: 'Planted' };

describe('cropsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addCrop saves the crop with a createdAt time in the user\'s crops', () => {
    addCrop('user1', maize);

    expect(collection).toHaveBeenCalledWith('fake-db', 'users', 'user1', 'crops');
    expect(addDoc).toHaveBeenCalledWith(
      { path: 'users/user1/crops' },
      { ...maize, createdAt: 'server-time' }
    );
  });

  it('updateCrop changes the right crop', () => {
    updateCrop('user1', 'crop1', { status: 'Growing' });

    expect(doc).toHaveBeenCalledWith('fake-db', 'users', 'user1', 'crops', 'crop1');
    expect(updateDoc).toHaveBeenCalledWith({ path: 'users/user1/crops/crop1' }, { status: 'Growing' });
  });

  it('deleteCrop deletes the right crop', () => {
    deleteCrop('user1', 'crop1');

    expect(deleteDoc).toHaveBeenCalledWith({ path: 'users/user1/crops/crop1' });
  });

  it('subscribeToCrops listens newest first and passes the crops with their ids', () => {
    const unsubscribe = vi.fn();
    vi.mocked(onSnapshot).mockReturnValue(unsubscribe);
    const onData = vi.fn();
    const onError = vi.fn();

    const result = subscribeToCrops('user1', onData, onError);

    expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    expect(query).toHaveBeenCalledWith({ path: 'users/user1/crops' }, { field: 'createdAt', direction: 'desc' });
    expect(result).toBe(unsubscribe);

    /* Pretend Firestore sent a snapshot with one crop */
    const [, handleSnapshot, handleError] = vi.mocked(onSnapshot).mock.calls[0];
    handleSnapshot({ docs: [{ id: 'crop1', data: () => maize }] });

    expect(onData).toHaveBeenCalledWith([{ id: 'crop1', ...maize }]);
    expect(handleError).toBe(onError);
  });
});
