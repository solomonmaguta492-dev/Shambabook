import { useRef, useState } from 'react';
import Input from '../Input.jsx';
import Select from '../Select.jsx';
import Button from '../Button.jsx';
import { HARVEST_UNITS, validateHarvest } from '../../utils/validators.js';
import { formatCurrency, todayString } from '../../utils/format.js';
import { harvestIncome } from '../../utils/calculations.js';

/*
  One form for adding and editing harvests.
  Pass a harvest to edit it, or a defaultCropId to start with that crop chosen.
*/
function HarvestForm({ harvest, crops, defaultCropId = '', submitLabel = 'Save harvest', onSubmit, onCancel }) {
  const [values, setValues] = useState({
    cropId: defaultCropId,
    quantity: '',
    unit: '',
    pricePerUnit: '',
    date: todayString(),
    ...harvest,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* Refs for the fields that can have errors, in the order they appear */
  const cropIdRef = useRef(null);
  const quantityRef = useRef(null);
  const unitRef = useRef(null);
  const pricePerUnitRef = useRef(null);
  const dateRef = useRef(null);

  /* Worked out again every time a number changes, so the farmer sees the income as they type */
  const previewIncome = harvestIncome(values) || 0;

  /* One change handler for every field, using the input's name */
  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const newErrors = validateHarvest(values);
    setErrors(newErrors);

    const fields = [
      { error: newErrors.cropId, ref: cropIdRef },
      { error: newErrors.quantity, ref: quantityRef },
      { error: newErrors.unit, ref: unitRef },
      { error: newErrors.pricePerUnit, ref: pricePerUnitRef },
      { error: newErrors.date, ref: dateRef },
    ];
    const firstInvalid = fields.find((field) => field.error);
    if (firstInvalid) {
      firstInvalid.ref.current.focus();
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        cropId: values.cropId,
        quantity: Number(values.quantity),
        unit: values.unit,
        pricePerUnit: Number(values.pricePerUnit),
        date: values.date,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Select
        id="harvest-crop"
        name="cropId"
        label="Crop"
        value={values.cropId}
        onChange={handleChange}
        error={errors.cropId}
        ref={cropIdRef}
      >
        <option value="">Choose a crop</option>
        {crops.map((crop) => (
          <option key={crop.id} value={crop.id}>
            {crop.name}
          </option>
        ))}
      </Select>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="harvest-quantity"
          name="quantity"
          label="Quantity"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={values.quantity}
          onChange={handleChange}
          error={errors.quantity}
          ref={quantityRef}
        />
        <Select
          id="harvest-unit"
          name="unit"
          label="Unit"
          value={values.unit}
          onChange={handleChange}
          error={errors.unit}
          ref={unitRef}
        >
          <option value="">Choose a unit</option>
          {HARVEST_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="harvest-price"
          name="pricePerUnit"
          label="Price per unit (KES)"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={values.pricePerUnit}
          onChange={handleChange}
          error={errors.pricePerUnit}
          ref={pricePerUnitRef}
        />
        <Input
          id="harvest-date"
          name="date"
          label="Date"
          type="date"
          max={todayString()}
          value={values.date}
          onChange={handleChange}
          error={errors.date}
          ref={dateRef}
        />
      </div>

      {/* aria-live lets screen readers hear the income change as the numbers are typed */}
      <p aria-live="polite" className="rounded-lg bg-green-50 px-3 py-2 font-medium text-green-800">
        Income: {formatCurrency(previewIncome)}
      </p>

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

export default HarvestForm;
