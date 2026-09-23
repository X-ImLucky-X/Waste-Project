import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Battery,
  Zap,
  Clock,
  ShieldAlert,
  Sparkles,
  Check,
  Monitor,
  Layers,
  Tag
} from 'lucide-react';
import type { DeviceIntakePayload } from '../../services/api';

interface DeviceIntakeFormProps {
  onSubmit: (payload: DeviceIntakePayload) => void;
  isLoading: boolean;
}

interface SpecimenPreset {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  category: string;
  brand: string;
  model: string;
  screenSize: number;
  age: number;
  power: string;
  battery: string;
  cosmetic: string;
  faults: string[];
}

const SPECIMEN_PRESETS: SpecimenPreset[] = [
  {
    id: 'thinkpad',
    badge: '14.0" Fleet',
    title: 'Lenovo ThinkPad T14',
    subtitle: '14.0" Corporate Enterprise Fleet',
    category: 'Laptop',
    brand: 'Lenovo',
    model: 'ThinkPad T14 Gen 2',
    screenSize: 14.0,
    age: 3.0,
    power: 'partially_working',
    battery: 'degraded',
    cosmetic: 'good',
    faults: ['Missing Keys / Stiff Trackpad', 'Degraded cells']
  },
  {
    id: 'acer_nitro',
    badge: '15.6" Standard',
    title: 'Acer Nitro Gaming',
    subtitle: '15.6" Reference Gaming Rig',
    category: 'Laptop',
    brand: 'Acer',
    model: 'Nitro 5 AN515',
    screenSize: 15.6,
    age: 5.0,
    power: 'does_not_turn_on',
    battery: 'degraded',
    cosmetic: 'moderate',
    faults: ['Thermal throttling history', 'Dead motherboard VRM']
  },
  {
    id: 'macbook_air',
    badge: '13.3" Ultrabook',
    title: 'Apple MacBook Air',
    subtitle: '13.3" Compact Aluminum Unibody',
    category: 'Laptop',
    brand: 'Apple',
    model: 'MacBook Air Retina',
    screenSize: 13.3,
    age: 4.0,
    power: 'does_not_turn_on',
    battery: 'swollen',
    cosmetic: 'moderate',
    faults: ['Degraded cells', 'Faulty DC-In Port']
  },
  {
    id: 'precision_workstation',
    badge: '17.3" Heavy Workstation',
    title: 'Dell Precision 7760',
    subtitle: '17.3" High-Mass Mobile Workstation',
    category: 'Laptop',
    brand: 'Dell',
    model: 'Precision 7760 Workstation',
    screenSize: 17.3,
    age: 6.0,
    power: 'partially_working',
    battery: 'degraded',
    cosmetic: 'damaged',
    faults: ['Cracked Display Glass', 'Thermal throttling history']
  }
];

export const DeviceIntakeForm: React.FC<DeviceIntakeFormProps> = ({ onSubmit, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = useState<{ dimensions: string; sizeMb: string } | null>(null);

  const [category, setCategory] = useState('Laptop');
  const [brand, setBrand] = useState('Lenovo');
  const [model, setModel] = useState('ThinkPad T14 Gen 2');
  const [screenSizeInch, setScreenSizeInch] = useState<number>(14.0);
  const [ageYears, setAgeYears] = useState<number>(3.0);
  const [powerState, setPowerState] = useState<string>('partially_working');
  const [batteryState, setBatteryState] = useState<string>('degraded');
  const [physicalCondition, setPhysicalCondition] = useState<string>('good');
  const [knownFaults, setKnownFaults] = useState<string[]>(['Missing Keys / Stiff Trackpad', 'Degraded cells']);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10 MB limit.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageMetadata({
        dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`,
        sizeMb: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      });
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageMetadata(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleFault = (fault: string) => {
    if (knownFaults.includes(fault)) {
      setKnownFaults(knownFaults.filter((f) => f !== fault));
    } else {
      setKnownFaults([...knownFaults, fault]);
    }
  };

  const applyPreset = (preset: SpecimenPreset) => {
    setCategory(preset.category);
    setBrand(preset.brand);
    setModel(preset.model);
    setScreenSizeInch(preset.screenSize);
    setAgeYears(preset.age);
    setPowerState(preset.power);
    setBatteryState(preset.battery);
    setPhysicalCondition(preset.cosmetic);
    setKnownFaults([...preset.faults]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      file: selectedFile,
      category,
      brand,
      model,
      screen_size_inch: screenSizeInch,
      age_years: ageYears,
      power_state: powerState,
      battery_state: batteryState,
      physical_condition: physicalCondition,
      known_faults: knownFaults,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Banner with Quick Sample Presets (Neo-Brutalist Tri-Color Card) */}
      <div className="tri-card p-5 space-y-4 bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-100 border-2 border-red-500 flex items-center justify-center text-red-600 shrink-0 shadow-[1px_1px_0px_0px_#000000]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-black">Hardware Specimen Evaluation Profiles</h4>
              <p className="text-sm text-zinc-600 font-medium">Select a calibrated hardware profile or configure your custom device parameters below.</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 border-2 border-red-500 text-xs font-black uppercase tracking-wider">
            Live Dynamic Sizing
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SPECIMEN_PRESETS.map((p) => {
            const isCurrent = brand === p.brand && screenSizeInch === p.screenSize;
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => applyPreset(p)}
                className={`p-3.5 rounded-xl text-left border-2 transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-red-50 border-red-500 shadow-[2px_2px_0px_0px_#dc2626]'
                    : 'bg-zinc-50 border-black hover:border-red-600 hover:bg-white shadow-[1px_1px_0px_0px_#000000]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full border ${
                    isCurrent ? 'bg-red-600 text-white border-black' : 'bg-white text-zinc-800 border-black'
                  }`}>
                    {p.badge}
                  </span>
                  {isCurrent && <Check className="h-4 w-4 text-red-600" />}
                </div>
                <div className="text-sm font-black text-black">{p.title}</div>
                <div className="text-xs text-zinc-600 font-medium mt-0.5 line-clamp-1">{p.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Image Intake Card */}
        <div className="lg:col-span-5 tri-card p-6 space-y-4 bg-white">
          <div className="border-b-2 border-black pb-3">
            <h3 className="text-base font-black text-black flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-red-600" />
              <span>Specimen Visual Intake (FR-01)</span>
            </h3>
            <p className="text-sm text-zinc-600 font-medium mt-0.5">Upload discarded hardware photograph for inspection.</p>
          </div>

          {!previewUrl ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-black hover:border-red-600 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-zinc-50 hover:bg-red-50/40 group min-h-[260px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />
              <div className="h-16 w-16 rounded-2xl bg-white border-2 border-black flex items-center justify-center mb-3 shadow-[2px_2px_0px_0px_#000000] group-hover:scale-105 transition-transform text-black group-hover:text-red-600">
                <UploadCloud className="h-8 w-8" />
              </div>
              <p className="text-base font-black text-black">Click or drag & drop specimen image</p>
              <p className="text-sm text-zinc-600 font-medium mt-1">Supports JPG, PNG, WebP (Max 10 MB)</p>
              <span className="mt-3 px-3 py-1 rounded-full bg-white text-xs font-bold text-black border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                Laptop exterior, motherboard, or casing
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border-2 border-black bg-zinc-100 shadow-[2px_2px_0px_0px_#000000]">
                <img
                  src={previewUrl}
                  alt="Specimen preview"
                  className="w-full h-56 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black text-white hover:bg-red-600 border-2 border-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {imageMetadata && (
                <div className="px-3.5 py-2.5 bg-zinc-50 rounded-xl flex items-center justify-between text-sm text-black font-mono border-2 border-black font-bold">
                  <span>{imageMetadata.dimensions}</span>
                  <span>{imageMetadata.sizeMb}</span>
                </div>
              )}
            </div>
          )}

          <div className="p-4 rounded-xl bg-zinc-50 border-2 border-black text-sm text-zinc-700 space-y-1.5 font-medium">
            <div className="font-black text-black flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <span>AI Integrity Assurance</span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 font-medium">
              Surface wear heuristics analyze casing condition without hallucinating internal circuitry. Subassembly mass and recovery metrics scale according to the selected form factor.
            </p>
          </div>
        </div>

        {/* Right: Operational Details & Form Factor Card */}
        <div className="lg:col-span-7 tri-card p-6 space-y-6 bg-white">
          <div className="border-b-2 border-black pb-3">
            <h3 className="text-base font-black text-black flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-600" />
              <span>Operational State & Hardware Specification</span>
            </h3>
            <p className="text-sm text-zinc-600 font-medium mt-0.5">Specify form factor and hardware parameters to dynamically model disassembly.</p>
          </div>

          {/* Form Factor / Screen Size Selection */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <label className="text-black font-black uppercase tracking-wider flex items-center gap-2">
                <Monitor className="h-4 w-4 text-red-600" />
                <span>FORM FACTOR & SCREEN SIZE</span>
              </label>
              <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 font-black text-sm border-2 border-red-500 shadow-[1px_1px_0px_0px_#dc2626]">
                {screenSizeInch}" Class
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { size: 13.3, label: '13.3" Ultrabook', sub: 'Sub-1.3kg Class' },
                { size: 14.0, label: '14.0" Business', sub: 'Thin & Light' },
                { size: 15.6, label: '15.6" Standard', sub: 'Mainstream' },
                { size: 17.3, label: '17.3" Heavy', sub: 'Workstation / Gaming' },
              ].map((item) => {
                const active = screenSizeInch === item.size;
                return (
                  <button
                    type="button"
                    key={item.size}
                    onClick={() => setScreenSizeInch(item.size)}
                    className={`p-3 rounded-xl text-left border-2 transition-all cursor-pointer ${
                      active
                        ? 'bg-red-50 border-red-500 text-red-600 font-black shadow-[2px_2px_0px_0px_#dc2626]'
                        : 'bg-white border-black text-black shadow-[1px_1px_0px_0px_#000000] hover:border-red-600'
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center justify-between">
                      <span>{item.label}</span>
                      {active && <Check className="h-3.5 w-3.5 text-red-600 shrink-0" />}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-medium mt-0.5">{item.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manufacturer & Model Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-zinc-700" />
                <span>MANUFACTURER / BRAND</span>
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-black bg-white text-black text-sm font-bold shadow-[2px_2px_0px_0px_#000000] focus:outline-none focus:border-red-600 cursor-pointer"
              >
                {['Lenovo', 'Dell', 'HP', 'Apple', 'Acer', 'Asus', 'Universal / Other'].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-zinc-700" />
                <span>MODEL IDENTIFIER</span>
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. ThinkPad T14, MacBook Air"
                className="w-full p-3 rounded-xl border-2 border-black bg-white text-black text-sm font-bold shadow-[2px_2px_0px_0px_#000000] focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* Age Slider */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <label className="text-black font-black uppercase tracking-wider flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-700" />
                <span>DEVICE LIFECYCLE / AGE</span>
              </label>
              <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 font-black text-sm border-2 border-red-500 shadow-[1px_1px_0px_0px_#dc2626]">
                {ageYears} {ageYears === 1 ? 'Year' : 'Years'}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={ageYears}
              onChange={(e) => setAgeYears(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-xs text-zinc-600 font-bold">
              <span>0.5 Yrs (Recent)</span>
              <span>5.0 Yrs (Average Deprec.)</span>
              <span>15 Yrs (Legacy)</span>
            </div>
          </div>

          {/* Power State Selection */}
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-black text-black uppercase tracking-wider block">
              POWER / BOOT STATUS
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'fully_working', label: 'Fully Working', desc: 'Boots cleanly to OS' },
                { id: 'partially_working', label: 'Partially Working', desc: 'POSTs / Intermittent' },
                { id: 'does_not_turn_on', label: 'Does Not Turn On', desc: 'No power / dead VRM' },
              ].map((item) => {
                const active = powerState === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setPowerState(item.id)}
                    className={`p-3.5 rounded-xl text-left border-2 transition-all text-sm cursor-pointer ${
                      active
                        ? 'bg-red-50 border-red-500 text-red-600 font-black shadow-[2px_2px_0px_0px_#dc2626]'
                        : 'bg-white border-black text-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{item.label}</span>
                      {active && <Check className="h-4 w-4 text-red-600" />}
                    </div>
                    <div className="text-xs text-zinc-600 font-medium mt-1">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Battery Condition */}
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-black text-black uppercase tracking-wider flex items-center gap-1.5">
              <Battery className="h-4 w-4 text-red-600" />
              <span>BATTERY CHEMICAL INTEGRITY</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'good', label: 'Good State' },
                { id: 'degraded', label: 'Degraded' },
                { id: 'swollen', label: 'Swollen ⚠️' },
                { id: 'unknown', label: 'Unknown' },
              ].map((item) => {
                const active = batteryState === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setBatteryState(item.id)}
                    className={`py-2.5 px-3 rounded-xl text-center text-sm font-bold border-2 transition-all cursor-pointer ${
                      active
                        ? item.id === 'swollen'
                          ? 'bg-red-600 text-white border-black shadow-[2px_2px_0px_0px_#000000]'
                          : 'bg-red-50 text-red-600 border-red-500 shadow-[2px_2px_0px_0px_#dc2626]'
                        : 'bg-white border-black text-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[-1px]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cosmetic Condition */}
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-black text-black uppercase tracking-wider block">
              COSMETIC & CHASSIS CONDITION
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'good', label: 'Good', desc: 'No cracks or dents' },
                { id: 'moderate', label: 'Moderate', desc: 'Typical scuffs/scratches' },
                { id: 'damaged', label: 'Damaged', desc: 'Broken hinges/chassis' },
              ].map((item) => {
                const active = physicalCondition === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setPhysicalCondition(item.id)}
                    className={`p-3.5 rounded-xl text-left border-2 transition-all text-sm cursor-pointer ${
                      active
                        ? 'bg-red-50 border-red-500 text-red-600 font-black shadow-[2px_2px_0px_0px_#dc2626]'
                        : 'bg-white border-black text-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{item.label}</span>
                      {active && <Check className="h-4 w-4 text-red-600" />}
                    </div>
                    <div className="text-xs text-zinc-600 font-medium mt-1">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Known Observed Faults */}
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-black text-black uppercase tracking-wider block">
              REPORTED HARDWARE DEFECTS
            </label>
            <div className="flex flex-wrap gap-2.5">
              {[
                'Cracked Display Glass',
                'Liquid Spill Exposure',
                'Dead motherboard VRM',
                'Thermal throttling history',
                'Degraded cells',
                'Missing Keys / Stiff Trackpad',
                'Faulty DC-In Port',
              ].map((fault) => {
                const active = knownFaults.includes(fault);
                return (
                  <button
                    type="button"
                    key={fault}
                    onClick={() => toggleFault(fault)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
                      active
                        ? 'bg-red-600 text-white border-black shadow-[2px_2px_0px_0px_#000000]'
                        : 'bg-white text-black border-black shadow-[1px_1px_0px_0px_#000000] hover:border-red-600'
                    }`}
                  >
                    {active ? '✓ ' : '+ '} {fault}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full tri-btn-red py-4 px-6 text-base font-black flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Condition & Generating Material Passport...</span>
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  <span>Analyze Specimen & Generate Digital Material Passport</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
