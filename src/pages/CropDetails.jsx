import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Spinner from '../components/Spinner.jsx';
import CropForm from '../components/crops/CropForm.jsx';
import StatusBadge from '../components/crops/StatusBadge.jsx';
import ExpenseForm from '../components/expenses/ExpenseForm.jsx';
import ExpenseList from '../components/expenses/ExpenseList.jsx';
import { useFarm } from '../hooks/useFarm.js';
import { useToast } from '../hooks/useToast.js';
import { formatAcres, formatCurrency, formatDate } from '../utils/format.js';
import { expensesForCrop, totalExpenses } from '../utils/calculations.js';
import { deleteCropMessage } from '../utils/messages.js';

const backLinkClasses = 'font-medium text-green-700 hover:text-green-800 hover:underline';

function CropDetails() {
  /* The :id part of the address, for example /crops/abc123 */
  const { id } = useParams();
  const { crops, cropsLoading, updateCrop, deleteCrop, expenses, addExpense, updateExpense, deleteExpense } =
    useFarm();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  /* null when adding a new expense, or the expense being edited */
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const crop = crops.find((item) => item.id === id);
  const cropExpenses = expensesForCrop(expenses, id);

  if (cropsLoading) {
    return <Spinner label="Loading crop…" />;
  }

  if (!crop) {
    return (
      <section className="text-center">
        <h1 className="text-2xl font-bold">Crop not found</h1>
        <p className="mt-2 text-stone-600">It may have been deleted, or the link may be wrong.</p>
        <Link to="/crops" className={`mt-4 inline-block ${backLinkClasses}`}>
          ← Back to crops
        </Link>
      </section>
    );
  }

  /* Optimistic save: close and say "done" now, and only speak up again if it fails */
  function handleSave(data) {
    setEditOpen(false);
    showToast('Crop updated', 'success');

    updateCrop(crop.id, data).catch(() => {
      showToast("Couldn't save the crop. Please try again.", 'error');
    });
  }

  /* Optimistic delete: leave the page and say "done" now; the crop comes back if it fails */
  function handleDelete() {
    setDeleteOpen(false);
    navigate('/crops');
    showToast('Crop deleted', 'success');

    deleteCrop(crop.id).catch(() => {
      showToast("Couldn't delete the crop. Please try again.", 'error');
    });
  }

  function openExpenseForm(expense = null) {
    setEditingExpense(expense);
    setExpenseFormOpen(true);
  }

  function closeExpenseForm() {
    setExpenseFormOpen(false);
    setEditingExpense(null);
  }

  /* Same optimistic pattern as on the Expenses page */
  function handleSaveExpense(data) {
    const saving = editingExpense ? updateExpense(editingExpense.id, data) : addExpense(data);
    showToast(editingExpense ? 'Expense updated' : 'Expense added', 'success');
    closeExpenseForm();

    saving.catch(() => {
      showToast("Couldn't save the expense. Please try again.", 'error');
    });
  }

  function handleDeleteExpense() {
    const expense = expenseToDelete;
    setExpenseToDelete(null);
    showToast('Expense deleted', 'success');

    deleteExpense(expense.id).catch(() => {
      showToast("Couldn't delete the expense. Please try again.", 'error');
    });
  }

  const details = [
    { label: 'Variety', value: crop.variety || 'Not set' },
    { label: 'Plot size', value: formatAcres(crop.plotSize) },
    { label: 'Planting date', value: formatDate(crop.plantingDate) },
    { label: 'Expected harvest', value: formatDate(crop.expectedHarvestDate) },
  ];

  return (
    <section>
      <Link to="/crops" className={backLinkClasses}>
        ← Back to crops
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold md:text-3xl">{crop.name}</h1>
          <StatusBadge status={crop.status} />
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-stone-300 bg-white p-6 sm:grid-cols-2">
        {details.map((detail) => (
          <div key={detail.label}>
            <dt className="text-sm text-stone-500">{detail.label}</dt>
            <dd className="mt-1 font-medium text-stone-900">{detail.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Expenses</h2>
            <p className="text-stone-600">
              Total: <span className="font-bold text-stone-900">{formatCurrency(totalExpenses(cropExpenses))}</span>
            </p>
          </div>
          <Button onClick={() => openExpenseForm()}>+ Add expense</Button>
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
              onEdit={openExpenseForm}
              onDelete={setExpenseToDelete}
            />
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-stone-300 bg-white p-6">
        <h2 className="text-lg font-semibold">Harvests</h2>
        <p className="mt-1 text-stone-500">Coming soon</p>
      </section>

      <Modal open={editOpen} title="Edit crop" onClose={() => setEditOpen(false)}>
        <CropForm
          crop={crop}
          submitLabel="Save changes"
          onSubmit={handleSave}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title={`Delete ${crop.name}?`}
        message={deleteCropMessage(cropExpenses.length)}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <Modal open={expenseFormOpen} title={editingExpense ? 'Edit expense' : 'Add an expense'} onClose={closeExpenseForm}>
        <ExpenseForm
          expense={editingExpense}
          crops={crops}
          defaultCropId={crop.id}
          submitLabel={editingExpense ? 'Save changes' : 'Add expense'}
          onSubmit={handleSaveExpense}
          onCancel={closeExpenseForm}
        />
      </Modal>

      <ConfirmDialog
        open={expenseToDelete !== null}
        title={`Delete ${expenseToDelete?.category} expense?`}
        message={`This ${formatCurrency(expenseToDelete?.amount ?? 0)} expense will be removed for good.`}
        onConfirm={handleDeleteExpense}
        onCancel={() => setExpenseToDelete(null)}
      />
    </section>
  );
}

export default CropDetails;
