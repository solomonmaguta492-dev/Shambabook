import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Spinner from '../components/Spinner.jsx';
import StatCard from '../components/StatCard.jsx';
import CropForm from '../components/crops/CropForm.jsx';
import StatusBadge from '../components/crops/StatusBadge.jsx';
import CropExpensesSection from '../components/expenses/CropExpensesSection.jsx';
import CropHarvestsSection from '../components/harvests/CropHarvestsSection.jsx';
import { useFarm } from '../hooks/useFarm.js';
import { useToast } from '../hooks/useToast.js';
import { formatAcres, formatCurrency, formatDate, profitTone } from '../utils/format.js';
import { cropProfit, expensesForCrop, harvestsForCrop } from '../utils/calculations.js';
import { deleteCropMessage } from '../utils/messages.js';

const backLinkClasses = 'font-medium text-green-700 hover:text-green-800 hover:underline';

function CropDetails() {
  /* The :id part of the address, for example /crops/abc123 */
  const { id } = useParams();
  const { crops, cropsLoading, updateCrop, deleteCrop, expenses, harvests } = useFarm();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const crop = crops.find((item) => item.id === id);

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

  /* What this crop cost, what it earned, and the difference */
  const summary = cropProfit(crop.id, expenses, harvests);

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

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total expenses" value={formatCurrency(summary.expenses)} />
        <StatCard label="Total income" value={formatCurrency(summary.income)} />
        <StatCard
          label={summary.profit < 0 ? 'Loss' : 'Profit'}
          value={formatCurrency(summary.profit)}
          tone={profitTone(summary.profit)}
        />
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-stone-300 bg-white p-6 sm:grid-cols-2">
        {details.map((detail) => (
          <div key={detail.label}>
            <dt className="text-sm text-stone-500">{detail.label}</dt>
            <dd className="mt-1 font-medium text-stone-900">{detail.value}</dd>
          </div>
        ))}
      </dl>

      <CropExpensesSection crop={crop} />
      <CropHarvestsSection crop={crop} />

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
        message={deleteCropMessage(expensesForCrop(expenses, crop.id).length, harvestsForCrop(harvests, crop.id).length)}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </section>
  );
}

export default CropDetails;
