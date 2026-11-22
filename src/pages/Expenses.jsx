import { useState } from 'react';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Select from '../components/Select.jsx';
import Spinner from '../components/Spinner.jsx';
import ExpenseForm from '../components/expenses/ExpenseForm.jsx';
import ExpenseList from '../components/expenses/ExpenseList.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { useFarm } from '../hooks/useFarm.js';
import { useToast } from '../hooks/useToast.js';
import { EXPENSE_CATEGORIES } from '../utils/validators.js';
import { formatCurrency } from '../utils/format.js';
import { totalExpenses } from '../utils/calculations.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

function Expenses() {
  usePageTitle('Expenses');
  const {
    crops,
    cropsLoading,
    expenses,
    expensesLoading,
    expensesError,
    retryExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useFarm();
  const { showToast } = useToast();

  const [cropFilter, setCropFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  /* null when adding a new expense, or the expense being edited */
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  /* Ids of expenses whose delete is still on its way to Firestore */
  const [deletingIds, setDeletingIds] = useState([]);

  /* Keep an expense only if it matches both filters */
  const filteredExpenses = expenses.filter(
    (expense) =>
      (cropFilter === 'All' || expense.cropId === cropFilter) &&
      (categoryFilter === 'All' || expense.category === categoryFilter)
  );

  function openAddForm() {
    setEditingExpense(null);
    setFormOpen(true);
  }

  function openEditForm(expense) {
    setEditingExpense(expense);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingExpense(null);
  }

  function clearFilters() {
    setCropFilter('All');
    setCategoryFilter('All');
  }

  /* Optimistic save: close the form and say "done" now, and only speak up again if it fails */
  function handleSave(data) {
    const saving = editingExpense ? updateExpense(editingExpense.id, data) : addExpense(data);
    showToast(editingExpense ? 'Expense updated' : 'Expense added', 'success');
    closeForm();

    saving.catch(() => {
      showToast("Couldn't save the expense. Please try again.", 'error');
    });
  }

  /* Optimistic delete: the expense vanishes at once, and comes back if Firestore says no */
  function handleDelete() {
    const expense = expenseToDelete;
    setExpenseToDelete(null);
    showToast('Expense deleted', 'success');
    setDeletingIds((ids) => [...ids, expense.id]);

    deleteExpense(expense.id)
      .catch(() => {
        showToast("Couldn't delete the expense. Please try again.", 'error');
      })
      .finally(() => {
        setDeletingIds((ids) => ids.filter((id) => id !== expense.id));
      });
  }

  /* Picks what to show: loading, an error, an empty message or the list */
  function renderContent() {
    if (cropsLoading || expensesLoading) {
      return <Spinner label="Loading expenses…" />;
    }

    if (expensesError) {
      return (
        <ErrorMessage message={expensesError} onRetry={retryExpenses} />
      );
    }

    if (crops.length === 0) {
      return (
        <EmptyState
          icon="crops"
          title="Add a crop first"
          message="Every expense belongs to a crop, so start by adding the crops you grow."
          action={<Button to="/crops">Go to crops</Button>}
        />
      );
    }

    if (expenses.length === 0) {
      return (
        <EmptyState
          icon="expenses"
          title="No expenses yet"
          message="Record what you spend on seed, fertiliser, labour and more."
          action={<Button onClick={openAddForm}>+ Add expense</Button>}
        />
      );
    }

    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="filter-crop"
            label="Crop"
            value={cropFilter}
            onChange={(event) => setCropFilter(event.target.value)}
          >
            <option value="All">All crops</option>
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name}
              </option>
            ))}
          </Select>
          <Select
            id="filter-category"
            label="Category"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="All">All categories</option>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-4 rounded-xl border border-stone-300 bg-white p-5">
          <p className="text-lg text-stone-700">
            Total: <span className="font-bold text-stone-900">{formatCurrency(totalExpenses(filteredExpenses))}</span>
          </p>
          <p className="text-sm text-stone-500">
            {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
          </p>
        </div>

        <div className="mt-4">
          {filteredExpenses.length === 0 ? (
            <EmptyState
              icon="expenses"
              title="No matching expenses"
              message="Try a different crop or category."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <ExpenseList
              expenses={filteredExpenses}
              crops={crops}
              deletingIds={deletingIds}
              onEdit={openEditForm}
              onDelete={setExpenseToDelete}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold md:text-3xl">Expenses</h1>
        <Button onClick={openAddForm} disabled={crops.length === 0} className="disabled:opacity-60">
          + Add expense
        </Button>
      </div>

      <div className="mt-6">{renderContent()}</div>

      <Modal open={formOpen} title={editingExpense ? 'Edit expense' : 'Add an expense'} onClose={closeForm}>
        <ExpenseForm
          expense={editingExpense}
          crops={crops}
          submitLabel={editingExpense ? 'Save changes' : 'Add expense'}
          onSubmit={handleSave}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        open={expenseToDelete !== null}
        title={`Delete ${expenseToDelete?.category} expense?`}
        message={`This ${formatCurrency(expenseToDelete?.amount ?? 0)} expense will be removed for good.`}
        onConfirm={handleDelete}
        onCancel={() => setExpenseToDelete(null)}
      />
    </section>
  );
}

export default Expenses;
