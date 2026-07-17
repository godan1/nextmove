import { FieldLabel, FieldError, Input, Select, Textarea } from "@/components/ui/field";
import { BOX_TYPES, PROPERTY_TYPES, SPECIAL_ITEMS, type PreciseQuoteValues } from "@/lib/quote-schema";
import { PhotoUpload, type AttachedPhoto } from "@/components/quote-form/photo-upload";
import { cn } from "@/lib/utils";

type Props = {
  values: PreciseQuoteValues;
  errors: Partial<Record<keyof PreciseQuoteValues, string>>;
  onChange: <K extends keyof PreciseQuoteValues>(key: K, value: PreciseQuoteValues[K]) => void;
  photos: AttachedPhoto[];
  onPhotosChange: (photos: AttachedPhoto[]) => void;
};

function NumberField({
  id,
  label,
  hint,
  value,
  max,
  onChange
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>
        {label}
        {hint && <span className="ml-1 font-normal text-muted">— {hint}</span>}
      </FieldLabel>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function PreciseQuoteFields({ values, errors, onChange, photos, onPhotosChange }: Props) {
  function toggleSpecialItem(item: (typeof SPECIAL_ITEMS)[number]) {
    const next = values.specialItems.includes(item)
      ? values.specialItems.filter((i) => i !== item)
      : [...values.specialItems, item];
    onChange("specialItems", next);
  }

  return (
    <div className="grid gap-6 border-t border-line pt-6">
      <div>
        <FieldLabel htmlFor="propertyType">Property type</FieldLabel>
        <Select
          id="propertyType"
          value={values.propertyType}
          onChange={(e) => onChange("propertyType", e.target.value as PreciseQuoteValues["propertyType"])}
        >
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">Boxes</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {BOX_TYPES.map((box) => (
            <NumberField
              key={box.key}
              id={box.key}
              label={box.label}
              hint={box.hint}
              max={200}
              value={values[box.key as keyof PreciseQuoteValues] as number}
              onChange={(value) => onChange(box.key as keyof PreciseQuoteValues, value as never)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">Furniture &amp; other items</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField id="totes" label="Totes" max={50} value={values.totes} onChange={(v) => onChange("totes", v)} />
          <NumberField id="beds" label="Beds" max={50} value={values.beds} onChange={(v) => onChange("beds", v)} />
          <NumberField
            id="dressers"
            label="Dressers"
            max={50}
            value={values.dressers}
            onChange={(v) => onChange("dressers", v)}
          />
        </div>
        <div className="mt-4">
          <FieldLabel htmlFor="miscItems">Anything else? (optional)</FieldLabel>
          <Input
            id="miscItems"
            placeholder="e.g. 3 lamps, exercise bike, patio furniture"
            value={values.miscItems}
            onChange={(e) => onChange("miscItems", e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">Special or heavy items</legend>
        <div className="flex flex-wrap gap-2">
          {SPECIAL_ITEMS.map((item) => {
            const active = values.specialItems.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleSpecialItem(item)}
                aria-pressed={active}
                className={cn(
                  "min-h-[40px] rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-harbor bg-harbor text-white"
                    : "border-line bg-white text-ink hover:border-harbor/40"
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">Stairs &amp; elevators</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            id="pickupStairs"
            label="Flights of stairs at pickup"
            max={10}
            value={values.pickupStairs}
            onChange={(v) => onChange("pickupStairs", v)}
          />
          <NumberField
            id="deliveryStairs"
            label="Flights of stairs at delivery"
            max={10}
            value={values.deliveryStairs}
            onChange={(v) => onChange("deliveryStairs", v)}
          />
          <NumberField
            id="pickupElevators"
            label="Elevators at pickup building"
            hint="0 if none"
            max={6}
            value={values.pickupElevators}
            onChange={(v) => onChange("pickupElevators", v)}
          />
          <NumberField
            id="deliveryElevators"
            label="Elevators at destination building"
            hint="0 if none"
            max={6}
            value={values.deliveryElevators}
            onChange={(v) => onChange("deliveryElevators", v)}
          />
        </div>
      </fieldset>

      <PhotoUpload photos={photos} onChange={onPhotosChange} />

      <div>
        <FieldLabel htmlFor="notes">Anything movers should know? (optional)</FieldLabel>
        <Textarea
          id="notes"
          placeholder="Parking, storage, packing help, time restrictions..."
          value={values.notes}
          onChange={(e) => onChange("notes", e.target.value)}
        />
        <FieldError>{errors.notes}</FieldError>
      </div>
    </div>
  );
}
