import { useState } from 'react';
import Button from '../Button.jsx';
import Modal from '../Modal.jsx';
import ConfirmDialog from '../ConfirmDialog.jsx';
import HarvestForm from './HarvestForm.jsx';
import HarvestList from './HarvestList.jsx';
import { useFarm } from '../../hooks/useFarm.js';
import { useToast } from '../../hooks/useToast.js';
import { formatCurrency } from '../../utils/format.js';
import { harvestIncome, harvestsForCrop, totalIncome } from '../../utils/calculations.js';

/* The Harvests part of a crop's page: its list, total income, and add, edit and delete */
function CropHarvestsSection({ crop }) {
  const { crops, harvests, addHarvest, updateHarvest, deleteHarvest } = useFarm();
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  /* null when adding a new harvest, or the harvest being edited */
  const [editingHarvest, setEditingHarvest] = useState(null);
  const [harvestToDelete, setHarvestToDelete] = useState(null);

  const cropHarvests = harvestsForCrop(harvests, crop.id);

  function openForm(harvest = null) {
    setEditingHarvest(harvest);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingHarvest(null);
  }

  /* Same optimistic pattern as on the Harvests page */
  function handleSave(data) {
    const saving = editingHarvest ? updateHarvest(editingHarvest.id, data) : addHarvest(data);
    showToast(editingHarvest ? 'Harvest updated' : 'Harvest added', 'success');
    closeForm();

    saving.catch(() => {
      showToast("Couldn't save the harvest. Please try again.", 'error');
    });
  }

  function handleDelete() {
    const harvest = harvestToDelete;
    setHarvestToDelete(null);
    showToast('Harvest deleted', 'success');

    deleteHarvest(harvest.id).catch(() => {
      showToast("Couldn't delete the harvest. Please try again.", 'error');
    });
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Harvests</h2>
          <p className="text-stone-600">
            Total income:{' '}
            <span className="font-bold text-green-700">{formatCurrency(totalIncome(cropHarvests))}</span>
          </p>
        </div>
        <Button onClick={() => openForm()}>+ Add harvest</Button>
      </div>

      <div className="mt-4">
        {cropHarvests.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 bg-white p-6 text-center text-stone-500">
            No harvests for this crop yet.
          </p>
        ) : (
          <HarvestList
            harvests={cropHarvests}
            crops={crops}
            showCrop={false}
            onEdit={openForm}
            onDelete={setHarvestToDelete}
          />
        )}
      </div>

      <Modal open={formOpen} title={editingHarvest ? 'Edit harvest' : 'Add a harvest'} onClose={closeForm}>
        <HarvestForm
          harvest={editingHarvest}
          crops={crops}
          defaultCropId={crop.id}
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

export default CropHarvestsSection;
