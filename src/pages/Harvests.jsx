import { useState } from 'react';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Select from '../components/Select.jsx';
import Spinner from '../components/Spinner.jsx';
import HarvestForm from '../components/harvests/HarvestForm.jsx';
import HarvestList from '../components/harvests/HarvestList.jsx';
import { useFarm } from '../hooks/useFarm.js';
import { useToast } from '../hooks/useToast.js';
import { formatCurrency } from '../utils/format.js';
import { harvestIncome, totalIncome } from '../utils/calculations.js';

function Harvests() {
  const {
    crops,
    cropsLoading,
    harvests,
    harvestsLoading,
    harvestsError,
    retryHarvests,
    addHarvest,
    updateHarvest,
    deleteHarvest,
  } = useFarm();
  const { showToast } = useToast();

  const [cropFilter, setCropFilter] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  /* null when adding a new harvest, or the harvest being edited */
  const [editingHarvest, setEditingHarvest] = useState(null);
  const [harvestToDelete, setHarvestToDelete] = useState(null);
  /* Ids of harvests whose delete is still on its way to Firestore */
  const [deletingIds, setDeletingIds] = useState([]);

  const filteredHarvests =
    cropFilter === 'All' ? harvests : harvests.filter((harvest) => harvest.cropId === cropFilter);

  function openAddForm() {
    setEditingHarvest(null);
    setFormOpen(true);
  }

  function openEditForm(harvest) {
    setEditingHarvest(harvest);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingHarvest(null);
  }

  /* Optimistic save: close the form and say "done" now, and only speak up again if it fails */
  function handleSave(data) {
    const saving = editingHarvest ? updateHarvest(editingHarvest.id, data) : addHarvest(data);
    showToast(editingHarvest ? 'Harvest updated' : 'Harvest added', 'success');
    closeForm();

    saving.catch(() => {
      showToast("Couldn't save the harvest. Please try again.", 'error');
    });
  }

  /* Optimistic delete: the harvest vanishes at once, and comes back if Firestore says no */
  function handleDelete() {
    const harvest = harvestToDelete;
    setHarvestToDelete(null);
    showToast('Harvest deleted', 'success');
    setDeletingIds((ids) => [...ids, harvest.id]);

    deleteHarvest(harvest.id)
      .catch(() => {
        showToast("Couldn't delete the harvest. Please try again.", 'error');
      })
      .finally(() => {
        setDeletingIds((ids) => ids.filter((id) => id !== harvest.id));
      });
  }

  /* Picks what to show: loading, an error, an empty message or the list */
  function renderContent() {
    if (cropsLoading || harvestsLoading) {
      return <Spinner label="Loading harvests…" />;
    }

    if (harvestsError) {
      return (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
          <p>{harvestsError}</p>
          <Button variant="secondary" onClick={retryHarvests} className="mt-4">
            Retry
          </Button>
        </div>
      );
    }

    if (crops.length === 0) {
      return (
        <EmptyState
          icon="crops"
          title="Add a crop first"
          message="Every harvest belongs to a crop, so start by adding the crops you grow."
          action={<Button to="/crops">Go to crops</Button>}
        />
      );
    }

    if (harvests.length === 0) {
      return (
        <EmptyState
          icon="harvests"
          title="No harvests yet"
          message="Record what you harvest and sell to see how much your crops earn."
          action={<Button onClick={openAddForm}>+ Add harvest</Button>}
        />
      );
    }

    return (
      <>
        <div className="max-w-sm">
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
        </div>

        <div className="mt-4 rounded-xl border border-stone-300 bg-white p-5">
          <p className="text-lg text-stone-700">
            Total income:{' '}
            <span className="font-bold text-green-700">{formatCurrency(totalIncome(filteredHarvests))}</span>
          </p>
          <p className="text-sm text-stone-500">
            {filteredHarvests.length} {filteredHarvests.length === 1 ? 'harvest' : 'harvests'}
          </p>
        </div>

        <div className="mt-4">
          {filteredHarvests.length === 0 ? (
            <EmptyState
              icon="harvests"
              title="No harvests for this crop"
              message="Try a different crop, or add a harvest for this one."
              action={
                <Button variant="secondary" onClick={() => setCropFilter('All')}>
                  Show all crops
                </Button>
              }
            />
          ) : (
            <HarvestList
              harvests={filteredHarvests}
              crops={crops}
              deletingIds={deletingIds}
              onEdit={openEditForm}
              onDelete={setHarvestToDelete}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold md:text-3xl">Harvests</h1>
        <Button onClick={openAddForm} disabled={crops.length === 0} className="disabled:opacity-60">
          + Add harvest
        </Button>
      </div>

      <div className="mt-6">{renderContent()}</div>

      <Modal open={formOpen} title={editingHarvest ? 'Edit harvest' : 'Add a harvest'} onClose={closeForm}>
        <HarvestForm
          harvest={editingHarvest}
          crops={crops}
          submitLabel={editingHarvest ? 'Save changes' : 'Add harvest'}
          onSubmit={handleSave}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        open={harvestToDelete !== null}
        title="Delete this harvest?"
        message={`This ${formatCurrency(harvestToDelete ? harvestIncome(harvestToDelete) : 0)} harvest will be removed for good.`}
        onConfirm={handleDelete}
        onCancel={() => setHarvestToDelete(null)}
      />
    </section>
  );
}

export default Harvests;
