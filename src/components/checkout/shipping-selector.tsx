"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { storeRequest, type CheckoutSelection } from "@/lib/checkout-api";
import { cartNaira } from "@/lib/cart-api";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brandContact } from "@/lib/brand-contact";

type Place = { id: string; name: string; lgaId?: string | null };
type Option = {
  methodId: string;
  method: string;
  feeKobo: string;
  estimate: string;
};
type Settings = {
  version: number;
  policy: { pickup: { enabled: boolean; address: string; phone: string } };
};
const inputClass = "h-11 w-full rounded-lg border bg-card px-3 text-sm";
function useShippingData<T>(key: string, load: () => Promise<T>) {
  const [result, setResult] = useState<{
    key: string;
    data: T | null;
    error: string;
  } | null>(null);
  useEffect(() => {
    if (!key) return;
    let active = true;
    void load()
      .then((data) => {
        if (active) setResult({ key, data, error: "" });
      })
      .catch(() => {
        if (active)
          setResult({
            key,
            data: null,
            error:
              "Unable to load delivery options. Please refresh and try again.",
          });
      });
    return () => {
      active = false;
    };
  }, [key, load]);
  return {
    data: result?.key === key ? result.data : null,
    error: result?.key === key ? result.error : "",
    loading: Boolean(key) && result?.key !== key,
  };
}
export function ShippingSelector({
  onChange,
}: {
  onChange: (value: CheckoutSelection | null) => void;
}) {
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [stateId, setStateId] = useState("");
  const [lgaId, setLgaId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [methodId, setMethodId] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [revision, setRevision] = useState(0);
  const catalogLoader = useCallback(async () => {
    const [states, settings] = await Promise.all([
      storeRequest<{ data: Place[] }>("shipping/states"),
      storeRequest<Settings>("shipping/settings"),
    ]);
    return { states: states.data, settings };
  }, []);
  const catalog = useShippingData(`catalog:${revision}`, catalogLoader);
  const states = catalog.data?.states ?? [];
  const settings = catalog.data?.settings;
  const areasLoader = useCallback(async () => {
    const [lgas, destinations] = await Promise.all([
      storeRequest<{ data: Place[] }>(
        `shipping/lgas?stateId=${encodeURIComponent(stateId)}`,
      ),
      storeRequest<{ data: Place[] }>(
        `shipping/destinations?stateId=${encodeURIComponent(stateId)}`,
      ),
    ]);
    return { lgas: lgas.data, destinations: destinations.data };
  }, [stateId]);
  const areas = useShippingData(
    mode === "delivery" && stateId ? `areas:${stateId}:${revision}` : "",
    areasLoader,
  );
  const lgas = areas.data?.lgas ?? [];
  const destinations = areas.data?.destinations ?? [];
  const optionsLoader = useCallback(async () => {
    if (!settings) throw new Error("Settings unavailable");
    const value =
      mode === "pickup"
        ? await storeRequest<Option & { version: number }>(
            "shipping/quote",
            "POST",
            { methodId: "pickup", expectedVersion: settings.version },
          ).then((option) => ({
            data: [option],
            meta: { version: option.version },
          }))
        : await storeRequest<{ data: Option[]; meta: { version: number } }>(
            `shipping/options?destinationId=${encodeURIComponent(destinationId)}`,
          );
    for (const option of value.data) cartNaira(option.feeKobo);
    return value;
  }, [settings, mode, destinationId]);
  const methods = useShippingData(
    settings && (mode === "pickup" || destinationId)
      ? `methods:${mode}:${destinationId}:${settings.version}:${revision}`
      : "",
    optionsLoader,
  );
  const options = methods.data?.data ?? [];
  const version = methods.data?.meta.version ?? 0;
  const loading = catalog.loading || areas.loading || methods.loading;
  const error = catalog.error || areas.error || methods.error;
  const chosen = options.find((value) => value.methodId === methodId);
  const state = states.find((value) => value.id === stateId);
  const destination = destinations.find((value) => value.id === destinationId);
  const lga = lgas.find((value) => value.id === lgaId);
  const selection = useMemo<CheckoutSelection | null>(() => {
    if (!chosen || loading || error) return null;
    if (mode === "pickup")
      return {
        shippingMethodId: "pickup",
        expectedShippingVersion: version,
        feeKobo: chosen.feeKobo,
        estimate: chosen.estimate,
      };
    if (
      !state ||
      !destination ||
      !line1.trim() ||
      !city.trim() ||
      (destination.lgaId && destination.lgaId !== lgaId)
    )
      return null;
    return {
      shippingMethodId: chosen.methodId,
      expectedShippingVersion: version,
      feeKobo: chosen.feeKobo,
      estimate: chosen.estimate,
      delivery: {
        line1: line1.trim(),
        city: city.trim(),
        state: state.name,
        country: "NG",
        ...(lga ? { lga: lga.name } : {}),
      },
    };
  }, [
    chosen,
    loading,
    error,
    mode,
    version,
    state,
    destination,
    line1,
    city,
    lgaId,
    lga,
  ]);
  useEffect(() => {
    onChange(selection);
  }, [selection, onChange]);
  const selectClass = "flex flex-col gap-1.5 text-sm";
  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex gap-5">
        <legend className="mb-2 text-sm">Receive your order</legend>
        {(["delivery", "pickup"] as const).map((value) => (
          <label key={value} className="flex gap-2">
            <input
              type="radio"
              name="shipping-mode"
              checked={mode === value}
              onChange={() => {
                setMode(value);
                setMethodId("");
                setDestinationId("");
                setLgaId("");
                onChange(null);
              }}
            />
            {value === "pickup" ? "Store pickup" : "Delivery"}
          </label>
        ))}
      </fieldset>
      {mode === "delivery" && (
        <>
          <ShippingSelect
            id="shipping-state"
            label="State"
            placeholder="Choose a state"
            value={stateId}
            options={states}
            onChange={(value) => {
              setStateId(value);
              setLgaId("");
              setDestinationId("");
              setMethodId("");
              onChange(null);
            }}
          />
          {stateId && (
            <ShippingSelect
              id="shipping-lga"
              label="LGA (optional for named local areas)"
              placeholder="Select an LGA if applicable"
              value={lgaId}
              options={lgas}
              onChange={(value) => {
                setLgaId(value);
                setDestinationId("");
                setMethodId("");
                onChange(null);
              }}
            />
          )}
          {stateId && (
            <ShippingSelect
              id="shipping-destination"
              label="Delivery area"
              placeholder="Choose your exact area"
              value={destinationId}
              options={destinations.filter(
                (value) => !lgaId || !value.lgaId || value.lgaId === lgaId,
              )}
              onChange={(value) => {
                const next = destinations.find((item) => item.id === value);
                setDestinationId(value);
                if (next?.lgaId) setLgaId(next.lgaId);
                setMethodId("");
                onChange(null);
              }}
            />
          )}
          <label className={selectClass}>
            Street address
            <input
              className={inputClass}
              value={line1}
              maxLength={255}
              autoComplete="street-address"
              onChange={(event) => setLine1(event.target.value)}
            />
          </label>
          <label className={selectClass}>
            City
            <input
              className={inputClass}
              value={city}
              maxLength={100}
              autoComplete="address-level2"
              onChange={(event) => setCity(event.target.value)}
            />
          </label>
        </>
      )}
      {mode === "pickup" && settings && (
        <p className="rounded-lg border p-4 text-sm">
          {settings.policy.pickup.address}
          <br />
          {settings.policy.pickup.phone}
        </p>
      )}
      {loading && <p role="status">Loading delivery options…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading &&
        !error &&
        (mode === "pickup" || destinationId) &&
        options.length === 0 && (
          <p>
            Delivery is unavailable here.{" "}
            <a className="underline" href={brandContact.whatsapp}>
              Contact the store for a quote
            </a>{" "}
            or choose pickup.
          </p>
        )}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm">Available methods</legend>
        {options.map((option) => (
          <label
            key={option.methodId}
            className="flex gap-3 rounded-xl border p-4"
          >
            <input
              type="radio"
              name="delivery-method"
              checked={methodId === option.methodId}
              onChange={() => setMethodId(option.methodId)}
            />
            <span className="flex-1">
              {option.method}
              <small className="block text-muted-foreground">
                {option.estimate}
              </small>
            </span>
            <span>
              ₦
              {cartNaira(option.feeKobo).toLocaleString("en-NG", {
                minimumFractionDigits: 2,
              })}
            </span>
          </label>
        ))}
      </fieldset>
      <button
        type="button"
        className="store-text-link self-start"
        onClick={() => {
          onChange(null);
          setRevision((value) => value + 1);
        }}
      >
        Refresh delivery options
      </button>
    </div>
  );
}

function ShippingSelect({
  id,
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  options: Place[];
  onChange: (value: string) => void;
}) {
  const items = [
    { value: "", label: placeholder },
    ...options.map((option) => ({ value: option.id, label: option.name })),
  ];
  return (
    <div className="grid gap-2 text-sm">
      <Label htmlFor={id}>{label}</Label>
      <Select
        items={items}
        value={value}
        onValueChange={(next) => onChange(next ?? "")}
      >
        <SelectTrigger id={id} className="h-11 min-h-11 w-full text-base">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          className="store-select-popup"
          align="start"
        >
          {items.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
