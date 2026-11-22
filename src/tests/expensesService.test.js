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
  addExpense,
  deleteExpense,
  subscribeToExpenses,
  updateExpense,
} from '../services/expensesService.js';

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

const seedExpense = { cropId: 'crop1', category: 'Seed', amount: 1500, date: '2026-03-01', note: '' };

describe('expensesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addExpense saves the expense with a createdAt time in the user\'s expenses', () => {
    addExpense('user1', seedExpense);

    expect(collection).toHaveBeenCalledWith('fake-db', 'users', 'user1', 'expenses');
    expect(addDoc).toHaveBeenCalledWith(
      { path: 'users/user1/expenses' },
      { ...seedExpense, createdAt: 'server-time' }
    );
  });

  it('updateExpense changes the right expense', () => {
    updateExpense('user1', 'exp1', { amount: 2000 });

    expect(doc).toHaveBeenCalledWith('fake-db', 'users', 'user1', 'expenses', 'exp1');
    expect(updateDoc).toHaveBeenCalledWith({ path: 'users/user1/expenses/exp1' }, { amount: 2000 });
  });

  it('deleteExpense deletes the right expense', () => {
    deleteExpense('user1', 'exp1');

    expect(deleteDoc).toHaveBeenCalledWith({ path: 'users/user1/expenses/exp1' });
  });

  it('subscribeToExpenses listens newest date first and passes the expenses with their ids', () => {
    const unsubscribe = vi.fn();
    vi.mocked(onSnapshot).mockReturnValue(unsubscribe);
    const onData = vi.fn();
    const onError = vi.fn();

    const result = subscribeToExpenses('user1', onData, onError);

    expect(orderBy).toHaveBeenCalledWith('date', 'desc');
    expect(query).toHaveBeenCalledWith({ path: 'users/user1/expenses' }, { field: 'date', direction: 'desc' });
    expect(result).toBe(unsubscribe);

    /* Pretend Firestore sent a snapshot with one expense */
    const [, handleSnapshot, handleError] = vi.mocked(onSnapshot).mock.calls[0];
    handleSnapshot({ docs: [{ id: 'exp1', data: () => seedExpense }] });

    expect(onData).toHaveBeenCalledWith([{ id: 'exp1', ...seedExpense }]);
    expect(handleError).toBe(onError);
  });
});
