import { useState } from 'react';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Spinner from '../components/Spinner.jsx';
import CropCard from '../components/crops/CropCard.jsx';
import CropForm from '../components/crops/CropForm.jsx';
import { useFarm } from '../hooks/useFarm.js';
import { useToast } from '../hooks/useToast.js';
import { CROP_STATUSES } from '../utils/validators.js';
import { expensesForCrop, harvestsForCrop } from '../utils/calculations.js';
import { deleteCropMessage } from '../utils/messages.js';

const FILTERS = ['All', ...CROP_STATUSES];

function Crops() {
  const { crops, cropsLoading, cropsError, retryCrops, addCrop, updateCrop, deleteCrop, expenses, harvests } =
    useFarm();
  const { showToast } = useToast();

  const [filter, setFilter] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  /* null when adding a new crop, or the crop being edited */
  const [editingCrop, setEditingCrop] = useState(null);
  const [cropToDelete, setCropToDelete] = useState(null);
  /* Ids of crops whose delete is still on its way to Firestore */
  const [deletingIds, setDeletingIds] = useState([]);

  const filteredCrops = filter === 'All' ? crops : crops.filter((crop) => crop.status === filter);

  function openAddForm() {
    setEditingCrop(null);
    setFormOpen(true);
  }

  function openEditForm(crop) {
    setEditingCrop(crop);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingCrop(null);
  }

  /*
    Optimistic save: close the form and say "done" straight away.
    onSnapshot shows the change at once; we only speak up again if saving fails.
  */
  function handleSave(data) {
    const saving = editingCrop ? updateCrop(editingCrop.id, data) : addCrop(data);
    showToast(editingCrop ? 'Crop updated' : 'Crop added', 'success');
    closeForm();

    saving.catch(() => {
      showToast("Couldn't save the crop. Please try again.", 'error');
    });
  }

  /* Optimistic delete: the crop vanishes at once, and comes back if Firestore says no */
  function handleDelete() {
    const crop = cropToDelete;
    setCropToDelete(null);
    showToast('Crop deleted', 'success');
    setDeletingIds((ids) => [...ids, crop.id]);

    deleteCrop(crop.id)
      .catch(() => {
        showToast("Couldn't delete the crop. Please try again.", 'error');
      })
      .finally(() => {
        setDeletingIds((ids) => ids.filter((id) => id !== crop.id));
      });
  }

  /* Picks what to show under the title: loading, an error, an empty message or the list */
  function renderContent() {
    if (cropsLoading) {
      return <Spinner label="Loading crops…" />;
    }

    if (cropsError) {
      return (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
          <p>{cropsError}</p>
          <Button variant="secondary" onClick={retryCrops} className="mt-4">
            Retry
          </Button>
        </div>
      );
    }

    if (crops.length === 0) {
      return (
        <EmptyState
          title="No crops yet"
          message="Add the crops you are growing to start tracking your farm."
          action={<Button onClick={openAddForm}>+ Add crop</Button>}
        />
      );
    }

    if (filteredCrops.length === 0) {
      return (
        <EmptyState
          title={`No ${filter.toLowerCase()} crops`}
          message="Try a different filter to see your other crops."
          action={
            <Button variant="secondary" onClick={() => setFilter('All')}>
              Show all crops
            </Button>
          }
        />
      );
    }

    return (
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCrops.map((crop) => (
          <li key={crop.id} className="flex">
            <CropCard
              crop={crop}
              deleting={deletingIds.includes(crop.id)}
              onEdit={openEditForm}
              onDelete={setCropToDelete}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold md:text-3xl">My crops</h1>
        <Button onClick={openAddForm}>+ Add crop</Button>
      </div>

      {crops.length > 0 && (
        <div role="group" aria-label="Filter by status" className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              aria-pressed={filter === option}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 ${
                filter === option
                  ? 'border-green-700 bg-green-700 text-white'
                  : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">{renderContent()}</div>

      <Modal open={formOpen} title={editingCrop ? 'Edit crop' : 'Add a crop'} onClose={closeForm}>
        <CropForm
          crop={editingCrop}
          submitLabel={editingCrop ? 'Save changes' : 'Add crop'}
          onSubmit={handleSave}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        open={cropToDelete !== null}
        title={`Delete ${cropToDelete?.name}?`}
        message={
          cropToDelete
            ? deleteCropMessage(
                expensesForCrop(expenses, cropToDelete.id).length,
                harvestsForCrop(harvests, cropToDelete.id).length
              )
            : ''
        }
        onConfirm={handleDelete}
        onCancel={() => setCropToDelete(null)}
      />
    </section>
  );
}

export default Crops;
