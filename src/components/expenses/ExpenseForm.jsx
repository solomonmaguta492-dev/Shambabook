import { useRef, useState } from 'react';
import Input from '../Input.jsx';
import Select from '../Select.jsx';
import Button from '../Button.jsx';
import { EXPENSE_CATEGORIES, validateExpense } from '../../utils/validators.js';
import { todayString } from '../../utils/format.js';

/*
  One form for adding and editing expenses.
  Pass an expense to edit it, or a defaultCropId to start with that crop chosen.
*/
function ExpenseForm({ expense, crops, defaultCropId = '', submitLabel = 'Save expense', onSubmit, onCancel }) {
  const [values, setValues] = useState({
    cropId: defaultCropId,
    category: '',
    amount: '',
    date: todayString(),
    note: '',
    ...expense,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* Refs for the fields that can have errors, in the order they appear */
  const cropIdRef = useRef(null);
  const categoryRef = useRef(null);
  const amountRef = useRef(null);
  const dateRef = useRef(null);

  /* One change handler for every field, using the input's name */
  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const newErrors = validateExpense(values);
    setErrors(newErrors);

    const fields = [
      { error: newErrors.cropId, ref: cropIdRef },
      { error: newErrors.category, ref: categoryRef },
      { error: newErrors.amount, ref: amountRef },
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
        category: values.category,
        amount: Number(values.amount),
        date: values.date,
        note: values.note.trim(),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Select
        id="expense-crop"
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

      <Select
        id="expense-category"
        name="category"
        label="Category"
        value={values.category}
        onChange={handleChange}
        error={errors.category}
        ref={categoryRef}
      >
        <option value="">Choose a category</option>
        {EXPENSE_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="expense-amount"
          name="amount"
          label="Amount (KES)"
          type="number"
          min="0"
          step="1"
          inputMode="decimal"
          value={values.amount}
          onChange={handleChange}
          error={errors.amount}
          ref={amountRef}
        />
        <Input
          id="expense-date"
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

      <Input
        id="expense-note"
        name="note"
        label="Note (optional)"
        value={values.note}
        onChange={handleChange}
        placeholder="e.g. 2 bags of DAP"
      />

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

export default ExpenseForm;
