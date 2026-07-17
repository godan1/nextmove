import { FieldLabel, FieldError, Input } from "@/components/ui/field";
import { StreetAutocomplete, type AddressSuggestion } from "@/components/quote-form/street-autocomplete";

type Props = {
  idPrefix: string;
  label: string;
  streetValue: string;
  streetError?: string;
  onStreetChange: (value: string) => void;
  cityValue: string;
  cityError?: string;
  onCityChange: (value: string) => void;
  postalValue: string;
  onPostalChange: (value: string) => void;
  floorValue: string;
  onFloorChange: (value: string) => void;
  aptValue: string;
  onAptChange: (value: string) => void;
};

/** The exact-address block used for both pickup and destination: a street
 *  address with live suggestions (auto-fills city + postal code on select),
 *  plus floor & apartment/unit number for condo and apartment moves (both
 *  optional — irrelevant for a house). */
export function AddressFields({
  idPrefix,
  label,
  streetValue,
  streetError,
  onStreetChange,
  cityValue,
  cityError,
  onCityChange,
  postalValue,
  onPostalChange,
  floorValue,
  onFloorChange,
  aptValue,
  onAptChange
}: Props) {
  function handleSuggestion(s: AddressSuggestion) {
    onStreetChange(s.street);
    if (s.city) onCityChange(s.city);
    if (s.postalCode) onPostalChange(s.postalCode);
  }

  return (
    <div>
      <FieldLabel htmlFor={`${idPrefix}-street`}>{label}</FieldLabel>
      <div className="grid gap-2.5">
        <StreetAutocomplete
          id={`${idPrefix}-street`}
          placeholder="Street address (number & street)"
          value={streetValue}
          error={streetError}
          onChange={onStreetChange}
          onSelectSuggestion={handleSuggestion}
        />
        <FieldError>{streetError}</FieldError>

        <div className="grid gap-2.5 sm:grid-cols-[2fr_1fr]">
          <div>
            <Input
              id={`${idPrefix}-city`}
              placeholder="City"
              value={cityValue}
              error={cityError}
              onChange={(e) => onCityChange(e.target.value)}
            />
            <FieldError>{cityError}</FieldError>
          </div>
          <Input
            id={`${idPrefix}-postal`}
            placeholder="Postal code"
            value={postalValue}
            onChange={(e) => onPostalChange(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Input
            id={`${idPrefix}-floor`}
            placeholder="Floor (if condo/apt)"
            value={floorValue}
            onChange={(e) => onFloorChange(e.target.value)}
          />
          <Input
            id={`${idPrefix}-apt`}
            placeholder="Apt / unit #"
            value={aptValue}
            onChange={(e) => onAptChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
