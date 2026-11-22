import { useState } from 'react';
import Button from '../Button.jsx';
import Modal from '../Modal.jsx';
import ConfirmDialog from '../ConfirmDialog.jsx';
import ExpenseForm from './ExpenseForm.jsx';
import ExpenseList from './ExpenseList.jsx';
import { useFarm } from '../../hooks/useFarm.js';
import { useToast } from '../../hooks/useToast.js';
import { formatCurrency } from '../../utils/format.js';
import { expensesForCrop, totalExpenses } from '../../utils/calculations.js';

/* The Expenses part of a crop's page: its list, total, and add, edit and delete */
function CropExpensesSection({ crop }) {
  const { crops, expenses, addExpense, updateExpense, deleteExpense } = useFarm();
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  /* null when adding a new expense, or the expense being edited */
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const cropExpenses = expensesForCrop(expenses, crop.id);

  function openForm(expense = null) {
    setEditingExpense(expense);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingExpense(null);
  }

  /* Same optimistic pattern as on the Expenses page */
  function handleSave(data) {
    const saving = editingExpense ? updateExpense(editingExpense.id, data) : addExpense(data);
    showToast(editingExpense ? 'Expense updated' : 'Expense added', 'success');
    closeForm();

    saving.catch(() => {
      showToast("Couldn't save the expense. Please try again.", 'error');
    });
  }

  function handleDelete() {
    const expense = expenseToDelete;
    setExpenseToDelete(null);
    showToast('Expense deleted', 'success');

    deleteExpense(expense.id).catch(() => {
      showToast("Couldn't delete the expense. Please try again.", 'error');
    });
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Expenses</h2>
          <p className="text-stone-600">
            Total: <span className="font-bold text-stone-900">{formatCurrency(totalExpenses(cropExpenses))}</span>
          </p>
        </div>
        <Button onClick={() => openForm()}>+ Add expense</Button>
      </div>

      <div className="mt-4">
        {cropExpenses.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 bg-white p-6 text-center text-stone-500">
            No expenses for this crop yet.
          </p>
        ) : (
          <ExpenseList
            expenses={cropExpenses}
            crops={crops}
            showCrop={false}
            onEdit={openForm}
            onDelete={setExpenseToDelete}
          />
        )}
      </div>

      <Modal open={formOpen} title={editingExpense ? 'Edit expense' : 'Add an expense'} onClose={closeForm}>
        <ExpenseForm
          expense={editingExpense}
          crops={crops}
          defaultCropId={crop.id}
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

export default CropExpensesSection;
