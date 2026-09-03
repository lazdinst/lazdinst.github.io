import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignalMeter } from "@/app/components/SignalMeter";
import { useDebounce } from "@/hooks";
import {
  filterAssets,
  fleetRuntime,
  type Asset,
  type AssetDomain,
  type AssetSort,
} from "@/fleet";
import { cn } from "@/lib/utils";
import {
  AssetGlyph,
  FleetSelect,
  STATUS_LABEL,
  STATUS_TONE,
  TONE_DOT_CLASS,
  TONE_TEXT_CLASS,
  energyTone,
  linkTone,
} from "../../components";
import { useFleetSnapshot } from "../../hooks";

const DOMAINS: { id: AssetDomain; label: string }[] = [
  { id: "air", label: "AIR" },
  { id: "ground", label: "GND" },
  { id: "sea", label: "SEA" },
];

const SORTS: { id: AssetSort; label: string }[] = [
  { id: "severity", label: "severity" },
  { id: "callsign", label: "callsign" },
  { id: "energy", label: "energy" },
  { id: "service", label: "service due" },
];

export function AssetRoster() {
  const snapshot = useFleetSnapshot();
  const [query, setQuery] = useState("");
  const [domains, setDomains] = useState<AssetDomain[]>([]);
  const [sort, setSort] = useState<AssetSort>("severity");
  const debouncedQuery = useDebounce(query, 120);

  const visible = useMemo(
    () => filterAssets(snapshot.assets, debouncedQuery, { domains, statuses: [] }, sort),
    [snapshot.assets, debouncedQuery, domains, sort]
  );

  const toggleDomain = (domain: AssetDomain) => {
    setDomains((current) =>
      current.includes(domain) ? current.filter((d) => d !== domain) : [...current, domain]
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-1.5 size-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="callsign, kind, status:fault, tag:isr"
          aria-label="Search assets"
          className="h-6 pl-6 font-mono text-xs"
        />
        {query ? (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Clear search"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            onClick={() => setQuery("")}
          >
            <X />
          </Button>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-0.5">
          {DOMAINS.map((domain) => {
            const active = domains.includes(domain.id);
            return (
              <Button
                key={domain.id}
                variant={active ? "secondary" : "outline"}
                size="xs"
                aria-pressed={active}
                className="h-4 px-1 font-mono text-[10px]"
                onClick={() => toggleDomain(domain.id)}
              >
                {domain.label}
              </Button>
            );
          })}
        </div>
        <div className="flex items-center gap-1">
          <label className="sr-only" htmlFor="asset-sort">
            Sort assets
          </label>
          <FleetSelect
            id="asset-sort"
            value={sort}
            className="h-4 text-[10px] text-muted-foreground"
            onChange={(event) => setSort(event.target.value as AssetSort)}
          >
            {SORTS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </FleetSelect>
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
            {visible.length}/{snapshot.assets.length}
          </span>
        </div>
      </div>
      {visible.length === 0 ? (
        <p className="px-1 py-2 text-xs text-muted-foreground">No assets match.</p>
      ) : (
        <ul className="flex flex-col gap-px" aria-label="Assets">
          {visible.map((asset) => (
            <AssetRow
              key={asset.id}
              asset={asset}
              selected={asset.id === snapshot.selectedAssetId}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function AssetRow({ asset, selected }: { asset: Asset; selected: boolean }) {
  const tone = STATUS_TONE[asset.status];
  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        className={cn(
          "flex w-full flex-col gap-1 rounded-sm px-1 py-1 text-left text-xs transition-colors",
          selected ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"
        )}
        onClick={() => fleetRuntime.selectAsset(asset.id)}
      >
        <div className="flex w-full items-center gap-1.5">
          <span className={cn("size-1.5 shrink-0 rounded-full", TONE_DOT_CLASS[tone], (asset.status === "en_route" || asset.status === "patrolling" || asset.status === "returning") && "hud-live")} />
          <AssetGlyph kind={asset.kind} className={cn(selected ? "text-foreground" : "text-muted-foreground")} />
          <span className="min-w-0 flex-1 truncate font-mono text-foreground">
            {asset.callsign}
          </span>
          <span className={cn("shrink-0 font-mono text-[10px] tracking-wide", TONE_TEXT_CLASS[tone])}>
            {STATUS_LABEL[asset.status]}
          </span>
        </div>
        <div className="flex w-full items-center gap-2 pl-3">
          <SignalMeter
            value={asset.energyPct / 100}
            tone={energyTone(asset.energyPct)}
            className="flex-1"
          />
          <span className="w-7 shrink-0 text-right font-mono text-[10px] tabular-nums">
            {asset.energyPct.toFixed(0)}%
          </span>
          <LinkDots quality={asset.link.quality} />
        </div>
      </button>
    </li>
  );
}

function LinkDots({ quality }: { quality: number }) {
  const bars = quality <= 0 ? 0 : quality < 0.35 ? 1 : quality < 0.7 ? 2 : 3;
  const tone = linkTone(quality);
  return (
    <span className="flex shrink-0 items-end gap-px" aria-label={`Link quality ${(quality * 100).toFixed(0)}%`}>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={cn(
            "w-0.5 rounded-sm",
            index === 0 ? "h-1" : index === 1 ? "h-1.5" : "h-2",
            index < bars
              ? tone === "alert"
                ? "bg-destructive"
                : tone === "warn"
                  ? "bg-warning"
                  : "bg-success"
              : "bg-muted"
          )}
        />
      ))}
    </span>
  );
}
