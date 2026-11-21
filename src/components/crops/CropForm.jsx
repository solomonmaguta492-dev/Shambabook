import { useRef, useState } from 'react';
import Input from '../Input.jsx';
import Select from '../Select.jsx';
import Button from '../Button.jsx';
import { CROP_STATUSES, validateCrop } from '../../utils/validators.js';

const emptyCrop = {
  name: '',
  variety: '',
  plotSize: '',
  plantingDate: '',
  expectedHarvestDate: '',
  status: 'Planted',
};

/*
  One form for both adding and editing.
  Pass a crop to edit it, or nothing to start with empty fields.
*/
function CropForm({ crop, submitLabel = 'Save crop', onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...emptyCrop, ...crop });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* Refs for the fields that can have errors, in the order they appear */
  const nameRef = useRef(null);
  const plotSizeRef = useRef(null);
  const plantingDateRef = useRef(null);
  const expectedHarvestDateRef = useRef(null);
  const statusRef = useRef(null);

  /* One change handler for every field, using the input's name */
  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const newErrors = validateCrop(values);
    setErrors(newErrors);

    const fields = [
      { error: newErrors.name, ref: nameRef },
      { error: newErrors.plotSize, ref: plotSizeRef },
      { error: newErrors.plantingDate, ref: plantingDateRef },
      { error: newErrors.expectedHarvestDate, ref: expectedHarvestDateRef },
      { error: newErrors.status, ref: statusRef },
    ];
    const firstInvalid = fields.find((field) => field.error);
    if (firstInvalid) {
      firstInvalid.ref.current.focus();
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        variety: values.variety.trim(),
        plotSize: Number(values.plotSize),
        plantingDate: values.plantingDate,
        expectedHarvestDate: values.expectedHarvestDate,
        status: values.status,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        id="crop-name"
        name="name"
        label="Crop name"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
        ref={nameRef}
        placeholder="e.g. Maize"
      />
      <Input
        id="crop-variety"
        name="variety"
        label="Variety (optional)"
        value={values.variety}
        onChange={handleChange}
        placeholder="e.g. H614"
      />
      <Input
        id="crop-plot-size"
        name="plotSize"
        label="Plot size (acres)"
        type="number"
        min="0"
        step="0.1"
        inputMode="decimal"
        value={values.plotSize}
        onChange={handleChange}
        error={errors.plotSize}
        ref={plotSizeRef}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="crop-planting-date"
          name="plantingDate"
          label="Planting date"
          type="date"
          value={values.plantingDate}
          onChange={handleChange}
          error={errors.plantingDate}
          ref={plantingDateRef}
        />
        <Input
          id="crop-harvest-date"
          name="expectedHarvestDate"
          label="Expected harvest date"
          type="date"
          value={values.expectedHarvestDate}
          onChange={handleChange}
          error={errors.expectedHarvestDate}
          ref={expectedHarvestDateRef}
        />
      </div>

      <Select
        id="crop-status"
        name="status"
        label="Status"
        value={values.status}
        onChange={handleChange}
        error={errors.status}
        ref={statusRef}
      >
        {CROP_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </Select>

      <div className="mt-2 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="disabled:opacity-60">
          {saving ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default CropForm;
